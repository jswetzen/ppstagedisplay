/*jslint node: true */
"use strict";
var bonjour = require('bonjour')();



var BonjourFinder = function(serviceName, onFind) {
  bonjour.find({ type: serviceName }, function (service) {
    // console.log('Found a server:', service);
    onFind({port: service.port, host: service.host});
  })
  
};

module.exports = {
  BonjourFinder: BonjourFinder
};
