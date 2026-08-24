'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaEdit, FaTrash, FaPlus, FaEye, FaCopy, FaCheck } from 'react-icons/fa';

interface FormDefinition {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  isActive: boolean;
  fields: any[];
  createdAt: string;
}

export default function CustomFormsListPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [forms, setForms] = useState<FormDefinition[]>([]);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

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

  const fetchForms = async () => {
    try {
      const authToken = localStorage.getItem('iskcon_admin_token');
      const response = await fetch('/api/forms?admin=true', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      const result = await response.json();
      if (response.ok && result.data) {
        setForms(result.data);
      }
    } catch (err) {
      console.error('Error fetching forms:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchForms();
    }
  }, [isAuthenticated]);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const authToken = localStorage.getItem('iskcon_admin_token');
      const formToUpdate = forms.find(f => f._id === id);
      if (!formToUpdate) return;

      const response = await fetch(`/api/forms/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          ...formToUpdate,
          isActive: !currentStatus
        })
      });

      if (response.ok) {
        setForms(prev => prev.map(f => f._id === id ? { ...f, isActive: !currentStatus } : f));
      }
    } catch (err) {
      console.error('Failed to toggle active status:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this custom form? This will also delete all submitted responses.')) return;
    
    try {
      const authToken = localStorage.getItem('iskcon_admin_token');
      const response = await fetch(`/api/forms/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        setForms(prev => prev.filter(f => f._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete form:', err);
    }
  };

  const handleCopyLink = (slug: string) => {
    const publicUrl = `${window.location.origin}/forms/${slug}`;
    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 3000);
    });
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
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-2">
              Custom <span className="text-[#FF6B00]">Forms</span>
            </h1>
            <p className="text-gray-500 font-medium">
              Create, configure, and manage dynamic forms for exam submissions or registrations.
            </p>
          </div>
          <Link
            href="/admin/custom-forms/new"
            className="flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E05E00] text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-orange-500/20 transition-all active:scale-95"
          >
            <FaPlus /> Create Form
          </Link>
        </div>

        {/* Form List Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {forms.length === 0 ? (
            <div className="p-16 text-center text-gray-400">
              No custom forms created yet. Click &quot;Create Form&quot; to design your first form.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 text-[13px] font-bold uppercase tracking-wider">
                    <th className="px-8 py-5">Form Info</th>
                    <th className="px-8 py-5">Public Link</th>
                    <th className="px-8 py-5">Fields</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {forms.map((form) => (
                    <tr key={form._id} className="hover:bg-gray-50/20 transition-colors">
                      <td className="px-8 py-6">
                        <div className="font-bold text-gray-900 text-lg mb-1">{form.title}</div>
                        <div className="text-gray-400 text-sm">{form.description || 'No description'}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1.5 rounded-xl font-mono">
                            /forms/{form.slug}
                          </span>
                          <button
                            onClick={() => handleCopyLink(form.slug)}
                            className="text-gray-400 hover:text-[#FF6B00] transition"
                            title="Copy public URL"
                          >
                            {copiedSlug === form.slug ? <FaCheck className="text-green-500" /> : <FaCopy />}
                          </button>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="font-semibold text-gray-700 bg-gray-100/70 border border-gray-200/50 px-3 py-1.5 rounded-xl text-sm">
                          {form.fields.length} Fields
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <button
                          onClick={() => handleToggleActive(form._id, form.isActive)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                            form.isActive ? 'bg-[#FF6B00]' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              form.isActive ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/custom-forms/${form._id}/submissions`}
                            className="bg-gray-50 hover:bg-orange-50 hover:text-[#FF6B00] text-gray-500 border border-gray-100 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition"
                            title="View Responses"
                          >
                            <FaEye /> Submissions
                          </Link>
                          <Link
                            href={`/admin/custom-forms/edit/${form._id}`}
                            className="p-2.5 bg-gray-50 hover:bg-orange-50 hover:text-[#FF6B00] text-gray-500 border border-gray-100 rounded-xl transition"
                            title="Edit Form"
                          >
                            <FaEdit />
                          </Link>
                          <button
                            onClick={() => handleDelete(form._id)}
                            className="p-2.5 bg-gray-50 hover:bg-red-50 hover:text-red-500 text-gray-500 border border-gray-100 rounded-xl transition"
                            title="Delete Form"
                          >
                            <FaTrash />
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
