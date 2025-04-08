module.exports = {
    parser: 'postcss-scss',
    plugins: [require('../dist/index.cjs')],
    // plugins: {
    //     'postcss-spring': {
    //         fallbackEasing: 'linear',
    //     },
    // },
};
