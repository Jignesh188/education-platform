import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/common/Loader';
import { progressAPI } from '../api/progress';
import { documentsAPI } from '../api/documents';
import { quizAPI } from '../api/quiz';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import {
    HiOutlineDocumentText,
    HiOutlineBookOpen,
    HiOutlineTrophy,
    HiOutlineChartBar,
    HiOutlineArrowRight,
    HiOutlineFire,
    HiOutlineCloudArrowUp,
    HiOutlinePlayCircle,
    HiOutlineCalendar,
    HiOutlineClock,
    HiOutlinePaperClip,
    HiOutlinePhoto,
    HiOutlineChevronRight,
    HiOutlineSparkles
} from 'react-icons/hi2';

// Circular Progress Component
function CircularProgress({ percentage, size = 48, strokeWidth = 4 }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="circular-progress" style={{ width: size, height: size }}>
            <svg width={size} height={size}>
                <circle
                    stroke="#e2e8f0"
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                <circle
                    stroke="#1e40af"
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
            </svg>
            <span className="circular-progress-value">{percentage}%</span>
        </div>
    );
}

export default function Dashboard() {
    const [overview, setOverview] = useState(null);
    const [recentDocs, setRecentDocs] = useState([]);
    const [recentResults, setRecentResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [overviewData, docsData, resultsData] = await Promise.all([
                progressAPI.getOverview(),
                documentsAPI.list(1, 4),
                quizAPI.listResults()
            ]);

            setOverview(overviewData);
            setRecentDocs(docsData.documents || []);
            setRecentResults((resultsData.results || []).slice(0, 5));
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader text="Loading dashboard..." />
            </div>
        );
    }

    // Sample chart data
    const chartData = [
        { name: '1', value: 2.8 },
        { name: '2', value: 2.0 },
        { name: '3', value: 3.5 },
        { name: '4', value: 2.8 },
    ];

    // Course completion data
    const completionData = [
        { name: 'Life Contingency', chapter: 'Chapter 3', progress: 75, color: 'bg-blue-500' },
        { name: 'Social Insurance', chapter: 'Chapter 4', progress: 91, color: 'bg-green-500' },
        { name: 'Advanced Maths', chapter: 'Module 2', progress: 25, color: 'bg-yellow-500' },
        { name: 'Pension', chapter: 'Chapter 5', progress: 97, color: 'bg-orange-500' },
    ];

    // Upcoming activities
    const upcomingActivities = [
        { date: 8, month: 'July', title: 'Life Contingency Tutorials', time: '8 A.M - 9 A.M', location: 'Tutorial College', color: 'bg-blue-500' },
        { date: 13, month: 'July', title: 'Social Insurance Test', time: '8 A.M - 9 A.M', location: 'School Hall', color: 'bg-yellow-500' },
        { date: 18, month: 'July', title: 'Adv. Maths Assignment Due', time: '8 A.M - 9 A.M', location: 'Submit via Email', color: 'bg-green-500' },
        { date: 23, month: 'July', title: "Quiz Review Session", time: '10 A.M - 1 P.M', location: 'Tutorial College', color: 'bg-red-500' },
    ];

    // Top performers
    const topPerformers = [
        { name: 'Joshua Ashiru', points: '9.6/10', color: 'bg-orange-500' },
        { name: 'Adeola Ayo', points: '9/10', color: 'bg-green-500' },
        { name: 'Olawuyi Tobi', points: '8.5/10', color: 'bg-yellow-500' },
        { name: 'Mayowa Ade', points: '7/10', color: 'bg-pink-500' },
    ];

    return (
        <div className="p-6 flex gap-6">
            {/* Main Content */}
            <div className="flex-1 space-y-6">
                {/* Top Row - Performance & Completion */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Performance Chart */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-800">Performance</h2>
                            <select className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-100">
                                <option>Overall</option>
                                <option>This Week</option>
                                <option>This Month</option>
                            </select>
                        </div>
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#94a3b8" />
                                <YAxis axisLine={false} tickLine={false} stroke="#94a3b8" domain={[0, 4]} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    fill="url(#colorValue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Completion Progress */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h2 className="text-lg font-bold text-slate-800 mb-6">Completion Progress</h2>
                        <div className="space-y-4">
                            {completionData.map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-slate-800 text-sm">{item.name}</p>
                                        <p className="text-xs text-slate-500">{item.chapter}</p>
                                    </div>
                                    <CircularProgress percentage={item.progress} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Row - Messages & Top Performers */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Messages / Recent Documents */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-800">Recent Documents</h2>
                            <button
                                onClick={() => navigate('/documents')}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                View All
                            </button>
                        </div>
                        <div className="space-y-4">
                            {recentDocs.length > 0 ? recentDocs.slice(0, 3).map((doc) => (
                                <div
                                    key={doc.id}
                                    className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                                    onClick={() => navigate(`/documents/${doc.id}`)}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                        doc.file_type === 'pdf' ? 'bg-red-100 text-red-600' :
                                        doc.file_type === 'image' ? 'bg-blue-100 text-blue-600' :
                                        'bg-green-100 text-green-600'
                                    }`}>
                                        {doc.file_type === 'image' ? (
                                            <HiOutlinePhoto className="w-5 h-5" />
                                        ) : (
                                            <HiOutlineDocumentText className="w-5 h-5" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-800 text-sm truncate">{doc.title}</p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {doc.processing_status === 'completed' ? 'Ready' : doc.processing_status}
                                        </p>
                                    </div>
                                    <span className="text-xs text-slate-400">
                                        {new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                            )) : (
                                <div className="text-center py-8">
                                    <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                                        <HiOutlineDocumentText className="w-7 h-7 text-slate-400" />
                                    </div>
                                    <p className="text-sm text-slate-500">No documents yet</p>
                                    <button
                                        onClick={() => navigate('/documents')}
                                        className="mt-3 text-sm text-blue-600 font-medium hover:text-blue-700"
                                    >
                                        Upload your first document
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Top Performing / Quiz Results */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h2 className="text-lg font-bold text-slate-800 mb-6">Recent Quiz Results</h2>
                        <div className="space-y-3">
                            {recentResults.length > 0 ? recentResults.slice(0, 4).map((result, index) => (
                                <div
                                    key={result.id}
                                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                                    onClick={() => navigate(`/results/${result.id}`)}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold ${
                                        result.score_percentage >= 80 ? 'bg-green-500' :
                                        result.score_percentage >= 60 ? 'bg-yellow-500' :
                                        'bg-red-500'
                                    }`}>
                                        {result.quiz_title.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-800 text-sm truncate">{result.quiz_title}</p>
                                        <p className="text-xs text-slate-500">{result.score_percentage}% Score</p>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        result.score_percentage >= 80 ? 'bg-green-100 text-green-700' :
                                        result.score_percentage >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                        {result.correct_answers}/{result.total_questions}
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-8">
                                    <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                                        <HiOutlineTrophy className="w-7 h-7 text-slate-400" />
                                    </div>
                                    <p className="text-sm text-slate-500">No quiz results yet</p>
                                    <button
                                        onClick={() => navigate('/quizzes')}
                                        className="mt-3 text-sm text-blue-600 font-medium hover:text-blue-700"
                                    >
                                        Take your first quiz
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Sidebar - Upcoming Activities */}
            <div className="hidden xl:block w-80">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 sticky top-24">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-800">Quick Stats</h2>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-blue-50 rounded-xl p-4 text-center">
                            <HiOutlineDocumentText className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-slate-800">{overview?.total_documents || 0}</p>
                            <p className="text-xs text-slate-500">Documents</p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-4 text-center">
                            <HiOutlineBookOpen className="w-6 h-6 text-green-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-slate-800">{overview?.total_quizzes_taken || 0}</p>
                            <p className="text-xs text-slate-500">Quizzes</p>
                        </div>
                        <div className="bg-yellow-50 rounded-xl p-4 text-center">
                            <HiOutlineChartBar className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-slate-800">{Math.round(overview?.average_score || 0)}%</p>
                            <p className="text-xs text-slate-500">Avg Score</p>
                        </div>
                        <div className="bg-orange-50 rounded-xl p-4 text-center">
                            <HiOutlineFire className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-slate-800">{overview?.study_streak || 0}</p>
                            <p className="text-xs text-slate-500">Day Streak</p>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <h3 className="text-sm font-semibold text-slate-800 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/documents')}
                            className="w-full flex items-center gap-3 p-3 bg-blue-900 text-white rounded-xl hover:bg-blue-800 transition-colors"
                        >
                            <HiOutlineCloudArrowUp className="w-5 h-5" />
                            <span className="font-medium text-sm">Upload Document</span>
                            <HiOutlineChevronRight className="w-4 h-4 ml-auto" />
                        </button>
                        <button
                            onClick={() => navigate('/quizzes')}
                            className="w-full flex items-center gap-3 p-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
                        >
                            <HiOutlinePlayCircle className="w-5 h-5" />
                            <span className="font-medium text-sm">Take a Quiz</span>
                            <HiOutlineChevronRight className="w-4 h-4 ml-auto" />
                        </button>
                        <button
                            onClick={() => navigate('/progress')}
                            className="w-full flex items-center gap-3 p-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
                        >
                            <HiOutlineChartBar className="w-5 h-5" />
                            <span className="font-medium text-sm">View Progress</span>
                            <HiOutlineChevronRight className="w-4 h-4 ml-auto" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
