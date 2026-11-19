---
name: ask-matt
description: Ask which skill or flow fits your situation. A router over Matt's and pstack's skills.
disable-model-invocation: true
---

# Ask Matt

You don't remember every skill, so ask.

Before recommending a skill or skipping a step, read that skill's `SKILL.md`. This file is a route map, not a substitute for the skills it names.

## The main flow: idea to shipped proof

Most work follows this path.

1. **Shape the idea.** In a working directory, start with `/grill-with-docs`. It interviews you and records settled language in `GLOSSARY.md` and ADRs. Outside a repository, use `/grill-me`.

   Done means every open design question has an answer, the glossary terms are clear, and hard-to-reverse decisions are recorded.

2. **Prototype questions that conversation cannot settle.** Use `/handoff`, then `/prototype`, then `/handoff` again to bring the result back. Keep the prototype on its own branch and point the implementation issue at it.

   Done means the prototype answers the question and the implementation issue points to its result.

3. **Turn the idea into work.** For a multi-session effort, use `/to-spec`, then `/to-tickets`. Each ticket states its blocking edges.

   Use `/poteto-mode build #123. done means <check>.` for one ticket. Use `/implement-spec` when you want the whole ticket graph built on one integration branch. For a small change, use `/poteto-mode <goal>. done means <check>.`

   Pstack owns implementation, bug fixing and verification. Start those jobs with `/poteto-mode` so its playbook chooses the proof loop.

   Done means the stated check passes and the reply shows the evidence.

4. **Review the result.** Run `/code-review <base>`. It reviews three axes in parallel:

   - Correctness through pstack's `/interrogate`, keeping only findings a rerun proves
   - Standards against documented repository rules
   - Spec against the originating issue or specification

   Fix or explain every correctness finding, break no documented standard, and satisfy every spec requirement.

5. **Ship it.** Use `/poteto-mode open the pr.` Pstack owns commits, PR structure, readiness and verification. The PR body includes the smallest useful visual, before-and-after evidence, scope, blast radius and whether the change is a one-way or two-way door.

   Done means the PR is open and ready, and its checks are green at the current head.

6. **Learn from the run.** Use `/retro` after a build, especially when something went sideways. Use `/correct <repeated mistake>` when the same mistake should become a check, type rule or lint.

## On-ramps

- **Raw incoming issues** → `/triage`. Triage issues you did not create. Tickets from `/to-tickets` are already ready for an agent.
- **A bug or regression** → `/poteto-mode <symptom>. repro first, then fix and verify.`
- **A large effort whose path is unclear** → `/wayfinder`. When the map clears, return through `/to-spec`, `/to-tickets` and pstack.
- **A codebase health pass** → `/improve-codebase-architecture`, then take a chosen opportunity through `/grill-with-docs`.

## Context hygiene and phase boundaries

Keep grilling, specification and ticket creation in one context while their reasoning matters.

At a phase boundary, choose in this order:

1. Continue when the next phase needs the current reasoning.
2. Use `/new` when the current context is irrelevant.
3. Use `/handoff` when work moves to another harness, directory, person or side task.
4. Use a subagent when the task is independent and can run without steering.
5. Use `/compact` when the context still matters but needs room.

When the user says they are going to bed or asks for a clean stop, use pstack's pause flow. Do not start more work. Leave a `wip:` commit, a resume note and the first next action. When the user explicitly says to keep working while they are away, use pstack's autonomous-run flow instead. When returning, use `/ketchup` in the same session or pstack's session-pickup flow in a new one.

Read `PHASE-BOUNDARIES.md` for the full decision tree.

## Vocabulary underneath

- `/domain-modeling` sharpens domain language and records ADRs.
- `/codebase-design` gives names to module shape, seams and interfaces.
- `/writing-for-agents` governs skills, AGENTS.md files and other agent-facing documents.
- `/wait-what` repairs a message that did not land and uses the project's glossary.
- `/teach` teaches a topic over several sessions.
- `/pstack-teach` explains one completed change.
- `/poteto-help` answers questions about pstack tools not named in this route map.

## Standalone skills

Use `/grill-me` outside a repository. Use `/prototype`, `/research`, `/to-questionnaire` or `/wizard` when their specific situation applies. Use `/teach` for a multi-session lesson.

## Setup

Run `/setup-skills` before the first engineering flow in a project. It configures the issue tracker, triage labels and domain-document rules. Pstack is installed globally on pewter, and model choices are managed by conf.nix.
