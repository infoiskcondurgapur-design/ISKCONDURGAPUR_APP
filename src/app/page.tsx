// Server Component — no 'use client' directive
// The animation-heavy HeroContent is lazy-loaded as a separate client chunk
// so Framer Motion / react-icons do NOT block the initial HTML paint.
import HeroContent from '@/components/HeroContent';

import FeaturedCourses from '@/components/FeaturedCourses';

export default function Home() {
  return (
    <>
      <HeroContent />
      <FeaturedCourses />
    </>
  );
}