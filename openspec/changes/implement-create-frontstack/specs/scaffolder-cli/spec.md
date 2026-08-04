## Purpose

The `create-frontstack` CLI turns a single command into a working, modern frontend repository — copying the template, restoring npm-mangled dotfiles, substituting the project name, wiring agent skills, and guiding the user to the next steps — with zero runtime dependencies so it can be run via `npm create` / `pnpm create` / `npx` anywhere.

## ADDED Requirements

### Requirement: One-command project creation
The package SHALL be invocable as `create-frontstack <project-name>` through `npm create frontstack@latest`, `pnpm create frontstack`, and `npx create-frontstack`, and SHALL create a new directory containing a complete, self-consistent frontend project.

#### Scenario: Create into a named directory
- **WHEN** a user runs `pnpm create frontstack my-app` in an empty parent directory
- **THEN** a directory `my-app/` is created containing the full template (configs, `src/`, `e2e/`, Docker files, `.mcp.json`)
- **AND** the process exits successfully without overwriting anything outside `my-app/`

#### Scenario: Target directory already exists and is non-empty
- **WHEN** the target path exists and is not empty
- **THEN** the CLI SHALL refuse to proceed with a clear error and not modify any existing files

### Requirement: Zero runtime dependencies
The CLI (`bin/index.js`) SHALL depend only on Node.js built-in modules and SHALL declare no `dependencies` (only dev tooling for the packager itself).

#### Scenario: No install cost to run the CLI
- **WHEN** the package is executed via `npx create-frontstack`
- **THEN** it runs without downloading or resolving any runtime dependency beyond the CLI package itself

### Requirement: npm-mangled dotfile restoration
Because npm publish drops or distorts `.gitignore`/`.npmrc` at publish time, the template SHALL store these as `_gitignore`, `_npmrc`, `_nvmrc`, and the CLI SHALL rename them back to their dotfile names during copy.

#### Scenario: Underscore files become real dotfiles in the output
- **WHEN** the CLI copies the template into the target directory
- **THEN** `_gitignore`, `_npmrc`, and `_nvmrc` appear in the output as `.gitignore`, `.npmrc`, and `.nvmrc`
- **AND** no `_gitignore` / `_npmrc` / `_nvmrc` files remain in the output

### Requirement: Project name substitution
The template SHALL use a `{{PROJECT_NAME}}` placeholder in any file that must carry the project name (e.g. `package.json` `name`), and the CLI SHALL replace every occurrence with the user-chosen project name during copy.

#### Scenario: Placeholder is replaced everywhere
- **WHEN** a project named `my-app` is created
- **THEN** the output `package.json` `name` field equals `my-app`
- **AND** no `{{PROJECT_NAME}}` placeholder remains in any copied file

### Requirement: Package manager selection
The CLI SHALL prompt for a package manager with `pnpm` as the default, and SHALL use the selection in the printed next-steps guidance.

#### Scenario: Default selection is pnpm
- **WHEN** the user accepts the package-manager prompt without entering a value
- **THEN** the next-steps instructions reference `pnpm install` / `pnpm dev`

### Requirement: Agent skills configuration step
Configuring agent skills SHALL be a discrete, independently skippable wizard step, offered after template copy. In interactive mode it SHALL ask whether to wire skills and, if yes, offer a multi-select of supported clients with `.claude` preselected.

#### Scenario: User declines skills
- **WHEN** the user answers no to wiring agent skills
- **THEN** no `skills/` folder and no client symlink are created in the output

#### Scenario: User keeps the default client
- **WHEN** the user accepts the defaults on the skills step
- **THEN** the `skills/` folder is copied into the project and a relative symlink `.claude/skills -> ../skills` is created

### Requirement: Non-interactive flags
The CLI SHALL support a non-interactive mode driven by flags so it can run in CI: `--skills=claude,agents` to select specific clients and `--no-skills` to skip the skills step entirely.

#### Scenario: Fully non-interactive run
- **WHEN** the CLI is invoked with only flags and no TTY (e.g. `--skills=claude`)
- **THEN** no prompts are shown and the project is generated deterministically with the requested skill clients

### Requirement: Next-steps guidance
On success the CLI SHALL print concise next steps appropriate to the chosen package manager, including dependency install, the dev command, and `npx playwright install` for E2E/MCP prerequisites.

#### Scenario: Next steps mention Playwright browser install
- **WHEN** any project is created successfully
- **THEN** the printed next steps include `npx playwright install`

### Requirement: Publishable package metadata
The packager `package.json` SHALL declare the `create-frontstack` bin, `files: ["bin", "template"]`, MIT license, and the `create-frontstack` package name. The published tarball SHALL contain every file the template needs to reproduce a working project.

#### Scenario: Tarball is complete
- **WHEN** `npm pack --dry-run` is run against the packager
- **THEN** every template file — including the underscore dotfiles, `template/skills/**`, and `template/.mcp.json` — is listed in the tarball and none required file is dropped
