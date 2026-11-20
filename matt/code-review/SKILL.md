---
name: code-review
description: "Review changes since a fixed point across correctness, documented standards and the originating spec. Use when reviewing a branch, PR or work in progress."
---

# Code review

Review the diff between `HEAD` and the fixed point the user supplies across
three separate axes:

- **Correctness**: use pstack's `interrogate` flow. Keep a finding only when
  its repro fails against the real code and breaks the stated intent.
- **Standards**: check documented repository rules and the comment rule below.
  Report only rules the repository has written down, plus the comment rule.
- **Spec**: check whether the diff implements the originating issue or spec.

Run the three axes in parallel. Report them separately and do not rank one
axis above another.

The issue tracker should be configured. If it is not, tell the user to run
`/setup-skills`.

## Process

### 1. Pin the fixed point

Use the fixed point the user supplied. If they did not supply one, ask for it.
Capture `git diff <fixed-point>...HEAD` and
`git log <fixed-point>..HEAD --oneline`. Confirm the ref resolves and the diff
is non-empty before starting review.

### 2. Find the spec and standards

Find the originating spec in this order:

1. Issue references in commit messages, fetched through the configured tracker.
2. A path the user supplied.
3. A matching file under `docs/`, `specs/` or `.scratch/`.
4. If none exists, report that the Spec axis has no spec and continue.

Search for every file that documents how code should be written. Include
`CODING_STANDARDS.md` and `CONTRIBUTING.md` when they exist.

### 3. Run the axes

Run the three axes the same way for every diff, however small: Standards and
Spec in subagents, Correctness in this session. Correctness stays here because
`interrogate` starts its own reviewer subagents and a `general` subagent cannot
start more.

1. Start the **Standards** and **Spec** subagents in the background.
2. Run **Correctness** here. Call the `skill` tool with the id `interrogate`.
   pstack's skills are hidden from the skill list but installed, so load it by
   that id even though you can't see it. It points you to the OpenCode adapter;
   read that first. Follow `interrogate` on the fixed-point diff, with the
   commit messages and the spec as the intent. Its reviewers rerun every repro,
   keep only verified findings and fix nothing. If the `skill` call fails, say
   so in the Correctness report and stop the review. Don't write repros
   yourself in its place.
3. Report the command, output, broken intent and reviewers for every
   Correctness finding, and the dropped findings with their reasons.

The **Standards** subagent gets the fixed-point diff, commit list and the list
of standards files. Ask it to report every documented-rule violation by file or
hunk, citing the source file and rule. Skip anything tooling enforces. Also
give it the comment rule below. Keep the report under 400 words.

The **Spec** subagent gets the fixed-point diff, commit list and the spec, if
one exists. Ask it to report missing or partial requirements and scope creep.
Leave bugs to Correctness. Quote the relevant spec line for each finding.
Keep the report under 400 words.

### 4. Aggregate

Present the reports under these headings:

```text
## Correctness
## Standards
## Spec
```

Keep the reports separate. End with the finding count and worst issue within
each axis, if any. Do not choose one overall winner.

## Comment rule

A comment in the diff may stay only if it is one of the exceptions in
`~/.agents/pstack/agents/comment-sicko.md`. Report every other comment with
its category and action:

- **Tautology**: repeats what the code already shows. Delete it.
- **Stale**: describes code or behaviour that no longer exists. Delete it.
- **Excuse**: justifies a shortcut or hacky implementation. Delete it and file
  an issue to fix the shortcut.
- **Decision record**: documents a non-obvious decision about our own code.
  Move it into an ADR.

The review reports these actions and does not carry them out.
