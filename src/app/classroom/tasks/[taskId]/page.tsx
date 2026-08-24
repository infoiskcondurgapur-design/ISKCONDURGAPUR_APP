'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    FaArrowLeft, FaHeadphones, FaBookOpen, FaCalendarAlt, FaStar,
    FaMicrophone, FaStop, FaUpload, FaSpinner, FaPlay, FaCheck, FaTimes
} from 'react-icons/fa';

interface Assessment {
    _id: string;
    batchId: string;
    title: string;
    description?: string;
    youtubeUrl?: string;
    dueDate: string;
    points: number;
    isPinned: boolean;
    status: 'Published' | 'Closed' | 'Draft';
    category: string;
}

interface Submission {
    _id: string;
    textSubmission?: string;
    audioUrl?: string;
    fileUrl?: string;
    fileName?: string;
    status: string;
    submittedAt: string;
}

export default function TaskSubmissionPage() {
    const { taskId } = useParams();
    const router = useRouter();
    
    const [assessment, setAssessment] = useState<Assessment | null>(null);
    const [submission, setSubmission] = useState<Submission | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    // Form States
    const [textInput, setTextInput] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    
    // Audio Recorder States
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [recordingDuration, setRecordingDuration] = useState(0);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const rawUser = localStorage.getItem('auth_user');
        if (!rawUser) {
            router.push(`/auth/login?redirect=/classroom/tasks/${taskId}`);
            return;
        }
        fetchTaskDetails();
    }, [taskId, router]);

    // Handle timer for recording duration
    useEffect(() => {
        if (isRecording) {
            timerRef.current = setInterval(() => {
                setRecordingDuration((prev) => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRecording]);

    const fetchTaskDetails = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/classroom/tasks/${taskId}`);
            const data = await res.json();
            if (res.ok) {
                setAssessment(data.data.assessment);
                setSubmission(data.data.submission);
                if (data.data.submission) {
                    setTextInput(data.data.submission.textSubmission || '');
                    if (data.data.submission.audioUrl) {
                        setAudioUrl(data.data.submission.audioUrl);
                    }
                }
            }
        } catch (e) {
            console.error('Failed to load task details:', e);
        } finally {
            setLoading(false);
        }
    };

    // Microphone Recording Actions
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            
            const chunks: BlobPart[] = [];
            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));
            };

            setRecordingDuration(0);
            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error('Mic access error:', err);
            alert('Unable to access microphone. Please allow mic permissions in your browser settings.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            let fileUrl = submission?.fileUrl || '';
            let fileName = submission?.fileName || '';
            let audioFileUrl = audioUrl || '';

            // Simulate file uploads since we are running locally/fallback
            if (selectedFile) {
                fileUrl = `/uploads/${Date.now()}_${selectedFile.name}`;
                fileName = selectedFile.name;
            }
            if (audioBlob) {
                audioFileUrl = `/uploads/${Date.now()}_reflection.webm`;
            }

            const res = await fetch(`/api/classroom/tasks/${taskId}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    textSubmission: textInput,
                    audioUrl: audioFileUrl,
                    fileUrl,
                    fileName
                })
            });

            const data = await res.json();
            if (res.ok) {
                setSubmission(data.data);
                alert('Task submitted successfully!');
                
                // Redirect back to batch assessments page
                if (assessment?.batchId) {
                    router.push(`/classroom/batches/${assessment.batchId}`);
                } else {
                    router.push('/classroom');
                }
            } else {
                alert(data.message || 'Submission failed.');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to connect to the server.');
        } finally {
            setSubmitting(false);
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-28">
                <div className="flex items-center gap-3 text-gray-400">
                    <FaSpinner className="animate-spin text-3xl text-orange-500" />
                    <span>Loading task details...</span>
                </div>
            </div>
        );
    }

    if (!assessment) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-28">
                <div className="text-center p-8 bg-white rounded-xl shadow-sm border">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Task Not Found</h3>
                    <p className="text-gray-500 mb-4">This assessment task does not exist or has been deleted.</p>
                    <Link href="/classroom" className="text-orange-500 font-bold hover:underline">
                        Return to Classroom
                    </Link>
                </div>
            </div>
        );
    }

    const isListening = assessment.category.toLowerCase().includes('listening');

    return (
        <main className="min-h-screen bg-gray-50 pt-28 pb-20">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Back Link */}
                <button 
                    onClick={() => {
                        if (assessment.batchId) {
                            router.push(`/classroom/batches/${assessment.batchId}`);
                        } else {
                            router.push('/classroom');
                        }
                    }} 
                    className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-orange-500 transition-colors mb-6"
                >
                    <FaArrowLeft size={12} /> Back to Assessments
                </button>

                {/* Form Wrapper */}
                <form onSubmit={handleFormSubmit} className="space-y-6">
                    {/* Task Header Details Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6 relative overflow-hidden border-l-4 border-l-orange-400">
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                                    isListening ? 'bg-blue-50 text-blue-500' : 'bg-green-50 text-green-500'
                                }`}>
                                    {isListening ? <FaBookOpen size={20} /> : <FaBookOpen size={20} />}
                                </div>
                                <div className="space-y-2">
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                        <span className="bg-orange-50 text-orange-600 px-2.5 py-0.5 rounded-full text-[10px] tracking-wide uppercase font-semibold">
                                            {assessment.category}
                                        </span>
                                        <span className="text-xs text-orange-500 bg-orange-50 font-bold border border-orange-100 px-2.5 py-0.5 rounded-full">
                                            {assessment.status}
                                        </span>
                                    </div>
                                    <h2 className="text-2xl font-black text-gray-800 leading-tight">
                                        {assessment.title}
                                    </h2>
                                    {assessment.description && (
                                        <p className="text-gray-500 text-sm leading-relaxed max-w-3xl font-light">
                                            {assessment.description}
                                        </p>
                                    )}
                                    {assessment.youtubeUrl && (
                                        <div className="mt-3">
                                            <a 
                                                href={assessment.youtubeUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-sm font-semibold text-orange-500 hover:text-orange-600 hover:underline break-all"
                                            >
                                                {assessment.youtubeUrl}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Metadata Footer */}
                        <div className="border-t border-gray-100 mt-6 pt-4 flex flex-wrap gap-6 text-xs text-gray-400 font-semibold">
                            <span className="flex items-center gap-1.5">
                                <FaCalendarAlt size={13} />
                                Due: {new Date(assessment.dueDate).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'numeric',
                                    year: 'numeric'
                                })}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <FaStar size={13} className="text-yellow-400" />
                                {assessment.points} points
                            </span>
                            {submission && (
                                <span className="flex items-center gap-1 text-green-600 font-bold">
                                    <FaCheck /> Submitted on {new Date(submission.submittedAt).toLocaleDateString('en-IN')}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Text Submission Box */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-150 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-1">Text Submission</h3>
                        <p className="text-xs text-gray-500 mb-4">Write your response or submission text here.</p>
                        
                        <textarea
                            rows={6}
                            placeholder="Enter your submission text here..."
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            className="w-full border border-gray-200 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 rounded-lg p-4 text-sm outline-none transition-colors"
                        />
                    </div>

                    {/* Audio Recording Box */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-150 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-1">Audio Recording (Optional)</h3>
                        <p className="text-xs text-gray-500 mb-6">
                            Record your daily listening reflection using your microphone. Works best in Chrome or modern browsers.
                        </p>

                        <div className="flex flex-wrap items-center gap-4">
                            {!isRecording ? (
                                <button
                                    type="button"
                                    onClick={startRecording}
                                    className="bg-orange-50 hover:bg-orange-100 text-[#f27e2b] border border-orange-200 font-bold text-sm py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    <FaMicrophone /> Start Recording
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={stopRecording}
                                    className="bg-red-500 hover:bg-red-600 text-white font-bold text-sm py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    <FaStop /> Stop ({formatDuration(recordingDuration)})
                                </button>
                            )}

                            {isRecording && (
                                <span className="flex items-center gap-2 text-xs text-red-500 animate-pulse font-semibold">
                                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                                    Recording...
                                </span>
                            )}

                            {audioUrl && !isRecording && (
                                <div className="flex items-center gap-3">
                                    <audio src={audioUrl} controls className="h-10 max-w-[240px]" />
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setAudioBlob(null);
                                            setAudioUrl(null);
                                        }}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                        title="Delete recording"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            )}

                            {!audioUrl && !isRecording && (
                                <span className="text-xs text-gray-400">No recording yet.</span>
                            )}
                        </div>
                    </div>

                    {/* File Upload Box */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-150 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-1">File Upload</h3>
                        <p className="text-xs text-gray-500 mb-4">
                            Upload files: PDF, documents, pictures, videos, or audio (Max 500MB per file)
                        </p>

                        <div className="flex flex-wrap items-center gap-3">
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="border border-orange-100 hover:border-orange-400 hover:bg-orange-50 text-[#f27e2b] font-bold text-sm py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <FaUpload size={13} /> Select Files
                            </button>

                            {selectedFile ? (
                                <div className="flex items-center gap-2 text-xs bg-orange-50 text-orange-600 border border-orange-100 px-3 py-1.5 rounded-lg">
                                    <span className="font-semibold">{selectedFile.name}</span>
                                    <button 
                                        type="button" 
                                        onClick={() => setSelectedFile(null)}
                                        className="text-orange-400 hover:text-red-500"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            ) : submission?.fileName ? (
                                <div className="flex items-center gap-2 text-xs bg-gray-50 text-gray-600 border border-gray-250 px-3 py-1.5 rounded-lg">
                                    <span className="font-semibold">Current: {submission.fileName}</span>
                                </div>
                            ) : (
                                <span className="text-xs text-gray-400">No file selected.</span>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end items-center gap-4 mt-8 border-t pt-6">
                        <button
                            type="button"
                            onClick={() => {
                                if (assessment.batchId) {
                                    router.push(`/classroom/batches/${assessment.batchId}`);
                                } else {
                                    router.push('/classroom');
                                }
                            }}
                            className="bg-white border hover:bg-gray-50 text-gray-700 font-bold text-sm px-6 py-2.5 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        
                        <button
                            type="submit"
                            disabled={submitting || (!textInput.trim() && !audioBlob && !selectedFile)}
                            className="bg-[#f27e2b] hover:bg-orange-600 text-white font-bold text-sm px-8 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <>
                                    <FaSpinner className="animate-spin" /> Submitting...
                                </>
                            ) : (
                                'Submit'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
