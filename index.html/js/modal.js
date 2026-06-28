

/** @type {HTMLDialogElement} */
const dialog       = document.getElementById('task-modal');

/** @type {HTMLHeadingElement} */
const modalTitle   = document.getElementById('modal-title');

/** @type {HTMLInputElement} */
const titleInput   = document.getElementById('modal-task-title');

/** @type {HTMLTextAreaElement} */
const descInput    = document.getElementById('modal-task-description');

/** @type {HTMLSelectElement} */
const statusSelect = document.getElementById('modal-task-status');

/** @type {HTMLButtonElement} */
const saveBtn      = document.getElementById('modal-save-btn');

/** @type {HTMLButtonElement} */
const deleteBtn    = document.getElementById('modal-delete-btn');

/** @type {HTMLButtonElement} */
const closeBtn     = document.getElementById('modal-close-btn');


/**
 * Tracks the callback to invoke when the Save button is clicked.
 * Replaced on every modal open so stale callbacks never fire.
 *
 * @type {function|null}
 */
let activeSaveHandler = null;

/**
 * Tracks the callback to invoke when the Delete button is clicked.
 * Null in Add mode (Delete button is hidden).
 *
 * @type {function|null}
 */
let activeDeleteHandler = null;


/**
 * Clears all form fields and removes any validation error styling.
 *
 * @returns {void}
 */
function clearFields() {
  titleInput.value       = '';
  descInput.value        = '';
  statusSelect.value     = 'todo';
  titleInput.classList.remove('modal__input--error');
}

function validateForm() {
  if (titleInput.value.trim() === '') {
    titleInput.classList.add('modal__input--error');
    titleInput.focus();

    // Remove the error style as soon as the user starts correcting.
    titleInput.addEventListener(
      'input',
      () => titleInput.classList.remove('modal__input--error'),
      { once: true }
    );

    return false;
  }
  return true;
}

/**
 * Reads the current values from the modal form fields and returns
 * a partial task object ready to be merged by the caller.
 *
 * @returns {{ title: string, description: string, status: string }}
 */
function readFields() {
  return {
    title:       titleInput.value.trim(),
    description: descInput.value.trim(),
    status:      statusSelect.value,
  };
}

function closeModal() {
  dialog.close();
  activeSaveHandler   = null;
  activeDeleteHandler = null;
  titleInput.classList.remove('modal__input--error');
}

function handleSave() {
  if (!validateForm()) return;
  if (typeof activeSaveHandler === 'function') {
    activeSaveHandler(readFields());
  }
  closeModal();
}

function handleDelete() {
  const confirmed = window.confirm(
    'Are you sure you want to delete this task? This action cannot be undone.'
  );
  if (!confirmed) return;

  if (typeof activeDeleteHandler === 'function') {
    activeDeleteHandler();
  }
  closeModal();
}

/** Close button (×) */
closeBtn.addEventListener('click', closeModal);

/** Save button */
saveBtn.addEventListener('click', handleSave);

/** Delete button */
deleteBtn.addEventListener('click', handleDelete);


dialog.addEventListener('click', (event) => {
  if (event.target === dialog) {
    closeModal();
  }
});

dialog.addEventListener('cancel', (event) => {
  event.preventDefault();
  closeModal();
});

export function openAddModal(onSave) {
  clearFields();

  modalTitle.textContent  = 'Add New Task';
  saveBtn.textContent     = 'Create Task';

  // Hide Delete — not applicable in Add mode.
  deleteBtn.setAttribute('hidden', '');

  // Register callbacks for this session.
  activeSaveHandler   = onSave;
  activeDeleteHandler = null;

  dialog.showModal();
  titleInput.focus();
}

export function openEditModal(task, onSave, onDelete) {
  // Pre-populate fields with the task's current values.
  titleInput.value   = task.title;
  descInput.value    = task.description;
  statusSelect.value = task.status;
  titleInput.classList.remove('modal__input--error');

  modalTitle.textContent = 'Edit Task';
  saveBtn.textContent    = 'Save Changes';

  // Show Delete button — visible only in Edit mode.
  deleteBtn.removeAttribute('hidden');

  // Register callbacks for this session.
  activeSaveHandler   = onSave;
  activeDeleteHandler = onDelete;

  dialog.showModal();
  titleInput.focus();
}