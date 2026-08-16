import os
import math
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
import imageio.v3 as iio

# Paths
BRAIN_DIR = r"C:\Users\aayus\.gemini\antigravity\brain\ebcb49e5-6017-4c34-92d1-409577912fec"
OUTPUT_DIR = r"c:\Glimmr-Jewellry-E-Commerce-Platform-main\Glimmr-Jewellry-E-Commerce-Platform-main\frontend\public\assets\animation"
os.makedirs(OUTPUT_DIR, exist_ok=True)
OUTPUT_MP4 = os.path.join(OUTPUT_DIR, "delivery_story.mp4")

# Scene images (4K photorealistic cinematic stills)
SCENE_FILES = [
    os.path.join(BRAIN_DIR, "scene1_arrival_1786868157451.jpg"),
    os.path.join(BRAIN_DIR, "scene2_doorbell_1786868191052.jpg"),
    os.path.join(BRAIN_DIR, "scene3_door_open_1786869095965.jpg"),
    os.path.join(BRAIN_DIR, "scene4_handover_1786869463940.jpg"),
]

# 1080p 60FPS Video Settings
WIDTH, HEIGHT = 1920, 1080
FPS = 60
DURATION_PER_SCENE = 2.5  # seconds
TRANSITION_DURATION = 0.6  # seconds
FRAMES_PER_SCENE = int(DURATION_PER_SCENE * FPS)
TRANSITION_FRAMES = int(TRANSITION_DURATION * FPS)

def load_and_resize(path):
    img = Image.open(path).convert('RGB')
    # Margin for smooth Ken Burns pan & zoom
    target_w, target_h = int(WIDTH * 1.15), int(HEIGHT * 1.15)
    img_ratio = img.width / img.height
    target_ratio = target_w / target_h
    
    if img_ratio > target_ratio:
        new_w = int(img.height * target_ratio)
        offset = (img.width - new_w) // 2
        img = img.crop((offset, 0, offset + new_w, img.height))
    else:
        new_h = int(img.width / target_ratio)
        offset = (img.height - new_h) // 2
        img = img.crop((0, offset, img.width, offset + new_h))
        
    return img.resize((target_w, target_h), Image.Resampling.LANCZOS)

print("Loading 4K photorealistic scene images...")
loaded_images = [load_and_resize(p) for p in SCENE_FILES]

def get_scene_frame(img, progress, scene_idx):
    """Applies smooth cubic-eased Ken Burns zoom and pan depending on scene."""
    w, h = img.width, img.height
    crop_w, crop_h = WIDTH, HEIGHT
    
    # Smooth cubic ease-in-out
    p = 3 * (progress ** 2) - 2 * (progress ** 3)
    
    if scene_idx == 0:  # Push in towards courier walking up steps
        zoom = 1.0 + 0.12 * p
        cur_w, cur_h = int(crop_w * zoom), int(crop_h * zoom)
        x = int((w - cur_w) * (0.3 + 0.3 * p))
        y = int((h - cur_h) * (0.4 + 0.2 * p))
    elif scene_idx == 1:  # Macro push-in on glowing brass doorbell button
        zoom = 1.12 - 0.10 * p
        cur_w, cur_h = int(crop_w * zoom), int(crop_h * zoom)
        x = int((w - cur_w) * (0.5 + 0.2 * p))
        y = int((h - cur_h) * (0.4 + 0.1 * p))
    elif scene_idx == 2:  # Slow pan across open doors revealing Maya & chandelier
        zoom = 1.0 + 0.08 * p
        cur_w, cur_h = int(crop_w * zoom), int(crop_h * zoom)
        x = int((w - cur_w) * (0.6 - 0.3 * p))
        y = int((h - cur_h) * 0.4)
    else:  # Handover - slow push into velvet box & diamond sparkle
        zoom = 1.05 + 0.08 * p
        cur_w, cur_h = int(crop_w * zoom), int(crop_h * zoom)
        x = int((w - cur_w) * 0.5)
        y = int((h - cur_h) * (0.3 + 0.2 * p))
        
    x = max(0, min(x, w - cur_w))
    y = max(0, min(y, h - cur_h))
    
    frame = img.crop((x, y, x + cur_w, y + cur_h)).resize((WIDTH, HEIGHT), Image.Resampling.BILINEAR)
    return np.array(frame)

print(f"Generating 1080p 60FPS frames ({FRAMES_PER_SCENE * 4} total frames)...")
all_frames = []

for i, img in enumerate(loaded_images):
    for f in range(FRAMES_PER_SCENE):
        progress = f / float(FRAMES_PER_SCENE)
        frame = get_scene_frame(img, progress, i)
        
        # Golden cross-dissolve transition with next scene
        if i < len(loaded_images) - 1 and f >= (FRAMES_PER_SCENE - TRANSITION_FRAMES):
            t_progress = (f - (FRAMES_PER_SCENE - TRANSITION_FRAMES)) / float(TRANSITION_FRAMES)
            next_frame = get_scene_frame(loaded_images[i+1], t_progress * 0.1, i+1)
            
            # Smooth cosine blend
            alpha = (1.0 - math.cos(t_progress * math.pi)) / 2.0
            blended = (frame.astype(np.float32) * (1.0 - alpha) + next_frame.astype(np.float32) * alpha).astype(np.uint8)
            all_frames.append(blended)
        else:
            all_frames.append(frame)

print(f"Total rendered frames: {len(all_frames)}. Encoding 1080p 60FPS MP4...")
iio.imwrite(OUTPUT_MP4, all_frames, fps=FPS, codec="libx264")
print(f"Successfully generated 1080p video: {OUTPUT_MP4}")
