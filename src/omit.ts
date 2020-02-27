/**
 * Omits the given keys from the given object
 */
export function omit<T extends { [key: string]: any }, K extends keyof T>(
  obj: T,
  omittedKeys: K[],
): Omit<T, K> {
  // TypeScript assigns the return type, string[] - we are asserting that the return type keyof T
  const allKeys = Object.keys(obj) as (keyof T)[];

  return allKeys.reduce<Partial<Omit<T, K>>>((acc, key) => {
    // `omittedKeys.indexOf` expects an input of type K extends keyof T
    // `key` is type keyof T, but for some reason TypeScript is freaking out
    // idk.
    const shouldOmit = omittedKeys.indexOf(key as K) !== -1;

    if (!shouldOmit) {
      // assert that if we got this far, `key` must be one of the keys that _does not_ exist in K
      const keptKey = key as Exclude<keyof T, K>;

      acc[keptKey] = obj[keptKey];
    }

    return acc;
    // assert that the output is exactly Omit<T, K> rather than Partial<Omit<T, K>>
  }, {}) as Omit<T, K>;
}
