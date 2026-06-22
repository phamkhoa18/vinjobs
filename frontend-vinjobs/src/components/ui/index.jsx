/**
 * VinJobs UI Components
 * =====================
 * Bộ component dùng lại toàn app — style đồng nhất, không cần antd.
 *
 * Export: Button, Input, Card, Badge, Spinner, Alert, Divider, Avatar
 */

import { forwardRef } from 'react';

// ─── Button ──────────────────────────────────────────────────────────────────
/**
 * @param {'primary'|'secondary'|'outline'|'ghost'|'danger'} variant
 * @param {'sm'|'md'|'lg'} size
 * @param {string} icon — Material icon name (optional, shown before text)
 * @param {string} iconRight — Material icon name (optional, shown after text)
 * @param {boolean} loading
 * @param {boolean} block — full width
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  block = false,
  className = '',
  disabled,
  ...props
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40';

  const variants = {
    primary: 'bg-primary text-white hover:bg-blue-700 shadow-[0_2px_8px_rgba(54,116,197,0.25)] hover:shadow-[0_4px_12px_rgba(54,116,197,0.35)]',
    secondary: 'bg-[#f3f4f6] text-[#374151] hover:bg-[#e5e7eb]',
    outline: 'border border-[#e5e7eb] bg-white text-[#374151] hover:border-primary hover:text-primary',
    ghost: 'bg-transparent text-[#374151] hover:bg-[#f3f4f6]',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    dark: 'bg-[#111827] text-white hover:bg-[#1f2937]',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-[0_2px_8px_rgba(5,150,105,0.25)]',
  };

  const sizes = {
    xs: 'px-3 py-1.5 text-[12px]',
    sm: 'px-4 py-2 text-[13px]',
    md: 'px-5 py-2.5 text-[14px]',
    lg: 'px-6 py-3.5 text-[15px]',
    xl: 'px-8 py-4 text-[16px]',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${block ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin shrink-0" />
      ) : icon ? (
        <span className="mi text-[18px] shrink-0">{icon}</span>
      ) : null}
      {children}
      {!loading && iconRight && (
        <span className="mi text-[18px] shrink-0">{iconRight}</span>
      )}
    </button>
  );
}

// ─── Input ───────────────────────────────────────────────────────────────────
/**
 * @param {string} label
 * @param {string} error
 * @param {string} prefix — Material icon name shown on left
 * @param {React.ReactNode} suffix — element shown on right
 * @param {'sm'|'md'|'lg'} size
 */
