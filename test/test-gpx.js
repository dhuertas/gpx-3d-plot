#!/usr/bin/env node

var fs = require('fs');
var parser = require("../lib/XMLParser.js");

// Read file
fs.readFile(process.argv[2], 'utf8', function (err, data) {

	if (err) {
		return console.log(err);
	}

	var tree = parser.load(data);

	tree.getElementsByTagName("trkpt").forEach(function(node) {

		var line = "lat: "+node.lat+", lon: "+node.lon;

		var ele = node.getElementsByTagName("ele")[0];
		var time = node.getElementsByTagName("time")[0];

		line += ", ele: ";
		line += typeof ele != "undefined" ? ele.innerText : "0";
		line += ", time: ";
		line += typeof time != "undefined" ? time.innerText : "0";

		console.log(line);
	});

});
