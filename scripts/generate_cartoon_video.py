import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import imageio.v3 as iio

OUTPUT_DIR = r"c:\Glimmr-Jewellry-E-Commerce-Platform-main\Glimmr-Jewellry-E-Commerce-Platform-main\frontend\public\assets\animation"
os.makedirs(OUTPUT_DIR, exist_ok=True)
OUTPUT_MP4 = os.path.join(OUTPUT_DIR, "cartoon_delivery.mp4")

WIDTH, HEIGHT = 1280, 720
FPS = 30
TOTAL_DURATION = 10.0  # seconds
TOTAL_FRAMES = int(TOTAL_DURATION * FPS)

def draw_star(draw, cx, cy, size, color):
    points = []
    for i in range(8):
        r = size if i % 2 == 0 else size * 0.4
        angle = i * math.pi / 4 - math.pi / 2
        points.append((cx + r * math.cos(angle), cy + r * math.sin(angle)))
    draw.polygon(points, fill=color)

def draw_musical_note(draw, cx, cy, color):
    draw.ellipse([cx - 6, cy + 4, cx + 4, cy + 12], fill=color)
    draw.rectangle([cx + 2, cy - 8, cx + 4, cy + 8], fill=color)
    draw.polygon([(cx + 4, cy - 8), (cx + 12, cy - 4), (cx + 4, cy - 2)], fill=color)

