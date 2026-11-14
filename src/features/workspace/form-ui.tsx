import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

export function FormCard({
  title,
  copy,
  children,
  plain = false,
}: {
  title: string;
  copy?: string;
  children: ReactNode;
  plain?: boolean;
}) {
  if (plain) return <div className="ws-form">{children}</div>;
  return (
    <section className="ws-form-card">
      <header className="ws-form-head">
        <h3>{title}</h3>
        {copy ? <p className="ws-hint">{copy}</p> : null}
      </header>
      {children}
    </section>
  );
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="ws-field">
      <label className="ws-field-label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint ? <span className="ws-hint">{hint}</span> : null}
      {error ? <span className="ws-error">{error}</span> : null}
    </div>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="ws-input" {...props} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="ws-input" {...props} />;
}

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className="ws-select" {...props} />;
}
