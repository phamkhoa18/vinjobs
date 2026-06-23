import Header from './Header';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children, role }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#f3f4f6]">
      <Header />
      <div className="container flex-1 flex flex-col lg:flex-row gap-8" style={{ paddingTop: '112px', paddingBottom: '48px' }}>
        <Sidebar role={role} />
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
