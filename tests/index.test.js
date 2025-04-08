import postcss from 'postcss';
import assert from 'node:assert/strict';
import test from 'node:test';
import plugin from '../dist/index.mjs';
import { CSS_VAR_PREFIX } from '../src/lib/constants.js';

async function run(input, output, opts = {}) {
    let result = await postcss([plugin(opts)]).process(input, {
        from: undefined,
    });
    assert.equal(result.css, output);
    assert.equal(result.warnings().length, 0);
}

async function runError(input, expectedError) {
    try {
        await postcss([plugin()]).process(input, {
            from: undefined,
        });
        throw new Error(`Should have thrown an error: "${expectedError}"`);
    } catch (error) {
        assert.ok(error.message.includes(expectedError));
    }
}

test('generates correct easing curve', async () => {
    await run(
        '.my-box { transition-timing-function: spring-bounce(0) }',
        `:root { ${CSS_VAR_PREFIX}-easing-cache-0: linear(0, 0.001 0.44%, 0.0045 0.94%, 0.0195 2.03%, 0.0446 3.19%, 0.0811 4.5%, 0.1598 6.82%, 0.3685 12.34%, 0.4693 15.17%, 0.5663, 0.6498 21.27%, 0.7215 24.39%, 0.7532 25.98%, 0.7829 27.65%, 0.8105, 0.8349 31.14%, 0.8573 32.95%, 0.8776 34.84%, 0.8964 36.87%, 0.9136 39.05%, 0.929 41.37%, 0.9421 43.77%, 0.9537 46.38%, 0.9636 49.14%, 0.9789 55.31%, 0.9888 62.35%, 0.9949 71.06%, 0.9982 82.52%, 0.9997 99.94%) }.my-box { transition-timing-function: var(${CSS_VAR_PREFIX}-easing-0); ${CSS_VAR_PREFIX}-easing-0: var(${CSS_VAR_PREFIX}-easing-cache-0); ${CSS_VAR_PREFIX}-duration-multiplier-0: 1.66 }@supports not (transition-timing-function: linear(0, 1)) {.my-box { ${CSS_VAR_PREFIX}-easing-0: ease; ${CSS_VAR_PREFIX}-duration-multiplier-0: 1 } }`,
        {}
    );
});

test('generates correct arbitrary easing curve', async () => {
    await run(
        '.my-box { transition-timing-function: spring-bounce(77) }',
        `:root { ${CSS_VAR_PREFIX}-easing-cache-77: linear(0, 0.0032, 0.0127, 0.0288, 0.0508, 0.0793, 0.1153 1.52%, 0.2063 2.08%, 0.2995 2.56%, 0.4145 3.09%, 0.8473 4.9%, 1.0091, 1.1523 6.33%, 1.2651 6.99%, 1.3121, 1.3534, 1.3881, 1.4169, 1.44, 1.4573, 1.4689, 1.475 9.53%, 1.4758, 1.4733, 1.4673, 1.458, 1.4452, 1.4289 11.12%, 1.3848 11.71%, 1.3401 12.21%, 1.283 12.77%, 1.0708 14.64%, 0.9925, 0.9241 16.09%, 0.87 16.76%, 0.83, 0.8009 18%, 0.7905, 0.7825, 0.777, 0.774 19.23%, 0.7746, 0.7818 20.28%, 0.7955 20.83%, 0.8164 21.42%, 0.8379 21.93%, 0.8651 22.48%, 0.9665 24.37%, 1.0037, 1.0362 25.81%, 1.062 26.49%, 1.0808, 1.0945, 1.1034, 1.1075 28.94%, 1.1073 29.45%, 1.104 29.99%, 1.0974 30.55%, 1.0875 31.14%, 1.0642 32.21%, 0.9982 34.82%, 0.9827 35.54%, 0.9706 36.2%, 0.9617, 0.9552, 0.9509, 0.9489 38.62%, 0.9504 39.68%, 0.9582 40.84%, 0.9693 41.92%, 1.0009 44.55%, 1.014 45.93%, 1.0213, 1.0243 48.3%, 1.0239 49.24%, 1.0212 50.24%, 0.995 55.23%, 0.9904 56.61%, 0.9885 57.96%, 0.9899 59.95%, 1.0023 64.92%, 1.0055 67.63%, 1.0048 69.7%, 0.999 74.57%, 0.9974 77.17%, 1.0012 86.83%, 0.9996 100%) }.my-box { transition-timing-function: var(${CSS_VAR_PREFIX}-easing-0); ${CSS_VAR_PREFIX}-easing-0: var(${CSS_VAR_PREFIX}-easing-cache-77); ${CSS_VAR_PREFIX}-duration-multiplier-0: 5.285 }@supports not (transition-timing-function: linear(0, 1)) {.my-box { ${CSS_VAR_PREFIX}-easing-0: ease; ${CSS_VAR_PREFIX}-duration-multiplier-0: 1 } }`,
        {}
    );
});

