# Agent Rules

## 1. Execution Restrictions

- Never start dev servers, web servers, background processes, or daemons.
- Never launch Chrome, Chromium, headless browsers, Playwright, Puppeteer, Selenium, or browser automation.
- Never run commands, scripts, tests, or tools that may indirectly launch prohibited processes.
- Never use detached processes, `nohup`, or retry loops.
- If unsure whether a command is safe, DO NOT run it.
- Never bypass these restrictions.

## 2. No Automatic Verification

- Avoid running `tsc`, lint, tests, builds, or other verification commands unless explicitly requested.
- Do not rerun checks that have already passed unless explicitly requested.
- Do not verify work just to confirm what can be established through code inspection.
- Prefer reasoning and targeted file inspection over executing commands.
- Never run checks after every edit.
- If verification is requested, run each relevant check once, after all changes are complete.
- Never claim checks passed if they were not run.

## 3. Minimal Tool Usage

- Avoid unnecessary tool calls, searches, file reads, and repeated inspections.
- Never spawn subagents or delegate work unless explicitly requested.
- Do not install dependencies or explore alternatives unless necessary.
- Do not repeat failed commands without understanding the failure.
- Do not narrate every action or provide progress updates unless requested.

## 4. Minimal Changes

- Make the smallest complete change that solves the request.
- Do not refactor unrelated code or modify files outside the task's scope.
- Preserve existing architecture, conventions, naming, and formatting.
- Search for existing implementations before creating new ones.
- Avoid unnecessary abstractions, helpers, comments, dependencies, and defensive code.
- Do not add features or make speculative improvements.
- Do not fix unrelated issues unless explicitly requested.

## 5. Independent Decision-Making

- Make reasonable assumptions and proceed when requirements are sufficiently clear.
- Ask questions only when ambiguity materially affects the implementation or creates significant risk.
- Do not ask permission for routine, reversible decisions.
- Follow existing project conventions when details are unspecified.

## 6. Planning and Scope

- Do not produce lengthy plans for straightforward tasks.
- For complex tasks, plan briefly and execute without repeatedly revisiting the plan.
- Implement exactly what was requested, nothing more.
- Do not continue tweaking code for marginal improvements.
- Stop as soon as the requested task is complete.

## 7. Protect Existing Work

- Never overwrite, discard, or revert the user's existing changes.
- Never run destructive Git operations such as `git reset --hard`, `git clean`, or force-push without explicit authorization.
- Inspect Git status before operations that could affect existing work.
- Do not modify unrelated configuration or public APIs unnecessarily.

## 8. Design Language

- `DESIGN.md` is the source of truth for the visual language: palette, radii, type, surfaces, motion state and content rules. Read it before any UI work, and update it in the same change whenever the language changes.
- Do not introduce colors, radii, fonts, shadows or surface treatments that are not in `DESIGN.md`. If a new one is genuinely needed, add it there first.
- Red (`--color-accent`) is accentuation only, never structure. No pill shapes. No motion until an animation pass is explicitly requested.

## 9. Final Response

- Keep the final response concise.
- Summarize the changes made and mention only relevant caveats.
- Clearly disclose skipped verification when relevant.
- Never claim to have executed, tested, or verified anything that was not actually executed, tested, or verified.
