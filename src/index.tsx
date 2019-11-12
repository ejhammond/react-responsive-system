import * as React from 'react';

//
// ─── HELPERS ────────────────────────────────────────────────────────────────────
//

// keep track of whether or not we have access to `window` (so that we don't crash during e.g. server-side rendering)
const windowExists = typeof window === 'object';

/**
 * Omits the given keys from the given object
 */
export default function omit<
  T extends { [key: string]: any },
  K extends keyof T
>(obj: T, omittedKeys: K[]): Omit<T, K> {
  // TypeScript assigns the return type, string[] - we are asserting that the return type keyof T
  const allKeys = Object.keys(obj) as (keyof T)[];

  return allKeys.reduce<Partial<Omit<T, K>>>((acc, key) => {
    // `omittedKeys.indexOf` expects an input of type K extends keyof T
    // `key` is type keyof T, but for some reason TypeScript is freaking out
    // idk.
    // @ts-ignore
    const shouldOmit = omittedKeys.indexOf(key) !== -1;

    if (!shouldOmit) {
      // assert that if we got this far, `key` must be one of the keys that _does not_ exist in K
      const keptKey = key as Exclude<keyof T, K>;

      acc[keptKey] = obj[keptKey];
    }

    return acc;
    // assert that the output is exactly Omit<T, K> rather than Partial<Omit<T, K>>
  }, {}) as Omit<T, K>;
}

//
// ─── TYPES ──────────────────────────────────────────────────────────────────────
//

/**
 * A mapping of ScreenClass names to the maximum pixel-width where they apply
 *
 * Of course, your largest breakpoint will not have a maximum pixel-width--pass `Infinity` in order to indicate that there's no maximum.
 * Every instance of ScreenClassBreakpoints should have exactly one ScreenClass with a value of `Infinity`,
 * otherwise very-large screen sizes will manifest as having an `undefined` ScreenClass
 *
 * @example
 * {
 *   xs: 500, // 0 - 500px -> "xs"
 *   sm: 750, // 501 - 750px -> "sm"
 *   md: 1000, // 751 - 1000px -> "md"
 *   lg: Infinity, // 1001+ -> "lg"
 * }
 */
export type ScreenClassBreakpoints = {
  [screenClass: string]: number;
};

export type ScreenClassConfiguration<B extends ScreenClassBreakpoints> = {
  /**
   * The ScreenClass that should be used if we're unable to determine the size of the window
   * (i.e. when `window` does not exist e.g. during server-side rendering or headless testing)
   *
   * Tip: during testing, use this prop to control the ScreenClass for a given test
   */
  defaultScreenClass: keyof B;

  /**
   * A mapping of ScreenClass names to the maximum pixel-width where they apply
   *
   * @example
   * {
   *   xs: 500,
   *   sm: 750,
   *   md: 1000,
   *   lg: Infinity
   * }
   */
  breakpoints: B;
};

export type ScreenClass<B extends ScreenClassBreakpoints> = keyof B;

export type ResponsiveProps<
  B extends ScreenClassBreakpoints,
  P extends {}
> = Omit<P, keyof B> &
  {
    [K in keyof B]?: Partial<P>;
  };

//
// ─── FACTORY ────────────────────────────────────────────────────────────────────
//

