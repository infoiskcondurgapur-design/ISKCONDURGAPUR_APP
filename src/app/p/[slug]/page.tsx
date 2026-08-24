import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import dbConnect from '@/utils/db';
import Page from '@/models/page.model';
import { pageFallbackDb } from '@/utils/pageFallbackDb';
import SafeHtmlRenderer from '@/components/SafeHtmlRenderer';

// Revalidate every 60 seconds (or 0 for dynamic)
export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params;

  let pageData = null;
  try {
    await dbConnect();
    pageData = await Page.findOne({ slug, status: 'Published' }).lean();
  } catch (error) {
    pageData = pageFallbackDb.getBySlug(slug);
    if (pageData && pageData.status !== 'Published') {
      pageData = null;
    }
  }

  if (!pageData) {
    return {
      title: 'Page Not Found',
    };
  }

  const title = `${pageData.title} | ISKCON Durgapur`;
  const description = `Read more about ${pageData.title}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://www.iskcondurgapur.org/p/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    }
  };
}

export default async function CustomPageViewer({ params }: { params: { slug: string } }) {
  const { slug } = params;

  let pageData = null;
  try {
    await dbConnect();
    // Only fetch published pages
    pageData = await Page.findOne({ slug, status: 'Published' }).lean();
  } catch (error) {
    pageData = pageFallbackDb.getBySlug(slug);
    if (pageData && pageData.status !== 'Published') {
      pageData = null;
    }
  }

  if (!pageData) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Render the custom HTML securely in an isolated iframe */}
        <SafeHtmlRenderer html={pageData.content} />
      </div>
    </main>
  );
}
