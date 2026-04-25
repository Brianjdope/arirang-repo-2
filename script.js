// ══════════════════════════════════════════════
// ARIRANG — Section-Based SPA Script v4
// ══════════════════════════════════════════════

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var currentLang = 'en';

  // ══════════════════════════════════════
  // 1. NAV SCROLL STATE
  // ══════════════════════════════════════
  var nav = document.querySelector('.nav');

  window.addEventListener('scroll', function () {
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });

  // ══════════════════════════════════════
  // 2. HERO PARALLAX
  // ══════════════════════════════════════
  var heroBg = document.getElementById('heroBg');
  if (heroBg && !prefersReducedMotion) {
    var heroHeight = window.innerHeight;
    var ticking = false;

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          var scrollY = window.scrollY;
          if (scrollY < heroHeight) {
            heroBg.style.transform = 'translateY(' + (scrollY * 0.25) + 'px)';
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // ══════════════════════════════════════
  // 3. NAV HOME BUTTON
  // ══════════════════════════════════════
  var navHome = document.getElementById('navHome');
  if (navHome) {
    navHome.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var sectionNavHome = document.getElementById('sectionNavHome');
  if (sectionNavHome) {
    sectionNavHome.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ══════════════════════════════════════
  // 4. LANGUAGE PICKER & i18n
  // ══════════════════════════════════════
  var langPickerBtn = document.getElementById('langPickerBtn');
  var langDropdown = document.getElementById('langDropdown');
  var langLabel = document.getElementById('langLabel');

  function applyLanguage(lang) {
    if (typeof TRANSLATIONS === 'undefined' || !TRANSLATIONS[lang]) return;
    currentLang = lang;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (TRANSLATIONS[lang][key] !== undefined) {
        el.textContent = TRANSLATIONS[lang][key];
      }
    });

    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-html');
      if (TRANSLATIONS[lang][key] !== undefined) {
        el.innerHTML = TRANSLATIONS[lang][key];
      }
    });

    // Re-apply status text in new language
    updateStatus();
  }

  if (langPickerBtn && langDropdown) {
    langPickerBtn.addEventListener('click', function () {
      var expanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', String(!expanded));
      langDropdown.classList.toggle('open');
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.lang-picker')) {
        langPickerBtn.setAttribute('aria-expanded', 'false');
        langDropdown.classList.remove('open');
      }
    });

    // Language option clicks
    document.querySelectorAll('.lang-option').forEach(function (opt) {
      opt.addEventListener('click', function () {
        var lang = this.getAttribute('data-lang');
        if (langLabel) langLabel.textContent = lang.toUpperCase();
        document.querySelectorAll('.lang-option').forEach(function (o) { o.classList.remove('active'); });
        this.classList.add('active');
        langDropdown.classList.remove('open');
        langPickerBtn.setAttribute('aria-expanded', 'false');
        applyLanguage(lang);
      });
    });
  }

  // ══════════════════════════════════════
  // 5. SECTION NAVIGATION (SPA-style)
  // ══════════════════════════════════════
  function switchSection(sectionId) {
    // Update section nav tabs
    document.querySelectorAll('.section-nav-tab').forEach(function (tab) {
      tab.classList.remove('active');
      if (tab.getAttribute('data-section') === sectionId) {
        tab.classList.add('active');
      }
    });

    // Switch panels with fade
    var currentPanel = document.querySelector('.panel--active');
    var nextPanel = document.getElementById('panel-' + sectionId);
    if (!nextPanel || nextPanel === currentPanel) return;

    if (currentPanel) {
      currentPanel.style.opacity = '0';
      currentPanel.style.transform = 'translateY(12px)';
      setTimeout(function () {
        currentPanel.classList.remove('panel--active');
        currentPanel.style.display = 'none';

        nextPanel.style.display = 'block';
        nextPanel.style.opacity = '0';
        nextPanel.style.transform = 'translateY(12px)';
        void nextPanel.offsetHeight; // force reflow
        nextPanel.classList.add('panel--active');
        nextPanel.style.opacity = '1';
        nextPanel.style.transform = 'translateY(0)';

        // Scroll to section nav
        var sectionNav = document.getElementById('sectionNav');
        if (sectionNav) {
          var navHeight = nav ? nav.offsetHeight : 0;
          var targetPos = sectionNav.getBoundingClientRect().top + window.scrollY - navHeight;
          window.scrollTo({ top: targetPos, behavior: 'smooth' });
        }

        // Re-init gallery lightbox items if gallery panel
        if (sectionId === 'gallery') {
          initLightbox();
        }
      }, prefersReducedMotion ? 0 : 200);
    } else {
      nextPanel.style.display = 'block';
      nextPanel.classList.add('panel--active');
      nextPanel.style.opacity = '1';
      nextPanel.style.transform = 'translateY(0)';
    }
  }

  // Section nav tab clicks
  document.querySelectorAll('.section-nav-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      var section = this.getAttribute('data-section');
      if (section === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      switchSection(section);
    });
  });

  // Any link with data-section attribute
  document.querySelectorAll('[data-section]').forEach(function (el) {
    if (el.classList.contains('section-nav-tab')) return; // already handled
    el.addEventListener('click', function (e) {
      e.preventDefault();
      var sectionId = this.getAttribute('data-section');
      switchSection(sectionId);

      // Close mobile menu if open
      if (mobileMenu && mobileMenu.classList.contains('open')) {
        closeMobileMenu();
      }
    });
  });

  // ══════════════════════════════════════
  // 6. MENU TAB SWITCHING
  // ══════════════════════════════════════
  window.switchMenuTab = function (btn, id) {
    document.querySelectorAll('.menu-tab').forEach(function (t) {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');

    var current = document.querySelector('.menu-tab-content--active');
    if (current) {
      current.style.opacity = '0';
      setTimeout(function () {
        current.classList.remove('menu-tab-content--active');
        current.style.display = 'none';

        var next = document.getElementById(id);
        if (next) {
          next.style.display = 'grid';
          next.style.opacity = '0';
          void next.offsetHeight;
          next.classList.add('menu-tab-content--active');
          next.style.opacity = '1';
        }
      }, prefersReducedMotion ? 0 : 180);
    } else {
      var next = document.getElementById(id);
      if (next) {
        next.style.display = 'grid';
        next.classList.add('menu-tab-content--active');
        next.style.opacity = '1';
      }
    }
  };

  // ══════════════════════════════════════
  // 7. MOBILE MENU
  // ══════════════════════════════════════
  var navToggle = document.getElementById('navToggle');
  var mobileMenu = document.getElementById('mobileMenu');
  var mobileClose = document.getElementById('mobileClose');

  function getFocusableElements(container) {
    return container.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
  }

  function openMobileMenu() {
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    navToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    // Focus the close button
    if (mobileClose) mobileClose.focus();
  }

  function closeMobileMenu() {
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    // Return focus to toggle
    if (navToggle) navToggle.focus();
  }

  if (navToggle) navToggle.addEventListener('click', openMobileMenu);
  if (mobileClose) mobileClose.addEventListener('click', closeMobileMenu);

  if (mobileMenu) {
    document.addEventListener('keydown', function (e) {
      if (!mobileMenu.classList.contains('open')) return;
      if (e.key === 'Escape') {
        closeMobileMenu();
        return;
      }
      // Focus trap
      if (e.key === 'Tab') {
        var focusable = getFocusableElements(mobileMenu);
        if (focusable.length === 0) return;
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    });
  }

  // ══════════════════════════════════════
  // 8. GALLERY LIGHTBOX
  // ══════════════════════════════════════
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = lightbox ? lightbox.querySelector('.lightbox-img') : null;
  var lightboxCaption = lightbox ? lightbox.querySelector('.lightbox-caption') : null;
  var lightboxClose = lightbox ? lightbox.querySelector('.lightbox-close') : null;
  var lightboxPrev = lightbox ? lightbox.querySelector('.lightbox-prev') : null;
  var lightboxNext = lightbox ? lightbox.querySelector('.lightbox-next') : null;
  var currentIndex = 0;
  var lastFocusedGalleryItem = null;

  function getGalleryItems() {
    return document.querySelectorAll('#panel-gallery [data-lightbox]');
  }

  function getGalleryData() {
    var data = [];
    getGalleryItems().forEach(function (item) {
      var img = item.querySelector('img');
      var title = item.querySelector('.gallery-item-title');
      data.push({
        src: img ? img.src : '',
        alt: img ? img.alt : '',
        caption: title ? title.textContent : ''
      });
    });
    return data;
  }

  function openLightbox(index) {
    var data = getGalleryData();
    if (!data[index]) return;
    currentIndex = index;
    lastFocusedGalleryItem = document.activeElement;
    lightboxImg.src = data[index].src;
    lightboxImg.alt = data[index].alt;
    lightboxCaption.textContent = data[index].caption;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    // Focus close button for keyboard users
    if (lightboxClose) lightboxClose.focus();
  }

  function closeLightboxFn() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    // Return focus to the gallery item that opened the lightbox
    if (lastFocusedGalleryItem) {
      lastFocusedGalleryItem.focus();
      lastFocusedGalleryItem = null;
    }
  }

  function navigateLightbox(dir) {
    var data = getGalleryData();
    currentIndex = (currentIndex + dir + data.length) % data.length;
    lightboxImg.style.opacity = '0';
    setTimeout(function () {
      lightboxImg.src = data[currentIndex].src;
      lightboxImg.alt = data[currentIndex].alt;
      lightboxCaption.textContent = data[currentIndex].caption;
      lightboxImg.style.opacity = '1';
    }, 180);
  }

  function initLightbox() {
    getGalleryItems().forEach(function (item, i) {
      // Remove old listeners by cloning
      var newItem = item.cloneNode(true);
      item.parentNode.replaceChild(newItem, item);
      newItem.addEventListener('click', function () { openLightbox(i); });
      // Keyboard support: Enter/Space to open
      newItem.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(i);
        }
      });
    });
  }

  // Initial lightbox setup
  initLightbox();

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightboxFn);
  if (lightboxPrev) lightboxPrev.addEventListener('click', function () { navigateLightbox(-1); });
  if (lightboxNext) lightboxNext.addEventListener('click', function () { navigateLightbox(1); });

  document.addEventListener('keydown', function (e) {
    if (!lightbox || !lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightboxFn();
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
    // Focus trap within lightbox
    if (e.key === 'Tab') {
      var focusable = getFocusableElements(lightbox);
      if (focusable.length === 0) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  });

  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
        closeLightboxFn();
      }
    });
  }

  // Lightbox swipe gestures (mobile)
  if (lightbox) {
    var touchStartX = 0;
    lightbox.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    lightbox.addEventListener('touchend', function (e) {
      var diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) {
        navigateLightbox(diff > 0 ? 1 : -1);
      }
    }, { passive: true });
  }

  // ══════════════════════════════════════
  // 9. OPEN / CLOSED STATUS BADGE
  // ══════════════════════════════════════
  var statusBadge = document.getElementById('statusBadge');
  var statusText = document.getElementById('statusText');

  function updateStatus() {
    if (!statusBadge || !statusText) return;
    var now = new Date();
    var day = now.getDay();
    var time = now.getHours() * 60 + now.getMinutes();

    var openTime, closeTime;
    if (day === 0) { openTime = 300; closeTime = 1020; }
    else if (day === 6) { openTime = 300; closeTime = 1110; }
    else { openTime = 360; closeTime = 1110; }

    var isOpen = time >= openTime && time < closeTime;
    statusBadge.classList.remove('status-badge--open', 'status-badge--closed');
    statusBadge.classList.add(isOpen ? 'status-badge--open' : 'status-badge--closed');

    // Use translated status text
    var openKey = isOpen ? 'nav.open' : 'nav.closed';
    if (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][openKey]) {
      statusText.textContent = TRANSLATIONS[currentLang][openKey];
    } else {
      statusText.textContent = isOpen ? 'Open Now' : 'Closed';
    }
  }

  updateStatus();
  setInterval(updateStatus, 60000);

  // ══════════════════════════════════════
  // 10. RATING BAR ANIMATION
  // ══════════════════════════════════════
  var ratingBars = document.querySelectorAll('.rating-bar-fill');
  if (ratingBars.length && !prefersReducedMotion) {
    var barObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var bar = entry.target;
          var width = bar.style.width;
          bar.style.width = '0';
          bar.style.transition = 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
          setTimeout(function () { bar.style.width = width; }, 100);
          barObserver.unobserve(bar);
        }
      });
    }, { threshold: 0.3 });

    ratingBars.forEach(function (bar) {
      barObserver.observe(bar);
    });
  }

  // ══════════════════════════════════════
  // 11. FOOTER YEAR
  // ══════════════════════════════════════
  var footerYear = document.getElementById('footerYear');
  if (footerYear) footerYear.textContent = new Date().getFullYear();

})();
