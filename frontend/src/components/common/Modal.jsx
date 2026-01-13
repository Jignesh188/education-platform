import { HiOutlineXMark } from 'react-icons/hi2';

export default function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl p-6 max-w-lg w-[90%] max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-slate-800">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        <HiOutlineXMark className="w-5 h-5 text-slate-500" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}
