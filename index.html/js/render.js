
const COLUMN_CONFIG = [
  { status: 'todo',  listId: 'tasks-todo',  countId: 'count-todo'  },
  { status: 'doing', listId: 'tasks-doing', countId: 'count-doing' },
  { status: 'done',  listId: 'tasks-done',  countId: 'count-done'  },
];

function createTaskCard(task, onTaskClick) {
  const li = document.createElement('li');

  const button = document.createElement('button');
  button.className = 'task-card';
  button.setAttribute('type', 'button');
  button.setAttribute('aria-label', `Edit task: ${task.title}`);
  button.dataset.taskId = String(task.id);

  const title = document.createElement('p');
  title.className = 'task-card__title';
  title.textContent = task.title;

  button.appendChild(title);
  li.appendChild(button);

  // Single click handler per card — closure captures task.id.
  button.addEventListener('click', () => {
    onTaskClick(task.id);
  });

  return li;
}

/**
 * Updates the text content of a column's task count badge.
 *
 * @param {string} countId  - The `id` of the `<span>` count element.
 * @param {number} count    - The number to display.
 * @returns {void}
 */
function updateColumnCount(countId, count) {
  const countEl = document.getElementById(countId);
  if (countEl) {
    countEl.textContent = String(count);
  }
}

export function renderBoard(tasks, onTaskClick) {
  // --- 1. Group tasks by status in one pass ---
  const grouped = tasks.reduce((acc, task) => {
    if (!acc[task.status]) {
      acc[task.status] = [];
    }
    acc[task.status].push(task);
    return acc;
  }, /** @type {Object.<string, import('./api.js').Task[]>} */ ({}));

  // --- 2. Render each column ---
  COLUMN_CONFIG.forEach(({ status, listId, countId }) => {
    const listEl = document.getElementById(listId);
    if (!listEl) return; // Guard: element must exist in the DOM.

    const columnTasks = grouped[status] ?? [];

    // Build all cards off-screen first to minimise reflows.
    const fragment = document.createDocumentFragment();
    columnTasks.forEach((task) => {
      fragment.appendChild(createTaskCard(task, onTaskClick));
    });

    // Clear the current column content and insert the new cards
    // in a single operation.
    listEl.replaceChildren(fragment);

    // Update the count badge.
    updateColumnCount(countId, columnTasks.length);
  });

  // Also sync the sidebar/topbar board count (always 1 board in this app).
  updateBoardCount(1);
}

export function updateBoardCount(count) {
  ['board-count', 'mobile-board-count'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = String(count);
  });
}

/**
 * Shows the loading state overlay and hides the board.
 * Called by main.js before the API fetch begins.
 *
 * @returns {void}
 */
export function showLoadingState() {
  document.getElementById('loading-state')?.removeAttribute('hidden');
  document.getElementById('error-state')?.setAttribute('hidden', '');
  document.getElementById('board')?.setAttribute('hidden', '');
}

export function hideLoadingState() {
  document.getElementById('loading-state')?.setAttribute('hidden', '');
  document.getElementById('board')?.removeAttribute('hidden');
}

export function showErrorState(message) {
  document.getElementById('loading-state')?.setAttribute('hidden', '');
  document.getElementById('board')?.setAttribute('hidden', '');

  const errorState = document.getElementById('error-state');
  const errorText  = document.getElementById('error-text');

  if (errorText)  errorText.textContent = message;
  if (errorState) errorState.removeAttribute('hidden');
}

export function hideErrorState() {
  document.getElementById('error-state')?.setAttribute('hidden', '');
}