import { HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi2';
import Card from '../common/Card';

export default function QuestionCard({
    question,
    questionNumber,
    selectedAnswer,
    onSelectAnswer,
    showResults = false
}) {
    const getOptionClass = (optionId) => {
        let baseClass = 'flex items-center gap-3 p-4 bg-white border rounded-xl cursor-pointer transition-all';

        if (showResults) {
            if (optionId === question.correct_answer) {
                return `${baseClass} border-emerald-500 bg-emerald-50`;
            }
            if (optionId === selectedAnswer && optionId !== question.correct_answer) {
                return `${baseClass} border-red-500 bg-red-50`;
            }
            return `${baseClass} border-slate-200 opacity-60`;
        } else if (selectedAnswer === optionId) {
            return `${baseClass} border-blue-600 bg-blue-50 ring-1 ring-blue-600`;
        }

        return `${baseClass} border-slate-200 hover:border-blue-300 hover:bg-slate-50`;
    };

    return (
        <Card className="p-6">
            <div className="flex items-start gap-4 mb-6">
                <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    {questionNumber}
                </span>
                <h3 className="text-lg font-semibold text-slate-900 leading-relaxed pt-1">{question.question_text}</h3>
            </div>

            <div className="space-y-3">
                {question.options.map((option) => (
                    <button
                        key={option.option_id}
                        type="button"
                        onClick={() => !showResults && onSelectAnswer(option.option_id)}
                        disabled={showResults}
                        className={getOptionClass(option.option_id)}
                    >
                        <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-colors ${
                            selectedAnswer === option.option_id && !showResults ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                            {option.option_id}
                        </span>
                        <span className="flex-1 text-left text-slate-700 text-sm font-medium">{option.option_text}</span>
                        {showResults && option.option_id === question.correct_answer && (
                            <HiOutlineCheckCircle className="w-5 h-5 text-emerald-600" />
                        )}
                        {showResults && option.option_id === selectedAnswer && option.option_id !== question.correct_answer && (
                            <HiOutlineXCircle className="w-5 h-5 text-red-500" />
                        )}
                    </button>
                ))}
            </div>

            {showResults && question.explanation && (
                <div className="mt-6 p-5 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">Explanation</p>
                    <p className="text-sm text-blue-800 leading-relaxed">{question.explanation}</p>
                </div>
            )}
        </Card>
    );
}
