import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { MobileNav } from './MobileNav';

export function AppLayout() {
  return (
    <div className="flex h-[100dvh] bg-background text-foreground">
      <div className="hidden md:block">
        <AppSidebar />
      </div>
      <main className="min-h-0 min-w-0 flex-1 overflow-auto pb-16 md:pb-0">
        <Outlet />
      </main>
      <MobileNav />
    </div>
  );
}
