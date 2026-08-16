import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import imageio.v3 as iio

OUTPUT_DIR = r"c:\Glimmr-Jewellry-E-Commerce-Platform-main\Glimmr-Jewellry-E-Commerce-Platform-main\frontend\public\assets\animation"
os.makedirs(OUTPUT_DIR, exist_ok=True)
OUTPUT_MP4 = os.path.join(OUTPUT_DIR, "cartoon_delivery.mp4")

# Supersampled resolution for crisp, organic anti-aliased cartoon lines
SCALE = 2
WIDTH, HEIGHT = 1280 * SCALE, 720 * SCALE
OUT_WIDTH, OUT_HEIGHT = 1280, 720
FPS = 30
TOTAL_DURATION = 10.0  # seconds
TOTAL_FRAMES = int(TOTAL_DURATION * FPS)

def draw_star(draw, cx, cy, size, color):
    points = []
    for i in range(8):
        r = size if i % 2 == 0 else size * 0.38
        angle = i * math.pi / 4 - math.pi / 2
        points.append((cx + r * math.cos(angle), cy + r * math.sin(angle)))
    draw.polygon(points, fill=color)

def draw_musical_note(draw, cx, cy, color, scale=1.0):
    s = scale * SCALE
    draw.ellipse([cx - 8 * s, cy + 6 * s, cx + 6 * s, cy + 16 * s], fill=color)
    draw.rectangle([cx + 3 * s, cy - 12 * s, cx + 6 * s, cy + 10 * s], fill=color)
    draw.polygon([(cx + 6 * s, cy - 12 * s), (cx + 18 * s, cy - 6 * s), (cx + 6 * s, cy - 2 * s)], fill=color)

