const path = require("path");
const fs = require("fs");
const express = require("express");

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static (public/)
app.use(express.static(path.join(__dirname, "public")));

/* =========================================
   HEALTH CHECK
========================================= */
app.get("/", (req, res) => {
  return res.status(200).send("OK - my-custom-activity is running");
});

/* =========================================
   DIAGNOSTIC (para ver rutas y archivos)
========================================= */
app.get("/_debug", (req, res) => {
  const cfgPath = path.join(__dirname, "config", "config.json");
  const iconPath = path.join(__dirname, "public", "images", "icon_coomeva_v6.png");

  return res.status(200).json({
    cwd: process.cwd(),
    dirname: __dirname,
    exists: {
      config_json: fs.existsSync(cfgPath),
      icon_png: fs.existsSync(iconPath)
    },
    expected_paths: {
      config_json: cfgPath,
      icon_png: iconPath
    }
  });
});

/* =========================================
   CONFIG.JSON (SFMC lo consume)
========================================= */
app.get("/config.json", (req, res) => {
  const cfgPath = path.join(__dirname, "config", "config.json");

  if (!fs.existsSync(cfgPath)) {
    return res.status(404).send(`config.json NOT FOUND at: ${cfgPath}`);
  }

  return res.sendFile(cfgPath);
});

/* =========================================
   LIFECYCLE ENDPOINTS (Obligatorios)
========================================= */
app.post("/save", (req, res) => res.status(200).json({ success: true }));
app.post("/validate", (req, res) => res.status(200).json({ success: true }));
app.post("/publish", (req, res) => res.status(200).json({ success: true }));
app.post("/stop", (req, res) => res.status(200).json({ success: true }));

/* =========================================
   EXECUTE (Journey)
========================================= */
app.post("/execute", async (req, res) => {
  try {
    console.log("🔥 /execute desde SFMC");
    console.log(JSON.stringify(req.body || {}, null, 2));

    // Node 22 trae fetch nativo
    if (typeof globalThis.fetch !== "function") {
      throw new Error("fetch no está disponible (usa Node 18+).");
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
   404 handler (para ver rutas faltantes)
========================================= */
app.use((req, res) => {
  return res.status(404).send(`Not Found: ${req.method} ${req.originalUrl}`);
});

/* =========================================
   LISTEN (Render)
========================================= */
const PORT = process.env.PORT || 8080;

// IMPORTANTE: escuchar en 0.0.0.0
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
