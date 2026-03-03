const path = require('path');
const express = require('express');
const app = express();
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/config.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'config', 'config.json'));
});

app.post('/save',     (req, res) => res.sendStatus(200));
app.post('/validate', (req, res) => res.sendStatus(200));
app.post('/publish',  (req, res) => res.sendStatus(200));
app.post('/stop',     (req, res) => res.sendStatus(200));

// server.js (solo el handler de /execute)
app.post('/execute', async (req, res) => {
  try {
    // 1) Log para ver en Render que llegó la ejecución
    console.log("🔥 EXECUTE desde SFMC");
    console.log(JSON.stringify(req.body, null, 2));

    // 2) Preparar datos (lo que envía Marketing Cloud a tu actividad)
    const payloadFromMC = req.body || {};
    const inArgs = payloadFromMC.inArguments || [];
    const merged = Object.assign({}, ...inArgs); // Une inArguments [{...},{...}] -> {...}

    // 3) URL del receptor (webhook.site)
    const webhookUrl = "https://webhook.site/cc26c3bf-8246-468b-a384-cafcc34143ee";

    // 4) Reenviar al webhook (lo verás en tiempo real)
    const fResp = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        receivedFromSFMC: merged,        // lo que tú configuraste en inArguments (p.ej. apiUrl)
        originalMCpayload: payloadFromMC // payload completo que MC te envió
      })
    });

    // 5) Opcional: leer respuesta del receptor por debug
    const respText = await fResp.text();
    console.log("Webhook response:", fResp.status, respText);

    // 6) Responder 200 a SFMC (Success en el Journey)
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("ERROR /execute:", err);
    return res.status(500).json({ error: err.message });
  }
});


app.listen(8080);

