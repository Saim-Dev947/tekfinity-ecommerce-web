import "server-only";
import { promises as fs } from "fs";
import path from "path";

const DIR = path.join(process.cwd(), "data", "local");

function fileFor(collection: string) {
  return path.join(DIR, `${collection}.json`);
}

/** Tiny JSON-file store used when Supabase is not configured (local dev / demo mode). */
export async function readCollection<T>(collection: string, fallback: T[] = []): Promise<T[]> {
  try {
    const raw = await fs.readFile(fileFor(collection), "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export async function writeCollection<T>(collection: string, items: T[]): Promise<void> {
  await fs.mkdir(DIR, { recursive: true });
  await fs.writeFile(fileFor(collection), JSON.stringify(items, null, 2), "utf8");
}

export async function upsertItem<T extends { id: string }>(collection: string, item: T): Promise<T[]> {
  const items = await readCollection<T>(collection);
  const idx = items.findIndex((i) => i.id === item.id);
  if (idx >= 0) items[idx] = item;
  else items.push(item);
  await writeCollection(collection, items);
  return items;
}

export async function deleteItem(collection: string, id: string): Promise<void> {
  const items = await readCollection<{ id: string }>(collection);
  await writeCollection(collection, items.filter((i) => i.id !== id));
}
