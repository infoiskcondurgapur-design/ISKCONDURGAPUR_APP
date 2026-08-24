import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FaArrowLeft, FaCalendarAlt, FaUser, FaTag, FaBookOpen, FaShareAlt, FaWhatsapp, FaFacebook, FaTwitter } from 'react-icons/fa';
import dbConnect from '@/utils/db';
import Blog from '@/models/blog.model';
import { blogFallbackDb } from '@/utils/blogFallbackDb';
import CopyLinkButton from '@/components/CopyLinkButton';
import FadeIn from '@/components/FadeIn';

interface BlogArticle {
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  coverImage?: string;
  author: string;
  createdAt: string;
}

// Revalidate every 60 seconds (or 0 for dynamic)
export const revalidate = 60;

async function getArticle(slug: string): Promise<BlogArticle | null> {
  try {
    await dbConnect();
    const article = await Blog.findOne({ slug, status: 'Published' }).lean();
    if (article) {
      return JSON.parse(JSON.stringify(article)) as BlogArticle;
    }
  } catch (dbErr) {
    console.warn('Database offline, trying fallback database:', dbErr);
  }

  const article = blogFallbackDb.getBySlug(slug);
  if (article && article.status === 'Published') {
    return article as BlogArticle;
  }
  return null;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await getArticle(params.slug);
  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  const title = `${article.title} | ISKCON Durgapur`;
  const description = article.summary || `Read more about ${article.title}`;
  const coverImage = article.coverImage || 'https://www.iskcondurgapur.org/images/og-image.jpg';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://www.iskcondurgapur.org/blog/${params.slug}`,
      images: [
        {
          url: coverImage,
          alt: article.title,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [coverImage],
    }
  };
}

export default async function BlogDetail({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug);

  if (!article) {
    return (
      <main className="min-h-screen pt-28 pb-20 bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 max-w-md w-full text-center">
          <span className="text-5xl mb-4 block">≡ƒòë∩╕Å</span>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Article Not Found</h2>
          <p className="text-gray-400 mb-6 font-semibold">The blog article you are looking for does not exist.</p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 bg-[#FF6B00] text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition"
          >
            <FaArrowLeft /> Back to Blog & News
          </Link>
        </div>
      </main>
    );
  }

  // Estimate read time based on 200 words per minute
  const getReadTime = (text: string) => {
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  // Helper to format content (converts double newlines to paragraphs if raw text, otherwise handles HTML)
  const renderContent = (content: string) => {
    const isHTML = /<\/?[a-z][\s\S]*>/i.test(content) || content.includes('<!DOCTYPE html>');
    
    if (isHTML) {
      return <div className="prose max-w-none prose-orange" dangerouslySetInnerHTML={{ __html: content }} />;
    }
    
    return (
      <div className="space-y-6 text-gray-700 text-lg leading-relaxed font-medium">
        {content.split(/\n\s*\n/).map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    );
  };

  const articleUrl = `https://www.iskcondurgapur.org/blog/${params.slug}`;

  return (
    <main className="min-h-screen bg-[#F3D4A5] pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation */}
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-[#FF6B00] transition-colors font-semibold text-sm"
          >
            <FaArrowLeft /> Back to Blog & News
          </Link>
        </div>

        <FadeIn>
          {/* Header */}
          <header className="mb-10">
            <span className="inline-flex items-center gap-1.5 bg-orange-50 text-[#FF6B00] text-xs font-bold px-3 py-1.5 rounded-full mb-6 uppercase tracking-wider">
              <FaTag className="text-[10px]" /> {article.category}
            </span>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight mb-6 leading-tight">
              {article.title}
            </h1>

            {/* Metadata bar */}
            <div className="flex flex-wrap items-center gap-6 text-sm font-semibold text-gray-400 border-y border-gray-100 py-4">
              <span className="flex items-center gap-2">
                <FaCalendarAlt /> {new Date(article.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-2">
                <FaUser /> {article.author}
              </span>
              <span className="flex items-center gap-2">
                <FaBookOpen /> {getReadTime(article.content)}
              </span>
            </div>
          </header>

          {/* Cover Image */}
          {article.coverImage && (
            <div className="relative h-64 sm:h-[400px] w-full rounded-3xl overflow-hidden mb-12 shadow-md">
              <Image
                src={article.coverImage}
                alt={article.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1200px) 100vw, 900px"
              />
            </div>
          )}

          {/* Summary Alert box */}
          <div className="bg-orange-50/30 border-l-4 border-orange-500 p-6 rounded-r-2xl mb-10">
            <h3 className="font-bold text-orange-900 text-sm mb-1.5 uppercase tracking-wider">Summary</h3>
            <p className="text-gray-600 font-medium italic text-[15px] leading-relaxed">
              &quot;{article.summary}&quot;
            </p>
          </div>

          <div className="article-body font-sans">
            {renderContent(article.content)}
          </div>

          {/* Share Article Section */}
          <div className="mt-12 pt-8 border-t border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaShareAlt className="text-[#FF6B00]" /> Share this article
            </h3>
            <div className="flex flex-wrap gap-4">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' - ' + articleUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-[#25D366] text-white rounded-xl font-bold hover:bg-[#1ebe57] transition shadow-sm"
              >
                <FaWhatsapp size={20} /> WhatsApp
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-[#1877F2] text-white rounded-xl font-bold hover:bg-[#166fe5] transition shadow-sm"
              >
                <FaFacebook size={20} /> Facebook
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(articleUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-[#1DA1F2] text-white rounded-xl font-bold hover:bg-[#1a91da] transition shadow-sm"
              >
                <FaTwitter size={20} /> Twitter
              </a>
              <CopyLinkButton url={articleUrl} />
            </div>
          </div>
        </FadeIn>

      </div>
    </main>
  );
}
