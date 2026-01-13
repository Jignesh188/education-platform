export default function Card({ children, className = '', onClick, hover = false }) {
    return (
        <div
            className={`
                card-base 
                ${hover || onClick ? 'card-hover cursor-pointer' : ''} 
                ${className}
            `}
            onClick={onClick}
        >
            {children}
        </div>
    );
}
