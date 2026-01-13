import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../components/common/Badge';
import Loader from '../components/common/Loader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
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
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Quizzes & Exams</h1>
                <p className="text-slate-500 text-sm mt-1">Test your knowledge and track your performance</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('quizzes')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === 'quizzes'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Available Quizzes ({quizzes.length})
                </button>
                <button
                    onClick={() => setActiveTab('results')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === 'results'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Past Results ({results.length})
                </button>
            </div>

            {activeTab === 'quizzes' && (
                <>
                    {quizzes.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {quizzes.map((quiz) => (
                                <Card
                                    key={quiz.id}
                                    hover
                                    onClick={() => navigate(`/quiz/${quiz.id}`)}
                                    className="p-6 cursor-pointer group"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                            <HiOutlineBookOpen className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <Badge variant={quiz.difficulty}>
                                            {quiz.difficulty}
                                        </Badge>
                                    </div>
                                    <h3 className="font-semibold text-base mb-3 truncate text-slate-900">{quiz.title}</h3>
                                    <div className="flex items-center justify-between text-sm text-slate-500">
                                        <span className="font-medium">{quiz.question_count} questions</span>
                                        <HiOutlineChevronRight className="w-5 h-5 group-hover:text-blue-600 transition-colors" />
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="p-12 text-center border-dashed border-2 border-slate-200 shadow-none">
                            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                                <HiOutlineBookOpen className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-base font-semibold mb-2 text-slate-900">No quizzes yet</h3>
                            <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
                                Upload a document and create your first quiz
                            </p>
                            <Button
                                onClick={() => navigate('/documents')}
                                variant="primary"
                            >
                                Go to Documents
                            </Button>
                        </Card>
                    )}
                </>
            )}

            {activeTab === 'results' && (
                <>
                    {results.length > 0 ? (
                        <div className="space-y-4">
                            {results.map((result) => (
                                <Card
                                    key={result.id}
                                    hover
                                    onClick={() => navigate(`/results/${result.id}`)}
                                    className="p-5 cursor-pointer group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold ${result.score_percentage >= 70
                                                    ? 'bg-emerald-100 text-emerald-600'
                                                    : result.score_percentage >= 50
                                                        ? 'bg-amber-100 text-amber-600'
                                                        : 'bg-red-100 text-red-600'
                                                    }`}
                                            >
                                                {result.score_percentage}%
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-base text-slate-900">{result.quiz_title}</h3>
                                                <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
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
                                        <HiOutlineChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="p-12 text-center border-dashed border-2 border-slate-200 shadow-none">
                            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                                <HiOutlineCheckBadge className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-base font-semibold mb-2 text-slate-900">No results yet</h3>
                            <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
                                Take a quiz to see your results here
                            </p>
                            <Button
                                onClick={() => setActiveTab('quizzes')}
                                variant="primary"
                            >
                                View Available Quizzes
                            </Button>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}
