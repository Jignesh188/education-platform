export default function Badge({ children, variant = 'primary', className = '' }) {
    const variants = {
        primary: 'bg-blue-100 text-blue-800',
        success: 'bg-emerald-100 text-emerald-700',
        warning: 'bg-amber-100 text-amber-700',
        error: 'bg-red-100 text-red-700',
        easy: 'bg-emerald-100 text-emerald-700',
        medium: 'bg-amber-100 text-amber-700',
        hard: 'bg-red-100 text-red-700',
        info: 'bg-slate-100 text-slate-700',
    };

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${variants[variant] || variants.primary} ${className}`}>
            {children}
        </span>
    );
}
