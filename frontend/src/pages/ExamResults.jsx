import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Badge from '../components/common/Badge';
import QuestionCard from '../components/quiz/QuestionCard';
import Loader from '../components/common/Loader';
import { quizAPI } from '../api/quiz';
import {
    HiOutlineTrophy,
    HiOutlineCheckBadge,
    HiOutlineClock,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineExclamationTriangle,
    HiOutlineArrowLeft,
    HiOutlineArrowPath
} from 'react-icons/hi2';

export default function ExamResults() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResult();
    }, [id]);

    const fetchResult = async () => {
        try {
            const data = await quizAPI.getResult(id);
            setResult(data);
        } catch (error) {
            console.error('Failed to fetch result:', error);
            navigate('/quizzes');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader text="Loading results..." />
            </div>
        );
    }

    if (!result) return null;

    const isPassing = result.score_percentage >= 70;
    const isAverage = result.score_percentage >= 50 && result.score_percentage < 70;

    return (
        <div className="p-6">
            {/* Back Button */}
            <button
                onClick={() => navigate('/quizzes')}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 font-medium transition-colors text-sm"
            >
                <HiOutlineArrowLeft className="w-4 h-4" />
                Back to Quizzes
            </button>

            {/* Score Card */}
            <div className="bg-white rounded-2xl p-10 border border-slate-100 shadow-sm mb-6 text-center">
                <div
                    className={`w-24 h-24 rounded-2xl mx-auto mb-5 flex items-center justify-center ${isPassing
                        ? 'bg-emerald-50'
                        : isAverage
                            ? 'bg-amber-50'
                            : 'bg-red-50'
                        }`}
                >
                    {isPassing ? (
                        <HiOutlineTrophy className="w-12 h-12 text-emerald-500" />
                    ) : isAverage ? (
                        <HiOutlineCheckBadge className="w-12 h-12 text-amber-500" />
                    ) : (
                        <HiOutlineExclamationTriangle className="w-12 h-12 text-red-500" />
                    )}
                </div>

                <h1 className="text-5xl font-bold mb-3 text-slate-800">
                    {result.score_percentage}%
                </h1>
                <p className="text-lg text-slate-500 mb-6">
                    {isPassing ? 'Excellent!' : isAverage ? 'Good Effort!' : 'Keep Practicing!'}
                </p>

                <div className="flex items-center justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <HiOutlineCheckCircle className="w-5 h-5 text-emerald-500" />
                        <span className="text-slate-600 font-medium">{result.correct_answers} correct</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <HiOutlineXCircle className="w-5 h-5 text-red-500" />
                        <span className="text-slate-600 font-medium">{result.wrong_answers} wrong</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <HiOutlineClock className="w-5 h-5 text-blue-600" />
                        <span className="text-slate-600 font-medium">
                            {Math.floor(result.time_taken / 60)}m {result.time_taken % 60}s
                        </span>
                    </div>
                </div>

                <div className="mt-8">
                    <button
                        onClick={() => navigate(`/quiz/${result.quiz_id}`)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-xl font-semibold text-sm hover:bg-blue-800 transition-colors shadow-sm"
                    >
                        <HiOutlineArrowPath className="w-5 h-5" />
                        Retake Quiz
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm text-center">
                    <div className="text-3xl font-bold text-blue-600">{result.total_questions}</div>
                    <div className="text-sm text-slate-500 mt-2 font-medium">Total Questions</div>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm text-center">
                    <div className="text-3xl font-bold text-emerald-500">{result.correct_answers}</div>
                    <div className="text-sm text-slate-500 mt-2 font-medium">Correct</div>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm text-center">
                    <div className="text-3xl font-bold text-red-500">{result.wrong_answers}</div>
                    <div className="text-sm text-slate-500 mt-2 font-medium">Wrong</div>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm text-center">
                    <Badge variant={result.difficulty} className="mx-auto">
                        {result.difficulty}
                    </Badge>
                    <div className="text-sm text-slate-500 mt-3 font-medium">Difficulty</div>
                </div>
            </div>

            {/* Weak Topics */}
            {result.weak_topics && result.weak_topics.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-800">
                        <HiOutlineExclamationTriangle className="w-5 h-5 text-amber-500" />
                        Topics to Review
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {result.weak_topics.map((topic, index) => (
                            <Badge key={index} variant="warning">
                                {topic}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            {/* Detailed Answers */}
            <div>
                <h2 className="text-lg font-semibold mb-5 text-slate-800">Detailed Review</h2>
                <div className="space-y-5">
                    {result.answers.map((answer, index) => (
                        <QuestionCard
                            key={answer.question_id}
                            question={{
                                question_text: answer.question_text,
                                options: [
                                    { option_id: 'A', option_text: '' },
                                    { option_id: 'B', option_text: '' },
                                    { option_id: 'C', option_text: '' },
                                    { option_id: 'D', option_text: '' }
                                ].map(opt => ({
                                    ...opt,
                                    option_text: result.answers[index]?.question_text?.includes(opt.option_id)
                                        ? 'Option content'
                                        : 'Option content'
                                })),
                                correct_answer: answer.correct_answer,
                                explanation: answer.explanation
                            }}
                            questionNumber={index + 1}
                            selectedAnswer={answer.selected_answer}
                            showResults={true}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
