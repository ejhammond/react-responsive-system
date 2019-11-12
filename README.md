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

Here, you'll configure ResponsiveSystem with your
Create a new file (recommended, but not required) called `responsiveSystem.js/ts` and configure the lib

```js
// responsiveSystem.js/ts
import { createResponsiveSystem } from 'react-responsive-system';

const breakpoints = {
  // your breakpoints here
};

// generate the ResponsiveSystem pieces, and export them to be used throughout your app
export const {
  ScreenClassProvider, // React Context Provider that supplies the current screen class to your comps
  responsive, // a High-Order Component that can be used to make your comps responsive
  useResponsiveProps, // a Hook that can be used to make your comps responsive
} = createResponsiveSystem({
  breakpoints,
  // this is the screenClass that will be used if we can't determine the width of the window (e.g. during SSR)
  defaultScreenClass: 'lg',
});
```

### 3. Render the ScreenClassProvider near the root of your app

```js
// index.jsx/tsx
import { ScreenClassProvider } from './responsiveSystem';

// render the ScreenClassProvider at (or near) the root of your app
ReactDOM.render(
  <ScreenClassProvider>
    <App />
  </ScreenClassProvider>,
  document.getElementById('root')
);
```

### 4. Make your comps responsive using the Hook or HOC

We provide both a HOC and a Hook for you to use. They both do the same thing (the HOC just adds the hook for you).

#### `responsive` HOC

Just wrap your comp in the `responsive` HOC and it will instantly understand your responsive props.

```js
import { responsive } from '../responsiveSystem';

// before
const Button = props => {
  const { buttonSize, buttonType, buttonText } = props;

  // return ...
};

export responsive(Button);
```

#### `useResponsiveProps` Hook

If you prefer to use the Hook directly, you can do that too!

```js
import { useResponsiveProps } from '../responsiveSystem';

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

### 5. Profit?

Regardless of whether you chose the HOC or the Hook, you can now start adding Responsive System props to your component. Each key from your `breakpoints` will be a valid prop!

```js
<Button
  buttonText="Default text"
  sm={{ buttonText: 'Small screen text', buttonSize: 'mini' }}
  lg={{ buttonText: 'Large screen text', buttonSize: 'large' }}
/>
```

[See an example on GitHub](https://github.com/tripphamm/react-responsive-system/tree/master/example)

## Server-Side Rendering

If `react-responsive-system` cannot access the `window`, it will use the `defaultScreenClass` that you set in the configuration object. When the code is re-hydrated on the client, it will adjust to the actual screenClass.

## Under the Hood

For folks who are curious about the implementation:

Fundamentally, we need our components to be aware of the current screen class so they know when to re-render. We do this by constructing Media Queries from your breakpoints and using `window.matchMedia` to observe changes, then we _provide_ the current screen class to components via React Context. This should only trigger a re-render when the screen class actually changes, and not during resizing events within the same screen class.
