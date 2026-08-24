import type { Metadata } from 'next';
import Link from 'next/link';
import dbConnect from '@/utils/db';
import DailyUpdate from '@/models/daily-update.model';
import { dailyUpdatesFallbackDb } from '@/utils/dailyUpdatesFallbackDb';
import DailyUpdateDetailClient from './DailyUpdateDetailClient';

interface Props {
    params: { date: string };
}

async function getDailyUpdate(date: string) {
    const isDate = /^\d{4}-\d{2}-\d{2}$/.test(date);
    if (!isDate) return null;

    try {
        await dbConnect();
        const update = await DailyUpdate.findOne({ date });
        if (update) {
            return JSON.parse(JSON.stringify(update));
        }
    } catch (dbErr) {
        console.warn('Database offline, finding in fallback JSON DB:', dbErr);
    }

    try {
        const update = dailyUpdatesFallbackDb.getByDate(date);
        if (update) {
            return JSON.parse(JSON.stringify(update));
        }
    } catch (fallbackErr) {
        console.error('Error fetching from fallback DB:', fallbackErr);
    }

    return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { date } = params;
    const update = await getDailyUpdate(date);

    if (!update) {
        return {
            title: 'Darshan Not Found | ISKCON Durgapur',
            description: `Sorry, we couldn't find any daily update published for ${date}.`,
        };
    }

    const [year, month, day] = update.date.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    const formattedDate = d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const title = `${update.title} - Daily Updates`;
    const description = update.message
        ? update.message.replace(/\r?\n/g, ' ').substring(0, 150).trim() + (update.message.length > 150 ? '...' : '')
        : `Daily Deity Darshan and spiritual message for ${formattedDate} from ISKCON Durgapur.`;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.iskcondurgapur.org';
    
    let imageUrl = '/images/og-image.jpg';
    if (update.images && update.images.length > 0) {
        imageUrl = update.images[0];
    }

    if (imageUrl.startsWith('/')) {
        imageUrl = `${baseUrl}${imageUrl}`;
    }

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: `${baseUrl}/daily-updates/${update.date}`,
            siteName: 'ISKCON Durgapur',
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: update.title,
                },
            ],
            locale: 'en_IN',
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [imageUrl],
        },
    };
}

export default async function DailyUpdateDetailPage({ params }: Props) {
    const { date } = params;
    const update = await getDailyUpdate(date);

    if (!update) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6 text-center">
                <div className="bg-white p-10 rounded-3xl border border-gray-100 max-w-md shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">Darshan Not Found</h2>
                    <p className="text-gray-500 mb-8 font-medium">Sorry, we couldn&apos;t find any daily update published for {date}.</p>
                    <Link href="/daily-updates" className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold transition-all shadow-md">
                        Back to All Updates
                    </Link>
                </div>
            </div>
        );
    }

    return <DailyUpdateDetailClient update={update} />;
}
