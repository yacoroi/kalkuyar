#!/usr/bin/env python3
"""
D-8 içeriklerine kapak görseli ekle.
"""

import requests
import time
import random

# Supabase credentials
SUPABASE_URL = "https://batzvgczjldnnesojnjj.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhdHp2Z2N6amxkbm5lc29qbmpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NDM2NDIsImV4cCI6MjA4MDUxOTY0Mn0.19eJDxjnfMWMXuH6FWWK7AzJoQUbHlYEpWXZcOdny5Q"

IMAGE_PATH = "/Users/enesyalcinkaya/projects/Saadet/assets/covers/d8_cover.png"

def upload_image():
    """Upload image to Supabase Storage."""
    file_name = f"d8_cover_{int(time.time())}.png"
    
    headers = {
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "apikey": SUPABASE_KEY,
    }
    
    with open(IMAGE_PATH, 'rb') as f:
        response = requests.post(
            f"{SUPABASE_URL}/storage/v1/object/content_images/{file_name}",
            headers={**headers, "Content-Type": "image/png"},
            data=f
        )
    
    if response.status_code in [200, 201]:
        url = f"{SUPABASE_URL}/storage/v1/object/public/content_images/{file_name}"
        print(f"✓ Görsel yüklendi: {url}")
        return url
    else:
        print(f"❌ Yükleme hatası: {response.status_code} - {response.text}")
        return None

def update_d8_trainings(image_url):
    """Update all D-8 trainings with the cover image."""
    headers = {
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "apikey": SUPABASE_KEY,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    
    response = requests.patch(
        f"{SUPABASE_URL}/rest/v1/trainings?topic=eq.D-8",
        headers=headers,
        json={"image_url": image_url}
    )
    
    if response.status_code in [200, 204]:
        print(f"✓ D-8 içerikleri güncellendi")
        return True
    else:
        print(f"❌ Güncelleme hatası: {response.status_code} - {response.text}")
        return False

def main():
    print("=" * 50)
    print("📸 D-8 Kapak Görseli Yükleme")
    print("=" * 50)
    
    image_url = upload_image()
    if image_url:
        update_d8_trainings(image_url)
    
    print("=" * 50)

if __name__ == "__main__":
    main()
