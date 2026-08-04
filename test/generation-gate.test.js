import { execFileSync, spawnSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

// This is the design D5 gate: prove the GENERATED project is green, not just the
// CLI. It runs `pnpm install` + `pnpm check` + `pnpm build` on a freshly
// scaffolded project. It needs the pinned versions to resolve on npm and pnpm on
// PATH, so it is opt-in via RUN_GENERATION_GATE=1 and skipped otherwise.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BIN = path.resolve(__dirname, '..', 'bin', 'index.js');
const ENABLED = process.env.RUN_GENERATION_GATE === '1';
const hasPnpm = (() => {
  try {
    execFileSync('pnpm', ['--version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
})();

const run = (itSkip) => (ENABLED && hasPnpm ? itSkip : itSkip.skip);

describe('generated project quality gate', () => {
  let target;

  beforeAll(async () => {
    if (!ENABLED) return;
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'cfs-gate-'));
    target = path.join(tmp, 'gate-app');
    execFileSync(process.execPath, [BIN, 'gate-app', '--no-skills'], {
      cwd: tmp,
      stdio: 'inherit',
    });
  });

  afterAll(async () => {
    if (target) await fs.rm(path.dirname(target), { recursive: true, force: true });
  });

  run(it)('installs dependencies', () => {
    const res = spawnSync('pnpm', ['install'], { cwd: target, stdio: 'inherit' });
    expect(res.status).toBe(0);
  }, 600_000);

  run(it)('passes pnpm check (typecheck + lint + test)', () => {
    const res = spawnSync('pnpm', ['check'], { cwd: target, stdio: 'inherit' });
    expect(res.status).toBe(0);
  }, 600_000);

  run(it)('passes pnpm build', () => {
    const res = spawnSync('pnpm', ['build'], { cwd: target, stdio: 'inherit' });
    expect(res.status).toBe(0);
  }, 600_000);

  if (!ENABLED) {
    it.skip('generated project quality gate (set RUN_GENERATION_GATE=1 to run)', () => {});
  }
  if (ENABLED && !hasPnpm) {
    it.skip('generated project quality gate (pnpm not on PATH)', () => {});
  }
});
