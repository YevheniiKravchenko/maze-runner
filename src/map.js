export function buildMap({ field, start, end }) {
  const mapEl = document.querySelector('.maze');
  cleanEl(mapEl);

  mapEl.append(...generateMap(field));

  // TODO: move it to generating function
  writeOnCell(start, 'S');
  writeOnCell(end, 'F');
}

export function markCell(point) {
  getCellByPoint(point).classList.add('active-path');
}

export function unmarkCell(point) {
  const el = getCellByPoint(point);
  el.classList.remove('active-path');
  el.classList.add('visited');
}

export function cleanEl(el) {
  el.innerHTML = '';
}

export function writeOnCell(point, text) {
  const cell = getCellByPoint(point);
  cell.innerHTML = text;
}

function getCellByPoint(point) {
  return document.querySelector(`[data-coord="${String(point)}"]`);
}

function generateMap(field, start, finish) {
  const rowsEls = field.map((row, rowIndex) => {
    const rowEl = document.createElement('div');
    rowEl.classList.add('row');

    const cellEls = row.map((cell, cellIndex) => {
      const cellEl = document.createElement('div');
      cellEl.classList.add('cell');
      cellEl.dataset.coord = String([cellIndex, rowIndex]);

      if (cell === 0) {
        cellEl.classList.add('disabled');
      }

      return cellEl;
    });

    rowEl.append(...cellEls);

    return rowEl;
  });

  return rowsEls;
}
