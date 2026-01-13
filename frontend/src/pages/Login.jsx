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

        // Email validation regex (production-grade)
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
             setError('Please enter a valid email address');
             return;
        }

        setLoading(true);

        try {
            await login({ email, password });
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Left Panel - App Preview */}
            <div className="hidden lg:flex lg:w-[55%] bg-blue-600 p-12 flex-col relative overflow-hidden items-center justify-center">
                
                {/* Background Pattern - Flat Circles instead of Gradients */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full border-[60px] border-white"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full border-[60px] border-white"></div>
                </div>

                <div className="relative z-10 text-center max-w-lg mb-12">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <HiOutlineAcademicCap className="w-10 h-10 text-white" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
                        Improve your Workflow
                    </h1>
                    <p className="text-blue-100 text-lg">
                        Streamline your learning with EduLearn and make time for what really matters.
                    </p>
                </div>

                {/* App Preview Card - Clean & Sharp */}
                <div className="relative z-10 w-full max-w-xl">
                    <div className="bg-white rounded-2xl shadow-xl p-2 transform rotate-[-3deg] hover:rotate-0 transition-transform duration-500 ease-out">
                         <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
                             {/* Mock Header */}
                            <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-slate-100">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                                </div>
                            </div>
                            
                            <div className="flex">
                                {/* Mock Sidebar */}
                                <div className="w-40 bg-white border-r border-slate-100 p-3 hidden sm:block">
                                    <div className="flex items-center gap-2 mb-4 px-2">
                                        <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
                                            <HiOutlineAcademicCap className="w-3.5 h-3.5 text-white" />
                                        </div>
                                        <span className="font-bold text-slate-800 text-xs">EduLearn</span>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="h-6 w-full bg-blue-50 rounded-md"></div>
                                        <div className="h-6 w-3/4 bg-white rounded-md"></div>
                                        <div className="h-6 w-5/6 bg-white rounded-md"></div>
                                    </div>
                                </div>
                                {/* Mock Content */}
                                <div className="flex-1 p-4">
                                     <div className="h-4 w-1/3 bg-slate-200 rounded mb-4"></div>
                                     <div className="grid grid-cols-2 gap-3">
                                         <div className="h-20 bg-white border border-slate-200 rounded-lg"></div>
                                         <div className="h-20 bg-white border border-slate-200 rounded-lg"></div>
                                     </div>
                                </div>
                            </div>
                         </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                            <HiOutlineAcademicCap className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-slate-900">EduLearn</span>
                    </div>

                    {/* Form Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
                        <p className="text-slate-500 mt-2">
                            Enter your credentials to access your account
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@company.com"
                            required
                            icon={<HiOutlineEnvelope className="w-5 h-5 text-slate-400" />}
                        />

                        <div>
                            <Input
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                                icon={<HiOutlineLockClosed className="w-5 h-5 text-slate-400" />}
                            />
                            <div className="flex justify-end mt-1">
                                <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                                    Forgot password?
                                </a>
                            </div>
                        </div>

                        <Button type="submit" loading={loading} className="w-full py-3">
                            Sign In
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-sm text-slate-500">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
                            Create account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
