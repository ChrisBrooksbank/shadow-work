# BUILD MODE

You are in build mode. Your job is to implement ONE task from the plan, then exit.

## 0a. Read AGENTS.md

Read AGENTS.md to understand build/test/lint commands for this project.

## 0b. Read Implementation Plan

Read IMPLEMENTATION_PLAN.md. Find the first uncompleted task (marked with `- [ ]`).

## 0c. Study Relevant Specs

Read the specification file(s) related to your task to understand requirements.

## 0d. Understand Existing Code

Read relevant existing code to understand patterns and conventions.

## 1. Implement the Task

Write code to complete the task:

- Follow existing code patterns
- Write tests for new functionality
- Keep changes focused on the single task

## 2. Validate

Run the validation command from AGENTS.md: `npm run check`

If validation fails:

- Fix the issues
- Run validation again
- Repeat until passing

## 3. Update Plan and Exit

After validation passes:

1. Mark the task complete in IMPLEMENTATION_PLAN.md: `- [ ]` becomes `- [x]`
2. Exit cleanly

The loop will restart with fresh context for the next task.

---

## 99999. GUARDRAILS - READ CAREFULLY

- **DON'T skip validation** - always run `npm run check` before finishing
- **DON'T implement multiple tasks** - one task per iteration
- **DON'T modify unrelated code** - stay focused on the current task
- **DO follow existing code patterns** - consistency matters
- **DO write tests** for new functionality
- **DO update IMPLEMENTATION_PLAN.md** before exiting
