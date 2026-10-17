'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { filterTasks } = require('./filter-tasks.js');

const tasks = [
  { id: '1', title: 'Read chapter', course: 'CS', done: false },
  { id: '2', title: 'Write report', course: 'CS', done: true },
  { id: '3', title: 'Solve equations', course: 'Math', done: false },
  { id: '4', title: 'Review notes', course: 'Math', done: true }
];

test('returns all tasks when no filters are applied', () => {
  assert.deepEqual(filterTasks(tasks, '', 'all'), tasks);
});

test('filters tasks by course', () => {
  assert.deepEqual(filterTasks(tasks, 'CS', 'all'), [
    tasks[0], tasks[1]
  ]);
});

test('returns only completed tasks', () => {
  assert.deepEqual(filterTasks(tasks, '', 'completed'), [
    tasks[1], tasks[3]
  ]);
});

test('returns only open tasks', () => {
  assert.deepEqual(filterTasks(tasks, '', 'open'), [
    tasks[0], tasks[2]
  ]);
});

test('combines course and completed filters', () => {
  assert.deepEqual(filterTasks(tasks, 'CS', 'completed'), [
    tasks[1]
  ]);
});

test('combines course and open filters', () => {
  assert.deepEqual(filterTasks(tasks, 'Math', 'open'), [
    tasks[2]
  ]);
});

test('returns an empty array for an unknown course', () => {
  assert.deepEqual(filterTasks(tasks, 'History', 'all'), []);
});

test('handles an empty task list', () => {
  assert.deepEqual(filterTasks([], '', 'all'), []);
});

test('returns no matches when the status excludes every task', () => {
  assert.deepEqual(
    filterTasks([tasks[0]], 'CS', 'completed'),
    []
  );
});

test('does not modify the original array or its tasks', () => {
  const input = structuredClone(tasks);
  const original = structuredClone(input);

  const result = filterTasks(input, 'CS', 'open');

  assert.deepEqual(input, original);
  assert.notStrictEqual(result, input);
});