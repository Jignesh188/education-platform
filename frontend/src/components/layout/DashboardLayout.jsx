import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    HiOutlineHome,
    HiHome,
    HiOutlineDocumentText,
    HiDocumentText,
    HiOutlineBookOpen,
    HiBookOpen,
    HiOutlineChartBar,
    HiChartBar,
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
        {
            label: 'Home',
            path: '/dashboard',
            icon: HiOutlineHome,
            activeIcon: HiHome
        },
        {
            label: 'Documents',
            path: '/documents',
            icon: HiOutlineDocumentText,
            activeIcon: HiDocumentText
        },
        {
            label: 'Quizzes',
            path: '/quizzes',
            icon: HiOutlineBookOpen,
            activeIcon: HiBookOpen
        },
        {
            label: 'Bookmarks',
            path: '/bookmarks',
            icon: HiOutlineBookmark,
            activeIcon: HiOutlineBookmark
        },
        {
            label: 'Progress',
            path: '/progress',
            icon: HiOutlineChartBar,
            activeIcon: HiChartBar
        },
    ];

    const isActive = (path) => {
        if (path === '/dashboard') {
            return location.pathname === '/dashboard' || location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:flex w-64 bg-white flex-col fixed left-0 top-0 h-screen z-50 border-r border-slate-100">
                {/* Logo */}
                <div className="flex items-center gap-3 px-6 py-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-900 flex items-center justify-center">
                        <HiOutlineAcademicCap className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold text-blue-900">EduLearn</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-4">
                    <ul className="space-y-1">
                        {navItems.map((item) => {
                            const active = isActive(item.path);
                            const Icon = active ? item.activeIcon : item.icon;
                            return (
                                <li key={item.path}>
                                    <button
                                        onClick={() => navigate(item.path)}
                                        className={`
                                            w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-[15px] transition-all
                                            ${active
                                                ? 'bg-blue-900 text-white shadow-lg shadow-blue-900/20'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-blue-900'
                                            }
                                        `}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {item.label}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Settings & Logout */}
                <div className="px-4 pb-6 space-y-1">
                    <button
                        onClick={() => {}}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-[15px] text-slate-600 hover:bg-slate-50 hover:text-blue-900 transition-all"
                    >
                        <HiOutlineCog6Tooth className="w-5 h-5" />
                        Settings
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-[15px] text-red-600 hover:bg-red-50 transition-all"
                    >
                        <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-slate-900/50 z-40"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside className={`
                lg:hidden fixed left-0 top-0 h-screen w-64 bg-white z-50 transform transition-transform duration-300 border-r border-slate-100
                ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Logo */}
                <div className="flex items-center justify-between px-6 py-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-900 flex items-center justify-center">
                            <HiOutlineAcademicCap className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-blue-900">EduLearn</span>
                    </div>
                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <HiOutlineXMark className="w-5 h-5 text-slate-600" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-4">
                    <ul className="space-y-1">
                        {navItems.map((item) => {
                            const active = isActive(item.path);
                            const Icon = active ? item.activeIcon : item.icon;
                            return (
                                <li key={item.path}>
                                    <button
                                        onClick={() => {
                                            navigate(item.path);
                                            setMobileMenuOpen(false);
                                        }}
                                        className={`
                                            w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-[15px] transition-all
                                            ${active
                                                ? 'bg-blue-900 text-white shadow-lg shadow-blue-900/20'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-blue-900'
                                            }
                                        `}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {item.label}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Logout */}
                <div className="absolute bottom-0 left-0 right-0 px-4 pb-6">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-[15px] text-red-600 hover:bg-red-50 transition-all"
                    >
                        <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-64">
                {/* Top Header */}
                <header className="bg-white border-b border-slate-100 sticky top-0 z-30">
                    <div className="px-6 py-4 flex items-center justify-between">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            <HiOutlineBars3 className="w-6 h-6 text-slate-600" />
                        </button>

                        {/* Search Bar */}
                        <div className="flex-1 max-w-xl mx-4 hidden md:block">
                            <div className="relative">
                                <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search Courses, Documents, Activities..."
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* Right Section */}
                        <div className="flex items-center gap-4">
                            <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors relative">
                                <HiOutlineBell className="w-6 h-6 text-slate-500" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full"></span>
                            </button>

                            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                    <HiOutlineUser className="w-5 h-5 text-blue-900" />
                                </div>
                                <div className="hidden sm:block">
                                    <p className="text-sm font-semibold text-slate-800">
                                        {user?.name || 'User'}
                                    </p>
                                    <p className="text-xs text-slate-500">Student</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <Outlet />
            </main>
        </div>
    );
}
