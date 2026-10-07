# Study Session Tracker

A small browser application for planning study tasks, timing focused work, and reviewing study progress. Built with HTML, CSS, and JavaScript. No account, API key, or third-party runtime dependency is required.

## Major functionalities

1. **Task management:** create, edit, complete, reopen, and delete tasks, with a course or subject for each task.
2. **Session timing:** choose a task, configure a 1–180 minute focus or break session, and start, pause, resume, or reset the countdown. A timestamp-based timer survives page reloads. Active tasks cannot be changed until the session ends or is reset.
3. **Progress tracking:** completed focus sessions are saved with task, course, completion time, and duration. View today's focus minutes, total focus minutes, session count, course totals, daily totals, and session history.

Tasks and sessions persist in browser localStorage. Task deletion keeps historical session records. Breaks and unfinished sessions are excluded from focus statistics.

## Open-source reference

**Pomotasking**, by Samuel Simões: https://github.com/samuelsimoes/pomotasking

Pomotasking is a GPL-3.0-licensed Chrome extension combining a Pomodoro timer with a to-do list. Its published description informed the choice of a small, personal task-and-timer application. This project independently implements the same core workflow as a regular webpage and adds course-based study summaries.

| Area | Reference | This implementation |
| --- | --- | --- |
| Main purpose | Personal tasks with a Pomodoro timer | Personal study tasks with a focus/break timer |
| Delivery | Chrome extension | Static webpage |
| Task and timer workflow | Integrated to-do list and timer | Task selection, countdown, pause/resume/reset |
| Additional project functionality | Not assumed from the reference description | Course/day summaries and saved session history |

The comparison is to the reference's task-and-timer scope, not extension packaging or exact feature parity. No reference source code or assets were copied. This is an independent AI-assisted implementation, not a fork.

## AI tools used

**OpenAI ChatGPT / Codex** was used to plan the features, generate the HTML/CSS/JavaScript implementation and build script, draft documentation, and execute functional checks in a simulated browser environment (jsdom). The reference was consulted for functional context through its repository description and README, not as code to copy.

## Run locally

Download and extract the repository, then open `index.html` in a modern browser. Keep `styles.css` and `app.js` in the same directory. For consistent local storage behavior, use a local server instead:

```sh
python -m http.server 8000
```

Open http://localhost:8000. On Windows, `py -m http.server 8000` is an alternative if Python is installed through the Python launcher.

## Build

With Node.js installed, run:

```sh
npm run build
```

No `npm install` is needed. The build copies the three application assets into `dist/`. Serve that directory with `python -m http.server 8000 --directory dist`, or host the root assets directly with GitHub Pages.

## GitHub Pages

In this repository, choose **Settings → Pages → Deploy from a branch → main → / (root) → Save**. After deployment finishes, the app will be available at https://SakifT.github.io/study-session-tracker/ .

## Quick manual check

1. Add a task and course; edit the task; complete and reopen it.
2. Select the task, set a one-minute focus session, start it, pause, then resume.
3. Reload while it is running; check that the countdown resumes from the saved deadline.
4. Let it finish. Verify one session, one focus minute, and matching course/day totals.
5. Reload again and verify the task and history remain.
6. Reset an unfinished session and complete a break. Neither should add focus time.
7. Delete the task; verify its completed session remains in history.

## File guide

- `index.html`: accessible page structure and form controls.
- `styles.css`: desktop and mobile layout.
- `app.js`: task operations, timer transitions, persistence, and summaries.
- `build.js`: dependency-free static asset build.
- `package.json`: project metadata and build command.

## Limitations and future work

Use one tab at a time; simultaneous tab edits are not synchronized. Data stays in the current browser and origin; clearing browser data removes it. The timer counts elapsed clock time, including time while the page is closed, and records completion when the page next opens. It cannot detect whether the user was studying. There is no background alarm while the browser is closed. Completion dates use the local timezone. Changing the system clock may affect an active timer.

Planned improvements: weekly study goals and configurable automatic break cycles. These are future tasks, not implemented features.

## Validation performed

The static build and JavaScript syntax checks passed. Automated jsdom checks exercised task creation/editing/completion/reopening/deletion, pause/resume, restoring a running timer, exactly-once session recording, saved history, reset and break exclusion, and safe text rendering. A full visual browser check was not available in the development environment; use the manual check above in your browser.

## Sprint 1 CSV export (Issue #1)

Click **Export CSV** beside Session history to download completed focus sessions, newest first. The export contains the completion timestamp in UTC, task, course, and focus minutes. The button is disabled when history is empty. Breaks and unfinished sessions are not exported. Exporting does not change saved data.

CSV fields support commas, quotes, line breaks, and Unicode. Formula-like text receives a leading apostrophe so spreadsheet applications treat it as text. ChatGPT / Codex assisted with implementation and automated checks.

Manual check: complete a focus session, export, and open the downloaded CSV. Verify its task, course, minutes, and timestamp. Reload and export again to confirm saved history is included.

## Sprint 1 task filters (Issue #3)

Use **Filter by course** and **Filter by status** above the task list. Course choices come from existing tasks; statuses are All statuses, Open, and Completed. Both filters apply together. **Clear filters** restores the full list, and a count shows how many tasks match. A message appears when nothing matches.

Filters update after adding, editing, completing, reopening, or deleting a task. If a selected course no longer exists, the course filter resets to All courses. Filters affect only the task list: saved tasks, history, and timer choices remain intact. Reloading starts with all tasks visible.

ChatGPT / Codex assisted with implementation and automated checks. Manual check: add tasks in two courses, complete one, try each filter and their combination, then clear the filters. Check that completing or reopening a task updates the filtered list.

## Sprint 1 persistent dark mode (Issue #5)

Use the **Dark mode** toggle in the header to switch between light and dark themes. The toggle indicates whether dark mode is active for assistive technology. Your choice is saved in a separate browser localStorage key and applied before rendering on the next visit. The initial default is light mode.

Both themes cover panels, form controls, buttons, tables, text, and focus indicators. If storage is unavailable, toggling still works for the current visit and a message explains that the preference could not be saved. Task and session data are unchanged.

ChatGPT / Codex assisted with implementation and automated checks. Manual check: enable dark mode, refresh, and confirm it remains enabled; switch to light mode and repeat. Also test task filters, the timer, and CSV export in dark mode.
