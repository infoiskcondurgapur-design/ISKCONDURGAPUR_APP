'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FaArrowLeft, FaEdit, FaPhone, FaEnvelope, FaGlobe, FaClock, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';

interface Temple {
  id: string;
  name: string;
  location: string;
  country: string;
  description: string;
  image: string;
  contactPhone: string;
  contactEmail: string;
  contactWebsite: string;
  scheduleArati: string;
  scheduleDarshan: string;
  scheduleClasses: string;
}

// Sample temple data
const sampleTemples: Temple[] = [
  {
    id: '1',
    name: 'ISKCON Temple Bangalore',
    location: 'Bangalore, Karnataka',
    country: 'India',
    description: 'The Sri Radha Krishna Temple in Bangalore is one of the largest ISKCON temples in the world. The temple is situated on a hillock, atop a seven-acre plot, in the Rajajinagar-Basaveshwaranagar area of Bangalore. The temple complex was inaugurated in 1997 by Shankar Dayal Sharma, the then President of India.',
    image: '/images/temples/bangalore.jpg',
    contactPhone: '+91 80 2347 1956',
    contactEmail: 'info@iskconbangalore.org',
    contactWebsite: 'www.iskconbangalore.org',
    scheduleArati: '4:30 AM, 7:15 AM, 8:30 AM, 12:30 PM, 4:15 PM, 7:00 PM, 8:30 PM',
    scheduleDarshan: '7:15 AM to 1:00 PM, 4:00 PM to 8:30 PM',
    scheduleClasses: 'Morning: 7:30 AM, Evening: 7:00 PM'
  },
  {
    id: '2',
    name: 'ISKCON Temple Mumbai',
    location: 'Mumbai, Maharashtra',
    country: 'India',
    description: 'The ISKCON Temple Mumbai, also known as Sri Sri Radha Rasabihari Temple, is a Vaishnava temple dedicated to Lord Krishna and Radharani. The temple is situated in Juhu, a coastal area of Mumbai. The temple was inaugurated in 1978 by the founder of ISKCON, Srila Prabhupada.',
    image: '/images/temples/mumbai.jpg',
    contactPhone: '+91 22 2620 6860',
    contactEmail: 'info@iskconmumbai.org',
    contactWebsite: 'www.iskconmumbai.org',
    scheduleArati: '4:30 AM, 7:00 AM, 8:15 AM, 12:00 PM, 4:00 PM, 7:00 PM, 9:00 PM',
    scheduleDarshan: '7:15 AM to 12:30 PM, 4:00 PM to 9:00 PM',
    scheduleClasses: 'Morning: 7:30 AM, Evening: 6:30 PM'
  },
  {
    id: '3',
    name: 'ISKCON Temple Los Angeles',
    location: 'Los Angeles, California',
    country: 'United States',
    description: 'ISKCON Los Angeles, also known as New Dvaraka Dhama, is the largest ISKCON temple in North America. It was established by Srila Prabhupada in 1968 and is considered one of the most important ISKCON temples in the world due to its historical significance.',
    image: '/images/temples/los-angeles.jpg',
    contactPhone: '+1 310 836 2676',
    contactEmail: 'info@iskconla.org',
    contactWebsite: 'www.iskconla.org',
    scheduleArati: '4:30 AM, 7:00 AM, 12:00 PM, 4:00 PM, 7:00 PM',
    scheduleDarshan: '7:30 AM to 12:30 PM, 4:30 PM to 8:00 PM',
    scheduleClasses: 'Morning: 7:30 AM, Evening: 6:00 PM'
  },
  {
    id: '4',
    name: 'ISKCON Temple London',
    location: 'London',
    country: 'United Kingdom',
    description: 'Bhaktivedanta Manor, located in Hertfordshire, just outside London, is one of the largest and most popular ISKCON centers in Europe. The property was donated to ISKCON by George Harrison of the Beatles in 1973.',
    image: '/images/temples/london.jpg',
    contactPhone: '+44 20 7405 9451',
    contactEmail: 'info@iskconlondon.org',
    contactWebsite: 'www.iskconlondon.org',
    scheduleArati: '4:30 AM, 7:15 AM, 12:30 PM, 4:00 PM, 7:00 PM',
    scheduleDarshan: '7:15 AM to 1:00 PM, 4:00 PM to 8:00 PM',
    scheduleClasses: 'Morning: 8:00 AM, Evening: 6:30 PM'
  },
  {
    id: '5',
    name: 'ISKCON Temple Mayapur',
    location: 'Mayapur, West Bengal',
    country: 'India',
    description: 'ISKCON Mayapur, also known as Sri Mayapur Chandrodaya Mandir, is the headquarters of ISKCON. Located in Mayapur, the birthplace of Lord Chaitanya Mahaprabhu, it is one of the largest temple complexes in the world, spanning over 700,000 square feet.',
    image: '/images/temples/mayapur.jpg',
    contactPhone: '+91 3472 245 239',
    contactEmail: 'info@iskconmayapur.org',
    contactWebsite: 'www.iskconmayapur.org',
    scheduleArati: '4:30 AM, 7:00 AM, 8:15 AM, 12:00 PM, 4:00 PM, 6:30 PM, 8:30 PM',
    scheduleDarshan: '7:15 AM to 1:00 PM, 4:00 PM to 9:00 PM',
    scheduleClasses: 'Morning: 7:30 AM, Evening: 5:30 PM'
  }
];

