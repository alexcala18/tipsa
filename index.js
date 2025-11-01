import express from "express";
import tipsaTracking from "./tipsa-service.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/tracking/:codigo", async (req, res) => {
  const codigo = req.params.codigo;
  try {
    const result = await tipsaTracking(codigo);
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`TIPSA API server running on port ${PORT}`);
});
