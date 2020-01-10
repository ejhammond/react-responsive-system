# 💬 Responsive System

A new way to write responsive components.

## Motivation

Check out this [post](https://tripps.tips/responsive-react-components/) to learn more about the motivation behind Responsive System.

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
  sm={{ buttonText: 'Small screen text', buttonSize: 'mini' }}
  lg={{ buttonText: 'Large screen text', buttonSize: 'large' }}
/>;
```

> Don't like HOC's? You can use the [`useResponsiveProps` hook](#useresponsiveprops-hook) instead! The HOC uses the hook behind the scenes, so you'll get the exact same behavior either way.

## Examples

[TypeScript](https://github.com/tripphamm/react-responsive-system/tree/master/examples/typescript)
[Gatsby](https://github.com/tripphamm/react-responsive-system/tree/master/examples/gatsby)

## Custom Merge Function

By default, Responsive System will apply any screen-size-specific overrides right on top of your base props, but sometimes you need more control over how your overrides are applied.

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

In this case, we might want to override the `backgroundColor` but to leave the `height` alone. But, by default the `small.style` is going to completely override the base `style` and the result on small screens will effectively be:

```jsx
// no height! Bummer...
<div style={{ backgroundColor: 'blue' }}>
```

We can fix this by providing a `function` as a prop rather than an object. The function will be invoked with the base props as an argument so that you can have full control over how the overrides are handled.

```js
<ResponsiveDiv
  style={{ height: 100, backgroundColor: 'black' }}
  small={(baseProps) => {
    return {
      ...baseProps,
      style: { ...baseProps.style, backgroundColor: 'blue' },
    };
  }}
/>
```

And voila! Your overrides are applied on your terms.

### Optimizing

Pro tip: if you've got a bunch of screen classes that all need to perform custom overrides in the same way, you can create a helper function.

```jsx
function makeOverrideFn(overrides) {
  // function that returns a function!
  return (baseProps) => {
    return {
      ...baseProps,
      style: { ...baseProps.style, ...overrides },
    };
  };
}

<ResponsiveDiv
  style={{ height: 100, backgroundColor: 'black' }}
  small={makeOverrideFn({ backgroundColor: 'blue' })}
  medium={makeOverrideFn({ backgroundColor: 'green' })}
  large={makeOverrideFn({ backgroundColor: 'purple' })}
/>;
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

> Tip: If you're using the hook with TypeScript, you may be interested in the `ResponsiveProps` type that's exported from the library. Have a look in the example folder: [here](https://github.com/tripphamm/react-responsive-system/blob/master/examples/typescript/responsiveSystem.ts#L18), [and here](https://github.com/tripphamm/react-responsive-system/blob/master/examples/typescript/componentUsingHook.tsx#L9)

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
