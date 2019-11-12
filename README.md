# Responsive System

A new way to write responsive components.

Your app/website needs to handle different "classes" of screens. CSS can help to apply different styles for different screen classes, but why stop at styles?

Let's say that you have a `Carousel` component that has a prop called `slidesToShow`.

You might want to show 4 slides on large screens, but only 2 slides on smallish screens, and probably only 1 on a phone-sized device.

What if you could just write:

```jsx
<Carousel
  slidesToShow={4} // default to 4 slides
  phone={{ slidesToShow: 1 }} // override props on `phone`s
  smallishScreen={{ slidesToShow: 2 }} // override props on `smallishScreen`s
/>
```

The idea is: each of your components could have props that correspond to your own custom screen classes (maybe that's `mobile` and `desktop`, or maybe `sm`, `md`, `lg`). These props would contain any overrides that you want to apply to the component based on the screen class.

In the example above, we have a screen class called `phone` and when we're on a `phone`-sized screen, we override the `Carousel`s props so that only 1 slide is shown! No conditional logic, no showing/hiding/swapping components, just a prop.

Here's another example:

```jsx
import { Button } from '@material-ui/core/Button';

const ResponsiveButton = responsive(Button);

<ResponsiveButton
  color="primary",
  variant="outlined",
  marginTop="2em",
  xs={{
    marginTop: "1em",
    fullWidth: true,
  }}
/>
```

No matter what props your component has, you can make them responsive with Responsive System, and the best part is: you can add this functionality to any component in a snap!

## Getting Started

1. [Define your breakpoints in JS](#1-define-your-breakpoints-in-JS)
2. [Generate your custom Responsive System with `createResponsiveSystem`](#2-generate-your-custom-responsive-system-with-createresponsivesystem)
3. [Render the ScreenClassProvider near the root of your app](#3-render-the-screenclassprovider-near-the-root-of-your-app)
4. [Wrap your comps with `responsive`](#4-wrap-your-comps-with-responsive)

### 1. Define your breakpoints in JS

```js
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

Create a new file (recommended, but not required) called `responsiveSystem.js/ts` and configure the lib:

```js
/* responsiveSystem.js/ts */
import { createResponsiveSystem } from 'react-responsive-system';

const breakpoints = {
  // your breakpoints here
};

// generate the ResponsiveSystem pieces, and export them to be used throughout your app
export const {
  ScreenClassProvider, // React Context Provider that supplies the current screen class to your comps
  responsive, // wraps your component to make it responsive
} = createResponsiveSystem({
  breakpoints,
  // this is the screenClass that will be used if we can't determine the width of the window (e.g. during SSR)
  defaultScreenClass: 'lg',
});
```

### 3. Render the ScreenClassProvider near the root of your app

```js
/* index.jsx/tsx */
import { ScreenClassProvider } from './responsiveSystem';

// render the ScreenClassProvider at (or near) the root of your app
ReactDOM.render(
  <ScreenClassProvider>
    <App />
  </ScreenClassProvider>,
  document.getElementById('root')
);
```

### 4. Wrap your comps with `responsive`

Just wrap your comp in the `responsive` Higher-Order Component (HOC) and it will instantly understand your responsive props.

```js
import { responsive } from '../responsiveSystem';

// before
const Button = props => {
  const { buttonSize, buttonType, buttonText } = props;

  // return ...
};

export responsive(Button);
```

Don't like HOC's? You can use the [`useResponsiveProps` hook](#useResponsiveProps-hook)instead! The HOC uses the hook behind the scenes, so you'll get the exact same behavior either way.

### Profit?

You can now start adding Responsive System props to your component. Each key from your `breakpoints` will be a valid prop!

```jsx
<Button
  buttonText="Default text"
  sm={{ buttonText: 'Small screen text', buttonSize: 'mini' }}
  lg={{ buttonText: 'Large screen text', buttonSize: 'large' }}
/>
```

[See an example on GitHub](https://github.com/tripphamm/react-responsive-system/tree/master/example)

## Goodies

### `useResponsiveProps` Hook

The `responsive` HOC takes your component, calls this React hook, and then returns your component with the proper screen-class-based props.

If you prefer to use the hook directly, you can do that too!

```diff
/* responsiveSystem.js/ts */

// ... define breakpoints etc.

export const {
  ScreenClassProvider,
+ useResponsiveProps,
} = createResponsiveSystem(...);

/* button.js/ts */

+ import { useResponsiveProps } from '../responsiveSystem';

// before
const Button = props => {
- const { buttonSize, buttonType, buttonText } = props;
+ const { buttonSize, buttonType, buttonText } = useResponsiveProps(props);

  // return ...
};
```

> Tip: If you're using the hook with TypeScript, you may be interested in the `ResponsiveProps` type that's exported from the library. Have a look in the example folder, [here](https://github.com/tripphamm/react-responsive-system/blob/master/example/responsiveSystem.ts#L22) [and here](https://github.com/tripphamm/react-responsive-system/blob/master/example/componentUsingHook.tsx#L9)

### `useScreenClass` Hook

Want direct access to the screen class itself? Sure! We're already providing it via context, so here's a hook to get the raw value for your own purposes!

```diff
/* responsiveSystem.js/ts */

// ...

export const {
  ScreenClassProvider,
  responsive,
+ useScreenClass,
} = createResponsiveSystem(...);

/* button.js/ts */

+ import { useScreenClass } from '../responsiveSystem';

// after
const Button = props => {
+ const screenClass = useScreenClass(); // e.g. "xs"/"sm"/"md" - it'll be a string representation of one of your breakpoints

  // return ...
};
```

## Server-Side Rendering

If `react-responsive-system` cannot access the `window`, it will use the `defaultScreenClass` that you set in the configuration object. When the code is re-hydrated on the client, it will adjust to the actual screen class.

## Under the Hood

For folks who are curious about the implementation:

Fundamentally, we need our components to be aware of the current screen class so they know when to re-render. We do this by constructing Media Queries from your breakpoints and using `window.matchMedia` to observe changes, then we _provide_ the current screen class to components via React Context. This should only trigger a re-render when the screen class actually changes, and not during resizing events within the same screen class.
