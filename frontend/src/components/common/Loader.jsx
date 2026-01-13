import { HiOutlineAcademicCap, HiOutlineBookOpen, HiOutlinePencil } from 'react-icons/hi2';

export default function Loader({ text = 'Loading...' }) {
    return (
        <div className="student-loader">
            <div className="flex items-center gap-6">
                <div className="student-icon">
                    <HiOutlineAcademicCap className="w-full h-full text-blue-600" />
                </div>
                <div className="book-icon">
                    <HiOutlineBookOpen className="w-14 h-14 text-blue-400" />
                </div>
                <div className="pen-icon">
                    <HiOutlinePencil className="w-12 h-12 text-blue-300" />
                </div>
            </div>

            <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>

            <p className="text-slate-600 text-base font-semibold">{text}</p>
        </div>
    );
}
