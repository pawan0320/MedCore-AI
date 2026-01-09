import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Activity, 
  Calendar, 
  MessageSquare, 
  AlertCircle, 
  User as UserIcon, 
  LogOut, 
  LayoutDashboard,
  Bell,
  Menu,
  X,
  FileText,
  Video,
  ClipboardList
} from 'lucide-react';
import { Role, User, UserStatus } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  userRole: Role;
  user: User;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, userRole, user, onLogout }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path 
    ? "bg-blue-600 text-white shadow-md" 
    : "text-slate-300 hover:bg-slate-800 hover:text-white";

  const isPending = user.status === UserStatus.PENDING;

  // Render Sidebar Links based on Role Specification
  const NavLinks = () => (
    <div className="space-y-2">
      
      {/* GLOBAL LINKS */}
      {!isPending && (
         <Link to="/ai-assistant" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/ai-assistant')}`}>
            <MessageSquare className="h-5 w-5" />
            <span>AI Assistant</span>
          </Link>
      )}

      {/* ADMIN & DOCTOR DASHBOARD */}
      {(userRole === Role.DOCTOR || userRole === Role.ADMIN) && (
          <Link to="/dashboard" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/dashboard')}`}>
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
      )}

      {/* APPOINTMENTS & SCHEDULE */}
      {!isPending && (
        <Link to="/booking" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/booking')}`}>
          <Calendar className="h-5 w-5" />
          <span>{userRole === Role.DOCTOR ? 'My Schedule' : 'Book Appointment'}</span>
        </Link>
      )}

      {/* PATIENT: MEDICAL RECORDS */}
      {userRole === Role.PATIENT && (
        <Link to="/records" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/records')}`}>
          <FileText className="h-5 w-5" />
          <span>Medical Records</span>
        </Link>
      )}

      {/* DOCTOR: PATIENT RECORDS */}
      {userRole === Role.DOCTOR && !isPending && (
        <Link to="/records" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/records')}`}>
          <ClipboardList className="h-5 w-5" />
          <span>Patient Records</span>
        </Link>
      )}

      {/* EMERGENCY MODE */}
      {(userRole === Role.PATIENT || userRole === Role.ADMIN) && (
        <Link to="/emergency" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/emergency')}`}>
          <AlertCircle className="h-5 w-5" />
          <span>Emergency</span>
        </Link>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar (Desktop) */}
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col shadow-xl z-20">
        <div className="p-6 flex items-center space-x-3 border-b border-slate-700">
          <div className="bg-blue-600 p-2 rounded-lg">
             <Activity className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">MediCore</span>
        </div>

        <nav className="flex-1 p-4">
           <NavLinks />
        </nav>

        <div className="p-4 border-t border-slate-700 bg-slate-800/50">
          <div className="flex items-center space-x-3">
             <div className="h-10 w-10 rounded-full bg-slate-600 flex items-center justify-center overflow-hidden border-2 border-slate-500">
                {user.avatar ? (
                    <img src={user.avatar} alt="User" className="w-full h-full object-cover"/>
                ) : (
                    <UserIcon className="h-5 w-5 text-white" />
                )}
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-sm font-semibold text-white truncate">{user.name}</p>
               <p className="text-xs text-slate-400 truncate capitalize">{userRole.toLowerCase()}</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="w-64 bg-slate-900 h-full p-4 flex flex-col" onClick={(e) => e.stopPropagation()}>
             <div className="flex justify-between items-center mb-6">
                <span className="text-xl font-bold text-white flex items-center gap-2">
                   <Activity className="text-blue-500" /> MediCore
                </span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400">
                   <X />
                </button>
             </div>
             <NavLinks />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-8 z-10">
           <div className="flex items-center gap-4">
              <button className="md:hidden text-slate-500 hover:text-blue-600" onClick={() => setMobileMenuOpen(true)}>
                 <Menu />
              </button>
              <h2 className="text-lg font-semibold text-slate-700 hidden md:block">
                 {location.pathname.startsWith('/video-call') ? 'Live Consultation' :
                  location.pathname === '/' ? 'Dashboard' : 
                  location.pathname.split('/')[1].charAt(0).toUpperCase() + location.pathname.split('/')[1].slice(1).replace('-', ' ')}
              </h2>
           </div>

           <div className="flex items-center gap-4">
              <button className="p-2 text-slate-400 hover:text-blue-600 relative">
                 <Bell size={20} />
                 <span className="absolute top-1.5 right-2 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
              </button>
              
              <div className="relative">
                 <button 
                   onClick={() => setProfileOpen(!profileOpen)}
                   className="flex items-center gap-2 hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
                 >
                    <div className="h-8 w-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                       {user.name.charAt(0)}
                    </div>
                 </button>
                 
                 {profileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-100 py-1 animate-in fade-in zoom-in-95 duration-200">
                       <div className="px-4 py-2 border-b border-slate-50">
                          <p className="text-sm font-medium text-slate-900">Signed in as</p>
                          <p className="text-sm text-slate-500 truncate">{user.email}</p>
                       </div>
                       <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                          Profile Settings
                       </button>
                       <button 
                          onClick={onLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <LogOut size={14} /> Sign out
                       </button>
                    </div>
                 )}
                 {profileOpen && <div className="fixed inset-0 z-[-1]" onClick={() => setProfileOpen(false)}></div>}
              </div>
           </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8 bg-slate-50">
           {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;