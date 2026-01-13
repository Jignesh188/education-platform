import { useState, useRef } from 'react';
import { HiOutlineCloudArrowUp, HiOutlineDocumentText, HiOutlinePhoto, HiOutlineDocument, HiOutlineXMark } from 'react-icons/hi2';

export default function UploadZone({ onUpload, loading }) {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const inputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file) => {
        setSelectedFile(file);
    };

    const handleUpload = () => {
        if (selectedFile) {
            onUpload(selectedFile);
            setSelectedFile(null);
        }
    };

    const getFileIcon = (type) => {
        if (type?.includes('pdf')) return <HiOutlineDocumentText className="w-10 h-10 text-red-500" />;
        if (type?.includes('image')) return <HiOutlinePhoto className="w-10 h-10 text-blue-500" />;
        return <HiOutlineDocument className="w-10 h-10 text-slate-500" />;
    };

    const formatSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="w-full">
            <div
                className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer bg-white ${dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    onChange={handleChange}
                    accept=".pdf,.docx,.doc,.jpg,.jpeg,.png,.gif,.webp"
                    className="hidden"
                />

                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
                        <HiOutlineCloudArrowUp className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-base font-semibold text-slate-800 mb-1">
                            Drag & drop your file here
                        </p>
                        <p className="text-sm text-slate-500">
                            or click to browse • PDF, DOCX, Images supported
                        </p>
                    </div>
                </div>
            </div>

            {selectedFile && (
                <div className="mt-4 p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {getFileIcon(selectedFile.type)}
                            <div>
                                <p className="font-semibold text-sm text-slate-800 truncate max-w-[200px]">{selectedFile.name}</p>
                                <p className="text-xs text-slate-500 mt-1">{formatSize(selectedFile.size)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedFile(null);
                                }}
                                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                <HiOutlineXMark className="w-5 h-5 text-slate-400" />
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={loading}
                                className="px-5 py-2.5 bg-blue-900 text-white rounded-xl font-semibold text-sm hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Uploading...' : 'Upload'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
