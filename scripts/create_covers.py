#!/usr/bin/env python3
"""
Generate cover images with text overlays for content library.
Uses category background images and overlays content titles.
"""

import os
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import requests

# Paths
ARTIFACTS_DIR = Path("/Users/enesyalcinkaya/.gemini/antigravity/brain/9be885af-46b3-4c67-bbf7-37ae9e7d6529")
CONTENT_DIR = Path("/Users/enesyalcinkaya/projects/Saadet/İçerikler")
OUTPUT_DIR = Path("/Users/enesyalcinkaya/projects/Saadet/scripts/cover_images")

# Supabase
SUPABASE_URL = "https://batzvgczjldnnesojnjj.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhdHp2Z2N6amxkbm5lc29qbmpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NDM2NDIsImV4cCI6MjA4MDUxOTY0Mn0.19eJDxjnfMWMXuH6FWWK7AzJoQUbHlYEpWXZcOdny5Q"

# Category to background mapping
CATEGORY_BG = {
    "ADALET": "bg_adalet_1766747877008.png",
    "AİLE": "bg_aile_1766747906311.png",
    "D8": "bg_dis_politika_1766747922386.png",
    "DIŞ POLİTİKA": "bg_dis_politika_1766747922386.png",
    "EKONOMİ": "bg_ekonomi_1766747940038.png",
    "EĞİTİM": "bg_egitim_1766747957172.png",
    "GENÇLİK": "bg_genclik_1766747993316.png",
    "SAĞLIK": "bg_saglik_1766748012581.png",
    "TARIM": "bg_tarim_1766748066812.png",
    "TEKNOLOJİ": "bg_ekonomi_1766747940038.png",  # Fallback
    "ŞEHİRCİLİK": "bg_dis_politika_1766747922386.png",  # Fallback
}

TOPIC_MAPPING = {
    "ADALET": "Adalet",
    "AİLE": "Aile",
    "D8": "Dış Politika",
    "DIŞ POLİTİKA": "Dış Politika",
    "EKONOMİ": "Ekonomi",
    "EĞİTİM": "Eğitim",
    "GENÇLİK": "Gençlik",
    "SAĞLIK": "Sağlık",
    "TARIM": "Tarım",
    "TEKNOLOJİ": "Teknoloji",
    "ŞEHİRCİLİK": "Şehircilik",
}


def get_font(size=60):
    """Get a font for text overlay."""
    # Try system fonts
    font_paths = [
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/SFNSDisplay.ttf",
        "/Library/Fonts/Arial Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ]
    for fp in font_paths:
        if os.path.exists(fp):
            try:
                return ImageFont.truetype(fp, size)
            except:
                continue
    return ImageFont.load_default()


def wrap_text(text, max_chars=25):
    """Wrap text to fit within max_chars per line."""
    words = text.split()
    lines = []
    current_line = []
    current_length = 0
    
    for word in words:
        if current_length + len(word) + 1 <= max_chars:
            current_line.append(word)
            current_length += len(word) + 1
        else:
            if current_line:
                lines.append(" ".join(current_line))
            current_line = [word]
            current_length = len(word)
    
    if current_line:
        lines.append(" ".join(current_line))
    
    return "\n".join(lines)


def create_cover_image(bg_path, title, output_path):
    """Create a cover image with text overlay."""
    # Open background
    img = Image.open(bg_path).convert("RGBA")
    width, height = img.size
    
    # Create overlay for text background
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    # Add semi-transparent gradient at bottom
    gradient_height = height // 3
    for y in range(height - gradient_height, height):
        alpha = int(180 * (y - (height - gradient_height)) / gradient_height)
        draw.line([(0, y), (width, y)], fill=(0, 0, 0, alpha))
    
    img = Image.alpha_composite(img, overlay)
    draw = ImageDraw.Draw(img)
    
    # Get font
    font = get_font(60)
    
    # Wrap and draw text
    wrapped_title = wrap_text(title.upper(), max_chars=22)
    
    # Calculate text position (bottom center)
    bbox = draw.multiline_textbbox((0, 0), wrapped_title, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    x = (width - text_width) // 2
    y = height - text_height - 60
    
    # Draw text shadow
    draw.multiline_text((x+3, y+3), wrapped_title, font=font, fill=(0, 0, 0, 200), align="center")
    # Draw text
    draw.multiline_text((x, y), wrapped_title, font=font, fill=(255, 255, 255, 255), align="center")
    
    # Save as RGB (for JPEG compatibility)
    img = img.convert("RGB")
    img.save(output_path, "JPEG", quality=90)
    return True


def upload_to_storage(file_path, filename):
    """Upload image to Supabase Storage."""
    headers = {
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "apikey": SUPABASE_KEY,
    }
    
    with open(file_path, 'rb') as f:
        response = requests.post(
            f"{SUPABASE_URL}/storage/v1/object/content_images/{filename}",
            headers={**headers, "Content-Type": "image/jpeg"},
            data=f
        )
    
    if response.status_code in [200, 201]:
        return f"{SUPABASE_URL}/storage/v1/object/public/content_images/{filename}"
    else:
        print(f"  ⚠️ Upload failed: {response.status_code}")
        return None


def update_training_image(title, image_url):
    """Update training record with image URL."""
    headers = {
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "apikey": SUPABASE_KEY,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    
    response = requests.patch(
        f"{SUPABASE_URL}/rest/v1/trainings?title=eq.{requests.utils.quote(title)}",
        headers=headers,
        json={"image_url": image_url}
    )
    
    return response.status_code in [200, 204]


def main():
    print("=" * 60)
    print("🖼️ Kapak Görselleri Oluşturma Scripti")
    print("=" * 60)
    
    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    success_count = 0
    error_count = 0
    
    # Process each category
    for folder in sorted(CONTENT_DIR.iterdir()):
        if not folder.is_dir():
            continue
        
        folder_name = folder.name
        bg_filename = CATEGORY_BG.get(folder_name)
        
        if not bg_filename:
            print(f"⚠️ Arka plan bulunamadı: {folder_name}")
            continue
        
        bg_path = ARTIFACTS_DIR / bg_filename
        if not bg_path.exists():
            print(f"⚠️ Arka plan dosyası yok: {bg_path}")
            continue
        
        print(f"\n📁 Kategori: {folder_name}")
        print("-" * 40)
        
        # Process each DOCX file
        for docx_path in sorted(folder.glob("*.docx")):
            title = docx_path.stem
            import hashlib
            safe_filename = hashlib.md5(title.encode()).hexdigest()[:16] + ".jpg"
            output_path = OUTPUT_DIR / safe_filename
            
            print(f"  📄 {title}")
            
            # Create cover image
            try:
                create_cover_image(bg_path, title, output_path)
                print(f"     ✓ Görsel oluşturuldu")
            except Exception as e:
                print(f"     ❌ Görsel hatası: {e}")
                error_count += 1
                continue
            
            # Upload to storage
            image_url = upload_to_storage(output_path, safe_filename)
            if image_url:
                print(f"     ✓ Yüklendi")
            else:
                error_count += 1
                continue
            
            # Update database
            if update_training_image(title, image_url):
                print(f"     ✓ Veritabanı güncellendi")
                success_count += 1
            else:
                print(f"     ⚠️ Veritabanı güncellenemedi")
                error_count += 1
    
    print("\n" + "=" * 60)
    print(f"✅ Başarılı: {success_count}")
    print(f"❌ Hatalı: {error_count}")
    print("=" * 60)


if __name__ == "__main__":
    main()
