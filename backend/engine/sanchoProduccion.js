module.exports = function (tareas) {

    const tapas = tareas.filter(t => t.categoria === "TAPA");

    const elaboraciones = tareas.filter(
        t => t.categoria === "ELABORACION"
    );

    let texto = "";

    texto += "Buenos días Maurizio.\n\n";

    texto += "Empezamos la producción.\n\n";

    if (tapas.length > 0) {

        texto += "Hoy hay que preparar las siguientes tapas:\n";

        tapas.forEach(t => {

            texto += `• ${t.nombre}\n`;

        });

    }

    if (elaboraciones.length > 0) {

        texto += "\nAdemás tendremos que reponer:\n";

        elaboraciones.forEach(t => {

            texto += `• ${t.nombre}\n`;

        });

    }

    if (
        tapas.length === 0 &&
        elaboraciones.length === 0
    ) {

        texto =
            "La producción está terminada.\nTodo está preparado para el servicio.";

    }

    return texto;

};