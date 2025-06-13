/**
 * Accessibility Utility
 * 
 * This module provides comprehensive accessibility functionality for the application,
 * implementing various accessibility features and best practices.
 */

// ARIA roles
export const roles = {
  button: 'button',
  checkbox: 'checkbox',
  dialog: 'dialog',
  grid: 'grid',
  link: 'link',
  listbox: 'listbox',
  menu: 'menu',
  menubar: 'menubar',
  menuitem: 'menuitem',
  option: 'option',
  progressbar: 'progressbar',
  radio: 'radio',
  radiogroup: 'radiogroup',
  scrollbar: 'scrollbar',
  searchbox: 'searchbox',
  slider: 'slider',
  spinbutton: 'spinbutton',
  status: 'status',
  tab: 'tab',
  tablist: 'tablist',
  tabpanel: 'tabpanel',
  textbox: 'textbox',
  timer: 'timer',
  tooltip: 'tooltip',
  tree: 'tree',
  treegrid: 'treegrid',
  treeitem: 'treeitem',
};

// ARIA states and properties
export const aria = {
  // States
  expanded: 'aria-expanded',
  hidden: 'aria-hidden',
  pressed: 'aria-pressed',
  selected: 'aria-selected',
  checked: 'aria-checked',
  disabled: 'aria-disabled',
  invalid: 'aria-invalid',
  required: 'aria-required',
  busy: 'aria-busy',
  current: 'aria-current',
  live: 'aria-live',
  relevant: 'aria-relevant',
  atomic: 'aria-atomic',
  dropeffect: 'aria-dropeffect',
  grabbed: 'aria-grabbed',
  haspopup: 'aria-haspopup',
  level: 'aria-level',
  orientation: 'aria-orientation',
  posinset: 'aria-posinset',
  setsize: 'aria-setsize',
  sort: 'aria-sort',
  valuemax: 'aria-valuemax',
  valuemin: 'aria-valuemin',
  valuenow: 'aria-valuenow',
  valuetext: 'aria-valuetext',

  // Properties
  label: 'aria-label',
  labelledby: 'aria-labelledby',
  describedby: 'aria-describedby',
  controls: 'aria-controls',
  flowto: 'aria-flowto',
  owns: 'aria-owns',
  activedescendant: 'aria-activedescendant',
  autocomplete: 'aria-autocomplete',
  multiselectable: 'aria-multiselectable',
  readonly: 'aria-readonly',
  placeholder: 'aria-placeholder',
};

/**
 * Set focus to an element
 * @param element - The element to focus
 */
export const focusElement = (element: HTMLElement): void => {
  element.focus();
};

/**
 * Set focus to the first focusable element in a container
 * @param container - The container to search in
 */
export const focusFirstFocusable = (container: HTMLElement): void => {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (focusableElements.length > 0) {
    (focusableElements[0] as HTMLElement).focus();
  }
};

/**
 * Trap focus within a container
 * @param container - The container to trap focus in
 */
export const trapFocus = (container: HTMLElement): void => {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstFocusable = focusableElements[0] as HTMLElement;
  const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

  container.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    }
  });
};

/**
 * Announce a message to screen readers
 * @param message - The message to announce
 * @param politeness - The politeness level
 */
export const announce = (
  message: string,
  politeness: 'polite' | 'assertive' = 'polite'
): void => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', politeness);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.style.position = 'absolute';
  announcement.style.left = '-9999px';
  announcement.style.height = '1px';
  announcement.style.overflow = 'hidden';
  announcement.textContent = message;
  document.body.appendChild(announcement);
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Check if an element is visible to screen readers
 * @param element - The element to check
 * @returns Whether the element is visible to screen readers
 */
export const isVisibleToScreenReaders = (element: HTMLElement): boolean => {
  const style = window.getComputedStyle(element);
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0' &&
    element.getAttribute('aria-hidden') !== 'true'
  );
};

/**
 * Get the accessible name of an element
 * @param element - The element to get the name from
 * @returns The accessible name
 */
export const getAccessibleName = (element: HTMLElement): string => {
  const label = element.getAttribute('aria-label');
  if (label) return label;

  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const labels = labelledBy.split(' ').map((id) => {
      const labelElement = document.getElementById(id);
      return labelElement ? labelElement.textContent : '';
    });
    return labels.join(' ');
  }

  if (element instanceof HTMLInputElement) {
    const label = element.labels?.[0]?.textContent;
    if (label) return label;
  }

  return element.textContent || '';
};

/**
 * Check if an element is keyboard focusable
 * @param element - The element to check
 * @returns Whether the element is keyboard focusable
 */
export const isKeyboardFocusable = (element: HTMLElement): boolean => {
  const tag = element.tagName.toLowerCase();
  const type = (element as HTMLInputElement).type;
  const tabIndex = element.getAttribute('tabindex');

  if (tabIndex === '-1') return false;
  if (tabIndex !== null) return true;

  switch (tag) {
    case 'a':
    case 'area':
      return element.hasAttribute('href');
    case 'input':
      return type !== 'hidden';
    case 'button':
    case 'select':
    case 'textarea':
      return !element.hasAttribute('disabled');
    default:
      return false;
  }
};

/**
 * Make an element keyboard focusable
 * @param element - The element to make focusable
 */
export const makeFocusable = (element: HTMLElement): void => {
  element.setAttribute('tabindex', '0');
};

/**
 * Make an element not keyboard focusable
 * @param element - The element to make not focusable
 */
export const makeNotFocusable = (element: HTMLElement): void => {
  element.setAttribute('tabindex', '-1');
};

/**
 * Check if an element is in the viewport
 * @param element - The element to check
 * @returns Whether the element is in the viewport
 */
export const isInViewport = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= window.innerHeight &&
    rect.right <= window.innerWidth
  );
};

/**
 * Scroll an element into view
 * @param element - The element to scroll into view
 * @param behavior - The scroll behavior
 */
export const scrollIntoView = (
  element: HTMLElement,
  behavior: ScrollBehavior = 'smooth'
): void => {
  element.scrollIntoView({
    behavior,
    block: 'nearest',
  });
}; 