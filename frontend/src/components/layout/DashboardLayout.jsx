import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    HiOutlineHome,        HiHome,
    HiOutlineDocumentText, HiDocumentText,
    HiOutlineBookOpen,    HiBookOpen,
    HiOutlineChartBar,    HiChartBar,
    HiOutlineAcademicCap,
    HiOutlineBars3,
    HiOutlineXMark,
    HiOutlineArrowRightOnRectangle,
    HiOutlineMagnifyingGlass,
    HiOutlineBell,
    HiOutlineUser,
    HiOutlineCog6Tooth,
    HiOutlineBookmark
} from 'react-icons/hi2';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function DashboardLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, user } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        { label: 'Home', path: '/dashboard', icon: HiOutlineHome, activeIcon: HiHome },
        { label: 'Documents', path: '/documents', icon: HiOutlineDocumentText, activeIcon: HiDocumentText },
        { label: 'Quizzes', path: '/quizzes', icon: HiOutlineBookOpen, activeIcon: HiBookOpen },
        { label: 'Progress', path: '/progress', icon: HiOutlineChartBar, activeIcon: HiChartBar },
    ];

    const isActive = (path) => {
        if (path === '/dashboard') return location.pathname === '/dashboard' || location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Mobile Header */}
            <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                        <HiOutlineAcademicCap className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-slate-900 text-lg">EduLearn</span>
                </div>
                <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                    <HiOutlineBars3 className="w-6 h-6" />
                </button>
            </header>

            <div className="flex-1 flex layout-container w-full">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col sticky top-0 h-screen overflow-y-auto">
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
                                <HiOutlineAcademicCap className="w-5 h-5" />
                            </div>
                            <span className="text-xl font-bold text-slate-900 tracking-tight">EduLearn</span>
                        </div>

                        <nav className="space-y-1">
                            {navItems.map((item) => {
                                const active = isActive(item.path);
                                const Icon = active ? item.activeIcon : item.icon;
                                return (
                                    <button
                                        key={item.path}
                                        onClick={() => navigate(item.path)}
                                        className={`
                                            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                                            ${active ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                                        `}
                                    >
                                        <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                                        {item.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="mt-auto p-4 border-t border-slate-100 space-y-1">
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                            <HiOutlineArrowRightOnRectangle className="w-5 h-5" /> Sign Out
                        </button>
                    </div>
                </aside>

                {/* Mobile Menu Overlay */}
                {mobileMenuOpen && (
                    <div className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
                )}

                {/* Mobile Sidebar Content */}
                <aside className={`fixed inset-y-0 left-0 w-64 bg-white z-50 transform transition-transform duration-200 lg:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="flex items-center justify-between p-4 border-b border-slate-100">
                        <span className="font-bold text-lg">Menu</span>
                        <button onClick={() => setMobileMenuOpen(false)}><HiOutlineXMark className="w-6 h-6 text-slate-500" /></button>
                    </div>
                    <nav className="p-4 space-y-1">
                        {navItems.map((item) => (
                            <button
                                key={item.path}
                                onClick={() => { navigate(item.path); setMobileMenuOpen(false); }}
                                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium mb-1 ${isActive(item.path) ? 'bg-blue-50 text-blue-700' : 'text-slate-600'}`}
                            >
                                <item.icon className="w-5 h-5" /> {item.label}
                            </button>
                        ))}
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-red-600 mt-4">
                             <HiOutlineArrowRightOnRectangle className="w-5 h-5" /> Sign Out
                        </button>
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 min-w-0 bg-slate-50">
                    <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3 flex items-center justify-between">
                        {/* Search */}
                        <div className="hidden md:flex items-center max-w-md w-full relative">
                            <HiOutlineMagnifyingGlass className="absolute left-3 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent rounded-lg text-sm focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            />
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-4 ml-auto">
                            <button className="relative p-2 text-slate-500 hover:text-slate-700 transition-colors">
                                <HiOutlineBell className="w-6 h-6" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                            </button>
                            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-medium text-slate-900 leading-none">{user?.name || 'User'}</p>
                                    <p className="text-xs text-slate-500 mt-1">Student</p>
                                </div>
                                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium">
                                    {user?.name?.[0] || 'U'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 max-w-7xl mx-auto w-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
