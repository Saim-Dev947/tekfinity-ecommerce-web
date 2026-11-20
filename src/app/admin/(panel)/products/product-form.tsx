"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { saveProductAction } from "@/app/admin/actions";
import type { Category, Product } from "@/lib/types";

function Field({ label, name, type = "text", defaultValue = "", required = false, textarea = false, placeholder, hint }: {
  label: string; name: string; type?: string; defaultValue?: string | number;
  required?: boolean; textarea?: boolean; placeholder?: string; hint?: string;
}) {
  return (
    <div>
      <label htmlFor={`pf-${name}`} className="label">{label}{required ? " *" : ""}</label>
      {textarea ? (
        <textarea id={`pf-${name}`} name={name} rows={4} defaultValue={defaultValue} required={required} placeholder={placeholder} className="input" />
      ) : (
        <input id={`pf-${name}`} name={name} type={type} step={type === "number" ? "any" : undefined} defaultValue={defaultValue} required={required} placeholder={placeholder} className="input" />
      )}
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

function Check({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-ink">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-4 w-4 accent-teal" />
      {label}
    </label>
  );
}

export function ProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState(product?.images.join("\n") ?? "");

  const uploadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.currentTarget.files ?? []);
    e.currentTarget.value = "";
    if (!files.length) return;

    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      files.forEach((file) => body.append("files", file));
      const response = await fetch("/api/admin/products/images", { method: "POST", body });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Image upload failed");
      if (!Array.isArray(result.urls) || !result.urls.every((url: unknown) => typeof url === "string")) {
        throw new Error("The server returned an invalid upload response");
      }
      setImages((current) => [...current.split(/\r?\n/).map((url) => url.trim()).filter(Boolean), ...result.urls].join("\n"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (uploading) return;
    setLoading(true); setError("");
    const fd = new FormData(e.currentTarget);
    if (product) fd.set("id", product.id);
    const res = await saveProductAction(fd);
    // redirect happens inside the action on success; this handles errors
    if (res && typeof res === "object" && "error" in res && res.error) {
      setError(String(res.error));
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="card mt-6 space-y-6 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" name="name" required defaultValue={product?.name} placeholder="AirPods Pro (2nd Gen)" />
        <Field label="Slug" name="slug" defaultValue={product?.slug} placeholder="auto-generated if empty" hint="URL-friendly identifier" />
        <Field label="Brand" name="brand" defaultValue={product?.brand} placeholder="Apple / Tekfinity" />
        <Field label="SKU" name="sku" defaultValue={product?.sku} />
        <Field label="Price (PKR)" name="price" type="number" required defaultValue={product?.price} />
        <Field label="Compare-at price (PKR)" name="compare_at_price" type="number" defaultValue={product?.compare_at_price ?? ""} />
        <Field label="Stock" name="stock" type="number" required defaultValue={product?.stock ?? 0} />
        <Field label="Low-stock threshold" name="low_stock_threshold" type="number" defaultValue={product?.low_stock_threshold ?? 5} />
      </div>

      <Field label="Description" name="description" textarea required defaultValue={product?.description} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pf-cat" className="label">Category</label>
          <select id="pf-cat" name="category_id" className="input" defaultValue={product?.category_id ?? ""}>
            <option value="">— None —</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <Field label="Category slug (for feed)" name="category_slug" defaultValue={product?.category_slug} placeholder="airpods" />
      </div>

      <div>
        <label htmlFor="pf-image-files" className="label">Product images *</label>
        <label htmlFor="pf-image-files" className="btn-outline inline-flex cursor-pointer px-4 py-2.5 text-sm">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {uploading ? "Uploading images…" : "Add images from device"}
        </label>
        <input
          id="pf-image-files"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
          multiple
          disabled={uploading}
          onChange={uploadImages}
          className="sr-only"
        />
        <p className="mt-2 text-xs text-slate-400">Choose up to 8 images per upload, up to 5 MB each. The first image is the main product image.</p>
        <label htmlFor="pf-images" className="label mt-4">Image URLs</label>
        <textarea
          id="pf-images"
          name="images"
          rows={4}
          required
          value={images}
          onChange={(e) => setImages(e.target.value)}
          placeholder="Uploaded image URLs appear here. You can also paste one URL per line."
          className="input"
        />
        {images.split(/\r?\n/).map((url) => url.trim()).filter(Boolean).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {images.split(/\r?\n/).map((url) => url.trim()).filter(Boolean).map((url, index) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={`${url}-${index}`} src={url} alt={`Product image ${index + 1}`} className="h-16 w-16 rounded-lg border border-line object-cover" />
            ))}
          </div>
        )}
      </div>
      <Field label="Available colors (comma separated)" name="colors" defaultValue={product?.colors?.join(", ")} placeholder="White, Black, Teal" />

      <fieldset>
        <legend className="label mb-2">Visibility & merchandising</legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Check name="is_active" label="Active (visible)" defaultChecked={product?.is_active !== false} />
          <Check name="is_featured" label="Featured" defaultChecked={product?.is_featured} />
          <Check name="is_bestseller" label="Best Seller" defaultChecked={product?.is_bestseller} />
          <Check name="is_new" label="New Arrival" defaultChecked={product?.is_new} />
          <Check name="is_flash_sale" label="Flash Sale" defaultChecked={product?.is_flash_sale} />
          <Check name="verification_enabled" label="QR verification" defaultChecked={product?.verification_enabled} />
        </div>
      </fieldset>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600" role="alert">{error}</p>}

      <div className="flex gap-3 border-t border-line pt-5">
        <button type="submit" disabled={loading || uploading} className="btn-teal px-8 py-3">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {product ? "Save Changes" : "Create Product"}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-outline px-6 py-3">Cancel</button>
      </div>
      <p className="text-xs text-slate-400">Images upload to local storage in demo mode or the public product-images Supabase bucket when configured. Product images update the Instagram catalog feed automatically on next sync.</p>
    </form>
  );
}
