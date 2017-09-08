/*jslint node: true, mocha: true */
"use strict";

var rewire = require("rewire");
var expect = require("chai").expect;
var ppcommunication = rewire("../lib/propresenter_communication.js");

var parseTime = ppcommunication.__get__('parseTime');
var parseColors = ppcommunication.__get__('parseColors');

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
  
  describe("#parseColors()", function() {
		  it("should parse red", function() {
			  var input = {red:255,green:0,blue:0,alpha:0};
			  expect(parseColors(input).htmlColor).to.equal('rgba(255,0,0,0)');
		  })
		  
		  it("should parse green", function() {
			var input = {red:0,green:255,blue:0,alpha:0};
		  	expect(parseColors(input).htmlColor).to.equal('rgba(0,255,0,0)');
	  	  })
		  
		  it("should parse blue", function() {
			var input = {red:0,green:0,blue:255,alpha:0};
			expect(parseColors(input).htmlColor).to.equal('rgba(0,0,255,0)');
		  })
		  
		  it("should parse alpha", function() {
			var input = {red:0,green:0,blue:0,alpha:1};
			expect(parseColors(input).htmlColor).to.equal('rgba(0,0,0,1)');
		  })
		  
		  it("should parse a combination", function() {
			var input = {red:54,green:73,blue:20,alpha:.8};
			expect(parseColors(input).htmlColor).to.equal('rgba(54,73,20,0.8)');
		  })
		  it("should parse float colors as percentages", function() {
		  	var input = {red: "4.00000005960464E-1", "blue":"1E0", "green":"8.00000011920929E-1"};
		  	expect(parseColors(input).htmlColor).to.equal('rgba(102,204,255,1)');
		  })
		  it("should parse integer 1 as iteself", function() {
		  	var input = {red:1, green:"1", blue:1, alpha:.8};
		  	expect(parseColors(input).htmlColor).to.equal('rgba(1,1,1,0.8)');
		  })
		  it("should parse float 1E0 as 255", function() {
		  	var input = {red:"1E0", green:"1E0", blue: "1E0", alpha: 1};
		  	expect(parseColors(input).htmlColor).to.equal('rgba(255,255,255,1)');
		  })
		  
		  it("should parse null as black", function() {
			  var input = null;
			  var expected = {red: 0, green: 0, blue: 0, alpha: 1, htmlColor: 'rgba(0,0,0,1)'};
			  expect(parseColors(input)).to.deep.equal(expected);
		  })
		  
		  it("should parse undefined as black", function() {
			  var input = undefined;
			  var expected = {red: 0, green: 0, blue: 0, alpha: 1, htmlColor: 'rgba(0,0,0,1)'};
			  expect(parseColors(input)).to.deep.equal(expected);
		  })
  });
});

