"""
从 Hipparcos-2 星表（ESA I/311）生成精简版 stars.js。

数据源优先级：
1. 仓库内已有的 public/js/stars.js（无需安装任何依赖，推荐）
2. hipparcos_catalog 库（原始星表，需要: pip install hipparcos-catalog）

只保留最亮的 TARGET 颗星 —— 浏览器端最多只画 800 颗（移动端 200），
全量 30000 颗数据约 1MB，其中 99% 是永远不会被渲染的无效流量。

输出格式: [ra_hours, dec_degrees, magnitude, bv_color_index]
"""
import json
import math
import os
import re
import sys

TARGET = 800
HERE = os.path.dirname(os.path.abspath(__file__))
STARS_JS = os.path.join(HERE, "public", "js", "stars.js")


# ---------- 数据源 ----------

def load_from_existing():
    """从现有 stars.js 提取 starData，无需外部依赖。"""
    if not os.path.exists(STARS_JS):
        return None
    with open(STARS_JS, encoding="utf-8") as f:
        text = f.read()
    m = re.search(r"const starData\s*=\s*(\[[\s\S]*?\]);", text)
    if not m:
        return None
    try:
        return json.loads(m.group(1))
    except json.JSONDecodeError:
        return None


def load_from_catalog():
    """用 hipparcos_catalog 库读取原始星表。"""
    try:
        import hipparcos_catalog
    except ImportError:
        print("提示: 未安装 hipparcos-catalog，且本地 stars.js 不存在或无法解析。", file=sys.stderr)
        print("      安装: pip install hipparcos-catalog", file=sys.stderr)
        sys.exit(1)

    path = hipparcos_catalog.catalog_path()
    stars = []
    with open(path) as f:
        for line in f:
            parts = line.split()
            if len(parts) < 27:
                continue
            try:
                ra_rad = float(parts[4])
                dec_rad = float(parts[5])
                mag = float(parts[19])      # Hpmag
                bv = float(parts[23])       # B-V color index
            except (ValueError, IndexError):
                continue
            # Convert RA: radians → hours (0-24)
            ra_h = ra_rad * 12.0 / math.pi
            # Convert Dec: radians → degrees (-90 to 90)
            dec_d = dec_rad * 180.0 / math.pi
            stars.append([ra_h, dec_d, mag, bv])
    return stars


# ---------- 浏览器端渲染代码（与旧版 stars.js 尾部 1:1 对应） ----------

