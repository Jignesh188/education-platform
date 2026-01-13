import { useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import { HiOutlineBolt, HiOutlineCheckBadge, HiOutlineAcademicCap } from 'react-icons/hi2';

const difficulties = [
    {
        value: 'easy',
        label: 'Easy',
        icon: HiOutlineBolt,
        description: 'Basic recall & simple concepts',
        color: '#10b981',
        bgColor: '#ecfdf5',
        ringColor: '#a7f3d0'
    },
    {
        value: 'medium',
        label: 'Medium',
        icon: HiOutlineCheckBadge,
        description: 'Comprehension & connections',
        color: '#f59e0b',
        bgColor: '#fffbeb',
        ringColor: '#fde68a'
    },
    {
        value: 'hard',
        label: 'Hard',
        icon: HiOutlineAcademicCap,
        description: 'Analysis & critical thinking',
        color: '#ef4444',
        bgColor: '#fef2f2',
        ringColor: '#fecaca'
    },
];

export default function QuizCreator({ documentId, documentTitle, onSubmit, loading }) {
    const [title, setTitle] = useState(`Quiz: ${documentTitle || 'Document'}`);
    const [difficulty, setDifficulty] = useState('medium');
    const [questionCount, setQuestionCount] = useState(5);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            document_id: documentId,
            title,
            difficulty,
            question_count: questionCount,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Input
                label="Quiz Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter quiz title"
                required
            />

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                    Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                    {difficulties.map((d) => (
                        <button
                            key={d.value}
                            type="button"
                            onClick={() => setDifficulty(d.value)}
                            className={`p-4 rounded-xl border transition-all text-left group ${difficulty === d.value
                                ? 'bg-white ring-2 z-10'
                                : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                                }`}
                            style={difficulty === d.value ? { borderColor: d.color, ringColor: d.color, boxShadow: `0 0 0 1px ${d.color}` } : {}}
                        >
                            <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center mb-2"
                                style={{ backgroundColor: d.bgColor }}
                            >
                                <d.icon className="w-5 h-5" style={{ color: d.color }} />
                            </div>
                            <p className="font-semibold text-slate-900 text-sm">{d.label}</p>
                            <p className="text-xs text-slate-500 mt-1">
                                {d.description}
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                    Number of Questions: <span className="text-blue-600 font-semibold">{questionCount}</span>
                </label>
                <input
                    type="range"
                    min="3"
                    max="20"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
                    <span>3</span>
                    <span>20</span>
                </div>
            </div>

            <Button type="submit" loading={loading} className="w-full">
                Generate Quiz
            </Button>
        </form>
    );
}
