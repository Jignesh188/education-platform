import { useState, useEffect } from 'react';
import Loader from '../components/common/Loader';
import Card from '../components/common/Card';
import { progressAPI } from '../api/progress';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';
import {
    HiOutlineChartBar,
    HiOutlineCheckBadge,
    HiOutlineBookOpen,
    HiOutlineClock,
    HiOutlineFire,
    HiOutlineTrophy
} from 'react-icons/hi2';

export default function Progress() {
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProgress();
    }, []);

    const fetchProgress = async () => {
        try {
            const data = await progressAPI.getDetailed();
            setProgress(data);
        } catch (error) {
            console.error('Failed to fetch progress:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader text="Loading progress..." />
            </div>
        );
    }

    const stats = [
        {
            label: 'Documents',
            value: progress?.total_documents || 0,
            icon: HiOutlineBookOpen,
            color: '#2563eb', // blue-600
            bgColor: '#eff6ff', // blue-50
            ringColor: '#dbeafe' // blue-100
        },
        {
            label: 'Quizzes Taken',
            value: progress?.total_quizzes || 0,
            icon: HiOutlineCheckBadge,
            color: '#3b82f6', // blue-500
            bgColor: '#eff6ff',
            ringColor: '#dbeafe'
        },
        {
            label: 'Average Score',
            value: `${Math.round(progress?.average_score || 0)}%`,
            icon: HiOutlineChartBar,
            color: '#10b981', // emerald-500
            bgColor: '#ecfdf5', // emerald-50
            ringColor: '#d1fae5' // emerald-100
        },
        {
            label: 'Study Streak',
            value: `${progress?.current_streak || 0} days`,
            icon: HiOutlineFire,
            color: '#f59e0b', // amber-500
            bgColor: '#fffbeb', // amber-50
            ringColor: '#fef3c7' // amber-100
        },
        {
            label: 'Study Time',
            value: `${progress?.total_study_time || 0}m`,
            icon: HiOutlineClock,
            color: '#0891b2', // cyan-600
            bgColor: '#ecfeff', // cyan-50
            ringColor: '#cffafe' // cyan-100
        },
        {
            label: 'Best Streak',
            value: `${progress?.best_streak || 0} days`,
            icon: HiOutlineTrophy,
            color: '#ef4444', // red-500
            bgColor: '#fef2f2', // red-50
            ringColor: '#fee2e2' // red-100
        },
    ];

    // Prepare chart data
    const chartData = (progress?.daily_stats || []).map(stat => ({
        date: new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        quizzes: stat.quizzes_taken,
        correct: stat.correct_answers,
        total: stat.questions_answered
    }));

    const topicData = (progress?.topic_progress || []).map(topic => ({
        topic: topic.topic.length > 15 ? topic.topic.slice(0, 15) + '...' : topic.topic,
        mastery: topic.mastery_level
    }));

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Learning Progress</h1>
                <p className="text-slate-500 text-sm mt-1">Track your learning journey and achievements</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {stats.map((stat) => (
                    <Card
                        key={stat.label}
                        className="p-5"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                                style={{ backgroundColor: stat.bgColor }}
                            >
                                <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                            </div>
                            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                            <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wide">{stat.label}</p>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Activity Chart */}
                <Card className="p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-6">Daily Activity</h2>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#94a3b8"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    dx={-10}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                        padding: '12px'
                                    }}
                                    cursor={{ stroke: '#e2e8f0' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="quizzes"
                                    stroke="#2563eb"
                                    strokeWidth={3}
                                    dot={{ fill: '#2563eb', strokeWidth: 0, r: 4 }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="correct"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    dot={{ fill: '#10b981', strokeWidth: 0, r: 4 }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[280px] flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-xl">
                            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                                <HiOutlineChartBar className="w-8 h-8 text-slate-300" />
                            </div>
                            <p className="text-base font-semibold text-slate-900 mb-1">No activity yet</p>
                            <p className="text-sm text-slate-500">Complete quizzes to track your daily progress</p>
                        </div>
                    )}
                </Card>

                {/* Topic Mastery */}
                <Card className="p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-6">Topic Mastery</h2>
                    {topicData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={topicData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                                <XAxis
                                    type="number"
                                    domain={[0, 100]}
                                    stroke="#94a3b8"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    dataKey="topic"
                                    type="category"
                                    stroke="#52525b"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    width={100}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                        padding: '12px'
                                    }}
                                    cursor={{ fill: '#f8fafc' }}
                                />
                                <Bar
                                    dataKey="mastery"
                                    fill="#2563eb"
                                    radius={[0, 4, 4, 0]}
                                    barSize={20}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[280px] flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-xl">
                            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                                <HiOutlineCheckBadge className="w-8 h-8 text-slate-300" />
                            </div>
                            <p className="text-base font-semibold text-slate-900 mb-1">No topic data yet</p>
                            <p className="text-sm text-slate-500">Complete quizzes to see topic mastery</p>
                        </div>
                    )}
                </Card>
            </div>

            {/* Achievements */}
            {progress?.achievements && progress.achievements.length > 0 && (
                <Card className="p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-6">Achievements</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {progress.achievements.map((achievement, index) => (
                            <div
                                key={index}
                                className="text-center p-5 bg-amber-50 rounded-2xl border border-amber-100 hover:shadow-sm transition-shadow"
                            >
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-2xl">
                                    🏆
                                </div>
                                <h3 className="font-semibold text-sm text-slate-900">{achievement.title}</h3>
                                <p className="text-xs text-slate-500 mt-2">
                                    {achievement.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
}
