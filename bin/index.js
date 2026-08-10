#!/usr/bin/env node
// create-frontstack — zero-runtime-dependency scaffolder (Node built-ins only).
// Copies template/ into a new project, restores npm-mangled dotfiles, substitutes
// {{PROJECT_NAME}}, and wires agent skills via symlinks (with a Windows fallback).

import { promises as fs } from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { fileURLToPath } from 'node:url';

const PLACEHOLDER = '{{PROJECT_NAME}}';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = path.resolve(__dirname, '..', 'template');

// Files npm distorts on publish are stored with an underscore prefix and renamed
// back to real dotfiles at copy time.
export const DOTFILE_MAP = {
  _gitignore: '.gitignore',
  _npmrc: '.npmrc',
  _nvmrc: '.nvmrc',
};

// Skill client -> the relative directory whose `skills` entry links to ../skills.
export const CLIENT_DIRS = {
  claude: '.claude',
  agents: '.agents',
};
const VALID_CLIENTS = Object.keys(CLIENT_DIRS);
const VALID_CLIENTS_SET = new Set(VALID_CLIENTS);

// --- pure helpers (exported for unit tests) ---------------------------------

export function parseArgs(argv) {
  const args = { projectName: null, skills: null, noSkills: false, help: false };
  for (const raw of argv) {
    if (raw === '-h' || raw === '--help') {
      args.help = true;
    } else if (raw === '--no-skills') {
      args.noSkills = true;
    } else if (raw.startsWith('--skills=')) {
      args.skills = raw.slice('--skills='.length);
    } else if (raw.startsWith('--')) {
      throw new Error(`Unknown flag: ${raw}`);
    } else if (args.projectName === null) {
      args.projectName = raw;
    }
  }
  return args;
}

export function normalizeProjectName(name) {
  if (typeof name !== 'string' || name.trim() === '') {
    throw new Error('Project name is required.');
  }
  const trimmed = name.trim();
  if (trimmed === '.' || trimmed === '..') {
    throw new Error('Invalid project name "." or "..".');
  }
  if (/[\\/]/.test(trimmed) || trimmed.includes('\x00')) {
    throw new Error(`Invalid project name "${trimmed}" — it must not contain path separators.`);
  }
  return trimmed;
}

export function resolveSkills(parsed) {
  if (parsed.noSkills) return { enabled: false, clients: [] };
  if (parsed.skills !== null) {
    const clients = parsed.skills
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);
    const invalid = clients.filter((c) => !VALID_CLIENTS_SET.has(c));
    if (invalid.length) {
      throw new Error(
        `Unknown skill client(s): ${invalid.join(', ')}. Valid: ${VALID_CLIENTS.join(', ')}.`,
      );
    }
    return { enabled: true, clients: clients.length ? clients : ['claude'] };
  }
  // No flag given: default to the Claude client.
  return { enabled: true, clients: ['claude'] };
}

export function substituteName(buffer, projectName) {
  if (!buffer.includes(PLACEHOLDER)) return buffer;
  return Buffer.from(buffer.toString('utf8').split(PLACEHOLDER).join(projectName), 'utf8');
}

export async function copyDir(src, dest, projectName, skipNames = new Set()) {
  await fs.mkdir(dest, { recursive: true });
  for (const entry of await fs.readdir(src, { withFileTypes: true })) {
    if (skipNames.has(entry.name)) continue;
    const srcPath = path.join(src, entry.name);
    const destName = DOTFILE_MAP[entry.name] ?? entry.name;
    const destPath = path.join(dest, destName);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath, projectName, skipNames);
    } else if (entry.isSymbolicLink()) {
      // Symlinks aren't part of the template, but resolve gracefully if one appears.
      const real = await fs.realpath(srcPath);
      const stat = await fs.stat(real);
      if (stat.isDirectory()) {
        await copyDir(real, destPath, projectName, skipNames);
      } else {
        await fs.writeFile(destPath, substituteName(await fs.readFile(real), projectName));
      }
    } else {
      await fs.writeFile(destPath, substituteName(await fs.readFile(srcPath), projectName));
    }
  }
}

export async function assertEmptyTarget(target) {
  try {
    const entries = await fs.readdir(target);
    if (entries.length > 0) {
      throw new Error(`Target directory "${target}" is not empty. Refusing to overwrite.`);
    }
  } catch (err) {
    if (err.code === 'ENOENT') return; // doesn't exist yet — fine
    throw err;
  }
}

export async function linkSkills(targetDir, client) {
  const clientDir = CLIENT_DIRS[client];
  if (!clientDir) throw new Error(`Unknown client: ${client}`);

  const skillsAbs = path.join(targetDir, 'skills');
  const linkParent = path.join(targetDir, clientDir);
  const linkPath = path.join(linkParent, 'skills');
  await fs.mkdir(linkParent, { recursive: true });

  const rel = path.relative(linkParent, skillsAbs); // ../skills
  try {
    await fs.symlink(rel, linkPath, 'dir');
    return { client, method: 'symlink' };
  } catch {
    // Windows / insufficient privileges: try a directory junction (absolute target).
    try {
      await fs.symlink(skillsAbs, linkPath, 'junction');
      return { client, method: 'junction' };
    } catch {
      // Last resort: a plain copy of the skills folder.
      await copyDir(skillsAbs, linkPath, null);
      return { client, method: 'copy' };
    }
  }
}

