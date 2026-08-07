# AI Business Concierge — repository agent rules

These instructions apply to every agent session in this repository.

## Mandatory session startup

Before planning or changing code, database, configuration, infrastructure, or documentation:

1. Read `docs/README.md` for document ownership and source-of-truth order.
2. Read `docs/STATUS.md` completely to learn the current verified state, blockers, and next actions.
3. Read the newest entry at the top of `docs/DEVLOG.md`.
4. Read `docs/PLAN.md` and identify the active P0/P1/P2 item in scope.
5. Run `git status --short` and preserve all existing user changes.
6. Do not treat an old runtime snapshot as current; re-verify any state needed for the task.

For a read-only question, steps 1–4 are required when the answer depends on project status or history. Do not modify files merely to answer a read-only question.

## Mandatory documentation closeout

Before declaring any material repository change complete:

1. Add a new dated entry at the top of `docs/DEVLOG.md` containing:
   - context and the previous state;
   - concrete completed changes and decisions;
   - verification results, exact test counts, build/deploy versions, and smoke-test results when applicable;
   - remaining work, blockers, and the first action for the next session;
   - changed file paths.
2. Update `docs/STATUS.md` when current capability, runtime evidence, blockers, phase, or next actions changed.
3. Update `docs/PLAN.md`: remove completed work and keep only active/next work.
4. Update `docs/REQUIREMENTS.md` when an `R-XXX` capability or status changed.
5. Update `docs/ROADMAP.md` only when phase or product direction changed.
6. Update `docs/ARCHITECTURE.md` only when technical boundaries or architectural rules changed.
7. Write the canonical Uzbek documentation first, then synchronize the equivalent DEVLOG/status changes in:
   - `docs/English/`
   - `docs/Russian/`
   - `docs/日本語/`
8. Never write secrets, tokens, passwords, raw connection strings, or private user data into documentation or logs.

A change is material when it modifies application behavior, API/database schema, dependencies, configuration, security, infrastructure, deployment, tests, architecture, product capability, or project documentation structure. Pure formatting, exploratory reads, and read-only reporting do not require a DEVLOG entry unless they change project meaning or handoff state.

If documentation closeout cannot be completed, do not claim the task is fully complete. State exactly which documentation remains unsynchronized.

## Source-of-truth order

When documents conflict, use this order:

1. Current code and newly verified evidence.
2. `docs/STATUS.md`.
3. The newest `docs/DEVLOG.md` entry.
4. `docs/PLAN.md`, `docs/ROADMAP.md`, and `docs/REQUIREMENTS.md`.
5. Historical/setup/archive documents.

Historical DEVLOG entries are append-only: correct later changes with a new top entry instead of rewriting old history.
