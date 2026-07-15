export default function AvisoCard({ aviso }) {

    const colores = {
        critica: "#ef4444",
        media: "#f59e0b",
        normal: "#3b82f6"
    };

    return (

        <div
            style={{
                background: "white",
                borderLeft: `8px solid ${colores[aviso.prioridad] || "#999"}`,
                borderRadius: 12,
                padding: 18,
                marginBottom: 14,
                boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
            }}
        >

            <div
                style={{
                    fontSize: 20,
                    fontWeight: "bold"
                }}
            >
                {aviso.icono} {aviso.mensaje}
            </div>

        </div>

    );

}