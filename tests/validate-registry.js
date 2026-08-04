#!/usr/bin/env node
// tests/validate-registry.js
//
// Validates concepts/registry.json against concepts/schema.json,
// then enforces referential integrity rules that JSON Schema can't express.
//
// Run via: npm run validate:registry
// Exits 0 on success, 1 on any failure. CI-friendly.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');

const load = (rel) => JSON.parse(readFileSync(resolve(repoRoot, rel), 'utf8'));

const schema   = load('concepts/schema.json');
const registry = load('concepts/registry.json');
const books    = load('concepts/books.json');

const errors = [];
const fail = (msg) => errors.push(msg);

// ---------------------------------------------------------------------------
// 1. JSON Schema validation (Ajv)
// ---------------------------------------------------------------------------
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

if (!validate(registry)) {
  for (const err of validate.errors) {
    fail(`schema: ${err.instancePath || '/'} ${err.message}`);
  }
}

// ---------------------------------------------------------------------------
// 2. Referential integrity checks (beyond what schema can express)
// ---------------------------------------------------------------------------
const bookIds = new Set(books.books.map((b) => b.id));
const conceptIds = new Set();

for (const c of registry.concepts) {
  // 2a. Unique concept IDs
  if (conceptIds.has(c.id)) {
    fail(`duplicate concept id: ${c.id}`);
  }
  conceptIds.add(c.id);

  // 2b. Every source book must exist in books.json (or be 'external')
  for (const s of c.sources || []) {
    if (!bookIds.has(s.book)) {
      fail(`concept ${c.id}: unknown book id "${s.book}" (not in books.json)`);
    }
  }

  // 2c. Exactly one primary source per concept
  const primaryCount = (c.sources || []).filter((s) => s.primary === true).length;
  if (primaryCount !== 1) {
    fail(`concept ${c.id}: must have exactly one primary source (found ${primaryCount})`);
  }
}

// 2d. related[] must reference real concept IDs (second pass, needs full set)
for (const c of registry.concepts) {
  for (const relId of c.related || []) {
    if (!conceptIds.has(relId)) {
      fail(`concept ${c.id}: related id "${relId}" does not exist`);
    }
    if (relId === c.id) {
      fail(`concept ${c.id}: cannot list itself in related[]`);
    }
  }
}

// ---------------------------------------------------------------------------
// 3. Report
// ---------------------------------------------------------------------------
if (errors.length > 0) {
  console.error(`\n❌ Registry validation failed with ${errors.length} error(s):\n`);
  for (const e of errors) console.error(`  • ${e}`);
  console.error('');
  process.exit(1);
}

console.log(
  `✅ Registry valid: ${registry.concepts.length} concept(s), ` +
  `${books.books.length} book(s), schema v${registry.version}`
);
process.exit(0);
