import { useState, useEffect } from 'react';
import Loader from '../components/common/Loader';
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
            color: '#1e40af',
            bgColor: '#eff6ff'
        },
        {
            label: 'Quizzes Taken',
            value: progress?.total_quizzes || 0,
            icon: HiOutlineCheckBadge,
            color: '#3b82f6',
            bgColor: '#eff6ff'
        },
        {
            label: 'Average Score',
            value: `${Math.round(progress?.average_score || 0)}%`,
            icon: HiOutlineChartBar,
            color: '#10b981',
            bgColor: '#ecfdf5'
        },
        {
            label: 'Study Streak',
            value: `${progress?.current_streak || 0} days`,
            icon: HiOutlineFire,
            color: '#f59e0b',
            bgColor: '#fffbeb'
        },
        {
            label: 'Study Time',
            value: `${progress?.total_study_time || 0}m`,
            icon: HiOutlineClock,
            color: '#06b6d4',
            bgColor: '#ecfeff'
        },
        {
            label: 'Best Streak',
            value: `${progress?.best_streak || 0} days`,
            icon: HiOutlineTrophy,
            color: '#ef4444',
            bgColor: '#fef2f2'
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
        <div className="p-6">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800">Learning Progress</h1>
                <p className="text-slate-500 text-sm mt-1">Track your learning journey and achievements</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                                style={{ backgroundColor: stat.bgColor }}
                            >
                                <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                            </div>
                            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                            <p className="text-xs text-slate-500 font-medium mt-1">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Activity Chart */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800 mb-5">Daily Activity</h2>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#94a3b8"
                                    fontSize={11}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    fontSize={11}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="quizzes"
                                    stroke="#1e40af"
                                    strokeWidth={2}
                                    dot={{ fill: '#1e40af', strokeWidth: 2 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="correct"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    dot={{ fill: '#10b981', strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[280px] flex flex-col items-center justify-center">
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                                <HiOutlineChartBar className="w-8 h-8 text-slate-400" />
                            </div>
                            <p className="text-base font-semibold text-slate-800 mb-1">No activity yet</p>
                            <p className="text-sm text-slate-500">Complete quizzes to track your daily progress</p>
                        </div>
                    )}
                </div>

                {/* Topic Mastery */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800 mb-5">Topic Mastery</h2>
                    {topicData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={topicData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                    type="number"
                                    domain={[0, 100]}
                                    stroke="#94a3b8"
                                    fontSize={11}
                                />
                                <YAxis
                                    dataKey="topic"
                                    type="category"
                                    stroke="#94a3b8"
                                    fontSize={11}
                                    width={100}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <Bar
                                    dataKey="mastery"
                                    fill="#1e40af"
                                    radius={[0, 6, 6, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[280px] flex flex-col items-center justify-center">
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                                <HiOutlineCheckBadge className="w-8 h-8 text-slate-400" />
                            </div>
                            <p className="text-base font-semibold text-slate-800 mb-1">No topic data yet</p>
                            <p className="text-sm text-slate-500">Complete quizzes to see topic mastery</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Achievements */}
            {progress?.achievements && progress.achievements.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mt-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-5">Achievements</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {progress.achievements.map((achievement, index) => (
                            <div
                                key={index}
                                className="text-center p-5 bg-amber-50 rounded-2xl border border-amber-100"
                            >
                                <HiOutlineTrophy className="w-8 h-8 text-amber-600 mx-auto mb-3" />
                                <h3 className="font-semibold text-sm text-slate-800">{achievement.title}</h3>
                                <p className="text-xs text-slate-500 mt-2">
                                    {achievement.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
