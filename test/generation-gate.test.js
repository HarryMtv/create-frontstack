import { execFileSync, spawnSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';

// This is the design D5 gate: prove the GENERATED project is green, not just the
// CLI. It runs `bun install` + `bun run check` + `bun run format:check` + `bun run build`
// on a freshly scaffolded project. It needs the pinned versions to resolve on npm and
// bun on PATH, so it is opt-in via RUN_GENERATION_GATE=1 and skipped otherwise.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BIN = path.resolve(__dirname, '..', 'bin', 'index.js');
const ENABLED = process.env.RUN_GENERATION_GATE === '1';
const hasBun = (() => {
  try {
    execFileSync('bun', ['--version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
})();

const run = (itSkip) => (ENABLED && hasBun ? itSkip : itSkip.skip);

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

  run(it)(
    'installs dependencies',
    () => {
      const res = spawnSync('bun', ['install'], { cwd: target, stdio: 'inherit' });
      expect(res.status).toBe(0);
    },
    600_000,
  );

  run(it)(
    'passes bun run check (format + lint + typecheck + test)',
    () => {
      const res = spawnSync('bun', ['run', 'check'], { cwd: target, stdio: 'inherit' });
      expect(res.status).toBe(0);
    },
    600_000,
  );

  run(it)(
    'passes bun run format:check',
    () => {
      const res = spawnSync('bun', ['run', 'format:check'], { cwd: target, stdio: 'inherit' });
      expect(res.status).toBe(0);
    },
    600_000,
  );

  run(it)(
    'passes bun run build',
    () => {
      const res = spawnSync('bun', ['run', 'build'], { cwd: target, stdio: 'inherit' });
      expect(res.status).toBe(0);
    },
    600_000,
  );

  if (!ENABLED) {
    it.skip('generated project quality gate (set RUN_GENERATION_GATE=1 to run)', () => {});
  }
  if (ENABLED && !hasBun) {
    it.skip('generated project quality gate (bun not on PATH)', () => {});
  }
});
