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

## Project architecture
- Keep the College Management Portal modules isolated under `src/components/college-portal/` and expose them through `/college`; this preserves their independent role-based state and avoids coupling them to Zenith HR state.
- Keep the Governing Body & Executive Management modules isolated under `src/components/governance/` and expose them through `/governance`; this keeps their leadership state separate while sharing Zenith's application shell.
- Keep the Marketing, Admissions & PR modules isolated under `src/components/marketing-pr/` and expose them through `/marketing`; this preserves its role workspaces while sharing Zenith's application shell.
- No passwords: visitors pick a role on first visit (saved in the browser by `src/lib/auth.tsx`), which limits sections; a Principal is locked to the principal workspace in `/college`. `app_state` stays anon-readable/writable. Why: the owner wants role views without a login system.
- Module state persists via `useCloudState(key, initial)` into the shared `app_state` JSON table. Why: lets existing in-memory stores save without per-module schemas.
- College Portal uses the Sales-style page header with underline tabs; use the shared `ModuleShell` for Marketing, Placement and Governance navigation, with global semantic module tokens; this keeps presentation consistent while leaving each module's role state isolated.
- Keep Skill AI admissions components under `src/components/sales/admissions/`, with a shared cloud-backed context inside Sales and the public application page; this connects the dossier and finance workflow without changing existing Sales data or navigation styling.
- Keep imported call-center pages isolated under `src/components/sales/call-center/`, expose them through `/sales/call-center` with navigation defined in that module, and use a separate public app_state key; this preserves existing Sales data and does not import the repository's authentication or private messages.
- Call-center agent share links live at public `/agent/$agentId` (outside `_app`) and read/write the same call-center app_state key, scoped to leads assigned to that agent; why: agents work from a link without the admin shell.
