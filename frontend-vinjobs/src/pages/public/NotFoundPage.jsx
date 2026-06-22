import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f0f4f8] p-8">
      <div className="text-center">
        <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <span className="mi text-[48px] text-primary">search_off</span>
        </div>
        <h1 className="text-[32px] font-black text-[#111827] mb-2">404</h1>
        <p className="text-[16px] text-[#6b7280] mb-6">Trang bạn tìm không tồn tại</p>
        <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-blue-700 transition-all">
          <span className="mi">home</span> Về trang chủ
        </Link>
      </div>
    </div>
  );
}
