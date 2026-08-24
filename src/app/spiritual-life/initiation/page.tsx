'use client';
import React, { useState } from 'react';
import Image from 'next/image';

export default function InitiationPage() {
  const [showModal, setShowModal] = useState(false);
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'MOBILE' | 'OTP' | 'SUCCESS'>('MOBILE');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloadLink, setDownloadLink] = useState('');

  const handleSendOtp = async () => {
    setError('');
    if (!mobile || mobile.length < 10) {
      setError('Please enter a valid mobile number');
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile })
      });
      const data = await res.json();
      if (res.ok) {
        setStep('OTP');
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    if (!otp || otp.length < 4) {
      setError('Please enter a valid OTP');
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp })
      });
      const data = await res.json();
      if (res.ok) {
        setDownloadLink(data.downloadUrl || '#');
        setStep('SUCCESS');
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setShowModal(false);
    setStep('MOBILE');
    setMobile('');
    setOtp('');
    setError('');
    setDownloadLink('');
  };

  return (
    <main className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative py-20 flex items-center justify-center overflow-hidden bg-gray-900">
        <div className="absolute inset-0 opacity-40 bg-[url('/images/lotus-pattern.png')]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent z-0"></div>
        <div className="container mx-auto px-4 relative z-10 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">Spiritual Initiation</h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto drop-shadow-md">
            The sacred vow of dedication to the spiritual master and Sri Krishna.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Left Content */}
            <div className="lg:w-2/3 prose prose-lg text-gray-700">
              <p className="lead text-2xl text-iskcon-orange font-medium mb-8 text-center">
                &quot;To receive initiation means to agree to execute the order of the spiritual master.&quot;
                <br/>
                <span className="text-sm text-gray-500">— Srila Prabhupada</span>
              </p>

              <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-2 border-iskcon-orange pb-2 inline-block">What is Diksha (Initiation)?</h2>
              <p className="mb-6">
                In the Gaudiya Vaishnava tradition, spiritual initiation, or <strong>Diksha</strong>, is a formal ceremony where a devotee takes sacred vows under the guidance of a bona fide spiritual master (Guru). It marks the beginning of a committed spiritual life, dedicated to the service of Lord Krishna.
              </p>

              <div className="bg-orange-50 border-l-4 border-iskcon-orange p-6 rounded-r-lg mb-8 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-3">The Four Regulative Principles</h3>
                <p className="mb-4">Before taking initiation, a devotee must strictly follow four regulative principles for at least one year:</p>
                <ul className="list-disc pl-5 space-y-2 text-gray-800 font-medium">
                  <li>No meat-eating (including fish and eggs)</li>
                  <li>No illicit sex</li>
                  <li>No intoxication (including alcohol, caffeine, and tobacco)</li>
                  <li>No gambling</li>
                </ul>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-2 border-iskcon-orange pb-2 inline-block">Chanting the Holy Name</h2>
              <p className="mb-6">
                Alongside the regulative principles, an aspiring initiate commits to chanting a minimum of <strong>16 rounds</strong> of the Hare Krishna maha-mantra daily on japa beads:
              </p>
              <blockquote className="bg-gray-50 italic p-6 rounded-lg text-center text-xl font-medium text-gray-800 shadow-inner mb-8">
                Hare Krishna, Hare Krishna, Krishna Krishna, Hare Hare<br/>
                Hare Rama, Hare Rama, Rama Rama, Hare Hare
              </blockquote>

              <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-2 border-iskcon-orange pb-2 inline-block">The Process of Initiation</h2>
              <p className="mb-4">
                Taking initiation is a serious lifetime commitment. If you are interested in preparing for initiation:
              </p>
              <ol className="list-decimal pl-5 space-y-4 mb-8">
                <li><strong>Take Shelter:</strong> Begin by accepting the shelter of a spiritual master within ISKCON.</li>
                <li><strong>Practice:</strong> Follow the four regulative principles and chant 16 rounds daily for a minimum of one year.</li>
                <li><strong>Education:</strong> Complete the ISKCON Disciples Course (IDC), which provides essential training on guru-tattva and the duties of an initiated disciple.</li>
                <li><strong>Recommendation:</strong> Receive a formal recommendation from your local temple president or authority.</li>
              </ol>
            </div>

            {/* Sidebar */}
            <div className="lg:w-1/3 space-y-8">
              {/* Useful Links */}
              <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6 border-b-2 border-iskcon-orange pb-2 inline-block">Useful Links</h3>
                <ul className="space-y-4">
                  <li>
                    <a href="#" className="flex items-center text-gray-700 hover:text-iskcon-orange transition-colors">
                      <span className="w-2 h-2 bg-iskcon-orange rounded-full mr-3"></span>
                      ISKCON Disciples Course
                    </a>
                  </li>
                  <li>
                    <a href="#" className="flex items-center text-gray-700 hover:text-iskcon-orange transition-colors">
                      <span className="w-2 h-2 bg-iskcon-orange rounded-full mr-3"></span>
                      Chanting Japa Guide
                    </a>
                  </li>
                  <li>
                    <a href="#" className="flex items-center text-gray-700 hover:text-iskcon-orange transition-colors">
                      <span className="w-2 h-2 bg-iskcon-orange rounded-full mr-3"></span>
                      Find a Spiritual Master
                    </a>
                  </li>
                  <li>
                    <a href="#" className="flex items-center text-gray-700 hover:text-iskcon-orange transition-colors">
                      <span className="w-2 h-2 bg-iskcon-orange rounded-full mr-3"></span>
                      Initiation Vows Explained
                    </a>
                  </li>
                </ul>
              </div>

              {/* Certificates & Forms */}
              <div className="bg-orange-50 rounded-2xl p-8 border border-orange-100 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6 border-b-2 border-iskcon-orange pb-2 inline-block">Certificates & Forms</h3>
                <p className="text-gray-700 mb-6">Download the required recommendation forms and certificate templates for initiation.</p>
                <div className="space-y-3">
                  <a href="#" className="block w-full text-center bg-white border border-iskcon-orange text-iskcon-orange px-4 py-2 rounded-lg font-medium hover:bg-iskcon-orange hover:text-white transition-colors">
                    Recommendation Form
                  </a>
                  <button 
                    onClick={() => setShowModal(true)}
                    className="block w-full text-center bg-white border border-iskcon-orange text-iskcon-orange px-4 py-2 rounded-lg font-medium hover:bg-iskcon-orange hover:text-white transition-colors">
                    IDC Certificate Download
                  </button>
                </div>
              </div>
              
              {/* Ready to take next step? */}
              <div className="bg-gray-900 text-white rounded-2xl p-8 shadow-lg text-center">
                <h3 className="text-2xl font-bold mb-4">Ready to take the next step?</h3>
                <p className="mb-6 text-gray-300">Contact our temple authorities to learn more about the initiation process and the ISKCON Disciples Course.</p>
                <a href="/about/contact" className="inline-block w-full bg-iskcon-orange text-white px-8 py-3 rounded-full font-bold hover:bg-orange-600 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OTP Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative overflow-hidden transform transition-all">
            <button 
              onClick={resetModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            <h3 className="text-2xl font-bold text-gray-900 mb-6">IDC Certificate Download</h3>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                {error}
              </div>
            )}

            {step === 'MOBILE' && (
              <div className="space-y-4">
                <p className="text-gray-600 text-sm">Please enter your registered mobile number to verify your identity and download the certificate.</p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                  <input 
                    type="tel" 
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="Enter 10-digit number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-iskcon-orange focus:border-transparent outline-none transition-all"
                  />
                </div>
                <button 
                  onClick={handleSendOtp}
                  disabled={isLoading}
                  className={`w-full bg-iskcon-orange text-white py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </div>
            )}

            {step === 'OTP' && (
              <div className="space-y-4">
                <p className="text-gray-600 text-sm">We&apos;ve sent an OTP to <strong>{mobile}</strong>. (For testing, use <strong>1234</strong>)</p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
                  <input 
                    type="text" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="4-digit code"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-iskcon-orange focus:border-transparent outline-none text-center text-lg tracking-widest transition-all"
                    maxLength={4}
                  />
                </div>
                <button 
                  onClick={handleVerifyOtp}
                  disabled={isLoading}
                  className={`w-full bg-iskcon-orange text-white py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <div className="text-center mt-2">
                  <button onClick={() => setStep('MOBILE')} className="text-sm text-iskcon-orange hover:underline">Change Mobile Number</button>
                </div>
              </div>
            )}

            {step === 'SUCCESS' && (
              <div className="text-center space-y-6 py-4">
                <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h4 className="text-xl font-bold text-gray-900">Verification Successful!</h4>
                <p className="text-gray-600 text-sm">Your identity has been verified. You can now download your IDC Certificate.</p>
                <a 
                  href={downloadLink}
                  download
                  onClick={resetModal}
                  className="inline-block w-full bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Download Certificate Now
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