def render_frame(f):
    t = f / float(FPS)
    # High-resolution canvas
    img = Image.new('RGBA', (WIDTH, HEIGHT), (10, 13, 26, 255))
    draw = ImageDraw.Draw(img)

    # ══════════════════════════════════════════════════════════════
    # 1. MOONLIT SKY & TWINKLING STARS
    # ══════════════════════════════════════════════════════════════
    for idx, (sx, sy) in enumerate([
        (120*SCALE, 80*SCALE), (240*SCALE, 60*SCALE), (380*SCALE, 100*SCALE),
        (520*SCALE, 70*SCALE), (680*SCALE, 85*SCALE), (840*SCALE, 65*SCALE),
        (980*SCALE, 95*SCALE), (1160*SCALE, 70*SCALE), (180*SCALE, 130*SCALE),
        (760*SCALE, 120*SCALE), (1060*SCALE, 130*SCALE)
    ]):
        twinkle = (math.sin(t * 5 + idx) + 1) / 2
        star_size = (4 + twinkle * 4) * SCALE
        draw_star(draw, sx, sy, star_size, (255, 245, 190, int(160 + twinkle * 95)))

    # Glowing Crescent Moon with Soft Aura
    mx, my = 1130 * SCALE, 100 * SCALE
    draw.ellipse([mx - 48*SCALE, my - 48*SCALE, mx + 48*SCALE, my + 48*SCALE], fill=(255, 245, 180, 50))
    draw.ellipse([mx - 38*SCALE, my - 38*SCALE, mx + 38*SCALE, my + 38*SCALE], fill=(255, 243, 176, 255))
    draw.ellipse([mx - 16*SCALE, my - 42*SCALE, mx + 48*SCALE, my + 34*SCALE], fill=(10, 13, 26, 255))

    # ══════════════════════════════════════════════════════════════
    # 2. VILLA FAÇADE & MARBLE PORCH FLOOR
    # ══════════════════════════════════════════════════════════════
    draw.rectangle([0, 230*SCALE, WIDTH, HEIGHT], fill=(38, 30, 25, 255))
    for r in range(230*SCALE, HEIGHT, 45*SCALE):
        draw.line([(0, r), (WIDTH, r)], fill=(26, 20, 16, 255), width=3*SCALE)
    
    # Polished Porch Floor
    draw.rectangle([0, 560*SCALE, WIDTH, HEIGHT], fill=(22, 17, 13, 255))
    draw.line([(0, 560*SCALE), (WIDTH, 560*SCALE)], fill=(181, 154, 108, 255), width=4*SCALE)

    # ══════════════════════════════════════════════════════════════
    # 3. GLOWING AMBER LANTERNS
    # ══════════════════════════════════════════════════════════════
    for lx in [360 * SCALE, 920 * SCALE]:
        draw.rectangle([lx - 14*SCALE, 330*SCALE, lx + 14*SCALE, 385*SCALE], fill=(181, 154, 108, 255))
        flicker = (math.sin(t * 14 + lx) + 1) / 2
        draw.ellipse([lx - 35*SCALE, 315*SCALE, lx + 35*SCALE, 400*SCALE], fill=(255, 215, 0, int(35 + flicker * 25)))
        draw.ellipse([lx - 10*SCALE, 342*SCALE, lx + 10*SCALE, 372*SCALE], fill=(255, int(190 + flicker * 65), 60, 255))

    # ══════════════════════════════════════════════════════════════
    # 4. GRAND ARCHED DOORWAY (Center: x=640)
    # ══════════════════════════════════════════════════════════════
    dw, dh = 260 * SCALE, 330 * SCALE
    dl, dt = 510 * SCALE, 230 * SCALE
    
    # Outer stone arch trim
    draw.ellipse([dl - 18*SCALE, dt - 65*SCALE, dl + dw + 18*SCALE, dt + 65*SCALE], fill=(78, 62, 52, 255), outline=(181, 154, 108, 255), width=5*SCALE)
    draw.rectangle([dl - 18*SCALE, dt, dl + dw + 18*SCALE, 560*SCALE], fill=(78, 62, 52, 255), outline=(181, 154, 108, 255), width=5*SCALE)

    # Interior Warm Hallway Lighting
    draw.ellipse([dl, dt - 45*SCALE, dl + dw, dt + 45*SCALE], fill=(255, 213, 79, 255))
    draw.rectangle([dl, dt, dl + dw, 560*SCALE], fill=(255, 213, 79, 255))

    # Grand Chandelier inside
    draw.polygon([(625*SCALE, 250*SCALE), (655*SCALE, 250*SCALE), (648*SCALE, 275*SCALE), (632*SCALE, 275*SCALE)], fill=(212, 175, 55, 255))
    draw.ellipse([615*SCALE, 268*SCALE, 665*SCALE, 295*SCALE], fill=(255, 249, 196, 255))

    # 3D Double Doors (Swing open from t=4.5s to 6.5s)
    door_progress = 0.0
    if t >= 4.5:
        door_progress = min(1.0, (t - 4.5) / 1.5)
    
    ldw = int((dw / 2) * (1.0 - door_progress * 0.88))
    draw.rectangle([dl, dt, dl + ldw, 560*SCALE], fill=(62, 31, 17, 255), outline=(36, 17, 7, 255), width=3*SCALE)
    rdw = int((dw / 2) * (1.0 - door_progress * 0.88))
    draw.rectangle([dl + dw - rdw, dt, dl + dw, 560*SCALE], fill=(62, 31, 17, 255), outline=(36, 17, 7, 255), width=3*SCALE)

    # ══════════════════════════════════════════════════════════════
    # 5. BRASS DOORBELL & SQUASH CHIME (x=440, y=410)
    # ══════════════════════════════════════════════════════════════
    bx, by = 435 * SCALE, 405 * SCALE
    is_ringing = (2.5 <= t <= 4.5)
    bscale = 0.72 if is_ringing else 1.0

    draw.rounded_rectangle([bx - 16*SCALE*bscale, by - 24*SCALE*bscale, bx + 16*SCALE*bscale, by + 24*SCALE*bscale], radius=6*SCALE, fill=(212, 175, 55, 255), outline=(141, 110, 99, 255), width=2*SCALE)
    draw.ellipse([bx - 7*SCALE*bscale, by - 7*SCALE*bscale, bx + 7*SCALE*bscale, by + 7*SCALE*bscale], fill=(255, 255, 255, 255) if is_ringing else (255, 224, 130, 255))

    if is_ringing:
        for r_ring in range(20*SCALE, 60*SCALE, 14*SCALE):
            draw.arc([bx - r_ring, by - r_ring, bx + r_ring, by + r_ring], start=120, end=240, fill=(255, 224, 130, 255), width=3*SCALE)
        ny = by - int(((t - 2.5) * 45) % 80) * SCALE
        draw_musical_note(draw, bx - 25*SCALE, ny, (255, 213, 79, 255), 1.2)
        draw_musical_note(draw, bx + 30*SCALE, ny - 20*SCALE, (255, 202, 40, 255), 1.0)

    # ══════════════════════════════════════════════════════════════
    # 6. MAYA (THE LADY) IN DOORWAY (Revealed when door opens t>=4.5s)
    # ══════════════════════════════════════════════════════════════
    if t >= 4.5:
        maya_x = 640 * SCALE
        maya_y = 405 * SCALE
        
        # Saree Gown & Festive Silhouette
        draw.polygon([(maya_x - 34*SCALE, maya_y - 30*SCALE), (maya_x + 34*SCALE, maya_y - 30*SCALE), (maya_x + 46*SCALE, 560*SCALE), (maya_x - 46*SCALE, 560*SCALE)], fill=(136, 14, 79, 255))
        # Gold Zari Pallu Border
        draw.line([(maya_x - 28*SCALE, maya_y - 30*SCALE), (maya_x + 30*SCALE, 540*SCALE)], fill=(255, 213, 79, 255), width=8*SCALE)

        # Maya Head
        draw.ellipse([maya_x - 25*SCALE, maya_y - 78*SCALE, maya_x + 25*SCALE, maya_y - 28*SCALE], fill=(255, 209, 164, 255), outline=(224, 169, 109, 255), width=2*SCALE)
        # Hair Bun & Jasmine Flower
        draw.ellipse([maya_x - 28*SCALE, maya_y - 88*SCALE, maya_x + 28*SCALE, maya_y - 56*SCALE], fill=(62, 39, 35, 255))
        draw.ellipse([maya_x + 16*SCALE, maya_y - 82*SCALE, maya_x + 30*SCALE, maya_y - 68*SCALE], fill=(255, 213, 79, 255))

        # Expressive Eyes with Eyelashes
        draw.ellipse([maya_x - 14*SCALE, maya_y - 60*SCALE, maya_x - 4*SCALE, maya_y - 48*SCALE], fill=(255, 255, 255, 255))
        draw.ellipse([maya_x - 11*SCALE, maya_y - 57*SCALE, maya_x - 6*SCALE, maya_y - 51*SCALE], fill=(62, 39, 35, 255))
        draw.ellipse([maya_x + 4*SCALE, maya_y - 60*SCALE, maya_x + 14*SCALE, maya_y - 48*SCALE], fill=(255, 255, 255, 255))
        draw.ellipse([maya_x + 6*SCALE, maya_y - 57*SCALE, maya_x + 11*SCALE, maya_y - 51*SCALE], fill=(62, 39, 35, 255))

        # Bindi, Rosy Cheeks & Radiant Smile
        draw.ellipse([maya_x - 3*SCALE, maya_y - 66*SCALE, maya_x + 3*SCALE, maya_y - 60*SCALE], fill=(213, 0, 0, 255))
        draw.ellipse([maya_x - 18*SCALE, maya_y - 48*SCALE, maya_x - 8*SCALE, maya_y - 40*SCALE], fill=(255, 138, 128, 120))
        draw.ellipse([maya_x + 8*SCALE, maya_y - 48*SCALE, maya_x + 18*SCALE, maya_y - 40*SCALE], fill=(255, 138, 128, 120))
        draw.arc([maya_x - 10*SCALE, maya_y - 48*SCALE, maya_x + 10*SCALE, maya_y - 36*SCALE], start=0, end=180, fill=(216, 67, 21, 255), width=3*SCALE)

    # ══════════════════════════════════════════════════════════════
    # 7. LEO THE COURIER (PIXAR RIG)
    # ══════════════════════════════════════════════════════════════
    if t < 2.5:
        leo_x = (150 + int((t / 2.5) * 200)) * SCALE
        is_walking = True
    elif t < 8.5:
        leo_x = 350 * SCALE
        is_walking = False
    else:
        leo_x = (350 - int(((t - 8.5) / 1.5) * 240)) * SCALE
        is_walking = True

    walk_bob = math.sin(t * 12) * 8 * SCALE if is_walking else 0
    leo_y = 405 * SCALE + int(walk_bob)

    # Contact Shadow on ground
    draw.ellipse([leo_x - 42*SCALE, 554*SCALE, leo_x + 42*SCALE, 568*SCALE], fill=(15, 11, 8, 220))

    # Stepping Legs with Kinematics
    if is_walking:
        lang = math.sin(t * 12) * 26 * SCALE
        draw.line([(leo_x - 12*SCALE, 480*SCALE + walk_bob), (leo_x - 12*SCALE - lang, 555*SCALE)], fill=(26, 26, 36, 255), width=9*SCALE)
        draw.line([(leo_x + 12*SCALE, 480*SCALE + walk_bob), (leo_x + 12*SCALE + lang, 555*SCALE)], fill=(26, 26, 36, 255), width=9*SCALE)
        draw.ellipse([leo_x - 20*SCALE - lang, 548*SCALE, leo_x - 4*SCALE - lang, 558*SCALE], fill=(0, 0, 0, 255))
        draw.ellipse([leo_x + 4*SCALE + lang, 548*SCALE, leo_x + 20*SCALE + lang, 558*SCALE], fill=(0, 0, 0, 255))
    else:
        draw.line([(leo_x - 12*SCALE, 480*SCALE), (leo_x - 12*SCALE, 555*SCALE)], fill=(26, 26, 36, 255), width=9*SCALE)
        draw.line([(leo_x + 12*SCALE, 480*SCALE), (leo_x + 12*SCALE, 555*SCALE)], fill=(26, 26, 36, 255), width=9*SCALE)
        draw.ellipse([leo_x - 20*SCALE, 548*SCALE, leo_x - 4*SCALE, 558*SCALE], fill=(0, 0, 0, 255))
        draw.ellipse([leo_x + 4*SCALE, 548*SCALE, leo_x + 20*SCALE, 558*SCALE], fill=(0, 0, 0, 255))

    # Tuxedo Body with Rounded Contours
    draw.rounded_rectangle([leo_x - 28*SCALE, leo_y - 25*SCALE, leo_x + 28*SCALE, leo_y + 75*SCALE], radius=10*SCALE, fill=(26, 26, 36, 255))
    # Shirt Collar & Golden Bowtie
    draw.polygon([(leo_x - 10*SCALE, leo_y - 25*SCALE), (leo_x + 10*SCALE, leo_y - 25*SCALE), (leo_x + 6*SCALE, leo_y + 40*SCALE), (leo_x - 6*SCALE, leo_y + 40*SCALE)], fill=(255, 255, 255, 255))
    draw.polygon([(leo_x - 10*SCALE, leo_y - 22*SCALE), (leo_x + 10*SCALE, leo_y - 22*SCALE), (leo_x + 8*SCALE, leo_y - 12*SCALE), (leo_x - 8*SCALE, leo_y - 12*SCALE)], fill=(255, 213, 79, 255))

    # Leo Head
    draw.ellipse([leo_x - 26*SCALE, leo_y - 78*SCALE, leo_x + 26*SCALE, leo_y - 26*SCALE], fill=(255, 209, 164, 255), outline=(224, 169, 109, 255), width=2*SCALE)
    # Hair
    draw.ellipse([leo_x - 27*SCALE, leo_y - 86*SCALE, leo_x + 27*SCALE, leo_y - 52*SCALE], fill=(62, 39, 35, 255))
    # Eyes & Blinking Animation
    is_blink = (int(t * 3) % 8 == 0)
    if is_blink:
        draw.line([(leo_x - 15*SCALE, leo_y - 55*SCALE), (leo_x - 5*SCALE, leo_y - 55*SCALE)], fill=(62, 39, 35, 255), width=3*SCALE)
        draw.line([(leo_x + 5*SCALE, leo_y - 55*SCALE), (leo_x + 15*SCALE, leo_y - 55*SCALE)], fill=(62, 39, 35, 255), width=3*SCALE)
    else:
        draw.ellipse([leo_x - 15*SCALE, leo_y - 62*SCALE, leo_x - 5*SCALE, leo_y - 50*SCALE], fill=(255, 255, 255, 255))
        draw.ellipse([leo_x - 12*SCALE, leo_y - 59*SCALE, leo_x - 8*SCALE, leo_y - 53*SCALE], fill=(26, 35, 126, 255))
        draw.ellipse([leo_x + 5*SCALE, leo_y - 62*SCALE, leo_x + 15*SCALE, leo_y - 50*SCALE], fill=(255, 255, 255, 255))
        draw.ellipse([leo_x + 8*SCALE, leo_y - 59*SCALE, leo_x + 12*SCALE, leo_y - 53*SCALE], fill=(26, 35, 126, 255))

    # Rosy Cheeks & Cheerful Smile
    draw.ellipse([leo_x - 20*SCALE, leo_y - 48*SCALE, leo_x - 10*SCALE, leo_y - 40*SCALE], fill=(255, 138, 128, 130))
    draw.ellipse([leo_x + 10*SCALE, leo_y - 48*SCALE, leo_x + 20*SCALE, leo_y - 40*SCALE], fill=(255, 138, 128, 130))
    draw.arc([leo_x - 10*SCALE, leo_y - 48*SCALE, leo_x + 10*SCALE, leo_y - 36*SCALE], start=0, end=180, fill=(216, 67, 21, 255), width=3*SCALE)

    # ══════════════════════════════════════════════════════════════
    # 8. ROYAL VELVET JEWEL BOX (Handover Arc)
    # ══════════════════════════════════════════════════════════════
    if t < 6.5:
        box_x = leo_x + 50 * SCALE
        box_y = leo_y + 18 * SCALE
    elif t < 8.5:
        prog = (t - 6.5) / 2.0
        box_x = int(leo_x + 50*SCALE + prog * 170*SCALE)
        box_y = int(leo_y + 18*SCALE - math.sin(prog * math.pi) * 25*SCALE)
    else:
        box_x = 570 * SCALE
        box_y = 405 * SCALE

    # Plush Velvet Box with Golden Ribbons
    draw.rounded_rectangle([box_x - 26*SCALE, box_y - 18*SCALE, box_x + 26*SCALE, box_y + 18*SCALE], radius=6*SCALE, fill=(136, 14, 79, 255), outline=(255, 213, 79, 255), width=3*SCALE)
    draw.line([(box_x, box_y - 18*SCALE), (box_x, box_y + 18*SCALE)], fill=(255, 213, 79, 255), width=4*SCALE)
    draw.line([(box_x - 26*SCALE, box_y), (box_x + 26*SCALE, box_y)], fill=(255, 213, 79, 255), width=4*SCALE)
    draw.ellipse([box_x - 10*SCALE, box_y - 25*SCALE, box_x + 10*SCALE, box_y - 14*SCALE], fill=(255, 213, 79, 255))

    # White Cartoon Gloves
    if t < 8.5:
        draw.ellipse([leo_x + 22*SCALE, leo_y + 14*SCALE, leo_x + 36*SCALE, leo_y + 28*SCALE], fill=(255, 255, 255, 255), outline=(189, 189, 189, 255), width=2*SCALE)
        draw.ellipse([box_x + 20*SCALE, box_y + 2*SCALE, box_x + 34*SCALE, box_y + 16*SCALE], fill=(255, 255, 255, 255), outline=(189, 189, 189, 255), width=2*SCALE)

    # ══════════════════════════════════════════════════════════════
    # 9. MAGIC DIAMOND SPARKLE BURST (t >= 6.5s)
    # ══════════════════════════════════════════════════════════════
    if t >= 6.5:
        for s_i, (dx, dy) in enumerate([(0, -42*SCALE), (30*SCALE, -30*SCALE), (-30*SCALE, -30*SCALE), (45*SCALE, 0), (-45*SCALE, 0), (25*SCALE, 25*SCALE), (-25*SCALE, 25*SCALE)]):
            sp_dist = 1.0 + (math.sin(t * 8 + s_i) + 1) * 10
            draw_star(draw, box_x + dx * sp_dist / 10, box_y + dy * sp_dist / 10, 7*SCALE, (255, 224, 130, 255))

    # Downsample high-res frame with Lanczos for ultra-crisp anti-aliasing
    final_img = img.resize((OUT_WIDTH, OUT_HEIGHT), Image.Resampling.LANCZOS).convert('RGB')
    return np.array(final_img)

print("Generating 300 supersampled cartoon animation frames...")
frames = []
for f in range(TOTAL_FRAMES):
    frames.append(render_frame(f))

print(f"Total rendered frames: {len(frames)}. Encoding smooth MP4...")
iio.imwrite(OUTPUT_MP4, frames, fps=FPS, codec="libx264")
print(f"Successfully created: {OUTPUT_MP4}")
