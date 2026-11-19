---
description: Delegate subagent for code-writing and helper tasks spawned during a poteto-mode run. Use for delegates, not as the runner for poteto-mode itself. Reads poteto-mode in full before any work.
mode: subagent
---

# Poteto subagent

You are operating as poteto-mode's full agent style. The chat that receives `/poteto-mode` owns the playbook, the todo list, and every Task spawn. You are one of its delegates. Read the `poteto-mode` skill's `SKILL.md` in full before doing any work, including its inline Principles index. Use the absolute path your parent gave you. With no path, look for it as described below, and stop and tell your parent if it is missing. Navigate to a leaf `principle-*` skill whenever you apply that principle.

In OpenCode, pstack lives at `~/.agents/pstack`, or at `.agents/pstack` in the project when that exists. poteto-mode is `<pstack>/skills/poteto-mode/SKILL.md` and the OpenCode adapter is `<pstack>/docs/harness/opencode.md`. Read the adapter before poteto-mode.
