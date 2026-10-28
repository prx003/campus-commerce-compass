import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Settings2, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";
import { useAcademic } from "@/components/academic/store";

export const Route = createFileRoute("/_app/academic/settings")({
  component: AcademicSettingsPage,
});

function AcademicSettingsPage() {
  const { settings, setSettings, resetDemo, logAudit } = useAcademic();
  const [form, setForm] = useState(settings);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    setSettings(form);
    logAudit("UPDATE_SETTINGS", `${form.academicYear} · ${form.term}`);
    toast.success("Academic settings saved");
  };

  const doReset = () => {
    if (!window.confirm("Reset all academic demo data to its original seed state? This cannot be undone.")) return;
    resetDemo();
    toast.success("Demo data reset");
  };

  const field = (key: keyof typeof form, label: string, type: "text" | "number" = "text") => (
    <div>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>
      <input
        type={type}
        value={String(form[key])}
        onChange={(e) =>
          setForm((p) => ({ ...p, [key]: type === "number" ? Number(e.target.value) : e.target.value }))
        }
        className="mt-1.5 w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Academic year configuration and data controls</p>
      </div>

      <form onSubmit={save} className="rounded-xl bg-card border border-border p-6 space-y-5 shadow-sm">
        <div className="flex items-center gap-2 border-b border-border pb-4">
          <Settings2 className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Academic Configuration</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {field("academicYear", "Academic Year")}
          {field("term", "Current Term")}
          {field("threshold", "Minimum Attendance %", "number")}
          {field("timezone", "Timezone")}
        </div>
        {field("campusAddress", "Campus Address")}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
          >
            <Save className="size-4" /> Save Settings
          </button>
        </div>
      </form>

      <div className="rounded-xl bg-card border border-border p-6 shadow-sm">
        <h3 className="text-sm font-semibold">Data</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Restore all academic module data (students, tasks, timetable, attendance, grades, care notes, announcements) to its original seed state.
        </p>
        <button
          onClick={doReset}
          className="mt-4 inline-flex items-center gap-2 h-10 px-4 rounded-md border border-destructive/40 text-destructive text-sm font-medium hover:bg-destructive/10"
        >
          <RotateCcw className="size-4" /> Reset Demo Data
        </button>
      </div>
    </div>
  );
}
