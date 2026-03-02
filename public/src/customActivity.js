define(['postmonger'], function(Postmonger) {
  'use strict';

  const connection = new Postmonger.Session();
  let activity = {};
  let callbacks = {};

  function init(cb) {
    callbacks = cb || {};
    connection.trigger('ready');             // JB responderá con initActivity
    connection.trigger('requestTokens');
    connection.trigger('requestEndpoints');

    connection.on('initActivity', onInit);
    connection.on('clickedNext', onClickedNext);
  }

  function onInit(data) {
    activity = data || {};
    const inArgs = activity?.arguments?.execute?.inArguments || [];
    const saved = Object.assign({}, ...inArgs);
    // ¡OJO! usar && (no &amp;&amp;)
    callbacks.setFields && callbacks.setFields(saved);
  }

  function onClickedNext() {
    // Banner de debug (temporal)
    try {
      const div = document.createElement('div');
      div.textContent = 'onClickedNext ejecutado';
      div.style = 'position:fixed;bottom:8px;right:8px;background:#e6ffed;color:#0366d6;padding:8px;border:1px solid #b3e6c1;border-radius:6px;font:12px system-ui;z-index:9999';
      document.body.appendChild(div);
    } catch (e) {}

    const fields = callbacks.getFields ? callbacks.getFields() : {};

    activity.arguments = activity.arguments || {};
    activity.arguments.execute = activity.arguments.execute || {};
    activity.arguments.execute.inArguments = [{ apiUrl: fields.apiUrl || '' }];

    activity.metaData = activity.metaData || {};
    activity.metaData.isConfigured = true;

    connection.trigger('updateActivity', activity);
  }

  return { init };
});
