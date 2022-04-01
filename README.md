# 💬 Responsive System

## Motivation

Check out this [post](https://ayhota.com/blog/articles/responsive-react-components) to learn more about the motivation behind Responsive System.

## Upgrading?

Jump to the [Changelog](#changelog) for information about breaking changes and recommendations around upgrading.

## What does it look like?

```jsx
const MyResponsiveComponent() {
  const message = useResponsiveValue<string>("Your screen is big", { onSmallScreens: "Your screen is small" });
  const number = useResponsiveValue<number>(100, { onMediumScreens: 50, onSmallScreensOrSmaller: 25 });
  // don't get hung up on the "onXScreens" language; that's fully customizable!
  ...
}
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
4. [Make your components responsive](#4-make-your-components-responsive)

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

export const { ScreenClassProvider, useResponsiveValue } = createResponsiveSystem({
  breakpoints,
  defaultScreenClass: 'lg',
});
```

Let's break this down a little bit.

We're calling `createResponsiveSystem` with our own custom breakpoints, and we get back a `ScreenClassProvider` (keeps track of the current screen class), and a hook called `useResponsiveValue` (creates a value that changes based on the screen class). We also provided a `defaultScreenClass` so that Responsive System knows which screen class to use when it can't find a `window` to measure (e.g. during SSR or headless testing). We immediately export everything so that we can import it across our app.

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

### 4. Make your components responsive

#### a. `useResponsiveValue`

Now that the app is aware of the current screen class, we can declare values that dynamically change to fit any screen!

```js
const MyResponsiveComponent() {
  const message = useResponsiveValue<string>("Your screen is big", { sm: "Your screen is small" });
  const number = useResponsiveValue<number>(100, { md: 50, sm: 25, xs: 5 });
  // ...
}
```

The first param is the default value (used when there are no applicable overrides) and the second param specifies the overrides. Check out the [Cascading](#cascading) section to see how you can customize the behavior of these overrides.

## Examples

[TypeScript + Parcel](https://github.com/ejhammond/react-responsive-system/tree/master/examples/typescript)

## Cascading

By default, Responsive System overrides do not cascade, which is to say: if you add an override for screen class `X`, those overrides will only be applied when the user's browser/device matches screen class `X`. But in some cases, you might want to apply overrides on `X` and also anything larger/smaller than `X`.

This is where `cascadeMode` comes in.

> Our examples here will use 5 screen classes (`xl` > `lg` > `md` > `sm` > `xs`)

### No Cascade

This is the default configuration. There is no implicit overriding in this mode.

```js
const number = useResponsiveValue('default', { md: 'overridden' });
```

Result:

- xl: "default"
- lg: "default"
- md: "overridden"
- sm: "default"
- xs: "default"

### Desktop First

In Desktop First mode, your overrides implicitly override everything smaller. Conceptually, you are specifying your default values for your largest screen class, and then making tweaks once the screen starts to get too small.

```js
const number = useResponsiveValue('default', { md: 'overridden' });
```

Result:

- xl: "default"
- lg: "default"
- md: "overridden"
- sm: "overridden"
- xs: "overridden"

### Mobile First

In Mobile First mode, your overrides implicitly override everything larger. Conceptually, you are specifying your default values for your smallest screen class, and then making tweaks once the screen starts to get big enough.

```js
const number = useResponsiveValue('default', { md: 'overridden' });
```

Result:

- xl: "overridden"
- lg: "overridden"
- md: "overridden"
- sm: "default"
- xs: "default"

### Enabling a `cascadeMode`

If you'd like to enable desktop/mobile-first cascading, you can pass the `cascadeMode` option to `createResponsiveSystem`.

```js
export const { ScreenClassProvider, useResponsiveValue } = createResponsiveSystem({
  breakpoints,
  defaultScreenClass: 'lg',
  cascadeMode: 'mobile-first', // or "desktop-first"
});
```

## Goodies

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
  // screenClass will be a string representation of one of your breakpoints e.g. "xs", "mobile", etc.
  // ...
};
```

## Server-Side Rendering

If `react-responsive-system` cannot access the `window`, it will use the `defaultScreenClass` that you set in the configuration object. When the code is re-hydrated on the client, it will adjust to the actual screen class.

## Under the Hood

For folks who are curious about the implementation:

Fundamentally, we need our components to be aware of the current screen class so they know when to re-render. We do this by constructing Media Queries from your breakpoints and using `window.matchMedia` to observe changes, then we _provide_ the current screen class to components via React Context. This should only trigger a re-render when the screen class actually changes, and not during resizing events within the same screen class.

## Changelog

Responsive System uses strict Semantic Versioning which means that our version numbers carry extra meaning. Then general form is:

`v{major}.{minor}.{patch}`

- `patch` - if this number changes, then we've shipped a bug fix or small tweak
- `minor` - if this number changes, then we've shipped a new feature that's backwards compatible
- `major` - if this number changes, then we've shipped a change that's not backwards compatible so be careful when upgrading!

Also, in order to support rapid development at the start of a project, v0.X.X versions are handled slightly differently:

`v0.{major}.{minor}`

So the middle number actually represents a major breaking change for v0 versions. That's important to keep in mind so that you don't accidentally upgrade to a version that's not compatible with your existing code!

In this section, we'll cover those major changes so that folks can decide whether or not they want to update.

### v0.9

There are significant breaking changes between the 0.8.X and 0.9.X lines. With that said, the 0.8.X line went for 2+ years with no major changes and is quite stable, so there's really not much reason to upgrade if it's working for your project!

The reason that we haven't moved to 1.0 yet is that the API just hasn't felt quite right. It was a bit clunky and there were a few hacks behind the scenes to get it to work the way that we wanted it to work. 0.9 eliminates those hacks, improves the performance, and generally gets much closer to what we feel could be worthy of 1.0; the downside is that we needed to make some fundamental (breaking) changes.

So what changed?

In 0.9 we moved away from the HOC `responsive(Component)` approach and adopted a streamlined hook-based approach. The hook-based approach is much smaller (in terms of bytes) and much lighter in the sense that we no longer modify your components "magically". Fundamentally, we've shifted from wrapping entire components to make them responsive to wrapping individual values/variables.

```js
// 0.8.X
const ResponsiveCarousel = responsive(Carousel);

<ResponsiveCarousel slidesToShow={4} onSmallScreens={{ slidesToShow: 2 }} />;

// 0.9.X
const responsiveSlidesToShow = useResponsiveValue(4, { onSmallScreens: 2 });

<Carousel slidesToShow={responsiveSlidesToShow} />;
```

It's quite difficult to gather community feedback for a change like this, but we're very interested to hear how y'all feel about the change. Did you love the old API? Should we continue to support it? Do you have a use case where the new API falls short? Feel free to reach out on Twitter (@ejhammond) or to file an issue to start a discussion!
