import DashboardLayout from '../../components/layout/DashboardLayout';

export default function ManagePostsPage() {
  return (
    <DashboardLayout role="content">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Quản lý bài viết</h1>
          <p className="text-text-secondary mt-1">Viết bài, duyệt bài, sửa xóa tin tức và blog hướng nghiệp.</p>
        </div>
        <button className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-dark transition-colors flex items-center gap-2">
          <span className="mi">edit</span>
          Viết bài mới
        </button>
      </div>
      <div className="bg-surface p-6 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-border-main">
        <p className="text-text-secondary">Quản lý bài viết đang được xây dựng...</p>
      </div>
    </DashboardLayout>
  );
}
