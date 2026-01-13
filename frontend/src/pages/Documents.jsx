import { useState, useEffect } from 'react';
import UploadZone from '../components/documents/UploadZone';
import DocumentCard from '../components/documents/DocumentCard';
import Loader from '../components/common/Loader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { documentsAPI } from '../api/documents';
import { HiOutlineDocumentText, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi2';

export default function Documents() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchDocuments();
    }, [page]);

    const fetchDocuments = async () => {
        try {
            const data = await documentsAPI.list(page, 12);
            setDocuments(data.documents || []);
            setTotal(data.total || 0);
        } catch (error) {
            console.error('Failed to fetch documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (file) => {
        setUploading(true);
        try {
            const newDoc = await documentsAPI.upload(file);
            setDocuments([newDoc, ...documents]);
            setTotal(total + 1);
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this document?')) return;

        try {
            await documentsAPI.delete(id);
            setDocuments(documents.filter(d => d.id !== id));
            setTotal(total - 1);
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader text="Loading documents..." />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Documents</h1>
                <p className="text-slate-500 text-sm mt-1">Upload and manage your learning materials</p>
            </div>

            {/* Upload Section */}
            <Card className="p-6">
                <h2 className="text-base font-semibold text-slate-900 mb-4">Upload New Document</h2>
                <UploadZone onUpload={handleUpload} loading={uploading} />
            </Card>

            {/* Documents List */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-slate-900">Your Documents</h2>
                    <span className="text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full">{total} documents</span>
                </div>

                {documents.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {documents.map((doc) => (
                            <DocumentCard
                                key={doc.id}
                                document={doc}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                ) : (
                    <Card className="p-12 text-center border-dashed border-2 border-slate-200 shadow-none">
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                            <HiOutlineDocumentText className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-base font-semibold mb-2 text-slate-900">No documents yet</h3>
                        <p className="text-sm text-slate-500 mb-4 max-w-sm mx-auto">
                            Upload your first document to get started with AI-powered learning
                        </p>
                    </Card>
                )}

                {/* Pagination */}
                {total > 12 && (
                    <div className="flex justify-center gap-3 mt-8">
                        <Button
                            variant="secondary"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="flex items-center gap-2 px-4 py-2"
                        >
                            <HiOutlineChevronLeft className="w-4 h-4" />
                            Previous
                        </Button>
                        <span className="flex items-center px-4 text-sm text-slate-600 font-medium">
                            Page {page} of {Math.ceil(total / 12)}
                        </span>
                        <Button
                            variant="secondary"
                            onClick={() => setPage(p => p + 1)}
                            disabled={page >= Math.ceil(total / 12)}
                            className="flex items-center gap-2 px-4 py-2"
                        >
                            Next
                            <HiOutlineChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
