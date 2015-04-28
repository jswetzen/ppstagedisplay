/*jslint node: true */
"use strict";

var Reconnector = require('./reconnector');
var parse = require('xml-parser');

function interpretLayouts(displayLayouts) {
  var layouts = {};
  var i, j;

  for(i=0; i < displayLayouts.children.length; i++) {
    var layoutdata = displayLayouts.children[i];
    var layout = {};

    layout.identifier = layoutdata.attributes.identifier;
    layout.border = layoutdata.attributes.showBorder;
    layout.width = layoutdata.attributes.width;
    layout.height = layoutdata.attributes.height;
    layout.fields = {};

    for(j=0; j < layoutdata.children.length; j++) {
      var field = {};
      var attributes = layoutdata.children[j].attributes;
      for(i in attributes) {
        field[i] = attributes[i];
      }
      layout.fields[field.identifier] = field;
    }

    // console.log(layout.fields);
    layouts[layout.identifier] = layout;
  }

  console.log("Got layouts");
  return layouts;
}

function interpretData(frames) {
  var frameContents = {};
  var i;
  for(i=0; i < frames.length; i++) {
    var frame = frames[i];
    if (frame.name == 'Field') {
      frameContents[frame.attributes.identifier] = {
        'attributes': frame.attributes,
        'content': frame.content};
    }
  }
  return frameContents;
}

var StageDisplay = function(host, port, password, identifier, onContentChange) {
  var _password = password,
      _identifier = identifier,
      _layouts = {},
      _frameContents = {};

  var isInitialized = function() {
    return Object.keys(_layouts).length !== 0;
  };

  var writeLogin = function(password) {
    return function(client) {
    client.write('<StageDisplayLogin>'+_password+'</StageDisplayLogin>\r\n');

    setTimeout(function() {
      if (!isInitialized()) {
        console.log("Did not get layouts, reconnecting");
        /*
        This causes errors in some cases. If it connected, didn't get layouts,
        disconnected and then tried to reconnect, this might get called after
        the reconnection succeeded. So it might not be necessary to reconnect
        here sometimes! I think the con.reconnect() call is what gets put on
        the call stack and therefore might execute later.
        */
        con.reconnect(true);
      } else {
        console.log("Yay, we got the layouts");
      }}, 1500);
    };
  };

  var handleData = function(data) {
    var message = parse(data);
    switch (message.root.name) {
      case 'DisplayLayouts':
        _layouts = interpretLayouts(message.root);
        break;
      case 'StageDisplayData':
        _frameContents = interpretData(message.root.children[0].children);
        onContentChange(_frameContents);
        break;
      case 'StageDisplayLoginSuccess':
        break;
      default:
        console.log("Unknown message, how can this be?!");
        console.log(message.root.name);
    }
  };

  var con = new Reconnector(host, port, writeLogin('password'), handleData);
  con.reconnect();

  return {
    getLayout: function(identifier) { return _layouts[identifier]; },
    getContent: function() { return _frameContents; },
    isInitialized: isInitialized
  };
};


module.exports = {
  StageDisplay: StageDisplay
};
