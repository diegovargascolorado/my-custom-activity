const path = require("path");
const express = require("express");

const app = express();

/* =========================================
   MIDDLEWARES
========================================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (iconos, index.html, etc.)
app.use(express.static(path.join(__dirname, "public")));

/* =========================================
   CONFIG.JSON (Requerido por SFMC)
========================================= */
app.get("/config.json", (req, res) => {
  return res.sendFile(path.join(__dirname, "config", "config.json"));
});

/* =========================================
   LIFECYCLE ENDPOINTS (OBLIGATORIOS)
   save / validate / publish / stop
========================================= */
app.post("/save", (req, res) => {
  console.log("✅ /save", JSON.stringify(req.body || {}, null, 2));
  return res.status(200).json({ success: true });
});

app.post("/validate", (req, res) => {
  console.log("✅ /validate", JSON.stringify(req.body || {}, null, 2));
  return res.status(200).json({ success: true });
});

app.post("/publish", (req, res) => {
  console.log("✅ /publish", JSON.stringify(req.body || {}, null, 2));
  return res.status(200).json({ success: true });
});

app.post("/stop", (req, res) => {
  console.log("✅ /stop", JSON.stringify(req.body || {}, null, 2));
  return res.status(200).json({ success: true });
});

/* =========================================
   EXECUTE (CUANDO EL JOURNEY EJECUTA)
========================================= */
app.post("/execute", async (req, res) => {
  try {
    console.log("🔥 /execute desde SFMC");
    console.log(JSON.stringify(req.body || {}, null, 2));

    // Fetch nativo (Node 18+)
    if (typeof globalThis.fetch !== "function") {
      throw new Error("fetch no está disponible. Usa Node 18+ o instala node-fetch.");
    }

    const payloadFromMC = req.body || {};
    const inArgs = payloadFromMC.inArguments || [];
    const merged = Object.assign({}, ...inArgs);

    const webhookUrl = "https://webhook.site/cc26c3bf-8246-468b-a384-cafcc34143ee";

    const fResp = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        receivedFromSFMC: merged,
        originalMCpayload: payloadFromMC
      })
    });

    const respText = await fResp.text();
    console.log("Webhook response:", fResp.status, respText);

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("❌ ERROR /execute:", err);
    return res.status(500).json({ error: err.message });
  }
});

/* =========================================
   PUERTO (RENDER USA process.env.PORT)
========================================= */
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