// AGENTS.md mirrors CLAUDE.md via a relative symlink, so every agent client
// (Claude Code, Cursor, …) reads the same instructions. Materialized after the
// copy — never stored as a symlink in the template, since npm publish and
// cross-platform git mangle or drop them (same reason as skills above).
export async function linkAgents(targetDir) {
  const linkPath = path.join(targetDir, 'AGENTS.md');
  try {
    await fs.symlink('CLAUDE.md', linkPath, 'file');
    return { method: 'symlink' };
  } catch {
    // Windows / insufficient privileges: junctions are directory-only, so fall
    // back to a plain copy of the file.
    await fs.copyFile(path.join(targetDir, 'CLAUDE.md'), linkPath);
    return { method: 'copy' };
  }
}

// --- next-steps text --------------------------------------------------------

const INSTALL_COMMAND = { pnpm: 'pnpm install', npm: 'npm install', yarn: 'yarn', bun: 'bun install' };
const RUN_COMMAND = {
  pnpm: (s) => `pnpm ${s}`,
  npm: (s) => `npm run ${s}`,
  yarn: (s) => `yarn ${s}`,
  bun: (s) => `bun run ${s}`,
};

export function nextSteps(projectName, pm) {
  const install = INSTALL_COMMAND[pm] ?? INSTALL_COMMAND.pnpm;
  const run = RUN_COMMAND[pm] ?? RUN_COMMAND.pnpm;
  return [
    `cd ${projectName}`,
    install,
    'npx playwright install   # E2E + playwright/chrome-devtools MCP (optional)',
    `${run('dev')}`,
    '',
    `${run('check')}          # typecheck + lint + test`,
    `${run('build')}          # production build`,
  ];
}

// --- interactive prompts ----------------------------------------------------

async function prompt(rl, question, defaultValue) {
  const suffix = defaultValue ? ` (${defaultValue})` : '';
  const answer = (await rl.question(`${question}${suffix}: `)).trim();
  return answer || (defaultValue ?? '');
}

async function promptConfirm(rl, question, defaultYes) {
  const hint = defaultYes ? 'Y/n' : 'y/N';
  const answer = (await rl.question(`${question} [${hint}]: `)).trim().toLowerCase();
  if (answer === '') return defaultYes;
  return answer === 'y' || answer === 'yes';
}

async function gatherInteractive(parsed) {
  const rl = readline.createInterface({ input, output });
  try {
    const projectName = parsed.projectName
      ? normalizeProjectName(parsed.projectName)
      : normalizeProjectName(await prompt(rl, 'Project name?'));

    const pm = await prompt(rl, 'Package manager', 'pnpm');

    let skills;
    if (parsed.noSkills) {
      skills = { enabled: false, clients: [] };
    } else if (parsed.skills !== null) {
      skills = resolveSkills(parsed);
    } else {
      const want = await promptConfirm(rl, 'Set up agent skills?', true);
      if (!want) {
        skills = { enabled: false, clients: [] };
      } else {
        const raw = await prompt(rl, 'Skill clients (claude,agents)', 'claude');
        skills = resolveSkills({ skills: raw, noSkills: false });
      }
    }
    return { projectName, pm: pm || 'pnpm', skills };
  } finally {
    rl.close();
  }
}

function gatherNonInteractive(parsed) {
  if (!parsed.projectName) {
    throw new Error(
      'Project name is required in non-interactive mode. Usage: create-frontstack <project-name>',
    );
  }
  return {
    projectName: normalizeProjectName(parsed.projectName),
    pm: 'pnpm',
    skills: resolveSkills(parsed),
  };
}

function printHelp() {
  output.write(
    [
      'Usage: create-frontstack <project-name> [options]',
      '',
      'Scaffolds a modern React + TypeScript + Vite frontend project.',
      '',
      'Options:',
      '  --skills=claude,agents   Skill clients to wire (default: claude)',
      '  --no-skills              Skip the agent skills step entirely',
      '  -h, --help               Show this help',
      '',
    ].join('\n'),
  );
}

// --- entry point ------------------------------------------------------------

async function generate(parsed) {
  const { projectName, pm, skills } = process.stdin.isTTY
    ? await gatherInteractive(parsed)
    : gatherNonInteractive(parsed);

  const target = path.resolve(process.cwd(), projectName);
  await assertEmptyTarget(target);
  await fs.mkdir(target, { recursive: true });

  // Copy everything except skills/ — skills are only copied when enabled.
  await copyDir(TEMPLATE_DIR, target, projectName, new Set(['skills']));

  const warnings = [];

  // AGENTS.md mirrors CLAUDE.md for cross-tool agent discovery (always present).
  const agentsResult = await linkAgents(target);
  if (agentsResult.method === 'copy') {
    warnings.push('Could not create the AGENTS.md symlink; copied the file instead.');
  }

  if (skills.enabled) {
    await copyDir(path.join(TEMPLATE_DIR, 'skills'), path.join(target, 'skills'), projectName);
    for (const client of skills.clients) {
      const result = await linkSkills(target, client);
      if (result.method === 'copy') {
        warnings.push(
          `Could not create a skills symlink for "${client}"; copied the skills folder instead.`,
        );
      } else if (result.method === 'junction') {
        warnings.push(`Created a directory junction for "${client}" (symlinks unavailable).`);
      }
    }
  }

  output.write(`\n✓ Created ${projectName} in ${target}\n`);
  output.write(
    skills.enabled
      ? `✓ Agent skills linked: ${skills.clients.join(', ')}\n`
      : '✓ Agent skills: skipped\n',
  );
  for (const w of warnings) output.write(`! ${w}\n`);

  output.write('\nNext steps:\n');
  for (const step of nextSteps(projectName, pm)) output.write(`  ${step}\n`);
  output.write('\n');
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2));
  if (parsed.help) {
    printHelp();
    return;
  }
  await generate(parsed);
}

// Run only when executed directly, not when imported by tests.
const isMainModule =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMainModule) {
  main().catch((err) => {
    process.stderr.write(`\n✗ ${err.message}\n\n`);
    process.exit(1);
  });
}
