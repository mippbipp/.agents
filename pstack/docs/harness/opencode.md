# pstack in OpenCode

pstack skills use Cursor names. In OpenCode, read this file once per session, then map each Cursor name in a skill with the tables below. `<pstack>` is the folder that holds `skills/`, `agents/` and `docs/`. In this install that is `~/.agents/pstack`. If a Cursor field has no row, drop it and say so. Never pass a field or value the tool schema rejects.

This adapter was written for OpenCode v2.1.1 with the `kiro` provider plugin. It follows `docs/harness/claude-code.md`, the adapter pstack ships for Claude Code.

## Tools

| Cursor | OpenCode |
| --- | --- |
| `Task` | the `subagent` tool. It takes an agent id, a short `description`, a complete `prompt`, `background`, an optional `model` and an optional `sessionID`. |
| `AskQuestion` | the `question` tool. Subagents cannot use it, so a subagent asks its parent in its report. |
| Open a todolist | `todowrite` when the session offers it (needs `experimental.todo: true`). Otherwise keep the list in your reply and update it at each phase. |
| Run another pstack skill (`/name` or "the **name** skill") | Call the `skill` tool with that id, or `read` `<pstack>/skills/<name>/SKILL.md`. Both work: pstack skills are hidden from the catalog (`disable-model-invocation`), not disabled. When you tell the user to type it, write `/<name>`, which the generated commands provide. |
| `Grep`, `Glob` | `grep`, `glob`. |
| Cursor's built-in PR tool | `gh`. That is not a skip, so write no line. |

## Matt's skills

The project's `ask-matt` skill routes work between Matt's planning skills and pstack when the project has opted into `~/.agents/matt`. Matt's `code-review` runs the `interrogate` skill as one of its axes.

## PR bodies

The Opening a PR playbook owns titles, commits, size, stacks and readiness. Two additions to its Descriptions section:

- Open `## What changed` with the smallest visual that makes the change clear: a call tree, a file tree, a diff sketch or a Mermaid diagram. Skip it when one sentence carries the change.
- End `## Blast Radius` with `Door: one-way` or `Door: two-way`. A one-way door is hard to reverse, such as a destructive migration, a published API or deleted data.

## Subagent fields

| Cursor | OpenCode |
| --- | --- |
| `subagent_type: generalPurpose` | agent `general`. |
| `subagent_type: "poteto-agent"`, `"comment-sicko"` | agents `poteto-agent` and `comment-sicko`, installed from `<pstack>/agents/`. If they are missing, use `general` and paste the first paragraph of the agent file into the prompt. |
| `readonly: true` | agent `explore`. It still has `shell`, so the brief also says "do not edit files", and you check `git status` afterward. |
| `readonly: false` | agent `general`. It keeps the session's MCP servers. |
| `environment: "cloud"` | A git worktree. Create it with Code Mode `opencode.worktree_create({ name })`, put the returned directory in the brief, and tell the worker to work only there. Name the branch or commit it checks out. If `worktree_create` fails, run `git worktree add <repo>.worktrees/<name> <commit>` beside the repository instead, and remove it with `git worktree remove` when the worker is done. |
| `environment: "local"` | Omit. |
| `cloud_base_branch: <b>` | Tell the worker to check out `<b>` in its worktree first. |
| `run_in_background: true` | `background: true`. The tool notifies you when the child finishes. Never poll it. |
| `resume` | Pass the child's `sessionID` only when the work needs that child's state. Otherwise spawn fresh and paste the earlier result into the brief, as poteto-mode's Subagents section says. |
| `file_attachments` | List the paths in the brief. |

A subagent can start its own subagents only up to `experimental.subagent_depth`, which conf.nix sets to 2. The built-in `general` agent never starts subagents at any depth, so a nested step (Feature delegating through `arena`, `architect` inside a delegate, `interrogate` reviewers) runs in `poteto-agent`, which can. When a nested spawn fails anyway, the parent runs the nested step itself and says so.

## Models

Every model comes from the `kiro` provider. A slug is `kiro/<model>#<variant>`. Variants are `low`, `medium`, `high`, `xhigh` and `max` on the Claude 5.5 and GPT-5.6 models, plus `none` on Haiku and GPT. Run `opencode models kiro` for the live list.

