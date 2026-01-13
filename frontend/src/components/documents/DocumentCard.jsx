import { useNavigate } from 'react-router-dom';
import {
    HiOutlineDocumentText,
    HiOutlinePhoto,
    HiOutlineDocument,
    HiOutlineClock,
    HiOutlineCheckCircle,
    HiOutlineExclamationCircle,
    HiOutlineArrowPath,
    HiOutlineTrash
} from 'react-icons/hi2';
import Badge from '../common/Badge';
import Card from '../common/Card';

export default function DocumentCard({ document, onDelete }) {
    const navigate = useNavigate();

    const getFileIcon = (type) => {
        switch (type) {
            case 'pdf':
                return <HiOutlineDocumentText className="w-7 h-7 text-red-500" />;
            case 'image':
                return <HiOutlinePhoto className="w-7 h-7 text-blue-500" />;
            default:
                return <HiOutlineDocument className="w-7 h-7 text-slate-500" />;
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed':
                return (
                    <Badge variant="success">
                        <HiOutlineCheckCircle className="w-3.5 h-3.5 mr-1" />
                        Ready
                    </Badge>
                );
            case 'processing':
                return (
                    <Badge variant="warning">
                        <HiOutlineArrowPath className="w-3.5 h-3.5 mr-1 animate-spin" />
                        Processing
                    </Badge>
                );
            case 'failed':
                return (
                    <Badge variant="error">
                        <HiOutlineExclamationCircle className="w-3.5 h-3.5 mr-1" />
                        Failed
                    </Badge>
                );
            default:
                return (
                    <Badge variant="primary">
                        <HiOutlineClock className="w-3.5 h-3.5 mr-1" />
                        Pending
                    </Badge>
                );
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <Card
            hover
            onClick={() => navigate(`/documents/${document.id}`)}
            className="group p-5 bg-white border border-slate-200"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center">
                    {getFileIcon(document.file_type)}
                </div>
                <div className="flex items-center gap-2">
                    {getStatusBadge(document.processing_status)}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(document.id);
                        }}
                        className="p-2 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all"
                    >
                        <HiOutlineTrash className="w-4 h-4 text-red-500" />
                    </button>
                </div>
            </div>

            <h3 className="font-semibold text-sm mb-2 truncate text-slate-900">{document.title}</h3>

            {document.summary && (
                <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                    {document.summary}
                </p>
            )}

            <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-100">
                <span className="font-medium">{document.page_count || 1} pages</span>
                <span>{formatDate(document.created_at)}</span>
            </div>
        </Card>
    );
}