test('generates correct duration', async () => {
    await run(
        '.my-box { transition-duration: spring-duration(100) }',
        `.my-box { transition-duration: calc(100ms * var(${CSS_VAR_PREFIX}-duration-multiplier-0)) }`,
        {}
    );
});

test('generates correct arbitrary duration', async () => {
    await run(
        '.my-box { transition-duration: spring-duration(77) }',
        `.my-box { transition-duration: calc(77ms * var(${CSS_VAR_PREFIX}-duration-multiplier-0)) }`,
        {}
    );
});

test('handles transition with spring-duration and spring-bounce', async () => {
    await run(
        '.my-box { transition: transform spring-duration(200) spring-bounce(30) }',
        `:root { ${CSS_VAR_PREFIX}-easing-cache-30: linear(0, 0.0018, 0.0069, 0.0151 1.74%, 0.0277 2.4%, 0.062 3.7%, 0.1115 5.15%, 0.2211 7.77%, 0.4778 13.21%, 0.5912 15.75%, 0.6987 18.44%, 0.7862 20.98%, 0.861 23.59%, 0.8926, 0.9205, 0.945 27.51%, 0.9671 28.89%, 0.9868, 1.003 31.79%, 1.0224 34.11%, 1.0358 36.58%, 1.0436 39.27%, 1.046 42.31%, 1.0446 44.71%, 1.0406 47.47%, 1.0118 61.84%, 1.0027 69.53%, 0.9981 80.49%, 0.9991 99.94%) }.my-box { transition: transform calc(200ms * var(${CSS_VAR_PREFIX}-duration-multiplier-0)) var(${CSS_VAR_PREFIX}-easing-0); ${CSS_VAR_PREFIX}-easing-0: var(${CSS_VAR_PREFIX}-easing-cache-30); ${CSS_VAR_PREFIX}-duration-multiplier-0: 1.66 }@supports not (transition-timing-function: linear(0, 1)) {.my-box { ${CSS_VAR_PREFIX}-easing-0: ease; ${CSS_VAR_PREFIX}-duration-multiplier-0: 1 } }`,
        {}
    );
});

test('handles animation with spring-duration and spring-bounce', async () => {
    await run(
        '.my-box { animation: my-animation spring-duration(200) spring-bounce(30) }',
        `:root { ${CSS_VAR_PREFIX}-easing-cache-30: linear(0, 0.0018, 0.0069, 0.0151 1.74%, 0.0277 2.4%, 0.062 3.7%, 0.1115 5.15%, 0.2211 7.77%, 0.4778 13.21%, 0.5912 15.75%, 0.6987 18.44%, 0.7862 20.98%, 0.861 23.59%, 0.8926, 0.9205, 0.945 27.51%, 0.9671 28.89%, 0.9868, 1.003 31.79%, 1.0224 34.11%, 1.0358 36.58%, 1.0436 39.27%, 1.046 42.31%, 1.0446 44.71%, 1.0406 47.47%, 1.0118 61.84%, 1.0027 69.53%, 0.9981 80.49%, 0.9991 99.94%) }.my-box { animation: my-animation calc(200ms * var(${CSS_VAR_PREFIX}-duration-multiplier-0)) var(${CSS_VAR_PREFIX}-easing-0); ${CSS_VAR_PREFIX}-easing-0: var(${CSS_VAR_PREFIX}-easing-cache-30); ${CSS_VAR_PREFIX}-duration-multiplier-0: 1.66 }@supports not (transition-timing-function: linear(0, 1)) {.my-box { ${CSS_VAR_PREFIX}-easing-0: ease; ${CSS_VAR_PREFIX}-duration-multiplier-0: 1 } }`,
        {}
    );
});

