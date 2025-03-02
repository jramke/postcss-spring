const { SpringPlugin } = require("./src");

/**
 * @type {import('postcss').PluginCreator}
 */
module.exports = (options = { fallbackEasing: 'ease' }) => { 
    return SpringPlugin(options);
}
module.exports.postcss = true