
/** @type {HTMLElement} */
const sidebar = document.getElementById('sidebar');

/** @type {HTMLElement} */
const contentWrapper = document.getElementById('content-wrapper');

/** @type {HTMLButtonElement} */
const hideSidebarBtn = document.getElementById('hide-sidebar-btn');

/** @type {HTMLButtonElement} */
const showSidebarBtn = document.getElementById('show-sidebar-btn');

/** @type {HTMLButtonElement} */
const mobileMenuBtn = document.getElementById('mobile-menu-btn');

/** @type {HTMLElement} */
const mobileMenu = document.getElementById('mobile-menu');

/** @type {HTMLElement} */
const mobileMenuScrim = document.getElementById('mobile-menu-scrim');


/** @type {boolean} */
let isSidebarVisible = true;

/** @type {boolean} */
let isMobileMenuOpen = false;

function hideSidebar() {
  sidebar.classList.add('sidebar--hidden');
  contentWrapper.classList.add('content-wrapper--expanded');

  // Reveal the floating show-sidebar button.
  showSidebarBtn.removeAttribute('hidden');

  // ARIA: sidebar is now collapsed.
  hideSidebarBtn.setAttribute('aria-expanded', 'false');
  showSidebarBtn.setAttribute('aria-expanded', 'false');

  isSidebarVisible = false;
}

function showSidebar() {
  sidebar.classList.remove('sidebar--hidden');
  contentWrapper.classList.remove('content-wrapper--expanded');

  // Hide the floating show-sidebar button.
  showSidebarBtn.setAttribute('hidden', '');

  // ARIA: sidebar is now expanded.
  hideSidebarBtn.setAttribute('aria-expanded', 'true');
  showSidebarBtn.setAttribute('aria-expanded', 'true');

  isSidebarVisible = true;
}

function openMobileMenu() {
  mobileMenu.removeAttribute('hidden');
  mobileMenuBtn.setAttribute('aria-expanded', 'true');
  isMobileMenuOpen = true;
}

/**
 * Closes the mobile navigation menu panel and scrim,
 * and updates the menu-toggle button's ARIA state.
 *
 * @returns {void}
 */
function closeMobileMenu() {
  mobileMenu.setAttribute('hidden', '');
  mobileMenuBtn.setAttribute('aria-expanded', 'false');
  isMobileMenuOpen = false;
}

export function initSidebar() {
  // --- Desktop: Hide sidebar ---
  hideSidebarBtn.addEventListener('click', hideSidebar);

  // --- Desktop: Show sidebar (floating button) ---
  showSidebarBtn.addEventListener('click', showSidebar);

  // --- Mobile: Toggle menu open/closed ---
  mobileMenuBtn.addEventListener('click', () => {
    if (isMobileMenuOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  // --- Mobile: Close menu when scrim is clicked ---
  mobileMenuScrim.addEventListener('click', closeMobileMenu);

  // --- Keyboard: Escape closes the mobile menu ---
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isMobileMenuOpen) {
      closeMobileMenu();
      // Return focus to the menu toggle button so keyboard users
      // are not stranded after closing.
      mobileMenuBtn.focus();
    }
  });
}

export function getSidebarState() {
  return isSidebarVisible;
}

export function closeMobileMenuExternal() {
  if (isMobileMenuOpen) {
    closeMobileMenu();
  }
}