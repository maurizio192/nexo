async function comprobarStock(pool) {
    const result = await pool.query(
        "SELECT COUNT(*) FROM productos"
    );

    console.log("📦 Productos:", result.rows[0].count);
}

module.exports = {
    comprobarStock,
};