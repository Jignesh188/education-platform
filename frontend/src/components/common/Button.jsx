import { HiOutlineArrowPath } from 'react-icons/hi2';

export default function Button({
    children,
    variant = 'primary',
    loading = false,
    disabled = false,
    className = '',
    type = 'button',
    onClick,
    ...props
}) {
    const variants = {
        primary: 'bg-blue-900 text-white hover:bg-blue-800 shadow-sm',
        secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300',
        success: 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm',
        danger: 'bg-red-500 text-white hover:bg-red-600 shadow-sm',
        ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
    };

    return (
        <button
            type={type}
            disabled={disabled || loading}
            onClick={onClick}
            className={`
                inline-flex items-center justify-center gap-2 
                px-5 py-2.5 rounded-xl font-semibold text-sm
                transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                ${variants[variant] || variants.primary}
                ${className}
            `}
            {...props}
        >
            {loading && <HiOutlineArrowPath className="w-4 h-4 animate-spin" />}
            {children}
        </button>
    );
}
