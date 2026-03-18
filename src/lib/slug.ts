export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createGuestSlugBase(name: string) {
  const base = slugify(name) || "tamu";
  return base.slice(0, 48);
}
