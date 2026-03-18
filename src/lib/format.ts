export function formatDateId(value: string | Date, options?: Intl.DateTimeFormatOptions) {
  const date = typeof value === "string" ? new Date(value) : value;

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...options
  }).format(date);
}

export function formatDateTimeId(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

export function getFontClass(fontKey: string) {
  switch (fontKey) {
    case "playfair":
      return "font-playfair";
    case "jakarta":
      return "font-jakarta";
    case "manrope":
      return "font-manrope";
    default:
      return "font-cormorant";
  }
}

export function getLayoutLabel(layoutStyle: string) {
  return layoutStyle === "classic" ? "Classic" : "Editorial";
}

