import deepMerge from 'deepmerge';

type MergeArrayHelpers = deepMerge.Options & {
  cloneUnlessOtherwiseSpecified: <T>(item: T, options: MergeArrayHelpers) => T;
  isMergeableObject: <T>(item: T) => boolean;
};

function mergeArrays(base: any[], override: any[], helpers: MergeArrayHelpers) {
  const { cloneUnlessOtherwiseSpecified, isMergeableObject } = helpers;

  // clone the target array
  const final = [...base];

  override.forEach((overrideItem, index) => {
    const baseItem = base[index];

    if (isMergeableObject(overrideItem)) {
      // if we encounter a "mergeable" object, merge it with the base item
      /* eslint-disable @typescript-eslint/no-use-before-define */
      final[index] = mergeTwo(baseItem, overrideItem);
    } else {
      // otherwise just replace whatever was in the base array with the override
      final[index] = cloneUnlessOtherwiseSpecified(overrideItem, helpers);
    }
  });

  return final;
}

function mergeTwo<P extends {}>(base: Partial<P>, override: Partial<P>) {
  return deepMerge(base, override, { arrayMerge: mergeArrays });
}

export function merge<P extends {}>(propsObjects: Partial<P>[]) {
  return deepMerge.all<P>(propsObjects, { arrayMerge: mergeArrays });
}
