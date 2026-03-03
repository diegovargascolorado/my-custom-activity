const path = require("path");
const express = require("express");
const fetch = require("node-fetch"); // Asegura compatibilidad
const app = express();

/* =========================================
   CONFIGURACIÓN BÁSICA
========================================= */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (iconos, index.html, etc)
app.use(express.static(path.join(__dirname, "public")));

/* =========================================
   CONFIG.JSON (Requerido por SFMC)
========================================= */
app.get("/config.json", (req, res) => {
  res.sendFile(path.join(__dirname, "config", "config.json"));
});

/* =========================================
   LIFECYCLE ENDPOINTS (OBLIGATORIOS)
   Documentación oficial Salesforce
========================================= */

app.post("/save", (req, res) => {
  console.log("SAVE");
  return res.status(200).json({ success: true });
});

app.post("/validate", (req, res) => {
  console.log("VALIDATE");
  return res.status(200).json({ success: true });
});

app.post("/publish", (req, res) => {
  console.log("PUBLISH");
  return res.status(200).json({ success: true });
});

app.post("/stop", (req, res) => {
  console.log("STOP");
  return res.status(200).json({ success: true });
});

/* =========================================
   EXECUTE (CUANDO EL JOURNEY CORRE)
========================================= */

app.post("/execute", async (req, res) => {
  try {
    console.log("🔥 EXECUTE desde SFMC");
    console.log(JSON.stringify(req.body, null, 2));

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
    console.error("ERROR /execute:", err);
    return res.status(500).json({ error: err.message });
  }
});

/* =========================================
   PUERTO DINÁMICO (IMPORTANTE EN RENDER)
========================================= */

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
