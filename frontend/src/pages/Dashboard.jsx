import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/common/Loader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { progressAPI } from '../api/progress';
import { documentsAPI } from '../api/documents';
import { quizAPI } from '../api/quiz';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
    HiOutlineDocumentText,
    HiOutlineBookOpen,
    HiOutlineTrophy,
    HiOutlineChartBar,
    HiOutlineFire,
    HiOutlineCloudArrowUp,
    HiOutlinePlayCircle,
    HiOutlinePhoto,
    HiOutlineChevronRight,
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
                    stroke="var(--color-primary)"
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

    // Course completion data (Mock)
    const completionData = [
        { name: 'Life Contingency', chapter: 'Chapter 3', progress: 75 },
        { name: 'Social Insurance', chapter: 'Chapter 4', progress: 91 },
        { name: 'Advanced Maths', chapter: 'Module 2', progress: 25 },
        { name: 'Pension', chapter: 'Chapter 5', progress: 97 },
    ];

    return (
        <div className="p-6 grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Main Content (3 Columns) */}
            <div className="xl:col-span-3 space-y-6">
                
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                     <Card className="flex items-center gap-4 p-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                             <HiOutlineDocumentText className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{overview?.total_documents || 0}</p>
                            <p className="text-sm text-slate-500">Documents</p>
                        </div>
                     </Card>
                     <Card className="flex items-center gap-4 p-4">
                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
                             <HiOutlineBookOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{overview?.total_quizzes_taken || 0}</p>
                            <p className="text-sm text-slate-500">Quizzes</p>
                        </div>
                     </Card>
                     <Card className="flex items-center gap-4 p-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                             <HiOutlineChartBar className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{Math.round(overview?.average_score || 0)}%</p>
                            <p className="text-sm text-slate-500">Avg Score</p>
                        </div>
                     </Card>
                     <Card className="flex items-center gap-4 p-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                             <HiOutlineFire className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{overview?.study_streak || 0}</p>
                            <p className="text-sm text-slate-500">Day Streak</p>
                        </div>
                     </Card>
                </div>

                {/* Charts & Progress Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Performance Chart */}
                    <Card>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-900">Performance</h2>
                            <select className="input-base w-auto py-1 px-3 text-xs">
                                <option>This Week</option>
                                <option>This Month</option>
                            </select>
                        </div>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#94a3b8" />
                                    <YAxis axisLine={false} tickLine={false} stroke="#94a3b8" domain={[0, 4]} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#2563eb"
                                        strokeWidth={3}
                                        fill="url(#colorValue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Completion Progress */}
                    <Card>
                        <h2 className="text-lg font-bold text-slate-900 mb-6">Completion Progress</h2>
                        <div className="space-y-4">
                            {completionData.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                    <div>
                                        <p className="font-semibold text-slate-900 text-sm">{item.name}</p>
                                        <p className="text-xs text-slate-500">{item.chapter}</p>
                                    </div>
                                    <CircularProgress percentage={item.progress} size={42} />
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Documents */}
                    <Card>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-900">Recent Documents</h2>
                            <Button variant="ghost" onClick={() => navigate('/documents')} className="text-xs px-3 py-1.5 h-auto">
                                View All
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {recentDocs.length > 0 ? recentDocs.slice(0, 4).map((doc) => (
                                <div
                                    key={doc.id}
                                    className="flex items-center gap-4 p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 cursor-pointer transition-all"
                                    onClick={() => navigate(`/documents/${doc.id}`)}
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                        doc.file_type === 'pdf' ? 'bg-red-50 text-red-600' :
                                        doc.file_type === 'image' ? 'bg-blue-50 text-blue-600' :
                                        'bg-green-50 text-green-600'
                                    }`}>
                                        {doc.file_type === 'image' ? (
                                            <HiOutlinePhoto className="w-5 h-5" />
                                        ) : (
                                            <HiOutlineDocumentText className="w-5 h-5" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-900 text-sm truncate">{doc.title}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            {doc.processing_status === 'completed' ? 'Ready' : doc.processing_status}
                                        </p>
                                    </div>
                                    <span className="text-xs text-slate-400">
                                        {new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                            )) : (
                                <div className="text-center py-8">
                                    <p className="text-sm text-slate-500">No documents yet</p>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Recent Quiz Results */}
                    <Card>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-900">Recent Results</h2>
                            <Button variant="ghost" onClick={() => navigate('/quizzes')} className="text-xs px-3 py-1.5 h-auto">
                                View All
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {recentResults.length > 0 ? recentResults.slice(0, 4).map((result, index) => (
                                <div
                                    key={result.id}
                                    className="flex items-center gap-4 p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 cursor-pointer transition-all"
                                    onClick={() => navigate(`/results/${result.id}`)}
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold ${
                                        result.score_percentage >= 80 ? 'bg-green-500' :
                                        result.score_percentage >= 60 ? 'bg-amber-500' :
                                        'bg-red-500'
                                    }`}>
                                        {result.quiz_title.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-900 text-sm truncate">{result.quiz_title}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{result.score_percentage}% Score</p>
                                    </div>
                                    <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        result.score_percentage >= 80 ? 'bg-green-50 text-green-700' :
                                        result.score_percentage >= 60 ? 'bg-amber-50 text-amber-700' :
                                        'bg-red-50 text-red-700'
                                    }`}>
                                        {result.correct_answers}/{result.total_questions}
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-8">
                                    <p className="text-sm text-slate-500">No quiz results yet</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Right Sidebar (1 Column) */}
            <div className="space-y-6">
                <Card className="sticky top-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                         <button
                            onClick={() => navigate('/documents')}
                            className="w-full flex items-center gap-3 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            <HiOutlineCloudArrowUp className="w-5 h-5" />
                            <span className="font-medium text-sm">Upload Document</span>
                            <HiOutlineChevronRight className="w-4 h-4 ml-auto" />
                        </button>
                        <button
                            onClick={() => navigate('/quizzes')}
                            className="w-full flex items-center gap-3 p-3 bg-slate-50 text-slate-700 rounded-xl hover:bg-slate-100 border border-slate-200 transition-colors"
                        >
                            <HiOutlinePlayCircle className="w-5 h-5 text-slate-500" />
                            <span className="font-medium text-sm">Take a Quiz</span>
                            <HiOutlineChevronRight className="w-4 h-4 ml-auto text-slate-400" />
                        </button>
                    </div>

                    <div className="my-6 border-t border-slate-100"></div>

                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Upcoming</h3>
                     <div className="space-y-4">
                        {[
                            { title: 'Maths Tutorial', time: '10:00 AM', color: 'bg-blue-500' },
                            { title: 'Physics Quiz', time: '2:00 PM', color: 'bg-red-500' },
                        ].map((item, i) => (
                             <div key={i} className="flex gap-3">
                                 <div className={`w-1 h-full min-h-[40px] rounded-full ${item.color}`}></div>
                                 <div>
                                     <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                                     <p className="text-xs text-slate-500">{item.time}</p>
                                 </div>
                             </div>
                        ))}
                     </div>
                </Card>
            </div>
        </div>
    );
}
