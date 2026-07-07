# AGENTS.md

A node-based AI creation platform for producing comic dramas, MVs, and short-form videos. Users build creative workflows on a Figma-like canvas by connecting AI nodes for script, storyboard, character, scene, audio, image composition, video generation, and export.

## Startup Workflow

Before writing code:

1. **Confirm working directory** with `pwd`
2. **Read this file** completely
3. **Read `docs/PRODUCT.md`** for core features and product PRD
4. **Read `docs/ARCHITECTURE.md`** understand the Layer Boundries and data flow.
5. **Run `.\init.ps1`** to verify environment is healthy
6. **Read `feature_list.json`** to see current feature state
8. **update `sprint-contract.md`** update scope, criteria based on desired feature plan
9. **Run `.\scripts\initialize-evaluator-rubric.ps1`** to Initialize `evaluator-rubric.md`.
10. **Review recent commits** with `git log --oneline -5` and make sure everything was commited with short description and pushed

If baseline verification is failing, repair that first before adding new scope. If docs and code diverge, treat docs as target behavior and current code as implementation reality.

## Agent Loop
- **Main Agent + 2 Subagents**: Main Agent to do planning and write `sprint-contract.md`, then coding subagent should follow the plan. At the end, evaluator subagent will use verify skill first then should fill out the `evaluator-rubric.md` and hand it to the Main agent. Then Main agent start a new round in our loop, give solution plan to the coding agent and run `.\scripts\initialize-evaluator-rubric.ps1`. We keep this loop until evaluator accepts over 140. 5 rounds is a limit.

## Working Rules
- **Mark every button/fucntion that is not done** For every button/function showed in the fronted, it should be either done with completed backend or have a pop up window told you that is not done yet.
- **One feature at a time**: Pick exactly one unfinished feature from `feature_list.json` 
- **Verification required**: Don't claim done without running verification commands and always do End to End test.
- **Stay in scope**: Don't modify files unrelated to the current feature
- **Leave clean state**: clean all the temporary tests or ducments.
- **Respect boundaries**: Shared capabilities belong in the platform base; vertical-specific behavior belongs in the relevant agent module
- **Keep HITL boundaries**: No hidden auto-execution for discounts, campaigns, approvals, or other consequential actions
- **Label missing capabilities honestly**: If backend, connector, orchestration, audit, or persistence layers are missing, mark them clearly instead of implying they exist
- **Maintainess and Concise Code**: When we build, we should make the code clean and reusable, don't write repeated content.
- **Use shadcn skill and uiux-pro max skill** to use tripld UI components in our repo, if we need to use components like toolbar that we don't have in our tripld UI component, then use shadcn interactive components. make it interactive as much as possible.
- **Don't pay attention to Mobiel end UI**

## Required Artifacts
- `docs/ARCHITECTURE.md`: layer boundaries and data flow
- `feature_list.json`: Feature state tracker (source of truth)
- `/feature_tasks`: deatialed feature task
- `progress.md`: Session continuity log
- `init.ps1`: Standard startup and verification path
- `session-handoff.md`: information from last last session
- `sprint-contract.md`: planner scope, acceptance criteria, and sprint log
- `evaluator-rubric.md`: quality and revision evidence for this variant

## Definition of Done

A feature is done only when ALL of the following are true:

- [ ] Target behavior is implemented
- [ ] Required verification actually ran 
- [ ] Evidence/Status recorded in `feature_list.json`, `sprint-contract.md`, `evaluator-rubric.md` by evlauator.
- [ ] Repository remains restartable from standard startup path

## End of Session

Before ending a session:

1. Update `progress.md` with current state
2. Update `feature_list.json` with new feature status
3. Commit with descriptive message once work is in safe state with commit info
4. Leave repo clean enough for next session to run `.\init.ps1` immediately
