function onClickedNext() {
  // Indicador visual para debug (temporal)
  try {
    const div = document.createElement('div');
    div.textContent = 'onClickedNext ejecutado';
    div.style = 'position:fixed;bottom:8px;right:8px;background:#e6ffed;color:#0366d6;padding:8px;border:1px solid #b3e6c1;border-radius:6px;font:12px system-ui;z-index:9999';
    document.body.appendChild(div);
  } catch (e) {}

  const fields = callbacks.getFields ? callbacks.getFields() : {};
  activity.arguments = activity.arguments || {};
  activity.arguments.execute = activity.arguments.execute || {};
  activity.arguments.execute.inArguments = [
    { apiUrl: fields.apiUrl || "" }
  ];

  activity.metaData = activity.metaData || {};
  activity.metaData.isConfigured = true;

  // Log de apoyo (lo verás si abres la UI fuera de JB)
  console.log('UPDATE ACTIVITY PAYLOAD', activity);

  connection.trigger('updateActivity', activity);
}
