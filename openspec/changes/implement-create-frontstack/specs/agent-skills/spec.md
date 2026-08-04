## Purpose

Gives generated projects a single, canonical source of agent skills that multiple AI coding clients consume through symlinks, plus a fixed bundle of MCP servers — so an agent dropped into the project immediately knows the project's conventions and has the right tooling, without duplicated files or per-server configuration choices.

## ADDED Requirements

### Requirement: Single canonical skills source
The generated project SHALL keep all agent skills as real files under a single canonical `skills/` directory at the repository root, where each skill is one folder containing a `SKILL.md`.

#### Scenario: One source of truth for skills
- **WHEN** any supported client reads skills in the generated project
- **THEN** it resolves to the same canonical `skills/` directory via symlink, with no duplicated skill files per client

### Requirement: Client symlink matrix
The CLI SHALL wire clients to the canonical `skills/` folder using relative symlinks at the paths each client expects. By default the CLI SHALL create `.claude/skills -> ../skills` (the default client) and, when selected, `.agents/skills -> ../skills` (the cross-agent path).

#### Scenario: Default client symlink created
- **WHEN** skills are configured with the default client
- **THEN** a relative symlink `.claude/skills` points to `../skills` and resolves to the canonical folder

### Requirement: Symlinks created by the CLI, not stored in the template
Because npm publish and git handle symlinks unreliably, symlinks SHALL NOT be stored in the npm template; the CLI SHALL create them during scaffolding, after which the user commits them.

#### Scenario: No symlinks shipped in the tarball
- **WHEN** `npm pack --dry-run` inspects the published package
- **THEN** no symlink entries appear under `template/`; symlinks are created at generation time

### Requirement: Windows symlink fallback
When symlinks cannot be created (insufficient privileges or `core.symlinks=false`, e.g. Windows without developer mode), the CLI SHALL fall back to a directory junction, or otherwise to a plain copy of the `skills/` folder, and SHALL emit a warning explaining what was done.

#### Scenario: Fallback on symlink failure
- **WHEN** symlink creation fails for a selected client
- **THEN** the CLI still makes the skills available to that client via junction or copy and prints a clear warning

### Requirement: Client-independent skill format
Each skill's `SKILL.md` SHALL begin with YAML frontmatter containing at least `name` and `description`, and the format SHALL be client-independent so the same files work across clients. Skills MAY additionally include cross-agent metadata and a `scripts/` folder.

#### Scenario: Skill parses across clients
- **WHEN** a skill folder is read by any supported client
- **THEN** its `SKILL.md` exposes a valid `name` and `description` from frontmatter

### Requirement: Base skill set
The template SHALL ship the base set of skills from SPEC §7.6: `setup-project`, `add-shadcn-component`, `create-react-component`, `create-custom-hook`, `add-route`, `add-query-hook`, `add-store-slice`, `write-vitest-test`, `add-dependency`, `run-quality-gate`, and `dockerize-and-run`.

#### Scenario: All base skills present
- **WHEN** the canonical `skills/` folder is inspected
- **THEN** each of the eleven base skills is present with a `SKILL.md`

### Requirement: Fixed MCP server bundle with no selection step
The generated project SHALL ship a root `.mcp.json` (Claude Code project scope) preconfigured with exactly four servers — `shadcn`, `context7`, `playwright`, and `chrome-devtools`. The CLI SHALL copy `.mcp.json` as-is and SHALL offer no step, flag, or option to select individual MCP servers.

#### Scenario: MCP config is identical across runs
- **WHEN** any project is generated
- **THEN** `.mcp.json` contains the same four servers with the same commands and args, regardless of skills choices

#### Scenario: MCP requires only the Node version already present
- **WHEN** the MCP servers are used
- **THEN** they run under the project's Node 26 runtime (≥18) without any additional host requirement beyond local browsers for `playwright` and `chrome-devtools`