export function createResponsiveSystem<B extends ScreenClassBreakpoints>(
  screenClassConfiguration: ScreenClassConfiguration<B>
) {
  const { defaultScreenClass, breakpoints } = screenClassConfiguration;

  //
  // ─── VALIDATE ───────────────────────────────────────────────────────────────────
  //

  // optimize these error-checks out of production builds
  if (__DEV__) {
    // todo: validate that defaultScreenClass is defined or that breakpoints is an object?
    // how much should we assume based on our Types?

    const breakpointValues = Object.values(breakpoints);
    if (breakpointValues.length < 2) {
      throw new Error(
        'ScreenClassConfigurationError - `breakpoints` must have at least 2 keys e.g. `{ mobile: 320, desktop: Infinity }`'
      );
    }

    if (breakpointValues.filter(value => value === Infinity).length !== 1) {
      throw new Error(
        'ScreenClassConfigurationError - `breakpoints` must have exactly 1 entry with a value of `Infinity` for the maximum pixel-width e.g. `{ mobile: 320, desktop: Infinity }`'
      );
    }
  }

  //
  // ─── SORT ───────────────────────────────────────────────────────────────────────
  //

  // sort the screen classes from smallest -> largest (will make it easier to determine the proper screen class given a window-width later)
  const sortedScreenClassBreakpoints: [keyof B, number][] = Object.entries(
    breakpoints
    // we don't need the first value in the tuples, so we leave that slot empty
    // it looks a bit odd, but it's correct and doesn't introduce additional variables that we won't use
  ).sort(([, maxPixelWidth1], [, maxPixelWidth2]) => {
    return maxPixelWidth1 < maxPixelWidth2 ? 1 : 0;
  });

  const sortedScreenClasses = sortedScreenClassBreakpoints.map(
    ([screenClass]) => screenClass
  );

  //
  // ─── CONTEXT ────────────────────────────────────────────────────────────────────
  //

  const screenClassContext = React.createContext<ScreenClass<B> | undefined>(
    undefined
  );

  //
  // ─── PROVIDER ───────────────────────────────────────────────────────────────────
  //

  const { Provider } = screenClassContext;

  const ScreenClassProvider: React.FC = ({ children }) => {
    const [screenClass, setScreenClass] = React.useState<keyof B>(
      defaultScreenClass
    );

    React.useLayoutEffect(() => {
      if (!windowExists) {
        return;
      }

      // build the media queries
      const screenClassMediaQueries: [
        keyof B,
        MediaQueryList
      ][] = sortedScreenClassBreakpoints.map(
        ([screenClass, maxWidthPx], index) => {
          // the minWidth for this screenClass is the maxWidth of the previous breakpoint + 1
          const minWidthPx =
            index > 0 ? sortedScreenClassBreakpoints[index - 1][1] + 1 : 0;

          const constraints: string[] = [];
          if (minWidthPx !== 0) {
            constraints.push(`(min-width: ${minWidthPx}px)`);
          }
          if (maxWidthPx !== Infinity) {
            constraints.push(`(max-width: ${maxWidthPx}px)`);
          }

          const mediaQuery = constraints.join(' and ');

          const mediaQueryList = window.matchMedia(mediaQuery);

          // in order to set the correct initial state, we need to immediately check each mql
          if (mediaQueryList.matches) {
            setScreenClass(screenClass);
          }

          return [screenClass, mediaQueryList];
        }
      );

      type MediaQueryListListener = (
        this: MediaQueryList,
        event: MediaQueryListEvent
      ) => any;

      const listeners: [MediaQueryList, MediaQueryListListener][] = [];
      screenClassMediaQueries.forEach(([screenClass, mediaQuery]) => {
        const listener: MediaQueryListListener = event => {
          if (event.matches) {
            setScreenClass(screenClass);
          }
        };

        mediaQuery.addListener(listener);

        listeners.push([mediaQuery, listener]);
      });

      return () => listeners.forEach(([mql, l]) => mql.removeListener(l));
    }, []);

    return <Provider value={screenClass}>{children}</Provider>;
  };

  function useScreenClass(): keyof B {
    const screenClass = React.useContext(screenClassContext);

    if (screenClass === undefined) {
      // optimize this error-check out of production builds
      if (__DEV__) {
        throw new Error(
          "`useScreenClass` may only be used inside of a ScreenClassProvider. Make sure that you've rendered a ScreenClassProvider above this component your tree (usually folks render ScreenClassProvider near the root of their app). Returning the default screen class."
        );
      }

      return defaultScreenClass;
    }

    return screenClass;
  }

  function useResponsiveProps<P extends {}>(props: ResponsiveProps<B, P>): P {
    const currentScreenClass = React.useContext(screenClassContext);

    if (currentScreenClass === undefined) {
      // optimize this error-check out of production builds
      if (__DEV__) {
        throw new Error(
          "`useResponsiveProps` may only be used inside of a ScreenClassProvider. Make sure that you've rendered a ScreenClassProvider above this component your tree (usually folks render ScreenClassProvider near the root of their app). Returning the default props with no overrides."
        );
      }

      // if there's no screenClassContext, we'll just return the default props with no overrides
      // TypeScript: this is correct, but TS is having trouble confirming that it will be type P
      return omit(props, sortedScreenClasses) as P;
    }

    //
    // ─── DETERMINE PROPS ─────────────────────────────────────────────
    //

    return {
      // TypeScript: this is correct, but TS is having trouble confirming that it will be type P
      ...(omit(props, sortedScreenClasses) as P),
      // any props that are specified for the current screen class will trump all other props
      ...(props[currentScreenClass] !== undefined && props[currentScreenClass]),
    };
  }

  function responsive<P extends {}>(Component: React.ComponentType<P>) {
    const ResponsiveComponent: React.FC<ResponsiveProps<B, P>> = props => {
      const responsiveProps = useResponsiveProps<P>(props);

      return <Component {...responsiveProps} />;
    };

    ResponsiveComponent.displayName =
      Component.displayName !== undefined
        ? `Responsive(${Component.displayName})`
        : 'ResponsiveComponent';

    return ResponsiveComponent;
  }

  return {
    ScreenClassProvider,
    useResponsiveProps,
    useScreenClass,
    responsive,
  };
}
