import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QuestionCard from '../components/quiz/QuestionCard';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Loader from '../components/common/Loader';
import Card from '../components/common/Card';
import { quizAPI } from '../api/quiz';
import { HiOutlineClock, HiOutlineExclamationTriangle, HiOutlineArrowLeft } from 'react-icons/hi2';

export default function TakeExam() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState({});
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const timerRef = useRef(null);

    useEffect(() => {
        fetchQuiz();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [id]);

    const fetchQuiz = async () => {
        try {
            const data = await quizAPI.get(id, false);
            setQuiz(data);
            timerRef.current = setInterval(() => {
                setTimeElapsed(t => t + 1);
            }, 1000);
        } catch (error) {
            console.error('Failed to fetch quiz:', error);
            navigate('/quizzes');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAnswer = (questionId, answer) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const handleSubmit = async () => {
        if (Object.keys(answers).length < quiz.questions.length) {
            if (!confirm('You have unanswered questions. Submit anyway?')) return;
        }

        setSubmitting(true);
        clearInterval(timerRef.current);

        try {
            const submission = {
                quiz_id: quiz.id,
                answers: quiz.questions.map(q => ({
                    question_id: q.id,
                    selected_answer: answers[q.id] || ''
                })),
                time_taken: timeElapsed
            };

            const result = await quizAPI.submit(submission);
            navigate(`/results/${result.id}`);
        } catch (error) {
            console.error('Submit failed:', error);
            alert('Failed to submit. Please try again.');
            setSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader text="Loading exam..." />
            </div>
        );
    }

    if (!quiz) return null;

    const answeredCount = Object.keys(answers).length;
    const progress = (answeredCount / quiz.questions.length) * 100;

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

            {/* Exam Header */}
            <Card className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold mb-2 text-slate-900">{quiz.title}</h1>
                        <div className="flex items-center gap-3">
                            <Badge variant={quiz.difficulty}>{quiz.difficulty}</Badge>
                            <span className="text-sm text-slate-500 font-medium">
                                {quiz.question_count} questions
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-2 text-2xl font-mono font-bold text-slate-900">
                            <HiOutlineClock className="w-6 h-6 text-blue-600" />
                            {formatTime(timeElapsed)}
                        </div>
                        <p className="text-sm text-slate-500 mt-1 font-medium">
                            {answeredCount}/{quiz.questions.length} answered
                        </p>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="mt-6">
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </Card>

            {/* Question Navigation */}
            <div className="flex gap-2 flex-wrap">
                {quiz.questions.map((q, index) => (
                    <button
                        key={q.id}
                        onClick={() => setCurrentQuestion(index)}
                        className={`w-10 h-10 rounded-xl font-semibold text-sm transition-all ${currentQuestion === index
                            ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-600 ring-offset-2'
                            : answers[q.id]
                                ? 'bg-emerald-500 text-white shadow-sm'
                                : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'
                            }`}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>

            {/* Current Question */}
            <QuestionCard
                question={quiz.questions[currentQuestion]}
                questionNumber={currentQuestion + 1}
                selectedAnswer={answers[quiz.questions[currentQuestion].id]}
                onSelectAnswer={(answer) =>
                    handleSelectAnswer(quiz.questions[currentQuestion].id, answer)
                }
            />

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4">
                <Button
                    variant="secondary"
                    onClick={() => setCurrentQuestion(q => Math.max(0, q - 1))}
                    disabled={currentQuestion === 0}
                    className="w-32"
                >
                    Previous
                </Button>

                <div className="flex gap-3">
                    {currentQuestion < quiz.questions.length - 1 ? (
                        <Button
                            onClick={() => setCurrentQuestion(q => q + 1)}
                            className="w-32"
                        >
                            Next
                        </Button>
                    ) : (
                        <Button
                            variant="success"
                            onClick={handleSubmit}
                            loading={submitting}
                            className="px-8"
                        >
                            Submit Exam
                        </Button>
                    )}
                </div>
            </div>

            {/* Unanswered Warning */}
            {currentQuestion === quiz.questions.length - 1 &&
                answeredCount < quiz.questions.length && (
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-3 animate-pulse">
                        <HiOutlineExclamationTriangle className="w-5 h-5 text-amber-600" />
                        <p className="text-sm text-amber-900 font-medium">
                            You have {quiz.questions.length - answeredCount} unanswered question(s)
                        </p>
                    </div>
                )}
        </div>
    );
}
