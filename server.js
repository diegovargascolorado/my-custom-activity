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

app.post('/execute', async (req, res) => {
  console.log("🔥🔥 EXECUTE RECIBIDO DESDE SALESFORCE 🔥🔥");
  console.log(JSON.stringify(req.body, null, 2));

  return res.status(200).json({ ok: true });
});
``


app.listen(8080);
