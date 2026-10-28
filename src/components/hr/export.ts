// Lightweight export helpers (no extra deps).
// "Excel" export = CSV which Excel opens natively. "PDF" export = a print
// window the browser renders to PDF.

export function exportCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const escape = (v: string | number) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers, ...rows].map((r) => r.map(escape).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportPDF(title: string, headers: string[], rows: (string | number)[][]) {
  const w = window.open("", "_blank", "width=900,height=650");
  if (!w) return;
  const thead = headers.map((h) => `<th>${h}</th>`).join("");
  const tbody = rows
    .map((r) => `<tr>${r.map((c) => `<td>${String(c ?? "")}</td>`).join("")}</tr>`)
    .join("");
  w.document.write(`<!doctype html><html><head><title>${title}</title>
  <style>
    *{font-family:Arial,Helvetica,sans-serif}
    h1{font-size:18px;margin:0 0 4px}
    .meta{color:#666;font-size:12px;margin-bottom:16px}
    table{border-collapse:collapse;width:100%;font-size:12px}
    th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}
    th{background:#0b1e4d;color:#fff}
    tr:nth-child(even) td{background:#f5f7fb}
  </style></head><body>
  <h1>${title}</h1>
  <div class="meta">Edusphere HR · Generated ${new Date().toLocaleString("en-IN")}</div>
  <table><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table>
  <script>window.onload=function(){window.print();}</script>
  </body></html>`);
  w.document.close();
}
