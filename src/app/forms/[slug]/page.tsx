'use client';

import { useEffect, useState } from 'react';
import { FaFilePdf, FaCloudUploadAlt, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { useUploadThing } from '@/utils/uploadthing-helpers';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'textarea' | 'select' | 'file' | 'checkbox';
  required: boolean;
  options?: string[];
}

interface FormDefinition {
  _id: string;
  title: string;
  description?: string;
  fields: FormField[];
  isActive: boolean;
  opensAt?: string;
  closesAt?: string;
}

export default function PublicCustomFormPage({ params }: { params: { slug: string } }) {
  const [form, setForm] = useState<FormDefinition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<null | 'success' | 'error'>(null);

  // Form input states
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [checkboxes, setCheckboxes] = useState<Record<string, boolean>>({});
  const [files, setFiles] = useState<Record<string, File>>({});

  const { startUpload } = useUploadThing("documentUploader");

  useEffect(() => {
    const fetchFormDefinition = async () => {
      try {
        const response = await fetch(`/api/forms/${params.slug}`);
        const result = await response.json();
        
        if (response.ok && result.data) {
          setForm(result.data);
          
          // Initialize states
          const initialInputs: Record<string, string> = {};
          const initialCheckboxes: Record<string, boolean> = {};
          
          result.data.fields.forEach((f: FormField) => {
            if (f.type === 'checkbox') {
              initialCheckboxes[f.name] = false;
            } else {
              initialInputs[f.name] = '';
            }
          });
          
          setInputs(initialInputs);
          setCheckboxes(initialCheckboxes);
        } else {
          setError(result.message || 'Form not found');
        }
      } catch (err) {
        console.error('Error fetching form:', err);
        setError('Failed to load form');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormDefinition();
  }, [params.slug]);

  const handleInputChange = (name: string, value: string) => {
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setCheckboxes(prev => ({ ...prev, [name]: checked }));
  };

  const handleFileChange = (name: string, file: File | null) => {
    if (file) {
      setFiles(prev => ({ ...prev, [name]: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    setIsSubmitting(true);
    setError(null);
    setSubmitStatus(null);

    // Validate inputs
    for (const field of form.fields) {
      if (field.required) {
        if (field.type === 'checkbox' && !checkboxes[field.name]) {
          setError(`You must accept or check: "${field.label}"`);
          setIsSubmitting(false);
          return;
        }
        if (field.type === 'file' && !files[field.name]) {
          setError(`Please upload a file for: "${field.label}"`);
          setIsSubmitting(false);
          return;
        }
        if (field.type !== 'checkbox' && field.type !== 'file' && !inputs[field.name]?.trim()) {
          setError(`Field is required: "${field.label}"`);
          setIsSubmitting(false);
          return;
        }
      }
    }

    const hasFiles = form.fields.some(f => f.type === 'file');
    let body: any;
    let headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    try {
      let uploadedFileUrls: Record<string, string> = {};

      if (hasFiles) {
        // Find files to upload
        const fileFieldsToUpload: { name: string; file: File }[] = [];
        form.fields.forEach(field => {
          if (field.type === 'file' && files[field.name]) {
            fileFieldsToUpload.push({ name: field.name, file: files[field.name] });
          }
        });

        if (fileFieldsToUpload.length > 0) {
          const filesToUpload = fileFieldsToUpload.map(item => item.file);
          const uploadRes = await startUpload(filesToUpload);
          
          if (!uploadRes || uploadRes.length !== filesToUpload.length) {
            throw new Error("Failed to upload file(s) to secure storage. Please try again.");
          }

          fileFieldsToUpload.forEach((item, index) => {
            uploadedFileUrls[item.name] = uploadRes[index].url;
          });
        }
      }

      // Build JSON body with file URLs or text/checkbox inputs
      const jsonBody: Record<string, any> = {};
      form.fields.forEach(field => {
        if (field.type === 'file') {
          jsonBody[field.name] = uploadedFileUrls[field.name] || '';
        } else if (field.type === 'checkbox') {
          jsonBody[field.name] = checkboxes[field.name];
        } else {
          jsonBody[field.name] = inputs[field.name] || '';
        }
      });

      body = JSON.stringify(jsonBody);

      const response = await fetch(`/api/forms/${form._id}/submit`, {
        method: 'POST',
        headers,
        body
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit form');
      }

      setSubmitStatus('success');
      
      // Reset form fields
      const resetInputs = { ...inputs };
      Object.keys(resetInputs).forEach(k => resetInputs[k] = '');
      setInputs(resetInputs);
      
      const resetCheckboxes = { ...checkboxes };
      Object.keys(resetCheckboxes).forEach(k => resetCheckboxes[k] = false);
      setCheckboxes(resetCheckboxes);
      
      setFiles({});
    } catch (err: any) {
      setSubmitStatus('error');
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-orange-950 to-amber-950">
        <div className="w-16 h-16 border-t-4 border-[#FF6B00] border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error && !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-orange-950 to-amber-950 text-white p-4">
        <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-center shadow-2xl">
          <FaExclamationCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Form Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <a
            href="/"
            className="inline-block bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold px-6 py-2.5 rounded-xl transition active:scale-95"
          >
            Go back Home
          </a>
        </div>
      </div>
    );
  }

  if (!form) return null;

  const now = new Date();
  const opensDate = form.opensAt ? new Date(form.opensAt) : null;
  const closesDate = form.closesAt ? new Date(form.closesAt) : null;

  const isNotYetOpen = opensDate ? now < opensDate : false;
  const isClosed = !form.isActive || (closesDate ? now > closesDate : false);

  return (
    <main className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-slate-900 via-orange-950 to-amber-950 text-white pt-28 relative overflow-hidden">
      
      {/* Decorative Glow elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -z-10 animate-pulse duration-[6000ms]"></div>
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -z-10 animate-pulse duration-[8000ms]"></div>

      <div className="flex-grow flex items-center justify-center py-10 px-4">
        <div className="max-w-2xl w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500"></div>

          {/* Form Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight mb-3 bg-gradient-to-r from-white via-orange-100 to-amber-200 bg-clip-text text-transparent">
              {form.title}
            </h1>
            {form.description && (
              <p className="text-gray-300 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
                {form.description}
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-500/10 text-red-400 border border-red-500/20 p-4 rounded-2xl font-semibold mb-6 flex items-center gap-2">
              <FaExclamationCircle className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {submitStatus === 'success' && (
            <div className="bg-green-500/15 text-green-400 border border-green-500/20 p-6 rounded-2xl font-semibold mb-6 text-center space-y-2">
              <FaCheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <div className="text-lg">Thank You!</div>
              <p className="text-sm text-gray-300">Your application has been submitted successfully.</p>
            </div>
          )}

          {isClosed ? (
            <div className="bg-red-500/10 text-red-300 border border-red-500/20 p-8 rounded-3xl text-center space-y-4">
              <FaExclamationCircle className="w-16 h-16 text-red-500 mx-auto" />
              <h2 className="text-xl font-bold">Submissions Closed</h2>
              <p className="text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
                {!form.isActive 
                  ? "This form is currently closed for submissions by the administrator."
                  : `This form closed for submissions on ${new Date(form.closesAt!).toLocaleString()}.`
                }
              </p>
              <div className="pt-2">
                <a
                  href="/"
                  className="inline-block bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold px-6 py-2.5 rounded-xl transition active:scale-95 text-sm"
                >
                  Go Back Home
                </a>
              </div>
            </div>
          ) : isNotYetOpen ? (
            <div className="bg-amber-500/10 text-amber-300 border border-amber-500/20 p-8 rounded-3xl text-center space-y-4">
              <FaExclamationCircle className="w-16 h-16 text-amber-500 mx-auto animate-pulse" />
              <h2 className="text-xl font-bold">Not Yet Open</h2>
              <p className="text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
                This form will open for submissions on {new Date(form.opensAt!).toLocaleString()}.
              </p>
              <div className="pt-2">
                <a
                  href="/"
                  className="inline-block bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold px-6 py-2.5 rounded-xl transition active:scale-95 text-sm"
                >
                  Go Back Home
                </a>
              </div>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {form.fields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <label className="block text-sm font-bold text-gray-300">
                    {field.label} {field.required && <span className="text-[#FF6B00]">*</span>}
                  </label>

                  {/* Text / Email / Number inputs */}
                  {(field.type === 'text' || field.type === 'email' || field.type === 'number') && (
                    <input
                      type={field.type}
                      required={field.required}
                      value={inputs[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      className="w-full border border-white/10 rounded-xl px-4 py-3 bg-white/5 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-white placeholder-gray-500"
                      placeholder={`Enter your ${field.label.toLowerCase()}`}
                    />
                  )}

                  {/* Textarea */}
                  {field.type === 'textarea' && (
                    <textarea
                      required={field.required}
                      rows={4}
                      value={inputs[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      className="w-full border border-white/10 rounded-xl px-4 py-3 bg-white/5 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-white placeholder-gray-500"
                      placeholder={`Enter your message...`}
                    />
                  )}

                  {/* Select Dropdown */}
                  {field.type === 'select' && (
                    <select
                      required={field.required}
                      value={inputs[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      className="w-full border border-white/10 rounded-xl px-4 py-3 bg-[#1e1412] focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-white"
                    >
                      <option value="" className="text-gray-500">Select an option</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt} className="text-white bg-slate-900">{opt}</option>
                      ))}
                    </select>
                  )}

                  {/* Checkbox */}
                  {field.type === 'checkbox' && (
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={checkboxes[field.name] || false}
                        onChange={(e) => handleCheckboxChange(field.name, e.target.checked)}
                        className="w-5 h-5 rounded border-white/10 text-orange-600 focus:ring-orange-500 bg-white/5"
                      />
                      <span className="text-gray-300 text-sm">{field.label}</span>
                    </label>
                  )}

                  {/* File Upload Field */}
                  {field.type === 'file' && (
                    <div className="relative group/upload border border-dashed border-white/20 hover:border-orange-500/50 rounded-xl p-6 bg-white/5 text-center transition">
                      <input
                        type="file"
                        required={field.required}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(field.name, e.target.files?.[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <FaCloudUploadAlt className="w-10 h-10 text-orange-400 mx-auto mb-2 group-hover/upload:scale-110 transition-transform" />
                      <div className="font-bold text-sm text-gray-300">
                        {files[field.name] ? files[field.name].name : `Choose file or drag here`}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        PDF, DOC, DOCX, or Images up to 10MB
                      </div>
                    </div>
                  )}

                </div>
              ))}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white font-bold text-lg py-4 rounded-xl shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          )}

        </div>
      </div>

      {/* Footer message / info */}
      <div className="py-8 text-center text-xs text-gray-500 border-t border-white/5 bg-black/20">
        <p>┬⌐ {new Date().getFullYear()} ISKCON Durgapur. All Rights Reserved.</p>
      </div>
    </main>
  );
}
