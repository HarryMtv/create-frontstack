import { execFileSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const {
  parseArgs,
  normalizeProjectName,
  resolveSkills,
  substituteName,
  copyDir,
  assertEmptyTarget,
  linkSkills,
  linkAgents,
  nextSteps,
  DOTFILE_MAP,
} = await import('../bin/index.js');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BIN = path.resolve(__dirname, '..', 'bin', 'index.js');
const TEMPLATE = path.resolve(__dirname, '..', 'template');

let tmpRoot;

beforeEach(async () => {
  tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'cfs-'));
});

afterEach(async () => {
  await fs.rm(tmpRoot, { recursive: true, force: true });
});

// --- pure helpers -----------------------------------------------------------

describe('parseArgs', () => {
  it('parses a positional name', () => {
    expect(parseArgs(['my-app'])).toEqual({
      projectName: 'my-app',
      skills: null,
      noSkills: false,
      help: false,
    });
  });

  it('parses --skills and --no-skills and --help', () => {
    expect(parseArgs(['a', '--skills=claude,agents']).skills).toBe('claude,agents');
    expect(parseArgs(['a', '--no-skills']).noSkills).toBe(true);
    expect(parseArgs(['--help']).help).toBe(true);
  });

  it('rejects unknown flags', () => {
    expect(() => parseArgs(['a', '--bogus'])).toThrow(/Unknown flag/);
  });
});

describe('normalizeProjectName', () => {
  it('trims and returns valid names', () => {
    expect(normalizeProjectName('  my-app ')).toBe('my-app');
  });

  it('rejects empty', () => {
    expect(() => normalizeProjectName('   ')).toThrow(/required/i);
  });

  it('rejects path separators', () => {
    expect(() => normalizeProjectName('a/b')).toThrow(/path separators/i);
  });
});

describe('resolveSkills', () => {
  it('disables on --no-skills', () => {
    expect(resolveSkills({ noSkills: true, skills: null })).toEqual({ enabled: false, clients: [] });
  });

  it('parses a client list', () => {
    expect(resolveSkills({ noSkills: false, skills: 'claude,agents' })).toEqual({
      enabled: true,
      clients: ['claude', 'agents'],
    });
  });

  it('defaults to claude when nothing specified', () => {
    expect(resolveSkills({ noSkills: false, skills: null })).toEqual({
      enabled: true,
      clients: ['claude'],
    });
  });

  it('rejects unknown clients', () => {
    expect(() => resolveSkills({ noSkills: false, skills: 'cursor' })).toThrow(/Unknown skill client/);
  });
});

describe('substituteName', () => {
  it('replaces the placeholder', () => {
    expect(substituteName(Buffer.from('name: {{PROJECT_NAME}}'), 'my-app').toString()).toBe(
      'name: my-app',
    );
  });

  it('leaves buffers without the placeholder untouched', () => {
    const original = Buffer.from([0x89, 0x50, 0x4e, 0x47]); // PNG-ish bytes
    expect(substituteName(original, 'x')).toBe(original);
  });
});

describe('nextSteps', () => {
  it('mentions playwright install and the pm commands', () => {
    const steps = nextSteps('my-app', 'pnpm').join('\n');
    expect(steps).toContain('cd my-app');
    expect(steps).toContain('pnpm install');
    expect(steps).toContain('npx playwright install');
    expect(steps).toContain('pnpm dev');
  });
});

// --- filesystem helpers -----------------------------------------------------

describe('copyDir', () => {
  it('copies the real template, renames dotfiles, and substitutes the project name', async () => {
    const dest = path.join(tmpRoot, 'out');
    await copyDir(TEMPLATE, dest, 'my-app');

    // Dotfiles restored, underscore files gone.
    expect(DOTFILE_MAP._gitignore).toBe('.gitignore');
    for (const file of Object.values(DOTFILE_MAP)) {
      expect(await fs.stat(path.join(dest, file))).toBeTruthy();
    }
    expect(await fs.readdir(dest)).not.toContain('_gitignore');

    // Project name substituted in package.json.
    const pkg = JSON.parse(await fs.readFile(path.join(dest, 'package.json'), 'utf8'));
    expect(pkg.name).toBe('my-app');

    // No placeholder residue anywhere in the tree.
    await expectNoPlaceholder(dest);

    // Key template artifacts present.
    expect(await fs.stat(path.join(dest, 'src', 'main.tsx'))).toBeTruthy();
    expect(await fs.stat(path.join(dest, '.mcp.json'))).toBeTruthy();
    expect(await fs.stat(path.join(dest, 'Dockerfile'))).toBeTruthy();
  });
});

