import { fetchTasks }                              from './api.js';
import { loadTasks, saveTasks, loadTheme, saveTheme } from './storage.js';
import {
  renderBoard,
  showLoadingState,
  hideLoadingState,
  showErrorState,
  hideErrorState,
}                                                  from './render.js';
import { openAddModal, openEditModal }             from './modal.js';
import { initSidebar }                             from './sidebar.js';
import { initTheme }                               from './theme.js';

/**
 * Stores all tasks currently loaded in the application.
 * @type {import('./api.js').Task[]}
 */
let tasks = [];

/** @type {HTMLButtonElement} Desktop header "Add New Task" button. */
const addTaskBtn = document.getElementById('add-task-btn');

/** @type {HTMLButtonElement} Mobile topbar "+" button. */
const mobileAddTaskBtn = document.getElementById('mobile-add-task-btn');

/** @type {HTMLButtonElement} Retry button shown in the error state. */
const retryBtn = document.getElementById('retry-btn');

/**
 * Generates a unique ID for a new task.
 * @returns {number}
 */
function generateId() {
  return Date.now();
}

/**
 * Adds a new task and updates the board.
 *
 * @param {{ title: string, description: string, status: string }} fields
 */
function addTask(fields) {
  /** @type {import('./api.js').Task} */
  const newTask = {
    id:          generateId(),
    title:       fields.title,
    description: fields.description,
    status:      fields.status,
  };

  tasks = [...tasks, newTask];
  saveTasks(tasks);
  renderBoard(tasks, handleTaskClick);
}


function editTask(id, fields) {
  tasks = tasks.map((task) =>
    task.id === id
      ? { ...task, title: fields.title, description: fields.description, status: fields.status }
      : task
  );
  saveTasks(tasks);
  renderBoard(tasks, handleTaskClick);
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks(tasks);
  renderBoard(tasks, handleTaskClick);
}

// ---------------------------------------------------------------------------
// Event handlers
// ---------------------------------------------------------------------------

/**
 * Click handler attached to every task card via renderBoard.
 * Finds the task with the given ID and opens the Edit modal.
 * Passed as a callback to render.js so it never needs to import main.js.
 *
 * @param {number} id - The ID of the clicked task.
 * @returns {void}
 */
function handleTaskClick(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  openEditModal(
    task,
    (fields) => editTask(id, fields),   // onSave
    ()       => deleteTask(id),         // onDelete
  );
}

/**
 * Opens the Add Task modal with a save callback that creates a new task.
 * Shared by both the desktop header button and the mobile topbar button.
 *
 * @returns {void}
 */
function handleAddTaskClick() {
  openAddModal((fields) => addTask(fields));
}

/**
 * Loads tasks from localStorage or the API,
 * then renders the board.
 *
 * @async
 */
async function loadAndRender() {
  showLoadingState();
  hideErrorState();

  const stored = loadTasks();

  if (stored.length > 0) {
    // Tasks exist in localStorage — no network request needed.
    tasks = stored;
    hideLoadingState();
    renderBoard(tasks, handleTaskClick);
    return;
  }

  // Nothing in localStorage — fetch from the API.
  try {
    const fetched = await fetchTasks();
    tasks = fetched;
    saveTasks(tasks);
    hideLoadingState();
    renderBoard(tasks, handleTaskClick);
  } catch (err) {
    // fetchTasks() throws a descriptive Error — surface its message.
    hideLoadingState();
    showErrorState(err.message);
  }
}

/**
 * Initializes the application.
 */
function init() {
  // Initialise sidebar (desktop toggle + mobile menu).
  initSidebar();

  // Initialise theme (reads saved preference, applies to <html>, wires toggles).
  initTheme(loadTheme, saveTheme);

  // Wire Add Task buttons — both desktop and mobile share the same handler.
  addTaskBtn.addEventListener('click', handleAddTaskClick);
  mobileAddTaskBtn.addEventListener('click', handleAddTaskClick);

  // Wire Retry button (visible only in the error state).
  retryBtn.addEventListener('click', loadAndRender);

  loadAndRender();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}