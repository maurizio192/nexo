export default function HeaderSancho() {

    const hora = new Date().getHours();

    let saludo = "Buenas noches";

    if (hora >= 6 && hora < 12) saludo = "Buenos días";
    else if (hora >= 12 && hora < 20) saludo = "Buenas tardes";

    return (

        <div
            style={{
                background: "#1f2937",
                color: "white",
                borderRadius: 16,
                padding: 24,
                marginBottom: 20
            }}
        >

            <h1 style={{ margin: 0, fontSize: 34 }}>
                🧠 SANCHO
            </h1>

            <p
                style={{
                    marginTop: 10,
                    fontSize: 18,
                    opacity: 0.9
                }}
            >
                {saludo}, Maurizio.
            </p>

        </div>

    );

}