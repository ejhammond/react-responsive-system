import { createResponsiveSystem } from 'react-responsive-system';

const breakpoints = {
  xs: 500, // 0 - 500px -> "xs"
  sm: 750, // 501 - 750px -> "sm"
  md: 1000, // 751 - 1000px -> "md"
  lg: Infinity, // 1001+ -> "lg"
};

export const { ScreenClassProvider, responsive } = createResponsiveSystem({
  breakpoints,
  defaultScreenClass: 'lg',
});
