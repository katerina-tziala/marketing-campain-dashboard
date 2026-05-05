export function withAlpha(color: string, opacity: number): string {
  const rgbMatch = color.match(/rgba?\(([^,)]+,[^,)]+,[^,)]+)/);
  if (rgbMatch) {
    return `rgba(${rgbMatch[1]}, ${opacity})`;
  }
  const hexMatch = color.match(/^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/);
  if (hexMatch) {
    const r = parseInt(hexMatch[1], 16);
    const g = parseInt(hexMatch[2], 16);
    const b = parseInt(hexMatch[3], 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
}
