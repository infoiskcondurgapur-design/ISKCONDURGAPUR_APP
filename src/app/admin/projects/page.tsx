'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaArrowLeft, FaPlus, FaTrash, FaEdit, FaSearch, FaInfoCircle, 
  FaHandHoldingHeart, FaSave, FaTimes, FaGlobe, FaCheck 
} from 'react-icons/fa';

export default function AdminProjectsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    category: 'Construction',
    description: '',
    fullDescription: '',
    image: '',
    status: 'Active',
    targetAmount: 0,
    raisedAmount: 0,
    donorsCount: 0,
    featured: false,
    tagsString: ''
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

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
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (data.data) {
        setProjects(data.data);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      showToast('error', 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    setFormData({
      title: '',
      category: 'Construction',
      description: '',
      fullDescription: '',
      image: '',
      status: 'Active',
      targetAmount: 0,
      raisedAmount: 0,
      donorsCount: 0,
      featured: false,
      tagsString: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (project: any) => {
    setModalMode('edit');
    setEditingId(project._id || project.id);
    setFormData({
      title: project.title || '',
      category: project.category || 'Construction',
      description: project.description || '',
      fullDescription: project.fullDescription || '',
      image: project.image || '',
      status: project.status || 'Active',
      targetAmount: project.targetAmount || 0,
      raisedAmount: project.raisedAmount || 0,
      donorsCount: project.donorsCount || 0,
      featured: !!project.featured,
      tagsString: project.tags ? project.tags.join(', ') : ''
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse tags string into array
    const tags = formData.tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const payload = {
      title: formData.title,
      category: formData.category,
      description: formData.description,
      fullDescription: formData.fullDescription,
      image: formData.image,
      status: formData.status,
      targetAmount: Number(formData.targetAmount),
      raisedAmount: Number(formData.raisedAmount),
      donorsCount: Number(formData.donorsCount),
      featured: formData.featured,
      tags
    };

    const authToken = localStorage.getItem('iskcon_admin_token') || '';

    try {
      if (modalMode === 'create') {
        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(payload)
        });
        const result = await res.json();
        
        if (res.ok) {
          showToast('success', 'Project created successfully!');
          fetchProjects();
          setIsModalOpen(false);
        } else {
          showToast('error', result.error || 'Failed to create project');
        }
      } else {
        const res = await fetch(`/api/projects/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(payload)
        });
        const result = await res.json();

        if (res.ok) {
          showToast('success', 'Project updated successfully!');
          fetchProjects();
          setIsModalOpen(false);
        } else {
          showToast('error', result.error || 'Failed to update project');
        }
      }
    } catch (err) {
      console.error('Submit error:', err);
      showToast('error', 'A connection error occurred');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    const authToken = localStorage.getItem('iskcon_admin_token') || '';

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (res.ok) {
        showToast('success', 'Project deleted successfully!');
        fetchProjects();
      } else {
        const result = await res.json();
        showToast('error', result.error || 'Failed to delete project');
      }
    } catch (err) {
      console.error('Delete error:', err);
      showToast('error', 'Failed to connect to backend');
    }
  };

  const filteredProjects = projects.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link href="/admin" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#FF6B00] transition-colors font-medium">
            <FaArrowLeft /> Back to Dashboard
          </Link>
        </div>

        {/* Title Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FaHandHoldingHeart className="text-[#FF6B00]" /> Temple Projects Management
            </h1>
            <p className="text-gray-500 mt-1">Manage construction campaigns, welfare activities, educational projects, and deities seva.</p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="bg-[#FF6B00] text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition flex items-center gap-2 self-start md:self-center shadow-lg shadow-orange-500/10"
          >
            <FaPlus /> Add New Project
          </button>
        </div>

        {/* Message Banner */}
        {message && (
          <div className={`p-4 rounded-xl mb-8 flex items-start gap-3 border ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border-green-200' 
              : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            <FaInfoCircle className="mt-0.5 text-lg flex-shrink-0" />
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        {/* Content Box */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Search bar */}
          <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-80">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] bg-white transition-all text-sm font-medium"
              />
            </div>
            <div className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <FaHandHoldingHeart /> {filteredProjects.length} Projects Listed
            </div>
          </div>

          {/* Table list */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-10 h-10 border-t-4 border-[#FF6B00] border-solid rounded-full animate-spin"></div>
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/30">
                    <th className="py-4 px-6">Project Title</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Progress (Raised / Target)</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Featured</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm font-semibold text-gray-700">
                  {filteredProjects.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50/40 transition-colors">
                      <td className="py-5 px-6 font-bold text-gray-900 max-w-xs truncate">{p.title}</td>
                      <td className="py-5 px-6">
                        <span className="bg-orange-50 px-3 py-1 rounded-full text-xs font-bold text-[#FF6B00]">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-xs text-gray-500">
                        {p.targetAmount > 0 ? (
                          <span>
                            Γé╣{(p.raisedAmount || 0).toLocaleString('en-IN')} / 
                            <span className="font-bold text-gray-700"> Γé╣{p.targetAmount.toLocaleString('en-IN')}</span> 
                            {` (${Math.min(Math.round((p.raisedAmount / p.targetAmount) * 100), 100)}%)`}
                          </span>
                        ) : (
                          <span className="text-gray-400">No Target</span>
                        )}
                      </td>
                      <td className="py-5 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          p.status === 'Completed' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-center">
                        {p.featured ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-amber-50 text-amber-600 rounded-full">
                            <FaCheck size={10} />
                          </span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="py-5 px-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit project"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(p._id || p.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete project"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500 font-bold">
              No projects found matching the criteria.
            </div>
          )}
        </div>
      </div>

      {/* CREATE/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FaHandHoldingHeart className="text-[#FF6B00]" /> 
                {modalMode === 'create' ? 'Create New Project' : 'Edit Project'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-5 overflow-y-auto flex-grow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Project Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="Enter project name"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] text-sm text-gray-800 bg-white"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] text-sm text-gray-800 bg-white font-bold"
                  >
                    <option value="Construction">Construction</option>
                    <option value="Annadanam">Annadanam (Food)</option>
                    <option value="Cow Protection">Cow Protection</option>
                    <option value="Education">Education</option>
                    <option value="Deity Seva">Deity Seva</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Campaign Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] text-sm text-gray-800 bg-white font-bold"
                  >
                    <option value="Active">Active (Ongoing)</option>
                    <option value="Planning">Planning</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                {/* Brief Description */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Short Description (Cards) *</label>
                  <textarea
                    required
                    rows={2}
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Enter short snippet description"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] text-sm text-gray-800 bg-white"
                  />
                </div>

                {/* Full Description */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Detailed Narrative (Page) *</label>
                  <textarea
                    required
                    rows={5}
                    value={formData.fullDescription}
                    onChange={e => setFormData({...formData, fullDescription: e.target.value})}
                    placeholder="Provide full narrative. Use double newlines for paragraphs."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] text-sm text-gray-800 bg-white"
                  />
                </div>

                {/* Image path */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Image URL / Local Path</label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={e => setFormData({...formData, image: e.target.value})}
                    placeholder="E.g., /images/iskcon_durgapur_temple.png"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] text-sm text-gray-800 bg-white"
                  />
                </div>

                {/* Target Amount */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Target Goal Amount (Γé╣)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.targetAmount}
                    onChange={e => setFormData({...formData, targetAmount: Number(e.target.value)})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] text-sm text-gray-800 bg-white font-bold"
                  />
                </div>

                {/* Raised Amount */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Raised Amount (Γé╣)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.raisedAmount}
                    onChange={e => setFormData({...formData, raisedAmount: Number(e.target.value)})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] text-sm text-gray-800 bg-white font-bold"
                  />
                </div>

                {/* Donors Count */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Donors Count</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.donorsCount}
                    onChange={e => setFormData({...formData, donorsCount: Number(e.target.value)})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] text-sm text-gray-800 bg-white font-bold"
                  />
                </div>

                {/* Tags (comma separated) */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    value={formData.tagsString}
                    onChange={e => setFormData({...formData, tagsString: e.target.value})}
                    placeholder="Building, Seva, Food"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] text-sm text-gray-800 bg-white"
                  />
                </div>

                {/* Featured checkbox */}
                <div className="md:col-span-2 flex items-center gap-2 py-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={e => setFormData({...formData, featured: e.target.checked})}
                    className="w-4 h-4 text-[#FF6B00] focus:ring-[#FF6B00] border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="text-sm font-bold text-gray-700 select-none cursor-pointer">
                    Feature this project on listings
                  </label>
                </div>

              </div>

              {/* Modal Footer / Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#FF6B00] hover:bg-orange-700 text-white font-bold rounded-xl text-sm flex items-center gap-2 transition-all shadow-md shadow-orange-500/10"
                >
                  <FaSave /> Save Project
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
