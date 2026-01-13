export default function Card({ children, className = '', onClick }) {
    return (
        <div
            className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md hover:border-slate-300 transition-all' : ''} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
}
