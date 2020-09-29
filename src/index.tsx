import * as React from 'react';
import { merge } from './merge';
import { omit } from './omit';

//
// ─── HELPERS ────────────────────────────────────────────────────────────────────
//

// keep track of whether or not we have access to `window` (so that we don't crash during e.g. server-side rendering)
const windowExists = typeof window === 'object';

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

  /**
   * Controls the way that overrides are applied
   *
   * "no-cascade" -> only apply overrides on the exact screen class
   * "mobile-first" -> override on matching screen class and larger
   * "desktop-first" -> override on matching screen class and smaller
   *
   * @default "no-cascade"
   */
  cascadeMode?: 'no-cascade' | 'mobile-first' | 'desktop-first';
};

export type ScreenClass<B extends ScreenClassBreakpoints> = keyof B;

export type ResponsiveProps<B extends ScreenClassBreakpoints, P extends {}> = Omit<P, keyof B> &
  {
    [K in keyof B]?: Partial<P> | ((baseProps: P) => P);
  };

//
// ─── FACTORY ────────────────────────────────────────────────────────────────────
//

export function createResponsiveSystem<B extends ScreenClassBreakpoints>(
  screenClassConfiguration: ScreenClassConfiguration<B>,
) {
  const { defaultScreenClass, breakpoints, cascadeMode = 'no-cascade' } = screenClassConfiguration;

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
        'ScreenClassConfigurationError - `breakpoints` must have at least 2 keys e.g. `{ mobile: 320, desktop: Infinity }`',
      );
    }

    if (breakpointValues.filter((value) => value === Infinity).length !== 1) {
      throw new Error(
        'ScreenClassConfigurationError - `breakpoints` must have exactly 1 entry with a value of `Infinity` for the maximum pixel-width e.g. `{ mobile: 320, desktop: Infinity }`',
      );
    }
  }

  //
  // ─── SORT ───────────────────────────────────────────────────────────────────────
  //

  // sort the screen classes from smallest -> largest (will make it easier to determine the proper screen class given a window-width later)
  const sortedScreenClassBreakpoints: [keyof B, number][] = Object.entries(
    breakpoints,
    // we don't need the first value in the tuples, so we leave that slot empty
    // it looks a bit odd, but it's correct and doesn't introduce additional variables that we won't use
  ).sort(([, maxPixelWidth1], [, maxPixelWidth2]) => {
    return maxPixelWidth1 > maxPixelWidth2 ? 1 : 0;
  });

  const sortedScreenClasses = sortedScreenClassBreakpoints.map(([screenClass]) => screenClass);

  /**
   * Mobile-First Screen Classes include the current screen class and all smaller
   *
   * They should be applied smallest to largest
   */
  function getMobileFirstScreenClasses(breakpoint: keyof B) {
    return sortedScreenClasses.slice(0, sortedScreenClasses.indexOf(breakpoint) + 1);
  }

  /**
   * Desktop-First Screen Classes include the current screen class and all larger
   *
   * They should be applied from largest to smallest
   */
  function getDesktopFirstScreenClasses(breakpoint: keyof B) {
    return sortedScreenClasses.slice(sortedScreenClasses.indexOf(breakpoint)).reverse();
  }

  //
  // ─── CONTEXT ────────────────────────────────────────────────────────────────────
  //

  const screenClassContext = React.createContext<ScreenClass<B> | undefined>(undefined);

  //
  // ─── PROVIDER ───────────────────────────────────────────────────────────────────
  //

  const { Provider } = screenClassContext;

  const ScreenClassProvider: React.FC = ({ children }) => {
    const [screenClass, setScreenClass] = React.useState<keyof B>(defaultScreenClass);

    React.useLayoutEffect(() => {
      if (!windowExists) {
        return;
      }

      // build the media queries
      const screenClassMediaQueries: [keyof B, MediaQueryList][] = sortedScreenClassBreakpoints.map(
        ([screenClass, maxWidthPx], index) => {
          // the minWidth for this screenClass is the maxWidth of the previous breakpoint + 1
          const minWidthPx = index > 0 ? sortedScreenClassBreakpoints[index - 1][1] + 1 : 0;

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
        },
      );

      type MediaQueryListListener = (this: MediaQueryList, event: MediaQueryListEvent) => any;

      const listeners: [MediaQueryList, MediaQueryListListener][] = [];
      screenClassMediaQueries.forEach(([screenClass, mediaQuery]) => {
        const listener: MediaQueryListListener = (event) => {
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
          "`useScreenClass` may only be used inside of a ScreenClassProvider. Make sure that you've rendered a ScreenClassProvider above this component your tree (usually folks render ScreenClassProvider near the root of their app). Returning the default screen class.",
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
          "`useResponsiveProps` may only be used inside of a ScreenClassProvider. Make sure that you've rendered a ScreenClassProvider above this component your tree (usually folks render ScreenClassProvider near the root of their app). Returning the default props with no overrides.",
        );
      }

      // if there's no screenClassContext, we'll just return the default props with no overrides
      // TypeScript: this is correct, but TS is having trouble confirming that it will be type P
      return omit(props, sortedScreenClasses) as P;
    }

    //
    // ─── DETERMINE PROPS ─────────────────────────────────────────────
    //

    // TypeScript: this is correct, but TS is having trouble confirming that it will be type P
    const baseProps = omit(props, sortedScreenClasses) as P;

    let applicableScreenClasses = [];
    switch (cascadeMode) {
      case 'mobile-first':
        applicableScreenClasses = getMobileFirstScreenClasses(currentScreenClass);
        break;
      case 'desktop-first':
        applicableScreenClasses = getDesktopFirstScreenClasses(currentScreenClass);
        break;
      case 'no-cascade':
      default:
        applicableScreenClasses = [currentScreenClass];
    }

    // apply each screen class on top of the baseProps
    // the screenClasses should be sorted in the order in which they should be applied
    // e.g. mobile-first should apply smallest -> largest
    // e.g. desktop-first should apply largest -> smallest
    // we assume that the sorting is already done
    const propsToMerge = [baseProps, ...applicableScreenClasses.map((sc) => props[sc] ?? {})];
    return merge(propsToMerge);
  }

  // In order to support refs, we need to use forwardRef
  // but technically refs can't be forwarded to Function Components
  // so we produce overloaded signatures so that TS will yell at folks
  // who try to use the ref prop if they passed us a Function Component
  // our implementation will always pass the ref to the given component (even if it's a Function Component)
  // but React won't complain about it if the ref is undefined.
  // It's not possible (afaik) to detect a Function Component vs ForwardRef vs Class
  // so we can't dynamically call forwardRef depending on that context
  // so we're relying on TS overrides to block devs from defining the ref
  // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/35834

  // Host Components (e.g. "div") have refs defined by JSX.IntrinsicElements
  // @ts-ignore
  function responsive<K extends keyof JSX.IntrinsicElements>(
    Component: K,
  ): React.ForwardRefExoticComponent<ResponsiveProps<B, JSX.IntrinsicElements[K]>>;

  // Class Component refs hold the instance of the class
  function responsive<T extends React.ComponentClass<any>>(
    Component: T,
  ): React.ForwardRefExoticComponent<
    ResponsiveProps<B, React.ComponentPropsWithoutRef<T> & { ref?: React.Ref<InstanceType<T>> }>
  >;

  // ForwardRef Components have a ref as a prop
  function responsive<P extends { ref?: React.Ref<any> }>(
    Component: React.ForwardRefExoticComponent<P>,
  ): React.ForwardRefExoticComponent<ResponsiveProps<B, P>>;

  // Function Components don't have refs
  function responsive<P>(
    Component: React.FunctionComponent<P>,
  ): React.ForwardRefExoticComponent<ResponsiveProps<B, P>>;

  // Implementation - just forwardRef to everything
  function responsive<P>(Component: React.ComponentType<P>) {
    // @ts-ignore
    const ResponsiveComponent = React.forwardRef((props: ResponsiveProps<B, P>, ref) => {
      const responsiveProps = useResponsiveProps<P>(props);

      return <Component ref={ref} {...responsiveProps} />;
    });

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
