<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- App state (employees, dependants, travel requests) lives in the client store at `src/lib/store.ts`, seeded from `src/lib/seed.ts` and persisted to localStorage — the MVP is a demo tracker with a role switcher, so there is no backend or real auth.
- Workflow stage transitions and role permissions live only in `src/lib/workflow.ts`, so duty and leisure rules stay in one place.
