import { ResponsiveProps, createResponsiveSystem } from '../../';

const breakpoints = {
  xs: 500,
  sm: 750,
  md: 1000,
  lg: Infinity,
};

export const { ScreenClassProvider, useResponsiveProps, responsive } = createResponsiveSystem({
  defaultScreenClass: 'lg',
  breakpoints,
  mode: 'desktop-first',
});

// ResponsiveProps takes 2 type args: the breakpoints, and the props
// since the breakpoints will never change, we'll create a new type that just takes props as an arg
// and it will always use the same breakpoints
export type Responsive<P extends {}> = ResponsiveProps<typeof breakpoints, P>;
