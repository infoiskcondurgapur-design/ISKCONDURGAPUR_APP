'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaQuoteLeft, FaPlus, FaTrash, FaEdit, FaSearch, FaInfoCircle } from 'react-icons/fa';

export default function QuotesManagement() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [quotes, setQuotes] = useState([
    { id: 1, text: "Brahmacārī life is meant for following the rules and regulations under the guidance of the spiritual master.", source: "Srimad-Bhagavatam 3.12.41, Purport" },
    { id: 2, text: "The basic principle of the brahmacārī's life is to have firm faith in the spiritual master. The brahmacārī is supposed to live under the care of the spiritual master and serve him with heart and soul.", source: "Srimad-Bhagavatam 7.12.1, Purport" },
    { id: 3, text: "A brahmacārī should have complete control over his senses and should be fully engaged in the service of the Lord.", source: "Bhagavad-gita As It Is, 6.14, Purport" }
  ]);

  const [newQuoteText, setNewQuoteText] = useState('');
  const [newQuoteSource, setNewQuoteSource] = useState('');

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

  const handleDelete = (id: number) => {
    setQuotes(prev => prev.filter(q => q.id !== id));
    setMessage({ type: 'success', text: 'Quote deleted successfully!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAddQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuoteText.trim() || !newQuoteSource.trim()) return;

    setQuotes(prev => [
      ...prev,
      {
        id: Date.now(),
        text: newQuoteText,
        source: newQuoteSource
      }
    ]);
    setNewQuoteText('');
    setNewQuoteSource('');
    setMessage({ type: 'success', text: 'Quote template added successfully!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const filteredQuotes = quotes.filter(q =>
    q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.source.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href="/admin" className="inline-flex items-center gap-2 text-gray-500 hover:text-iskcon-orange transition-colors font-medium">
            <FaArrowLeft /> Back to Dashboard
          </Link>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Prabhupada Quotes</h1>
            <p className="text-gray-500 mt-1">Manage daily transcendental quotes and teachings from Srila Prabhupada.</p>
          </div>
        </div>

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Quote */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-fit">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="p-2 bg-orange-50 text-iskcon-orange rounded-lg"><FaPlus size={14} /></span>
              Add Quote
            </h2>
            <form onSubmit={handleAddQuote} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quote Text</label>
                <textarea
                  value={newQuoteText}
                  onChange={e => setNewQuoteText(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-iskcon-orange/20 focus:border-iskcon-orange transition-all bg-gray-50/30 resize-none text-sm"
                  placeholder="Enter the quote text..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Source Reference</label>
                <input
                  type="text"
                  value={newQuoteSource}
                  onChange={e => setNewQuoteSource(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-iskcon-orange/20 focus:border-iskcon-orange transition-all bg-gray-50/30 text-sm"
                  placeholder="E.g., Bhagavad-gita 4.34, Purport"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#FF6B00] text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition"
              >
                Create Quote
              </button>
            </form>
          </div>

          {/* Quotes List */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pb-6 border-b border-gray-50 mb-6">
              <div className="relative w-full sm:w-64">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search quotes..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-iskcon-orange/20 focus:border-iskcon-orange bg-gray-50/30 transition-all text-sm font-medium"
                />
              </div>
              <div className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <FaQuoteLeft /> {filteredQuotes.length} Quotes Available
              </div>
            </div>

            <div className="space-y-6">
              {filteredQuotes.map(quote => (
                <div key={quote.id} className="p-6 rounded-2xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/5/10 transition-all duration-300 relative group flex gap-4">
                  <div className="text-orange-200 text-3xl font-serif leading-none mt-[-5px]">“</div>
                  <div className="flex-1">
                    <p className="text-gray-700 font-medium text-[15px] leading-relaxed mb-3 italic">{quote.text}</p>
                    <p className="text-orange-600 font-semibold text-xs">— {quote.source}</p>
                  </div>
                  <div className="flex flex-col justify-between">
                    <button
                      onClick={() => handleDelete(quote.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                      title="Delete Quote"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {filteredQuotes.length === 0 && (
                <div className="text-center py-10 text-gray-400 font-medium">No quotes found.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
