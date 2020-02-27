import { merge } from '../src/merge';

it('merges same-length arrays', () => {
  const a = { array: [1, 2, 3] };
  const b = { array: [2, 4, 6] };

  expect(merge([a, b])).toStrictEqual({ array: [2, 4, 6] });
});

it('merges base-longer arrays', () => {
  const a = { array: [1, 2, 3, 4] };
  const b = { array: [2, 4, 6] };

  expect(merge([a, b])).toStrictEqual({ array: [2, 4, 6, 4] });
});

it('merges override-longer arrays', () => {
  const a = { array: [1, 2, 3] };
  const b = { array: [2, 4, 6, 8] };

  expect(merge([a, b])).toStrictEqual({ array: [2, 4, 6, 8] });
});

it('merges objects inside of arrays', () => {
  const a = { array: [{ one: 1 }, 2, 3] };
  const b = { array: [{ two: 2 }, 3, 4] };

  expect(
    merge<any>([a, b]),
  ).toStrictEqual({ array: [{ one: 1, two: 2 }, 3, 4] });
});

it('merges objects in order', () => {
  const a = { foo: 1, alpha: true };
  const b = { foo: 2, bravo: true };
  const c = { foo: 3, charlie: true };

  expect(merge([a, b, c])).toStrictEqual({ foo: 3, alpha: true, bravo: true, charlie: true });
});