| Cursor | OpenCode |
| --- | --- |
| `claude-opus-5-5-<effort>` | `kiro/claude-opus-5.5#<effort>` |
| `claude-sonnet-5-5-<effort>` | `kiro/claude-sonnet-5.5#<effort>` |
| `grok-4.7-<effort>-fast`, `composer-*`, `cursor-grok-*` | the model on the role's line in the model file. With no line, `kiro/gpt-5.6-luna#<effort>`, which keeps the second family. |
| `-fast` suffix | Drop it. Kiro has no fast mode. |
| `auto` or `inherit-parent` | Omit `model`. |
| The `pstack-models.mdc` rule, `~/.cursor/rules/pstack-models.mdc` | `.opencode/pstack-models.md` in the project when it exists, else `~/.config/opencode/pstack-models.md`. Read it at the start of a pstack run. On pewter, conf.nix owns the global file. If neither file or the role's line is missing, map the skill's default slug with the rows above. |
| A role value `<model>#<effort>`, such as `kiro/gpt-5.6-terra#high` | Pass it as the subagent `model`. |
| `/setup-pstack`, "rerun setup", "pick a reasoning budget" | Not installed. conf.nix owns the model file at `modules/llm/.agents/pstack/src/pstack-models.md`, and `~/.config/opencode/pstack-models.md` links to it. Tell the user to edit that file. The next pstack run reads the new lines, with no rebuild. Never write a model rule yourself. |
| A skill's default effort ("xhigh by default") | The effort on the role's line in the model file. |

Families for the cross-judge and panel rules: `kiro/claude-*` is one family and `kiro/gpt-*` is the other. Kiro Auto is not a family, so it never judges.

## Paths

| Cursor | OpenCode |
| --- | --- |
| `.cursor/skills/`, `~/.cursor/skills/` | `.agents/skills/` in the project, `~/.agents/skills/` globally. A generated `verify-<app>` skill goes in the project's `.agents/skills/`. |
| `~/.cursor/plugins/`, `.cursor-plugin/plugin.json` | `<pstack>`, and `<pstack>/plugin.json`. |
| `.cursor/rules/*.mdc`, always-applied rules | `AGENTS.md`, or a file listed under `instructions` in `opencode.json`. The model rule is the exception. See Models. |
| `https://github.com/cursor/plugins/blob/main/pstack/<path>` | `<pstack>/<path>` when that file exists. Read the local copy and never fetch it. Give the user the URL when they need a link. |
| Transcripts in `~/.cursor/projects/<slug>/agent-transcripts/` | The OpenCode API. `opencode session list --format json` lists this project's sessions, newest first. `opencode session export <id>` prints one session with its messages. The current session's id is in your instructions. Read only sessions of this project. |
| The agent store's `docs/` | `.scratch/` in a repository that ignores it, otherwise `/tmp/opencode/`. |

## Cursor-only features

OpenCode has no Cursor Automations, Bugbot, cloud agents, Custom Modes or `/loop`. When a step needs one, put one line in your reply, `Skipped in OpenCode: <step>. <reason>.`, then go on to the next step. Do not stop, ask, or retry.

| Cursor | OpenCode |
| --- | --- |
| Custom Mode (pinned `/poteto-mode`) | the `poteto` primary agent. The `/poteto-mode` command switches the session to it, and Shift+Tab or `/agents` switches back. Its system prompt tells it to load `poteto-mode` on every new task. |
| `/loop` with a predicate or heartbeat | No built-in. In one turn, keep working until the predicate holds. Across hours, the user runs `pstack-tick <session>` from a timer, which sends a tick message to the session with `opencode run --session`. Write the tick prompt the playbook gives into the decision log so the timer can reuse it. |
| `control-ui`, `control-cli` (`cursor-team-kit`) | the `agent-browser` skill for browsers and Electron, `tmux` for CLIs and TUIs, `curl` for services. |
| `/deslop` (`cursor-team-kit`) | Do it by hand: remove narrating comments, unsupported guards, dead compatibility paths and unrelated edits from the diff. |
| Cursor Automations, routines, webhooks, `SendToUser` | Skip with the line. |
| Bugbot | Bugbot comments on a GitHub PR are ordinary review threads. Triage them with the `gh` commands the step gives. Skip a step that starts or waits for Bugbot when the PR has none. |
| Cursor Projects (a coordinator thread with cloud subagents) | one long-lived OpenCode session on pewter, run by the `poteto` agent, with subagents in worktrees. See the Orchestrate playbook. |
| Cursor's `create-skill` | the `writing-for-agents` skill. |
