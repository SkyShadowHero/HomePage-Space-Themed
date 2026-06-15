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

  function detect() {
    var path = location.pathname;

    // URL 路径明确定义语言：/zh-CN/ 或 /en/
    if (/\/zh-CN(\/|$)/.test(path)) return 'zh-CN';
    if (/\/en(\/|$)/.test(path)) return 'en';

    // URL 查询参数
    var q = new URLSearchParams(location.search).get('lang');
    if (q === 'zh-CN' || q === 'en') return q;

    // Cookie 保存的偏好
    var m = document.cookie.match(new RegExp(LANG_COOKIE + '=([^;]+)'));
    if (m && (m[1] === 'zh-CN' || m[1] === 'en')) return m[1];

    // 浏览器语言（中文浏览器 → 中文）
    if (navigator.language && navigator.language.indexOf('zh') === 0) return 'zh-CN';

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
    load(lang).then(function (d) {
      apply(lang, d);
    }).catch(function () {
      // 回退到英文
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
