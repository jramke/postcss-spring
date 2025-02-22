const { generateEase } = require("./spring");

/**
 * @type {import('postcss').Plugin}
 */
const SpringPlugin = {
    postcssPlugin: "postcss-spring",
    Root (root, postcss) {
        root.walkDecls((decl) => {
            let hasSpring = false;
            const multipliers = [];

            decl.value = decl.value.replace(/spring-bounce\((\d+)\)/g, (_, bounce) => {
                hasSpring = true;
                const { ease, durationMultiplier } = generateEase(parseFloat(bounce));
                multipliers.push(durationMultiplier);
                return ease;
            });

            let multiplierIndex = 0;

            decl.value = decl.value.replace(/spring-duration\((\d+)\)/g, (_, duration) => {
                hasSpring = true;
                const value = `calc(${duration}ms * var(--_spring-duration-multiplier-${multiplierIndex}))`
                multiplierIndex++;
                return value;
            });

            if (hasSpring) {
                multipliers.forEach((multiplier, index) => {
                    decl.parent.append({
                        prop: `--_spring-duration-multiplier-${index}`,
                        value: multiplier,
                    });
                });
            }
        });
    }
};

module.exports = { SpringPlugin };
