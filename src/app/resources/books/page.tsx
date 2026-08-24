'use client';

import Image from 'next/image';
import Link from 'next/link';

interface BookEntry {
  id: string;
  title: string;
  description: string;
  cover: string;
}

// Canonical catalog — IDs match the reader's chapter maps (/resources/books/[id])
const books: BookEntry[] = [
  {
    id: '65f1234567890abcdef12301',
    title: 'Bhagavad-gītā As It Is',
    description: 'The timeless conversation between Lord Kṛṣṇa and Arjuna — the essence of Vedic wisdom.',
    cover: '/images/books/bhagavad_gita.jpg',
  },
  {
    id: '65f1234567890abcdef12302',
    title: 'Śrīmad-Bhāgavatam',
    description: 'The ripened fruit of the tree of Vedic literature, narrating the pastimes of the Lord.',
    cover: '/images/books/srimad_bhagavatam.jpg',
  },
  {
    id: '65f1234567890abcdef12303',
    title: 'Śrī Caitanya-caritāmṛta',
    description: 'The life and teachings of Śrī Caitanya Mahāprabhu, the golden avatar.',
    cover: '/images/books/caitanya_caritamrta.jpg',
  },
  {
    id: '65f1234567890abcdef12304',
    title: 'Nectar of Instruction',
    description: 'Eleven essential instructions from Śrīla Rūpa Gosvāmī, illuminated by Śrīla Prabhupāda.',
    cover: '/images/books/nectar_of_instruction.jpg',
  },
  {
    id: '65f1234567890abcdef12305',
    title: 'Kṛṣṇa, the Supreme Personality of Godhead',
    description: 'The beautiful pastimes of Lord Kṛṣṇa in Vṛndāvana, told by Śrīla Prabhupāda.',
    cover: '/images/books/krsna_book.jpg',
  },
  {
    id: '65f1234567890abcdef12306',
    title: 'The Nectar of Devotion',
    description: 'The complete science of bhakti-yoga, based on Śrīla Rūpa Gosvāmī’s Bhakti-rasāmṛta-sindhu.',
    cover: '/images/books/nectar_of_devotion.jpg',
  },
  {
    id: '65f1234567890abcdef12307',
    title: 'Śrī Īśopaniṣad',
    description: 'Eighteen mantras revealing the Lord’s ownership and control of everything.',
    cover: '/images/books/sri_isopanisad.jpg',
  },
  {
    id: '65f1234567890abcdef12308',
    title: 'The Science of Self-Realization',
    description: 'Practical guidance on yoga, meditation, and living in Kṛṣṇa consciousness.',
    cover: '/images/books/science_of_self_realization.jpg',
  },
  {
    id: '65f1234567890abcdef12309',
    title: 'Beyond Birth and Death',
    description: 'We are not these bodies — discover the soul’s journey beyond birth and death.',
    cover: '/images/books/beyond_birth_death.jpg',
  },
  {
    id: '65f1234567890abcdef12310',
    title: 'Bhakti: The Art of Eternal Love',
    description: 'Awakening our natural state of pure love of God through devotional service.',
    cover: '/images/books/bhakti_art_of_eternal_love.jpg',
  },
  {
    id: '65f1234567890abcdef12311',
    title: 'Śrī Brahma-saṁhitā',
    description: 'The hymns of Lord Brahma glorifying the Supreme Personality of Godhead.',
    cover: '/images/books/sri_brahma_samhita.jpg',
  },
  {
    id: '65f1234567890abcdef12312',
    title: 'Civilization and Transcendence',
    description: 'Simple living and high thinking — the spiritual solution to the modern malaise.',
    cover: '/images/books/civilization_and_transcendence.jpg',
  },
];

export default function PrabhupadaBooksPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              Srila Prabhupada&apos;s
            </h1>
            <h2 className="text-4xl md:text-5xl font-bold text-iskcon-orange mb-8">
              Divine Literature
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Explore the spiritual wisdom through Srila Prabhupada&apos;s books. Start your journey of
              self-realization today.
            </p>
          </div>
        </div>
      </section>

      {/* Books Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {books.map((book) => (
              <Link
                key={book.id}
                href={`/resources/books/${book.id}`}
                className="group bg-white rounded-md shadow-md overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 flex flex-col"
              >
                <div className="relative w-full aspect-[2/3] bg-[#eed5af]">
                  <Image
                    src={book.cover}
                    alt={book.title}
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug">{book.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 flex-grow">{book.description}</p>
                  <span className="inline-flex items-center text-iskcon-orange font-semibold text-sm group-hover:text-iskcon-orange-dark transition-colors">
                    Read Now →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