export default function TempleDetail() {
  const router = useRouter();
  const params = useParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [temple, setTemple] = useState<Temple | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if the user is logged in
    const checkAuth = () => {
      const authToken = localStorage.getItem('iskcon_admin_token');
      if (!authToken) {
        router.push('/admin/login');
        return;
      }
      
      setIsAuthenticated(true);
      loadTempleData();
    };

    const loadTempleData = () => {
      try {
        // In a real app, this would be an API call to fetch temple data
        if (!params || !params.id) {
          setError('Temple ID not found');
          setIsLoading(false);
          return;
        }
        
        const templeId = params.id.toString();
        const foundTemple = sampleTemples.find(t => t.id === templeId);
        
        if (foundTemple) {
          setTemple(foundTemple);
        } else {
          setError('Temple not found');
        }
      } catch (error) {
        console.error('Error loading temple data:', error);
        setError('Failed to load temple data');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [params, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-t-4 border-iskcon-orange border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !temple) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700">{error || 'Temple information not available'}</p>
          <div className="mt-6">
            <Link href="/admin/temples" className="inline-flex items-center text-iskcon-orange hover:underline">
              <FaArrowLeft className="mr-2" /> Back to Temple List
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/admin/temples" className="flex items-center text-gray-800 hover:text-iskcon-orange mr-6">
                <FaArrowLeft className="mr-2" />
                <span>Back to Temple List</span>
              </Link>
              <h1 className="text-2xl font-bold text-gray-800">{temple.name}</h1>
            </div>
            <Link href={`/admin/temples/${temple.id}/edit`}>
              <button className="px-4 py-2 bg-iskcon-orange text-white rounded-md hover:bg-iskcon-orange/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-iskcon-orange flex items-center">
                <FaEdit className="mr-2" /> Edit Temple
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Hero Section with Image */}
          <div className="relative w-full h-64 md:h-96">
            {temple.image ? (
              <div className="w-full h-full relative">
                <Image 
                  src={temple.image.replace(/\\/g, '/')} 
                  alt={temple.name}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="w-full h-full"
                  priority
                />
              </div>
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-lg">No Image Available</span>
              </div>
            )}
          </div>

          {/* Temple Information */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column - Basic Info */}
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">About the Temple</h2>
                <p className="text-gray-700 mb-6 leading-relaxed">{temple.description}</p>
                
                <div className="flex items-center text-gray-700 mb-3">
                  <FaMapMarkerAlt className="mr-2 text-iskcon-orange" />
                  <span>{temple.location}, {temple.country}</span>
                </div>
              </div>

              {/* Right Column - Contact Info */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h2>
                
                {temple.contactPhone && (
                  <div className="flex items-center text-gray-700 mb-3">
                    <FaPhone className="mr-2 text-iskcon-orange" />
                    <span>{temple.contactPhone}</span>
                  </div>
                )}
                
                {temple.contactEmail && (
                  <div className="flex items-center text-gray-700 mb-3">
                    <FaEnvelope className="mr-2 text-iskcon-orange" />
                    <a href={`mailto:${temple.contactEmail}`} className="hover:text-iskcon-orange">
                      {temple.contactEmail}
                    </a>
                  </div>
                )}
                
                {temple.contactWebsite && (
                  <div className="flex items-center text-gray-700 mb-3">
                    <FaGlobe className="mr-2 text-iskcon-orange" />
                    <a 
                      href={temple.contactWebsite.startsWith('http') ? temple.contactWebsite : `https://${temple.contactWebsite}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-iskcon-orange"
                    >
                      {temple.contactWebsite}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Schedule Information */}
            <div className="mt-8 border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Temple Schedule</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {temple.scheduleArati && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center text-gray-800 font-medium mb-2">
                      <FaClock className="mr-2 text-iskcon-orange" />
                      <h3>Arati Schedule</h3>
                    </div>
                    <p className="text-gray-700">{temple.scheduleArati}</p>
                  </div>
                )}
                
                {temple.scheduleDarshan && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center text-gray-800 font-medium mb-2">
                      <FaClock className="mr-2 text-iskcon-orange" />
                      <h3>Darshan Hours</h3>
                    </div>
                    <p className="text-gray-700">{temple.scheduleDarshan}</p>
                  </div>
                )}
                
                {temple.scheduleClasses && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center text-gray-800 font-medium mb-2">
                      <FaCalendarAlt className="mr-2 text-iskcon-orange" />
                      <h3>Classes</h3>
                    </div>
                    <p className="text-gray-700">{temple.scheduleClasses}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 