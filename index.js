import express from "express";
import tipsaTracking from "./tipsa-service.js";
import cors from "cors";

const app = express();
app.use(cors()); // habilita CORS

const PORT = process.env.PORT || 3000;
console.log("PORT env:", process.env.PORT);

app.get("/tracking/:codigo", async (req, res) => {
  const codigo = req.params.codigo;
  console.log("Tracking request for:", codigo);
  try {
    const result = await tipsaTracking(codigo);
    console.log("Result:", result);
    res.json(result);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`TIPSA API server running on port ${PORT}`);
});
