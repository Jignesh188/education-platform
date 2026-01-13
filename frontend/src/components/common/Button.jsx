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
    // Variants mapped to new CSS classes
    const variants = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm', // Custom for now, can move to css later
        danger: 'btn-danger',
        ghost: 'btn-ghost',
    };

    const baseClass = variants[variant] || variants.primary;

    return (
        <button
            type={type}
            disabled={disabled || loading}
            onClick={onClick}
            className={`
                btn-base
                ${baseClass}
                ${className}
            `}
            {...props}
        >
            {loading && <HiOutlineArrowPath className="w-4 h-4 animate-spin" />}
            {children}
        </button>
    );
}
