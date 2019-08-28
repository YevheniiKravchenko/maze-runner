import 'regenerator-runtime/runtime';
import map from 'ramda/src/map';
import sum from 'ramda/src/sum';
import sort from 'ramda/src/sort';

import { generateRandomMaze } from './utils';
import { run } from './maze-solver';

const TOP = [0, -1];
const BOTTOM = [0, 1];
const RIGHT = [1, 0];
const LEFT = [-1, 0];

const strategies = [
  'TOP-LEFT-BOTTOM-RIGHT',
  'TOP-BOTTOM-LEFT-RIGHT',
  'TOP-BOTTOM-RIGHT-LEFT',
  'RIGHT-BOTTOM-LEFT-TOP',
  'RIGHT-TOP-LEFT-BOTTOM',
  'RIGHT-LEFT-BOTTOM-TOP',
  'RIGHT-LEFT-TOP-BOTTOM',
  'BOTTOM-RIGHT-TOP-LEFT',
  'BOTTOM-LEFT-TOP-RIGHT',
  'BOTTOM-TOP-RIGHT-LEFT',
  'BOTTOM-TOP-LEFT-RIGHT',
  'LEFT-TOP-RIGHT-BOTTOM',
  'LEFT-BOTTOM-RIGHT-TOP',
  'LEFT-RIGHT-BOTTOM-TOP',
  'LEFT-RIGHT-TOP-BOTTOM',
  'TOP-RIGHT-BOTTOM-LEFT',
];

document.querySelector('.test-btn').addEventListener('click', async () => {
  const results = {};
  const numberOfTries = 5;
  const anyStrategy = strategies[0];

  while (
    !results[anyStrategy] ||
    (results[anyStrategy] && results[anyStrategy].length <= numberOfTries)
  ) {
    const maze = generateRandomMaze(20);

    await strategies.forEach(async op => {
      const app = {
        running: true,
        speed: 0,
      };

      const game = run(
        maze,
        app,
        {
          onFailEscape: () => {},
          onSuccessEscape: (path, len) => {
            results[path] ? results[path].push(len) : (results[path] = [len]);
          },
        },
        op,
      );

      await game.next();
      const time = await game.next();
    });
  }

  const avgResults = map(r => Math.round(sum(r) / r.length))(results);
  printResults(avgResults);
});

function printResults(results) {
  const table = document
    .querySelector('template[name="table-template"]')
    .content.cloneNode(true);

  const rows = table.querySelector('tbody');

  const sortedResults = sortResults(results);

  sortedResults.forEach(([key, value]) => {
    const row = document.createElement('tr');
    const titleCell = document.createElement('td');
    titleCell.innerHTML = key;

    const valueCell = document.createElement('td');
    valueCell.innerHTML = value;

    row.append(titleCell, valueCell);
    rows.appendChild(row);
  });

  document.querySelector('.results-table').replaceWith(table);
}

function sortResults(results) {
  return Object.entries(results).sort((a, b) => a[1] - b[1]);
}
