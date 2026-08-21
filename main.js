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

// ---------- Page transition loader (top bar + center 3D mask) ----------
// Single continuous show: starts the instant you click a link, stays
// visible through the actual page navigation (using sessionStorage so the
// two pages — the one you're leaving and the one you're arriving on —
// coordinate instead of each independently triggering their own animation),
// and only completes/fades once the destination page has actually finished
// loading. On a slow connection this naturally stays visible longer,
// since it's tied to the real "load" event rather than a fixed timer.
(function () {
  var loader = document.getElementById('pageLoader');
  var fill = document.getElementById('pageLoaderFill');
  var mask = document.getElementById('pageLoaderMask');
  if (!loader || !fill) return;

  var STORAGE_KEY = 'pb-transition-start';
  var MIN_TOTAL_VISIBLE_MS = 500; // guaranteed minimum time shown, click to fade-start
  var HOLD_AFTER_COMPLETE_MS = 200; // brief pause at 100% before it fades

  function setFill(scale, animated) {
    fill.style.transition = animated ? 'transform .35s cubic-bezier(.4,0,.2,1)' : 'none';
    fill.style.transform = 'scaleX(' + scale + ')';
  }

  function showLoader() {
    loader.classList.add('active');
    if (mask) mask.classList.add('active');
  }

  function hideLoader() {
    loader.classList.remove('active');
    if (mask) mask.classList.remove('active');
  }

  function readStorage(key) {
    try { return sessionStorage.getItem(key); } catch (err) { return null; }
  }
  function writeStorage(key, value) {
    try { sessionStorage.setItem(key, value); } catch (err) { /* ignore (e.g. private mode) */ }
  }
  function clearStorage(key) {
    try { sessionStorage.removeItem(key); } catch (err) { /* ignore */ }
  }

  function isInternalPageLink(link) {
    if (!link || !link.getAttribute) return false;
    var href = link.getAttribute('href');
    if (!href) return false;
    if (href.charAt(0) === '#') return false;
    if (href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0) return false;
    if (link.target === '_blank') return false;
    if (href.indexOf('http://') === 0 || href.indexOf('https://') === 0) return false;
    // Only treat plain relative .html links (our own pages) as internal
    return /\.html(\?.*)?(#.*)?$/i.test(href) || href === '';
  }

  // ----- Leaving the current page: start the loader, then navigate -----
  document.addEventListener('click', function (e) {
    var link = e.target.closest ? e.target.closest('a') : null;
    if (!isInternalPageLink(link)) return;

    var destination = link.href;
    e.preventDefault();

    writeStorage(STORAGE_KEY, String(Date.now()));

    showLoader();
    setFill(0, false);
    void fill.offsetWidth; // force reflow so the 0-state registers before animating
    requestAnimationFrame(function () {
      setFill(0.55, true);
    });

    // Navigate almost immediately — the bar keeps showing on the next page
    // rather than resetting, so there's no need to artificially delay here.
    setTimeout(function () {
      window.location.href = destination;
    }, 120);
  });

  // ----- Arriving on a page: only continue the bar if WE started it -----
  // (The instant "show immediately" step already happened via the inline
  // script at the top of the page, before this file even finished
  // downloading — this just handles completing and hiding it once the
  // page has actually finished loading.)
  var transitionStartedAt = readStorage(STORAGE_KEY);
  if (transitionStartedAt) {
    window.addEventListener('load', function () {
      var elapsed = Date.now() - Number(transitionStartedAt);
      var remaining = Math.max(MIN_TOTAL_VISIBLE_MS - elapsed, 0);

      setTimeout(function () {
        setFill(1, true);
        setTimeout(function () {
          hideLoader();
          clearStorage(STORAGE_KEY);
          setTimeout(function () {
            setFill(0, false);
          }, 300);
        }, HOLD_AFTER_COMPLETE_MS);
      }, remaining);
    });
  }
  // Direct visits, refreshes, and back/forward navigation (no stored
  // transition) intentionally show nothing — the loader is only for
  // link-triggered transitions, not every page load.
})();

