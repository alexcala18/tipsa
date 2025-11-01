import express from "express";
import tipsaTracking from "./tipsa-service.js";
import cors from "cors"; // <-- necesitamos cors

const app = express();
const PORT = process.env.PORT || 3000;

console.log("PORT env:", process.env.PORT);

// Permitir solicitudes desde cualquier origen (puedes restringirlo luego a Shopify si quieres)
app.use(cors());

// Endpoint de tracking
app.get("/tracking/:codigo", async (req, res) => {
  const codigo = req.params.codigo;
  try {
    const result = await tipsaTracking(codigo);
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`TIPSA API server running on port ${PORT}`);
});
