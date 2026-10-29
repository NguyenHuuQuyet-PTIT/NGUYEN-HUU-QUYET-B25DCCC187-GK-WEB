import type { ChangeEventHandler } from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  error?: string;
  min: number;
  max: number;
  multiline?: boolean;
  type?: 'text' | 'password';
  autoComplete?: string;
  placeholder?: string;
}

export function FormField({ id, label, value, onChange, error, min, max,
  multiline, type = 'text', autoComplete, placeholder }: FormFieldProps) {
  const props = {
    id, name: id, value, onChange, placeholder, required: true,
    minLength: min, maxLength: max, 'aria-invalid': Boolean(error),
    'aria-describedby': `${id}-hint${error ? ` ${id}-error` : ''}`,
  };
  return <div className="form-field">
    <label htmlFor={id}>{label} <span className="required-label">(bắt buộc)</span></label>
    {multiline ? <textarea {...props} rows={10} />
      : <input {...props} type={type} autoComplete={autoComplete} />}
    <div id={`${id}-hint`} className="field-hint">
      <span>{min}–{max.toLocaleString('vi-VN')} ký tự</span>
      <span>{value.length}/{max}</span>
    </div>
    {error && <p id={`${id}-error`} className="field-error" role="alert">{error}</p>}
  </div>;
}
