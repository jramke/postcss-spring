const { SpringPlugin } = require("./src");

/**
 * @type {import('postcss').PluginCreator}
 */
module.exports = (opts = {}) => {
    return SpringPlugin;
};