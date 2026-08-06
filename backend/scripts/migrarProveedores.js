const pool = require("../config/database");

async function migrar() {
  try {
    const productos = await pool.query(`
      SELECT id, proveedor
      FROM productos
      WHERE proveedor IS NOT NULL
        AND proveedor <> ''
    `);

    for (const p of productos.rows) {

      const proveedor = await pool.query(
`
SELECT pr.id
FROM alias_proveedores ap
JOIN proveedores pr
ON pr.id = ap.proveedor_id
WHERE UPPER(ap.alias) = UPPER($1)
`,
[p.proveedor]
);

      if (proveedor.rows.length > 0) {

        await pool.query(
          `
          INSERT INTO productos_proveedores
          (producto_id, proveedor_id)
          VALUES ($1,$2)
          ON CONFLICT (producto_id)
          DO UPDATE SET proveedor_id = EXCLUDED.proveedor_id
          `,
          [
            p.id,
            proveedor.rows[0].id
          ]
        );

      } else {

        console.log(
          `⚠️ Proveedor no encontrado: ${p.proveedor}`
        );

      }
    }

    console.log("✅ Migración terminada");
    process.exit();

  } catch (err) {

    console.error(err);
    process.exit(1);

  }
}

migrar();