RENDER_CODE = r'''
// --- v5 MINIMAL: precomputed colour strings, no glow, no flare, no alpha, brightness-sorted subset ---
(function(){
"use strict";
var cv=document.createElement("canvas");
cv.id="starfield";
cv.style.cssText="position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0";
document.body.prepend(cv);
var cx=cv.getContext("2d");
var dpr=window.devicePixelRatio||1;
var W,H;
var scrollY=0;
var PARALLAX=0.04;
var MAX_DRAW=800;

// Pre-select brightest stars
var sortedIndices=[];
for(var i=0;i<starData.length;i++) sortedIndices.push(i);
sortedIndices.sort(function(a,b){return starData[a][2]-starData[b][2]});

// Pre-built per-star data (only for the selected subset)
var starX=[],starY=[],starBS=[],starF=[],starA=[],starP=[],starF2=[],starP2=[],starCol=[];
var TAU=Math.PI*2;

function buildStars(){
  starX.length=0;starY.length=0;starBS.length=0;
  starF.length=0;starA.length=0;starP.length=0;starF2.length=0;starP2.length=0;starCol.length=0;
  for(var j=0;j<MAX_DRAW&&j<sortedIndices.length;j++){
    var i=sortedIndices[j];
    var s=starData[i], mg=s[2];
    var bs=Math.max(0.22,Math.min(2.0,(7.5-mg)*0.22));
    var fq,ap;
    if(mg<0){fq=1.5+Math.random()*1.5;ap=1.0}
    else if(mg<1){fq=1.2+Math.random()*1.2;ap=0.95}
    else if(mg<2){fq=1.0+Math.random()*1.0;ap=0.92}
    else if(mg<3){fq=0.7+Math.random()*0.8;ap=0.90}
    else if(mg<4){fq=0.5+Math.random()*0.6;ap=0.88}
    else if(mg<5){fq=0.4+Math.random()*0.5;ap=0.87}
    else if(mg<6){fq=0.3+Math.random()*0.4;ap=0.87}
    else{fq=0.2+Math.random()*0.3;ap=0.87}
    var b=s[3],r2,g2,b2;
    if(b<-0.3){r2=0.55;g2=0.75;b2=1.0}
    else if(b<-0.1){r2=0.6;g2=0.8;b2=1.0}
    else if(b<0.1){r2=0.75;g2=0.85;b2=1.0}
    else if(b<0.3){r2=0.9;g2=0.9;b2=0.95}
    else if(b<0.5){r2=1.0;g2=0.95;b2=0.8}
    else if(b<0.8){r2=1.0;g2=0.85;b2=0.6}
    else if(b<1.2){r2=1.0;g2=0.7;b2=0.4}
    else{r2=1.0;g2=0.5;b2=0.2}
    starX.push(Math.random()*W);
    starY.push(Math.random()*H);
    starBS.push(bs);
    starF.push(fq); starA.push(ap); starP.push(Math.random()*TAU);
    starF2.push(fq*1.73); starP2.push(starP[starP.length-1]*0.7);
    starCol.push("rgb("+(r2*255|0)+","+(g2*255|0)+","+(b2*255|0)+")");
  }
}

var rto,lastW=0;
function rs(){
  W=window.innerWidth;H=window.innerHeight;
  cv.width=W*dpr;cv.height=H*dpr;
  cv.style.width=W+"px";cv.style.height=H+"px";
  cx.setTransform(dpr,0,0,dpr,0,0);
  MAX_DRAW=W<768?200:800;
  if(W!==lastW){lastW=W;clearTimeout(rto);rto=setTimeout(buildStars,300);}
}
window.addEventListener("resize",rs);
window.addEventListener("scroll",function(){scrollY=window.scrollY||window.pageYOffset},{passive:true});
rs();

function draw(t){
  var T=t*0.001;
  var offY=-scrollY*PARALLAX;
  offY=((offY%H)+H)%H;

  cx.fillStyle="#05060a";cx.fillRect(0,0,W,H);

  for(var j=0,len=starX.length;j<len;j++){
    var px=starX[j];
    var py=starY[j]+offY;
    if(py>=H)py-=H;
    if(py<-5||py>H+5||px<-5||px>W+5)continue;

    var f=starF[j],f2=starF2[j],a=starA[j],p=starP[j],p2=starP2[j];
    var twl=1+Math.sin(T*f+p)*a+Math.sin(T*f2+p2)*a*0.15;
    var sz=starBS[j]*(0.85+twl*0.15);
    if(sz<0.5)continue;

    cx.fillStyle=starCol[j];
    cx.beginPath();cx.arc(px,py,sz,0,TAU);cx.fill();
  }
  requestAnimationFrame(draw);
}
// prefers-reduced-motion: 只画一帧静态星空，不启动动画循环
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  draw(0);
} else {
  requestAnimationFrame(draw);
}
})();
'''


# ---------- 生成 ----------

def main():
    stars = load_from_existing()
    if stars is None:
        stars = load_from_catalog()

    # 按星等排序，取最亮的 TARGET 颗
    stars.sort(key=lambda s: s[2])
    stars = stars[:TARGET]

    lines = [
        "// Auto-generated by generate_stars.py — 只保留最亮的 %d 颗星（浏览器端渲染上限）" % len(stars),
        "// Source: Hipparcos-2 catalog (ESA I/311), sorted by brightness",
        "// Format: [RA_hours, Dec_degrees, Magnitude, B-V]",
        "const starData = [",
    ]
    for i, s in enumerate(stars):
        sep = "," if i < len(stars) - 1 else ""
        lines.append("  [%.4f, %.4f, %.2f, %.3f]%s" % (s[0], s[1], s[2], s[3], sep))
    lines.append("];")
    lines.append("")
    lines.append(RENDER_CODE.lstrip("\n"))

    with open(STARS_JS, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print("生成完成: %s" % STARS_JS)
    print("星星数量: %d（原 30000）" % len(stars))
    print("文件大小: %.1f KB" % (os.path.getsize(STARS_JS) / 1024.0))


if __name__ == "__main__":
    main()
