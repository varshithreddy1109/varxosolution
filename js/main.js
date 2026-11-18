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
   - Technologies Manager (localStorage-backed CRUD)
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

  /* =================================================================
     TECHNOLOGIES MANAGER
     Key: cnTechData in localStorage
     Format: { "Category Name": ["Tech A", "Tech B", ...], ... }
     ================================================================= */

  var LS_KEY = 'cnTechData';

  /* ── Default dataset ── */
  var DEFAULT_DATA = {
    'Programming Languages': ['Python','JavaScript','TypeScript','Kotlin','Swift','Java','C#','Dart'],
    'Frontend Development': ['React','Next.js','Vue.js','HTML5','CSS3','Tailwind CSS'],
    'Backend Development': ['Node.js','Express','Django','FastAPI','Flask','Spring Boot'],
    'Mobile Development': ['Android (Kotlin)','iOS (Swift)','Flutter','React Native'],
    'AI & Machine Learning': ['TensorFlow','PyTorch','scikit-learn','OpenAI API','Hugging Face','LangChain'],
    'Databases': ['PostgreSQL','MySQL','MongoDB','SQLite','Firebase','Redis'],
    'Cloud & Deployment': ['AWS','Google Cloud','Azure','Vercel','Docker'],
    'Development Tools': ['Git','GitHub','VS Code','Figma','Postman']
  };

  /* ── Load from localStorage or use defaults ── */
  function loadData() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }

  /* ── Save to localStorage ── */
  function saveData(data) {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(data));
    } catch (e) {}
  }

  /* ── Render public-facing Technologies section ── */
  function renderPublicTech(data) {
    var container = document.getElementById('techCategoriesContainer');
    if (!container) return;
    container.innerHTML = '';

    Object.keys(data).forEach(function (cat, idx) {
      var items = data[cat];
      var delays = ['delay-1','delay-2','delay-3'];
      var delayClass = delays[idx % 3];

      var rowDiv = document.createElement('div');
      rowDiv.className = 'tech-category-row reveal ' + delayClass;

      var labelDiv = document.createElement('div');
      labelDiv.className = 'tech-cat-label';
      labelDiv.textContent = cat;
      rowDiv.appendChild(labelDiv);

      var badgesDiv = document.createElement('div');
      badgesDiv.className = 'tech-badges';

      items.forEach(function (name) {
        var span = document.createElement('span');
        span.className = 'tech-badge';
        span.textContent = name;
        badgesDiv.appendChild(span);
      });

      rowDiv.appendChild(badgesDiv);
      container.appendChild(rowDiv);
    });

    /* Re-observe newly added elements */
    if (!prefersReducedMotion) {
      var newEls = container.querySelectorAll('.reveal');
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });
      newEls.forEach(function (el) { obs.observe(el); });
    } else {
      container.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('in-view');
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    }
  }

  /* ── Render manager panel category list ── */
  function renderManagerList(data) {
    var container = document.getElementById('tmCategoryList');
    if (!container) return;
    container.innerHTML = '';

    Object.keys(data).forEach(function (cat) {
      var items = data[cat];

      var block = document.createElement('div');
      block.className = 'tm-cat-block';
      block.setAttribute('data-cat', cat);

      var catName = document.createElement('div');
      catName.className = 'tm-cat-name';
      catName.textContent = cat;
      block.appendChild(catName);

      var itemsDiv = document.createElement('div');
      itemsDiv.className = 'tm-items';

      if (items.length === 0) {
        var empty = document.createElement('span');
        empty.className = 'tm-empty-cat';
        empty.textContent = 'No items in this category.';
        itemsDiv.appendChild(empty);
      } else {
        items.forEach(function (name, idx) {
          itemsDiv.appendChild(makeTmItem(cat, name, idx, data));
        });
      }

      block.appendChild(itemsDiv);
      container.appendChild(block);
    });
  }

  /* ── Build a single tm-item element ── */
  function makeTmItem(cat, name, idx, data) {
    var item = document.createElement('div');
    item.className = 'tm-item';

    /* Name display */
    var nameSpan = document.createElement('span');
    nameSpan.className = 'tm-item-name';
    nameSpan.textContent = name;

    /* Inline edit field (hidden by default) */
    var editWrap = document.createElement('div');
    editWrap.className = 'tm-inline-edit';
    var editInput = document.createElement('input');
    editInput.className = 'tm-inline-input';
    editInput.type = 'text';
    editInput.value = name;
    editInput.setAttribute('aria-label', 'Edit technology name');
    var saveBtn = document.createElement('button');
    saveBtn.className = 'tm-item-btn';
    saveBtn.setAttribute('aria-label', 'Save');
    saveBtn.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>';
    editWrap.appendChild(editInput);
    editWrap.appendChild(saveBtn);

    /* Action buttons */
    var actions = document.createElement('div');
    actions.className = 'tm-item-actions';

    var editBtn = document.createElement('button');
    editBtn.className = 'tm-item-btn';
    editBtn.setAttribute('aria-label', 'Edit ' + name);
    editBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';

    var delBtn = document.createElement('button');
    delBtn.className = 'tm-item-btn del';
    delBtn.setAttribute('aria-label', 'Delete ' + name);
    delBtn.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>';

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    item.appendChild(nameSpan);
    item.appendChild(editWrap);
    item.appendChild(actions);

    /* Edit button — toggle inline edit */
    editBtn.addEventListener('click', function () {
      var isEditing = item.classList.contains('editing');
      if (isEditing) {
        /* Cancel edit */
        item.classList.remove('editing');
        nameSpan.classList.remove('hidden');
        actions.classList.remove('hidden');
        editWrap.classList.remove('active');
        editInput.value = name;
      } else {
        /* Start edit */
        item.classList.add('editing');
        nameSpan.classList.add('hidden');
        actions.classList.add('hidden');
        editWrap.classList.add('active');
        editInput.focus();
        editInput.select();
      }
    });

    /* Save rename */
    function commitRename() {
      var newName = editInput.value.trim();
      if (!newName || newName === name) {
        editBtn.click(); /* cancel */
        return;
      }
      var d = loadData();
      if (!d[cat]) { d[cat] = []; }
      d[cat][idx] = newName;
      saveData(d);
      name = newName;
      nameSpan.textContent = newName;
      editInput.value = newName;
      editBtn.setAttribute('aria-label', 'Edit ' + newName);
      delBtn.setAttribute('aria-label', 'Delete ' + newName);
      item.classList.remove('editing');
      nameSpan.classList.remove('hidden');
      actions.classList.remove('hidden');
      editWrap.classList.remove('active');
      renderPublicTech(d);
    }

    saveBtn.addEventListener('click', commitRename);
    editInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); commitRename(); }
      if (e.key === 'Escape') { editBtn.click(); }
    });

    /* Delete */
    delBtn.addEventListener('click', function () {
      if (!window.confirm('Delete "' + name + '" from ' + cat + '?')) return;
      var d = loadData();
      if (d[cat]) {
        d[cat].splice(idx, 1);
        saveData(d);
        renderPublicTech(d);
        renderManagerList(d);
      }
    });

    return item;
  }

  /* ── Populate category dropdown in add-form ── */
  function populateCategorySelect(data) {
    var sel = document.getElementById('tmCatSelect');
    if (!sel) return;
    sel.innerHTML = '';
    Object.keys(data).forEach(function (cat) {
      var opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      sel.appendChild(opt);
    });
  }

  /* ── Open / close manager overlay ── */
  var tmOverlay = document.getElementById('techManagerOverlay');

  function openManager() {
    if (!tmOverlay) return;
    var d = loadData();
    renderManagerList(d);
    populateCategorySelect(d);
    document.getElementById('tmNewName').value = '';
    tmOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(function () {
      var closeBtn = tmOverlay.querySelector('.tm-close');
      if (closeBtn) closeBtn.focus();
    }, 100);
  }

  function closeManager() {
    if (!tmOverlay) return;
    tmOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  var tmOpenBtn = document.getElementById('openTechManager');
  if (tmOpenBtn) tmOpenBtn.addEventListener('click', openManager);

  var tmCloseBtn = document.getElementById('tmCloseBtn');
  if (tmCloseBtn) tmCloseBtn.addEventListener('click', closeManager);

  /* Close manager on backdrop click */
  if (tmOverlay) {
    tmOverlay.addEventListener('click', function (e) {
      if (e.target === tmOverlay) closeManager();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && tmOverlay.classList.contains('open')) closeManager();
    });
  }

  /* ── Add new technology ── */
  var tmAddForm = document.getElementById('tmAddForm');
  if (tmAddForm) {
    tmAddForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var nameInput = document.getElementById('tmNewName');
      var catSel    = document.getElementById('tmCatSelect');
      var newName   = nameInput ? nameInput.value.trim() : '';
      var cat       = catSel   ? catSel.value : '';
      if (!newName || !cat) return;

      var d = loadData();
      if (!d[cat]) d[cat] = [];
      if (d[cat].indexOf(newName) !== -1) {
        alert('"' + newName + '" already exists in ' + cat + '.');
        return;
      }
      d[cat].push(newName);
      saveData(d);
      renderPublicTech(d);
      renderManagerList(d);
      populateCategorySelect(d);
      if (nameInput) nameInput.value = '';
      if (nameInput) nameInput.focus();
    });
  }

  /* ── Reset to defaults ── */
  var tmResetBtn     = document.getElementById('tmResetBtn');
  var tmConfirmOvl   = document.getElementById('tmConfirmOverlay');
  var tmCancelReset  = document.getElementById('tmCancelReset');
  var tmConfirmReset = document.getElementById('tmConfirmReset');

  if (tmResetBtn) {
    tmResetBtn.addEventListener('click', function () {
      if (tmConfirmOvl) tmConfirmOvl.classList.add('open');
    });
  }
  if (tmCancelReset) {
    tmCancelReset.addEventListener('click', function () {
      if (tmConfirmOvl) tmConfirmOvl.classList.remove('open');
    });
  }
  if (tmConfirmReset) {
    tmConfirmReset.addEventListener('click', function () {
      var fresh = JSON.parse(JSON.stringify(DEFAULT_DATA));
      saveData(fresh);
      renderPublicTech(fresh);
      renderManagerList(fresh);
      populateCategorySelect(fresh);
      if (tmConfirmOvl) tmConfirmOvl.classList.remove('open');
    });
  }
  if (tmConfirmOvl) {
    tmConfirmOvl.addEventListener('click', function (e) {
      if (e.target === tmConfirmOvl) tmConfirmOvl.classList.remove('open');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && tmConfirmOvl.classList.contains('open')) {
        tmConfirmOvl.classList.remove('open');
      }
    });
  }

  /* ── Initial public render ── */
  renderPublicTech(loadData());

})();
