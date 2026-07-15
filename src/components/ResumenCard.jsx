export default function ResumenCard({ icono, titulo, valor, color }) {

    return (

        <div
            style={{
                background: "white",
                borderLeft: `8px solid ${color}`,
                borderRadius: 12,
                padding: 20,
                boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                flex: 1,
                minWidth: 180
            }}
        >

            <div style={{ fontSize: 28 }}>
                {icono}
            </div>

            <div
                style={{
                    color: "#666",
                    marginTop: 10
                }}
            >
                {titulo}
            </div>

            <div
                style={{
                    fontSize: 30,
                    fontWeight: "bold",
                    marginTop: 8
                }}
            >
                {valor}
            </div>

        </div>

    );

}