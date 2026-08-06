const clasificarProductos = require("./engine/clasificarProductos");

(async () => {

    try {

        await clasificarProductos();

        process.exit(0);

    } catch (err) {

        console.error(err);

        process.exit(1);

    }

})();