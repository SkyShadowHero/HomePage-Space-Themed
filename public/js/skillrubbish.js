/**
 * SpaceDebris — 静止太空垃圾
 * 技能卡片随机漂浮在 section2 文字后面，不动
 */
(function () {
  "use strict";

  var container = document.getElementById("space-debris");
  if (!container) return;

  var skills = [
    "GODOT", "PYTHON", "VUE", "COMPOSE", "TAILWIND",
    "LINUX", "GIT", "ASTRO", "FISH", "MINECRAFT",
    "DEEPIN", "ARCH", "DEEPSEEK", "MIUIX", "KDE", "FIREFOX", "CHEMSTRY",
    "CSU"
  ];

  var cardColors = [
    { text: "#374151", bg: "#fff" },
    { text: "#2563eb", bg: "#fff" },
    { text: "#ea580c", bg: "#fff" },
    { text: "#16a34a", bg: "#fff" },
    { text: "#0891b2", bg: "#fff" },
    { text: "#7c3aed", bg: "#fff" },
    { text: "#db2777", bg: "#fff" },
    { text: "#ca8a04", bg: "#fff" }
  ];

  var MAX_CARDS = 15;
  var section2 = document.getElementById("section2");

  function createCard(skill, color, x, y, rot) {
    var el = document.createElement("span");
    el.className = "debris-card";
    el.textContent = skill;
    var fs = 10 + Math.random() * 5;
    var px = 3 + Math.random() * 5;
    var py = 2 + Math.random() * 3;
    el.style.cssText =
      "position:absolute;white-space:nowrap;font-weight:600;font-size:" + fs + "px;" +
      "padding:" + py + "px " + px + "px;border-radius:9999px;" +
      "color:" + color.text + ";background:" + color.bg + ";" +
      "border:1px solid rgba(180,190,200,0.4);" +
      "box-shadow:0 1px 3px rgba(0,0,0,0.1);" +
      "pointer-events:none;transform:translate(" + x + "px," + y + "px) rotate(" + rot + "deg);";
    return el;
  }

  function populate() {
    container.innerHTML = "";
    var cw = container.clientWidth || window.innerWidth;
    var ch = container.clientHeight || window.innerHeight;
    for (var i = 0; i < MAX_CARDS; i++) {
      var skill = skills[Math.floor(Math.random() * skills.length)];
      var color = cardColors[Math.floor(Math.random() * cardColors.length)];
      var x = cw * (0.30 + Math.random() * 0.40);
      var y = ch * (0.32 + Math.random() * 0.30);
      var rot = (Math.random() - 0.5) * 60;
      container.appendChild(createCard(skill, color, x, y, rot));
    }
  }

  // 初次填充
  populate();

  // 窗口尺寸变化时重新分布
  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(populate, 300);
  });

  // 可见性控制
  if (section2) {
    var observer = new IntersectionObserver(
      function (entries) {
        container.style.opacity = entries[0].isIntersecting ? "1" : "0";
      },
      { threshold: 0.1 }
    );
    observer.observe(section2);
  }
})();
