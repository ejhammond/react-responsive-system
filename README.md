# 💬 Responsive System

A tiny (yet powerful) system for when CSS media queries aren't enough.

![gzip size](https://badgen.net/bundlephobia/minzip/react-responsive-system) ![weekly npm downloads](https://badgen.net/npm/dw/react-responsive-system) ![typescript types included](https://badgen.net/npm/types/react-responsive-system)

## Why?

CSS media queries are great for dynamically changing _styles_ based on screen size, but sometimes you need _JavaScript values_ to respond to screen-size changes as well.

Check out [this blog post](https://ayhota.com/blog/articles/responsive-react-components) for a deeper dive into the problem space!

## How?

Whenever you have a variable that should change its value based on the size of the screen, you use `useResponsiveValue(defaultValue, overrides)`. The `overrides` are based on your own custom screen sizes and names; this example uses the names "small", "medium", and "large".

```jsx
const MyResponsiveComponent() {
  const message = useResponsiveValue(
    "Your screen is big", // default value
    { small: "Your screen is small" } // override on "small" screens
  );
  // works with any type of value
  const number = useResponsiveValue(
    100,
    { large: 50, medium: 25 }
  );
  ...
}
```

## Setup

0. [Install](#0-install)
1. [Define your breakpoints](#1-define-your-breakpoints)
2. [Initialize the system](#2-initialize-the-system)
3. [Render the Provider](#3-render-the-provider)
4. [Use the Hook](#4-use-the-hook)

### 0. Install

```bash
# npm
npm install react-responsive-system

# yarn
yarn add react-responsive-system
```

### 1. Define your breakpoints

> Tip: to keep things organized, folks often create a new file called `responsiveSystem.js/ts` where they'll configure Responsive System.

The first step is to define your breakpoints. If you're not sure which values to use, the set of breakpoints in our example is a reasonable default.

```js
/* responsiveSystem.js/ts */

const breakpoints = {
  // --name them whatever you want--
  sm: 600, // 0 - 600px -> "sm" (phones)
  md: 1200, // 601 - 1200 -> "md" (tablets)
  lg: Infinity, // 1201+ -> "lg" (laptops/desktops)
  // --have as many as you'd like--
};
```

The values that you provide are the maximum pixel-widths for each named screen-size range ("screen class"). In order to make sure that all possible screen sizes are covered, there should be exactly one screen class with a maximum pixel-width of `Infinity`.

### 2. Initialize the system

```js
/* responsiveSystem.js/ts */

import { createResponsiveSystem } from 'react-responsive-system';

const breakpoints = {
  // your breakpoints here
};

const { ScreenClassProvider, useResponsiveValue } = createResponsiveSystem({
  breakpoints,
});

export { ScreenClassProvider, useResponsiveValue };
```

We call `createResponsiveSystem` with our own custom breakpoints, and we get back a `ScreenClassProvider` (keeps track of the current screen class), and a hook called `useResponsiveValue` (creates a value that changes based on the screen class).

### 3. Render the Provider

Somewhere near the root of your app, add the `ScreenClassProvider`. This component keeps track of the screen size and provides it to the rest of the app.

```jsx
/* index.jsx/tsx */

import { ScreenClassProvider } from './responsiveSystem';

ReactDOM.render(
  <ScreenClassProvider>
    <App />
  </ScreenClassProvider>,
  document.getElementById('root'),
);
```

### 4. Use the Hook

Now that the app is aware of the current screen class, we can declare values that dynamically change to fit any screen!

```jsx
function ImageGallery() {
  const imagesToShow = useResponsiveValue(
    4 // show 4 images by default
    {
      md: 2, // on medium screens, show 2
      sm: 1, // on small screens, only show 1
    }
  );
  return <Gallery imagesToShow={imagesToShow} />
}
```

The first param is the default value (used when there are no applicable overrides) and the second param specifies the overrides. Check out the [Cascading](#cascading) section to see how you can customize the behavior of these overrides.

## Cascading

By default, Responsive System overrides do not cascade, which is to say: if you add an override for screen class `X`, those overrides will only be applied when the user's screen matches `X` _exactly_. But in some cases, you might want to apply overrides on `X` and also implicitly on some of your other screen classes.

This is where `cascadeMode` comes in.

> Our examples here will use 5 screen classes (`xl` > `lg` > `md` > `sm` > `xs`)

### No Cascade

This is the default configuration. There is no implicit overriding in this mode.

```js
const number = useResponsiveValue('default', { md: 'medium' });
```

Results on different screen sizes:

- xl: "default"
- lg: "default"
- md: "overridden"
- sm: "default"
- xs: "default"

### Desktop First

In Desktop First mode, your overrides implicitly apply to everything smaller. Conceptually, you are specifying your default values for your largest screen class, and then making tweaks once the screen starts to get too small.

```js
const number = useResponsiveValue('default', { md: 'overridden' });
```

Results on different screen sizes:

- xl: "default"
- lg: "default"
- md: "overridden"
- sm: "overridden"
- xs: "overridden"

### Mobile First

In Mobile First mode, your overrides implicitly apply to everything larger. Conceptually, you are specifying your default values for your smallest screen class, and then making tweaks once the screen starts to get big enough.

```js
const number = useResponsiveValue('default', { md: 'overridden' });
```

Results on different screen sizes:

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
  cascadeMode: 'mobile-first', // or "desktop-first"
});
```

## Examples

[TypeScript + Parcel](https://github.com/ejhammond/react-responsive-system/tree/master/examples/typescript)

## Server-Side Rendering

Server-Side rendering is a bit tricky because when we're on the server we don't have direct access to the user's screen. Since we can't determine the screen class automatically, you must "manually" provide an `initialScreenClass` for Responsive System to render.

```js
export const { ScreenClassProvider, useResponsiveValue } = createResponsiveSystem({
  breakpoints,
  initialScreenClass: 'lg', // only add this if you're doing Server-Side Rendering
});
```

Now here's the downside: if you guess the initial screen class incorrectly, your users may see a quick flash of the wrong content before React kicks in (hydrates the app) and adjusts to the proper screen class. In order to avoid that experience, you have a few options:

### Don't SSR

If you're reading this section, you're probably already committed to server-side rendering your app, but I'll mention it anyway: if you don't SSR, then you don't have to worry about manually figuring out the initial screen class. We can figure it out for you and we can make sure that there's no flash of an incorrect screen class.

### Client-Only Components

You can render some placeholder content (like a spinner/skeleton/glimmer) during SSR and then render the correct content once the code gets to the client. Showing a loading experience is better than showing incorrect/broken content and then shifting it.

Here's a quick implementation that shows how to detect whether you're rendering on the server or the client.

```jsx
function ClientOnly({ placeholder, children }) {
  const [isOnClient, setIsOnClient] = useState(false);
  useEffect(() => {
    setIsOnClient(true);
  }, []);
  return isOnClient ? children : placeholder;
}
```

> If you're using this pattern, I recommend adapting it to use React Context so that you can determine `isOnClient` once and provide that context for the lifetime of the app vs having every new component start off as `false` only to immediately switch to `true`.

### Smart Server

You can try to do some clever things with your server in order to improve your chances of guessing the correct initial screen class.

This route is tricky, but if you want to try it, here are some ideas:

- You can check the User-Agent Request header to get an idea of what type of device is being used (mobile vs laptop/desktop) and use that info to make an educated guess. Check out [ua-parser-js](https://www.npmjs.com/package/ua-parser-js) for parsing user agents on Node servers.
- If your user is navigating from page to page in your app and you control the links, you could append width and height query params or custom headers to each request before it goes out. This is a lot of work, but technically possible.

## Extras

### `useScreenClass` Hook

Want direct access to the screen class itself? Sure! We're already providing it via context, so here's a hook to get the raw value for your own purposes.

```jsx
/* responsiveSystem.js/ts */

// ...

export const {
  ScreenClassProvider,
  useResponsiveValue,
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

## Under the Hood

For folks who are curious about the implementation:

Fundamentally, we need our components to be aware of the current screen class so they know when to re-render. We do this by constructing Media Queries from your breakpoints and using `window.matchMedia` to observe changes, then we _provide_ the current screen class to components via React Context. This will only trigger a re-render when the screen class actually changes, and not during resizing events within the same screen class.

## Changelog

Responsive System uses strict Semantic Versioning which means that our version numbers carry extra meaning. The general form is:

`v{major}.{minor}.{patch}` except when the first number is 0, in which case it's `v0.{major}.{minor}`

- `patch` - if this number changes, then we've shipped a bug fix or small tweak
- `minor` - if this number changes, then we've shipped a new feature that's backwards compatible
- `major` - if this number changes, then we've shipped a change that's not backwards compatible so be careful when upgrading!

> This library is currently in the v0.X.X range, so keep in mind that the middle number represents major breaking changes and that upgrading will require extra work

### v0.10 - Server-Side Rendering

- Removed `defaultScreenClass` param
- Added `initialScreenClass` param
- Fixed SSR `useLayoutEffect` bug
- Fixed hydration mismatch bug

Upgrading from v0.9?

- if your app is client-side rendered, just remove `defaultScreenClass` and **don't** add `initialScreenClass`
- if your app is server-side rendered, replace `defaultScreenClass` with `initialScreenClass` and refer to the [server-side rendering docs](#server-side-rendering) for further considerations

### v0.9 - useResponsiveValue

- Removed `responsive(Component)`
- Removed `useResponsiveProps(props)`
- Removed `deepMerge` dependency
- Added `useResponsiveValue(defaultValue, overrides)`

Upgrading from v0.8?

- v0.8 was stable for 2+ years, so if it's working for you then the upgrade might not be worthwhile
- the `createResponsiveSystem` setup remains the same
- components must be upgraded on a case-by-case basis

```jsx
// 0.8
const ResponsiveCarousel = responsive(Carousel);

<ResponsiveCarousel
  slidesToShow={4}
  showArrows={true}
  small={{ slidesToShow: 2, showArrows: false }}
/>;

// 0.9+
const responsiveSlidesToShow = useResponsiveValue(4, { small: 2 });
const responsiveShowArrows = useResponsiveValue(true, { small: false });

<Carousel slidesToShow={responsiveSlidesToShow} showArrows={responsiveShowArrows} />;
```
