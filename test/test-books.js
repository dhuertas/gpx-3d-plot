#!/usr/bin/env node

var fs = require('fs');
var parser = require("../lib/XMLParser.js");

// Expected output:
/*
XML Developer's Guide; Gambardella, Matthew; Computer
Midnight Rain; Ralls, Kim; Fantasy
Maeve Ascendant; Corets, Eva; Fantasy
Oberon's Legacy; Corets, Eva; Fantasy
The Sundered Grail; Corets, Eva; Fantasy
Lover Birds; Randall, Cynthia; Romance
Splish Splash; Thurman, Paula; Romance
Creepy Crawlies; Knorr, Stefan; Horror
Paradox Lost; Kress, Peter; Science Fiction
Microsoft .NET: The Programming Bible; O'Brien, Tim; Computer
MSXML3: A Comprehensive Guide; O'Brien, Tim; Computer
Visual Studio 7: A Comprehensive Guide; Galos, Mike; Computer
*/

// Read file
fs.readFile(process.argv[2], 'utf8', function (err, data) {

	if (err) {
		return console.log(err);
	}

	var tree = parser.load(data);

	tree.getElementsByTagName("book").forEach(function(node) {

		var line = "",
			title = node.getElementsByTagName("title"),
			author = node.getElementsByTagName("author"),
			genre = node.getElementsByTagName("genre");

		line += title[0].innerText + "; " + author[0].innerText + "; " + genre[0].innerText;
		console.log(line);

	});

});