describe('assertEmptyTarget', () => {
  it('passes for a missing directory', async () => {
    await expect(assertEmptyTarget(path.join(tmpRoot, 'nope'))).resolves.toBeUndefined();
  });

  it('passes for an empty directory', async () => {
    const dir = path.join(tmpRoot, 'empty');
    await fs.mkdir(dir);
    await expect(assertEmptyTarget(dir)).resolves.toBeUndefined();
  });

  it('throws for a non-empty directory', async () => {
    const dir = path.join(tmpRoot, 'full');
    await fs.mkdir(dir);
    await fs.writeFile(path.join(dir, 'x'), 'x');
    await expect(assertEmptyTarget(dir)).rejects.toThrow(/not empty/);
  });

  it('rethrows unexpected fs errors', async () => {
    const denied = Object.assign(new Error('permission denied'), { code: 'EACCES' });
    vi.spyOn(fs, 'readdir').mockRejectedValue(denied);
    try {
      await expect(assertEmptyTarget(path.join(tmpRoot, 'denied'))).rejects.toBe(denied);
    } finally {
      vi.restoreAllMocks();
    }
  });
});

describe('linkSkills', () => {
  it('makes skills available at <client>/skills (symlink or fallback)', async () => {
    const target = path.join(tmpRoot, 'proj');
    await fs.mkdir(target, { recursive: true });
    await copyDir(path.join(TEMPLATE, 'skills'), path.join(target, 'skills'), null);

    const result = await linkSkills(target, 'claude');
    expect(['symlink', 'junction', 'copy']).toContain(result.method);

    // Either way, the canonical skill files are reachable through the client path.
    const skillFile = await fs.readFile(
      path.join(target, '.claude', 'skills', 'setup-project', 'SKILL.md'),
      'utf8',
    );
    expect(skillFile).toMatch(/name:\s*setup-project/);
  });
});

describe('linkAgents', () => {
  it('makes AGENTS.md read the same as CLAUDE.md (symlink or fallback)', async () => {
    const target = path.join(tmpRoot, 'proj');
    await fs.mkdir(target, { recursive: true });
    await fs.copyFile(path.join(TEMPLATE, 'CLAUDE.md'), path.join(target, 'CLAUDE.md'));

    const result = await linkAgents(target);
    expect(['symlink', 'copy']).toContain(result.method);

    // Either way, AGENTS.md reads as the same content as CLAUDE.md.
    const [agents, claude] = await Promise.all([
      fs.readFile(path.join(target, 'AGENTS.md'), 'utf8'),
      fs.readFile(path.join(target, 'CLAUDE.md'), 'utf8'),
    ]);
    expect(agents).toEqual(claude);
  });
});

// --- end-to-end via the CLI process -----------------------------------------

describe('CLI process', () => {
  it('scaffolds a project non-interactively with --no-skills', async () => {
    const out = execFileSync(process.execPath, [BIN, 'demo-app', '--no-skills'], {
      cwd: tmpRoot,
      encoding: 'utf8',
    });
    const target = path.join(tmpRoot, 'demo-app');

    expect(out).toContain('Created demo-app');
    expect(out).toContain('npx playwright install');

    // Dotfiles renamed.
    await expect(fs.access(path.join(target, '.gitignore'))).resolves.toBeUndefined();
    await expect(fs.access(path.join(target, '.npmrc'))).resolves.toBeUndefined();
    await expect(fs.access(path.join(target, '.nvmrc'))).resolves.toBeUndefined();

    // Their underscore originals are not left behind.
    await expect(fs.access(path.join(target, '_gitignore'))).rejects.toMatchObject({
      code: 'ENOENT',
    });

    // No skills copied and no .claude created.
    await expect(fs.stat(path.join(target, 'skills'))).rejects.toMatchObject({ code: 'ENOENT' });
    await expect(fs.stat(path.join(target, '.claude'))).rejects.toMatchObject({ code: 'ENOENT' });

    // AGENTS.md mirrors CLAUDE.md (symlink or copy) for cross-tool discovery.
    const agents = await fs.readFile(path.join(target, 'AGENTS.md'), 'utf8');
    const claude = await fs.readFile(path.join(target, 'CLAUDE.md'), 'utf8');
    expect(agents).toEqual(claude);
  });

  it('scaffolds with --skills=claude and links skills', async () => {
    execFileSync(process.execPath, [BIN, 'skilled', '--skills=claude'], {
      cwd: tmpRoot,
      encoding: 'utf8',
    });
    const target = path.join(tmpRoot, 'skilled');

    // Canonical skills folder copied.
    const skill = await fs.readFile(
      path.join(target, 'skills', 'run-quality-gate', 'SKILL.md'),
      'utf8',
    );
    expect(skill).toMatch(/name:\s*run-quality-gate/);

    // Client link resolves to the same skills (symlink/junction/copy).
    const linked = await fs.readFile(
      path.join(target, '.claude', 'skills', 'run-quality-gate', 'SKILL.md'),
      'utf8',
    );
    expect(linked).toEqual(skill);

    await expectNoPlaceholder(target);
  });
});

// --- helpers ----------------------------------------------------------------

async function expectNoPlaceholder(dir) {
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of await fs.readdir(current, { withFileTypes: true })) {
      if (entry.isSymbolicLink()) continue; // skip client links (e.g. .claude/skills)
      const p = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(p);
      } else {
        const buf = await fs.readFile(p);
        if (buf.includes('{{PROJECT_NAME}}')) {
          throw new Error(`Placeholder residue in ${p}`);
        }
      }
    }
  }
}
