import Header from './Header';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children, role }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#f3f4f6]">
      <Header />
      <div className="container flex-1 pt-[112px] flex flex-col lg:flex-row gap-8 !pb-12">
        <Sidebar role={role} />
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
