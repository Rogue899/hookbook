import { describe, it, expect } from 'vitest';

// Mirror of the trust-gate's value extractor in `scripts/downgrade-pr-trust.mjs`.
// Keep in sync with that file.
function extractTrust(content: string): { ok: boolean; value?: string; reason?: string } {
  const match = content.match(/^trust:\s*["']?([\w-]+)["']?\s*$/im);
  if (!match) return { ok: false, reason: 'missing-or-malformed' };
  const value = match[1].toLowerCase();
  if (value !== 'experimental') return { ok: false, value, reason: 'wrong-tier' };
  return { ok: true, value };
}

describe('trust-label gate (extractor)', () => {
  it('accepts trust: experimental', () => {
    const r = extractTrust('---\ntitle: x\ntrust: experimental\n---\nbody');
    expect(r.ok).toBe(true);
    expect(r.value).toBe('experimental');
  });

  it('rejects trust: tested', () => {
    const r = extractTrust('---\ntrust: tested\n---');
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('wrong-tier');
    expect(r.value).toBe('tested');
  });

  it('rejects trust: from-source', () => {
    const r = extractTrust('---\ntrust: from-source\n---');
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('wrong-tier');
  });

  it('rejects when trust field is missing entirely', () => {
    const r = extractTrust('---\ntitle: no trust\n---\nbody');
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('missing-or-malformed');
  });

  it('rejects double-quoted higher tier', () => {
    const r = extractTrust('---\ntrust: "tested"\n---');
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('wrong-tier');
    expect(r.value).toBe('tested');
  });

  it('rejects single-quoted higher tier', () => {
    const r = extractTrust("---\ntrust: 'tested'\n---");
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('wrong-tier');
  });

  it('accepts double-quoted experimental', () => {
    const r = extractTrust('---\ntrust: "experimental"\n---');
    expect(r.ok).toBe(true);
  });

  it('rejects PascalCase Trust: tested (case-insensitive key)', () => {
    const r = extractTrust('---\nTrust: tested\n---');
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('wrong-tier');
  });

  it('rejects uppercase value', () => {
    const r = extractTrust('---\ntrust: TESTED\n---');
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('wrong-tier');
  });

  it('accepts trust deep in the file (not just first line)', () => {
    const r = extractTrust('---\ntitle: x\nslug: x\ndescription: x\ntrust: experimental\ncategory: format\n---');
    expect(r.ok).toBe(true);
  });
});
