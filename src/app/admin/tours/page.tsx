'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FaPlus, FaEdit, FaSearch, FaTrash, FaMapMarkerAlt, FaCalendarAlt, 
  FaRoute, FaArrowLeft, FaCheck, FaTimes, FaUser, FaEnvelope, FaPhone, 
  FaTicketAlt, FaClock 
} from 'react-icons/fa';

export default function ToursList() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tours' | 'registrations'>('tours');
  
  // Tours state
  const [tours, setTours] = useState<any[]>([]);
  const [filteredTours, setFilteredTours] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Registrations state
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [filteredRegs, setFilteredRegs] = useState<any[]>([]);
  const [regSearchTerm, setRegSearchTerm] = useState('');
  const [isLoadingRegs, setIsLoadingRegs] = useState(false);

  const fetchTours = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/tours');
      const result = await response.json();

      if (response.ok) {
        setTours(result.data || []);
        setFilteredTours(result.data || []);
      } else {
        setError(result.message || 'Failed to fetch spiritual tours');
      }
    } catch (err) {
      console.error('Error fetching tours:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchRegistrations = useCallback(async () => {
    setIsLoadingRegs(true);
    try {
      const response = await fetch('/api/admin/tours/registrations');
      const result = await response.json();
      if (response.ok) {
        setRegistrations(result.data || []);
        setFilteredRegs(result.data || []);
      } else {
        console.error(result.message || 'Failed to fetch registrations');
      }
    } catch (err) {
      console.error('Error fetching registrations:', err);
    } finally {
      setIsLoadingRegs(false);
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
      fetchTours();
      fetchRegistrations();
    };

    checkAuth();
  }, [router, fetchTours, fetchRegistrations]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this spiritual tour?')) return;

    try {
      const response = await fetch(`/api/tours/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (response.ok) {
        fetchTours(); // Refresh list
      } else {
        alert(result.message || 'Failed to delete tour');
      }
    } catch (err) {
      console.error('Error deleting tour:', err);
      alert('Network error. Please try again.');
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value === '') {
      setFilteredTours(tours);
      return;
    }

    const filtered = tours.filter(tour =>
      tour.name.toLowerCase().includes(value.toLowerCase()) ||
      tour.location.toLowerCase().includes(value.toLowerCase()) ||
      tour.category?.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredTours(filtered);
  };

  const handleRegSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRegSearchTerm(value);

    if (value === '') {
      setFilteredRegs(registrations);
      return;
    }

    const filtered = registrations.filter(reg =>
      reg.name.toLowerCase().includes(value.toLowerCase()) ||
      reg.tourName.toLowerCase().includes(value.toLowerCase()) ||
      reg.email.toLowerCase().includes(value.toLowerCase()) ||
      reg.phone.toLowerCase().includes(value.toLowerCase()) ||
      reg.status.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredRegs(filtered);
  };

  const handleUpdateStatus = async (id: string, newStatus: 'pending' | 'approved' | 'cancelled') => {
    try {
      const response = await fetch(`/api/admin/tours/registrations?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      const result = await response.json();
      if (response.ok) {
        // Update local state
        const updatedRegs = registrations.map(reg => 
          reg._id === id || reg.id === id ? { ...reg, status: newStatus } : reg
        );
        setRegistrations(updatedRegs);
        
        const updatedFiltered = filteredRegs.map(reg => 
          reg._id === id || reg.id === id ? { ...reg, status: newStatus } : reg
        );
        setFilteredRegs(updatedFiltered);
      } else {
        alert(result.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Network error. Please try again.');
    }
  };

  const handleDeleteRegistration = async (id: string) => {
    if (!confirm('Are you sure you want to delete this registration?')) return;

    try {
      const response = await fetch(`/api/admin/tours/registrations?id=${id}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      if (response.ok) {
        setRegistrations(prev => prev.filter(reg => reg._id !== id && reg.id !== id));
        setFilteredRegs(prev => prev.filter(reg => reg._id !== id && reg.id !== id));
      } else {
        alert(result.message || 'Failed to delete registration');
      }
    } catch (err) {
      console.error('Error deleting registration:', err);
      alert('Network error. Please try again.');
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header navigation */}
        <div className="mb-6">
          <Link href="/admin" className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors font-medium">
            <FaArrowLeft /> Back to Dashboard
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
              <FaRoute className="text-orange-500" /> Spiritual Tours Management
            </h1>
            <p className="text-gray-500 mt-1">Create, update, and manage dynamic holy pilgrimages and pilgrim bookings.</p>
          </div>
          {activeTab === 'tours' && (
            <Link href="/admin/tours/add">
              <button className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition flex items-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95">
                <FaPlus /> Add Spiritual Tour
              </button>
            </Link>
          )}
        </div>

        {/* Tab Toggle Navigation */}
        <div className="flex border-b border-gray-200 mb-6 gap-6">
          <button
            onClick={() => setActiveTab('tours')}
            className={`pb-4 text-base font-bold transition-all border-b-2 uppercase tracking-wide ${
              activeTab === 'tours'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Tour Destinations ({tours.length})
          </button>
          <button
            onClick={() => setActiveTab('registrations')}
            className={`pb-4 text-base font-bold transition-all border-b-2 uppercase tracking-wide ${
              activeTab === 'registrations'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Pilgrim Registrations ({registrations.length})
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100">
            {error}
          </div>
        )}

        {activeTab === 'tours' ? (
          /* TOURS LIST TAB */
          isLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-12 h-12 border-t-4 border-orange-500 border-solid rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                <div className="relative max-w-md">
                  <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold" />
                  <input
                    type="text"
                    placeholder="Search by name, location, or category..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white transition-all text-sm"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/70 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <th className="px-6 py-4">Tour details</th>
                      <th className="px-6 py-4">Location</th>
                      <th className="px-6 py-4">Duration & Size</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm">
                    {filteredTours.length > 0 ? (
                      filteredTours.map((tour: any) => (
                        <tr key={tour._id} className="hover:bg-gray-50/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="relative w-16 h-12 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 bg-gray-100">
                                <Image
                                  src={(tour.image && tour.image.replace(/\\/g, '/')) || '/images/tours/placeholder.jpg'}
                                  alt={tour.name}
                                  fill
                                  className="object-cover"
                                  sizes="64px"
                                  onError={(e: any) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = "/images/tours/placeholder.jpg";
                                  }}
                                />
                              </div>
                              <div>
                                <span className="font-bold text-gray-800 block text-base leading-tight">{tour.name}</span>
                                <span className="inline-block px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full text-xs font-bold mt-1.5 border border-orange-100/50">
                                  {tour.category}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center text-gray-600 gap-1.5">
                              <FaMapMarkerAlt className="text-red-400 text-xs flex-shrink-0" />
                              <span>{tour.location}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            <div className="flex items-center gap-1.5">
                              <FaCalendarAlt className="text-gray-400 text-xs" />
                              <span>{tour.duration}</span>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">Group Size: {tour.groupSize}</div>
                          </td>
                          <td className="px-6 py-4 font-black text-orange-600 text-base">
                            ₹{tour.price.toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2 justify-center">
                              <Link href={`/admin/tours/edit/${tour._id}`} className="text-orange-500 hover:bg-orange-50 p-2.5 rounded-xl transition-colors border border-transparent hover:border-orange-100">
                                <FaEdit size={18} />
                              </Link>
                              <button onClick={() => handleDelete(tour._id)} className="text-red-500 hover:bg-red-50 p-2.5 rounded-xl transition-colors border border-transparent hover:border-red-100">
                                <FaTrash size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-16 text-center text-gray-400 italic">
                          No spiritual tours found. Click &quot;Add Spiritual Tour&quot; to create one.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          /* REGISTRATIONS TAB */
          isLoadingRegs ? (
            <div className="flex justify-center py-16">
              <div className="w-12 h-12 border-t-4 border-orange-500 border-solid rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                <div className="relative max-w-md">
                  <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold" />
                  <input
                    type="text"
                    placeholder="Search by pilgrim name, email, phone, or status..."
                    value={regSearchTerm}
                    onChange={handleRegSearch}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white transition-all text-sm"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/70 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <th className="px-6 py-4">Pilgrim Details</th>
                      <th className="px-6 py-4">Tour details</th>
                      <th className="px-6 py-4">Selected Date & Seats</th>
                      <th className="px-6 py-4">Cost & Status</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm">
                    {filteredRegs.length > 0 ? (
                      filteredRegs.map((reg: any) => (
                        <tr key={reg._id || reg.id} className="hover:bg-gray-50/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <span className="font-bold text-gray-800 flex items-center gap-1.5">
                                <FaUser className="text-gray-400 text-xs" /> {reg.name}
                              </span>
                              <span className="text-xs text-gray-500 flex items-center gap-1.5">
                                <FaEnvelope className="text-gray-400 text-[10px]" /> {reg.email}
                              </span>
                              <span className="text-xs text-gray-500 flex items-center gap-1.5">
                                <FaPhone className="text-gray-400 text-[10px]" /> {reg.phone}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-gray-700 block">{reg.tourName}</span>
                            {reg.notes && (
                              <span className="text-xs text-gray-400 italic block mt-1 max-w-[200px] truncate" title={reg.notes}>
                                Note: {reg.notes}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            <div className="flex items-center gap-1.5">
                              <FaCalendarAlt className="text-gray-400 text-xs" />
                              <span>{reg.date}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <FaTicketAlt className="text-gray-400 text-xs" />
                              <span>{reg.seats} {reg.seats === 1 ? 'Seat' : 'Seats'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-black text-orange-600 text-base">
                              ₹{reg.totalCost.toLocaleString()}
                            </div>
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold mt-1.5 border ${
                              reg.status === 'approved' 
                                ? 'bg-green-50 text-green-700 border-green-200' 
                                : reg.status === 'cancelled' 
                                ? 'bg-red-50 text-red-700 border-red-200' 
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {reg.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2 justify-center items-center">
                              {reg.status !== 'approved' && (
                                <button 
                                  onClick={() => handleUpdateStatus(reg._id || reg.id, 'approved')} 
                                  title="Approve Booking"
                                  className="text-green-600 hover:bg-green-50 p-2 rounded-xl transition-colors border border-transparent hover:border-green-100"
                                >
                                  <FaCheck size={16} />
                                </button>
                              )}
                              {reg.status !== 'cancelled' && (
                                <button 
                                  onClick={() => handleUpdateStatus(reg._id || reg.id, 'cancelled')} 
                                  title="Cancel Booking"
                                  className="text-amber-600 hover:bg-amber-50 p-2 rounded-xl transition-colors border border-transparent hover:border-amber-100"
                                >
                                  <FaTimes size={16} />
                                </button>
                              )}
                              <button 
                                onClick={() => handleDeleteRegistration(reg._id || reg.id)} 
                                title="Delete Record"
                                className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors border border-transparent hover:border-red-100"
                              >
                                <FaTrash size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-16 text-center text-gray-400 italic">
                          No pilgrim registrations found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
