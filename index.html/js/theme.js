/** @type {HTMLElement} The root element; receives [data-theme="light|dark"]. */
const htmlEl = document.documentElement;

/** @type {HTMLImageElement|null} Sidebar logo (desktop). */
const sidebarLogo = document.getElementById('sidebar-logo');

/** @type {HTMLImageElement|null} Topbar logo (mobile). */
const topbarLogo = document.getElementById('topbar-logo');

/** @type {HTMLButtonElement|null} Theme toggle in the desktop sidebar. */
const desktopToggle = document.getElementById('theme-toggle-btn');

/** @type {HTMLButtonElement|null} Theme toggle in the mobile menu. */
const mobileToggle = document.getElementById('mobile-theme-toggle-btn');

/** @constant {string} */
const LOGO_LIGHT = 'assets/logo-light.svg';

/** @constant {string} */
const LOGO_DARK  = 'assets/logo-dark.svg';

function applyTheme(theme) {
  const isDark = theme === 'dark';

  // --- 1. Set CSS token root ---
  htmlEl.setAttribute('data-theme', theme);

  // --- 2. Swap logos ---
  const logoSrc = isDark ? LOGO_DARK : LOGO_LIGHT;

  if (sidebarLogo) {
    sidebarLogo.src = logoSrc;
    sidebarLogo.alt = 'Kanban';
  }

  if (topbarLogo) {
    topbarLogo.src = logoSrc;
    topbarLogo.alt = 'Kanban';
  }

  // --- 3. Sync both toggle buttons ---
  const checked = String(isDark); // "true" | "false"

  if (desktopToggle) {
    desktopToggle.setAttribute('aria-checked', checked);
  }

  if (mobileToggle) {
    mobileToggle.setAttribute('aria-checked', checked);
  }
}


export function initTheme(loadTheme, saveTheme) {
  // Apply the saved preference immediately — runs before first paint.
  const savedTheme = loadTheme();
  applyTheme(savedTheme);

  function handleToggle() {
    const currentTheme = htmlEl.getAttribute('data-theme');
    const nextTheme    = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    saveTheme(nextTheme);
  }

  if (desktopToggle) {
    desktopToggle.addEventListener('click', handleToggle);
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('click', handleToggle);
  }
}