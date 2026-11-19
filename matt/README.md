# matt

Skills from [mattpocock/skills](https://github.com/mattpocock/skills) that only make sense inside a project: they read the project's `docs/agents/`, `GLOSSARY.md` or ADRs, or they would clash with other skills a project brings. Harnesses like OpenCode does not find this folder on its own. A project switches it on in its `opencode.jsonc`:

```jsonc
{
  "skills": ["~/.agents/matt"],
}
```

- **Upstream commit:** `4ae2317` (2026-10-31), package version `1.3.2`
- **Excluded upstream buckets:** `misc/`, `in-progress/`, `deprecated/`

## Upstream conventions worth knowing

- Skills carry `agents/openai.yaml` alongside `SKILL.md` for Codex UI metadata. Harmless elsewhere; leave it in place.
- Prose is em-dash free by policy (`CLAUDE.md` upstream forbids reintroducing them).
- The domain-doc convention is `GLOSSARY.md` / `GLOSSARY-MAP.md`.
