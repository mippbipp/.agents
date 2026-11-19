# .agents

My `~/.agents` directory. [`mippbipp/conf.nix`](https://github.com/mippbipp/conf.nix) pulls this repo in as a submodule at `modules/llm/.agents` and links it to `~/.agents`.

- `skills/`: global skills. OpenCode and other agents find `~/.agents/skills` on their own, in every directory.
- `matt/`: project skills from [`mattpocock/skills`](https://github.com/mattpocock/skills). Nothing finds them until a project adds these skills to the harness. See [`matt/README.md`](matt/README.md).

## Private skills

- Emil Kowalski's course [Animations on the Web](https://animations.dev/) has animation skills, combined with dialkit skill.
