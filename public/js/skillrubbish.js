/**
 * SpaceDebris — 太空垃圾系统
 * 技能卡片 + 碎片从右往左漂浮，在 section2 文字后面
 */
(function () {
  "use strict";

  var container = document.getElementById("space-debris");
  if (!container) return;

  // --- 技能标签列表 ---
  var skills = [
    "GODOT", "PYTHON", "VUE", "COMPOSE", "TAILWIND", "TYPESCRIPT",
    "LINUX", "GIT","ASTRO", "FISH", "MINECRAFT", "SKYSHADOWHERO",
    "DEEPIN", "ARCH", "DEEPSEEKSS","MIUIX", "KDE", "FIREFOX", "CHEMSTRY",
    "CSU"
  ];

  // --- 太空垃圾金属色 ---
  var junkColors = [
    { text: "#b0b8c0", bg: "rgba(60,65,72,0.7)" },
    { text: "#9aa0a8", bg: "rgba(50,55,62,0.72)" },
    { text: "#c0c4c8", bg: "rgba(70,75,82,0.68)" },
    { text: "#a8aeb4", bg: "rgba(55,58,65,0.75)" },
    { text: "#989ea6", bg: "rgba(45,50,56,0.7)" },
    { text: "#b8bcc2", bg: "rgba(65,68,75,0.65)" }
  ];

  var debris = [];
  var running = false;
  var rafId = null;
  var spawnTimer = null;
  var section2 = document.getElementById("section2");

  // --- 碎片颜色 ---
  var fragColors = [
    "rgba(180,190,200,0.6)",
    "rgba(200,200,210,0.5)",
    "rgba(160,170,185,0.55)",
    "rgba(220,220,230,0.45)",
    "rgba(140,150,160,0.5)",
    "rgba(190,180,170,0.5)"
  ];

  // --- 创建垃圾元素 ---
  function createCardEl(skill, color) {
    var el = document.createElement("span");
    el.className = "debris-card";
    el.textContent = skill;
    var fs = 10 + Math.random() * 5; // 10~15px
    var px = 3 + Math.random() * 5; // 3~8px
    var py = 2 + Math.random() * 3; // 2~5px
    // 不规则圆角，模拟破损金属板
    var br1 = 20 + Math.random() * 40;
    var br2 = 20 + Math.random() * 40;
    var br3 = 15 + Math.random() * 30;
    var br4 = 25 + Math.random() * 35;
    var br = br1 + "% " + br2 + "% " + br3 + "% " + br4 + "% / " + (30+Math.random()*40) + "% " + (30+Math.random()*40) + "% " + (30+Math.random()*40) + "% " + (30+Math.random()*40) + "%";
    el.style.cssText =
      "position:absolute;white-space:nowrap;font-weight:600;font-size:" + fs + "px;" +
      "padding:" + py + "px " + px + "px;border-radius:" + br + ";" +
      "color:" + color.text + ";background:" + color.bg + ";" +
      "border:1px solid rgba(100,110,120,0.35);" +
      "box-shadow:inset 0 0 4px rgba(0,0,0,0.3),0 1px 2px rgba(0,0,0,0.2);" +
      "pointer-events:none;will-change:transform;";
    return el;
  }

  function createFragmentEl() {
    var el = document.createElement("span");
    el.className = "debris-frag";
    var w = 6 + Math.random() * 10; // 6~16px
    var h = 3 + Math.random() * 6; // 3~9px
    var r = Math.random() < 0.5 ? "50%" : (2 + Math.random() * 3) + "px";
    var c = fragColors[Math.floor(Math.random() * fragColors.length)];
    el.style.cssText =
      "position:absolute;display:block;" +
      "width:" + w + "px;height:" + h + "px;" +
      "border-radius:" + r + ";" +
      "background:" + c + ";" +
      "pointer-events:none;will-change:transform;";
    return el;
  }

  // --- Spawn ---
  function spawnCard() {
    var skill = skills[Math.floor(Math.random() * skills.length)];
    var color = junkColors[Math.floor(Math.random() * junkColors.length)];
    var el = createCardEl(skill, color);
    container.appendChild(el);

    var cw = container.clientWidth || window.innerWidth;
    var ch = container.clientHeight || window.innerHeight;
    // 从右边出现
    var x = cw + 30 + Math.random() * 80;
    // 垂直位置集中在文字区域周围（% → px）
    var y = ch * (0.25 + Math.random() * 0.50);
    // 速度 (px/s)：越慢越像太空漂浮
    var speed = 15 + Math.random() * 35;
    // 旋转：限制在 ±30°，文字保持可读
    var rot = (Math.random() - 0.5) * 60;

    debris.push({
      el: el,
      x: x,
      y: y,
      speed: speed,
      rot: rot,
      rotSpeed: 0,
      wobbleAmp: 1 + Math.random() * 3,
      wobbleFreq: 0.5 + Math.random() * 1.5,
      birth: performance.now()
    });
  }

  function spawnFragment() {
    var el = createFragmentEl();
    container.appendChild(el);

    var cw = container.clientWidth || window.innerWidth;
    var ch = container.clientHeight || window.innerHeight;
    var x = cw + 20 + Math.random() * 100;
    var y = ch * (0.22 + Math.random() * 0.56);
    var speed = 20 + Math.random() * 50;
    var rot = (Math.random() - 0.5) * 60;

    debris.push({
      el: el,
      x: x,
      y: y,
      speed: speed,
      rot: rot,
      rotSpeed: 0,
      wobbleAmp: 0.5 + Math.random() * 2,
      wobbleFreq: 0.8 + Math.random() * 2,
      birth: performance.now()
    });
  }

  // --- Update ---
  function update(now) {
    if (!running) return;

    var cw = container.clientWidth || window.innerWidth;
    // px per ms，用 delta 计算更准，但这里简单用固定帧率估算
    var dt = 16; // ~60fps

    for (var i = debris.length - 1; i >= 0; i--) {
      var d = debris[i];
      var elapsed = (now - d.birth) / 1000;

      // 移动
      d.x -= d.speed * (dt / 1000);
      // 上下微浮动
      var wobbleY = Math.sin(elapsed * d.wobbleFreq) * d.wobbleAmp;

      // 判断是否完全离开左边
      var elW = d.el.offsetWidth || 80;
      if (d.x < -elW - 20) {
        d.el.remove();
        debris.splice(i, 1);
        continue;
      }

      // 更新 DOM
      d.el.style.transform = "translate(" + d.x + "px," + (d.y + wobbleY) + "px) rotate(" + d.rot + "deg)";
    }

    rafId = requestAnimationFrame(update);
  }

  // --- 自动生成 ---
  function scheduleSpawn() {
    if (!running) return;
    var next = 500 + Math.random() * 1000; // 0.5~1.5 秒
    spawnTimer = setTimeout(function () {
      // 卡片和碎片轮流出现，一次一个
      if (Math.random() < 0.35) spawnCard();
      else spawnFragment();
      scheduleSpawn();
    }, next);
  }

  // --- 初始生成一批垃圾，让场景不空 ---
  function initialSpawn() {
    // 初始只生成少量卡片作为引子，其余由定时生成逐渐填充
    var cw = container.clientWidth || window.innerWidth;
    for (var i = 0; i < 2; i++) {
      var skill = skills[Math.floor(Math.random() * skills.length)];
      var color = junkColors[Math.floor(Math.random() * junkColors.length)];
      var el = createCardEl(skill, color);
      container.appendChild(el);

      // 初始分布在整个视口宽度上，集中在文字区域
      var x = Math.random() * cw * 0.9 + cw * 0.05;
      var ch = container.clientHeight || window.innerHeight;
      var y = ch * (0.25 + Math.random() * 0.50);
      var speed = 15 + Math.random() * 35;
      var rot = (Math.random() - 0.5) * 60;

      debris.push({
        el: el,
        x: x,
        y: y,
        speed: speed,
        rot: rot,
        rotSpeed: 0,
        wobbleAmp: 1 + Math.random() * 3,
        wobbleFreq: 0.5 + Math.random() * 1.5,
        birth: performance.now()
      });
    }
    // 初始附带碎片
    for (var j = 0; j < 6; j++) spawnFragment();
  }

  // --- 可见性控制：只在 section2 可见时运行 ---
  function start() {
    if (running) return;
    running = true;
    rafId = requestAnimationFrame(update);
    scheduleSpawn();
  }

  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    if (spawnTimer) clearTimeout(spawnTimer);
  }

  // --- IntersectionObserver ---
  if (section2) {
    var observer = new IntersectionObserver(
      function (entries) {
        if (entries[0].isIntersecting) {
          start();
        } else {
          stop();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(section2);
  } else {
    // fallback: 始终运行
    start();
  }

  // 初始生成
  initialSpawn();
})();
