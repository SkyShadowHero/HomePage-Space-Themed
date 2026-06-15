/**
 * myjs — 仅保留滚动点击事件
 * 地球动画已迁移至 earth.js
 */

$(function () {
  $(".scroll-down").click(function () {
    $("html, body").animate(
      {
        scrollTop: $(".profile-section").offset().top - 100,
      },
      800
    );
  });
});
