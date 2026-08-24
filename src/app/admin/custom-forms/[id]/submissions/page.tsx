'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaCheck, FaTrash, FaDownload, FaEnvelope, FaPhone } from 'react-icons/fa';

interface FormField {
  name: string;
  label: string;
  type: string;
}

interface FormDefinition {
  _id: string;
  title: string;
  fields: FormField[];
}

interface FormResponseData {
  _id: string;
  answers: Record<string, any>;
  status: 'Pending' | 'Reviewed';
  createdAt: string;
}

export default function FormSubmissionsViewerPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState<FormDefinition | null>(null);
  const [submissions, setSubmissions] = useState<FormResponseData[]>([]);

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
    const fetchData = async () => {
      try {
        const authToken = localStorage.getItem('iskcon_admin_token');
        
        // Fetch Form configuration
        const formRes = await fetch(`/api/forms/${params.id}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const formResult = await formRes.json();
        
        if (!formRes.ok) throw new Error(formResult.message || 'Failed to fetch form details');
        setForm(formResult.data);

        // Fetch Submissions
        const subRes = await fetch(`/api/forms/${params.id}/submissions`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const subResult = await subRes.json();
        
        if (subRes.ok && subResult.data) {
          setSubmissions(subResult.data);
        }
      } catch (err) {
        console.error('Error loading submissions data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, params.id]);

  const handleReview = async (submissionId: string) => {
    try {
      const authToken = localStorage.getItem('iskcon_admin_token');
      const response = await fetch(`/api/forms/submissions/${submissionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ status: 'Reviewed' })
      });

      if (response.ok) {
        setSubmissions(prev => prev.map(s => s._id === submissionId ? { ...s, status: 'Reviewed' } : s));
      }
    } catch (err) {
      console.error('Failed to review submission:', err);
    }
  };

  const handleDelete = async (submissionId: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;

    try {
      const authToken = localStorage.getItem('iskcon_admin_token');
      const response = await fetch(`/api/forms/submissions/${submissionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (response.ok) {
        setSubmissions(prev => prev.filter(s => s._id !== submissionId));
      }
    } catch (err) {
      console.error('Failed to delete submission:', err);
    }
  };

  const exportToCSV = () => {
    if (!form || submissions.length === 0) return;

    const escapeCSV = (val: any) => {
      if (val === undefined || val === null) return '';
      let str = val.toString();
      str = str.replace(/"/g, '""');
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        str = `"${str}"`;
      }
      return str;
    };

    // Header row
    const headers = ['Submitted At', ...form.fields.map(f => f.label), 'Status'];
    
    // Data rows
    const rows = submissions.map(sub => {
      const rowData = [
        formatDateTime(sub.createdAt),
        ...form.fields.map(f => sub.answers[f.name] || ''),
        sub.status
      ];
      return rowData.map(escapeCSV).join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `${form.title.toLowerCase().replace(/\s+/g, '_')}_submissions_${dateStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC]">
        <div className="w-16 h-16 border-t-4 border-[#FF6B00] border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] p-6 lg:p-10 font-sans text-center">
        <p className="text-red-500 font-bold">Form not found.</p>
        <Link href="/admin/custom-forms" className="text-orange-500 underline mt-4 block">Back to Forms</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] p-6 lg:p-10 font-sans text-gray-800">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Back link */}
        <Link
          href="/admin/custom-forms"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold mb-6 transition"
        >
          <FaArrowLeft /> Back to Forms
        </Link>

        {/* Header */}
        <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">
              {form.title} <span className="text-[#FF6B00]">Submissions</span>
            </h1>
            <p className="text-gray-500 font-medium">
              Review and manage all dynamic response submissions for this custom form.
            </p>
          </div>
          {submissions.length > 0 && (
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E05E00] text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-orange-500/20 transition-all active:scale-95 text-sm"
            >
              <FaDownload /> Export CSV
            </button>
          )}
        </div>

        {/* Submissions Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {submissions.length === 0 ? (
            <div className="p-16 text-center text-gray-400">
              No submissions received for this form yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 text-[13px] font-bold uppercase tracking-wider">
                    <th className="px-6 py-5">Submitted At</th>
                    {form.fields.map(field => (
                      <th key={field.name} className="px-6 py-5">{field.label}</th>
                    ))}
                    <th className="px-6 py-5">Status</th>
                    <th className="px-6 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {submissions.map((sub) => (
                    <tr key={sub._id} className="hover:bg-gray-50/20 transition-colors">
                      
                      {/* Date */}
                      <td className="px-6 py-6 font-semibold text-gray-500 text-sm whitespace-nowrap">
                        {formatDateTime(sub.createdAt)}
                      </td>

                      {/* Dynamic Fields */}
                      {form.fields.map((field) => {
                        const answer = sub.answers[field.name];
                        
                        if (field.type === 'file') {
                          return (
                            <td key={field.name} className="px-6 py-6">
                              {answer ? (
                                <a
                                  href={answer}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-[#FF6B00] hover:text-[#E05E00] font-bold text-sm bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-xl transition"
                                >
                                  <FaDownload size={12} /> View File
                                </a>
                              ) : (
                                <span className="text-gray-400 text-sm italic">No file</span>
                              )}
                            </td>
                          );
                        }

                        if (field.type === 'checkbox') {
                          return (
                            <td key={field.name} className="px-6 py-6 font-medium">
                              {answer === true || answer === 'true' ? (
                                <span className="text-green-600 bg-green-50 px-2.5 py-1 rounded-lg text-xs font-bold border border-green-100">Yes</span>
                              ) : (
                                <span className="text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg text-xs font-medium border border-gray-200/50">No</span>
                              )}
                            </td>
                          );
                        }

                        return (
                          <td key={field.name} className="px-6 py-6 max-w-xs truncate font-medium text-gray-800">
                            {answer || <span className="text-gray-300 italic">N/A</span>}
                          </td>
                        );
                      })}

                      {/* Status */}
                      <td className="px-6 py-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          sub.status === 'Reviewed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {sub.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {sub.status === 'Pending' && (
                            <button
                              onClick={() => handleReview(sub._id)}
                              className="bg-gray-50 hover:bg-green-50 hover:text-green-600 text-gray-500 border border-gray-100 px-3 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 transition"
                              title="Mark as Reviewed"
                            >
                              <FaCheck size={12} /> Review
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(sub._id)}
                            className="p-2 bg-gray-50 hover:bg-red-50 hover:text-red-500 text-gray-400 border border-gray-100 rounded-xl transition"
                            title="Delete Submission"
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
        </div>

      </div>
    </div>
  );
}
