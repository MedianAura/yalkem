# Yalkem

[![Version](https://img.shields.io/npm/v/@medianaura/yalkem.svg)](https://npmjs.org/package/@medianaura/yalkem)
[![Downloads/week](https://img.shields.io/npm/dw/@medianaura/yalkem.svg)](https://npmjs.org/package/@medianaura/yalkem)
[![Node version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)

A CLI companion for [yalc](https://github.com/wclr/yalc) that keeps a single source of truth for every local package your team shares across projects. Yalkem wraps the raw `yalc` workflow with a catalog of approved packages, project-level opt-in configuration, and maintenance commands your teammates can script and review.

## Table of Contents

- [Why Yalkem?](#why-yalkem)
- [Features and Gaps](#features-and-gaps)
- [Installation](#installation)
- [Where Yalkem Stores State](#where-yalkem-stores-state)
- [Quick Start](#quick-start)
- [Configuration Schema](#configuration-schema)
- [CLI Reference](#cli-reference)
- [Practical Workflows](#practical-workflows)
- [Troubleshooting and Diagnostics](#troubleshooting-and-diagnostics)
- [Security and Data Ownership](#security-and-data-ownership)
- [Release and Support](#release-and-support)
- [License](#license)

## Why Yalkem?

Yalkem exists for teams that rely on `yalc` to circulate unpublished packages. As soon as multiple projects and developers are syncing packages manually, the workflow breaks down:

- Package names get copied around Slack with no audit trail.
- Each repository maintains its own script snippets for `yalc add` / `yalc remove`.
- New teammates have no clue which packages to install, and local package state is difficult to reset.
- Cleaning up after a release build is error-prone because you must remember every `yalc` command executed.

Yalkem supports a predictable workflow instead:

| Task                                | Raw `yalc`                                                              | `yalkem`                                                                  |
| ----------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Share which packages exist          | You manually tell teammates                                             | `yalkem global list` is the canonical catalog stored in config            |
| Define per-project usage            | Document in README, hope for the best                                   | `.yalkemrc` records each package as on/off and can be committed           |
| Onboard another repo                | Re-run a series of `yalc add` commands                                  | `yalkem restore` replays the configuration                                |
| Clean to produce a production build | Run multiple `yalc remove` commands and reinstall dependencies manually | `yalkem purge` removes everything and optionally reinstalls npm/yarn deps |

### Currently out of scope

Transparency is critical when you evaluate a tool. Yalkem **does not** currently:

- Support non-interactive selection flows (`yalkem local` and `yalkem global remove` always prompt via `@inquirer/prompts`).
- Handle `pnpm`, `bun`, or `npm workspaces` when reinstalling after `yalkem purge` (only npm and yarn are detected).
- Remove deselected packages from `node_modules`; it toggles booleans in `.yalkemrc` but expects you to run `yalc remove` or `yalkem purge` yourself.
- Publish packages, run build steps, or manage versions inside `.yalc`; those remain `yalc` responsibilities.

## Features and Gaps

**What you get**

- A global package catalog stored via [`conf`](https://github.com/sindresorhus/conf), so every developer pulls from the same list.
- Per-project `.yalkemrc` files you can commit, allowing branch-specific local package sets.
- idempotent maintenance commands (`yalkem purge`, `yalkem restore`) that encode the repetitive `yalc` invocations.
- Guard rails around missing packages (the CLI refuses to add a package that has not been `yalc publish`ed in the system directory).

**What to watch out for**

- No JSON schema validation for `.yalkemrc` beyond "string -> boolean" at runtime; typos go unnoticed until `yalkem local` runs.
- Error handling is coarse-grained (exit code `1` with a short message). There is no verbosity/debug flag yet.
- Command output is optimized for humans, not machines. If you need JSON for automation, you currently must parse text or extend the CLI.

## Installation

### Prerequisites

- Node.js **>= 18.0.0** (ESM runtime plus optional chaining is used throughout the CLI).
- `yalc` installed globally and initialized (Yalkem shells out to the `yalc` executable using `execa`).

### Install `yalc`

```bash
npm install -g yalc
```

### Install Yalkem

```bash
npm install -g @medianaura/yalkem
```

### Verify your setup

```bash
yalkem --version
yalc --version
```

If either command is missing, fix that first because every Yalkem command ultimately shells out to `yalc`.

### Storage locations

| Purpose                                                 | Windows (example)                            | macOS                                                | Linux                                 |
| ------------------------------------------------------- | -------------------------------------------- | ---------------------------------------------------- | ------------------------------------- |
| Global Yalkem config (`conf`)                           | `%APPDATA%\yalkem-nodejs\Config\config.json` | `~/Library/Preferences/yalkem-nodejs/config.json`    | `~/.config/yalkem-nodejs/config.json` |
| `yalc` package directory checked by `yalkem global add` | `%APPDATA%\Yalc\packages\<name>`             | `~/Library/Application Support/Yalc/packages/<name>` | `~/.yalc/packages/<name>`             |

The config path matters if you need to audit or reset the package catalog manually.

## Where Yalkem Stores State

Yalkem has two layers of state:

1. **Global catalog** - JSON managed by the `conf` package. It only stores an array called `packages` containing the package names you've approved. This file is local to each developer machine, so commit it only if you purposely copy it elsewhere.
2. **Project preferences** - `.yalkemrc` in each repository root. It records `{ "<packageName>": true | false }`, which controls which catalog entries the automation should touch when you run `yalkem local`, `yalkem purge`, or `yalkem restore`. Commit it so teammates inherit the same toggles.

Resolution rules:

- `yalkem local` reads the global catalog first. Packages that are not in the global list never appear in the checklist.
- `.yalkemrc` entries merge on disk. Manual edits persist, but the last run of `yalkem local` rewrites the file with two-space indentation and sorted keys.
- Because deselected packages stay installed until you clean them, pair `yalkem local` with `yalkem purge` (or `yalc remove`) so that only packages still set to `true` get re-added during restore.

## Quick Start

1. **Publish the source package with `yalc`.**

   ```bash
   cd packages/shared-utils
   yalc publish
   ```

2. **Add it to the team catalog.**

   ```bash
   yalkem global add @my-org/shared-utils
   ```

3. **Select it inside a project.**

   ```bash
   cd ../apps/my-dashboard
   yalkem local
   # Select @my-org/shared-utils when prompted
   ```

   Toggle off any packages you are not actively developing; they stay in `.yalkemrc` as `false` so future purge/restore cycles skip them.

4. **Restore the exact local setup elsewhere.**

   ```bash
   git clone https://github.com/my-org/my-dashboard.git
   cd my-dashboard
   npm install
   yalkem restore
   ```

5. **Clean before a production build.**

   ```bash
   yalkem purge
   npm run build
   yalkem restore
   ```

## Configuration Schema

`.yalkemrc` is a plain JSON object in the project root:

```json
{
  "@my-org/shared-utils": true,
  "@my-org/ui-kit": false
}
```

- `true` -> the package belongs to this project's local workflow; `yalkem local` keeps it checked, and `yalkem purge` / `yalkem restore` will remove/relink it automatically.
- `false` -> keep the package listed for visibility but skip it during purge/restore. Use this when you only want specific packages active to avoid breaking the app with mismatched versions.

Guidelines:

- Keep `.yalkemrc` under source control so PRs document local package changes.
- Do not store secrets or private filesystem paths here; only package names are supported.
- If you hand-edit the file, use strict JSON; comments or trailing commas will cause `JSON.parse` to throw, and `yalkem` will revert to `{}` silently.

## CLI Reference

All commands exit with `0` on success and `1` on failure. Output is always human-readable text routed through the internal logger.

| Command                    | Interactive?       | Description                                                                                                   |
| -------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------- |
| `yalkem global list`       | No                 | Print the catalog stored in the global config (`packages` array).                                             |
| `yalkem global add <name>` | No                 | Validate the package exists in the system `yalc` directory and append it to the catalog.                      |
| `yalkem global remove`     | Yes                | Checkbox prompt to remove one or more packages from the catalog.                                              |
| `yalkem local`             | Yes                | Checkbox prompt for the current project; runs `yalc add` for every selected package and rewrites `.yalkemrc`. |
| `yalkem purge`             | Yes (confirmation) | Removes all `yalc` links, cleans installations, and optionally reinstalls npm/yarn deps.                      |
| `yalkem restore`           | No                 | Reads `.yalkemrc` and runs `yalc add` for every entry marked `true`.                                          |

### `yalkem global list`

- **Flags:** none.
- **Behavior:** prints every package in the catalog or warns when empty.
- **Usage:** `yalkem global` (default) or `yalkem global list`.

### `yalkem global add <name>`

- **Flags:** none.
- **Validation:** fails if `<name>` already exists in the catalog or is missing from the system `yalc` packages directory.
- **Tip:** run `yalc publish` before this command so the directory check passes.

### `yalkem global remove`

- **Interaction:** uses a checkbox prompt. There is no `--yes` flag, so it cannot run headless.
- **Behavior:** deletes the selected entries from the catalog. If you select nothing, the command throws `No package selected`.

### `yalkem local`

- **Interaction:** checkbox prompt per package.
- **Side effects:** rewrites `.yalkemrc` and runs `yalc add` for each selected package. It does **not** call `yalc remove` for packages you unchecked; instead, the unchecked packages are stored as `false` so the next `yalkem purge`/`yalkem restore` cycle ignores them.
- **Automation:** run it only in terminals with TTY support; CI usage is unsupported.

### `yalkem purge`

- **Steps executed:**
  1. `yalc remove --all`
  2. `yalc installations clean`
  3. Confirmation prompt ("Do you want to install dependencies?")
  4. Runs `npm install` or `yarn` depending on what [`detect-package-manager`](https://github.com/egoist/detect-package-manager) finds. If it sees anything else (pnpm, bun, etc.), the command throws "Failed to detect package manager."
- **Use case:** preparing a release build or ensuring you are back to registry packages. When you follow this with `yalkem restore`, only packages still set to `true` in `.yalkemrc` are re-added.

### `yalkem restore`

- **Behavior:** reads `.yalkemrc`, filters the entries with `true`, and sequentially runs `yalc add <package>`.
- **Preconditions:** `.yalkemrc` must exist and contain at least one `true` entry. Otherwise the command throws "No active package found."
- **Tip:** run it after `git clone`, after `yalkem purge`, or whenever you reset your repo.

## Practical Workflows

### Team-managed catalog shared across repositories

1. Publish every local package with `yalc publish`.
2. Run `yalkem global add <name>` once per package.
3. Commit `.yalkemrc` per repository. Each change goes through code review, which documents why a project depends on a given local package.
4. Add "Run `yalkem restore`" to your onboarding docs.

### pnpm, bun, or custom package managers

Yalkem does not (yet) reinstall dependencies for pnpm/bun during `yalkem purge`. Work around it by:

```bash
yalkem purge
# Wait for the purge to finish, skip the reinstall prompt
pnpm install --lockfile-only=false   # or your custom install command
yalkem restore
```

If you rely on pnpm workspaces, ensure every workspace root runs `yalkem local` from the workspace directory so `.yalkemrc` lives beside the root `package.json`.

### CI restore after checkout

`yalkem local` and `yalkem global remove` require a TTY, but `yalkem restore` is safe in CI. Example GitHub Actions snippet:

```yaml
- uses: actions/checkout@v4
- uses: actions/setup-node@v4
  with:
    node-version: 20
- run: npm install -g yalc @medianaura/yalkem
- run: npm ci
- run: yalkem restore
```

Ensure `.yalkemrc` exists in the repo; otherwise `yalkem restore` fails fast and surfaces in CI.

### Cleaning for releases

1. Run `yalkem purge` and confirm the dependency reinstall (npm/yarn only).
2. Build or test from a "pure registry" install.
3. `yalkem restore` to get back to your local packages for ongoing development.

### Handling packages that should not be committed

Some experiments or private builds should stay off the shared `.yalkemrc`. Options:

- Keep them out of the global catalog entirely (skip `yalkem global add`).
- Use a separate branch-specific `.yalkemrc` and avoid committing it; `yalkem local` will still honor your local edits.
- Document any manual overrides in your repo README so others do not assume the package is intentionally missing.

## Troubleshooting and Diagnostics

1. **Directory not found when adding packages**
   - Message: `Directory <.../Yalc/packages/<name>> not found.`
   - Fix: run `yalc publish` within the package directory so the `.yalc` system folder contains the package.

2. **`Failed to add package <name>` during `yalkem local`**
   - `yalkem local` shells out to `yalc add`. Ensure `yalc` is on your PATH and the package exists in the `.yalc` directory.
   - Check `.yalkemrc` for typos; `@org/pkg` vs `@org/pkg-ui` will silently be different entries.

3. **`Failed to detect package manager` after `yalkem purge`**
   - Only npm and yarn are supported. Use the workaround described in [pnpm, bun, or custom package managers](#pnpm-bun-or-custom-package-managers), or run your install command manually.

4. **Permissions issues on Windows**
   - The global config and `.yalc` directories live under `%APPDATA%`. Run the shell with the correct user or grant write permissions to `C:\Users\<you>\AppData\Roaming`.

5. **Broken `.yalkemrc`**
   - If JSON parsing fails, Yalkem treats the project as having zero packages.
   - Delete `.yalkemrc` (or fix the syntax) and rerun `yalkem local` to regenerate it.

6. **Resetting the catalog**
   - Delete the global config file shown in [Storage locations](#storage-locations) or run `yalkem global remove` repeatedly.
   - Afterwards, re-add the packages via `yalkem global add`.

Useful manual checks:

- `yalkem global list` - confirms the CLI sees your packages.
- `cat .yalkemrc` - verifies per-project selections.
- `yalc dir` - prints where `yalc` stores the published packages.
- `yalc installations` - shows which projects currently link a package.

## Security and Data Ownership

- Only package names are stored, so no source code or credentials leave your repositories.
- Global config lives on each developer's machine; if the catalog contains sensitive package names, treat the config directory accordingly.
- `.yalkemrc` should be reviewed like any other dependency manifest. Require PR review when toggling packages to avoid accidental local overrides.
- There is no telemetry or remote sync. Removing Yalkem from your machine is as simple as deleting the global config file and uninstalling the CLI.

## Release and Support

- Upgrade via `npm install -g @medianaura/yalkem@latest`.
- Follow [the repository](https://github.com/MedianAura/yalkem) for changelog entries (semver is respected; breaking changes bump the major version).
- Issues and feature requests belong in the GitHub issue tracker; include your OS, Node version, and exact command output.
- If you distribute this CLI inside a larger toolchain, pin the version globally and document the commands you rely on (`global add`, `local`, etc.) so teammates can reproduce them.

## License

MIT License - [MedianAura](https://github.com/MedianAura)
