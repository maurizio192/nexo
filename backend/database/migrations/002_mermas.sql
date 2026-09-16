/*
|--------------------------------------------------------------------------
| NEXO - MODULO MERME (merma real)
|--------------------------------------------------------------------------
| Rilevazioni reali di merma misurate in cucina.
|
| Ejemplo real:
|   "He trabajado 3 kg de tomates, he quitado 95 g de merma,
|    trabajado mondatura."
|
| IMPORTANTE:
|   - Esta tabla esta COMPLETAMENTE SEPARADA de receta_ingredientes.merma,
|     que sigue siendo la merma TEORICA (porcentaje de receta) y NO se toca.
|   - Ninguna rilevazione se borra fisicamente: para corregirla se ANULA
|     con estado = 'anulada' y permanece en el historial.
|   - Las rilevazioni anuladas se excluyen de las estadisticas.
|   - Las estadisticas usan media PONDERADA:
|       SUM(cantidad_merma) / SUM(cantidad_lavorada) * 100
|     nunca la media simple de porcentajes.
|
| Nota: no existe un runner de migrations en NEXO. Este archivo se aplica
| manualmente con psql cuando el responsable lo autorice.
*/

CREATE TABLE IF NOT EXISTS mermas (
  id                      SERIAL PRIMARY KEY,

  producto_id             INTEGER NOT NULL REFERENCES productos(id),
  lavorazione             VARCHAR(100) NOT NULL,     -- texto libre (ej. 'mondatura')

  cantidad_lavorada       NUMERIC(12,3) NOT NULL,    -- cantidad trabajada
  unidad                  VARCHAR(20)  NOT NULL,     -- unidad de la lavorazione

  cantidad_merma          NUMERIC(12,3) NOT NULL DEFAULT 0,  -- convertida a 'unidad'
  cantidad_merma_original NUMERIC(12,3),             -- tal como se introdujo
  unidad_merma_original   VARCHAR(20),               -- ej. 'g' cuando se trabaja en kg

  cantidad_neta           NUMERIC(12,3)
    GENERATED ALWAYS AS (cantidad_lavorada - cantidad_merma) STORED,

  porcentaje_merma        NUMERIC(7,3)
    GENERATED ALWAYS AS (
      CASE
        WHEN cantidad_lavorada > 0
        THEN cantidad_merma / cantidad_lavorada * 100
      END
    ) STORED,

  fecha                   TIMESTAMP NOT NULL DEFAULT now(),
  responsable             VARCHAR(100) NOT NULL DEFAULT 'Sistema',

  estado                  VARCHAR(20) NOT NULL DEFAULT 'registrada',
  observaciones           TEXT,

  fecha_anulacion         TIMESTAMP,
  anulado_por             VARCHAR(100),
  motivo_anulacion        TEXT,

  fecha_creacion          TIMESTAMP NOT NULL DEFAULT now(),

  CONSTRAINT mermas_estado_check
    CHECK (estado IN ('registrada','anulada')),

  CONSTRAINT mermas_valores_check
    CHECK (
      cantidad_lavorada > 0
      AND cantidad_merma >= 0
      AND cantidad_merma <= cantidad_lavorada
    )
);


/*
|--------------------------------------------------------------------------
| INDICES
|--------------------------------------------------------------------------
| Las estadisticas se agrupan por (producto_id + lavorazione) y el historial
| se consulta por producto, por fecha y por estado.
*/

CREATE INDEX IF NOT EXISTS mermas_producto_lavorazione_idx
  ON mermas (producto_id, lavorazione);

CREATE INDEX IF NOT EXISTS mermas_fecha_idx
  ON mermas (fecha);

CREATE INDEX IF NOT EXISTS mermas_estado_idx
  ON mermas (estado);


/*
|--------------------------------------------------------------------------
| VISTA DE ESTADISTICAS (MEDIA PONDERADA)
|--------------------------------------------------------------------------
| Acumulado por producto_id + lavorazione.
| Excluye las rilevazioni anuladas (estado = 'anulada') y NO las borra.
|
| Media ponderada de merma  = SUM(merma) / SUM(lavorado) * 100
| Media ponderada de resa   = SUM(neto)  / SUM(lavorado) * 100
*/

CREATE OR REPLACE VIEW mermas_estadisticas AS
SELECT
  m.producto_id,

  m.lavorazione,

  SUM(m.cantidad_lavorada) AS total_lavorado,

  SUM(m.cantidad_merma)    AS total_merma,

  SUM(m.cantidad_neta)     AS total_neto,

  ROUND(
    SUM(m.cantidad_merma) / NULLIF(SUM(m.cantidad_lavorada), 0) * 100,
    2
  ) AS porcentaje_merma_medio_ponderado,

  ROUND(
    SUM(m.cantidad_neta) / NULLIF(SUM(m.cantidad_lavorada), 0) * 100,
    2
  ) AS porcentaje_resa_medio_ponderado,

  COUNT(*) AS numero_rilevazioni

FROM mermas m

WHERE m.estado <> 'anulada'

GROUP BY m.producto_id, m.lavorazione;