/* ================================================================
   script.js — Alex Morgan Personal Landing Page
   ================================================================ */

/* ----------------------------------------------------------------
   1. DOM References
   ---------------------------------------------------------------- */
const navbar      = document.getElementById('navbar');
const hamburger   = document.getElementById('hamburger');
const mobileMenu  = document.getElementById('mobileMenu');
const themeToggle = document.getElementById('themeToggle');
const scrollTopBtn= document.getElementById('scrollTop');
const yearSpan    = document.getElementById('year');
const contactForm = document.getElementById('contactForm');
const submitBtn   = document.getElementById('submitBtn');
const formFeedback= document.getElementById('formFeedback');

/* ----------------------------------------------------------------
   2. Dynamic Year in Footer
   ---------------------------------------------------------------- */
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

/* ----------------------------------------------------------------
   3. Theme Toggle (Dark / Light)
   ---------------------------------------------------------------- */
const THEME_KEY = 'am-theme';

/**
 * Apply the given theme to <html> and save to localStorage.
 * @param {'light'|'dark'} theme
 */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  themeToggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
}

// Restore saved preference, then fall back to OS preference
(function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) {
    applyTheme(saved);
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }
})();

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

/* ----------------------------------------------------------------
   4. Sticky Navbar — add "scrolled" class after 20px
   ---------------------------------------------------------------- */
function handleNavbarScroll() {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}
window.addEventListener('scroll', handleNavbarScroll, { passive: true });
handleNavbarScroll(); // run once on load

/* ----------------------------------------------------------------
   5. Hamburger / Mobile Menu Toggle
   ---------------------------------------------------------------- */
hamburger.addEventListener('click', () => {
  const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
  const newState = !isOpen;

  hamburger.setAttribute('aria-expanded', String(newState));
  mobileMenu.hidden = !newState;
});

// Close mobile menu when a link is clicked
mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', closeMobileMenu);
});

// Close when clicking outside the navbar
document.addEventListener('click', (e) => {
  if (!navbar.contains(e.target)) closeMobileMenu();
});

function closeMobileMenu() {
  hamburger.setAttribute('aria-expanded', 'false');
  mobileMenu.hidden = true;
}

/* ----------------------------------------------------------------
   6. Active Nav Link on Scroll (IntersectionObserver)
   ---------------------------------------------------------------- */
const sections   = document.querySelectorAll('section[id]');
const navLinks   = document.querySelectorAll('.nav-link');
const mobileLinks= document.querySelectorAll('.mobile-link');

/**
 * Mark the nav link whose data-section matches `sectionId` as active.
 * @param {string} sectionId
 */
function setActiveLink(sectionId) {
  [...navLinks, ...mobileLinks].forEach(link => {
    link.classList.toggle('active', link.dataset.section === sectionId);
  });
}

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setActiveLink(entry.target.id);
      }
    });
  },
  {
    // Trigger when section is at least 35% in view, offset for navbar height
    rootMargin: `-${getComputedStyle(document.documentElement)
      .getPropertyValue('--nav-h').trim() || '70px'} 0px -55% 0px`,
    threshold: 0,
  }
);

sections.forEach(sec => sectionObserver.observe(sec));

/* ----------------------------------------------------------------
   7. Smooth-Scroll for All Anchor Links
   ---------------------------------------------------------------- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();

    // Close mobile menu before scrolling
    closeMobileMenu();

    const navH = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '70',
      10
    );
    const top = target.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ----------------------------------------------------------------
   8. Scroll-to-Top Button
   ---------------------------------------------------------------- */
function handleScrollTopVisibility() {
  const show = window.scrollY > 400;
  scrollTopBtn.hidden = !show;
}
window.addEventListener('scroll', handleScrollTopVisibility, { passive: true });
handleScrollTopVisibility();

scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ----------------------------------------------------------------
   9. Scroll-Reveal Animations (IntersectionObserver)
   ---------------------------------------------------------------- */
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Once revealed, stop observing to free up resources
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

revealElements.forEach(el => revealObserver.observe(el));

/* ----------------------------------------------------------------
   10. Contact Form — Validation & Simulated Submission
   ---------------------------------------------------------------- */

/** Regex for basic email format validation */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Show an inline field error message.
 * @param {HTMLElement} input
 * @param {HTMLElement} errorEl
 * @param {string}      message
 */
function showFieldError(input, errorEl, message) {
  input.classList.add('error');
  errorEl.textContent = message;
}

/**
 * Clear an inline field error message.
 * @param {HTMLElement} input
 * @param {HTMLElement} errorEl
 */
function clearFieldError(input, errorEl) {
  input.classList.remove('error');
  errorEl.textContent = '';
}

/**
 * Validate the entire form. Returns true if valid.
 * @returns {boolean}
 */
