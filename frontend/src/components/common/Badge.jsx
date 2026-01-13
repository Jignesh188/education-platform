export default function Badge({ children, variant = 'primary', className = '' }) {
    const variants = {
        primary: 'badge-primary',
        success: 'badge-success',
        warning: 'badge-warning',
        error: 'badge-danger',
        easy: 'badge-success',
        medium: 'badge-warning',
        hard: 'badge-danger',
        info: 'bg-slate-100 text-slate-700',
    };

    return (
        <span className={`badge-base ${variants[variant] || variants.primary} ${className}`}>
            {children}
        </span>
    );
}
