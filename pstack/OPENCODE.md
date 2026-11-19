# pstack for OpenCode

Generated from `cursor/plugins` at `1ba91fc 2026-10-28` (pstack 0.15.36) by `make-opencode-tree.mjs`. Do not edit this tree by hand. Rerun the generator.

- `skills/` are the upstream skills. `teach` and `tdd` are renamed `pstack-teach` and `pstack-tdd`, because those ids already exist in `~/.agents`. `unslop` keeps its id: it is the only unslop skill, loaded in every directory.
- `setup-pstack` is left out. It writes a Cursor model rule. Here conf.nix owns `~/.config/opencode/pstack-models.md`, and the adapter's Models section says so.
- Every skill that uses Cursor names starts with a line that points at `docs/harness/opencode.md`.
- `opencode/agents/` holds `poteto` (primary, the pinned mode), `poteto-agent` and `comment-sicko` (subagents) for `~/.config/opencode/agents/`.
- `opencode/commands/` holds one slash command per non-principle skill for `~/.config/opencode/commands/`.
