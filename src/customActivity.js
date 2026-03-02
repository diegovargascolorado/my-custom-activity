define(['postmonger'], function(Postmonger) {
  'use strict';

  const connection = new Postmonger.Session();
  let activity = {};
  let callbacks = {};

  function init(cb) {
    callbacks = cb || {};
    connection.trigger('ready');
    connection.trigger('requestTokens');
    connection.trigger('requestEndpoints');

    connection.on('initActivity', onInit);
    connection.on('clickedNext', onClickedNext);
  }

  function onInit(data) {
    activity = data || {};
    const inArgs = activity?.arguments?.execute?.inArguments || [];
    const saved = Object.assign({}, ...inArgs);
    callbacks.setFields && callbacks.setFields(saved);
  }

  function onClickedNext() {
    const fields = callbacks.getFields ? callbacks.getFields() : {};
    activity.arguments = activity.arguments || {};
    activity.arguments.execute = activity.arguments.execute || {};
    activity.arguments.execute.inArguments = [
      { apiUrl: fields.apiUrl || "" }
    ];

    activity.metaData = activity.metaData || {};
    activity.metaData.isConfigured = true;

    connection.trigger('updateActivity', activity);
  }

  return { init };
});