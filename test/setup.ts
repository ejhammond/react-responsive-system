expect.extend({
  toBeInList(received: any, list: any[]) {
    const pass = list.some((item: any) => Object.is(received, item));

    if (pass) {
      return {
        message: () => `expected ${received} not to be in [${list.join(' , ')}]`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be in [${list.join(' , ')}]`,
        pass: false,
      };
    }
  },
});
