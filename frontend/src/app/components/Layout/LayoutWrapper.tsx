import React from 'react';
import { TopNav } from './TopNav';
import { Sidebar } from './Sidebar';
import { Home, Globe, BookOpen, Award, Map, Users, Settings, Heart } from 'lucide-react';

interface LayoutWrapperProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

const menuItems = [
  { icon: <Home size={20} />, label: 'Dashboard', href: '/dashboard' },
  { icon: <Globe size={20} />, label: 'Universities', href: '/universities' },
  { icon: <Award size={20} />, label: 'Recommendations', href: '/recommendations' },
  { icon: <Map size={20} />, label: 'Compare Countries', href: '/compare-countries' },
  { icon: <BookOpen size={20} />, label: 'Documents', href: '/documents' },
  { icon: <BookOpen size={20} />, label: 'SOP Generator', href: '/sop-generator' },
  { icon: <BookOpen size={20} />, label: 'LOR Generator', href: '/lor-generator' },
  { icon: <Users size={20} />, label: 'Resume Builder', href: '/resume-builder' },
  { icon: <Map size={20} />, label: 'Roadmap', href: '/roadmap' },
  { icon: <Users size={20} />, label: 'Visa Interview', href: '/visa-mock-interview' },
  { icon: <Settings size={20} />, label: 'Profile', href: '/profile' },
];

export const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ 
  children, 
  showSidebar = true 
}) => {
  return (
    <div className="flex h-screen bg-slate-50">
      {showSidebar && <Sidebar items={menuItems} />}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav />
        
        <main className="flex-1 overflow-auto pt-20">
          {children}
        </main>
      </div>
    </div>
  );
};