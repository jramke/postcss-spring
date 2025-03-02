const { SpringPlugin } = require("./src");

/**
 * @type {import('postcss').PluginCreator}
 */
module.exports = (options = {}) => { 
    return SpringPlugin(options);
}
module.exports.postcss = true