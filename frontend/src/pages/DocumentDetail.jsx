import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import QuizCreator from '../components/quiz/QuizCreator';
import { documentsAPI } from '../api/documents';
import { quizAPI } from '../api/quiz';
import {
    HiOutlineDocumentText,
    HiOutlineBookOpen,
    HiOutlineLightBulb,
    HiOutlineTag,
    HiOutlineArrowPath,
    HiOutlineArrowLeft,
    HiOutlineClock
} from 'react-icons/hi2';

export default function DocumentDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [document, setDocument] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showQuizModal, setShowQuizModal] = useState(false);
    const [creatingQuiz, setCreatingQuiz] = useState(false);
    const [reprocessing, setReprocessing] = useState(false);

    useEffect(() => {
        fetchDocument();
        const interval = setInterval(fetchDocument, 5000);
        return () => clearInterval(interval);
    }, [id]);

    const fetchDocument = async () => {
        try {
            const data = await documentsAPI.get(id);
            setDocument(data);
        } catch (error) {
            console.error('Failed to fetch document:', error);
            navigate('/documents');
        } finally {
            setLoading(false);
        }
    };

    const handleReprocess = async () => {
        setReprocessing(true);
        try {
            await documentsAPI.reprocess(id);
            await fetchDocument();
        } catch (error) {
            console.error('Reprocess failed:', error);
        } finally {
            setReprocessing(false);
        }
    };

    const handleCreateQuiz = async (quizData) => {
        setCreatingQuiz(true);
        try {
            const quiz = await quizAPI.create(quizData);
            setShowQuizModal(false);
            navigate(`/quiz/${quiz.id}`);
        } catch (error) {
            console.error('Quiz creation failed:', error);
            alert('Failed to create quiz. Please try again.');
        } finally {
            setCreatingQuiz(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader text="Loading document..." />
            </div>
        );
    }

    if (!document) {
        return null;
    }

    const isProcessing = document.processing_status === 'processing' || document.processing_status === 'pending';
    const isFailed = document.processing_status === 'failed';
    const isReady = document.processing_status === 'completed';

    return (
        <div className="p-6">
            {/* Back Button */}
            <button
                onClick={() => navigate('/documents')}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 font-medium transition-colors text-sm"
            >
                <HiOutlineArrowLeft className="w-4 h-4" />
                Back to Documents
            </button>

            {/* Document Header */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
                            <HiOutlineDocumentText className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold mb-2 text-slate-800">{document.title}</h1>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                <span className="flex items-center gap-1 font-medium">
                                    <HiOutlineClock className="w-4 h-4" />
                                    {new Date(document.created_at).toLocaleDateString()}
                                </span>
                                <span className="font-medium">{document.page_count || 1} pages</span>
                                <span className="uppercase font-medium bg-slate-100 px-2 py-0.5 rounded">{document.file_type}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {isProcessing && (
                            <Badge variant="warning">
                                <HiOutlineArrowPath className="w-3.5 h-3.5 mr-1 animate-spin" />
                                Processing...
                            </Badge>
                        )}
                        {isFailed && (
                            <>
                                <Badge variant="error">Failed</Badge>
                                <Button
                                    variant="secondary"
                                    onClick={handleReprocess}
                                    loading={reprocessing}
                                >
                                    <HiOutlineArrowPath className="w-4 h-4" />
                                    Retry
                                </Button>
                            </>
                        )}
                        {isReady && (
                            <Button onClick={() => setShowQuizModal(true)}>
                                <HiOutlineBookOpen className="w-4 h-4" />
                                Create Quiz
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {isProcessing && (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
                    <Loader text="AI is analyzing your document..." />
                    <p className="text-sm text-slate-500 mt-4">
                        This may take a few moments depending on document size
                    </p>
                </div>
            )}

            {isReady && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Summary */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                <HiOutlineBookOpen className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800">Summary</h2>
                        </div>
                        <p className="text-slate-600 whitespace-pre-line leading-relaxed text-sm">
                            {document.summary || 'No summary available'}
                        </p>
                    </div>

                    {/* Easy Explanation */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                                <HiOutlineLightBulb className="w-5 h-5 text-amber-600" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800">Easy Explanation</h2>
                        </div>
                        <p className="text-slate-600 whitespace-pre-line leading-relaxed text-sm">
                            {document.easy_explanation || 'No explanation available'}
                        </p>
                    </div>

                    {/* Key Concepts */}
                    {document.key_concepts && document.key_concepts.length > 0 && (
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm lg:col-span-2">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <HiOutlineTag className="w-5 h-5 text-blue-600" />
                                </div>
                                <h2 className="text-lg font-bold text-slate-800">Key Concepts</h2>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {document.key_concepts.map((concept, index) => (
                                    <span
                                        key={index}
                                        className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-medium text-sm"
                                    >
                                        {concept}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Quiz Creation Modal */}
            <Modal
                isOpen={showQuizModal}
                onClose={() => setShowQuizModal(false)}
                title="Create Quiz"
            >
                <QuizCreator
                    documentId={document.id}
                    documentTitle={document.title}
                    onSubmit={handleCreateQuiz}
                    loading={creatingQuiz}
                />
            </Modal>
        </div>
    );
}