test('handles multiple transition values', async () => {
    await run(
        '.my-box { transition: transform spring-duration(200) spring-bounce(0), scale spring-duration(400) spring-bounce(70) }',
        `:root { ${CSS_VAR_PREFIX}-easing-cache-0: linear(0, 0.001 0.44%, 0.0045 0.94%, 0.0195 2.03%, 0.0446 3.19%, 0.0811 4.5%, 0.1598 6.82%, 0.3685 12.34%, 0.4693 15.17%, 0.5663, 0.6498 21.27%, 0.7215 24.39%, 0.7532 25.98%, 0.7829 27.65%, 0.8105, 0.8349 31.14%, 0.8573 32.95%, 0.8776 34.84%, 0.8964 36.87%, 0.9136 39.05%, 0.929 41.37%, 0.9421 43.77%, 0.9537 46.38%, 0.9636 49.14%, 0.9789 55.31%, 0.9888 62.35%, 0.9949 71.06%, 0.9982 82.52%, 0.9997 99.94%); ${CSS_VAR_PREFIX}-easing-cache-70: linear(0, 0.0029, 0.0115, 0.0255, 0.0453, 0.0714, 0.1025 1.95%, 0.1844 2.68%, 0.2681 3.31%, 0.371 4%, 0.768 6.45%, 0.919, 1.054 8.41%, 1.1624 9.34%, 1.208, 1.247, 1.2816, 1.3097, 1.3325, 1.3504, 1.3629, 1.3702 12.98%, 1.3722, 1.3716, 1.3683, 1.3625 14.36%, 1.3431 15.1%, 1.3123 15.89%, 1.2805 16.56%, 1.2392 17.32%, 1.0838 19.9%, 1.0257, 0.9748 21.93%, 0.9348 22.87%, 0.9056, 0.884, 0.8696, 0.8624 26.32%, 0.8614, 0.8635 27.54%, 0.8686 28.18%, 0.877 28.86%, 0.8882 29.57%, 0.9029 30.34%, 0.9824 33.93%, 1.0156 35.7%, 1.0299 36.7%, 1.0404, 1.0475, 1.0511 39.64%, 1.0509 40.89%, 1.0459 42.26%, 1.036 43.76%, 1.0067 47.32%, 0.9945 49.06%, 0.9852, 0.9811 52.93%, 0.9829 55.66%, 1.0019 62.39%, 1.007 66.13%, 1.0064 69.05%, 0.9994 75.69%, 0.9974 79.29%, 1.0009 91.8%, 1.0003 100%) }.my-box { transition: transform calc(200ms * var(${CSS_VAR_PREFIX}-duration-multiplier-0)) var(${CSS_VAR_PREFIX}-easing-0), scale calc(400ms * var(${CSS_VAR_PREFIX}-duration-multiplier-1)) var(${CSS_VAR_PREFIX}-easing-1); ${CSS_VAR_PREFIX}-easing-0: var(${CSS_VAR_PREFIX}-easing-cache-0); ${CSS_VAR_PREFIX}-easing-1: var(${CSS_VAR_PREFIX}-easing-cache-70); ${CSS_VAR_PREFIX}-duration-multiplier-0: 1.66; ${CSS_VAR_PREFIX}-duration-multiplier-1: 3.91 }@supports not (transition-timing-function: linear(0, 1)) {.my-box { ${CSS_VAR_PREFIX}-easing-0: ease; ${CSS_VAR_PREFIX}-easing-1: ease; ${CSS_VAR_PREFIX}-duration-multiplier-0: 1; ${CSS_VAR_PREFIX}-duration-multiplier-1: 1 } }`,
        {}
    );
});

