/*jslint node: true */
"use strict";

var net = require('net');
var parse = require('xml-parser');

var Reconnector = function(host, port, onConnect, onData) {
  var _host = host,
      _port = port,
      _connected = false,
      _client;

  var connect = function() {
    _client = net.connect(_port, _host, function() {
      // _client.write('<StageDisplayLogin>'+_password+'</StageDisplayLogin>\r\n');
      _connected = true;
      onConnect(_client);
    });

    _client.on('error', function() {
      console.log("Connection error");
    });

    _client.on('close', function() {
      _connected = false;
      console.log("Connection closed, reconnecting");
      setTimeout(connect, 1000);
    });

    _client.on('data', function(data) {
        onData(data.toString('utf-8'));
    });
  };

  var reconnect = function(force) {
    if (!_connected || force) {
      if (_client !== undefined && !_client.destroyed) {
        _client.end();
        _client.destroy();
      }
      connect();
    }
  };

  return {
    reconnect: reconnect,
    connected: function() {
      return _connected;
    },
    write: function(data) {
      _client.write(data);
    }
  };
};


module.exports = Reconnector;
// };
