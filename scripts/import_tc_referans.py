#!/usr/bin/env python3
"""
CSV'den TC Kimlik ve Referans Kodu verilerini Supabase'e import eder.
CSV formatı: İsim;T.C. No;Şifre;Ref
"""

import csv
import sys
import requests
from pathlib import Path

# Supabase credentials
SUPABASE_URL = "https://batzvgczjldnnesojnjj.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhdHp2Z2N6amxkbm5lc29qbmpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NDM2NDIsImV4cCI6MjA4MDUxOTY0Mn0.19eJDxjnfMWMXuH6FWWK7AzJoQUbHlYEpWXZcOdny5Q"

CSV_PATH = Path(__file__).parent.parent / "kullanici.csv"
BATCH_SIZE = 500  # Batch insert için


def batch_insert(records: list) -> tuple[int, int]:
    """Insert records in batch. Returns (success_count, error_count)."""
    if not records:
        return 0, 0
    
    headers = {
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "apikey": SUPABASE_KEY,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    
    try:
        response = requests.post(
            f"{SUPABASE_URL}/rest/v1/tc_referans",
            headers=headers,
            json=records
        )
        
        if response.status_code in [200, 201]:
            return len(records), 0
        else:
            print(f"  ❌ Batch insert failed: {response.status_code} - {response.text[:200]}")
            return 0, len(records)
    except Exception as e:
        print(f"  ❌ Batch insert error: {e}")
        return 0, len(records)


def main():
    print("=" * 60)
    print("📥 TC Kimlik - Referans Kodu Import")
    print("=" * 60)
    
    if not CSV_PATH.exists():
        print(f"❌ CSV bulunamadı: {CSV_PATH}")
        sys.exit(1)
    
    total_success = 0
    total_error = 0
    batch = []
    row_count = 0
    
    print(f"\n📁 CSV dosyası: {CSV_PATH}")
    print(f"🔄 Batch boyutu: {BATCH_SIZE}\n")
    
    with open(CSV_PATH, 'r', encoding='utf-8', errors='replace') as f:
        reader = csv.reader(f, delimiter=';')
        
        # Skip header
        header = next(reader, None)
        if header:
            print(f"📋 Header: {header}")
        
        for row in reader:
            row_count += 1
            
            if len(row) < 4:
                print(f"  ⚠️ Satır {row_count}: Az sütun - {row}")
                total_error += 1
                continue
            
            # İsim;T.C. No;Şifre;Ref
            tc_kimlik = row[1].strip()
            referans_kodu = row[3].strip()
            
            if not tc_kimlik or not referans_kodu:
                print(f"  ⚠️ Satır {row_count}: Boş TC veya Ref - {row}")
                total_error += 1
                continue
            
            batch.append({
                "tc_kimlik": tc_kimlik,
                "referans_kodu": referans_kodu
            })
            
            # Insert batch when full
            if len(batch) >= BATCH_SIZE:
                success, error = batch_insert(batch)
                total_success += success
                total_error += error
                print(f"  ✅ {row_count} satır işlendi... ({total_success} başarılı)")
                batch = []
        
        # Insert remaining
        if batch:
            success, error = batch_insert(batch)
            total_success += success
            total_error += error
    
    print("\n" + "=" * 60)
    print(f"📊 Toplam satır: {row_count}")
    print(f"✅ Başarılı: {total_success}")
    print(f"❌ Hatalı: {total_error}")
    print("=" * 60)


if __name__ == "__main__":
    main()
