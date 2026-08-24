import { MetadataRoute } from 'next';
import dbConnect from '@/utils/db';
import Course from '@/models/course.model';
import Event from '@/models/event.model';
import Tour from '@/models/tour.model';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://iskcondurgapur.org';

  // Static routes
  const routes = [
    '',
    '/about',
    '/about/history',
    '/about/mission',
    '/about/temple',
    '/about/prabhupada',
    '/about/contact',
    '/philosophy',
    '/spiritual-life',
    '/spiritual-life/daily-life',
    '/spiritual-life/daily-worship',
    '/spiritual-life/festivals',
    '/spiritual-life/initiation',
    '/spiritual-life/sadhana',
    '/resources',
    '/resources/bhajans',
    '/resources/books',
    '/resources/calendar',
    '/resources/gallery',
    '/resources/videos',
    '/resources/articles',
    '/resources/background-remover',
    '/resources/prabhupada-quotes',
    '/events',
    '/events/calendar',
    '/events/janmashtami',
    '/courses',
    '/courses/completed',
    '/courses/upcoming',
    '/spiritual-tours',
    '/gallery',
    '/store',
    '/donate',
    '/become-member'
  ];

  const staticSitemaps = routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  const dynamicSitemaps: MetadataRoute.Sitemap = [];

  try {
    await dbConnect();

    // 1. Fetch dynamic Courses
    const courses = await Course.find({ status: { $ne: 'draft' } }).select('_id updatedAt').lean();
    courses.forEach((course: any) => {
      dynamicSitemaps.push({
        url: `${baseUrl}/courses/${course._id}`,
        lastModified: course.updatedAt || new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    });

    // 2. Fetch dynamic Events
    const events = await Event.find({}).select('_id updatedAt').lean();
    events.forEach((event: any) => {
      dynamicSitemaps.push({
        url: `${baseUrl}/events/${event._id}`,
        lastModified: event.updatedAt || new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    });

    // 3. Fetch dynamic Spiritual Tours
    const tours = await Tour.find({}).select('_id updatedAt').lean();
    tours.forEach((tour: any) => {
      dynamicSitemaps.push({
        url: `${baseUrl}/spiritual-tours/${tour._id}`,
        lastModified: tour.updatedAt || new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    });
  } catch (error) {
    console.warn('Database error while generating sitemap, falling back to static routes:', error);
  }

  return [...staticSitemaps, ...dynamicSitemaps];
}
