import { Link } from 'react-router-dom';

/**
 * Breadcrumb — Navigation breadcrumb component
 * @param {{ label: string, to?: string }[]} items
 */
export default function Breadcrumb({ items = [] }) {
  return (
    <nav className="flex items-center gap-1.5 text-[13px] mb-4 flex-wrap">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-[#d1d5db]">/</span>}
          {item.to ? (
            <Link to={item.to} className="text-primary hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className="text-[#6b7280]">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
