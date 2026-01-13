export default function Loader({ text = 'Loading...' }) {
    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <div className="relative w-12 h-12">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-100 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
            </div>
            {text && (
                <p className="text-slate-500 text-sm font-medium animate-pulse">
                    {text}
                </p>
            )}
        </div>
    );
}
