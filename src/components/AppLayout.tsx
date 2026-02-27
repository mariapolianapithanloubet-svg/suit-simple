import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  Plus,
  Users,
  Scale,
  ChevronRight,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navItems = [
  { label: 'Painel', path: '/', icon: LayoutDashboard },
  { label: 'Processos', path: '/processos', icon: FolderOpen },
  { label: 'Novo Processo', path: '/processos/novo', icon: Plus },
  { label: 'Clientes', path: '/clientes', icon: Users },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <aside className="hidden md:flex w-56 flex-col bg-sidebar fixed inset-y-0 left-0 z-30">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gold/15">
            <Scale className="h-4 w-4 text-gold" />
          </div>
          <div>
            <h1 className="font-display text-base font-bold text-sidebar-primary tracking-tight">
              JuriControl
            </h1>
            <p className="text-[9px] tracking-[0.2em] uppercase text-sidebar-foreground/40 font-medium">
              Gestão Processual
            </p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-0.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground'
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {item.label}
                {isActive && <ChevronRight className="ml-auto h-3 w-3 opacity-50" />}
              </Link>
            );
          })}
        </nav>

        <div className="px-5 py-4">
          <p className="text-[10px] text-sidebar-foreground/30 font-medium">
            © 2026 JuriControl
          </p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 md:ml-56">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-sidebar border-b border-sidebar-border sticky top-0 z-40">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-gold" />
            <h1 className="font-display text-sm font-bold text-sidebar-primary">JuriControl</h1>
          </div>
        </header>

        {/* Mobile nav dropdown */}
        {mobileOpen && (
          <div className="md:hidden bg-sidebar border-b border-sidebar-border px-3 py-2 space-y-0.5">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors',
                  location.pathname === item.path
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/40'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </div>
        )}

        <main className="flex-1 p-5 md:p-8 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
