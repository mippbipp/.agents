#!/usr/bin/env bash
# pstack-tick: wake a long-lived OpenCode session with one message, the OpenCode stand-in for Cursor's /loop.
#
#   pstack-tick <session-id> [tick-file]
#
# The tick prompt is the first line of [tick-file] (default ~/.config/opencode/pstack-tick.txt), or the
# playbook's standard audit prompt when there is no file. Run it from a systemd user timer or by hand.
# Fails with exit 2 on bad arguments, and skips quietly when the session is already running a turn.
set -euo pipefail

session="${1:-}"
tick_file="${2:-${XDG_CONFIG_HOME:-$HOME/.config}/opencode/pstack-tick.txt}"
if [[ ! "$session" =~ ^ses_[A-Za-z0-9]+$ ]]; then
  echo "usage: pstack-tick <session-id> [tick-file]   (session ids start with ses_)" >&2
  exit 2
fi

default_prompt="Tick. Re-read the execution playbook you are running. Check the finish condition against the real artifacts. If it holds, report it and stop. Otherwise make the next smallest change the evidence justifies, verify it, and log one decision row. Report only what changed since the last tick."
prompt="$default_prompt"
if [[ -f "$tick_file" ]]; then
  prompt="$(head -n 1 "$tick_file")"
fi

if opencode api get /api/session/active 2>/dev/null | grep -q "\"$session\""; then
  echo "pstack-tick: $session is busy, skipping this tick"
  exit 0
fi

exec opencode run --session "$session" "$prompt"
