/*jslint node: true, mocha: true */
"use strict";

var rewire = require("rewire");
var expect = require("chai").expect;
var ppcommunication = rewire("../lib/propresenter_communication.js");

var parseTime = ppcommunication.__get__('parseTime');

describe("ProPresenter Communication", function() {
  describe("#parseTime()", function() {
    it("should parse Mac AM times", function() {
      expect(parseTime("9:21:23 AM")).to.equal(9*3600 + 21*60 + 23);
    });
    it("should parse Mac PM times", function() {
      expect(parseTime("9:21:23 PM")).to.equal(21*3600 + 21*60 + 23);
    });
    it("should parse Windows times", function() {
      expect(parseTime("09:21 ")).to.equal(9*3600 + 21*60 + 0);
    });
    it("should parse Windows AM times", function() {
      expect(parseTime("09:21 am")).to.equal(9*3600 + 21*60 + 0);
    });
    it("should parse Windows PM times", function() {
      expect(parseTime("09:21 pm")).to.equal(21*3600 + 21*60 + 0);
    });
    it("should parse countdown", function() {
      expect(parseTime("00:21:03")).to.equal(0*3600 + 21*60 + 3);
    });
    it("should parse pro6 countdown", function() {
      expect(parseTime("0:21:03")).to.equal(0*3600 + 21*60 + 3);
    });
    it("should parse pro6 countdown with hour", function() {
      expect(parseTime("1:01:03")).to.equal(1*3600 + 1*60 + 3);
    });
    it("should parse pro6 negative countdown", function() {
      expect(parseTime("-0:21:03")).to.equal(-1*(0*3600 + 21*60 + 3));
    });
    it("should parse pro6 negative countdown with hour", function() {
      expect(parseTime("-1:01:03")).to.equal(-1*(1*3600 + 1*60 + 3));
    });
  });
});

