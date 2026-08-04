// tests/validate-registry.test.js
//
// Unit tests for the referential-integrity logic in validate-registry.js.
// Uses Ajv directly against schema.json + synthetic registries, so we don't
// depend on whatever concepts happen to live in registry.json today.

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const load = (rel) => JSON.parse(readFileSync(resolve(repoRoot, rel), 'utf8'));

let validate;
let books;

beforeAll(() => {
  const schema = load('concepts/schema.json');
  books = load('concepts/books.json');
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  validate = ajv.compile(schema);
});

// -- Schema-level tests -----------------------------------------------------

describe('schema: happy paths', () => {
  it('accepts empty registry', () => {
    expect(validate({ version: '1.0.0', concepts: [] })).toBe(true);
  });

  it('accepts a minimal formula-template concept', () => {
    const ok = validate({
      version: '1.0.0',
      concepts: [{
        id: 'tvm',
        domain: 'corpfin',
        title: 'Time value of money',
        tier: 'core',
        sources: [{ book: 'hawawini', chapters: ['2'], primary: true }],
        template: 'formula',
      }],
    });
    expect(ok).toBe(true);
  });

  it('accepts an interactive concept with component + defaults', () => {
    const ok = validate({
      version: '1.0.0',
      concepts: [{
        id: 'black-scholes',
        domain: 'deriv',
        title: 'Black-Scholes',
        tier: 'core',
        sources: [{ book: 'hull', chapters: ['15'], primary: true }],
        template: 'interactive',
        component: 'sensitivity-panel',
        defaults: { spot: 100, strike: 100, rate: 0.05, vol: 0.2 },
      }],
    });
    expect(ok).toBe(true);
  });
});

describe('schema: rejections', () => {
  it('rejects concept id with uppercase', () => {
    const ok = validate({
      version: '1.0.0',
      concepts: [{
        id: 'Black-Scholes',
        domain: 'deriv',
        title: 'x',
        tier: 'core',
        sources: [{ book: 'hull', primary: true }],
        template: 'formula',
      }],
    });
    expect(ok).toBe(false);
  });

  it('rejects unknown domain', () => {
    const ok = validate({
      version: '1.0.0',
      concepts: [{
        id: 'foo',
        domain: 'crypto',
        title: 'x',
        tier: 'core',
        sources: [{ book: 'hull', primary: true }],
        template: 'formula',
      }],
    });
    expect(ok).toBe(false);
  });

  it('rejects interactive template missing component', () => {
    const ok = validate({
      version: '1.0.0',
      concepts: [{
        id: 'foo',
        domain: 'deriv',
        title: 'x',
        tier: 'core',
        sources: [{ book: 'hull', primary: true }],
        template: 'interactive',
      }],
    });
    expect(ok).toBe(false);
  });

  it('rejects formula template WITH component', () => {
    const ok = validate({
      version: '1.0.0',
      concepts: [{
        id: 'foo',
        domain: 'deriv',
        title: 'x',
        tier: 'core',
        sources: [{ book: 'hull', primary: true }],
        template: 'formula',
        component: 'sensitivity-panel',
      }],
    });
    expect(ok).toBe(false);
  });

  it('rejects unknown component id', () => {
    const ok = validate({
      version: '1.0.0',
      concepts: [{
        id: 'foo',
        domain: 'deriv',
        title: 'x',
        tier: 'core',
        sources: [{ book: 'hull', primary: true }],
        template: 'interactive',
        component: 'not-a-real-component',
        defaults: {},
      }],
    });
    expect(ok).toBe(false);
  });
});

// -- Referential-integrity tests (mirror the checks in validate-registry.js)

describe('referential integrity', () => {
  const bookIds = () => new Set(books.books.map((b) => b.id));

  it("'external' book id exists in books.json for reference-tier pages", () => {
    expect(bookIds().has('external')).toBe(true);
  });

  it('every real book has an id, title, and role', () => {
    for (const b of books.books) {
      expect(b.id).toBeTruthy();
      expect(b.title).toBeTruthy();
      expect(b.role).toBeTruthy();
    }
  });
});
