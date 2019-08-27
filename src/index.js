import 'regenerator-runtime/runtime';
import { buildMap } from './map';
import { run, getInitialState } from './maze-solver';
import { generateDefaultMaze, generateRandomMaze } from './utils';

let app = getInitialState(); // Shared state of app, running/stopped
let game; // We need this shared variable to be able to start/stop/step from handlers

let maze = generateDefaultMaze();

// Els
const runBtn = document.querySelector('#run-btn');
const stepBtn = document.querySelector('#step-btn');
const clearBtn = document.querySelector('#clear-btn');
const pauseBtn = document.querySelector('#pause-btn');
const generateBtn = document.querySelector('#gen-btn');
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
    generateBtn.hidden = true;
  }
});

stepBtn.addEventListener('click', () => {
  if (!app.running) {
    game.next(true);
  }
});

clearBtn.addEventListener('click', () => {
  buildMap(maze);
  controlsToDefaultState();
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

speedInput.addEventListener('input', e => {
  // TODO: move calculation logic away
  app.speed = ((10 - Number(e.target.value)) * 100) / 25;
});

generateBtn.addEventListener('click', () => {
  app = getInitialState();
  controlsToDefaultState();

  maze = generateRandomMaze(100);

  buildMap(maze);
});

function onSuccessEscape() {
  resultStatus.innerHTML = 'Path found';
  buttonsToFinishedState();
}

function onFailEscape() {
  resultStatus.innerHTML = 'Path not found';
  buttonsToFinishedState();
}

function controlsToDefaultState() {
  runBtn.hidden = false;
  pauseBtn.hidden = true;
  stepBtn.hidden = true;
  clearBtn.hidden = true;
  generateBtn.hidden = false;
  resultStatus.innerHTML = '';
  pauseBtn.textContent = 'Pause';
}

function buttonsToFinishedState() {
  runBtn.hidden = true;
  pauseBtn.hidden = true;
  stepBtn.hidden = true;
  clearBtn.hidden = false;
  generateBtn.hidden = false;
  pauseBtn.textContent = 'Pause';
}

buildMap(maze);
