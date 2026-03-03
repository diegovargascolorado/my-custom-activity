const path = require("path");
const fs = require("fs");
const express = require("express");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, "public")));

/* =========================
   HEALTH CHECK (MUY IMPORTANTE)
========================= */
app.get("/", (req, res) => {
  return res.status(200).send("OK - my-custom-activity is running");
});

/* =========================
   CONFIG.JSON
========================= */
app.get("/config.json", (req, res) => {
  try {
    const cfgPath = path.join(__dirname, "config", "config.json");

    if (!fs.existsSync(cfgPath)) {
      // Esto te explica el error en pantalla
      return res
        .status(404)
        .send(`config.json NOT FOUND at: ${cfgPath}`);
    }

    return res.sendFile(cfgPath);
  } catch (e) {
    return res.status(500).send(`ERROR serving config.json: ${e.message}`);
  }
});

/* =========================
   LIFECYCLE ENDPOINTS
========================= */
app.post("/save", (req, res) => res.status(200).json({ success: true }));
app.post("/validate", (req, res) => res.status(200).json({ success: true }));
app.post("/publish", (req, res) => res.status(200).json({ success: true }));
app.post("/stop", (req, res) => res.status(200).json({ success: true }));

/* =========================
   EXECUTE
========================= */
app.post("/execute", async (req, res) => {
  try {
    console.log("🔥 /execute desde SFMC");
    console.log(JSON.stringify(req.body || {}, null, 2));

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

/* =========================
   404 HANDLER (PARA VER QUÉ ESTÁ FALLANDO)
========================= */
app.use((req, res) => {
  return res.status(404).send(`Not Found: ${req.method} ${req.originalUrl}`);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Running on port ${PORT}`));

