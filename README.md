# 💬 Responsive System

## Motivation

Check out this [post](https://ayhota.com/blog/responsive-react-components/) to learn more about the motivation behind Responsive System.

## Sneak Peek

```jsx
// works with _any_ component at all
import { Button } from '@material-ui/core/Button';

// just pass the component to the `responsive` util
// all of your screen classes are added as props
// and the overrides will be handled automatically
const ResponsiveButton = responsive(Button);

<ResponsiveButton
  color="primary",
  variant="outlined",
  marginTop="2em",
  small={{
    // overrides applied on "small" screens
    marginTop: "1em",
    fullWidth: true,
  }}
/>
```

## Getting Started

```bash
# npm
npm install react-responsive-system

# yarn
yarn add react-responsive-system
```

1. [Define your breakpoints in JS](#1-define-your-breakpoints-in-js)
2. [Generate your custom Responsive System with `createResponsiveSystem`](#2-generate-your-custom-responsive-system-with-createresponsivesystem)
3. [Render the ScreenClassProvider near the root of your app](#3-render-the-screenclassprovider-near-the-root-of-your-app)
4. [Wrap your comps with `responsive`](#4-wrap-your-comps-with-responsive)

### 1. Define your breakpoints in JS

To keep things organized, folks often create a new file called `responsiveSystem.js/ts` where they'll configure Responsive System.

But, no matter where you choose to keep the configuration, the first step is to define your breakpoints in JS:

```js
/* responsiveSystem.js/ts */

const breakpoints = {
  xs: 500, // 0 - 500px -> "xs"
  sm: 750, // 501 - 750px -> "sm"
  md: 1000, // 751 - 1000px -> "md"
  lg: Infinity, // 1001+ -> "lg"
};
```

> Tip: Each key in this object will become a prop on your components--watch out for naming conflicts!

The values that you provide are the "maximum pixel-widths" for that screen class. In order to make sure that all possible screen pixel-sizes are handled, there should be exactly one screen class with a value of `Infinity` which tells us that there is no maximum pixel-width for that screen class.

### 2. Generate your custom Responsive System with `createResponsiveSystem`

Here, you'll configure ResponsiveSystem with your breakpoints.

```js
/* responsiveSystem.js/ts */

import { createResponsiveSystem } from 'react-responsive-system';

const breakpoints = {
  // your breakpoints here
};

export const { ScreenClassProvider, responsive } = createResponsiveSystem({
  breakpoints,
  defaultScreenClass: 'lg',
});
```

Let's break this down a little bit.

We're calling `createResponsiveSystem` with our own custom breakpoints, and we get back a `ScreenClassProvider` (keeps track of the current screen class) and a function called `responsive` (makes your components responsive). We also provided a `defaultScreenClass` so that Responsive System knows which screen class to use when it can't find a `window` to measure (e.g. during SSR or headless testing). We immediately export both `ScreenClassProvider` and `responsive` so that we can use them across our app.

### 3. Render the ScreenClassProvider near the root of your app

```js
/* index.jsx/tsx */

import { ScreenClassProvider } from './responsiveSystem';

ReactDOM.render(
  <ScreenClassProvider>
    <App />
  </ScreenClassProvider>,
  document.getElementById('root'),
);
```

### 4. Wrap your comps with `responsive`

Now, whenever you come across a situation where a component needs to use different props depending on the screen class, just wrap the component in the `responsive` Higher-Order Component (HOC) and it will instantly understand your responsive props!

```js
import { responsive } from '../responsiveSystem';
import Button from './components/Button';

const ResponsiveButton = responsive(Button);

// now you can use any of the props from Button
// AND you get extra props based on your breakpoints
<ResponsiveButton
  onClick={() => alert('Clicked!')}
  xs={{ onClick: () => alert('Clicked on an extra small screen!') }}
/>;
```

If you want your component to be responsive all the time, you can export the responsive version rather than wrapping it each time.

```jsx
// your-app/components/Button.js

import { responsive } from '../responsiveSystem';

const Button = props => {
  const { buttonSize, buttonType, buttonText } = props;

  // return <button>...
};

// just add responsive() around your export
export responsive(Button);
```

And now it will be responsive everywhere you use it!

```jsx
// already responsive!
import Button from './components/Button';

<Button
  buttonText="Default text"
  sm={{ buttonText: 'Small screen text', buttonSize: 'large' }}
  lg={{ buttonText: 'Large screen text', buttonSize: 'normal' }}
/>;
```

> Don't like HOC's? You can use the [`useResponsiveProps` hook](#useresponsiveprops-hook) instead! The HOC uses the hook behind the scenes, so you'll get the exact same behavior either way.

## Examples

[TypeScript](https://github.com/ejhammond/react-responsive-system/tree/master/examples/typescript)
[Gatsby](https://github.com/ejhammond/react-responsive-system/tree/master/examples/gatsby)

## Cascading

By default, Responsive System overrides do not cascade, which is to say: if you add an override for screen class `X`, those overrides will only be applied when the user's browser/device matches screen class `X`. But in some cases, you might want to apply overrides on `X` and also anything larger/smaller than `X`.

This is where `cascadeMode` comes in.

Let's take an example. We'll assume that we have 4 screen classes, "xs", "sm", "md", and "lg" and that we have a `Button` component that can be either `normal` or `large`. On most screen sizes, we want our button to be `normal` size, but on `xs` screens (like mobile phones) we want to make the button nice and big so that it's easier to tap.

There are 2 ways that you can do this with the default configuration of Responsive System:

```jsx
<Button
  // default is "normal"
  buttonSize="normal"
  // override on xs screens
  xs={{ buttonSize: 'large' }}
/>
```

This approach is called "desktop-first" because the default values pertain to larger screens, and we provide overrides for smaller screens.

We could also write this in a "mobile-first" way like this:

```jsx
<Button
  // default to "large"
  buttonSize="large"
  // override on sm, md, and lg screens
  sm={{ buttonSize: 'normal' }}
  md={{ buttonSize: 'normal' }}
  lg={{ buttonSize: 'normal' }}
/>
```

In this particular case, the "desktop-first" approach is shorter and easier to understand, but sometimes the reverse will be true. Using the default `cascadeMode` ("no-cascade") allows you to choose which approach works best on a case-by-case basis. You pick your default values and then apply overrides for any screen sizes that need special treatment.

For folks who find value in having a consistent "desktop-first" or "mobile-first" approach throughout their apps, we also provide `cascadeMode = "desktop-first"` and `cascadeMode = "mobile-first"`. In these modes, you always provide default values for either your largest screen class ("desktop-first") or your smallest ("mobile-first") and your overrides will _cascade_.

Going back to our example, if we had used `cascadeMode = "desktop-first"` we would still write:

```jsx
<Button
  // desktop-first default value
  buttonSize="normal"
  // override on xs screens AND anything smaller
  xs={{ buttonSize: 'large' }}
/>
```

The desktop-first cascade would automatically add our overrides on any screen classes smaller that `xs`, but no such screen classes exist, so the cascade doesn't come into play here.

On the other hand, if we had used `cascadeMode = "mobile-first"`, we could take advantage of the mobile-first cascade:

```jsx
<Button
  // mobile-first default value
  buttonSize="large"
  // override on sm AND anything larger
  sm={{ buttonSize: 'normal' }}
/>
```

The mobile-first cascade says "apply these overrides on _this_ screen class _and_ any larger screen classes too".

Put another way:

- "no-cascade" - `sm` overrides apply only on `sm` screens
- "desktop-first" - `sm` overrides apply on `sm` and `xs` screens
- "mobile-first" - `sm` overrides apply on `sm`, `md`, and `lg`

If you'd like to enable desktop/mobile-first cascading, you can pass the `cascadeMode` option to `createResponsiveSystem`.

```js
export const { ScreenClassProvider, responsive } = createResponsiveSystem({
  breakpoints,
  defaultScreenClass: 'lg',
  cascadeMode: 'mobile-first', // or "desktop-first"
});
```

### Merging

Overrides are applied via [deepmerge](https://www.npmjs.com/package/deepmerge) which means that you can easily apply overrides in arbitrarily-nested objects.

Let's say you've got a component that accepts an `object` as a prop. The intrinsic `style` prop is a great example!

```jsx
// component accepts an object as a prop
<div style={{ height: 100, backgroundColor: 'black' }}>
```

We can make a `div` responsive with Responsive System:

```js
const ResponsiveDiv = responsive('div');
```

And we can override the style on `small` screens.

```jsx
<ResponsiveDiv
  style={{ height: 100, backgroundColor: 'black' }}
  small={{ style: { backgroundColor: 'blue' } }}
/>
```

A naive override algorithm would simply replace the base `style` with `small.style` and the result would be `style = { backgroundColor: 'blue' }`.

However, by utilizing `deepmerge` we get `style = { height: 100, backgroundColor: 'blue' }` which is what we'd expect.

#### Arrays

Merging arrays is tricky, but we've chosen a method that seems like a sane default. If there's a need for customization of the array-merge algorithm, we could support that in a future release.

For now, the behavior is to treat them like we treat objects. That is, if the base array defines an item at `[0]` and the override array defines an item at `[0]`, the `override[0]` will be merged on top of `base[0]`. Here are a few examples:

```txt
base     [1, 2, 3, 4]
override [5, 6, 7]
result   [5, 6, 7, 4]
```

```txt
base     [1, 2, 3]
override [5, 6, 7, 8]
result   [5, 6, 7, 8]
```

Objects inside of an array are merged too! Objects and arrays can be nested arbitrarily deep, but keep in mind that merging deeply-nested structures will require our merge algorithm to do more work which could impact performance. It's best to keep your props as shallow as possible.

```txt
base     [{ a: 'alpha' }, 1]
override [{ b: 'bravo' }, 2]
result   [{ a: 'alpha', b: 'bravo' }, 2]
```

## Goodies

### `useResponsiveProps` Hook

The `responsive` HOC takes your component, calls this React hook, and then returns your component with the proper screen-class-based props. If you're using the `responsive` HOC, then you don't need to worry about this hook at all, but if you prefer to use the hook directly, feel free!

```jsx
/* responsiveSystem.js/ts */

...

export const {
  ScreenClassProvider,
  useResponsiveProps, // export the hook
} = createResponsiveSystem(...);

/* button.js/ts */

import { useResponsiveProps } from '../responsiveSystem';

const Button = props => {
  // wrap your props
  // const { buttonSize, buttonType, buttonText } = props;
  const { buttonSize, buttonType, buttonText } = useResponsiveProps(props);

  // return ...
};
```

`useResponsiveProps` takes in a `props` that contains your screen class overrides, and it will return a clean `props` that matches your component's existing API.

> Tip: If you're using the hook with TypeScript, you may be interested in the `ResponsiveProps` type that's exported from the library. Have a look in the example folder: [here](https://github.com/ejhammond/react-responsive-system/blob/master/examples/typescript/responsiveSystem.ts#L18), [and here](https://github.com/ejhammond/react-responsive-system/blob/master/examples/typescript/componentUsingHook.tsx#L9)

### `useScreenClass` Hook

Want direct access to the screen class itself? Sure! We're already providing it via context, so here's a hook to get the raw value for your own purposes!

```jsx
/* responsiveSystem.js/ts */

// ...

export const {
  ScreenClassProvider,
  responsive,
  useScreenClass, // export the hook
} = createResponsiveSystem(...);

/* button.js/ts */

import { useScreenClass } from '../responsiveSystem';

const Button = props => {
  const screenClass = useScreenClass();
  // screenClass be a string representation of one of your breakpoints e.g. "xs", "mobile", etc.

  // return ...
};
```

## Server-Side Rendering

If `react-responsive-system` cannot access the `window`, it will use the `defaultScreenClass` that you set in the configuration object. When the code is re-hydrated on the client, it will adjust to the actual screen class.

## Under the Hood

For folks who are curious about the implementation:

Fundamentally, we need our components to be aware of the current screen class so they know when to re-render. We do this by constructing Media Queries from your breakpoints and using `window.matchMedia` to observe changes, then we _provide_ the current screen class to components via React Context. This should only trigger a re-render when the screen class actually changes, and not during resizing events within the same screen class.
