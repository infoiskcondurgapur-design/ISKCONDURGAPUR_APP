'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaPlus, FaTrash, FaArrowLeft, FaSave } from 'react-icons/fa';

interface FormFieldInput {
  label: string;
  type: 'text' | 'number' | 'email' | 'textarea' | 'select' | 'file' | 'checkbox';
  required: boolean;
  optionsString: string; // comma-separated options for selects
}

export default function EditCustomFormPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Configurations
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [syncToGoogleDrive, setSyncToGoogleDrive] = useState(false);
  const [googleDriveFolderId, setGoogleDriveFolderId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [opensAt, setOpensAt] = useState('');
  const [closesAt, setClosesAt] = useState('');
  const [fields, setFields] = useState<FormFieldInput[]>([]);

  useEffect(() => {
    const checkAuth = () => {
      const authToken = localStorage.getItem('iskcon_admin_token');
      if (!authToken) {
        router.push('/admin/login');
        return;
      }
      setIsAuthenticated(true);
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    const fetchFormDetails = async () => {
      try {
        const response = await fetch(`/api/forms/${params.id}`);
        const result = await response.json();
        
        if (response.ok && result.data) {
          setTitle(result.data.title);
          setDescription(result.data.description || '');
          setSyncToGoogleDrive(result.data.syncToGoogleDrive || false);
          setGoogleDriveFolderId(result.data.googleDriveFolderId || '');
          setIsActive(result.data.isActive !== undefined ? result.data.isActive : true);

          const formatDateTimeLocal = (dateStr?: string | Date) => {
            if (!dateStr) return '';
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return '';
            const pad = (n: number) => n.toString().padStart(2, '0');
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
          };

          setOpensAt(formatDateTimeLocal(result.data.opensAt));
          setClosesAt(formatDateTimeLocal(result.data.closesAt));
          
          const mappedFields = result.data.fields.map((f: any) => ({
            label: f.label,
            type: f.type,
            required: f.required,
            optionsString: f.options ? f.options.join(', ') : ''
          }));
          setFields(mappedFields);
        } else {
          setError(result.message || 'Failed to load form details');
        }
      } catch (err) {
        console.error('Error fetching form details:', err);
        setError('Failed to load form details');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchFormDetails();
    }
  }, [isAuthenticated, params.id]);

  const handleAddField = () => {
    setFields(prev => [
      ...prev,
      { label: '', type: 'text', required: false, optionsString: '' }
    ]);
  };

  const handleRemoveField = (index: number) => {
    setFields(prev => prev.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index: number, key: keyof FormFieldInput, value: any) => {
    setFields(prev => prev.map((f, i) => i === index ? { ...f, [key]: value } : f));
  };

  const slugify = (text: string): string => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '_');
  };

  const toISODateString = (localDateStr: string) => {
    if (!localDateStr) return undefined;
    const date = new Date(localDateStr);
    return isNaN(date.getTime()) ? undefined : date.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    // Validate inputs
    if (!title.trim()) {
      setError('Form Title is required');
      setIsSaving(false);
      return;
    }

    if (fields.length === 0) {
      setError('At least one field is required');
      setIsSaving(false);
      return;
    }

    for (let i = 0; i < fields.length; i++) {
      if (!fields[i].label.trim()) {
        setError(`Label is required for field #${i + 1}`);
        setIsSaving(false);
        return;
      }
    }

    // Process fields formatting
    const formattedFields = fields.map(f => ({
      name: slugify(f.label),
      label: f.label.trim(),
      type: f.type,
      required: f.required,
      options: f.type === 'select' 
        ? f.optionsString.split(',').map(o => o.trim()).filter(Boolean)
        : undefined
    }));

    try {
      const authToken = localStorage.getItem('iskcon_admin_token');
      const response = await fetch(`/api/forms/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          title,
          description,
          syncToGoogleDrive,
          googleDriveFolderId,
          isActive,
          opensAt: toISODateString(opensAt),
          closesAt: toISODateString(closesAt),
          fields: formattedFields
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update form');
      }

      router.push('/admin/custom-forms');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC]">
        <div className="w-16 h-16 border-t-4 border-[#FF6B00] border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] p-6 lg:p-10 font-sans text-gray-800">
      <div className="max-w-4xl mx-auto">
        
        {/* Back navigation */}
        <Link
          href="/admin/custom-forms"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold mb-6 transition"
        >
          <FaArrowLeft /> Back to Forms
        </Link>

        {/* Title */}
        <h1 className="text-3xl font-black text-gray-900 mb-8">
          Edit <span className="text-[#FF6B00]">Custom Form</span>
        </h1>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-100 p-4 rounded-2xl font-semibold mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Metadata */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">Form Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Form Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IDC Exam Submission"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea
                  placeholder="e.g. Please upload your ISKCON Disciple Course exam answers here."
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                />
              </div>

              <div className="flex flex-col gap-4 pt-2">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="font-bold text-gray-700">Form Active (Accepting submissions)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={syncToGoogleDrive}
                    onChange={(e) => setSyncToGoogleDrive(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="font-bold text-gray-700">Sync uploaded files to Google Drive</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Opening Time (Optional)</label>
                  <input
                    type="datetime-local"
                    value={opensAt}
                    onChange={(e) => setOpensAt(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  />
                  <p className="text-gray-400 text-xs mt-1.5 leading-relaxed">
                    Leave blank to open immediately.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Closing Time (Optional)</label>
                  <input
                    type="datetime-local"
                    value={closesAt}
                    onChange={(e) => setClosesAt(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  />
                  <p className="text-gray-400 text-xs mt-1.5 leading-relaxed">
                    Leave blank to remain open indefinitely.
                  </p>
                </div>
              </div>

              {syncToGoogleDrive && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Google Drive Folder ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="Enter the Google Drive folder ID to store uploads"
                    value={googleDriveFolderId}
                    onChange={(e) => setGoogleDriveFolderId(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all font-mono"
                  />
                  <p className="text-gray-400 text-xs mt-1.5 leading-relaxed">
                    Make sure the shared folder is shared with your Google Service Account email address. Leave blank to upload to the Drive root.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Form Fields */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h2 className="text-xl font-bold text-gray-900">Fields Designer</h2>
              <button
                type="button"
                onClick={handleAddField}
                className="flex items-center gap-1.5 text-sm bg-orange-50 text-[#FF6B00] border border-orange-100 px-4 py-2 rounded-xl font-bold hover:bg-orange-100 transition active:scale-95"
              >
                <FaPlus /> Add Field
              </button>
            </div>

            <div className="space-y-6 divide-y divide-gray-50">
              {fields.map((field, index) => (
                <div key={index} className="pt-6 first:pt-0 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    
                    {/* Index */}
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-sm mt-2">
                      {index + 1}
                    </div>

                    {/* Field Editor Block */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      {/* Label Input */}
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Field Label</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Phone Number"
                          value={field.label}
                          onChange={(e) => handleFieldChange(index, 'label', e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                        />
                      </div>

                      {/* Type Dropdown */}
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Input Type</label>
                        <select
                          value={field.type}
                          onChange={(e) => handleFieldChange(index, 'type', e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                        >
                          <option value="text">Text Input</option>
                          <option value="number">Number</option>
                          <option value="email">Email</option>
                          <option value="textarea">Paragraph Text</option>
                          <option value="select">Dropdown Select</option>
                          <option value="file">File Upload (PDF, Doc)</option>
                          <option value="checkbox">Checkbox Toggle</option>
                        </select>
                      </div>

                      {/* Required Toggle */}
                      <div className="flex items-center gap-4 mt-6">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => handleFieldChange(index, 'required', e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                          />
                          <span className="font-semibold text-gray-700 text-sm">Required field</span>
                        </label>
                        
                        {/* Remove Field Button */}
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveField(index)}
                            className="ml-auto p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                            title="Remove Field"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* Dropdown Options Input */}
                  {field.type === 'select' && (
                    <div className="ml-12">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Select Options (Comma-separated)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Option 1, Option 2, Option 3"
                        value={field.optionsString}
                        onChange={(e) => handleFieldChange(index, 'optionsString', e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium text-sm"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E05E00] text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              <FaSave /> {isSaving ? 'Updating Form...' : 'Update Form'}
            </button>
            <Link
              href="/admin/custom-forms"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-8 py-4 rounded-2xl transition text-center"
            >
              Cancel
            </Link>
          </div>

        </form>

      </div>
    </div>
  );
}
