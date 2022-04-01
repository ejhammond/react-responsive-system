// we use a custom matcher in our tests, so we need to extend jest's Matcher type
declare namespace jest {
  interface Matchers<R, T> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toBeInList(value: any[]): CustomMatcherResult;
  }
}
