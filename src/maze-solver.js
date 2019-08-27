import reject from 'ramda/src/reject';
import equals from 'ramda/src/equals';
import compose from 'ramda/src/compose';

import { markCell, unmarkCell } from './map';
import { isEqual, sleep } from './utils';

const log = console.log.bind(console);

// Neighbor offsets
const TOP = [0, -1];
const BOTTOM = [0, 1];
const RIGHT = [1, 0];
const LEFT = [-1, 0];

function getPointNeighbors(field, point, strategy) {
  return strategy.map(offset => getNeighborPoint(point, offset));
}

function* pathSequence(maze, strategy) {
  const visitedPoints = new Set();
  const path = [];

  path.push(maze.start);
  visitedPoints.add(String(maze.start));
  yield { point: maze.start, path };

  while (true) {
    const currentPoint = path[path.length - 1];
    const neighbors = getPointNeighbors(maze.field, currentPoint, strategy);

    const rejectPrevPoint = reject(equals(currentPoint));
    const rejectVisitedPoints = reject(point =>
      visitedPoints.has(String(point)),
    );
    const rejectWall = reject(
      point => getValueAtPoint(maze.field, point) === 0,
    );
    const rejectInvalidPoints = compose(
      rejectPrevPoint,
      rejectVisitedPoints,
      rejectWall,
    );

    const validNeighbors = rejectInvalidPoints(neighbors);
    const nextPoint = validNeighbors[0];

    if (nextPoint) {
      path.push(nextPoint);
      visitedPoints.add(String(nextPoint));

      yield { point: nextPoint, path };
    } else {
      unmarkCell(path.pop());

      if (!path.length) {
        return { point: null, path };
      }

      yield { point: path[path.length - 1], path };
    }
  }
}

function getNeighborPoint(currentPoint, relation) {
  return [currentPoint[0] + relation[0], currentPoint[1] + relation[1]];
}

function getValueAtPoint(field, [x, y]) {
  const maybeValue = field[y] ? field[y][x] : null;

  return maybeValue || 0;
}

const strategies = {
  'RIGHT-BOTTOM-LEFT-TOP': [RIGHT, BOTTOM, LEFT, TOP],
  'RIGHT-TOP-LEFT-BOTTOM': [RIGHT, TOP, LEFT, BOTTOM],
  'RIGHT-LEFT-BOTTOM-TOP': [RIGHT, LEFT, BOTTOM, TOP],
  'RIGHT-LEFT-TOP-BOTTOM': [RIGHT, LEFT, TOP, BOTTOM],

  'TOP-RIGHT-BOTTOM-LEFT': [TOP, RIGHT, BOTTOM, LEFT],
  'TOP-LEFT-BOTTOM-RIGHT': [TOP, LEFT, BOTTOM, RIGHT],
  'TOP-BOTTOM-LEFT-RIGHT': [TOP, BOTTOM, LEFT, RIGHT],
  'TOP-BOTTOM-RIGHT-LEFT': [TOP, BOTTOM, RIGHT, LEFT],

  'BOTTOM-RIGHT-TOP-LEFT': [BOTTOM, RIGHT, TOP, LEFT],
  'BOTTOM-LEFT-TOP-RIGHT': [BOTTOM, LEFT, TOP, RIGHT],
  'BOTTOM-TOP-RIGHT-LEFT': [BOTTOM, TOP, RIGHT, LEFT],
  'BOTTOM-TOP-LEFT-RIGHT': [BOTTOM, TOP, LEFT, RIGHT],

  'LEFT-TOP-RIGHT-BOTTOM': [LEFT, TOP, RIGHT, BOTTOM],
  'LEFT-BOTTOM-RIGHT-TOP': [LEFT, BOTTOM, RIGHT, TOP],
  'LEFT-RIGHT-BOTTOM-TOP': [LEFT, RIGHT, BOTTOM, TOP],
  'LEFT-RIGHT-TOP-BOTTOM': [LEFT, RIGHT, TOP, BOTTOM],
};

export async function* run(
  maze,
  app,
  finishHandlers,
  strategy = Object.keys(strategies)[0],
) {
  log('start');
  const steps = pathSequence(maze, strategies[strategy]);
  let totalTries = 0;

  while (true) {
    const runStep = yield; // Run one step
    while (app.running || runStep) {
      runStep = false; // Run only one step in "step" mode

      totalTries++;

      const { done, value } = steps.next();
      const { point, path } = value;
      const nextStep = point;

      // no escape
      if (done && !point) {
        app.running = false;

        finishHandlers.onFailEscape(strategy, totalTries);
        log('Path not found');
        return totalTries;
      }

      markCell(nextStep);
      // log('nextStep', nextStep);

      // escape
      if (isEqual(nextStep, maze.end)) {
        app.running = false;

        finishHandlers.onSuccessEscape(strategy, totalTries);
        log('Path found');
        return totalTries;
      }

      if (app.speed > 0) {
        await sleep(app.speed);
      }
    }
  }
}

export function getInitialState() {
  return {
    running: false,
    speed: 350,
  };
}
