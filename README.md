# PostCSS Spring

A PostCSS plugin that adds spring easings using CSS `linear()`, making it easy to incorporate spring animations into your project.
Define just **two parameters** and let the plugin do the rest.

**Input:**

```css
.my-box {
    transition: transform spring-duration(200) spring-bounce(30);
}
```

**Output (simplified):**

```css
.my-box {
    transition: transform calc(200ms * 1.66) linear(...);
}
```

**Disclaimer:** Credits goes to [Kevin Grajeda](https://github.com/KevinGrajeda) and [Jake Archibald](https://github.com/jakearchibald/). This Plugin is a port of Kevin's `tailwindcss-spring` plugin to PostCSS.

## Additional Features

-   **Fallback support** for the `linear()` function in older browsers. You can configure the `fallbackEasing` in the plugins options. The default is `ease`.
-   **`linear()` function caching**. Reuse generated values for the same bounce values to keep the css as small as possible.

## Installation

```bash
npm i -D postcss-spring
```

And add it to your PostCSS configuration.

```js
module.exports = {
    plugins: [require('postcss-spring')],
};
```

## Usage

This plugin uses a two-parameter approach to define spring easings: **bounce** and **perceptual duration**. For more informations i recommend reading [Effortless UI Spring Animations](https://www.kvin.me/posts/effortless-ui-spring-animations).

This plugin adds two functions to your CSS: `spring-bounce()` and `spring-duration()`. You can use them to define your spring easings. The `spring-bounce` function returns the generated `linear()` value and adds a duration multiplier via css variables wich then is picked up by the `spring-duration` function.

Here is a basic example:

```css
.my-box {
    transition: transform spring-duration(200) spring-bounce(30);
}
```

It also works with animations:

```css
.my-box {
    animation: my-animation spring-duration(200) spring-bounce(30);
}
```

You could also use different values in the same declaration like this:

```css
.my-box {
    transition: transform spring-duration(200) spring-bounce(0), scale spring-duration(400) spring-bounce(70);
}
```

or like this:

```css
.my-box {
    transition-duration: spring-duration(200), spring-duration(200);
    transition-property: transform, scale;
    transition-timing-function: spring-bounce(0), spring-bounce(70);
}
```

_Note that we still need to declare the same spring-duration multiple times, so it can correctly pick up the generated duration multiplier of the related ease. Otherwise the transition would be off._

## JavaScript Usage

For advanced usage we also expose the `generateSpring` function from `postcss-spring/runtime`. You can use it to generate the linear easing and the duration multiplier and use it then like you want.

```js
import { generateSpring } from 'postcss-spring/runtime';

const { durationMultiplier, ease } = generateSpring(20);
```
