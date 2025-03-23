const { generateEase } = require("./spring");
const { CSS_VAR_PREFIX } = require("./constants");

/**
 * @type {import('postcss').PluginCreator}
*/
function SpringPlugin(options) {
    let easingsCache = new Map();
    let rootRule = null;

    /**
     * @type {import('postcss').Plugin}
     */
    const plugin =  {
        postcssPlugin: "postcss-spring",
        Once(root, { Rule }) {
            rootRule = new Rule({ selector: ":root" });
        },
        Declaration (node, { AtRule, Rule }) {
            const multipliers = [];
            const easings = [];
            const durations = [];
            
            node.value = node.value.replace(/spring-bounce\((.*?)\)/g, (fullString, bounce) => {
                const bounceValue = Number(bounce?.trim());
                if (!Number.isInteger(bounceValue)) {
                    throw node.error(`Invalid bounce value: "${bounce}". Expected a whole number.`, { word: fullString });
                }
                if (bounceValue < 0) {
                    throw node.error(`Negative bounce values are not allowed: ${bounce}`, { word: fullString });
                }
                
                const { ease, durationMultiplier } = generateEase(bounceValue);
                multipliers.push(durationMultiplier);
                easings.push(bounceValue);
                
                if (!easingsCache.get(bounceValue)) {
                    easingsCache.set(bounceValue, ease);
                }
                
                return `var(${CSS_VAR_PREFIX}-easing-${easings.length - 1})`;
            });
            
            node.value = node.value.replace(/spring-duration\((.*?)\)/g, (fullString, duration) => {
                const durationValue = Number(duration?.trim());
                if (!Number.isInteger(durationValue)) {
                    throw node.error(`Invalid duration value: "${duration}". Expected a whole number.`, { word: fullString });
                }
                if (durationValue < 0) {
                    throw node.error(`Negative duration values are not allowed: ${duration}`, { word: fullString })
                }
    
                durations.push(durationValue);
    
                return `calc(${durationValue}ms * var(${CSS_VAR_PREFIX}-duration-multiplier-${durations.length - 1}))`;
            });
    
            if (easings.length === 0 && durations.length === 0) return;
    
            const parent = node.parent;
            const fallbacks = [];

            easingsCache.forEach((value, key) => {
                rootRule.append({
                    prop: `${CSS_VAR_PREFIX}-easing-cache-${key}`,
                    value: value,
                });
            });
            
            easings.forEach((key, index) => {
                parent.append({
                    prop: `${CSS_VAR_PREFIX}-easing-${index}`,
                    value: `var(${CSS_VAR_PREFIX}-easing-cache-${key})`,
                });
                fallbacks.push({
                    prop: `${CSS_VAR_PREFIX}-easing-${index}`,
                    value: options.fallbackEasing ?? 'ease',
                });
            });

            multipliers.forEach((multiplier, index) => {
                parent.append({
                    prop: `${CSS_VAR_PREFIX}-duration-multiplier-${index}`,
                    value: multiplier,
                });
                fallbacks.push({
                    prop: `${CSS_VAR_PREFIX}-duration-multiplier-${index}`,
                    value: 1,
                });
            });
    
            if (fallbacks.length === 0) return;
    
            const fallbackRule = parent.clone({ nodes: [] });
            fallbacks.forEach(fallback => {
                fallbackRule.append(fallback);
            });
            const supportsRule = new AtRule({
                name: 'supports',
                params: 'not (transition-timing-function: linear(0, 1))',
            });
            supportsRule.append(fallbackRule);
            parent.after(supportsRule);
        },
        OnceExit(root) {
            if (rootRule.nodes && rootRule.nodes.length > 0) {
                root.prepend(rootRule);
            }
        }
    };
    return plugin;
};

module.exports = { SpringPlugin };
