/* ==========================================================================
   PRAISEBANKS STUDIOS — SHARED BEHAVIOR
   Loaded on every page. Each block is null-checked so pages that don't
   contain a given element simply skip that behavior — safe to add more
   pages later without touching this file.
   ========================================================================== */

// ---------- Theme system: mode (dark/light) + palette (gold/purple) ----------
(function () {
  var root = document.documentElement;

  var savedMode = localStorage.getItem('praisebanks-mode');
  var savedPalette = localStorage.getItem('praisebanks-palette');
  if (savedMode) { root.setAttribute('data-mode', savedMode); }
  if (savedPalette) { root.setAttribute('data-palette', savedPalette); }

  var modeBtn = document.getElementById('themeToggle');
  if (modeBtn) {
    modeBtn.addEventListener('click', function () {
      var next = root.getAttribute('data-mode') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-mode', next);
      localStorage.setItem('praisebanks-mode', next);
    });
  }

  var paletteBtn = document.getElementById('paletteToggle');
  if (paletteBtn) {
    paletteBtn.addEventListener('click', function () {
      var next = root.getAttribute('data-palette') === 'purple' ? 'gold' : 'purple';
      root.setAttribute('data-palette', next);
      localStorage.setItem('praisebanks-palette', next);
    });
  }
})();

// ---------- Mobile nav menu (full-screen overlay) ----------
(function () {
  var menuToggle = document.getElementById('menuToggle');
  var overlay = document.getElementById('mobileOverlay');
  var closeBtn = document.getElementById('mobileOverlayClose');
  if (!menuToggle || !overlay) return;

  function openMenu() {
    overlay.classList.add('open');
    menuToggle.classList.add('open');
    menuToggle.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    overlay.classList.remove('open');
    menuToggle.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }

  menuToggle.addEventListener('click', function () {
    if (overlay.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeMenu);
  }

  // Closing on link click matters even for a same-page link (e.g. tapping
  // "Home" while already on the home page won't trigger navigation/reload).
  var links = overlay.querySelectorAll('.mobile-overlay-link');
  links.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });
})();

// ---------- Membership page: "More about THE SYSTEM" panel ----------
(function () {
  var toggle = document.getElementById('systemToggle');
  var panel = document.getElementById('systemPanel');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      var isOpen = panel.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen);
    });
  }
})();

// ---------- Home page: about section photo slideshow ----------
(function () {
  var slides = document.querySelectorAll('.about-slideshow .slide');
  var dots = document.querySelectorAll('.slideshow-dots button');
  if (!slides.length) return;

  var current = 0;
  var timer;

  function show(i) {
    slides.forEach(function (s, idx) { s.classList.toggle('active', idx === i); });
    dots.forEach(function (d, idx) { d.classList.toggle('active', idx === i); });
    current = i;
  }

  function startTimer() {
    timer = setInterval(function () {
      show((current + 1) % slides.length);
    }, 4000);
  }

  dots.forEach(function (dot, idx) {
    dot.addEventListener('click', function () {
      clearInterval(timer);
      show(idx);
      startTimer();
    });
  });

  startTimer();
})();

// ---------- Contact page: mailto form handling ----------
(function () {
  var form = document.getElementById('contactForm');
  var status = document.getElementById('contactStatus');
  if (form && status) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var subject = form.subject.value.trim();
      var message = form.message.value.trim();

      var body = 'Name: ' + name + '\nEmail: ' + email + '\n\n' + message;
      var mailtoLink = 'mailto:praise.outsiders@gmail.com'
        + '?subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(body);

      window.location.href = mailtoLink;

      status.textContent = 'Opening your email app to send this to praise.outsiders@gmail.com — if nothing opens, email directly instead.';
      status.classList.add('visible');
    });
  }
})();
