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

function Sancho() {

    const [avisos, setAvisos] = useState([]);
    const [resumen, setResumen] = useState({});
    const [error, setError] = useState("");

    useEffect(() => {

        fetch("http://localhost:3001/sancho")
            .then(res => res.json())
            .then(data => {

                if (data.error) {
                    setError(data.error);
                    return;
                }

                setAvisos(data.avisos || []);
                setResumen(data.resumen || {});

            })
            .catch(err => {

                setError(err.message);

            });

    }, []);

    return (

        <div style={{ padding: "30px" }}>

            <h1>🧠 SANCHO</h1>

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
                    valor={resumen.stockCritico || 0}
                    color="red"
                />

                <Tarjeta
                    titulo="🛒 Compras"
                    valor={resumen.compras || 0}
                    color="orange"
                />

                <Tarjeta
                    titulo="👨‍🍳 Producciones"
                    valor={resumen.producciones || 0}
                    color="green"
                />

            </div>

            {avisos.length === 0 ? (

                <div
                    style={{
                        background: "#e8ffe8",
                        padding: "20px",
                        borderRadius: "12px",
                        fontSize: "20px"
                    }}
                >
                    ✅ Todo está bajo control
                </div>

            ) : (

                avisos.map((a, i) => (

                    <div
                        key={i}
                        style={{
                            background: "#ffffff",

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

                        <h3
                            style={{
                                marginTop: 0
                            }}
                        >
                            {
                                a.tipo === "stock"
                                    ? "🔴 Stock crítico"
                                    : a.tipo === "compra"
                                    ? "🛒 Compra sugerida"
                                    : "👨‍🍳 Producción"
                            }
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

export default Sancho;