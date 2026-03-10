# Electrobun Development Skill

## Description
This workspace-scoped skill captures the core development workflow and guidelines
for working on the Electrobun monorepo. It reminds you where to run build
commands, which folders contain specific subsystems, and highlights the
important conventions around Zig, C++, and CEF code so you never accidentally
run a build from the wrong directory or edit the wrong component.

Use this skill whenever you start coding, debugging, or exploring the
Electrobun codebase so you don’t have to repeat the same instructions by hand.

## When to run this workflow

- You want to **build or run** the Electrobun app in development or canary mode.
- You need to **locate source code** for the CLI, native wrappers, Zig extractor,
  or kitchen test app.
- You are **editing native (C++, Zig, CEF)** code and need to know build
dependencies or folder layout.
- You need a quick reminder of the proper **project structure**.

## Step‑by‑step workflow

1. **Switch to the `package` folder** at the repository root:
   ```bash
   cd /Users/lazuee/Documents/Projects/electrobun/package
   ```
2. **Run a build command**:
   * `bun dev` – builds and runs the kitchen app in regular dev mode.
   * `bun dev:canary` – same, but uses the canary build.

   > ⚠️ Never run Electrobun directly from `bin` or `node_modules` – the
   > wrappers and compile steps are performed by the package build script.

3. **Understand what the build does for you**:
   * Compiles the native wrappers (`/package/src/native`).
   * Builds the Zig self‑extractor (`/package/src/extractor`).
   * Compiles TypeScript sources and the CLI (`/package/src/cli`).
   * Switches automatically into the `/kitchen` subproject and launches the
     test harness.

4. **Navigate the project structure** when you need to modify code:
   * `/package` – main library and tooling.
   * `/kitchen` – playground/test application used during development.
   * `/package/src/cli` – command‑line interface implementation.
   * `/package/src/extractor` – Zig code for the self‑extractor.
   * `/package/src/native` – platform‑specific native wrappers (C++, CEF,
     Zig‑generated bindings).
   * `vendors/cef` – third‑party CEF sources and headers.

5. **Refer to language‑specific APIs**:
   * C++ code interacts with the Chromium Embedded Framework (CEF); consult
     `CEF.md` or the `vendors/cef` tree for header files and examples.
   * Zig code lives alongside C++ in the extractor and build scripts; be aware
     of the custom build tooling in `build.ts` and related scripts.

6. **Branching logic / decisions**:
   * Choose between `dev` and `dev:canary` based on whether you need a
     bleeding‑edge build.
   * When editing native code, rebuild the package to ensure wrappers are
     regenerated.
   * Use `bun dev` only from `/package`; other folders may compile but won’t
     run correctly.

7. **Quality checks**:
   * Builds must succeed without manual tweaks to `node_modules`.
   * Electrobun launches the kitchen app automatically; if it doesn’t, inspect
     the console for missing native bindings.

## Example prompts to invoke this skill

- “How do I build the Electrobun app?”
- “Where is the Zig extractor code located?”
- “What’s the correct way to compile native wrappers?”
- “I need to modify CEF integration – which folder contains the headers?”

## Related customizations

- You could add tasks or snippets for common `bun dev` commands.
- A companion cheat‑sheet skill for debugging C++/CEF issues would be
  useful.
- Consider a git hook skill that checks you’re in `/package` before running
  build commands.