test('handles separate transition-duration and transition-timing-function', async () => {
    await run(
        '.my-box { transition-duration: spring-duration(200), spring-duration(200); transition-property: transform, scale; transition-timing-function: spring-bounce(0), spring-bounce(70) }',
        `:root { ${CSS_VAR_PREFIX}-easing-cache-0: linear(0, 0.001 0.44%, 0.0045 0.94%, 0.0195 2.03%, 0.0446 3.19%, 0.0811 4.5%, 0.1598 6.82%, 0.3685 12.34%, 0.4693 15.17%, 0.5663, 0.6498 21.27%, 0.7215 24.39%, 0.7532 25.98%, 0.7829 27.65%, 0.8105, 0.8349 31.14%, 0.8573 32.95%, 0.8776 34.84%, 0.8964 36.87%, 0.9136 39.05%, 0.929 41.37%, 0.9421 43.77%, 0.9537 46.38%, 0.9636 49.14%, 0.9789 55.31%, 0.9888 62.35%, 0.9949 71.06%, 0.9982 82.52%, 0.9997 99.94%); ${CSS_VAR_PREFIX}-easing-cache-70: linear(0, 0.0029, 0.0115, 0.0255, 0.0453, 0.0714, 0.1025 1.95%, 0.1844 2.68%, 0.2681 3.31%, 0.371 4%, 0.768 6.45%, 0.919, 1.054 8.41%, 1.1624 9.34%, 1.208, 1.247, 1.2816, 1.3097, 1.3325, 1.3504, 1.3629, 1.3702 12.98%, 1.3722, 1.3716, 1.3683, 1.3625 14.36%, 1.3431 15.1%, 1.3123 15.89%, 1.2805 16.56%, 1.2392 17.32%, 1.0838 19.9%, 1.0257, 0.9748 21.93%, 0.9348 22.87%, 0.9056, 0.884, 0.8696, 0.8624 26.32%, 0.8614, 0.8635 27.54%, 0.8686 28.18%, 0.877 28.86%, 0.8882 29.57%, 0.9029 30.34%, 0.9824 33.93%, 1.0156 35.7%, 1.0299 36.7%, 1.0404, 1.0475, 1.0511 39.64%, 1.0509 40.89%, 1.0459 42.26%, 1.036 43.76%, 1.0067 47.32%, 0.9945 49.06%, 0.9852, 0.9811 52.93%, 0.9829 55.66%, 1.0019 62.39%, 1.007 66.13%, 1.0064 69.05%, 0.9994 75.69%, 0.9974 79.29%, 1.0009 91.8%, 1.0003 100%) }.my-box { transition-duration: calc(200ms * var(${CSS_VAR_PREFIX}-duration-multiplier-0)), calc(200ms * var(${CSS_VAR_PREFIX}-duration-multiplier-1)); transition-property: transform, scale; transition-timing-function: var(${CSS_VAR_PREFIX}-easing-0), var(${CSS_VAR_PREFIX}-easing-1); ${CSS_VAR_PREFIX}-easing-0: var(${CSS_VAR_PREFIX}-easing-cache-0); ${CSS_VAR_PREFIX}-easing-1: var(${CSS_VAR_PREFIX}-easing-cache-70); ${CSS_VAR_PREFIX}-duration-multiplier-0: 1.66; ${CSS_VAR_PREFIX}-duration-multiplier-1: 3.91 }@supports not (transition-timing-function: linear(0, 1)) {.my-box { ${CSS_VAR_PREFIX}-easing-0: ease; ${CSS_VAR_PREFIX}-easing-1: ease; ${CSS_VAR_PREFIX}-duration-multiplier-0: 1; ${CSS_VAR_PREFIX}-duration-multiplier-1: 1 } }`,
        {}
    );
});

test('handles invalid bounce values', async () => {
    runError(
        '.my-box { transition-duration: spring-bounce(-20) }',
        'Negative bounce values are not allowed'
    );
    runError('.my-box { transition-duration: spring-bounce(abc) }', 'Invalid bounce value');
    runError('.my-box { transition-duration: spring-bounce(1.1) }', 'Invalid bounce value');
});

test('handles invalid duration values', async () => {
    runError(
        '.my-box { transition-duration: spring-duration(-100) }',
        'Negative duration values are not allowed'
    );
    runError('.my-box { transition-duration: spring-duration(abc) }', 'Invalid duration value');
    runError('.my-box { transition-duration: spring-duration(100ms) }', 'Invalid duration value');
    runError('.my-box { transition-duration: spring-duration(100.1) }', 'Invalid duration value');
});

