# 💬 Responsive System

A new way to write responsive components.

## Quick Start

If you're in a hurry, you can jump to [Getting Started](#getting-started)!

## The Problem

Let's say that you have a `Carousel` component that has a prop called `slidesToShow`.

You need to decide which value to select for this prop, but you quickly realize that the answer is different depending on how wide the screen is. You might want to show 4 slides on large screens, but only 2 slides on medium screens, and probably only 1 on a small, phone-sized device.

![Carousel sizes](https://github.com/tripphamm/react-responsive-system/blob/master/readme-images/carousel-sizes.png)

How can we make that work?

Well, the first step is to decide exactly what we mean by "large", "medium", and "small". We need to decide the exact window-widths where we switch from one to the next. Commonly, these specific widths are called _breakpoints_ and the ranges themselves ("large", "medium", "small") are called _screen classes_.

You probably knew that. In fact, your website/app probably already has a set of breakpoints and screen classes defined in its CSS. In the world of modern web development, we strive to make our websites _responsive_ so that they look good on any screen size, and defining your screen classes in CSS is often the first step toward making a responsive website.

But... `slidesToShow` is not a CSS style, it's a property of a React component and it lives in a `.js` file. We can't add a CSS rule that changes `slidesToShow` depending on the screen class. To overcome this limitation, folks often write a CSS rule that shows/hides an element based on the screen class.

Let's play that out.

```jsx
<Carousel
  slidesToShow={4}
  className="hidden-on-medium-screens hidden-on-small-screens"
/>
<Carousel
  slidesToShow={2}
  className="hidden-on-large-screens hidden-on-small-screens"
/>
<Carousel
  slidesToShow={1}
  className="hidden-on-large-screens hidden-on-medium-screens"
/>
```

Oof. There are a few problems here. The first one is that we're actually shipping a lot of extra HTML/JS to our users; rather than a single `Carousel`, we're sending 3 `Carousel`s each with different props. The second issue is that this pattern is going to be really hard to maintain; having duplicate (triplicate) components all over your codebase is gonna make your code hard to read and it's error-prone.

We could solve the first issue by trying to detect the user's screen size before we send them the code, and then choosing the proper `Carousel` based on that info. But it turns out that detecting screen size is tougher than it sounds, and--besides--what if the user resizes their browser after you've made your decision?

## Solution

Let's take a step back. We assumed that we needed to use CSS to change this prop, but that's actually not the case. If our Javascript was aware of the current screen class, then we'd know when to change the prop, and we wouldn't have to rely CSS at all!

Once our JS is aware of the screen class, we can write something like this instead:

```jsx
<Carousel
  slidesToShow={1} // default to 1 slide
  medium={{ slidesToShow: 2 }} // override props on `medium` screens
  large={{ slidesToShow: 4 }} // override props on `large` screens
/>
```

One component. No server-side screen-size detection. Easy to read/maintain.

The idea is: whenever you have a component that needs to render differently on different screen classes, you give it some extra props that correspond to your screen classes. Any values that you pass will be applied as overrides when the screen reaches the appropriate size!

## Responsive System

Here's where Responsive System comes in. We're trying to make it as easy as possible to use this pattern.

We'll cover the set-up instructions in the next section, but here's a sneak-peek at how easy it will be to add this responsive functionality to an existing component:

```jsx
import { Button } from '@material-ui/core/Button';

// just pass your component to the `responsive` util
// all of your screen classes are added as props
// and the overrides will be handled automatically
const ResponsiveButton = responsive(Button);

<ResponsiveButton
  color="primary",
  variant="outlined",
  marginTop="2em",
  small={{
    marginTop: "1em",
    fullWidth: true,
  }}
/>
```

## Getting Started

```bash
# npm
npm install react-responsive-system

#yarn
yarn add react-responsive-system
```

1. [Define your breakpoints in JS](#1-define-your-breakpoints-in-js)
2. [Generate your custom Responsive System with `createResponsiveSystem`](#2-generate-your-custom-responsive-system-with-createresponsivesystem)
3. [Render the ScreenClassProvider near the root of your app](#3-render-the-screenclassprovider-near-the-root-of-your-app)
4. [Wrap your comps with `responsive`](#4-wrap-your-comps-with-responsive)

### 1. Define your breakpoints in JS

To keep things organized, folks often create a new file called `responsiveSystem.js/ts` where they'll configure Responsive System.

No matter where you choose to keep the configuration, the first step is to define your breakpoints in JS:

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

Let's break this down a little bit. We're calling `createResponsiveSystem` with our own custom breakpoints, and it returns us a `ScreenClassProvider` (keeps track of the current screen class) and a function called `responsive` (makes your components responsive). We also provided a `defaultScreenClass` so that Responsive System knows which screen class to use when it can't find a `window` to measure (e.g. during SSR or headless testing). We immediately export both `ScreenClassProvider` and `responsive` so that we can use them across our app.

### 3. Render the ScreenClassProvider near the root of your app

```js
/* index.jsx/tsx */

import { ScreenClassProvider } from './responsiveSystem';

ReactDOM.render(
  <ScreenClassProvider>
    <App />
  </ScreenClassProvider>,
  document.getElementById('root')
);
```

### 4. Wrap your comps with `responsive`

Now, whenever you come across a situation where a component needs to use different props depending on the screen class, just wrap the component in the `responsive` Higher-Order Component (HOC) and it will instantly understand your responsive props!

```js
import { responsive } from '../responsiveSystem';

const Button = props => {
  const { buttonSize, buttonType, buttonText } = props;

  // return ...
};

export responsive(Button);
```

And then when you use it, each key from your `breakpoints` will be a valid prop!

```jsx
<Button
  buttonText="Default text"
  sm={{ buttonText: 'Small screen text', buttonSize: 'mini' }}
  lg={{ buttonText: 'Large screen text', buttonSize: 'large' }}
/>
```

Don't like HOC's? You can use the [`useResponsiveProps` hook](#useresponsiveprops-hook) instead! The HOC uses the hook behind the scenes, so you'll get the exact same behavior either way.

[See a full example on GitHub](https://github.com/tripphamm/react-responsive-system/tree/master/example)

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

> Tip: If you're using the hook with TypeScript, you may be interested in the `ResponsiveProps` type that's exported from the library. Have a look in the example folder: [here](https://github.com/tripphamm/react-responsive-system/blob/master/example/responsiveSystem.ts#L22), [and here](https://github.com/tripphamm/react-responsive-system/blob/master/example/componentUsingHook.tsx#L9)

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
