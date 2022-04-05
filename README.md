# 💬 Responsive System

A tiny (yet powerful) system for when CSS media queries aren't enough.

![gzip size](https://badgen.net/bundlephobia/minzip/react-responsive-system) ![weekly npm downloads](https://badgen.net/npm/dw/react-responsive-system) ![typescript types included](https://badgen.net/npm/types/react-responsive-system)

## Motivation

CSS media queries are great for dynamically changing styles based on screen size, but sometimes you need values in your JavaScript code to respond to screen-size changes as well.

Check out [this blog post](https://ayhota.com/blog/articles/responsive-react-components) for a deeper dive into the problem space!

## What does it look like?

You give us a list of screen size boundaries where things might need to change ("breakpoints").

```js
const breakpoints = {
  // name them whatever you want
  small: 768, // any screen up to 768px is called "small"
  medium: 960, // from 769 to 960 it's "medium"
  large: 1280, // from 960 to 1280 it's "large"
  xl: Infinity, // anything larger than 1280 is "xl"
  // have as many as you'd like
};
```

and we give you back a hook for when you need a value to be responsive.

```jsx
const MyResponsiveComponent() {
  const message = useResponsiveValue(
    "Your screen is big", // default value
    { small: "Your screen is small" } // overrides
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

```bash
# npm
npm install react-responsive-system

# yarn
yarn add react-responsive-system
```

1. [Define your breakpoints](#1-define-your-breakpoints)
2. [Initialize the system](#2-initialize-the-system)
3. [Render the Provider](#3-render-the-provider)
4. [Make your components responsive](#4-make-your-components-responsive)

### 1. Define your breakpoints

> Tip: to keep things organized, folks often create a new file called `responsiveSystem.js/ts` where they'll configure Responsive System.

The first step is to define your breakpoints in JS:

```js
/* responsiveSystem.js/ts */

const breakpoints = {
  xs: 500, // 0 - 500px -> "xs"
  sm: 750, // 501 - 750px -> "sm"
  md: 1000, // 751 - 1000px -> "md"
  lg: Infinity, // 1001+ -> "lg"
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

### 4. Make your components responsive

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

By default, Responsive System overrides do not cascade, which is to say: if you add an override for screen class `X`, those overrides will only be applied when the user's screen matches `X` _exactly_. But in some cases, you might want to apply overrides on `X` and also anything larger/smaller than `X`.

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

In Desktop First mode, your overrides implicitly override everything smaller. Conceptually, you are specifying your default values for your largest screen class, and then making tweaks once the screen starts to get too small.

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

In Mobile First mode, your overrides implicitly override everything larger. Conceptually, you are specifying your default values for your smallest screen class, and then making tweaks once the screen starts to get big enough.

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

Now here's the downside: if you guess the initial screen class incorrectly, your users may see a quick flash of the wrong layout before React kicks in (hydrates the app) and adjusts to the proper screen class. In order to avoid that experience, you have a few options:

### Don't SSR

This is the easiest approach. If you don't SSR, then you don't have to worry about manually figuring out the initial screen class. We can figure it out for you and we can make sure that there's no flash of an incorrect screen class

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

If you're using this pattern, I actually recommend adapting it to use React Context so that you can determine `isOnClient` once and provide that context for the lifetime of the app vs having every new component start off as `false` only to immediately switch to `true`.

### Smart Server

You can try to do some clever things with your server in order to improve your chances of guessing the correct initial screen class.

This route is tricky, but if you want to try it, here are some ideas:

- You can check the User-Agent Request header to get an idea of what type of device is being used (mobile vs laptop/desktop) and use that info to make an educated guess. Check out [ua-parser-js](https://www.npmjs.com/package/ua-parser-js) for parsing user agents on Node servers.
- If your user is navigating from page to page in your app and you control the links, you could append width and height query params or custom headers to each request before it goes out.

## Extras

### `useScreenClass` Hook

Want direct access to the screen class itself? Sure! We're already providing it via context, so here's a hook to get the raw value for your own purposes!

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

Fundamentally, we need our components to be aware of the current screen class so they know when to re-render. We do this by constructing Media Queries from your breakpoints and using `window.matchMedia` to observe changes, then we _provide_ the current screen class to components via React Context. This should only trigger a re-render when the screen class actually changes, and not during resizing events within the same screen class.

## Changelog

Responsive System uses strict Semantic Versioning which means that our version numbers carry extra meaning. The general form is:

`v{major}.{minor}.{patch}`

- `patch` - if this number changes, then we've shipped a bug fix or small tweak
- `minor` - if this number changes, then we've shipped a new feature that's backwards compatible
- `major` - if this number changes, then we've shipped a change that's not backwards compatible so be careful when upgrading!

Also, in order to support rapid development at the start of a project, v0.X.X versions are handled slightly differently:

`v0.{major}.{minor}`

So the middle number actually represents a major breaking change for v0 versions. That's important to keep in mind so that you don't accidentally upgrade to a version that's not compatible with your existing code!

In this section, we'll cover those major changes so that folks can decide whether or not they want to update.

### v0.10 - Server-Side Rendering support

In this update we focused on supporting server-side rendering (SSR). Fundamentally, we don't have access to the user's screen during server rendering, so we can't automatically determine the proper screen class for the server-rendered content.

In order to continue to provide an optimal client-side rendering experience while also supporting a bug-free server-side rendering experience we made `defaultScreenClass` optional and we also renamed it to `initialScreenClass` to make its purpose more clear. Making it optional allows us to dynamically decide whether to use our client-side optimized implementation or to switch to the server-side optimized implementation.

IMPORTANT: if your app is client-side only, don't include `initialScreenClass` in your setup! We'll automatically determine the initial screen class and ensure that the content renders properly (without shifting). If you provide an `initialScreenClass` and it's incorrect, your users might see your components shift from one screen class to another when they load the page.

### v0.9 - useResponsiveValue replaces responsive(Component)

> Note: the 0.8.X line went for 2+ years with no major changes and is quite stable, so there's really not much reason to upgrade if it's working for your project!

The reason that we haven't moved to 1.0 yet is that the API just hasn't felt quite right. It was a bit clunky and there were a few hacks behind the scenes to get it to work the way that we wanted it to work. 0.9 eliminates those hacks, improves the performance, and generally gets much closer to what we feel could be worthy of 1.0; the downside is that we needed to make some fundamental (breaking) changes.

So what changed?

In 0.9 we moved away from the HOC `responsive(Component)` approach and adopted a streamlined hook-based approach. The hook-based approach is much smaller (in terms of bytes) and much lighter in the sense that we no longer modify your components "magically". Fundamentally, we've shifted from wrapping entire components to wrapping individual values/variables.

```js
// 0.8.X
const ResponsiveCarousel = responsive(Carousel);

<ResponsiveCarousel slidesToShow={4} onSmallScreens={{ slidesToShow: 2 }} />;

// 0.9.X
const responsiveSlidesToShow = useResponsiveValue(4, { onSmallScreens: 2 });

<Carousel slidesToShow={responsiveSlidesToShow} />;
```
