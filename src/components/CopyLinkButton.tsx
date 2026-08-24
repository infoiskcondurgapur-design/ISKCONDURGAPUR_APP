'use client';

import { LuLink } from 'react-icons/lu';

interface CopyLinkButtonProps {
  url: string;
}

export default function CopyLinkButton({ url }: CopyLinkButtonProps) {
  const handleCopy = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 border border-gray-200 rounded-xl font-bold hover:bg-gray-200 transition shadow-sm"
    >
      <LuLink size={18} /> Copy Link
    </button>
  );
}
