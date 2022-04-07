import { createResponsiveSystem, ScreenClassOverrides } from '../../';

const breakpoints = {
  xs: 500,
  sm: 750,
  md: 1000,
  lg: Infinity,
};

export const { ScreenClassProvider, useResponsiveValue } =
  createResponsiveSystem({
    breakpoints,
    cascadeMode: 'mobile-first',
  });

// convenience type
export type Overrides<T> = ScreenClassOverrides<typeof breakpoints, T>;
