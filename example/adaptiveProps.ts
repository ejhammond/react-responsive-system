import { AdaptiveProps, createScreenClassProvider } from '../dist';

const breakpoints = {
  xs: 500,
  sm: 750,
  md: 1000,
  lg: Infinity,
};

export const {
  ScreenClassProvider,
  useAdaptiveProps,
} = createScreenClassProvider({
  defaultScreenClass: 'lg',
  breakpoints,
});

export type Adaptive<P extends {}> = AdaptiveProps<typeof breakpoints, P>;
