'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaPlus, FaEdit, FaEye, FaSearch, FaTrash } from 'react-icons/fa';

export default function TemplesList() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [temples, setTemples] = useState<any[]>([]);
  const [filteredTemples, setFilteredTemples] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchTemples = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/temples');
      const result = await response.json();

      if (response.ok) {
        setTemples(result.data);
        setFilteredTemples(result.data);
      } else {
        setError(result.message || 'Failed to fetch temples');
      }
    } catch (err) {
      console.error('Error fetching temples:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      const authToken = localStorage.getItem('iskcon_admin_token');
      if (!authToken) {
        router.push('/admin/login');
        return;
      }

      setIsAuthenticated(true);
      fetchTemples();
    };

    checkAuth();
  }, [router, fetchTemples]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this temple?')) return;

    try {
      const response = await fetch(`/api/temples/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (response.ok) {
        fetchTemples(); // Refresh list
      } else {
        alert(result.message || 'Failed to delete temple');
      }
    } catch (err) {
      console.error('Error deleting temple:', err);
      alert('Network error. Please try again.');
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value === '') {
      setFilteredTemples(temples);
      return;
    }

    const filtered = temples.filter(temple =>
      temple.name.toLowerCase().includes(value.toLowerCase()) ||
      temple.location.toLowerCase().includes(value.toLowerCase()) ||
      temple.country?.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredTemples(filtered);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-t-4 border-iskcon-orange border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Temple Management</h1>
          <Link href="/admin/temples/add">
            <button className="bg-iskcon-orange text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-700 transition flex items-center gap-2 shadow-lg">
              <FaPlus /> Add Temple
            </button>
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold" />
              <input
                type="text"
                placeholder="Search temples..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-iskcon-orange/20 focus:border-iskcon-orange bg-white transition-all xl:w-1/3"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 font-semibold text-gray-700">Temple Name</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">Location</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTemples.length > 0 ? (
                  filteredTemples.map((temple: any) => (
                    <tr key={temple._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                            <Image
                              src={(temple.image && temple.image.replace(/\\/g, '/')) || '/images/temple-placeholder.jpg'}
                              alt={temple.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                          <span className="font-medium text-gray-900">{temple.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {temple.location}, {temple.country}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-3">
                          <Link href={`/admin/temples/edit/${temple._id}`} className="text-iskcon-orange hover:bg-orange-50 p-2 rounded-lg transition-colors">
                            <FaEdit size={18} />
                          </Link>
                          <button onClick={() => handleDelete(temple._id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                            <FaTrash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-gray-400 italic">
                      No temples found. Click &quot;Add Temple&quot; to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}