/**
 * SkyShadowHero i18n — Modern Internationalization
 *
 * Features:
 *   - JSON locale files (locales/{lang}.json)
 *   - Detection chain: URL path → query param → cookie → browser lang
 *   - History API for clean URLs (no ?lang= in the address bar)
 *   - Language switcher with data-lang attribute
 *   - data-i18n for innerHTML, data-i18n-attr for attribute translation
 *   - Lazy async loading with safe fallback
 */
(function () {
  'use strict';

  var SUPPORTED = ['en', 'zh-CN'];
  var DEFAULT = 'en';
  var COOKIE_NAME = 'preferred_lang';
  var COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year

  var currentLocale = DEFAULT;
  var dictionary = {};

  // ─── Detection ───────────────────────────────────────────────

  function detect() {
    // 1. URL path: /zh-CN/, /en/, /zh-CN, /en
    var path = location.pathname;
    for (var i = 0; i < SUPPORTED.length; i++) {
      var l = SUPPORTED[i];
      if (path === '/' + l || path === '/' + l + '/' || path.indexOf('/' + l + '/') === 0) {
        return l;
      }
    }

    // 2. URL query: ?lang=zh-CN
    var params = new URLSearchParams(location.search);
    var lang = params.get('lang');
    if (lang && SUPPORTED.indexOf(lang) !== -1) return lang;

    // 4. Cookie（用户语言偏好优先于浏览器语言）
    var m = document.cookie.match(new RegExp(COOKIE_NAME + '=([^;]+)'));
    if (m && SUPPORTED.indexOf(m[1]) !== -1) return m[1];

    // 4. Browser language（首次访问时才用）
    if (navigator.language.startsWith('zh')) return 'zh-CN';

    // 5. Default
    return DEFAULT;
  }

  // ─── Locale loading ─────────────────────────────────────────

  function loadLocale(locale) {
    var url = '/locales/' + locale + '.json';
    return fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to load ' + url + ' (' + res.status + ')');
        return res.json();
      });
  }

  // ─── DOM helpers ────────────────────────────────────────────

  function setMeta(name, content) {
    var el = document.querySelector('meta[name="' + name + '"]');
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('name', name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  function setLink(rel, hreflang, href) {
    var el = document.querySelector('link[rel="' + rel + '"][hreflang="' + hreflang + '"]');
    if (el) el.setAttribute('href', href);
  }

  // ─── Apply translations ─────────────────────────────────────

  function apply(dict) {
    dictionary = dict;

    // <html lang>
    document.documentElement.lang = currentLocale;

    // <title>
    if (dict.siteTitle) document.title = dict.siteTitle;

    // <meta>
    if (dict.keywords) setMeta('keywords', dict.keywords);
    if (dict.description) setMeta('description', dict.description);
    if (dict.author) setMeta('author', dict.author);

    // Update hreflang links (dynamic meta)
    setLink('alternate', 'en', location.origin + '/');
    setLink('alternate', 'zh-CN', location.origin + '/zh-CN/');

    // [data-i18n] → innerHTML (backward compatible)
    var i18nEls = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < i18nEls.length; i++) {
      var el = i18nEls[i];
      var key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) {
        el.innerHTML = dict[key];
      }
    }

    // [data-i18n-attr="attr1:key1,attr2:key2"] → attributes
    var attrEls = document.querySelectorAll('[data-i18n-attr]');
    for (var j = 0; j < attrEls.length; j++) {
      var el2 = attrEls[j];
      var mappings = el2.getAttribute('data-i18n-attr');
      var pairs = mappings.split(',');
      for (var k = 0; k < pairs.length; k++) {
        var parts = pairs[k].split(':').map(function (s) { return s.trim(); });
        var attr = parts[0];
        var lookupKey = parts[1] || attr;
        if (dict[lookupKey] !== undefined) {
          el2.setAttribute(attr, dict[lookupKey]);
        }
      }
    }

    // Social third link (special handling for id-based elements)
    if (dict.socialThirdHref) {
      var link = document.getElementById('social-link-third');
      if (link) link.href = dict.socialThirdHref;
    }
    if (dict.socialThirdIcon) {
      var icon = document.getElementById('social-icon-third');
      if (icon) icon.setAttribute('xlink:href', dict.socialThirdIcon);
    }

    // Save cookie
    document.cookie = COOKIE_NAME + '=' + currentLocale + '; path=/; max-age=' + COOKIE_MAX_AGE;
  }

  // ─── URL management ─────────────────────────────────────────

  function getCleanPath(locale) {
    return (locale === DEFAULT || locale === 'en') ? '/' : '/' + locale + '/';
  }

  function updateURL(locale) {
    var newPath = getCleanPath(locale);
    // Only replace if URL doesn't already match
    if (location.pathname !== newPath) {
      history.replaceState(null, '', newPath);
    }
    // Clean up leftover ?lang= from URL
    if (location.search) {
      history.replaceState(null, '', location.pathname.replace(/\/+$/, '') + '/');
    }
  }

  // ─── Init ───────────────────────────────────────────────────

  function init() {
    currentLocale = detect();

    // If detected from query param, clean the URL immediately
    if (location.search.indexOf('lang=') !== -1) {
      var cleanPath = getCleanPath(currentLocale);
      history.replaceState(null, '', cleanPath);
    }

    loadLocale(currentLocale).then(function (dict) {
      apply(dict);
    })['catch'](function (err) {
      console.error('i18n: init failed for', currentLocale, err);
      // Fallback to English
      if (currentLocale !== DEFAULT) {
        currentLocale = DEFAULT;
        loadLocale(DEFAULT).then(function (dict) {
          apply(dict);
        })['catch'](function (fallbackErr) {
          console.error('i18n: fallback also failed', fallbackErr);
        });
      }
    });
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
