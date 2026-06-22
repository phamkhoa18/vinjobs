import DashboardLayout from '../../components/layout/DashboardLayout';

export default function ManageCategoriesPage() {
  return (
    <DashboardLayout role="content">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Quản lý danh mục</h1>
          <p className="text-text-secondary mt-1">Quản lý các danh mục bài viết trên blog.</p>
        </div>
        <button className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-dark transition-colors flex items-center gap-2">
          <span className="mi">add</span>
          Thêm danh mục
        </button>
      </div>
      <div className="bg-surface p-6 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-border-main">
        <p className="text-text-secondary">Quản lý danh mục đang được xây dựng...</p>
      </div>
    </DashboardLayout>
  );
}
