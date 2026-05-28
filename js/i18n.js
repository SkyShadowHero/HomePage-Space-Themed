(function() {
    'use strict';

    var DICT = {
        en: {
            siteTitle: "Leaving a digital footprint on the web | SkyShadowHero",
            keywords: "SkyShadowHero footprint",
            description: "Leaving a digital footprint on the web!",
            author: "SkyShadowHero",
            greeting: "I am SkyShadowHero",
            role: "A Developer<br>in another world",
            bio: "And a freshman majoring in Applied Chemistry at Central South University",
            footprint: "I left a digital footprint on the web!",
            footerBy: "By SkyShadowHero",
            frameLabel: "Frame",
            sourceLabel: "Source",
            icpText: "MoeICP20253014",
            socialThird: {
                href: "https://x.com/SkyShadowHero",
                icon: "#icon-X"
            }
        },
        "zh-CN": {
            siteTitle: "在互联网留下一个脚印 | 天影大侠",
            keywords: "天影大侠 脚印",
            description: "在互联网留下一个脚印！",
            author: "天影大侠",
            greeting: "我是天影大侠",
            role: "一个另一平行世界的Developer",
            bio: "同时一大一学生，现就读于中南大学应用化学强基专业",
            footprint: "我在互联网留下了一个脚印！",
            footerBy: "By 天影大侠",
            frameLabel: "框架",
            sourceLabel: "源码",
            icpText: "萌ICP备20253014号",
            socialThird: {
                href: "https://wpa.qq.com/msgrd?v=3&uin=3014429800",
                icon: "#icon-QQ"
            }
        }
    };

    var SUPPORTED = ["en", "zh-CN"];
    var DEFAULT = "en";

    function detect() {
        // 1. URL 参数 ?lang=
        var params = new URLSearchParams(location.search);
        var lang = params.get("lang");
        if (lang && SUPPORTED.indexOf(lang) !== -1) return lang;

        // 2. Cookie
        var m = document.cookie.match(/preferred_lang=([^;]+)/);
        if (m && SUPPORTED.indexOf(m[1]) !== -1) return m[1];

        // 3. 浏览器语言
        if (navigator.language.startsWith("zh")) return "zh-CN";
        if (navigator.language.startsWith("zh_cn")) return "zh-CN";

        // 4. 默认
        return DEFAULT;
    }

    function setMeta(name, content) {
        var el = document.querySelector('meta[name="' + name + '"]');
        if (el) el.setAttribute("content", content);
    }

    function apply(lang) {
        var dict = DICT[lang] || DICT[DEFAULT];

        // <html lang="">
        document.documentElement.lang = lang;

        // <title>
        document.title = dict.siteTitle;

        // <meta>
        setMeta("keywords", dict.keywords);
        setMeta("description", dict.description);
        setMeta("author", dict.author);

        // [data-i18n]
        var els = document.querySelectorAll("[data-i18n]");
        for (var i = 0; i < els.length; i++) {
            var el = els[i];
            var key = el.getAttribute("data-i18n");
            if (dict[key] !== undefined) {
                el.innerHTML = dict[key];
            }
        }

        // 第三个社交链接（X / QQ 按 locale 切换）
        if (dict.socialThird) {
            var link = document.getElementById("social-link-third");
            var icon = document.getElementById("social-icon-third");
            if (link) link.href = dict.socialThird.href;
            if (icon) icon.setAttribute("xlink:href", dict.socialThird.icon);
        }

        // 保存 Cookie
        document.cookie = "preferred_lang=" + lang + "; path=/; max-age=" + (365 * 24 * 60 * 60);
    }

    apply(detect());
})();
