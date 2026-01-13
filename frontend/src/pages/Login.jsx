import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import {
    HiOutlineAcademicCap,
    HiOutlineBookOpen,
    HiOutlineEnvelope,
    HiOutlineLockClosed,
    HiOutlineHome,
    HiOutlineDocumentText,
    HiOutlineChatBubbleLeftRight,
    HiOutlineCalendar
} from 'react-icons/hi2';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login({ email, password });
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Left Panel - App Preview */}
            <div className="hidden lg:flex lg:w-[55%] bg-blue-50 p-8 flex-col relative overflow-hidden">
                {/* Logo */}
                <div className="flex items-center gap-3 mb-8 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-blue-900 flex items-center justify-center">
                        <HiOutlineAcademicCap className="w-6 h-6 text-white" />
                    </div>
                </div>

                {/* Main Heading */}
                <div className="relative z-10 mb-8">
                    <h1 className="text-4xl font-bold text-blue-900 mb-3">
                        Improve your Workflow
                    </h1>
                    <p className="text-slate-600 text-lg max-w-md">
                        Streamline your learning with EduLearn and make time for what really matters.
                    </p>
                </div>

                {/* App Preview Card */}
                <div className="relative z-10 flex-1 flex items-center justify-center">
                    <div className="bg-white rounded-3xl shadow-2xl p-1 max-w-2xl w-full transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                        <div className="bg-white rounded-2xl overflow-hidden">
                            {/* Preview Header */}
                            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                </div>
                            </div>
                            
                            {/* Preview Content */}
                            <div className="flex">
                                {/* Mini Sidebar */}
                                <div className="w-48 bg-white border-r border-slate-100 p-4">
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="w-8 h-8 rounded-lg bg-blue-900 flex items-center justify-center">
                                            <HiOutlineAcademicCap className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="font-bold text-blue-900 text-sm">EduLearn</span>
                                    </div>
                                    
                                    <nav className="space-y-1">
                                        <div className="flex items-center gap-2 px-3 py-2 bg-blue-900 text-white rounded-lg text-xs font-medium">
                                            <HiOutlineHome className="w-4 h-4" />
                                            Dashboard
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-2 text-slate-500 rounded-lg text-xs">
                                            <HiOutlineDocumentText className="w-4 h-4" />
                                            Documents
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-2 text-slate-500 rounded-lg text-xs">
                                            <HiOutlineBookOpen className="w-4 h-4" />
                                            Quizzes
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-2 text-slate-500 rounded-lg text-xs">
                                            <HiOutlineChatBubbleLeftRight className="w-4 h-4" />
                                            Messages
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-2 text-slate-500 rounded-lg text-xs">
                                            <HiOutlineCalendar className="w-4 h-4" />
                                            Schedule
                                        </div>
                                    </nav>
                                </div>
                                
                                {/* Mini Content */}
                                <div className="flex-1 p-4 bg-slate-50">
                                    <div className="text-sm font-semibold text-slate-800 mb-3">Your Lessons</div>
                                    <div className="space-y-2">
                                        {[
                                            { abbr: 'MA', name: 'Mathematics', color: 'bg-orange-500' },
                                            { abbr: 'CH', name: 'Chemistry', color: 'bg-blue-500' },
                                            { abbr: 'PH', name: 'Physics', color: 'bg-green-500' },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-3 p-2 bg-white rounded-lg">
                                                <div className={`w-8 h-8 ${item.color} rounded-lg flex items-center justify-center text-white text-xs font-bold`}>
                                                    {item.abbr}
                                                </div>
                                                <span className="text-xs text-slate-700">{item.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Background Decorations */}
                <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-10 w-48 h-48 bg-blue-300/20 rounded-full blur-2xl"></div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
                        <div className="w-12 h-12 rounded-xl bg-blue-900 flex items-center justify-center">
                            <HiOutlineAcademicCap className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-xl font-bold text-blue-900">EduLearn</span>
                    </div>

                    {/* Form Header */}
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-5">
                            <HiOutlineAcademicCap className="w-8 h-8 text-blue-900" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Welcome back!</h2>
                        <p className="text-slate-500 mt-2">
                            Please enter your email and password below
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            icon={<HiOutlineEnvelope className="w-5 h-5 text-slate-400" />}
                        />

                        <Input
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            icon={<HiOutlineLockClosed className="w-5 h-5 text-slate-400" />}
                        />

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500" />
                                <span className="text-slate-600">Remember Me</span>
                            </label>
                            <a href="#" className="text-blue-900 hover:text-blue-700 font-medium">
                                Reset Password
                            </a>
                        </div>

                        <Button type="submit" loading={loading} className="w-full mt-2">
                            Sign In
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-sm text-slate-500">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-blue-900 hover:text-blue-700 font-semibold">
                            Sign up
                        </Link>
                    </p>

                    <p className="mt-8 text-center text-xs text-slate-400">
                        © 2024 EduLearn - All Rights Reserved
                    </p>
                </div>
            </div>
        </div>
    );
}
