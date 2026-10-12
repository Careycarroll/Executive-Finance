/**
 * state.js — Shared Active Company State & Formatting Utilities for Analyze Workbenches
 */

import { BENCHMARK_SNAPSHOTS, getSnapshot } from './snapshots.js';

const ACTIVE_COMPANY_KEY = 'execfin_active_company';

export function getActiveCompany() {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const urlTicker = params.get('ticker')?.toUpperCase().trim();
    if (urlTicker && BENCHMARK_SNAPSHOTS[urlTicker]) {
      const snap = getSnapshot(urlTicker);
      setActiveCompany(snap);
      return snap;
    }
  }

  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(ACTIVE_COMPANY_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.ticker && Array.isArray(parsed.incomeStatements)) {
        return parsed;
      }
    }
  } catch {
    // ignore storage errors
  }

  return getSnapshot('AAPL');
}

export function setActiveCompany(companyData) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(ACTIVE_COMPANY_KEY, JSON.stringify(companyData));
    }
  } catch {
    // ignore quota errors
  }
  return companyData;
}

export function selectSnapshot(ticker) {
  const snap = getSnapshot(ticker);
  return setActiveCompany(snap);
}

// ── Formatting & Concept Link Helpers ────────────────────────────────────────

export function fmtMoney(val, decimals = 0) {
  if (val === null || val === undefined || Number.isNaN(Number(val))) return '—';
  const n = Number(val);
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(2)}T`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(1)}B`;
  return `${sign}$${abs.toFixed(decimals)}M`;
}

export function fmtSharePrice(val) {
  if (val === null || val === undefined || Number.isNaN(Number(val))) return '—';
  const n = Number(val);
  return (n < 0 ? '-$' : '$') + Math.abs(n).toFixed(2);
}

export function fmtPct(val, decimals = 1) {
  if (val === null || val === undefined || Number.isNaN(Number(val)) || !Number.isFinite(Number(val))) return '—';
  return `${(Number(val) * 100).toFixed(decimals)}%`;
}

export function fmtMult(val, decimals = 1) {
  if (val === null || val === undefined || Number.isNaN(Number(val)) || !Number.isFinite(Number(val))) return '—';
  return `${Number(val).toFixed(decimals)}x`;
}

export function conceptPill(conceptId, label = 'Concept') {
  return `<a class="analyze-concept-pill" href="../learn/${conceptId}.html" title="Open Learn concept page: ${conceptId}">${label} &rarr;</a>`;
}

