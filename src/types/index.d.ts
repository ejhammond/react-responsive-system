// we use a custom matcher in our tests, so we need to extend jest's Matcher type
declare namespace jest {
  // R and T are unused, but they must be included for proper interface extension
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Matchers<R, T> {
    toBeInList(value: any[]): CustomMatcherResult;
  }
}
