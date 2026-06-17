/**
 * myjs — 滚动点击 + Section 2→3 过渡
 */

$(function () {
  $(".scroll-down").click(function () {
    document.getElementById('section2').scrollIntoView({ behavior: 'smooth' });
  });
});

// Section 2 → 3 过渡动画
(function() {
  'use strict';
  var ease = '0.8s cubic-bezier(0.22, 0.61, 0.36, 1)';
  var earthCanvas = document.getElementById('c');
  var starCanvas = document.getElementById('starfield');
  var footer = document.querySelector('footer');
  var moon = document.getElementById('moon-bg');
  var section3 = document.getElementById('section3');
  
  if (!earthCanvas || !starCanvas || !section3) return;
  
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      var a = entry.isIntersecting;
      earthCanvas.classList.toggle('to-section3', a);
      starCanvas.classList.toggle('to-section3', a);
      
      if (footer) {
        if (a) {
          footer.style.transition = 'transform 0.3s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.3s ease';
          footer.style.transform = 'translateY(100%)';
          footer.style.opacity = '0';
        } else {
          footer.style.transition = 'transform 0.3s cubic-bezier(0.22, 0.61, 0.36, 1) 0.5s, opacity 0.3s ease 0.5s';
          footer.style.transform = 'none';
          footer.style.opacity = '1';
        }
      }
      if (moon) {
        moon.style.transition = 'transform ' + ease;
        moon.style.transform = a ? 'translateY(100%)' : 'none';
      }
      var s3t = document.getElementById('section3-text');
      if (s3t) s3t.classList.toggle('play', a);
      if (window._smoothCursor) window._smoothCursor.setZoom(a ? 2 : 1);
    });
  }, { threshold: 0.5 });
  
  observer.observe(section3);
})();
