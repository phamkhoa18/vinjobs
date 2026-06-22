import { Link } from 'react-router-dom';

/**
 * EmptyState — Reusable empty state with icon, title, description and CTA
 * @param {string} icon — Material icon name
 * @param {string} title
 * @param {string} description
 * @param {string} ctaLabel
 * @param {string} ctaLink
 * @param {string} ctaColor — Tailwind bg class or hex color
 */
export default function EmptyState({
  icon = 'inbox',
  title = 'Không có dữ liệu',
  description,
  ctaLabel,
  ctaLink,
  ctaColor = 'bg-[#f59e0b] hover:bg-amber-600',
}) {
  return (
    <div className="bg-white rounded-xl border border-[#e5e7eb] py-16 px-8 flex flex-col items-center justify-center text-center">
      <div className="w-20 h-20 rounded-full bg-[#f3f4f6] flex items-center justify-center mb-6">
        <span className="mi text-[40px] text-[#d1d5db]">{icon}</span>
      </div>
      <h2 className="text-[16px] font-bold text-[#111827] mb-2">{title}</h2>
      {description && (
        <p className="text-[14px] text-[#6b7280] leading-relaxed whitespace-pre-line mb-6 max-w-[400px]">
          {description}
        </p>
      )}
      {ctaLabel && ctaLink && (
        <Link
          to={ctaLink}
          className={`inline-flex items-center gap-2 px-6 py-3 text-white font-bold text-[14px] rounded-lg transition-all shadow-sm hover:shadow-md ${ctaColor}`}
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
