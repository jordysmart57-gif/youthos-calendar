import { CSSProperties, ReactNode } from 'react';

export function Badge({ tone, children }: { tone: string; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ${tone}`}
    >
      {children}
    </span>
  );
}

export function ProgressBar({
  value,
  tone = 'bg-brand-500',
  className = '',
}: {
  value: number;
  tone?: string;
  className?: string;
}) {
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-stone-200/80 ${className}`}>
      <div
        className={`h-full rounded-full transition-[width] duration-500 ease-out ${tone}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function Card({
  children,
  className = '',
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`rounded-2xl border border-stone-200/70 bg-white p-4 shadow-soft ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <h2 className="text-xs font-extrabold uppercase tracking-[0.12em] text-stone-500">{children}</h2>
      {action}
    </div>
  );
}

/** Large editorial page heading in the warm display serif. */
export function PageTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h1 className={`font-display text-[1.7rem] font-semibold leading-tight tracking-tight text-ink ${className}`}>
      {children}
    </h1>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/50 px-4 py-10 text-center">
      <p className="font-display text-base font-medium text-stone-600">{title}</p>
      {hint && <p className="mt-1 text-xs text-stone-400">{hint}</p>}
    </div>
  );
}

export function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex min-h-9 items-center whitespace-nowrap rounded-full border px-3.5 py-1 text-xs font-semibold transition active:scale-[0.96] ${
        active
          ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
          : 'border-stone-300 bg-white/80 text-stone-600 hover:border-stone-400 hover:bg-white'
      }`}
    >
      {children}
    </button>
  );
}

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/40 backdrop-blur-sm animate-fade-in sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-lift animate-fade-up sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag-handle affordance on the mobile bottom sheet */}
        <div className="flex justify-center pt-2.5 sm:hidden">
          <span className="h-1.5 w-10 rounded-full bg-stone-200" />
        </div>
        <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-4">
          <h2 className="font-display text-xl font-semibold tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-stone-400 transition hover:bg-stone-100 hover:text-stone-600 active:scale-90"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </div>
  );
}

export const inputCls =
  'w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-base font-semibold text-ink transition placeholder:font-medium placeholder:text-stone-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 sm:text-sm sm:py-2';

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-stone-500">{label}</span>
      {children}
    </label>
  );
}

export function Avatar({ name, sub = false }: { name: string; sub?: boolean }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-bold ring-1 ring-brand-200/70 ${
        sub ? 'h-7 w-7 text-[10px]' : 'h-9 w-9 text-xs'
      } bg-gradient-to-br from-brand-100 to-brand-200/60 text-brand-700`}
    >
      {initials}
    </div>
  );
}
