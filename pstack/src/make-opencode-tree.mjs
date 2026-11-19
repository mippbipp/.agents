#!/usr/bin/env node
// Builds pstack for OpenCode from a checkout of github.com/cursor/plugins.
//
//   node make-opencode-tree.mjs <cursor-plugins checkout> <out dir> --adapter <opencode.md> [--install <pstack path>]
//
// <out dir> receives skills/, agents/, docs/ (with docs/harness/opencode.md), README.md, LICENSE,
// plugin.json, plus opencode/agents/*.md and opencode/commands/*.md for OpenCode's own folders.
// --install is where the tree will live at runtime (default ~/.agents/pstack); agent bodies name it.
// Rerunning replaces <out dir> completely, so never edit the output by hand.

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, dirname, basename } from 'node:path';
import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
const flag = (name) => { const i = args.indexOf(name); if (i < 0) return undefined; const v = args[i + 1]; args.splice(i, 2); return v; };
const adapter = flag('--adapter');
const install = flag('--install') ?? '~/.agents/pstack';
const [src, out] = args;
const fail = (m) => { console.error(m); process.exit(2); };
if (!src || !out || !adapter) fail('usage: node make-opencode-tree.mjs <cursor-plugins checkout> <out dir> --adapter <opencode.md> [--install <path>]');
const PSTACK = join(src, 'pstack');
if (!existsSync(join(PSTACK, 'skills/poteto-mode/SKILL.md'))) fail(`no pstack in ${src}`);
if (!existsSync(adapter)) fail(`no adapter at ${adapter}`);

// Skill ids that collide with skills already in ~/.agents (teach is global, tdd was Matt's). OpenCode keeps one skill per id,
// so pstack's copies get a prefix and every reference inside the tree follows them.
const RENAME = { teach: 'pstack-teach', tdd: 'pstack-tdd' };
// pstack's unslop is the only unslop skill, and the global AGENTS.md tells every session to use it.
// Upstream hides it from the model, so it gets a listed description with trigger words instead.
const LISTED = {
  unslop: 'Cut AI tells from writing. Use when writing, editing or reviewing prose, docs, READMEs, ADRs, comments, PR bodies, commit messages, or any generated text.',
};
const SKIP = new Set(['setup-pstack']);
const CURSORISH = /\bTask\b|AskQuestion|todo ?list|generalPurpose|poteto-agent|comment-sicko|readonly|environment: "|run_in_background|cloud_base_branch|pstack-models|\.cursor\/|\.cursor-plugin|\bCursor\b|\/loop\b|Bugbot|Automations?|claude-opus-|grok-|inherit-parent|agent-transcripts|control-ui|control-cli|deslop|create-skill/;

const walk = (dir) => readdirSync(dir).flatMap((n) => {
  if (n === 'node_modules' || n === '.DS_Store') return [];
  const p = join(dir, n);
  return statSync(p).isDirectory() ? walk(p) : [p];
});

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const part of ['skills', 'agents', 'docs', 'README.md', 'LICENSE', 'plugin.json']) cpSync(join(PSTACK, part), join(out, part), { recursive: true });
for (const [from, to] of Object.entries(RENAME)) {
  const dir = join(out, 'skills', from);
  if (existsSync(dir)) cpSync(dir, join(out, 'skills', to), { recursive: true }), rmSync(dir, { recursive: true });
}
for (const id of SKIP) rmSync(join(out, 'skills', id), { recursive: true, force: true });
mkdirSync(join(out, 'docs/harness'), { recursive: true });
cpSync(adapter, join(out, 'docs/harness/opencode.md'));

function rename(text) {
  for (const [from, to] of Object.entries(RENAME)) {
    text = text
      .replaceAll(`**${from}**`, `**${to}**`)
      .replace(new RegExp(`(^|[\\s\`(\\[])/${from}\\b`, 'gm'), `$1/${to}`)
      .replaceAll(`../../skills/${from}/`, `../../skills/${to}/`)
      .replaceAll(`./skills/${from}/`, `./skills/${to}/`)
      .replaceAll(`../${from}/`, `../${to}/`)
      .replace(new RegExp(`\\b${from} rule (\\d+)`, 'g'), `${to} rule $1`);
  }
  return text;
}

