"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Download, FileUp, Loader2, Upload } from "lucide-react";
import { importProductsAction, type ProductImportRow } from "@/app/admin/actions";

const TEMPLATE = "name,price,compare_at_price,stock,category,sku,brand,description,image,colors\n" +
  "Example Product,4999,,10,chargers,SKU-001,Generic,A great product,https://example.com/image.jpg,Black,White\n";

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = "";
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQ = false;
      } else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { cur.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      cur.push(field); field = "";
      if (cur.some((v) => v.trim() !== "")) rows.push(cur);
      cur = [];
    } else field += c;
  }
  if (field || cur.length) { cur.push(field); if (cur.some((v) => v.trim() !== "")) rows.push(cur); }
  return rows;
}

const HEADER_MAP: Record<string, keyof ProductImportRow> = {
  name: "name", title: "name",
  price: "price", "compare_at_price": "compare_at_price", compareprice: "compare_at_price", compare: "compare_at_price",
  stock: "stock", quantity: "stock", qty: "stock",
  category: "category", category_slug: "category", type: "category",
  sku: "sku", brand: "brand", description: "description", desc: "description",
  image: "image", images: "image", image_url: "image", "image url": "image",
  colors: "colors", color: "colors",
};

function rowsToObjects(table: string[][]): ProductImportRow[] {
  if (table.length < 2) return [];
  const headers = table[0].map((h) => HEADER_MAP[h.trim().toLowerCase().replace(/[\s-]+/g, "_")] ?? null);
  return table.slice(1).map((cells) => {
    const obj: ProductImportRow = {};
    cells.forEach((cell, i) => {
      const key = headers[i];
      if (key) obj[key] = cell.trim();
    });
    return obj;
  }).filter((r) => r.name || r.price);
}

export function ImportClient({ categories }: { categories: string[] }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ProductImportRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ created: number; errors: string[] } | null>(null);

  const onFile = async (file: File) => {
    setParseError(""); setResult(null);
    try {
      const text = await file.text();
      const parsed = rowsToObjects(parseCSV(text));
      if (!parsed.length) { setParseError("No valid rows found — check the CSV format."); setRows([]); return; }
      setRows(parsed);
      setFileName(file.name);
    } catch {
      setParseError("Could not read that file.");
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATE], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "tekfinity-products-template.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const doImport = async () => {
    setImporting(true);
    setResult(null);
    try {
      const res = await importProductsAction(rows);
      setResult(res);
      if (res.created > 0) setRows([]);
    } catch {
      setResult({ created: 0, errors: ["Import failed — please try again."] });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="mt-6 max-w-4xl space-y-5">
      <div className="card flex flex-wrap items-center gap-3 p-5">
        <button onClick={downloadTemplate} className="btn-outline px-4 py-2.5 text-sm">
          <Download className="h-4 w-4" /> Download CSV template
        </button>
        <button onClick={() => fileRef.current?.click()} className="btn-teal px-4 py-2.5 text-sm">
          <FileUp className="h-4 w-4" /> Choose CSV file
        </button>
        <input
          ref={fileRef} type="file" accept=".csv,text/csv" className="sr-only"
          onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
        />
        {fileName && <span className="text-xs text-slate-500">{fileName} — {rows.length} row(s) parsed</span>}
      </div>

      {parseError && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{parseError}</p>}

      {rows.length > 0 && (
        <div className="card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
            <p className="text-sm font-semibold text-ink">Preview — {rows.length} product(s) ready to import</p>
            <button onClick={doImport} disabled={importing} className="btn-teal px-5 py-2.5 text-sm">
              {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Import {rows.length} product(s)
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="bg-mist"><tr>
                <th className="th">Name</th><th className="th">Price</th><th className="th">Stock</th>
                <th className="th">Category</th><th className="th">Image</th>
              </tr></thead>
              <tbody className="divide-y divide-line">
                {rows.slice(0, 20).map((r, i) => (
                  <tr key={i}>
                    <td className="td font-medium">{r.name}</td>
                    <td className="td">{r.price}</td>
                    <td className="td">{r.stock ?? 0}</td>
                    <td className="td text-xs">{r.category || "—"}{r.category && !categories.includes(String(r.category).toLowerCase()) ? <span className="ml-1 font-semibold text-amber-600">(unknown)</span> : ""}</td>
                    <td className="td max-w-[220px] truncate text-xs text-slate-500">{r.image}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 20 && <p className="px-5 py-3 text-xs text-slate-400">…and {rows.length - 20} more</p>}
          </div>
        </div>
      )}

      {result && (
        <div className={`card p-5 text-sm ${result.errors.length ? "border-amber-300 bg-amber-50" : "border-teal/30 bg-teal/5"}`}>
          <p className="font-bold text-ink">{result.created} product(s) imported.</p>
          {result.errors.length > 0 && (
            <ul className="mt-2 list-inside list-disc space-y-0.5 text-amber-800">
              {result.errors.slice(0, 20).map((e, i) => <li key={i}>{e}</li>)}
              {result.errors.length > 20 && <li>…and {result.errors.length - 20} more</li>}
            </ul>
          )}
          <Link href="/admin/products" className="mt-3 inline-block font-semibold text-teal hover:underline">View products →</Link>
        </div>
      )}
    </div>
  );
}
