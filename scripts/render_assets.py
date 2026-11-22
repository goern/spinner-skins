# SPDX-License-Identifier: GPL-3.0-or-later
# Copyright (C) 2026 spinner-skins contributors
"""Render assets/icon.png and assets/screenshot.png from the skins' own drawing code.

    bun scripts/dump-frames.ts > frames.json
    python3 scripts/render_assets.py frames.json assets/

Needs Pillow. Set FONT to a monospace .ttf if the default is missing. These
images are drawn from the code, not captured from a live terminal.
"""
import json
import os
import sys

from PIL import Image, ImageDraw, ImageFont

FONT = os.environ.get("FONT", "/usr/share/fonts/google-noto-vf/NotoSansMono[wght].ttf")
BG = (22, 24, 33)
FG = (200, 205, 220)
DIM = (120, 126, 150)
CW, CH = 14, 28  # cell size in px
BLOCKS = {"█": 1.0, "▓": 0.75, "▒": 0.5, "░": 0.25}


def rgb(hexcolor):
    h = hexcolor.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


def mix(fg, bg, a):
    return tuple(round(f * a + b * (1 - a)) for f, b in zip(fg, bg))


def draw_run_rows(d, font, rows, x0, y0):
    for y, runs in enumerate(rows):
        x = 0
        for run in runs:
            color = rgb(run["color"])
            for ch in run["text"]:
                px, py = x0 + x * CW, y0 + y * CH
                if ch in BLOCKS:
                    d.rectangle([px, py, px + CW - 1, py + CH - 1], fill=mix(color, BG, BLOCKS[ch]))
                elif ch != " ":
                    d.text((px, py + 2), ch, font=font, fill=color)
                x += 1


def screenshot(frames, out):
    font = ImageFont.truetype(FONT, 23)
    small = ImageFont.truetype(FONT, 20)
    info = ["thinking | 12s", "ctx 60% | $0.41", "tools 7 | Readx4 Bashx2", "> Bash npm test"]
    pad = 28
    block = CH * 4 + CH * 2  # rows + label + gap
    w = pad * 2 + CW * 100
    h = pad * 2 + CH * 2 + block * len(frames)
    img = Image.new("RGB", (w, h), BG)
    d = ImageDraw.Draw(img)
    d.text((pad, pad), "spinner-skins", font=font, fill=FG)
    d.text((pad + CW * 15, pad), "one frame of each skin, drawn by hooks/skins.ts (dark palette, 60% context)", font=small, fill=DIM)
    y = pad + CH * 2
    for name, data in frames.items():
        d.text((pad, y), f"{name}   (end of turn: {data['verb']} for 3s)", font=small, fill=DIM)
        y += CH
        draw_run_rows(d, font, data["rows"], pad, y)
        for i, line in enumerate(info):
            d.text((pad + CW * 48, y + i * CH + 2), line, font=font, fill=DIM if i == 3 else FG)
        y += CH * 5
    img.save(out)


def icon(frames, out):
    size, cell, grid = 512, 38, 10
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=96, fill=BG + (255,))
    off = (size - cell * grid) // 2
    for y, runs in enumerate(frames["lava"]["icon"]):
        x = 0
        for run in runs:
            color = rgb(run["color"])
            for ch in run["text"]:
                if ch in BLOCKS:
                    px, py = off + x * cell, off + y * cell
                    d.rectangle([px, py, px + cell - 1, py + cell - 1], fill=mix(color, BG, BLOCKS[ch]) + (255,))
                x += 1
    img.save(out)


if __name__ == "__main__":
    frames = json.load(open(sys.argv[1]))
    out = sys.argv[2]
    os.makedirs(out, exist_ok=True)
    screenshot(frames, os.path.join(out, "screenshot.png"))
    icon(frames, os.path.join(out, "icon.png"))
