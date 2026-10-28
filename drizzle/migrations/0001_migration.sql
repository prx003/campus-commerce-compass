grant select, insert, update on public.app_state to anon;
create policy "public read state" on public.app_state for select to anon using (true);
create policy "public insert state" on public.app_state for insert to anon with check (true);
create policy "public update state" on public.app_state for update to anon using (true);