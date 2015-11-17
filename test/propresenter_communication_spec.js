/*jslint node: true, mocha: true */
"use strict";

var rewire = require("rewire");
var expect = require("chai").expect;
var ppcommunication = rewire("../lib/propresenter_communication.js");

var parseTime = ppcommunication.__get__('parseTime');

describe("ProPresenter Communication", function() {
  describe("#parseTime()", function() {
    it("should parse Mac AM times", function() {
      expect(parseTime("9:21:23 AM")).to.equal("09:21:23");
    });
    it("should parse Mac PM times", function() {
      expect(parseTime("9:21:23 PM")).to.equal("21:21:23");
    });
    it("should parse Windows times", function() {
      expect(parseTime("09:21 ")).to.equal("09:21:00");
    });
    it("should parse Windows AM times", function() {
      expect(parseTime("09:21 am")).to.equal("09:21:00");
    });
    it("should parse Windows PM times", function() {
      expect(parseTime("09:21 pm")).to.equal("21:21:00");
    });
  });
});

