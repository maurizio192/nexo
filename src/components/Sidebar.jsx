import { Link } from "react-router-dom";

export default function Sidebar() {

    const menu = [

        { icon: "🧠", text: "Sancho", to: "/sancho" },

        { icon: "📦", text: "Productos", to: "/productos" },

        { icon: "📖", text: "Elaboraciones", to: "/elaboraciones" },

        { icon: "👨‍🍳", text: "Producciones", to: "/producciones" },

        { icon: "📊", text: "Stock", to: "/stock" },

        { icon: "🚚", text: "Proveedores", to: "/proveedores" },

        { icon: "📈", text: "Estadísticas", to: "/estadisticas" }

    ];

    return (

        <div
            style={{

                width: 250,

                height: "100vh",

                background: "#1f2937",

                color: "white",

                display: "flex",

                flexDirection: "column"

            }}
        >

            <div
                style={{

                    padding: 25,

                    fontSize: 30,

                    fontWeight: "bold",

                    borderBottom: "1px solid #374151"

                }}
            >
                NEXO
            </div>

            <div style={{ padding: 15 }}>

                {menu.map(item => (

                    <Link
                        key={item.to}
                        to={item.to}
                        style={{

                            display: "flex",

                            alignItems: "center",

                            gap: 12,

                            padding: 14,

                            marginBottom: 8,

                            color: "white",

                            textDecoration: "none",

                            borderRadius: 10

                        }}
                    >

                        <span style={{ fontSize: 22 }}>
                            {item.icon}
                        </span>

                        {item.text}

                    </Link>

                ))}

            </div>

        </div>

    );

}