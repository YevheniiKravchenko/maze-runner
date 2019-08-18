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

// Els
const runBtn = document.querySelector('#run-btn');
const stepBtn = document.querySelector('#step-btn');
const clearBtn = document.querySelector('#clear-btn');
const pauseBtn = document.querySelector('#pause-btn');
const speedInput = document.querySelector('#speed');
const resultStatus = document.querySelector('.result');

runBtn.addEventListener('click', () => {
  if (!app.running) {
    app.running = true;
    game = run(maze, app, { onFailEscape, onSuccessEscape });
    // It needs two time `next()` here due to functionality related to stepping and pausing.
    // It yields first time generator runs, so need to run it again to continue.
    // If pause - unpause, it will continue from that yield.
    // Probably should wrap this iterator in abstraction with better interface.
    game.next();
    game.next();
    pauseBtn.hidden = false;
    runBtn.hidden = true;
  }
});

stepBtn.addEventListener('click', () => {
  if (!app.running) {
    game.next(true);
  }
});

// TODO: Need to fix button behavior when multiple button are used.
// So interesting effects might be shown for now

clearBtn.addEventListener('click', () => {
  buildMap(maze);
  buttonsToDefaultState();
});

pauseBtn.addEventListener('click', () => {
  app.running = !app.running;
  pauseBtn.textContent = app.running ? 'Pause' : 'Resume';

  if (app.running) {
    game.next();
  }

  stepBtn.toggleAttribute('hidden');
  clearBtn.toggleAttribute('hidden');
});

speedInput.addEventListener('input', ev => {
  // TODO: move calculation logic away
  app.speed = ((11 - Number(ev.target.value)) * 100) / 2;
});

function onSuccessEscape() {
  resultStatus.innerHTML = 'Path found';
  buttonsToFinishedState();
}

function onFailEscape() {
  resultStatus.innerHTML = 'Path not found';
  buttonsToFinishedState();
}

function buttonsToDefaultState() {
  runBtn.hidden = false;
  pauseBtn.hidden = true;
  stepBtn.hidden = true;
  clearBtn.hidden = true;
}

function buttonsToFinishedState() {
  runBtn.hidden = true;
  pauseBtn.hidden = true;
  stepBtn.hidden = true;
  clearBtn.hidden = false;
}

buildMap(maze);
