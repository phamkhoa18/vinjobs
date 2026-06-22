/**
 * PageTabs — Reusable tab bar for page-level filtering
 * @param {{ key: string, label: string }[]} tabs
 * @param {string} activeTab
 * @param {(key: string) => void} onTabChange
 */
export default function PageTabs({ tabs = [], activeTab, onTabChange }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all whitespace-nowrap
            ${activeTab === tab.key
              ? 'bg-[#111827] text-white'
              : 'bg-white text-[#374151] border border-[#e5e7eb] hover:border-[#9ca3af]'
            }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
