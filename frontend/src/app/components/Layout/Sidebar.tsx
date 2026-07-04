import React, { useState } from 'react';
import { Link } from 'react-router';
import { Menu, X } from 'lucide-react';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

interface SidebarProps {
  items: MenuItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ items }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-40 bg-primary-500 text-white p-3 rounded-full shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white pt-20
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static
          z-30 overflow-y-auto
        `}
      >
        <nav className="px-4 py-8 space-y-2">
          {items.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setIsOpen(false)}
              className="
                flex items-center gap-3 px-4 py-3 rounded-md
                hover:bg-slate-800 transition-colors
              "
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-20"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};