let edited = 0, pointered = 0, relinked = 0;
// a relative link to a pstack file this tree leaves out (automations/, assets/) points at GitHub main instead
const GITHUB = 'https://github.com/cursor/plugins/blob/main/pstack/';
const relink = (text, path) => text.replace(/\]\(([^)\s#]+)(#[^)\s]*)?\)/g, (link, href, hash = '') => {
  if (/^[a-z]+:/i.test(href) || href.startsWith('#')) return link;
  const target = join(dirname(path), href);
  if (existsSync(target)) return link;
  const inSource = relative(out, target);
  if (inSource.startsWith('..') || !existsSync(join(PSTACK, inSource))) return link;
  relinked++;
  return `](${GITHUB}${inSource.split('\\').join('/')}${hash})`;
});
for (const path of walk(out).filter((p) => p.endsWith('.md'))) {
  const rel = relative(out, path);
  let text = readFileSync(path, 'utf8');
  const before = text;
  text = relink(rename(text), path);
  const skillName = rel.match(/^skills\/([^/]+)\/SKILL\.md$/)?.[1];
  if (skillName) text = text.replace(/^name:\s*.*$/m, `name: ${skillName}`);
  if (LISTED[skillName]) text = text.replace(/^disable-model-invocation:.*\n/m, '').replace(/^description:.*$/m, `description: ${JSON.stringify(LISTED[skillName])}`);
  const isEntry = skillName || rel.startsWith('agents/');
  if (isEntry && CURSORISH.test(text) && !text.includes('docs/harness/opencode.md')) {
    const link = relative(dirname(path), join(out, 'docs/harness/opencode.md'));
    text = text.replace(/^(# .*)\n+/m, `$1\n\nIn OpenCode, read [the OpenCode adapter](${link}) once per session before you follow this ${skillName ? 'skill' : 'agent'}.\n\n`);
    pointered++;
  }
  if (text !== before) { writeFileSync(path, text); edited++; }
}

// OpenCode agents. A Markdown agent's body becomes its system prompt.
const agentDir = join(out, 'opencode/agents');
mkdirSync(agentDir, { recursive: true });
const upstream = (name) => readFileSync(join(PSTACK, 'agents', `${name}.md`), 'utf8').replace(/^---[\s\S]*?---\n+/, '');
const where = `In OpenCode, pstack lives at \`${install}\`, or at \`.agents/pstack\` in the project when that exists. poteto-mode is \`<pstack>/skills/poteto-mode/SKILL.md\` and the OpenCode adapter is \`<pstack>/docs/harness/opencode.md\`. Read the adapter before poteto-mode.`;
writeFileSync(join(agentDir, 'poteto-agent.md'), `---
description: Delegate subagent for code-writing and helper tasks spawned during a poteto-mode run. Use for delegates, not as the runner for poteto-mode itself. Reads poteto-mode in full before any work.
mode: subagent
---

${rename(upstream('poteto-agent')).trim().replace(/With no path,[\s\S]*?stop and tell your parent\./, `With no path, look for it as described below, and stop and tell your parent if it is missing.`)}

${where}
`);
writeFileSync(join(agentDir, 'comment-sicko.md'), `---
description: Read-only comment reviewer. Usually invoked through the no-comments skill, not directly.
mode: subagent
permissions:
  - action: edit
    resource: "*"
    effect: deny
---

${rename(upstream('comment-sicko'))}
`);
writeFileSync(join(agentDir, 'poteto.md'), `---
description: poteto-mode on every turn. Routes each new task to a pstack playbook and runs it with subagents and verified evidence.
mode: primary
color: "#f9a3c0"
---

You are an agent in OpenCode running poteto-mode, the agent style from pstack. This agent is the OpenCode form of a pinned Cursor Custom Mode.

${where}

- On the first message of a new task, and whenever the user says "new task", read the OpenCode adapter, then load the poteto-mode skill with the skill tool, match a playbook, and open its steps as todos before anything else.
- For a follow-up inside a task, keep following the playbook you opened. Do not reload the skill unless the user changes task.
- When a message is a quick question or a trivial edit that needs no playbook, say so in one line and answer it directly.
- Use your tools to do the work. Prefer read, grep, glob and edit over shell for files. Read before you edit. Run what you change and show the real output.
- Write replies per poteto-mode's Writing the reply section and the unslop skill.
`);

// OpenCode commands, so poteto's prompts work as typed: "/how do we cancel runs?"
const cmdDir = join(out, 'opencode/commands');
mkdirSync(cmdDir, { recursive: true });
let commands = 0;
for (const id of readdirSync(join(out, 'skills')).sort()) {
  if (id.startsWith('principle-') || id === 'make-bot-ui' || SKIP.has(id)) continue;
  const fm = readFileSync(join(out, 'skills', id, 'SKILL.md'), 'utf8').match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
  const desc = (fm.match(/^description:\s*(.*)$/m)?.[1] ?? id).replace(/^["']|["']$/g, '').replace(/\\"/g, "'").replace(/["\\]/g, "'");
  const short = desc.length > 170 ? desc.slice(0, desc.lastIndexOf(' ', 166)) + '...' : desc;
  // /poteto-mode also switches the session to the poteto agent: the OpenCode form of a pinned Custom Mode
  const agent = id === 'poteto-mode' ? 'agent: poteto\n' : '';
  writeFileSync(join(cmdDir, `${id}.md`), `---
description: "pstack: ${short}"
${agent}---

Load the \`${id}\` skill with the skill tool and follow it. In OpenCode, read the adapter it points to first.

The request: $ARGUMENTS
`);
  commands++;
}

let commit = 'unknown';
try { commit = execFileSync('git', ['-C', src, 'log', '-1', '--format=%h %cs'], { encoding: 'utf8' }).trim(); } catch {}
const version = JSON.parse(readFileSync(join(PSTACK, 'plugin.json'), 'utf8')).version ?? '?';
writeFileSync(join(out, 'OPENCODE.md'), `# pstack for OpenCode

Generated from \`cursor/plugins\` at \`${commit}\` (pstack ${version}) by \`make-opencode-tree.mjs\`. Do not edit this tree by hand. Rerun the generator.

- \`skills/\` are the upstream skills. \`teach\` and \`tdd\` are renamed \`pstack-teach\` and \`pstack-tdd\`, because those ids already exist in \`~/.agents\`. \`unslop\` keeps its id: it is the only unslop skill, loaded in every directory.
- \`setup-pstack\` is left out. It writes a Cursor model rule. Here conf.nix owns \`~/.config/opencode/pstack-models.md\`, and the adapter's Models section says so.
- Every skill that uses Cursor names starts with a line that points at \`docs/harness/opencode.md\`.
- \`opencode/agents/\` holds \`poteto\` (primary, the pinned mode), \`poteto-agent\` and \`comment-sicko\` (subagents) for \`~/.config/opencode/agents/\`.
- \`opencode/commands/\` holds one slash command per non-principle skill for \`~/.config/opencode/commands/\`.
`);

console.log(`pstack ${version} at ${commit}: ${readdirSync(join(out, 'skills')).length} skills, ${edited} files rewritten, ${pointered} adapter pointers, ${relinked} links sent to GitHub, 3 agents, ${commands} commands -> ${out}`);
