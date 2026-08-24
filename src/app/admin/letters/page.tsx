'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    FaEnvelopeOpen, FaPlus, FaEdit, FaTrash, FaSearch, FaFilter,
    FaSave, FaTimes, FaUpload, FaChevronLeft, FaChevronRight, FaSpinner,
    FaCheckCircle, FaExclamationTriangle, FaDownload
} from 'react-icons/fa';

const CATEGORIES = [
    'General', 'Spiritual Practice', 'Preaching', 'Book Distribution',
    'Community & Farm', 'Discipleship', 'Deity Worship', 'Management',
    'Education', 'Philosophy', 'Festivals', 'Other'
];

const BLANK_FORM = {
    title: '', recipient: '', date: '', location: '', category: 'General', body: '', tags: ''
};

function Toast({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) {
    useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
    return (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-white text-sm font-semibold max-w-sm transition-all ${type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
            {type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
            {msg}
            <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><FaTimes size={12} /></button>
        </div>
    );
}

export default function AdminLettersPage() {
    const [letters, setLetters] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [page, setPage] = useState(1);
    const [categories, setCategories] = useState<string[]>(['All']);
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [isLoading, setIsLoading] = useState(true);

    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
    const showToast = (msg: string, type: 'success' | 'error' = 'success') => setToast({ msg, type });

    // Modals
    const [modal, setModal] = useState<'add' | 'edit' | 'bulk' | null>(null);
    const [form, setForm] = useState({ ...BLANK_FORM });
    const [editId, setEditId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Bulk import
    const [bulkJson, setBulkJson] = useState('');
    const [bulkError, setBulkError] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);

    const token = typeof window !== 'undefined' ? localStorage.getItem('iskcon_admin_token') || '' : '';

    const fetchLetters = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: '20' });
            if (search) params.set('search', search);
            if (filterCategory !== 'All') params.set('category', filterCategory);
            const res = await fetch(`/api/admin/letters?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setLetters(data.letters);
                setTotal(data.total);
                setPages(data.pages);
                setCategories(data.categories);
            }
        } finally {
            setIsLoading(false);
        }
    }, [page, search, filterCategory, token]);

    useEffect(() => { fetchLetters(); }, [fetchLetters]);

    // Debounce search
    const searchTimeout = useRef<any>(null);
    const handleSearch = (val: string) => {
        setSearch(val);
        setPage(1);
        clearTimeout(searchTimeout.current);
    };

    const openAdd = () => { setForm({ ...BLANK_FORM }); setModal('add'); };
    const openEdit = (letter: any) => {
        setEditId(letter._id);
        setForm({
            title: letter.title, recipient: letter.recipient, date: letter.date,
            location: letter.location || '', category: letter.category || 'General',
            body: letter.body, tags: (letter.tags || []).join(', ')
        });
        setModal('edit');
    };

    const handleSave = async () => {
        if (!form.title || !form.recipient || !form.date || !form.body) {
            showToast('Please fill all required fields', 'error'); return;
        }
        setIsSaving(true);
        try {
            const payload = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [] };
            const url = modal === 'edit' ? `/api/admin/letters/${editId}` : '/api/admin/letters';
            const method = modal === 'edit' ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                showToast(modal === 'edit' ? 'Letter updated!' : 'Letter added!');
                setModal(null);
                fetchLetters();
            } else {
                const d = await res.json();
                showToast(d.error || 'Failed to save', 'error');
            }
        } finally { setIsSaving(false); }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Delete "${title}"?`)) return;
        const res = await fetch(`/api/admin/letters/${id}`, {
            method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) { showToast('Letter deleted'); fetchLetters(); }
        else showToast('Failed to delete', 'error');
    };

    const handleBulkFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setBulkJson(ev.target?.result as string);
        reader.readAsText(file);
    };

    const handleBulkImport = async () => {
        setBulkError('');
        let parsed: any;
        try { parsed = JSON.parse(bulkJson); } catch {
            setBulkError('Invalid JSON. Please check the file format.'); return;
        }
        const letters = Array.isArray(parsed) ? parsed : parsed.letters;
        if (!Array.isArray(letters) || letters.length === 0) {
            setBulkError('JSON must be an array of letters or { letters: [...] }'); return;
        }
        setIsSaving(true);
        try {
            const res = await fetch('/api/admin/letters', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ letters })
            });
            const data = await res.json();
            if (res.ok) {
                showToast(data.message || `Imported ${letters.length} letters`);
                setModal(null);
                setBulkJson('');
                fetchLetters();
            } else {
                setBulkError(data.error || 'Import failed');
            }
        } finally { setIsSaving(false); }
    };

    const downloadTemplate = () => {
        const sample = [
            {
                title: "Letter Title",
                recipient: "Disciple Name",
                date: "January 1, 1970",
                location: "City, Country",
                category: "Spiritual Practice",
                body: "My Dear ...,\n\nFull letter text here.\n\nYour ever well-wisher,\nA.C. Bhaktivedanta Swami",
                tags: ["chanting", "sadhana"]
            }
        ];
        const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'letters-template.json'; a.click();
    };

    const FormField = ({ label, required, children }: any) => (
        <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                {label}{required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {children}
        </div>
    );

    const inputCls = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-gray-50 transition";

    return (
        <div className="min-h-screen bg-[#F8F9FC] p-6 lg:p-10">
            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">
                            Prabhupada <span className="text-[#FF6B00]">Letters</span>
                        </h1>
                        <p className="text-gray-500 mt-1 text-sm">
                            {total.toLocaleString('en-IN')} letters in the collection
                        </p>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                        <button
                            onClick={() => setModal('bulk')}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:border-amber-400 hover:text-amber-700 transition shadow-sm"
                        >
                            <FaUpload size={13} /> Bulk Import
                        </button>
                        <button
                            onClick={openAdd}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#FF6B00] text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition shadow-md shadow-orange-500/20"
                        >
                            <FaPlus size={13} /> Add Letter
                        </button>
                    </div>
                </div>

                {/* Search & Filter bar */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                        <input
                            type="text"
                            placeholder="Search by title, recipient, contentΓÇª"
                            value={search}
                            onChange={e => handleSearch(e.target.value)}
                            className={`${inputCls} pl-10`}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <FaFilter className="text-gray-400 text-sm" />
                        <select
                            value={filterCategory}
                            onChange={e => { setFilterCategory(e.target.value); setPage(1); }}
                            className={inputCls}
                        >
                            {categories.map(c => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-24 text-gray-400">
                            <FaSpinner className="animate-spin mr-3" size={20} /> LoadingΓÇª
                        </div>
                    ) : letters.length === 0 ? (
                        <div className="text-center py-24 text-gray-400">
                            <FaEnvelopeOpen className="text-5xl mx-auto mb-4 text-gray-200" />
                            <p className="font-semibold text-lg">No letters found</p>
                            <p className="text-sm mt-1">Add your first letter or import a JSON file.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Title</th>
                                        <th className="px-4 py-4">Recipient</th>
                                        <th className="px-4 py-4">Date</th>
                                        <th className="px-4 py-4">Category</th>
                                        <th className="px-4 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {letters.map(letter => (
                                        <tr key={letter._id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4 max-w-xs">
                                                <p className="font-semibold text-gray-900 truncate">{letter.title}</p>
                                                <p className="text-xs text-gray-400 mt-0.5 truncate">{letter.location}</p>
                                            </td>
                                            <td className="px-4 py-4 text-gray-600 whitespace-nowrap">{letter.recipient}</td>
                                            <td className="px-4 py-4 text-gray-500 whitespace-nowrap text-xs">{letter.date}</td>
                                            <td className="px-4 py-4">
                                                <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[11px] font-bold whitespace-nowrap">
                                                    {letter.category}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => openEdit(letter)}
                                                        className="p-2 text-gray-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition"
                                                        title="Edit"
                                                    >
                                                        <FaEdit size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(letter._id, letter.title)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                        title="Delete"
                                                    >
                                                        <FaTrash size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {pages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                            <p className="text-sm text-gray-500">
                                Page <span className="font-bold text-gray-800">{page}</span> of <span className="font-bold text-gray-800">{pages}</span>
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:border-amber-400 hover:text-amber-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                >
                                    <FaChevronLeft size={13} />
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(pages, p + 1))}
                                    disabled={page === pages}
                                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:border-amber-400 hover:text-amber-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                >
                                    <FaChevronRight size={13} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ΓöÇΓöÇ Add / Edit Modal ΓöÇΓöÇ */}
            {(modal === 'add' || modal === 'edit') && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
                            <h2 className="text-xl font-black text-gray-900">
                                {modal === 'edit' ? 'Edit Letter' : 'Add New Letter'}
                            </h2>
                            <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-800 p-1 transition">
                                <FaTimes size={18} />
                            </button>
                        </div>
                        <div className="px-7 py-6 space-y-5">
                            <FormField label="Title" required>
                                <input className={inputCls} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. On Chanting Sixteen Rounds" />
                            </FormField>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="Recipient" required>
                                    <input className={inputCls} value={form.recipient} onChange={e => setForm(f => ({ ...f, recipient: e.target.value }))} placeholder="e.g. Hayagriva Das" />
                                </FormField>
                                <FormField label="Date" required>
                                    <input className={inputCls} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} placeholder="e.g. September 14, 1967" />
                                </FormField>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="Location">
                                    <input className={inputCls} value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Vrindavan, India" />
                                </FormField>
                                <FormField label="Category">
                                    <select className={inputCls} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </FormField>
                            </div>
                            <FormField label="Full Letter Text" required>
                                <textarea
                                    className={`${inputCls} min-h-[300px] font-mono text-xs leading-relaxed resize-y`}
                                    value={form.body}
                                    onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                                    placeholder={"My Dear ...,\n\nPlease accept my blessings...\n\nYour ever well-wisher,\nA.C. Bhaktivedanta Swami"}
                                />
                            </FormField>
                            <FormField label="Tags (comma-separated)">
                                <input className={inputCls} value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="e.g. chanting, sadhana, morning program" />
                            </FormField>
                        </div>
                        <div className="flex justify-end gap-3 px-7 pb-6">
                            <button onClick={() => setModal(null)} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 transition">Cancel</button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-6 py-2.5 bg-[#FF6B00] text-white rounded-xl text-sm font-bold hover:bg-orange-600 disabled:opacity-50 transition shadow-md shadow-orange-500/20"
                            >
                                {isSaving ? <FaSpinner className="animate-spin" size={13} /> : <FaSave size={13} />}
                                {isSaving ? 'SavingΓÇª' : 'Save Letter'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ΓöÇΓöÇ Bulk Import Modal ΓöÇΓöÇ */}
            {modal === 'bulk' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
                            <h2 className="text-xl font-black text-gray-900">Bulk Import Letters</h2>
                            <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-800 p-1 transition"><FaTimes size={18} /></button>
                        </div>
                        <div className="px-7 py-6 space-y-5">
                            {/* Instructions */}
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
                                <p className="font-bold mb-2">≡ƒôï Import Format</p>
                                <p className="text-xs leading-relaxed">Upload a JSON file with an array of letters. Each letter must have: <code className="bg-amber-100 px-1 rounded">title</code>, <code className="bg-amber-100 px-1 rounded">recipient</code>, <code className="bg-amber-100 px-1 rounded">date</code>, <code className="bg-amber-100 px-1 rounded">body</code>. Optional: <code className="bg-amber-100 px-1 rounded">location</code>, <code className="bg-amber-100 px-1 rounded">category</code>, <code className="bg-amber-100 px-1 rounded">tags</code>.</p>
                                <button onClick={downloadTemplate} className="mt-3 flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-900 transition">
                                    <FaDownload size={10} /> Download JSON template
                                </button>
                            </div>

                            {/* File upload */}
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Upload JSON File</label>
                                <div
                                    onClick={() => fileRef.current?.click()}
                                    className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/30 transition-all"
                                >
                                    <FaUpload className="text-3xl text-gray-300 mx-auto mb-3" />
                                    <p className="text-sm text-gray-500 font-medium">Click to upload <span className="font-bold text-amber-700">.json</span> file</p>
                                    {bulkJson && <p className="text-xs text-emerald-600 font-bold mt-2">Γ£ô File loaded ΓÇö {JSON.parse(bulkJson)?.length || (JSON.parse(bulkJson)?.letters?.length ?? '?')} letters detected</p>}
                                </div>
                                <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleBulkFile} />
                            </div>

                            {/* Or paste JSON */}
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Or Paste JSON directly</label>
                                <textarea
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-mono min-h-[160px] focus:outline-none focus:ring-2 focus:ring-amber-400 bg-gray-50 resize-y transition"
                                    placeholder='[{"title":"...", "recipient":"...", "date":"...", "body":"..."}]'
                                    value={bulkJson}
                                    onChange={e => { setBulkJson(e.target.value); setBulkError(''); }}
                                />
                            </div>

                            {bulkError && (
                                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 font-semibold">
                                    ΓÜá∩╕Å {bulkError}
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-3 px-7 pb-6">
                            <button onClick={() => { setModal(null); setBulkJson(''); setBulkError(''); }} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 transition">Cancel</button>
                            <button
                                onClick={handleBulkImport}
                                disabled={!bulkJson || isSaving}
                                className="flex items-center gap-2 px-6 py-2.5 bg-[#FF6B00] text-white rounded-xl text-sm font-bold hover:bg-orange-600 disabled:opacity-50 transition shadow-md shadow-orange-500/20"
                            >
                                {isSaving ? <FaSpinner className="animate-spin" size={13} /> : <FaUpload size={13} />}
                                {isSaving ? 'ImportingΓÇª' : 'Import Letters'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