def render_frame(f):
    t = f / float(FPS)
    img = Image.new('RGB', (WIDTH, HEIGHT), '#0A0D1A')
    draw = ImageDraw.Draw(img)

    # 1. Sky & Twinkling Stars
    for idx, (sx, sy) in enumerate([(100, 80), (220, 60), (350, 110), (480, 70), (600, 90), (750, 60), (920, 100), (1150, 75), (150, 140), (850, 130), (1050, 120)]):
        twinkle = (math.sin(t * 4 + idx) + 1) / 2
        star_size = 3 + twinkle * 3
        draw_star(draw, sx, sy, star_size, (255, 245, 180, int(150 + twinkle * 105)))

    # Crescent Moon
    moon_x, moon_y = 1120, 100
    draw.ellipse([moon_x - 32, moon_y - 32, moon_x + 32, moon_y + 32], fill='#FFF3B0')
    draw.ellipse([moon_x - 14, moon_y - 36, moon_x + 40, moon_y + 28], fill='#0A0D1A')

    # 2. Villa Wall & Floor
    draw.rectangle([0, 240, WIDTH, HEIGHT], fill='#261E19')
    # Brick pattern
    for r in range(240, HEIGHT, 40):
        draw.line([(0, r), (WIDTH, r)], fill='#1D1612', width=2)
    draw.rectangle([0, 560, WIDTH, HEIGHT], fill='#17120E')
    draw.line([(0, 560), (WIDTH, 560)], fill='#B59A6C', width=4)

    # 3. Lantern Sconces
    for lx in [380, 900]:
        draw.rectangle([lx - 12, 340, lx + 12, 385], fill='#B59A6C')
        flicker = (math.sin(t * 12 + lx) + 1) / 2
        draw.ellipse([lx - 8, 350, lx + 8, 375], fill=(255, int(180 + flicker * 60), 50))
        draw.ellipse([lx - 30, 330, lx + 30, 395], fill=(255, 215, 0, 40))

    # 4. Arched Doorway (Center: x=640)
    door_w, door_h = 240, 320
    door_left, door_top = 520, 240
    # Outer stone arch
    draw.ellipse([door_left - 15, door_top - 60, door_left + door_w + 15, door_top + 60], fill='#4E3E34', outline='#B59A6C', width=4)
    draw.rectangle([door_left - 15, door_top, door_left + door_w + 15, 560], fill='#4E3E34', outline='#B59A6C', width=4)

    # Interior Warm Hallway Glow
    draw.ellipse([door_left, door_top - 40, door_left + door_w, door_top + 40], fill='#FFD54F')
    draw.rectangle([door_left, door_top, door_left + door_w, 560], fill='#FFD54F')

    # Chandelier inside
    draw.polygon([(630, 260), (650, 260), (645, 280), (635, 280)], fill='#D4AF37')
    draw.ellipse([620, 275, 660, 295], fill='#FFF9C4')

    # 3D Double Doors (Swing open from t=4.5s to 6.5s)
    door_open_progress = 0.0
    if t >= 4.5:
        door_open_progress = min(1.0, (t - 4.5) / 1.5)
    
    # Left Door Panel
    left_door_w = int((door_w / 2) * (1.0 - door_open_progress * 0.85))
    draw.rectangle([door_left, door_top, door_left + left_door_w, 560], fill='#3E1F11', outline='#241107', width=2)
    # Right Door Panel
    right_door_w = int((door_w / 2) * (1.0 - door_open_progress * 0.85))
    draw.rectangle([door_left + door_w - right_door_w, door_top, door_left + door_w, 560], fill='#3E1F11', outline='#241107', width=2)

    # 5. Doorbell & Chime (x=450, y=410)
    bell_x, bell_y = 450, 410
    is_ringing = (2.5 <= t <= 4.5)
    bell_scale = 0.7 if is_ringing else 1.0
    
    draw.rectangle([bell_x - 14 * bell_scale, bell_y - 20 * bell_scale, bell_x + 14 * bell_scale, bell_y + 20 * bell_scale], fill='#D4AF37', outline='#8D6E63', width=2)
    draw.ellipse([bell_x - 6 * bell_scale, bell_y - 6 * bell_scale, bell_x + 6 * bell_scale, bell_y + 6 * bell_scale], fill='#FFF' if is_ringing else '#FFE082')

    if is_ringing:
        for ring_r in range(15, 45, 10):
            draw.arc([bell_x - ring_r, bell_y - ring_r, bell_x + ring_r, bell_y + ring_r], start=120, end=240, fill='#FFE082', width=2)
        note_y = bell_y - int((t - 2.5) * 35) % 60
        draw_musical_note(draw, bell_x - 20, note_y, '#FFD54F')
        draw_musical_note(draw, bell_x + 25, note_y - 15, '#FFCA28')

    # 6. Maya (The Lady) in Doorway (Visible when door opens t>=4.5s)
    if t >= 4.5:
        maya_x = 640
        maya_y = 410
        # Maya Head
        draw.ellipse([maya_x - 22, maya_y - 70, maya_x + 22, maya_y - 26], fill='#FFD1A4', outline='#E0A96D', width=2)
        # Hair Bun & Flower
        draw.ellipse([maya_x - 24, maya_y - 78, maya_x + 24, maya_y - 50], fill='#3E2723')
        draw.ellipse([maya_x + 14, maya_y - 72, maya_x + 26, maya_y - 60], fill='#FFD54F')
        # Eyes
        draw.ellipse([maya_x - 12, maya_y - 54, maya_x - 4, maya_y - 44], fill='#FFF')
        draw.ellipse([maya_x - 9, maya_y - 51, maya_x - 5, maya_y - 47], fill='#3E2723')
        draw.ellipse([maya_x + 4, maya_y - 54, maya_x + 12, maya_y - 44], fill='#FFF')
        draw.ellipse([maya_x + 5, maya_y - 51, maya_x + 9, maya_y - 47], fill='#3E2723')
        # Smile & Bindi
        draw.ellipse([maya_x - 2, maya_y - 58, maya_x + 2, maya_y - 54], fill='#D50000')
        draw.arc([maya_x - 8, maya_y - 44, maya_x + 8, maya_y - 34], start=0, end=180, fill='#D84315', width=2)
        # Saree Gown Body
        draw.polygon([(maya_x - 30, maya_y - 26), (maya_x + 30, maya_y - 26), (maya_x + 40, 560), (maya_x - 40, 560)], fill='#880E4F')
        # Gold Zari Saree Pallu
        draw.line([(maya_x - 25, maya_y - 26), (maya_x + 25, 540)], fill='#FFD54F', width=6)

    # 7. Leo (The Courier)
    # Path of Leo:
    # 0s to 2.5s: Walks from x=150 to x=360
    # 2.5s to 8.5s: Stands at x=360
    # 8.5s to 10s: Walks off to left x=360 -> x=100
    if t < 2.5:
        leo_x = 150 + int((t / 2.5) * 210)
        walking = True
    elif t < 8.5:
        leo_x = 360
        walking = False
    else:
        leo_x = 360 - int(((t - 8.5) / 1.5) * 260)
        walking = True

    # Walking bobbing motion
    walk_bob = math.sin(t * 12) * 6 if walking else 0
    leo_y = 410 + int(walk_bob)

    # Shadow
    draw.ellipse([leo_x - 35, 555, leo_x + 35, 568], fill='#0F0B08')

    # Animated Legs
    if walking:
        leg_angle = math.sin(t * 12) * 22
        draw.line([(leo_x - 10, 480 + walk_bob), (leo_x - 10 - leg_angle, 555)], fill='#1A1A24', width=8)
        draw.line([(leo_x + 10, 480 + walk_bob), (leo_x + 10 + leg_angle, 555)], fill='#1A1A24', width=8)
        draw.ellipse([leo_x - 16 - leg_angle, 550, leo_x - 2 - leg_angle, 558], fill='#000')
        draw.ellipse([leo_x + 4 + leg_angle, 550, leo_x + 18 + leg_angle, 558], fill='#000')
    else:
        draw.line([(leo_x - 10, 480), (leo_x - 10, 555)], fill='#1A1A24', width=8)
        draw.line([(leo_x + 10, 480), (leo_x + 10, 555)], fill='#1A1A24', width=8)
        draw.ellipse([leo_x - 16, 550, leo_x - 2, 558], fill='#000')
        draw.ellipse([leo_x + 4, 550, leo_x + 18, 558], fill='#000')

    # Tuxedo Body
    draw.polygon([(leo_x - 25, leo_y - 20), (leo_x + 25, leo_y - 20), (leo_x + 28, leo_y + 70), (leo_x - 28, leo_y + 70)], fill='#1A1A24')
    # Shirt & Bowtie
    draw.polygon([(leo_x - 8, leo_y - 20), (leo_x + 8, leo_y - 20), (leo_x + 5, leo_y + 40), (leo_x - 5, leo_y + 40)], fill='#FFF')
    draw.polygon([(leo_x - 8, leo_y - 18), (leo_x + 8, leo_y - 18), (leo_x + 6, leo_y - 10), (leo_x - 6, leo_y - 10)], fill='#FFD54F')

    # Leo Head
    draw.ellipse([leo_x - 22, leo_y - 68, leo_x + 22, leo_y - 24], fill='#FFD1A4', outline='#E0A96D', width=2)
    # Hair
    draw.ellipse([leo_x - 23, leo_y - 74, leo_x + 23, leo_y - 46], fill='#3E2723')
    # Eyes & Blink
    is_blink = (int(t * 3) % 8 == 0)
    if is_blink:
        draw.line([(leo_x - 12, leo_y - 48), (leo_x - 4, leo_y - 48)], fill='#3E2723', width=2)
        draw.line([(leo_x + 4, leo_y - 48), (leo_x + 12, leo_y - 48)], fill='#3E2723', width=2)
    else:
        draw.ellipse([leo_x - 12, leo_y - 52, leo_x - 4, leo_y - 44], fill='#FFF')
        draw.ellipse([leo_x - 9, leo_y - 50, leo_x - 6, leo_y - 46], fill='#1A237E')
        draw.ellipse([leo_x + 4, leo_y - 52, leo_x + 12, leo_y - 44], fill='#FFF')
        draw.ellipse([leo_x + 6, leo_y - 50, leo_x + 9, leo_y - 46], fill='#1A237E')
    # Smile
    draw.arc([leo_x - 8, leo_y - 42, leo_x + 8, leo_y - 32], start=0, end=180, fill='#D84315', width=2)

    # 8. Royal Velvet Jewel Box
    # Handover animation: Box moves from Leo's hands (x=400) to Maya's hands (x=590) between 6.5s and 8.5s
    if t < 6.5:
        box_x = leo_x + 45
        box_y = leo_y + 15
    elif t < 8.5:
        progress = (t - 6.5) / 2.0
        box_x = int(leo_x + 45 + progress * 150)
        box_y = int(leo_y + 15 - math.sin(progress * math.pi) * 20)
    else:
        box_x = 590
        box_y = 410

    # Box Body & Gold Ribbons
    draw.rectangle([box_x - 22, box_y - 14, box_x + 22, box_y + 14], fill='#880E4F', outline='#FFD54F', width=2)
    draw.line([(box_x, box_y - 14), (box_x, box_y + 14)], fill='#FFD54F', width=3)
    draw.line([(box_x - 22, box_y), (box_x + 22, box_y)], fill='#FFD54F', width=3)
    # Bow knot
    draw.ellipse([box_x - 8, box_y - 20, box_x + 8, box_y - 12], fill='#FFD54F')

    # White Gloves holding box
    if t < 8.5:
        draw.ellipse([leo_x + 20, leo_y + 12, leo_x + 30, leo_y + 22], fill='#FFF', outline='#BDBDBD', width=1)
        draw.ellipse([box_x + 18, box_y + 2, box_x + 28, box_y + 12], fill='#FFF', outline='#BDBDBD', width=1)

    # 9. Magic Sparkle Bursts during Handover (t >= 6.5s)
    if t >= 6.5:
        for s_i, (dx, dy) in enumerate([(0, -35), (25, -25), (-25, -25), (35, 0), (-35, 0), (20, 20), (-20, 20)]):
            sparkle_dist = 1.0 + (math.sin(t * 8 + s_i) + 1) * 12
            draw_star(draw, box_x + dx * sparkle_dist / 20, box_y + dy * sparkle_dist / 20, 5, '#FFE082')

    return np.array(img)

print("Generating 300 procedural cartoon frames...")
frames = []
for f in range(TOTAL_FRAMES):
    frames.append(render_frame(f))

print(f"Total rendered cartoon frames: {len(frames)}. Encoding MP4...")
iio.imwrite(OUTPUT_MP4, frames, fps=FPS, codec="libx264")
print(f"Successfully generated: {OUTPUT_MP4}")
