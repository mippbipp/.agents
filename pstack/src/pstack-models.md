# pstack model configuration for OpenCode on Kiro. One line per role. Delete a line to fall back to the skill default.
# `inherit-parent` or `auto` as a value: the role runs on the parent chat model (omit the subagent `model`).
# Families: kiro/claude-* and kiro/gpt-*. Cross-judges and panels mix them.
# Kiro credit multipliers from `kiro-cli chat --list-models` on 2026-10-28: opus-5.5 2.0x, sonnet-5.5 1.3x, haiku-5.5 0.06x,
# gpt-5.6-sol 4.4x, gpt-5.6-terra 2.2x, gpt-5.6-luna 0.6x.
# budget: small (medium)
feature, refactoring: kiro/claude-sonnet-5.5#medium
bug-fix: kiro/claude-sonnet-5.5#medium
perf-issue: kiro/claude-sonnet-5.5#medium
hillclimb: kiro/claude-sonnet-5.5#medium
judgment and prose: kiro/claude-opus-5.5#high
hardest tasks: kiro/claude-opus-5.5#high
how explorer: kiro/claude-haiku-5.5#medium
how explainer: kiro/claude-sonnet-5.5#medium
why investigators: kiro/claude-haiku-5.5#medium
why synthesizer: kiro/claude-sonnet-5.5#medium
arena runners: kiro/claude-sonnet-5.5#medium, kiro/gpt-5.6-luna#max
arena cross-judge pool: kiro/gpt-5.6-luna#max, kiro/claude-sonnet-5.5#medium
swarm workers: kiro/claude-haiku-5.5#medium
architect runners: kiro/claude-sonnet-5.5#medium, kiro/gpt-5.6-luna#max
interrogate reviewers: kiro/claude-sonnet-5.5#medium, kiro/gpt-5.6-luna#max
