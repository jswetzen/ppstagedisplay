/*jslint node: true */
"use strict";

var mdns = require('mdns');
var net = require('net');

var BonjourFinder = function(serviceName, onFind) {
  var foundIt = false;
  var sequence = [
    mdns.rst.DNSServiceResolve(),
    'DNSServiceGetAddrInfo' in mdns.dns_sd ? mdns.rst.DNSServiceGetAddrInfo() : mdns.rst.getaddrinfo({families:[4]}),
    mdns.rst.makeAddressesUnique()
  ];
  var browser = mdns.createBrowser(mdns.tcp(serviceName), {resolverSequence: sequence});
  var callback = onFind;

  var serviceUp = function(service) {
    try {
      if (service.addresses.length == 1 && net.isIP(service.addresses[0]) === 6) {
        browser.stop();
        browser = mdns.createBrowser(mdns.tcp(serviceName));
        browser.on('serviceUp', serviceUp);
        browser.start();
      } else {
        var port = service.port;
        var host = service.addresses[0];
        if (net.isIP(host) == 6) {
          host = service.addresses[1];
        }
        if (net.isIP(host) !== 0) {
          if (!foundIt) {
            foundIt = true;
            onFind({port: port, host: host});
            browser.stop();
          }
        }
      }
    } catch(err) {
      console.log("mDNS error: " + err);
    }
  };

  browser.on('serviceUp', serviceUp);
  browser.start();
};

module.exports = {
  BonjourFinder: BonjourFinder
};
