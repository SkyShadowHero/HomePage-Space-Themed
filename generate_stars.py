"""
从 hipparcos-catalog 提取恒星数据，生成 JS 文件。
输出格式: [ra_hours, dec_degrees, magnitude, bv_color_index]
"""
import hipparcos_catalog
import math

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

# 按星等排序，取最亮的 N 颗
stars.sort(key=lambda s: s[2])
TARGET = 30000
stars = stars[:TARGET]

# 输出为 JS 数组
lines = [
    "// Auto-generated from Hipparcos-2 catalog (ESA I/311)",
    f"// Total: {len(stars)} stars, by brightness",
    f"// Format: [RA_hours, Dec_degrees, Magnitude, B-V]",
    "const starData = [",
]

for i, s in enumerate(stars):
    ra = round(s[0], 4)
    dec = round(s[1], 4)
    mag = round(s[2], 2)
    bv = round(s[3], 3)
    sep = "," if i < len(stars) - 1 else ""
    lines.append(f"  [{ra}, {dec}, {mag}, {bv}]{sep}")

lines.append("];")
lines.append("")

print("\n".join(lines))
