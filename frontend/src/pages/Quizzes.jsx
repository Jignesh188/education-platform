import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../components/common/Badge';
import Loader from '../components/common/Loader';
import { quizAPI } from '../api/quiz';
import {
    HiOutlineBookOpen,
    HiOutlineClock,
    HiOutlineCheckBadge,
    HiOutlineChevronRight
} from 'react-icons/hi2';

export default function Quizzes() {
    const [quizzes, setQuizzes] = useState([]);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('quizzes');
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [quizData, resultData] = await Promise.all([
                quizAPI.list(),
                quizAPI.listResults()
            ]);
            setQuizzes(quizData.quizzes || []);
            setResults(resultData.results || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader text="Loading quizzes..." />
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800">Quizzes & Exams</h1>
                <p className="text-slate-500 text-sm mt-1">Test your knowledge and track your performance</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-white p-1.5 rounded-2xl border border-slate-100 w-fit shadow-sm">
                <button
                    onClick={() => setActiveTab('quizzes')}
                    className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === 'quizzes'
                        ? 'bg-blue-900 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100'
                        }`}
                >
                    Available Quizzes ({quizzes.length})
                </button>
                <button
                    onClick={() => setActiveTab('results')}
                    className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === 'results'
                        ? 'bg-blue-900 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100'
                        }`}
                >
                    Past Results ({results.length})
                </button>
            </div>

            {activeTab === 'quizzes' && (
                <>
                    {quizzes.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {quizzes.map((quiz) => (
                                <div
                                    key={quiz.id}
                                    className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 cursor-pointer transition-all"
                                    onClick={() => navigate(`/quiz/${quiz.id}`)}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                                            <HiOutlineBookOpen className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <Badge variant={quiz.difficulty}>
                                            {quiz.difficulty}
                                        </Badge>
                                    </div>
                                    <h3 className="font-semibold text-base mb-3 truncate text-slate-800">{quiz.title}</h3>
                                    <div className="flex items-center justify-between text-sm text-slate-500">
                                        <span className="font-medium">{quiz.question_count} questions</span>
                                        <HiOutlineChevronRight className="w-5 h-5" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                <HiOutlineBookOpen className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-base font-semibold mb-2 text-slate-800">No quizzes yet</h3>
                            <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
                                Upload a document and create your first quiz
                            </p>
                            <button
                                onClick={() => navigate('/documents')}
                                className="inline-flex items-center px-5 py-2.5 bg-blue-900 text-white rounded-xl font-semibold text-sm hover:bg-blue-800 transition-colors"
                            >
                                Go to Documents
                            </button>
                        </div>
                    )}
                </>
            )}

            {activeTab === 'results' && (
                <>
                    {results.length > 0 ? (
                        <div className="space-y-4">
                            {results.map((result) => (
                                <div
                                    key={result.id}
                                    className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md cursor-pointer transition-all"
                                    onClick={() => navigate(`/results/${result.id}`)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`w-16 h-16 rounded-xl flex items-center justify-center text-lg font-bold ${result.score_percentage >= 70
                                                    ? 'bg-emerald-50 text-emerald-600'
                                                    : result.score_percentage >= 50
                                                        ? 'bg-amber-50 text-amber-600'
                                                        : 'bg-red-50 text-red-600'
                                                    }`}
                                            >
                                                {result.score_percentage}%
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-base text-slate-800">{result.quiz_title}</h3>
                                                <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                                                    <span className="flex items-center gap-1.5 font-medium">
                                                        <HiOutlineCheckBadge className="w-4 h-4" />
                                                        {result.correct_answers}/{result.total_questions}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <HiOutlineClock className="w-4 h-4" />
                                                        {Math.floor(result.time_taken / 60)}m {result.time_taken % 60}s
                                                    </span>
                                                    <Badge variant={result.difficulty}>
                                                        {result.difficulty}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <HiOutlineChevronRight className="w-5 h-5 text-slate-400" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                <HiOutlineCheckBadge className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-base font-semibold mb-2 text-slate-800">No results yet</h3>
                            <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
                                Take a quiz to see your results here
                            </p>
                            <button
                                onClick={() => setActiveTab('quizzes')}
                                className="inline-flex items-center px-5 py-2.5 bg-blue-900 text-white rounded-xl font-semibold text-sm hover:bg-blue-800 transition-colors"
                            >
                                View Available Quizzes
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
