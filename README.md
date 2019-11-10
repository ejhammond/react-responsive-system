# Responsive Props

Your app/website needs to handle different "classes" of screens. CSS can help to apply different styles for different screen classes, but why stop at styles?

Let's say that you have a `Carousel` component that has a prop called `slidesToShow`. You might want to show 4 slides on large screens, but only 2 slides on smallish screens, and probably only 1 on a phone-sized device.

What if you could just write:

```jsx
<Carousel
  slidesToShow={4}
  phone={{ slidesToShow: 1 }}
  smallishScreen={{ slidesToShow: 2 }}
/>
```

The idea is: each of your components could have props that correspond to your own custom screen classes (maybe that's `mobile` and `desktop`, or maybe `sm`, `md`. `lg`). These props would contain any overrides that you want to apply to the component based on the screen class.

That's exactly what Responsive Props can do for you, and the best part is: you can drop-in this solution to any existing component in a snap.

## Getting Started

There are 3 steps to enabling this functionality in your components:

### 1. Define your breakpoints in JS

Each key in this object will become a prop on your components--watch out for naming conflicts!

The values that you provide are the "maximum pixel-widths" for that screen class. In order to make sure that all possible screen pixel-sizes are handled, there should be exactly one screen class with a value of `Infinity` which tells us that there is no maximum pixel-width for that screen class.

```js
const breakpoints = {
  xs: 500, // 0 - 500px -> "xs"
  sm: 750, // 501 - 750px -> "sm"
  md: 1000, // 751 - 1000px -> "md"
  lg: Infinity, // 1001+ -> "lg"
};
```

### 2. Generate your customized utilities, and render/export the ScreenClassProvider

```js
// at the root of your app
import { createScreenClassProvider } from 'react-responsive-props';

const breakpoints = {
  // your breakpoints here
};

// generate the custom Provider and a hook that will Consume it
const { ScreenClassProvider, useResponsiveProps } = createScreenClassProvider({
  breakpoints,
  defaultScreenClass: 'lg', // this is the screenClass that will be used if we can't determine the width of the window (e.g. during SSR)
});

// export the useResponsiveProps hook so that other components can use it
export { useResponsiveProps };

// render the ScreenClassProvider at (or near) the root of your app
ReactDOM.render(
  <ScreenClassProvider>
    <App />
  </ScreenClassProvider>,
  document.getElementById('root')
);
```

> Tip: if you're building a component library, just export the `ScreenClassProvider` for your users instead!

### 3. useResponsiveProps in your components

```js
import { useResponsiveProps } from '../index.js'; // or where ever you exported it from

// before
const Button = props => {
  const { buttonSize, buttonType, buttonText } = props;

  // return ...
};

// after
const Button = props => {
  const { buttonSize, buttonType, buttonText } = useResponsiveProps(props);

  // return ...
};
```

### 4. Profit?

Once you've completed those 3 steps, you can start adding responsive props to your component. Each key from your `breakpoints` will be a valid prop!

```js
<Button
  buttonText="Default text"
  sm={{ buttonText: 'Small screen text', buttonSize: 'mini' }}
  lg={{ buttonText: 'Large screen text', buttonSize: 'large' }}
/>
```

### Organizing

The way that you organize your project is entirely up to you, but I've found it to be convenient to configure ResponsiveProps in its own file and then to import `ScreenClassProvider` and `useResponsiveProps` where ever they're needed. This keeps the index file tidy.

```ts
// {root}/responsiveProps.ts

import {
  createScreenClassProvider,
  ResponsiveProps,
} from 'react-responsive-props';

const breakpoints = {
  xs: 500,
  sm: 750,
  md: 1000,
  lg: Infinity,
};

export const {
  ScreenClassProvider,
  useResponsiveProps,
} = createScreenClassProvider({
  defaultScreenClass: 'xl',
  breakpoints,
});
```

## `andLarger` + `andSmaller`

```js
<Button
  buttonText="Default text"
  sm={{ buttonText: 'Small screen text', buttonSize: 'mini' }}
  lg={{ buttonText: 'Large screen text', buttonSize: 'large' }}
/>
```

In the above example, the "Default text" would be overridden on `sm` and `lg` screens, but on `xs` and `md` screens, you'd still see "Default text". That's because, by default, the responsive props will only apply to their own screen class.

But what if you wanted to use that "Small screen text" and "mini" button on `xs` screens too?

Well, you could copy and paste the overrides from `sm` into the `xs` prop, but that gets 0 likes.

Instead, you can make use of the `andSmaller` directive to indicate that you want to apply the overrides on "`sm` screens _andSmaller_"!

Here's what it looks like:

```js
<Button
  buttonText="Default text"
  sm={{ andSmaller: true, buttonText: 'Small screen text', buttonSize: 'mini' }}
  lg={{ buttonText: 'Large screen text', buttonSize: 'large' }}
/>
```

Now, your `sm` overrides will apply on `sm` screens _and_ any smaller screens as well.

You can probably guess how `andLarger` works, so let's not waste time with that.

### Tips

#### 1. Ambiguous directives will result in an error

If you start to use multiple `andSmaller` or `andLarger`, you might be wondering how conflicting overrides might be applied.

First of all, don't do this:

```js
// bad!
<Button
  xs={{ andLarger: true, buttonSize: 'microscopic' }}
  sm={{ buttonSize: 'mini' }}
  lg={{ andSmaller: true, buttonSize: 'humongous' }}
/>
```

Here we have the `xs` prop saying that all screen sizes that are larger should have a "microscopic" button, and we also have the `lg` props saying that all screen sizes that are smaller should have a "humongous" button. What size do you think the button should be on `sm` screens?

I don't know either! So that's an error.

In general terms: if some screen class prop uses `andLarger` and a _larger_ screen class prop uses `andSmaller`, that's an error. And likewise if some screen class prop uses `andSmaller` and a _smaller_ screen class prop uses `andLarger`, that's an error too.

This is okay though:

```js
//
<Button
  sm={{ andSmaller: true, buttonSize: 'mini' }}
  md={{ andLarger: true, buttonSize: 'humongous' }}
/>
```

Whenever you see `andSmaller` or `andLarger`, picture an arrow pointing in the direction that they're referring to (`andSmaller` points up, `andLarger` points down) if two arrows point at one another, they crash and that's an error. In the example above, the arrows would point away from each other, and that works just fine!

#### 2. Overlapping directives will be applied in order from furthest away to closest

Take this example:

```js
<Button
  sm={{ andSmaller: true, buttonSize: 'mini' }}
  lg={{ andSmaller: true, buttonSize: 'humongous', buttonText: 'Click me!' }}
/>
```

Here's the result:

```js
{
  xs: { buttonSize: 'mini', buttonText: 'Click me!' }
  sm: { buttonSize: 'mini', buttonText: 'Click me!' }
  md: { buttonSize: 'humongous', buttonText: 'Click me!' }
  lg: { buttonSize: 'humongous', buttonText: 'Click me!' }
}
```

Hopefully that's what you expected! Notice that all sizes got the "Click me!" text from `lg`, and that `md` got the "humongous" buttonSize from `lg`, but `xs` got the "mini" buttonSize from `sm`.

When calculating the props for `xs`, we started as far away as possible (at `lg`) and applied any overrides that were necessary. We assigned "humongous" buttonSize and "Click me!" for the buttonText. Then we moved to `md`; it had no `andSmaller` directive, so we skipped it. Next, we looked at `sm`; it _did_ have an `andSmaller` directive, so we applied its overrides _on top of_ all previous overrides. That's why the "humongous" buttonSize was overridden to be "mini" instead.

Generally, if two directives try to override the same prop, the "closest" one wins. Indeed, if `xs` had defined its own override e.g.

```js
<Button
  xs={{ buttonSize: 'microscopic' }}
  sm={{ andSmaller: true, buttonSize: 'mini' }}
  lg={{ andSmaller: true, buttonSize: 'humongous', buttonText: 'Click me!' }}
/>
```

The final buttonSize would be "microscopic" which fits with our mental model since nothing can be "closer" to `xs` than `xs` itself!

## TypeScript

Everybody loves nice types. This lib was written with TypeScript, so utilities themselves are well-typed, but their types depend on the specific breakpoints that you've configured. Because of this, you'll want to "configure" our types with your breakpoints as well!

Here are the two most useful types that we export:

```ts
/**
 * A union containing all of your custom screen classes
 */
type ScreenClass<B extends ScreenClassBreakpoints> = keyof B;

/**
 * A type that can be wrapped around your components' props in order to represent the new responsive props that they have
 */
type ResponsiveProps<B extends ScreenClassBreakpoints, P extends {}> = Omit<
  P,
  keyof B
> &
  {
    [K in keyof B]?: Partial<P> & {
      andLarger?: boolean;
      andSmaller?: boolean;
    };
  };
```

As you can see, both of these types require you to provide your own custom breakpoints. So, you _could_ export your breakpoints and import them everywhere that you need to use one of these types, _or_ you could configure these types in one place and then re-export them!

```ts
import { ResponsiveProps, ScreenClass } from 'react-responsive-props';

// at the root of your app
const breakpoints = {
  // your breakpoints here
};

export type MyResponsiveProps<P extends {}> = ResponsiveProps<
  typeof breakpoints,
  P
>;
export type MyScreenClass = ScreenClass<typeof breakpoints>;
```

Now you can import MyResponsiveProps and MyScreenClass all over your app!

Here's a fully-typed example for reference:

```tsx
import { ResponsiveProps } from 'react-responsive-props';

const breakpoints = {
  // your breakpoints here
}

type MyResponsiveProps<P extends {}> = ResponsiveProps<typeof breakpoints, P>;

type CustomComponentProps = {
  someColor?: string;
  someText: string;
};

const CustomComponent: React.FC<MyResponsiveProps<CustomComponentProps>> = props => {
  const {
    someColor = '#000000',
    someText = 'Unknown screen size',
  } = useResponsiveProps<CustomComponentProps>(props);
```

## Under the Hood

For folks who are curious about the implementation:

Fundamentally, we need our components to be aware of the current screen class so they know when to re-render. We do this by setting up a single resize event-listener at the root of the app, and Providing the screen class via React Context.

For better perf while your users are rapidly resizing their screens to see if your site breaks, there's a little debounce. You can configure the debounce delay by supplying an `resizeUpdateDelay` to the config object when you `createScreenClassProvider`.
