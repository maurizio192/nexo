import { useEffect, useState } from "react";

function Tarjeta({ titulo, valor, color }) {
    return (
        <div
            style={{
                background: "#ffffff",
                borderLeft: `8px solid ${color}`,
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 3px 10px rgba(0,0,0,.15)"
            }}
        >
            <div
                style={{
                    color: "#666",
                    fontSize: "14px"
                }}
            >
                {titulo}
            </div>

            <div
                style={{
                    fontSize: "42px",
                    fontWeight: "bold",
                    marginTop: "10px"
                }}
            >
                {valor}
            </div>
        </div>
    );
}

export default function Sancho() {

    const [avisos, setAvisos] = useState([]);
    const [recomendaciones, setRecomendaciones] = useState([]);

    const [resumen, setResumen] = useState({
        stockCritico: 0,
        compras: 0,
        producciones: 0
    });

    const [saludo, setSaludo] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {

        async function cargar() {

            try {

                const res = await fetch("http://localhost:3001/sancho");
                const data = await res.json();

                setAvisos(data.avisos || []);
                setResumen(data.resumen || {});
                setSaludo(data.saludo || "");
                setRecomendaciones(data.recomendaciones || []);

            } catch (err) {

                console.error(err);
                setError("No se puede conectar con SANCHO");

            }

        }

        cargar();

    }, []);

    return (

        <div
            style={{
                padding: "30px",
                background: "#f5f6fa",
                minHeight: "100vh"
            }}
        >

            <h1>🧠 SANCHO</h1>

            <h3
                style={{
                    color: "#666",
                    fontWeight: "normal"
                }}
            >
                {saludo}
            </h3>

            {error && (

                <div
                    style={{
                        background: "#ffe5e5",
                        color: "#900",
                        padding: "15px",
                        borderRadius: "10px",
                        marginBottom: "20px"
                    }}
                >
                    {error}
                </div>

            )}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3,1fr)",
                    gap: "20px",
                    marginBottom: "30px"
                }}
            >

                <Tarjeta
                    titulo="🔴 Stock crítico"
                    valor={resumen.stockCritico}
                    color="red"
                />

                <Tarjeta
                    titulo="🛒 Compras"
                    valor={resumen.compras}
                    color="orange"
                />

                <Tarjeta
                    titulo="👨‍🍳 Producciones"
                    valor={resumen.producciones}
                    color="green"
                />

            </div>

            {recomendaciones.length > 0 && (

                <div
                    style={{
                        background: "#eef5ff",
                        borderLeft: "8px solid #2d7ff9",
                        borderRadius: "12px",
                        padding: "20px",
                        marginBottom: "30px",
                        boxShadow: "0 3px 10px rgba(0,0,0,.15)"
                    }}
                >

                    <h2 style={{ marginTop: 0 }}>
                        🧠 Recomendaciones de Sancho
                    </h2>

                    {recomendaciones.map((r, i) => (

                        <div
                            key={i}
                            style={{
                                marginTop: "12px",
                                fontSize: "18px"
                            }}
                        >
                            {r}
                        </div>

                    ))}

                </div>

            )}

            {avisos.length === 0 ? (

                <div
                    style={{
                        background: "#e8ffe8",
                        padding: "20px",
                        borderRadius: "12px"
                    }}
                >
                    ✅ Todo está bajo control
                </div>

            ) : (

                avisos.map((a, i) => (

                    <div
                        key={i}
                        style={{
                            background: "#fff",
                            borderLeft:
                                a.tipo === "stock"
                                    ? "8px solid red"
                                    : a.tipo === "compra"
                                    ? "8px solid orange"
                                    : "8px solid green",
                            borderRadius: "12px",
                            padding: "20px",
                            marginBottom: "15px",
                            boxShadow: "0 2px 8px rgba(0,0,0,.12)"
                        }}
                    >

                        <h3 style={{ marginTop: 0 }}>

                            {a.tipo === "stock"
                                ? "🔴 Stock crítico"
                                : a.tipo === "compra"
                                ? "🛒 Compra sugerida"
                                : "👨‍🍳 Producción"}

                        </h3>

                        <div
                            style={{
                                fontSize: "20px"
                            }}
                        >
                            {a.mensaje}
                        </div>

                    </div>

                ))

            )}

        </div>

    );

}