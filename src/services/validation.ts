export function validateText(value: string, label: string, min: number, max: number) {
  if (!value.trim()) return `Vui lòng nhập ${label}.`;
  if (value.trim().length < min) return `${label} phải có ít nhất ${min} ký tự.`;
  if (value.length > max) return `${label} không được vượt quá ${max} ký tự.`;
  return '';
}

export const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium', timeStyle: 'short',
  }).format(new Date(value));
}
