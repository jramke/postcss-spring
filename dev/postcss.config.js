const postcssSpring = require("../");

module.exports = {
	parser: "postcss-scss",
	plugins: [
		postcssSpring(),
	],
};