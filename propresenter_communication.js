/*jslint node: true */
"use strict";

var Reconnector = require('./reconnector');
var ppfinder = null;
var parse = require('xml-parser');

var names = {
  'login': 'StageDisplayLogin',
  'loginSuccess': 'StageDisplayLoginSuccess',
  'layouts': 'DisplayLayouts',
  'data': 'StageDisplayData',
};

function interpretLayouts(displayLayouts) {
  var layouts = {};

  for(var i=0; i < displayLayouts.children.length; i++) {
    var layoutdata = displayLayouts.children[i];
    var layout = {};

    layout.identifier = layoutdata.attributes.identifier;
    layout.border = layoutdata.attributes.showBorder[0] == '1';
    layout.width = parseInt(layoutdata.attributes.width);
    layout.height = parseInt(layoutdata.attributes.height);
    var minX = layoutdata.children[0].xAxis;
    var minY = layoutdata.children[0].yAxis;
    var maxX = minX + layoutdata.children[0].width;
    var maxY = minY + layoutdata.children[0].height;
    layout.fields = {};

    for(var j=0; j < layoutdata.children.length; j++) {
      var field = {};
      var attributes = layoutdata.children[j].attributes;
      for(var k in attributes) {
        // console.log(k);
        field[k] = attributes[k];
      }
      layout.fields[field.identifier] = field;
    }

    // layout.width = layoutdata.attributes.width;
    // layout.height = layoutdata.attributes.height;

    // console.log(layout.fields);
    layouts[layout.identifier] = layout;
  }

  console.log("Got layouts");
  return layouts;
}

function parseTime(timestr) {
  var pad = function(num) {
    return ('0' + num).slice(-2);
  };
  var d = new Date();
  var time = timestr.match(/(\d+):(\d+):(\d+)\s*(p?)/);
  d.setHours( parseInt(time[1]) + (time[4] ? 12 : 0) );
  d.setMinutes( parseInt(time[2]) || 0 );
  d.setSeconds( parseInt(time[3]) || 0 );
  return pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
}


var StageDisplay = function(host, port, password, identifier, onContentChange) {
  var _password = password,
      _identifier = identifier,
      _layouts = {},
      _frameContents = {},
      receivedData = "";

  var isInitialized = function() {
    return Object.keys(_layouts).length !== 0;
  };

  var writeLogin = function() {
    return function(client) {
    client.write('<'+names.login+'>'+_password+'</'+names.login+'>\r\n');

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
        con.reconnect();
      } else {
        console.log("Yay, we got the layouts");
      }}, 1500);
    };
  };

  var preprocessors = {
    'clock': function(data) { return parseTime(data); }
  };

  var interpretData = function(frames) {
    var frameContents = {};
    var i;
    for(i=0; i < frames.length; i++) {
      var frame = frames[i];
      if (frame.name == 'Field') {
        // console.log(frame);
        var content = frame.content;
        if (frame.attributes.type !== undefined) {
          var type = frame.attributes.type;
          if (preprocessors[type] !== undefined) {
          content = preprocessors[type](content);
          }
        }
        frameContents[frame.attributes.identifier] = {
          'attributes': frame.attributes,
          'content': content};
      }
    }
    return frameContents;
  };

  var getFirstMessage = function(receivedData) {
    /*
     * There are three types of messages that ProPresenter sends out:
     *  <StageDisplayLoginSuccess />:
     *    This is only the single tag, there's no xml statement
     *  <DisplayLayouts selected="???"> ... </DisplayLayouts>:
     *    Starting tag and end tag, no xml statement
     *  <?xml version="1.0" encoding="UTF-8" standalone="no"?><StageDisplayData> ... </StageDisplayData>:
     *    xml statement plus start and end tags
     */
    // Find a message in the received data and parse it
    // var re = /^\s*(?:<\?xml[^>]*>)*(?:<\s*([^\s]*)[^>]*>.*<\/\1>|<[^>]*\/>)/;
    // The magic "[^]*" is an alterative to "." which also matches newlines
    var closingTagRE = /^\s*(?:<\?xml[^>]*>)*<\s*([^\s]*)[^>]*>[^]*<\/\1>/;
    var singleTagRE = /^\s*<([^\s]*)\s*\/>/;
    var match, singleMatch;
    match = closingTagRE.exec(receivedData);
    singleMatch = singleTagRE.exec(receivedData);

    if (match !== null && (singleMatch === null || match.index < singleMatch.index)) {
      return match;
    } else {
      return singleMatch;
    }

  };

  var handleData = function(data) {
    // console.log(data);
    receivedData += data;
    var match = getFirstMessage(receivedData);

    if (match === null) {
      // console.log('No match: ' + receivedData);
    }

    while (match !== null) {
      // console.log('Got a match: ' + match[0]);
      receivedData = receivedData.substr(match.index+match[0].length);

      var message = parse(match[0]);
      // console.log(message);
      switch (message.root.name) {
        case names.layouts:
          _layouts = interpretLayouts(message.root);
          break;
        case names.data:
          // console.log("Got display data");
          _frameContents = interpretData(message.root.children[0].children);
          onContentChange(_frameContents);
          break;
        case names.loginSuccess:
          break;
        default:
          console.log("Unknown message, how can this be?!");
          console.log(message.root.name);
      }

      match = getFirstMessage(receivedData);
    }
  };

  var con;

  if (host === null || port === null) {
    ppfinder = require('./propresenter_finder');
    ppfinder.BonjourFinder('pro4_sd', function(service) {
      con = new Reconnector(service.host, service.port, writeLogin(), handleData);
      con.connect();
    });
  } else {
    con = new Reconnector(host, port, writeLogin(), handleData);
    con.connect();
  }

  return {
    getLayout: function(identifier) { return _layouts[identifier]; },
    getContent: function() { return _frameContents; },
    isInitialized: isInitialized
  };
};


module.exports = {
  StageDisplay: StageDisplay
};
