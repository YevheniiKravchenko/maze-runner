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

function getPointNeighbors(field, point) {
  return [TOP, RIGHT, BOTTOM, LEFT].map(offset =>
    getNeighborPoint(point, offset),
  );
}

function* pathSequence(maze) {
  const visitedPoints = new Set();
  const path = [];

  path.push(maze.start);
  visitedPoints.add(String(maze.start));
  yield { point: maze.start, path };

  while (true) {
    const currentPoint = path[path.length - 1];
    const neighbors = getPointNeighbors(maze.field, currentPoint);

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

export async function* run(maze, app, finishHandlers) {
  log('start');
  const steps = pathSequence(maze);

  while (true) {
    const runStep = yield; // Run one step
    while (app.running || runStep) {
      runStep = false; // Run only one step in "step" mode

      const { done, value } = steps.next();
      const { point, path } = value;
      const nextStep = point;

      // no escape
      if (done && !point) {
        app.running = false;

        finishHandlers.onFailEscape();
        log('Path found');
        return;
      }

      markCell(nextStep);
      log('nextStep', nextStep);

      if (isEqual(nextStep, maze.end)) {
        app.running = false;

        finishHandlers.onSuccessEscape();
        log('Path not found');
        return;
      }

      await sleep(app.speed);
    }
  }
}

export function getInitialState() {
  return {
    running: false,
    speed: 350,
  };
}
