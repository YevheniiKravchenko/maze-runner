import 'regenerator-runtime/runtime';
import { buildMap } from './map';
import { run, getInitialState } from './maze-solver';

//#region Input data
const matrix = [
  [1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 0],
  [1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
  [1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0],
  [1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1],
  [0, 1, 0, 0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 1, 0, 1],
  [0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0],
  [1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 0],
  [1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
  [1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0],
  [1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1],
  [0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1],
];
const start1 = [0, 0];
const end1 = [19, 19];

const maze = {
  field: matrix,
  start: start1,
  end: end1,
};
//#endregion

const app = getInitialState(); // Shared state of app, running/stopped
let game; // We need this shared variable to be able to start/stop/step from handlers

document.querySelector('#run-btn').addEventListener('click', () => {
  if (!app.running) {
    app.running = true;
    game = run(maze, app);
    // It needs two time `next()` here due to functionality related to stepping and pausing.
    // It yields first time generator runs, so need to run it again to continue.
    // If pause - unpause, it will continue from that yield.
    // Probably should wrap this iterator in abstraction with better interface.
    game.next();
    game.next();
  }
});

document.querySelector('#step-btn').addEventListener('click', () => {
  if (!app.running) {
    game.next(true);
  }
});

// TODO: Need to fix button behavior when multiple button are used.
// So interesting effects might be shown for now

document
  .querySelector('#clear-btn')
  .addEventListener('click', () => buildMap(maze));

document.querySelector('#pause-btn').addEventListener('click', () => {
  app.running = !app.running;
  document.querySelector('#pause-btn').textContent = app.running
    ? 'Pause'
    : 'Resume';

  if (app.running) {
    game.next();
  }
});

document.querySelector('#speed').addEventListener('input', ev => {
  // TODO: move calculation logic away
  app.speed = ((11 - Number(ev.target.value)) * 100) / 2;
});

buildMap(maze);
