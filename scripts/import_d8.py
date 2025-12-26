#!/usr/bin/env python3
"""
D-8 içeriklerini içerik kütüphanesine ekle.
"""

import os
import sys
import zipfile
from xml.etree import ElementTree
import requests
from pathlib import Path

# Supabase credentials
SUPABASE_URL = "https://batzvgczjldnnesojnjj.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhdHp2Z2N6amxkbm5lc29qbmpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NDM2NDIsImV4cCI6MjA4MDUxOTY0Mn0.19eJDxjnfMWMXuH6FWWK7AzJoQUbHlYEpWXZcOdny5Q"

CONTENT_DIR = Path(__file__).parent.parent / "İçerikler" / "D8"
TOPIC = "D-8"


def extract_description_from_docx(docx_path: Path) -> str:
    """Extract first paragraph after 'KAVRAMSAL TANIM' heading from DOCX."""
    try:
        with zipfile.ZipFile(docx_path) as z:
            xml_content = z.read('word/document.xml')
            tree = ElementTree.fromstring(xml_content)
            
            paragraphs = []
            for p in tree.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
                text = ''.join(
                    t.text for t in p.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t') 
                    if t.text
                )
                if text.strip():
                    paragraphs.append(text.strip())
            
            # Find "KAVRAMSAL TANIM" and get next paragraph
            for i, para in enumerate(paragraphs):
                if "KAVRAMSAL TANIM" in para.upper():
                    if i + 1 < len(paragraphs):
                        return paragraphs[i + 1]
            
            # Fallback: return second paragraph (first is usually title)
            if len(paragraphs) > 2:
                return paragraphs[2]
            elif len(paragraphs) > 1:
                return paragraphs[1]
            
            return ""
    except Exception as e:
        print(f"  ⚠️ DOCX parse error: {e}")
        return ""


def upload_pdf_to_storage(pdf_path: Path) -> str | None:
    """Upload PDF to Supabase Storage and return public URL."""
    try:
        import time
        import random
        file_ext = pdf_path.suffix
        file_name = f"{random.randint(10000, 99999)}_{int(time.time())}{file_ext}"
        
        headers = {
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "apikey": SUPABASE_KEY,
        }
        
        with open(pdf_path, 'rb') as f:
            response = requests.post(
                f"{SUPABASE_URL}/storage/v1/object/content_media/{file_name}",
                headers={**headers, "Content-Type": "application/pdf"},
                data=f
            )
        
        if response.status_code in [200, 201]:
            return f"{SUPABASE_URL}/storage/v1/object/public/content_media/{file_name}"
        else:
            print(f"  ⚠️ Upload failed: {response.status_code} - {response.text[:200]}")
            return None
    except Exception as e:
        print(f"  ⚠️ Upload error: {e}")
        return None


def insert_training(title: str, topic: str, description: str, media_url: str | None) -> bool:
    """Insert training record into database."""
    try:
        headers = {
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "apikey": SUPABASE_KEY,
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
        }
        
        data = {
            "title": title,
            "topic": topic,
            "description": description,
            "media_url": media_url,
            "image_url": None,
            "is_active": True
        }
        
        response = requests.post(
            f"{SUPABASE_URL}/rest/v1/trainings",
            headers=headers,
            json=data
        )
        
        if response.status_code in [200, 201]:
            return True
        else:
            print(f"  ⚠️ Insert failed: {response.status_code} - {response.text[:200]}")
            return False
    except Exception as e:
        print(f"  ⚠️ Insert error: {e}")
        return False


def main():
    print("=" * 60)
    print("📚 D-8 İçerikleri Yükleme")
    print("=" * 60)
    
    if not CONTENT_DIR.exists():
        print(f"❌ D8 klasörü bulunamadı: {CONTENT_DIR}")
        sys.exit(1)
    
    success_count = 0
    error_count = 0
    
    # Find all DOCX files
    docx_files = list(CONTENT_DIR.glob("*.docx"))
    
    print(f"\n📁 {len(docx_files)} içerik bulundu\n")
    
    for docx_path in sorted(docx_files):
        title = docx_path.stem
        pdf_path = docx_path.with_suffix(".pdf")
        
        print(f"📄 {title}")
        
        # Extract description from DOCX
        description = extract_description_from_docx(docx_path)
        if description:
            print(f"   ✓ Açıklama: {description[:60]}...")
        else:
            print(f"   ⚠️ Açıklama bulunamadı")
        
        # Upload PDF if exists
        media_url = None
        if pdf_path.exists():
            media_url = upload_pdf_to_storage(pdf_path)
            if media_url:
                print(f"   ✓ PDF yüklendi")
            else:
                print(f"   ⚠️ PDF yüklenemedi")
        else:
            print(f"   ⚠️ PDF bulunamadı")
        
        # Insert into database
        if insert_training(title, TOPIC, description, media_url):
            print(f"   ✓ Veritabanına eklendi")
            success_count += 1
        else:
            print(f"   ❌ Ekleme başarısız")
            error_count += 1
    
    print("\n" + "=" * 60)
    print(f"✅ Başarılı: {success_count}")
    print(f"❌ Hatalı: {error_count}")
    print("=" * 60)


if __name__ == "__main__":
    main()
