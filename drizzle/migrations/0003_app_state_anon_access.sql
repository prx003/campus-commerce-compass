grant select, insert, update on public.app_state to anon;
do $$ begin
  create policy "public read state" on public.app_state for select to anon using (true);
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "public insert state" on public.app_state for insert to anon with check (true);
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "public update state" on public.app_state for update to anon using (true);
exception when duplicate_object then null;
end $$;