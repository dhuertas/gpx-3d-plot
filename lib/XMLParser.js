/*
 * Small XML parser
 *
 * @author 	Dani Huertas
 * @email 	huertas.dani@gmail.com
 * @date 	2014-08-16 12:57:55
 *
 */
var Node = function(parent) {

	this.parent = parent || null;

	this.children = [];

	this.attributes = {};

	this.tag = "";

	this.innerText = "";

}

Node.prototype = {

	getAttributes : function() {
		return this.attributes;
	},

	getChildren : function() {
		return this.children;
	},

	getInnerText : function() {
		return this.innerText;
	},

	getParent : function() {
		return this.parent;
	},

	getTag : function() {
		return this.tag;
	},

	getElementsByTagName : function(tag) {

		var result = [];

		if (this.tag == tag) {
			result.push(this);
		}

		this.children.forEach(function(child) {
			result = result.concat(child.getElementsByTagName(tag));
		});

		return result;
	},

	setAttributes : function(attr) {
		this.attributes = attr;
	},

	setChildren : function(children) {
		this.children = children; 
	},

	setInnerText : function(text) {
		this.innerText = text;
	},

	setParent : function(parent) {
		this.parent = parent;
	},

	setTag : function(tag) {
		this.tag = tag;
	},

	addChild : function(children) {
		this.children.push(children);
	},

	addAttribute : function(attributes) {
		for (var attr in attributes) {
			this.attributes[attr] = attributes[attr];
			// Also add the attribute to current node for easy access
			this[attr] = attributes[attr];
		}
	},

	toString : function() {

		var self = this;

		var text = "{";

		text += "tag: \"" + this.tag + "\", ";
		text += "innerText: \"" + this.innerText + "\", ";

		for (var attr in this.attributes) {
			text += attr + ": " + this.attributes[attr] + ", ";
		}

		text += "children: ["
		if (this.children.length > 0) {
			this.children.forEach(function(child, i) {
				text += child.toString() + (i < self.children.length - 1 ? ", " : "");
			});
		} 
		text += "]";
		text +="}";

		return text;
	},

	toJSON : function() {
		var self = this;

		var text = "{";

		text += "\"tag\": \"" + this.tag + "\", ";
		text += "\"innerText\": \"" + this.innerText
			.replace(/\n/g, "\\n")
			.replace(/\t/g, "\\t")
			.replace(/\\/g, "\\")
			.replace(/'/g, "\'")
			.replace(/"/g, "\\\"") + 
			"\", ";

		for (var attr in this.attributes) {
			text += "\"" + attr + "\": \"" + this.attributes[attr] + "\", ";
		}

		text += "\"children\": ["
		if (this.children.length > 0) {
			this.children.forEach(function(child, i) {
				text += child.toJSON() + (i < self.children.length - 1 ? ", " : "");
			});
		} 
		text += "]";
		text +="}";

		return text;
	}
};

var XMLParser = function() {

}

XMLParser.prototype = {

	load : function(xmlString) {

		var rootNode = new Node(null);

		this.processData(xmlString, rootNode, 0);

		return rootNode;

	}, 

	processData : function(xmlString, currentNode, currentPos) {

		var tagStart,
			TagEnd;

		var innerStart,
			innerEnd;

		tagStart = currentPos;
		end = currentPos;

		while (-1 < currentPos && currentPos < xmlString.length) {

			// TODO look for comments, e.g. <!-- -->
			// TODO look for <!, e.g <![CDATA[]]>

			tagStart = xmlString.indexOf("<", currentPos);
			tagEnd = xmlString.indexOf(">", currentPos);

			if (tagStart == -1) {
				// No more tags
				break;
			}

			if (xmlString.substr(tagStart, tagEnd-tagStart+1).indexOf("<?") != -1 || 
				xmlString.substr(tagStart, tagEnd-tagStart+1).indexOf("<!") != -1) {
				// Unhandled tag

			} else if (xmlString.substr(tagStart, tagEnd-tagStart+1).indexOf("/>") != -1) {
				// It's a self closing tag

				var node = new Node(currentNode);

				var spacePos = xmlString.indexOf(" ", tagStart),
					currentTagEndPos = xmlString.indexOf(">", tagStart),
					tagContentStart = xmlString.indexOf("<", tagStart)+1;

				// set tag
				node.setTag(xmlString.substr(tagContentStart, Math.min(spacePos, currentTagEndPos)-tagContentStart));

				xmlString.substr(tagStart+1, tagEnd-1-tagStart)
					.split(" ")
					.forEach(function(elem) {

					if (elem.indexOf("=") != -1) {
						var attr = {};
						attr[elem.split("=")[0]] = elem.split("=")[1].replace(/"/g, "");
						currentNode.addAttribute(attr);
					}
				});

				innerEnd = tagEnd;

				node.setInnerText(xmlString.substr(tagStart, tagEnd+1-tagStart+1));

				node.setParent(currentNode);

				currentNode.addChild(node);

			// Is it an opening tag or a closing one?
			} else if (xmlString.substr(tagStart, tagEnd-tagStart+1).indexOf("</") == -1) {
				// It's an opening tag

				innerStart = tagStart;

				var node = new Node(currentNode);

				var spacePos = xmlString.indexOf(" ", tagStart),
					currentTagEndPos = xmlString.indexOf(">", tagStart),
					tagContentStart = xmlString.indexOf("<", tagStart)+1;

				// set tag
				node.setTag(xmlString.substr(tagContentStart, Math.min(spacePos, currentTagEndPos)-tagContentStart));

				// set attributes
				xmlString.substr(tagStart+1, tagEnd-1-tagStart)
					.split(" ")
					.forEach(function(elem) {

					if (elem.indexOf("=") != -1) {
						var attr = {};
						attr[elem.split("=")[0]] = elem.split("=")[1].replace(/"/g, "");
						node.addAttribute(attr);
					}
				});

				node.setParent(currentNode);

				// We need to go deeper
				currentNode.addChild(node);

				currentPos = this.processData(xmlString, node, tagEnd+1);

			} else {
				// Must be a closing tag
				innerEnd = tagEnd;

				currentNode.setInnerText(xmlString.substr(currentPos, tagStart-currentPos));

				var closingTag = xmlString.substr(tagStart+2, tagEnd-2-tagStart);

				if (currentNode.getTag().localeCompare(closingTag) != 0) {
					console.log("Opening and closing tags do not match: "+currentNode.getTag()+":"+closingTag);
					return -1;
				}

				return tagEnd+1;
			}

			if (tagEnd < 0) break;
			currentPos = tagEnd+1;
		}
		// XML processed
	}
};

module.exports = new XMLParser();