test('caches and reuses easing curves', async () => {
    await run(
        `.box1 { transition-timing-function: spring-bounce(5) } .box2 { transition-timing-function: spring-bounce(5) } .box3 { transition-timing-function: spring-bounce(10) }`,
        `:root { ${CSS_VAR_PREFIX}-easing-cache-5: linear(0, 0.0014, 0.0053 1.02%, 0.021 2.1%, 0.0469 3.27%, 0.0844 4.57%, 0.1656 6.9%, 0.3842 12.48%, 0.4858 15.24%, 0.5839, 0.6683 21.19%, 0.7063, 0.7407 24.24%, 0.7732, 0.8022 27.44%, 0.8292, 0.853 30.77%, 0.8747 32.52%, 0.8943 34.33%, 0.9123 36.29%, 0.9282 38.32%, 0.9422 40.5%, 0.9541 42.75%, 0.9643 45.14%, 0.9731 47.76%, 0.9861 53.64%, 0.9937 60.1%, 0.998 68.44%, 0.9997 79.47%, 1.0001 99.94%); ${CSS_VAR_PREFIX}-easing-cache-10: linear(0, 0.0014, 0.0053 1.02%, 0.0225 2.18%, 0.0512 3.41%, 0.0903 4.72%, 0.1772 7.11%, 0.3978 12.56%, 0.5033 15.31%, 0.6026, 0.6881 21.12%, 0.7255 22.57%, 0.7611, 0.7931, 0.8217 27.14%, 0.8482, 0.8715 30.34%, 0.8935, 0.9124 33.82%, 0.929 35.64%, 0.9436 37.52%, 0.956 39.48%, 0.9668 41.59%, 0.9759 43.84%, 0.9834 46.23%, 0.994, 0.999 57.12%, 1.0012 64.16%, 1.0002 99.94%) }.box1 { transition-timing-function: var(${CSS_VAR_PREFIX}-easing-0); ${CSS_VAR_PREFIX}-easing-0: var(${CSS_VAR_PREFIX}-easing-cache-5); ${CSS_VAR_PREFIX}-duration-multiplier-0: 1.66 }@supports not (transition-timing-function: linear(0, 1)) {.box1 { ${CSS_VAR_PREFIX}-easing-0: ease; ${CSS_VAR_PREFIX}-duration-multiplier-0: 1 } } .box2 { transition-timing-function: var(${CSS_VAR_PREFIX}-easing-0); ${CSS_VAR_PREFIX}-easing-0: var(${CSS_VAR_PREFIX}-easing-cache-5); ${CSS_VAR_PREFIX}-duration-multiplier-0: 1.66 } @supports not (transition-timing-function: linear(0, 1)) { .box2 { ${CSS_VAR_PREFIX}-easing-0: ease; ${CSS_VAR_PREFIX}-duration-multiplier-0: 1 } } .box3 { transition-timing-function: var(${CSS_VAR_PREFIX}-easing-0); ${CSS_VAR_PREFIX}-easing-0: var(${CSS_VAR_PREFIX}-easing-cache-10); ${CSS_VAR_PREFIX}-duration-multiplier-0: 1.66 } @supports not (transition-timing-function: linear(0, 1)) { .box3 { ${CSS_VAR_PREFIX}-easing-0: ease; ${CSS_VAR_PREFIX}-duration-multiplier-0: 1 } }`,
        {}
    );
});

test('uses configured fallback with cached easings', async () => {
    await run(
        `.fallback { transition-timing-function: spring-bounce(5) }`,
        `:root { ${CSS_VAR_PREFIX}-easing-cache-5: linear(0, 0.0014, 0.0053 1.02%, 0.021 2.1%, 0.0469 3.27%, 0.0844 4.57%, 0.1656 6.9%, 0.3842 12.48%, 0.4858 15.24%, 0.5839, 0.6683 21.19%, 0.7063, 0.7407 24.24%, 0.7732, 0.8022 27.44%, 0.8292, 0.853 30.77%, 0.8747 32.52%, 0.8943 34.33%, 0.9123 36.29%, 0.9282 38.32%, 0.9422 40.5%, 0.9541 42.75%, 0.9643 45.14%, 0.9731 47.76%, 0.9861 53.64%, 0.9937 60.1%, 0.998 68.44%, 0.9997 79.47%, 1.0001 99.94%) }.fallback { transition-timing-function: var(${CSS_VAR_PREFIX}-easing-0); ${CSS_VAR_PREFIX}-easing-0: var(${CSS_VAR_PREFIX}-easing-cache-5); ${CSS_VAR_PREFIX}-duration-multiplier-0: 1.66 }@supports not (transition-timing-function: linear(0, 1)) {.fallback { ${CSS_VAR_PREFIX}-easing-0: ease-out; ${CSS_VAR_PREFIX}-duration-multiplier-0: 1 } }`,
        { fallbackEasing: 'ease-out' }
    );
});

test('does not generate anything if no spring values are found', async () => {
    await run(
        `.no-spring { transition-timing-function: linear }`,
        `.no-spring { transition-timing-function: linear }`,
        {}
    );
});
