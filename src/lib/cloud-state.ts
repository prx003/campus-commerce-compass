import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * useState that is saved to the shared app_state table, so every signed-in
 * user sees the same data and it survives reloads.
 */
export function useCloudState<T>(key: string, initial: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(initial);
  const loaded = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("app_state")
      .select("value")
      .eq("key", key)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        if (data) setValue(data.value as T);
        loaded.current = true;
      });
    return () => {
      cancelled = true;
    };
  }, [key]);

  useEffect(() => {
    if (!loaded.current) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      await supabase.from("app_state").upsert({
        key,
        value: value as never,
        updated_by: null,
        updated_at: new Date().toISOString(),
      });
    }, 600);
  }, [key, value]);

  return [value, setValue];
}
