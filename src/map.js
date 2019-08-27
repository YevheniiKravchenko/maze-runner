import once from 'once';
import { debounce } from 'debounce';

const registerResizeEventOnce = once(registerResizeEvent);

export function buildMap({ field, start, end }) {
  const mapEl = document.querySelector('.maze');
  cleanEl(mapEl);

  setCellSize(field.length);
  registerResizeEventOnce(field.length);

  mapEl.append(...generateMap(field));

  // TODO: move it to generating function
  writeOnCell(start, 'S');
  writeOnCell(end, 'F');
}

export function markCell(point) {
  const cell = getCellByPoint(point);

  if (cell) {
    cell.classList.add('active-path');
  }
}

export function unmarkCell(point) {
  const el = getCellByPoint(point);
  if (el) {
    el.classList.remove('active-path');
    el.classList.add('visited');
  }
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

function calculateCellSize(length) {
  const GLOBAL_MARGINS = 10;
  const HEADER_HEIGHT = 30;
  const RESULT_HEIGHT = 20;
  const VERTICAL_GAP = 10;
  const HORIZONTAL_FIX = 20;
  const ADDITIONAL_ACTIONS_MARGIN = 10;

  const availableHeight =
    window.innerHeight -
    GLOBAL_MARGINS * 2 -
    HEADER_HEIGHT -
    RESULT_HEIGHT -
    2 * VERTICAL_GAP -
    ADDITIONAL_ACTIONS_MARGIN;

  const availableWidth =
    window.innerWidth - 2 * GLOBAL_MARGINS - HORIZONTAL_FIX;

  const shorterDimension = Math.min(availableHeight, availableWidth);

  return Math.floor(shorterDimension / length);
}

function setCellSize(length) {
  const cellSize = calculateCellSize(length);
  document.documentElement.style.setProperty('--cell-size', `${cellSize}px`);
}

function registerResizeEvent(length) {
  const handler = debounce(() => {
    setCellSize(length);
  }, 300);

  window.addEventListener('resize', handler);
}
