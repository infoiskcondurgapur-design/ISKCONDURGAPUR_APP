'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Gallery, Item } from 'react-photoswipe-gallery';
import Masonry from 'react-masonry-css';
import { motion, AnimatePresence } from 'framer-motion';
import 'photoswipe/dist/photoswipe.css';

interface GalleryImage {
  id: number | string;
  src: string;
  thumbnail: string;
  title: string;
  category: string;
  width: number;
  height: number;
  description?: string;
  date?: string;
}

interface ApiImage {
  _id?: string;
  url?: string;
  title?: string;
  category?: string;
  date?: string;
}

const categories = [
  'All',
  'Temples',
  'Festivals',
  'Events',
  'Prabhupada',
  'History',
  'Books',
];

// Curated starter images shown alongside (or until) database images load
const STATIC_IMAGES: GalleryImage[] = [
  {
    id: 'static-1',
    src: '/images/krishna-temple.jpg',
    thumbnail: '/images/krishna-temple.jpg',
    title: 'ISKCON Temple',
    category: 'Temples',
    width: 1920,
    height: 1080,
    description: 'Beautiful ISKCON temple architecture showcasing Vedic design',
  },
  {
    id: 'static-2',
    src: '/images/events/janmashtami-celebration.jpg',
    thumbnail: '/images/events/janmashtami-celebration.jpg',
    title: 'Janmashtami Celebration',
    category: 'Festivals',
    width: 1920,
    height: 1080,
    description: 'Devotees celebrating the divine appearance of Lord Krishna',
  },
  {
    id: 'static-3',
    src: '/images/events/ratha-yatra-festival.jpg',
    thumbnail: '/images/events/ratha-yatra-festival.jpg',
    title: 'Ratha Yatra Festival',
    category: 'Festivals',
    width: 1920,
    height: 1080,
    description: 'The grand chariot festival celebrating Lord Jagannath',
  },
  {
    id: 'static-4',
    src: '/images/srila-prabhupada.jpg',
    thumbnail: '/images/srila-prabhupada.jpg',
    title: 'Srila Prabhupada - Founder Acharya',
    category: 'Prabhupada',
    width: 1920,
    height: 1080,
    description: 'His Divine Grace A.C. Bhaktivedanta Swami Prabhupada',
  },
  {
    id: 'static-5',
    src: '/images/history-of-iskcon.jpg',
    thumbnail: '/images/history-of-iskcon.jpg',
    title: 'ISKCON History',
    category: 'History',
    width: 1920,
    height: 1080,
    description: 'Historical moments in the development of ISKCON',
  },
  {
    id: 'static-6',
    src: '/images/iskcon-temple-dome.jpg',
    thumbnail: '/images/iskcon-temple-dome.jpg',
    title: 'Temple Dome',
    category: 'Temples',
    width: 1920,
    height: 1080,
    description: 'Majestic dome of an ISKCON temple',
  },
  {
    id: 'static-7',
    src: '/images/events/gaura-purnima-festival.jpg',
    thumbnail: '/images/events/gaura-purnima-festival.jpg',
    title: 'Gaura Purnima Festival',
    category: 'Festivals',
    width: 1920,
    height: 1080,
    description: 'Celebrating the appearance day of Lord Chaitanya Mahaprabhu',
  }
];

const breakpointColumns = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1
};

// Loading skeleton component
const ImageSkeleton = () => (
  <div className="relative w-full h-64 mb-4 bg-gray-200 rounded-xl overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer"
         style={{ backgroundSize: '400% 100%' }}></div>
  </div>
);

export default function PhotoGallery() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [allImages, setAllImages] = useState<GalleryImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  // Load images managed via the admin panel, merged with curated starters
  useEffect(() => {
    const load = async () => {
      let dbImages: GalleryImage[] = [];
      try {
        const res = await fetch('/api/gallery', { cache: 'no-store' });
        const result = await res.json();
        if (res.ok && Array.isArray(result.data)) {
          dbImages = (result.data as ApiImage[])
            .filter(img => img.url)
            .map((img, i) => ({
              id: img._id || `db-${i}`,
              src: img.url as string,
              thumbnail: img.url as string,
              title: img.title || 'Temple Moment',
              category: img.category || 'Events',
              width: 1920,
              height: 1080,
              description: img.title || undefined,
              date: img.date
            }));
        }
      } catch (err) {
        console.error('Error loading gallery:', err);
      }
      setAllImages([...dbImages, ...STATIC_IMAGES]);
    };
    load();
  }, []);

  useEffect(() => {
    // Filter images based on selected category
    const filtered = selectedCategory === 'All'
      ? allImages
      : allImages.filter(img => img.category === selectedCategory);

    setLoading(true);
    // Brief transition for smoother filtering
    setTimeout(() => {
      setFilteredImages(filtered);
      setLoading(false);
    }, 200);
  }, [selectedCategory, allImages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-rose-100 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Photo Gallery
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience the spiritual journey through our collection of beautiful moments captured at ISKCON temples and events worldwide.
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-2 mb-8" role="tablist">
          {categories.map((category) => (
            <motion.button
              key={category}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-purple-50'
              }`}
              onClick={() => setSelectedCategory(category)}
              role="tab"
              aria-selected={selectedCategory === category}
              aria-controls="gallery-grid"
            >
              {category}
            </motion.button>
          ))}
        </div>

        {/* Gallery */}
        <div id="gallery-grid" role="tabpanel" aria-label="Photo gallery grid">
          {loading ? (
            <Masonry
              breakpointCols={breakpointColumns}
              className="flex -ml-4 w-auto"
              columnClassName="pl-4 bg-clip-padding"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <ImageSkeleton key={n} />
              ))}
            </Masonry>
          ) : (
            <Gallery>
              <Masonry
                breakpointCols={breakpointColumns}
                className="flex -ml-4 w-auto"
                columnClassName="pl-4 bg-clip-padding"
              >
                <AnimatePresence>
                  {filteredImages.map((image) => (
                    <motion.div
                      key={image.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      className="mb-4"
                    >
                      <Item
                        original={image.src}
                        thumbnail={image.thumbnail}
                        width={image.width}
                        height={image.height}
                        caption={image.description}
                      >
                        {({ ref, open }) => (
                          <motion.div
                            ref={ref as any}
                            onClick={open}
                            className="relative overflow-hidden rounded-xl cursor-pointer group"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {image.src.startsWith('/') ? (
                              <Image
                                src={image.thumbnail}
                                alt={image.title}
                                width={image.width}
                                height={image.height}
                                className="w-full h-auto"
                                loading="lazy"
                              />
                            ) : (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={image.thumbnail}
                                alt={image.title}
                                className="w-full h-auto"
                                loading="lazy"
                              />
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <div className="text-white text-center px-4">
                                <h3 className="font-medium text-lg mb-2">{image.title}</h3>
                                <p className="text-sm opacity-90">{image.description}</p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </Item>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </Masonry>
            </Gallery>
          )}
        </div>

        {/* No Results Message */}
        {!loading && filteredImages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No images found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
