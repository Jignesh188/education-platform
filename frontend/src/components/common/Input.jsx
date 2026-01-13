export default function Input({
    label,
    error,
    className = '',
    icon,
    ...props
}) {
    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        {icon}
                    </div>
                )}
                <input
                    className={`
                        w-full px-4 py-3 rounded-xl
                        bg-slate-50 border border-slate-200
                        text-slate-800 placeholder-slate-400
                        focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:bg-white
                        transition-all text-sm
                        ${icon ? 'pl-11' : ''}
                        ${error ? 'border-red-400 focus:ring-red-100 focus:border-red-500' : ''}
                    `}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>
            )}
        </div>
    );
}
