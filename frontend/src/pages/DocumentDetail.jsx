import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import Card from '../components/common/Card';
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
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Back Button */}
            <Button
                variant="ghost"
                onClick={() => navigate('/documents')}
                className="pl-0 text-slate-500 hover:text-slate-700 font-medium h-auto"
            >
                <HiOutlineArrowLeft className="w-4 h-4 mr-2" />
                Back to Documents
            </Button>

            {/* Document Header */}
            <Card className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center">
                            <HiOutlineDocumentText className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold mb-2 text-slate-900">{document.title}</h1>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                <span className="flex items-center gap-1 font-medium">
                                    <HiOutlineClock className="w-4 h-4" />
                                    {new Date(document.created_at).toLocaleDateString()}
                                </span>
                                <span className="font-medium">{document.page_count || 1} pages</span>
                                <span className="uppercase font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-600">{document.file_type}</span>
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
                                    variant="ghost"
                                    onClick={handleReprocess}
                                    loading={reprocessing}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <HiOutlineArrowPath className="w-4 h-4 mr-2" />
                                    Retry
                                </Button>
                            </>
                        )}
                        {isReady && (
                            <Button onClick={() => setShowQuizModal(true)}>
                                <HiOutlineBookOpen className="w-4 h-4 mr-2" />
                                Create Quiz
                            </Button>
                        )}
                    </div>
                </div>
            </Card>

            {isProcessing && (
                <Card className="p-12 text-center border-dashed border-2 border-slate-200 shadow-none">
                    <Loader text="AI is analyzing your document..." />
                    <p className="text-sm text-slate-500 mt-4">
                        This may take a few moments depending on document size
                    </p>
                </Card>
            )}

            {isReady && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Summary */}
                        <Card className="p-6 h-full">
                            <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <HiOutlineBookOpen className="w-5 h-5 text-blue-600" />
                                </div>
                                <h2 className="text-lg font-bold text-slate-900">Summary</h2>
                            </div>
                            <div className="prose prose-slate prose-sm text-slate-600 leading-relaxed max-w-none">
                                {document.summary || 'No summary available'}
                            </div>
                        </Card>

                        {/* Easy Explanation */}
                        <Card className="p-6 h-full">
                            <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                                    <HiOutlineLightBulb className="w-5 h-5 text-amber-600" />
                                </div>
                                <h2 className="text-lg font-bold text-slate-900">Easy Explanation</h2>
                            </div>
                            <div className="prose prose-slate prose-sm text-slate-600 leading-relaxed max-w-none">
                                {document.easy_explanation || 'No explanation available'}
                            </div>
                        </Card>

                        {/* Key Concepts */}
                        {document.key_concepts && document.key_concepts.length > 0 && (
                            <Card className="p-6 lg:col-span-2">
                                <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                        <HiOutlineTag className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <h2 className="text-lg font-bold text-slate-900">Key Concepts</h2>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {document.key_concepts.map((concept, index) => (
                                        <span
                                            key={index}
                                            className="px-4 py-2 bg-slate-50 text-slate-700 rounded-lg font-medium text-sm border border-slate-200"
                                        >
                                            {concept}
                                        </span>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>
                    
                    {/* Wiki Context */}
                    {document.wiki_context && document.wiki_context.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <HiOutlineLightBulb className="w-5 h-5 text-yellow-500" />
                                Knowledge Context
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {document.wiki_context.map((bg, idx) => (
                                    <Card key={idx} className="p-4 bg-slate-50 border-slate-200">
                                        <h4 className="font-bold text-slate-800 mb-2">{bg.term}</h4>
                                        <p className="text-xs text-slate-600 mb-3 line-clamp-4">{bg.definition}</p>
                                        <a 
                                            href={bg.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                                        >
                                            Read on Wikipedia →
                                        </a>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Page Insights */}
                    {document.page_summaries && document.page_summaries.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <HiOutlineDocumentText className="w-5 h-5 text-blue-500" />
                                Page-by-Page Analysis
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                {document.page_summaries.map((page) => (
                                    <Card key={page.page_number} className="p-4 border-l-4 border-l-blue-500">
                                        <div className="flex flex-col md:flex-row gap-4">
                                            <div className="md:w-32 flex-shrink-0">
                                                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full mb-2">
                                                    Page {page.page_number}
                                                </span>
                                                {page.focus_topic && (
                                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                                        {page.focus_topic}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-slate-700 mb-3 font-medium leading-relaxed">
                                                    {page.content}
                                                </p>
                                                {page.key_points && page.key_points.length > 0 && (
                                                    <ul className="list-disc list-inside text-xs text-slate-500 space-y-1 bg-slate-50 p-3 rounded-lg">
                                                        {page.key_points.map((point, k) => (
                                                            <li key={k}>{point}</li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
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
