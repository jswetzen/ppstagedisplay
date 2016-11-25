/*jslint node: true, mocha: true */
"use strict";

var rewire = require("rewire");
var expect = require("chai").expect;
var ppcommunication = rewire("../lib/propresenter_communication.js");

var parseTime = ppcommunication.__get__('parseTime');

describe("ProPresenter Communication", function() {
  describe("#parseTime()", function() {
    it("should parse Mac time", function() {
      expect(parseTime("9:21:23 AM")).to.equal(9*3600 + 21*60 + 23);
      expect(parseTime("9:21:23 PM")).to.equal(21*3600 + 21*60 + 23);
    });
    it("should parse Windows time", function() {
      expect(parseTime("09:21 ")).to.equal(9*3600 + 21*60 + 0);
      expect(parseTime("09:21 am")).to.equal(9*3600 + 21*60 + 0);
      expect(parseTime("09:21 pm")).to.equal(21*3600 + 21*60 + 0);
    });
    it("should parse countdown", function() {
      expect(parseTime("00:21:03")).to.equal(0*3600 + 21*60 + 3);
      expect(parseTime("-00:21:03")).to.equal(-1*(0*3600 + 21*60 + 3));
      expect(parseTime("00:00:00")).to.equal(0);
    });
    it("should parse pro6 countdown", function() {
      expect(parseTime("0:21:03")).to.equal(0*3600 + 21*60 + 3);
      expect(parseTime("1:01:03")).to.equal(1*3600 + 1*60 + 3);
      expect(parseTime("-0:21:03")).to.equal(-1*(0*3600 + 21*60 + 3));
      expect(parseTime("-1:01:03")).to.equal(-1*(1*3600 + 1*60 + 3));
      expect(parseTime("0:00:00")).to.equal(0);
    });
    it("should handle non-parsable times", function() {
      expect(parseTime("--:--:--")).to.equal(0);
    });
  });
});

