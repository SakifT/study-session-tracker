'use strict';

// Filter by course and completion status without changing the original tasks.
function filterTasks(tasks, course, status) {
  return tasks.filter(task =>
    (!course || task.course === course) &&
    (status === 'all' ||
      (status === 'completed' ? !!task.done : !task.done))
  );
}

// Allow Node.js tests to import this function.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { filterTasks };
}