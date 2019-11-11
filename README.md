# Responsive System

Make your components screen-size aware.

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

That's exactly what Responsive System can do for you, and the best part is: you can drop-in this solution to any existing component in a snap!

## Getting Started

There are 3 steps to enabling this functionality in your components:

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

### 2. Generate your customized utilities, and render/export the ScreenClassProvider

```js
// at the root of your app
import { createScreenClassProvider } from 'react-responsive-system';

const breakpoints = {
  // your breakpoints here
};

// generate the custom Provider and a hook that will Consume it
const { ScreenClassProvider, useResponsiveProps } = createScreenClassProvider({
  breakpoints,
  // this is the screenClass that will be used if we can't determine the width of the window (e.g. during SSR)
  defaultScreenClass: 'lg',
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

> Tip: if you're building a component library, you'll want to export the `ScreenClassProvider` for your users to render in their apps!

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

This is what I meant when I said that you could drop-in the functionality! All you need to do is replace `props` with `useResponsiveProps(props)`. The hook will consume the screenClass props e.g. `xs`, `sm`, `md` and will return a clean `props` that matches your existing API!

### 4. Profit?

Once you've completed those 3 steps, you can start adding Responsive System props to your component. Each key from your `breakpoints` will be a valid prop!

```js
<Button
  buttonText="Default text"
  sm={{ buttonText: 'Small screen text', buttonSize: 'mini' }}
  lg={{ buttonText: 'Large screen text', buttonSize: 'large' }}
/>
```

[See an example on GitHub](https://github.com/tripphamm/react-responsive-system/tree/master/example)

## TypeScript

Everybody loves nice types. This lib was written with TypeScript, so utilities themselves are well-typed, but their types depend on the specific breakpoints that you've configured. Because of this, you'll want to "configure" the types before using them.

Here are the two most useful types that we export:

```ts
/**
 * A union containing all of your custom screen classes
 */
type ScreenClass<B extends ScreenClassBreakpoints> = keyof B;

/**
 * A type that can be wrapped around your components' props in order to represent the new props that they have
 */
type ResponsiveProps<B extends ScreenClassBreakpoints, P extends {}> = Omit<
  P,
  keyof B
> &
  {
    [K in keyof B]?: Partial<P>;
  };
```

As you can see, both of these types require you to provide your own custom breakpoints. So, you _could_ export your breakpoints and import them everywhere that you need to use one of these types, _or_ you could configure these types in one place and then re-export them!

```ts
import { ResponsiveProps, ScreenClass } from 'react-responsive-system';

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
import { ResponsiveProps } from 'react-responsive-system';

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

For better perf while your users are rapidly resizing their screens to see if your site breaks, there's a little debounce. You can configure the debounce delay by supplying a `resizeUpdateDelay` to the config object when you `createScreenClassProvider`.
