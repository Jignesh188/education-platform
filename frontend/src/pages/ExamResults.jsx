import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Badge from '../components/common/Badge';
import QuestionCard from '../components/quiz/QuestionCard';
import Loader from '../components/common/Loader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
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
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            {/* Back Button */}
            <Button
                variant="ghost"
                onClick={() => navigate('/quizzes')}
                className="pl-0 text-slate-500 hover:text-slate-700 font-medium h-auto"
            >
                <HiOutlineArrowLeft className="w-4 h-4 mr-2" />
                Back to Quizzes
            </Button>

            {/* Score Card */}
            <Card className="p-10 text-center">
                <div
                    className={`w-24 h-24 rounded-2xl mx-auto mb-5 flex items-center justify-center ring-4 ring-offset-2 ${isPassing
                        ? 'bg-emerald-50 ring-emerald-100'
                        : isAverage
                            ? 'bg-amber-50 ring-amber-100'
                            : 'bg-red-50 ring-red-100'
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

                <h1 className="text-5xl font-bold mb-3 text-slate-900">
                    {result.score_percentage}%
                </h1>
                <p className="text-lg text-slate-500 mb-8 font-medium">
                    {isPassing ? 'Excellent work! You passed.' : isAverage ? 'Good effort! Need a bit more practice.' : 'Keep studying and try again!'}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-sm mb-8">
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-lg text-emerald-700 font-medium border border-emerald-100">
                        <HiOutlineCheckCircle className="w-5 h-5" />
                        <span>{result.correct_answers} correct</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-lg text-red-700 font-medium border border-red-100">
                        <HiOutlineXCircle className="w-5 h-5" />
                        <span>{result.wrong_answers} wrong</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg text-blue-700 font-medium border border-blue-100">
                        <HiOutlineClock className="w-5 h-5" />
                        <span>{Math.floor(result.time_taken / 60)}m {result.time_taken % 60}s</span>
                    </div>
                </div>

                <Button
                    onClick={() => navigate(`/quiz/${result.quiz_id}`)}
                    className="px-8"
                >
                    <HiOutlineArrowPath className="w-5 h-5 mr-2" />
                    Retake Quiz
                </Button>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                <Card className="p-6 text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{result.total_questions}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Questions</div>
                </Card>
                <Card className="p-6 text-center">
                    <div className="text-3xl font-bold text-emerald-500 mb-2">{result.correct_answers}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Correct</div>
                </Card>
                <Card className="p-6 text-center">
                    <div className="text-3xl font-bold text-red-500 mb-2">{result.wrong_answers}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Wrong</div>
                </Card>
                <Card className="p-6 text-center flex flex-col items-center justify-center">
                    <div className="mb-2">
                        <Badge variant={result.difficulty}>
                            {result.difficulty}
                        </Badge>
                    </div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Difficulty</div>
                </Card>
            </div>

            {/* Weak Topics */}
            {result.weak_topics && result.weak_topics.length > 0 && (
                <Card className="p-6">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900">
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
                </Card>
            )}

            {/* Detailed Answers */}
            <div>
                <h2 className="text-lg font-bold mb-5 text-slate-900">Detailed Review</h2>
                <div className="space-y-6">
                    {result.answers.map((answer, index) => (
                        <QuestionCard
                            key={answer.question_id}
                            question={{
                                question_text: answer.question_text,
                                options: [
                                    { option_id: 'A', option_text: 'Option A' },
                                    { option_id: 'B', option_text: 'Option B' },
                                    { option_id: 'C', option_text: 'Option C' },
                                    { option_id: 'D', option_text: 'Option D' }
                                ],
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
