'use strict';
// All state belongs to this app's storage key, even on a shared GitHub Pages origin.
const KEY = 'sakift-study-session-tracker-v1';
const $ = id => document.getElementById(id);
let state = { tasks: [], sessions: [], timer: null };
let editing = null;
function warn(message) { $('storage-warning').hidden = false; $('storage-warning').textContent = message; }
try {
  const raw = localStorage.getItem(KEY);
  if (raw) {
    const data = JSON.parse(raw);
    if (!Array.isArray(data.tasks) || !Array.isArray(data.sessions)) throw Error('Invalid data');
    state.tasks = data.tasks.filter(t => typeof t.id === 'string' && typeof t.title === 'string' && typeof t.course === 'string');
    state.sessions = data.sessions.filter(s => typeof s.title === 'string' && typeof s.course === 'string' && Number.isFinite(s.seconds) && s.seconds > 0 && Number.isFinite(s.finished));
    if (data.timer && ['focus', 'break'].includes(data.timer.mode) && Number.isFinite(data.timer.total) && data.timer.total > 0 && Number.isFinite(data.timer.remaining) && data.timer.remaining >= 0 && (data.timer.deadline === null || Number.isFinite(data.timer.deadline)) && typeof data.timer.title === 'string' && typeof data.timer.course === 'string') state.timer = data.timer;
  }
} catch { warn('Saved data could not be loaded. This page is starting with an empty workspace.'); }
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); }
  catch { warn('Changes cannot be saved in this browser. Keep this tab open; your current work is only in memory.'); }
}
function notify(message) { $('notice').textContent = message; }
function node(tag, text, className) {
  const el = document.createElement(tag);
  if (text !== undefined) el.textContent = text;
  if (className) el.className = className;
  return el;
}
function button(label, action, disabled = false) {
  const b = node('button', label); b.type = 'button'; b.disabled = disabled; b.addEventListener('click', action); return b;
}
function cancelEdit() { editing = null; $('task-form').reset(); $('save-task').textContent = 'Add task'; $('cancel-edit').hidden = true; }
$('cancel-edit').addEventListener('click', cancelEdit);
$('task-form').addEventListener('submit', event => {
  event.preventDefault();
  const title = $('task-title').value.trim(), course = $('task-course').value.trim();
  if (!title || !course) return notify('Enter a task and course; spaces alone do not count.');
  if (editing) {
    const task = state.tasks.find(t => t.id === editing);
    if (task) Object.assign(task, { title, course });
  } else state.tasks.push({ id: crypto.randomUUID(), title, course, done: false });
  cancelEdit(); save(); renderTasks(); notify('Task saved.');
});
// Filters change only the displayed task list, never stored tasks or timer choices.
function filterTasks(tasks, course, status) {
  return tasks.filter(task => (!course || task.course === course) &&
    (status === 'all' || (status === 'completed' ? !!task.done : !task.done)));
}
$('filter-course').addEventListener('change', renderTasks);
$('filter-status').addEventListener('change', renderTasks);
$('clear-filters').addEventListener('click', () => {
  $('filter-course').value = '';
  $('filter-status').value = 'all';
  renderTasks();
});
function renderTasks() {
  const previousCourse = $('filter-course').value;
  const courses = [...new Set(state.tasks.map(task => task.course))].sort((a, b) => a.localeCompare(b));
  $('filter-course').replaceChildren(new Option('All courses', ''));
  courses.forEach(course => $('filter-course').add(new Option(course, course)));
  $('filter-course').value = courses.includes(previousCourse) ? previousCourse : '';
  const visibleTasks = filterTasks(state.tasks, $('filter-course').value, $('filter-status').value);
  $('filter-summary').textContent = `Showing ${visibleTasks.length} of ${state.tasks.length} tasks`;
  $('clear-filters').disabled = !$('filter-course').value && $('filter-status').value === 'all';
  const selected = state.timer?.taskId || $('session-task').value;
  $('session-task').replaceChildren(new Option('General study', ''));
  state.tasks.filter(t => !t.done).forEach(t => $('session-task').add(new Option(`${t.course} — ${t.title}`, t.id)));
  $('session-task').value = selected;
  if ($('session-task').selectedIndex < 0) $('session-task').value = '';
  $('task-list').replaceChildren();
  $('task-count').textContent = `${state.tasks.filter(t => !t.done).length} open`;
  if (!state.tasks.length) $('task-list').append(node('li', 'No tasks yet. Add your first study task above.', 'hint'));
  if (state.tasks.length && !visibleTasks.length) $('task-list').append(node('li', 'No tasks match these filters. Change or clear the filters to see more tasks.', 'hint'));
  visibleTasks.forEach(t => {
    const li = node('li');
    li.append(node('span', t.title, `task-title${t.done ? ' done' : ''}`), node('span', t.course, 'hint'));
    const actions = node('div', undefined, 'task-buttons');
    const locked = state.timer?.taskId === t.id;
    actions.append(button(t.done ? 'Reopen' : 'Complete', () => { t.done = !t.done; save(); renderTasks(); }, locked));
    actions.append(button('Edit', () => { editing = t.id; $('task-title').value = t.title; $('task-course').value = t.course; $('save-task').textContent = 'Save changes'; $('cancel-edit').hidden = false; $('task-title').focus(); }, locked));
    actions.append(button('Delete', () => {
      if (!confirm(`Delete task “${t.title}”? Completed session history will be kept.`)) return;
      state.tasks = state.tasks.filter(item => item.id !== t.id);
      if (editing === t.id) cancelEdit();
      save(); renderTasks();
    }, locked));
    li.append(actions); $('task-list').append(li);
  });
}
function remaining() {
  const t = state.timer;
  return t ? (t.deadline === null ? t.remaining : Math.max(0, Math.ceil((t.deadline - Date.now()) / 1000))) : (Number($('minutes').value) || 25) * 60;
}
function renderTimer() {
  const t = state.timer;
  const left = remaining();
  $('clock').textContent = `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`;
  $('start').textContent = !t ? 'Start session' : t.deadline === null ? 'Resume' : 'Pause';
  $('reset').disabled = !t;
  for (const id of ['minutes','mode','session-task']) $(id).disabled = !!t;
  $('timer-state').textContent = t ? `${t.deadline === null ? 'Paused' : 'In progress'} · ${t.mode === 'focus' ? t.title : 'Break'}` : 'Ready for a new session';
}
function tick() {
  const t = state.timer;
  if (t && t.deadline !== null && remaining() === 0) {
    // Snapshot task text so later task edits/deletions do not rewrite history.
    if (t.mode === 'focus') state.sessions.push({ title: t.title, course: t.course, seconds: t.total, finished: t.deadline });
    state.timer = null;
    save(); renderTasks(); renderProgress();
    notify(t.mode === 'focus' ? 'Focus session complete! Your progress has been saved.' : 'Break complete. Ready to study again?');
  }
  renderTimer();
}
$('start').addEventListener('click', () => {
  if (state.timer?.deadline !== null && state.timer && remaining() === 0) { tick(); return; }
  if (!state.timer) {
    if (!$('minutes').reportValidity()) return;
    if (editing) { notify('Save or cancel your task edit before starting a session.'); return; }
    const task = state.tasks.find(t => t.id === $('session-task').value);
    const total = Number($('minutes').value) * 60;
    state.timer = { taskId: task?.id || '', title: task?.title || 'General study', course: task?.course || 'General', mode: $('mode').value, total, remaining: total, deadline: Date.now() + total * 1000 };
    notify('Session started.');
  } else if (state.timer.deadline !== null) {
    state.timer.remaining = remaining(); state.timer.deadline = null; notify('Session paused.');
  } else { state.timer.deadline = Date.now() + state.timer.remaining * 1000; notify('Session resumed.'); }
  save(); renderTasks(); renderTimer();
});
$('reset').addEventListener('click', () => {
  if (!state.timer) return;
  if (state.timer.deadline !== null && remaining() === 0) { tick(); return; }
  if (!confirm('Reset this session? Its unfinished time will not be recorded.')) return;
  state.timer = null; save(); renderTasks(); renderTimer(); notify('Session reset. No focus time was added.');
});
$('minutes').addEventListener('input', () => { if ($('minutes').validity.valid) renderTimer(); });
$('mode').addEventListener('change', () => { $('minutes').value = $('mode').value === 'break' ? 5 : 25; renderTimer(); });
function dayKey(timestamp) {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function summary(id, rows) {
  $(id).replaceChildren();
  if (!rows.length) $(id).append(node('li', 'Complete a focus session to see your progress.', 'hint'));
  for (const [label, seconds] of rows) { const li = node('li'); li.append(node('span', label), node('strong', `${seconds / 60} min`)); $(id).append(li); }
}
// Quote every field and escape embedded quotes for spreadsheet-compatible CSV.
function csvCell(value) {
  let text = String(value);
  // Keep user-entered spreadsheet formulas as literal text.
  if (/^[\s]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}
function sessionsToCsv(sessions) {
  const rows = [['Finished (UTC)', 'Task', 'Course', 'Focus time (minutes)']];
  [...sessions].sort((a, b) => b.finished - a.finished).forEach(session => {
    rows.push([new Date(session.finished).toISOString(), session.title, session.course, session.seconds / 60]);
  });
  return '\uFEFF' + rows.map(row => row.map(csvCell).join(',')).join('\r\n') + '\r\n';
}
$('export-csv').addEventListener('click', () => {
  if (!state.sessions.length) return notify('Complete a focus session before exporting history.');
  const blob = new Blob([sessionsToCsv(state.sessions)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `study-history-${dayKey(Date.now())}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  notify(`Exported ${state.sessions.length} completed focus session${state.sessions.length === 1 ? '' : 's'}.`);
});
function renderProgress() {
  $('export-csv').disabled = state.sessions.length === 0;
  const courses = new Map(), days = new Map();
  let total = 0;
  state.sessions.forEach(s => { total += s.seconds; courses.set(s.course, (courses.get(s.course)||0)+s.seconds); const day = dayKey(s.finished); days.set(day, (days.get(day)||0)+s.seconds); });
  $('today').textContent = `${(days.get(dayKey(Date.now()))||0) / 60} min`;
  $('total').textContent = `${total / 60} min`;
  $('sessions').textContent = state.sessions.length;
  summary('course-summary', [...courses].sort((a,b) => b[1]-a[1]));
  summary('day-summary', [...days].sort((a,b) => b[0].localeCompare(a[0])));
  $('history').replaceChildren();
  if (!state.sessions.length) { const tr=node('tr'), td=node('td', 'No completed focus sessions yet.'); td.colSpan=4; tr.append(td); $('history').append(tr); }
  [...state.sessions].sort((a,b) => b.finished-a.finished).forEach(s => {
    const tr=node('tr');
    [new Date(s.finished).toLocaleString(), s.title, s.course, `${s.seconds/60} min`].forEach(value => tr.append(node('td', value)));
    $('history').append(tr);
  });
}
if (state.timer) { $('minutes').value = state.timer.total / 60; $('mode').value = state.timer.mode; }
renderTasks(); renderProgress(); tick();
setInterval(tick, 250);
document.addEventListener('visibilitychange', () => { tick(); renderProgress(); });
