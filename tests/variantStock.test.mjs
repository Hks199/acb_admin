import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../src/pages/varients/Varients.jsx', import.meta.url), 'utf8');

for (const [handler, nextHandler] of [
  ['generateCombinations', 'handleVarientCreation'],
  ['generateUpdateCombinations', 'handleVarientUpdate'],
]) {
  test(`${handler} includes zero stock instead of dropping the selected size/color`, () => {
    const start = source.indexOf(`const ${handler} =`);
    const end = source.indexOf(`const ${nextHandler} =`, start);
    let result;
    vm.runInNewContext(`${source.slice(start, end)}\n${handler}();`, {
      selectedSizes: ['S', 'M', 'L', 'XL'], selectedColors: ['black'],
      combinationData: {
        'black-S': { price: 499, stock: 2 },
        'black-M': { price: 499, stock: 0 },
        'black-L': { price: 499, stock: '' },
        'black-XL': { price: 499, stock: -1 },
      },
      getColorImagesArray: () => [],
      [nextHandler]: (combinations) => { result = combinations; },
    });
    assert.equal(result.length, 2);
    assert.equal(result[1].Size, 'M');
    assert.equal(result[1].stock, 0);
  });
}
