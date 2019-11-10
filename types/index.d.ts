// TSDX can optimize our lib by excluding dev-only code during production builds
// in order to utilize this functionality, we need to wrap dev-only code in `if (__DEV__) {}` blocks
// this declaration tells TypeScript that it can assume that __DEV__ will exist at build time
// https://github.com/jaredpalmer/tsdx/tree/6252b705eb0fa29ac89a81d47ea676c9d5cda791#__dev__
declare var __DEV__: boolean;
