import React from 'react';
import { Link } from 'react-router';
import { Bell, User, Search } from 'lucide-react';

export const TopNav: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-50">
      <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-500 rounded-lg" />
          <span className="font-bold text-primary-500 hidden sm:inline">StudyAbroad</span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-md mx-8 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search universities, programs..."
              className="
                w-full pl-10 pr-4 py-2 rounded-md border border-slate-200
                focus:outline-none focus:ring-2 focus:ring-primary-500
              "
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-slate-100 rounded-md transition-colors">
            <Bell size={20} className="text-slate-600" />
          </button>
          <button className="p-2 hover:bg-slate-100 rounded-md transition-colors">
            <User size={20} className="text-slate-600" />
          </button>
        </div>
      </div>
    </header>
  );
};