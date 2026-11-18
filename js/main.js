/* =================================================================
   js/main.js
   Core site interactions:
   - Dual-video crossfade
   - Hero entrance animation
   - Navbar scroll behaviour
   - Active nav link tracking
   - Mobile menu
   - Smooth scrolling
   - Scroll reveal (IntersectionObserver)
   - Back-to-top
   - Contact form validation
   - Parallax
   ================================================================= */

(function () {
  'use strict';

  /* ── Reduced motion preference ── */
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =================================================================
     DUAL-VIDEO CROSSFADE
     ================================================================= */
  var videoA = document.getElementById('heroVideoA');
  var videoB = document.getElementById('heroVideoB');

  if (videoA && videoB && !prefersReducedMotion) {
    var activeVideo  = videoA;
    var standbyVideo = videoB;
    var CROSSFADE_BEFORE = 2.5;
    var FADE_DURATION    = 1600;
    var crossfading = false;

    function startCrossfade() {
      if (crossfading) return;
      crossfading = true;

      standbyVideo.currentTime = 0;
      standbyVideo.play().catch(function () {});

      standbyVideo.style.transition = 'opacity ' + (FADE_DURATION / 1000) + 's ease';
      standbyVideo.style.opacity = '1';
      activeVideo.style.transition  = 'opacity ' + (FADE_DURATION / 1000) + 's ease';
      activeVideo.style.opacity  = '0';

      setTimeout(function () {
        activeVideo.pause();
        activeVideo.currentTime = 0;
        var tmp = activeVideo;
        activeVideo  = standbyVideo;
        standbyVideo = tmp;
        crossfading  = false;
      }, FADE_DURATION + 100);
    }

    function checkTime() {
      if (!activeVideo.duration) return;
      var remaining = activeVideo.duration - activeVideo.currentTime;
      if (remaining <= CROSSFADE_BEFORE && remaining > 0) {
        startCrossfade();
      }
    }

    videoA.addEventListener('timeupdate', function () {
      if (activeVideo === videoA) checkTime();
    });
    videoB.addEventListener('timeupdate', function () {
      if (activeVideo === videoB) checkTime();
    });

    videoA.play().catch(function () {
      videoA.style.display = 'none';
      videoB.style.display = 'none';
    });
  }

  /* =================================================================
     HERO ENTRANCE ANIMATION
     ================================================================= */
  if (!prefersReducedMotion) {
    function runHeroAnimation() {
      var line1    = document.getElementById('heroLine1');
      var line2    = document.getElementById('heroLine2');
      var badge    = document.getElementById('heroBadge');
      var desc     = document.getElementById('heroDesc');
      var cta      = document.getElementById('heroCta');
      var navLogo  = document.getElementById('navLogo');
      var navLinks = document.querySelectorAll('.nav-link');
      var navCta   = document.getElementById('navCta');
      var hamburger= document.getElementById('hamburger');

      var timings = [
        [badge,     100, { opacity: '1', transform: 'translateY(0)' }],
        [line1,     300, { transform: 'translateY(0)' }],
        [line2,     480, { transform: 'translateY(0)' }],
        [navLogo,   600, { opacity: '1', transform: 'translateY(0)' }],
        [desc,      720, { opacity: '1', transform: 'translateY(0)' }],
        [navCta,    700, { opacity: '1', transform: 'translateY(0)' }],
        [hamburger, 700, { opacity: '1', transform: 'translateY(0)' }],
      ];

      timings.forEach(function (item) {
        var el = item[0]; var delay = item[1]; var styles = item[2];
        if (!el) return;
        setTimeout(function () {
          if (el.classList) el.classList.add('visible');
          Object.keys(styles).forEach(function (prop) {
            el.style[prop] = styles[prop];
          });
        }, delay);
      });

      navLinks.forEach(function (link, i) {
        setTimeout(function () {
          link.style.opacity   = '1';
          link.style.transform = 'translateY(0)';
        }, 640 + i * 70);
      });

      setTimeout(function () {
        if (cta) {
          cta.style.opacity   = '1';
          cta.style.transform = 'translateY(0)';
        }
      }, 900);
    }

    var fontTimeout = setTimeout(runHeroAnimation, 2000);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        clearTimeout(fontTimeout);
        runHeroAnimation();
      });
    }
  } else {
    document.querySelectorAll('.hero-line').forEach(function (el) {
      el.style.transform = 'none';
    });
    document.querySelectorAll('#heroBadge, #heroDesc, #heroCta, .nav-link, #navLogo, #navCta, .nav-hamburger').forEach(function (el) {
      el.style.opacity = '1'; el.style.transform = 'none';
    });
  }

  /* =================================================================
     NAVBAR SCROLL BEHAVIOUR
     ================================================================= */
  var navbar = document.getElementById('navbar');

  function updateNavbar() {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();

  /* =================================================================
     ACTIVE NAV LINKS
     ================================================================= */
  var sections   = document.querySelectorAll('section[id], footer[id]');
  var navLinkEls = document.querySelectorAll('.nav-link');

  var sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var id = entry.target.getAttribute('id');
        navLinkEls.forEach(function (link) {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(function (s) { sectionObserver.observe(s); });

  /* =================================================================
     MOBILE MENU
     ================================================================= */
  var hamburger  = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobileMenu');
  var mobileLinks= document.querySelectorAll('.mobile-menu-link, .mobile-menu-footer .btn');
  var isMenuOpen = false;

  function openMenu() {
    isMenuOpen = true;
    hamburger.classList.add('open');
    mobileMenu.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Close menu');
    document.body.style.overflow = 'hidden';
    setTimeout(function () {
      var firstLink = mobileMenu.querySelector('.mobile-menu-link');
      if (firstLink) firstLink.focus();
    }, 100);
  }

  function closeMenu() {
    isMenuOpen = false;
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
    hamburger.focus();
  }

  hamburger.addEventListener('click', function () {
    isMenuOpen ? closeMenu() : openMenu();
  });

  mobileLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', function (e) {
    if (isMenuOpen && !mobileMenu.contains(e.target) && !hamburger.contains(e.target)) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isMenuOpen) closeMenu();
  });

  /* =================================================================
     SMOOTH SCROLLING
     ================================================================= */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href === '#') return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        var navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 72;
        var top = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
        window.scrollTo({ top: top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }
    });
  });

  /* =================================================================
     SCROLL REVEAL
     ================================================================= */
  if (!prefersReducedMotion) {
    var revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .timeline-step');

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .timeline-step').forEach(function (el) {
      el.classList.add('in-view');
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }

  /* =================================================================
     BACK TO TOP
     ================================================================= */
  var backToTop = document.getElementById('back-to-top');

  window.addEventListener('scroll', function () {
    backToTop.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });

  /* =================================================================
     CONTACT FORM & NETLIFY FORMS INTEGRATION
     ================================================================= */
  var contactForm = document.getElementById('contactForm');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;
      var firstInvalidField = null;

      function validateField(fieldId, errorId, testFn) {
        var field  = document.getElementById(fieldId);
        var errMsg = document.getElementById(errorId);
        if (!field || !errMsg) return;
        var isValid = testFn(field.value.trim());
        field.classList.toggle('error', !isValid);
        errMsg.classList.toggle('visible', !isValid);
        if (!isValid) {
          valid = false;
          if (!firstInvalidField) firstInvalidField = field;
        }
      }

      validateField('f-name',    'err-name',    function (v) { return v.length >= 2; });
      validateField('f-email',   'err-email',   function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); });
      validateField('f-service', 'err-service', function (v) { return v !== ''; });
      validateField('f-message', 'err-message', function (v) { return v.length >= 10; });

      var successEl = document.getElementById('formSuccess');
      var errorEl   = document.getElementById('formError');

      if (!valid) {
        if (successEl) successEl.classList.remove('visible');
        if (errorEl) errorEl.classList.remove('visible');
        if (firstInvalidField) firstInvalidField.focus();
        return;
      }

      // Hide any previous alerts
      if (successEl) successEl.classList.remove('visible');
      if (errorEl) errorEl.classList.remove('visible');

      // Update button state while submitting
      var btnSubmit     = document.getElementById('btnSubmit');
      var btnSubmitText = document.getElementById('btnSubmitText');
      var btnSubmitIcon = document.getElementById('btnSubmitIcon');

      if (btnSubmit) btnSubmit.disabled = true;
      if (btnSubmitText) btnSubmitText.textContent = 'Sending...';
      if (btnSubmitIcon) btnSubmitIcon.style.display = 'none';

      function resetButtonState() {
        if (btnSubmit) btnSubmit.disabled = false;
        if (btnSubmitText) btnSubmitText.textContent = 'Send Message';
        if (btnSubmitIcon) btnSubmitIcon.style.display = '';
      }

      // Encode payload for Netlify Forms
      var formData = new FormData(contactForm);
      if (!formData.get('form-name')) {
        formData.append('form-name', 'contact');
      }

      var encodedBody = new URLSearchParams(formData).toString();

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encodedBody
      })
      .then(function (response) {
        resetButtonState();
        if (response.ok) {
          if (successEl) successEl.classList.add('visible');
          if (errorEl) errorEl.classList.remove('visible');
          contactForm.reset();
          setTimeout(function () {
            if (successEl) successEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 100);
        } else {
          throw new Error('Netlify form submission returned status: ' + response.status);
        }
      })
      .catch(function (error) {
        resetButtonState();
        if (errorEl) errorEl.classList.add('visible');
        if (successEl) successEl.classList.remove('visible');
        setTimeout(function () {
          if (errorEl) errorEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      });
    });

    contactForm.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(function (field) {
      field.addEventListener('input', function () {
        field.classList.remove('error');
        var nextSibling = field.nextElementSibling;
        if (nextSibling && nextSibling.classList.contains('form-error-msg')) {
          nextSibling.classList.remove('visible');
        }
      });
    });
  }

  /* =================================================================
     PARALLAX ON HERO
     ================================================================= */
  if (!prefersReducedMotion) {
    var heroContent  = document.querySelector('.hero-content');
    var heroVideoWrap= document.querySelector('.hero-video-wrap');

    window.addEventListener('scroll', function () {
      var scrollY = window.scrollY;
      var heroH   = document.getElementById('hero').offsetHeight;
      if (scrollY > heroH) return;
      if (heroContent)   heroContent.style.transform   = 'translateY(' + (scrollY * 0.18) + 'px)';
      if (heroVideoWrap) heroVideoWrap.style.transform = 'translateY(' + (scrollY * 0.3)  + 'px)';
    }, { passive: true });
  }

})();