export const Input = forwardRef(function Input({
  label,
  error,
  prefix,
  suffix,
  size = 'md',
  className = '',
  ...props
}, ref) {
  const sizes = {
    sm: 'py-2 text-[13px]',
    md: 'py-3 text-[14px]',
    lg: 'py-3.5 text-[15px]',
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {prefix && (
          <span className="mi absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-[#9ca3af] pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          className={`
            w-full border rounded-xl bg-white text-[#111827] placeholder:text-[#9ca3af]
            focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10
            transition-all
            ${sizes[size] || sizes.md}
            ${prefix ? 'pl-11' : 'pl-4'}
            ${suffix ? 'pr-11' : 'pr-4'}
            ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-[#e5e7eb]'}
            ${className}
          `}
          {...props}
        />
        {suffix && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            {suffix}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-[12px] text-red-500 flex items-center gap-1">
          <span className="mi text-[14px]">error</span>
          {error}
        </p>
      )}
    </div>
  );
});

// ─── Card ────────────────────────────────────────────────────────────────────
export function Card({ children, className = '', padding = 'md', ...props }) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  return (
    <div
      className={`bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] border border-[#f3f4f6] ${paddings[padding] || paddings.md} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── Badge ───────────────────────────────────────────────────────────────────
/**
 * @param {'blue'|'green'|'red'|'yellow'|'gray'|'purple'} color
 * @param {'sm'|'md'} size
 */
export function Badge({ children, color = 'blue', size = 'sm', className = '', ...props }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    yellow: 'bg-amber-50 text-amber-700 border-amber-200',
    gray: 'bg-[#f3f4f6] text-[#6b7280] border-[#e5e7eb]',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  };
  const sizes = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-[12px] px-2.5 py-1',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full border ${colors[color] || colors.blue} ${sizes[size] || sizes.sm} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

// ─── Spinner ─────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-6 h-6 border-2', lg: 'w-10 h-10 border-3', xl: 'w-14 h-14 border-4' };
  return (
    <span className={`inline-block rounded-full border-[#e5e7eb] border-t-primary animate-spin ${sizes[size] || sizes.md} ${className}`} />
  );
}

// ─── Alert ───────────────────────────────────────────────────────────────────
/**
 * @param {'info'|'success'|'warning'|'error'} type
 */
export function Alert({ children, type = 'info', className = '' }) {
  const types = {
    info: { bg: 'bg-blue-50 border-blue-200 text-blue-800', icon: 'info' },
    success: { bg: 'bg-emerald-50 border-emerald-200 text-emerald-800', icon: 'check_circle' },
    warning: { bg: 'bg-amber-50 border-amber-200 text-amber-800', icon: 'warning' },
    error: { bg: 'bg-red-50 border-red-200 text-red-700', icon: 'error' },
  };
  const t = types[type] || types.info;
  return (
    <div className={`flex items-start gap-2.5 p-3.5 border rounded-xl ${t.bg} ${className}`}>
      <span className="mi text-[18px] shrink-0 mt-0.5">{t.icon}</span>
      <div className="text-[13px] font-medium leading-relaxed">{children}</div>
    </div>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────
export function Divider({ label, className = '' }) {
  if (!label) return <hr className={`border-[#e5e7eb] ${className}`} />;
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex-1 h-px bg-[#e5e7eb]" />
      <span className="text-[12px] text-[#9ca3af] font-medium uppercase tracking-wide">{label}</span>
      <div className="flex-1 h-px bg-[#e5e7eb]" />
    </div>
  );
}

// ─── Avatar ──────────────────────────────────────────────────────────────────
export function Avatar({ src, name, size = 'md', className = '' }) {
  const sizes = { xs: 'w-6 h-6 text-[10px]', sm: 'w-8 h-8 text-[12px]', md: 'w-10 h-10 text-[14px]', lg: 'w-12 h-12 text-[16px]', xl: 'w-16 h-16 text-[20px]' };
  const initials = name ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : '?';
  return (
    <div className={`rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0 ${sizes[size] || sizes.md} ${className}`}>
      {src ? (
        <img src={src} alt={name || ''} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
      ) : (
        <span className="font-bold text-primary">{initials}</span>
      )}
    </div>
  );
}

// ─── IconButton ──────────────────────────────────────────────────────────────
export function IconButton({ icon, label, size = 'md', variant = 'ghost', className = '', ...props }) {
  const sizes = { sm: 'w-7 h-7 text-[16px]', md: 'w-9 h-9 text-[20px]', lg: 'w-11 h-11 text-[22px]' };
  const variants = {
    ghost: 'hover:bg-[#f3f4f6] text-[#6b7280] hover:text-[#374151]',
    primary: 'hover:bg-primary/10 text-primary',
    danger: 'hover:bg-red-50 text-[#6b7280] hover:text-red-500',
  };
  return (
    <button
      aria-label={label}
      title={label}
      className={`flex items-center justify-center rounded-full transition-all ${sizes[size] || sizes.md} ${variants[variant] || variants.ghost} ${className}`}
      {...props}
    >
      <span className="mi">{icon}</span>
    </button>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────
export function Empty({ icon = 'inbox', title = 'Không có dữ liệu', description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-[#f3f4f6] rounded-2xl flex items-center justify-center mb-4">
        <span className="mi text-[32px] text-[#9ca3af]">{icon}</span>
      </div>
      <h3 className="text-[15px] font-bold text-[#374151] mb-1">{title}</h3>
      {description && <p className="text-[13px] text-[#9ca3af] mb-4">{description}</p>}
      {action}
    </div>
  );
}

// ─── Loading Page ─────────────────────────────────────────────────────────────
export function PageLoading({ text = 'Đang tải...' }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#f8fafc]">
      <Spinner size="lg" />
      <p className="text-[13px] text-[#6b7280] font-medium">{text}</p>
    </div>
  );
}
