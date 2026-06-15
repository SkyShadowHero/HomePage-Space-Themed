/**
 * SkyShadowHero i18n — Simple & Reliable
 */

(function () {
  'use strict';

  var LANG_COOKIE = 'lang';
  var DICT = {
    'zh-CN': null,
    'en': null
  };

  // ── 1. 判断语言 ──────────────────────────────────────────

  function isZh() {
    var lang = (navigator.language || '').toLowerCase();
    if (lang.indexOf('zh')>=0||lang.indexOf('cn')>=0) return true;
    var langs = navigator.languages || [];
    for (var i = 0; i < langs.length; i++) {
      var l = langs[i].toLowerCase();
      if (l.indexOf('zh')>=0||l.indexOf('cn')>=0) return true;
    }
    return false;
  }

  function detect() {
    var path = location.pathname;

    // URL 路径：/zh-CN/ /zh_CN/ /zh/ → 中文,  /en/ → 英文
    if (/\/(zh[-_]CN|zh)(\/|$)/i.test(path)) return 'zh-CN';
    if (/\/en(\/|$)/i.test(path)) return 'en';

    // URL 查询参数
    var q = new URLSearchParams(location.search).get('lang');
    if (q === 'zh-CN' || q === 'en') return q;

    // 浏览器语言优先
    if (isZh()) return 'zh-CN';

    // Cookie 偏好（兜底）
    var m = document.cookie.match(new RegExp(LANG_COOKIE + '=([^;]+)'));
    if (m && (m[1] === 'zh-CN' || m[1] === 'en')) return m[1];

    // 默认英文
    return 'en';
  }

  // ── 2. 加载翻译文件 ──────────────────────────────────────

  function load(lang) {
    return fetch('/locales/' + lang + '.json').then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    });
  }

  // ── 3. 应用翻译 ──────────────────────────────────────────

  function apply(lang, dict) {
    DICT[lang] = dict;
    document.documentElement.lang = lang;

    // title / meta
    if (dict.siteTitle) document.title = dict.siteTitle;
    setMeta('keywords', dict.keywords);
    setMeta('description', dict.description);
    setMeta('author', dict.author);

    // data-i18n 元素
    var els = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < els.length; i++) {
      var k = els[i].getAttribute('data-i18n');
      if (dict[k] !== undefined) els[i].innerHTML = dict[k];
    }

    // 特殊元素（社交链接）
    if (dict.socialThirdHref) {
      var a = document.getElementById('social-link-third');
      if (a) a.href = dict.socialThirdHref;
    }
    if (dict.socialThirdIcon) {
      var s = document.getElementById('social-icon-third');
      if (s) s.setAttribute('xlink:href', dict.socialThirdIcon);
    }

    // 保存 Cookie
    document.cookie = LANG_COOKIE + '=' + lang + ';path=/;max-age=31536000';
  }

  function setMeta(name, val) {
    if (!val) return;
    var m = document.querySelector('meta[name="' + name + '"]');
    if (!m) {
      m = document.createElement('meta');
      m.setAttribute('name', name);
      document.head.appendChild(m);
    }
    m.setAttribute('content', val);
  }

  // ── 4. 启动 ──────────────────────────────────────────────

  function run() {
    var lang = detect();
    // 清除旧版 Cookie，避免旧的 lang=en 覆盖浏览器语言
    document.cookie = 'preferred_lang=;path=/;max-age=0';
    document.cookie = 'lang=;path=/;max-age=0';
    console.log('i18n: detected', lang);
    load(lang).then(function (d) {
      apply(lang, d);
      console.log('i18n: loaded & applied', lang);
    }).catch(function (e) {
      console.error('i18n: failed to load', lang, e);
      if (lang !== 'en') {
        load('en').then(function (d) { apply('en', d); });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
