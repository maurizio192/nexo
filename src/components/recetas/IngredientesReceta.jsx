export default function IngredientesReceta({ ingredientes }) {
  

  console.log("INGREDIENTES:", ingredientes);

  return (
    <>
      <h2>🥕 Ingredientes</h2>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse"
        }}
      >
        <thead>
          <tr>
            <th align="left">Ingrediente</th>
            <th>Cantidad</th>
            <th>Unidad</th>
            <th>Descontar</th>
          </tr>
        </thead>

        <tbody>
          {ingredientes.map((i) => (
            <tr key={i.id}>
              <td>{i.ingrediente}</td>

              <td align="center">
                {i.cantidad ?? "-"}
              </td>

              <td align="center">
                {i.unidad}
              </td>

              <td align="center">
                {i.descontar ? "✅" : "📦"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}