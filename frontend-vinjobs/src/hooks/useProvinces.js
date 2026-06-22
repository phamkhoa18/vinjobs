/**
 * useProvinces — Fetch danh sách 63 tỉnh/thành từ API thực tế
 * API: https://provinces.open-api.vn/api/?depth=1
 * 
 * Trả về: { provinces, loading, error }
 * province object: { code, name, codename, division_type }
 */

import { useState, useEffect } from 'react';

const CACHE_KEY = 'vinjobs_provinces_cache';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 giờ

// Thành phố trực thuộc TW — ưu tiên hiển thị trước
const PRIORITY_CODES = [79, 1, 48, 31, 92, 46]; // HCM, HN, ĐN, HP, CT, Huế

function cleanName(raw) {
  // "Thành phố Hà Nội" → "Hà Nội", "Tỉnh Bắc Ninh" → "Bắc Ninh"
  return raw
    .replace(/^Thành phố\s+/i, '')
    .replace(/^Tỉnh\s+/i, '')
    .trim();
}

function getIcon(divisionType) {
  if (divisionType === 'thành phố trung ương') return 'location_city';
  return 'apartment';
}

export function useProvinces() {
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check localStorage cache
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) {
          setProvinces(data);
          setLoading(false);
          return;
        }
      }
    } catch (_) { /* ignore */ }

    // Fetch from API
    fetch('https://provinces.open-api.vn/api/?depth=1')
      .then(r => {
        if (!r.ok) throw new Error('Network error');
        return r.json();
      })
      .then(data => {
        const mapped = data.map(p => ({
          code: p.code,
          name: cleanName(p.name),
          fullName: p.name,
          codename: p.codename,
          divisionType: p.division_type,
          isCity: p.division_type === 'thành phố trung ương',
          icon: getIcon(p.division_type),
        }));

        // Sắp xếp: TP lớn trước, rồi A-Z
        const priority = PRIORITY_CODES
          .map(code => mapped.find(p => p.code === code))
          .filter(Boolean);
        const rest = mapped
          .filter(p => !PRIORITY_CODES.includes(p.code))
          .sort((a, b) => a.name.localeCompare(b.name, 'vi'));

        const sorted = [...priority, ...rest];

        setProvinces(sorted);
        setLoading(false);

        // Save to cache
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ data: sorted, timestamp: Date.now() }));
        } catch (_) { /* ignore */ }
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { provinces, loading, error };
}
