
const API_BASE_URL = 'https://jsl-kanban-api.vercel.app';

/**
 * @typedef {Object} Task
 * @property {number}  id          - Unique task identifier.
 * @property {string}  title       - Task title.
 * @property {string}  description - Task description (may be an empty string).
 * @property {'todo'|'doing'|'done'} status - Current workflow status.
 */

/**
 * Normalizes a raw task object received from the API.
 *
 * Ensures the task has the correct data types and a valid status.
 *
 * @param {Object} raw - The raw task object from the API.
 * @returns {Task} The normalized task object.
 */

function normalizeTask(raw) {
  const VALID_STATUSES = ['todo', 'doing', 'done'];

  const status = VALID_STATUSES.includes(raw.status)
    ? raw.status
    : 'todo';

  return {
    id:          Number(raw.id),
    title:       String(raw.title ?? '').trim(),
    description: String(raw.description ?? '').trim(),
    status,
  };
}

/**
 * Fetches tasks from the Kanban API.
 *
 * @async
 * @returns {Promise<Task[]>} An array of normalized tasks.
 * @throws {Error} If the request fails or the API returns invalid data.
 */
export async function fetchTasks() {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/`);
  } catch (networkError) {
    // fetch() itself threw — no connection could be made at all.
    throw new Error(
      'Unable to reach the server. Please check your internet connection and try again.'
    );
  }

  if (!response.ok) {
    // Server responded but with a failure status (4xx / 5xx).
    throw new Error(
      `Failed to load tasks. The server responded with status ${response.status} (${response.statusText}).`
    );
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(
      'Received an unexpected response from the server. Please try again later.'
    );
  }

  // The API returns an array at the root level.
  if (!Array.isArray(data)) {
    throw new Error(
      'Unexpected data format received from the server. Expected an array of tasks.'
    );
  }

  return data.map(normalizeTask);
}