function validateForm() {
  const nameInput    = document.getElementById('name');
  const emailInput   = document.getElementById('email');
  const messageInput = document.getElementById('message');
  const nameError    = document.getElementById('nameError');
  const emailError   = document.getElementById('emailError');
  const messageError = document.getElementById('messageError');

  let valid = true;

  // Clear previous errors
  clearFieldError(nameInput,    nameError);
  clearFieldError(emailInput,   emailError);
  clearFieldError(messageInput, messageError);

  // Name validation
  if (!nameInput.value.trim()) {
    showFieldError(nameInput, nameError, 'Please enter your full name.');
    valid = false;
  } else if (nameInput.value.trim().length < 2) {
    showFieldError(nameInput, nameError, 'Name must be at least 2 characters.');
    valid = false;
  }

  // Email validation
  if (!emailInput.value.trim()) {
    showFieldError(emailInput, emailError, 'Please enter your email address.');
    valid = false;
  } else if (!EMAIL_RE.test(emailInput.value.trim())) {
    showFieldError(emailInput, emailError, 'Please enter a valid email address.');
    valid = false;
  }

  // Message validation
  if (!messageInput.value.trim()) {
    showFieldError(messageInput, messageError, 'Please enter a message.');
    valid = false;
  } else if (messageInput.value.trim().length < 10) {
    showFieldError(messageInput, messageError, 'Message must be at least 10 characters.');
    valid = false;
  }

  return valid;
}

/**
 * Display the global form feedback banner.
 * @param {'success'|'error'} type
 * @param {string}            message
 */
function showFormFeedback(type, message) {
  formFeedback.hidden = false;
  formFeedback.className = `form-feedback ${type === 'success' ? 'success' : 'error-msg'}`;
  formFeedback.textContent = message;

  // Auto-dismiss after 6 seconds
  if (type === 'success') {
    setTimeout(() => { formFeedback.hidden = true; }, 6000);
  }
}

/**
 * Simulate an async form submission (replace with Formspree / EmailJS call).
 * Returns a Promise that resolves after ~1.4 s (mimics a real network round-trip).
 * @param {{ name: string, email: string, message: string }} data
 * @returns {Promise<void>}
 */
function simulateSubmit(data) {
  console.log('[ContactForm] Submitting:', data); // For demo purposes
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate ~95% success rate so the error path can be tested too
      Math.random() > 0.05 ? resolve() : reject(new Error('Server error'));
    }, 1400);
  });
}

/* ---- Real Formspree integration (optional) ----
   Replace simulateSubmit with the function below and set your endpoint.

async function sendViaFormspree(data) {
  const ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Formspree error');
}
------------------------------------------------- */

// Clear error styling when user starts editing
['name', 'email', 'message'].forEach(id => {
  const input   = document.getElementById(id);
  const errorEl = document.getElementById(`${id}Error`);
  if (!input) return;
  input.addEventListener('input', () => clearFieldError(input, errorEl));
});

// Form submit handler
contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Hide any previous feedback banner
  formFeedback.hidden = true;

  // Run validation
  if (!validateForm()) {
    // Focus the first invalid field
    contactForm.querySelector('.error')?.focus();
    return;
  }

  const data = {
    name:    document.getElementById('name').value.trim(),
    email:   document.getElementById('email').value.trim(),
    message: document.getElementById('message').value.trim(),
  };

  // Set loading state
  submitBtn.classList.add('loading');
  submitBtn.disabled = true;

  try {
    await simulateSubmit(data);

    // Success
    showFormFeedback('success', '✅ Message sent! I\'ll get back to you within 24 hours.');
    contactForm.reset();

    // Clear any lingering error classes after reset
    contactForm.querySelectorAll('input, textarea').forEach(el => el.classList.remove('error'));

  } catch (err) {
    // Error
    showFormFeedback('error', '❌ Something went wrong. Please try again or email me directly.');
    console.error('[ContactForm] Submission failed:', err);

  } finally {
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
  }
});

/* ----------------------------------------------------------------
   11. Typing Cursor Effect on Hero Title (subtle polish)
   ---------------------------------------------------------------- */
(function typingCursor() {
  const titleEl = document.querySelector('.hero-title');
  if (!titleEl) return;

  const cursor = document.createElement('span');
  cursor.textContent = '|';
  cursor.style.cssText = [
    'color: var(--clr-primary)',
    'margin-left: 2px',
    'animation: blink 1s step-end infinite',
    'font-weight: 300',
    'font-size: .9em',
    'vertical-align: baseline',
  ].join(';');

  // Inject keyframes once
  if (!document.getElementById('blinkKF')) {
    const style = document.createElement('style');
    style.id = 'blinkKF';
    style.textContent = '@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }';
    document.head.appendChild(style);
  }

  titleEl.appendChild(cursor);

  // Remove cursor after 4 s (the page has fully loaded by then)
  setTimeout(() => cursor.remove(), 4000);
})();

/* ----------------------------------------------------------------
   12. Keyboard Accessibility — close mobile menu on Escape
   ---------------------------------------------------------------- */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMobileMenu();
});
