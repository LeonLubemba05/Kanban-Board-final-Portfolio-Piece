
const TASKS_KEY = 'kanban_tasks';

/**
 * The localStorage key under which the user's theme preference is stored.
 *
 * @constant {string}
 */
const THEME_KEY = 'kanban_theme';

export function loadTasks() {
  const raw = localStorage.getItem(TASKS_KEY);

  // Key is absent — first visit or manually cleared storage.
  if (raw === null) {
    return [];
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // Stored string is not valid JSON — treat as empty and let the
    // app re-fetch from the API.
    console.warn(
      '[storage] localStorage entry for tasks could not be parsed as JSON. ' +
      'Falling back to an empty task list.'
    );
    return [];
  }

  // Parsed value must be an array — guard against objects, strings, numbers,
  // or null that could have been written by an external tool or an older
  // version of this app.
  if (!Array.isArray(parsed)) {
    console.warn(
      '[storage] Expected an array in localStorage but found:', typeof parsed,
      '. Falling back to an empty task list.'
    );
    return [];
  }

  //A valid task must be an object with a numeric id, a string title,
  // and a string status. Description is optional but normalised to a string.
  const valid = parsed.filter((item) => {
    const isObject    = item !== null && typeof item === 'object' && !Array.isArray(item);
    const hasId       = isObject && typeof item.id === 'number';
    const hasTitle    = isObject && typeof item.title === 'string';
    const hasStatus   = isObject && ['todo', 'doing', 'done'].includes(item.status);
    return isObject && hasId && hasTitle && hasStatus;
  });

  if (valid.length !== parsed.length) {
    console.warn(
      `[storage] ${parsed.length - valid.length} malformed task(s) were ` +
      'removed from the stored task list.'
    );
  }

  return valid;
}

export function saveTasks(tasks) {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    return true;
  } catch (err) {
    console.error(
      '[storage] Failed to save tasks to localStorage:', err.message
    );
    return false;
  }
}

/**
 * Loads the user's saved theme preference from localStorage.
 *
 * @returns {'light'|'dark'} The stored theme, or `'light'` if nothing is
 *   saved or the stored value is not a recognised theme name.
 */
export function loadTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  return stored === 'dark' ? 'dark' : 'light';
}

/**
 * Persists the user's theme preference to localStorage.
 *
 * @param {'light'|'dark'} theme - The theme to save.
 * @returns {void}
 */
export function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (err) {
    console.error(
      '[storage] Failed to save theme preference to localStorage:', err.message
    );
  }
}