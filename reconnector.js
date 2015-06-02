/*jslint node: true */
"use strict";

var net = require('net');

var Reconnector = function(host, port, onConnect, onData) {
  var _host = host,
      _port = port,
      _connected,
      _manualReconnect,
      _client;

  var _connect = function() {
    _client = net.connect(_port, _host, function() {
    });

    _client.on('connect', function() {
      _connected = true;
      onConnect(_client);
    });

    _client.on('error', function() {
      console.log("Connection error");
    });

    _client.on('close', function() {
      _connected = false; // TODO: This causes problems; force doesn't do anything because it's not connected!
      if (!_manualReconnect) {
        console.log("Connection closed, reconnecting");
        setTimeout(function() {_reconnect(false);}, 1000);
      } else {
        _manualReconnect = false;
      }
    });

    _client.on('data', function(data) {
        onData(data.toString('utf-8'));
    });
  };

  var _reconnect = function(force) {
    // force is only used when reconnecting manually
    if (!_connected || force) {
      if (_client !== undefined && !_client.destroyed) {
        _client.end();
        _client.destroy();
      }
      _connect();
    }
  };

  var manualReconnect = function() {
    _manualReconnect = true;
    _reconnect(true);
  };

  return {
    reconnect: manualReconnect,
    connect: _connect,
    connected: function() {
      return _connected;
    },
    write: function(data) {
      _client.write(data);
    }
  };
};


module.exports = Reconnector;
