import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import PageView from '@/models/pageview.model';
import { verifyAdmin } from '@/utils/authHelper';

export const dynamic = 'force-dynamic';

async function getBounceRateForPeriod(start: Date, end: Date) {
    const result = await PageView.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: '$sessionId', count: { $sum: 1 } } },
        { $group: {
            _id: null,
            totalSessions: { $sum: 1 },
            bounces: {
                $sum: { $cond: [{ $eq: ['$count', 1] }, 1, 0] }
            }
        } }
    ]);
    if (!result || result.length === 0) {
        return 0;
    }
    const { totalSessions, bounces } = result[0];
    return totalSessions > 0 ? (bounces / totalSessions) * 100 : 0;
}

export async function GET(request: NextRequest) {
    try {
        // 1. Authenticate user
        verifyAdmin(request);

        const { searchParams } = new URL(request.url);
        const range = searchParams.get('range') || '7d';

        await dbConnect();

        // Calculate date ranges
        const now = new Date();
        const startDate = new Date();
        const prevStartDate = new Date();

        if (range === '24h') {
            startDate.setHours(now.getHours() - 24);
            prevStartDate.setHours(now.getHours() - 48);
        } else if (range === '30d') {
            startDate.setDate(now.getDate() - 30);
            prevStartDate.setDate(now.getDate() - 60);
        } else {
            // Default 7 days
            startDate.setDate(now.getDate() - 7);
            prevStartDate.setDate(now.getDate() - 14);
        }

        // 2. Fetch page view statistics
        const [
            currentViews,
            prevViews,
            currentUniqueArr,
            prevUniqueArr,
            currentBounceRate,
            prevBounceRate
        ] = await Promise.all([
            PageView.countDocuments({ createdAt: { $gte: startDate, $lte: now } }),
            PageView.countDocuments({ createdAt: { $gte: prevStartDate, $lt: startDate } }),
            PageView.distinct('sessionId', { createdAt: { $gte: startDate, $lte: now } }),
            PageView.distinct('sessionId', { createdAt: { $gte: prevStartDate, $lt: startDate } }),
            getBounceRateForPeriod(startDate, now),
            getBounceRateForPeriod(prevStartDate, startDate)
        ]);

        const currentUnique = currentUniqueArr.length;
        const prevUnique = prevUniqueArr.length;

        // Calculate changes
        const viewsDiff = currentViews - prevViews;
        const viewsPercentChange = prevViews > 0 ? (viewsDiff / prevViews) * 100 : 0;
        const viewsChangeStr = `${viewsPercentChange >= 0 ? '+' : ''}${viewsPercentChange.toFixed(1)}%`;
        const viewsUp = viewsPercentChange >= 0;

        const uniqueDiff = currentUnique - prevUnique;
        const uniquePercentChange = prevUnique > 0 ? (uniqueDiff / prevUnique) * 100 : 0;
        const uniqueChangeStr = `${uniquePercentChange >= 0 ? '+' : ''}${uniquePercentChange.toFixed(1)}%`;
        const uniqueUp = uniquePercentChange >= 0;

        const bounceDiff = currentBounceRate - prevBounceRate;
        const bounceChangeStr = `${bounceDiff >= 0 ? '+' : ''}${bounceDiff.toFixed(1)}%`;
        const bounceUp = bounceDiff <= 0; // Negative bounce rate change is good

        // 3. Most viewed pages
        const pagesAggregation = await PageView.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: now } } },
            { $group: {
                _id: '$path',
                views: { $sum: 1 },
                uniqueSessions: { $addToSet: '$sessionId' }
            } },
            { $project: {
                path: '$_id',
                views: 1,
                unique: { $size: '$uniqueSessions' }
            } },
            { $sort: { views: -1 } },
            { $limit: 6 }
        ]);

        const pathTitles: Record<string, string> = {
            '/': 'Home Page',
            '/resources/bhajans': 'Vaishnava Bhajans Songbook',
            '/donate': 'Support Seva & Donation',
            '/about/temple': 'Temple Information',
            '/courses': 'Spiritual Courses',
            '/events': 'Festivals & Events',
        };
        const pathDurations: Record<string, string> = {
            '/': '2m 21s',
            '/resources/bhajans': '4m 38s',
            '/donate': '2m 04s',
            '/about/temple': '2m 58s',
            '/courses': '2m 42s',
            '/events': '2m 16s',
        };

        const pages = pagesAggregation.map(item => ({
            path: item.path,
            title: pathTitles[item.path] || 'Other Page',
            views: item.views,
            unique: item.unique,
            avgTime: pathDurations[item.path] || '1m 45s'
        }));

        // 4. Traffic sources percentages
        const sourcesAggregation = await PageView.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: now } } },
            { $group: { _id: '$referrer', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const totalSourcesViews = sourcesAggregation.reduce((acc, curr) => acc + curr.count, 0);
        const sources = sourcesAggregation.map(item => ({
            name: item._id,
            count: item.count,
            percentage: totalSourcesViews > 0 ? Math.round((item.count / totalSourcesViews) * 100) : 0
        }));

        // Fill in defaults if not present
        const defaultSources = ['Direct', 'Google Search', 'WhatsApp', 'Facebook', 'YouTube Referrals'];
        defaultSources.forEach(src => {
            if (!sources.some(s => s.name === src)) {
                sources.push({ name: src, count: 0, percentage: 0 });
            }
        });

        // 5. Device statistics
        const devicesAggregation = await PageView.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: now } } },
            { $group: { _id: '$deviceType', count: { $sum: 1 } } }
        ]);

        const totalDevices = devicesAggregation.reduce((acc, curr) => acc + curr.count, 0);
        const devices = { mobile: 0, desktop: 0, tablet: 0 };
        devicesAggregation.forEach(item => {
            if (item._id in devices) {
                devices[item._id as 'mobile' | 'desktop' | 'tablet'] = totalDevices > 0 
                    ? Math.round((item.count / totalDevices) * 100) 
                    : 0;
            }
        });

        // Ensure sum equals 100 if any devices
        const sumDevices = devices.mobile + devices.desktop + devices.tablet;
        if (sumDevices > 0 && sumDevices !== 100) {
            devices.mobile += (100 - sumDevices);
        }

        // 6. Browser statistics
        const browsersAggregation = await PageView.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: now } } },
            { $group: { _id: '$browserName', count: { $sum: 1 } } }
        ]);
        const totalBrowsers = browsersAggregation.reduce((acc, curr) => acc + curr.count, 0);
        const browsers: Record<string, string> = { Chrome: '0%', Safari: '0%', Firefox: '0%', Edge: '0%', Other: '0%' };
        browsersAggregation.forEach(item => {
            const pct = totalBrowsers > 0 ? ((item.count / totalBrowsers) * 100).toFixed(1) : '0';
            browsers[item._id] = `${pct}%`;
        });

        // 7. Geographic Map / Locations
        const locationsAggregation = await PageView.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: now } } },
            { $group: { _id: '$city', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const cityCoordinates: Record<string, { lat: string, lng: string }> = {
            'Durgapur': { lat: '45%', lng: '52%' },
            'Kolkata': { lat: '65%', lng: '68%' },
            'Asansol': { lat: '35%', lng: '42%' },
            'New Delhi': { lat: '20%', lng: '22%' },
            'Mumbai': { lat: '75%', lng: '18%' },
            'International': { lat: '50%', lng: '85%' },
        };

        const locations = locationsAggregation.map(item => {
            const coords = cityCoordinates[item._id] || { lat: '50%', lng: '50%' };
            return {
                city: item._id,
                count: item.count,
                lat: coords.lat,
                lng: coords.lng
            };
        });



        // 8. Active visitors right now (last 5 minutes)
        const fiveMinAgo = new Date();
        fiveMinAgo.setMinutes(fiveMinAgo.getMinutes() - 5);
        const liveVisitors = await PageView.distinct('sessionId', { createdAt: { $gte: fiveMinAgo } }).then(arr => arr.length);

        // Generate sparkline: single aggregation bucketed by minute (replaces 12 N+1 queries)
        const twelveMinAgo = new Date();
        twelveMinAgo.setMinutes(twelveMinAgo.getMinutes() - 12);

        const sparklineAgg = await PageView.aggregate([
            { $match: { createdAt: { $gte: twelveMinAgo } } },
            {
                $group: {
                    _id: {
                        $floor: {
                            $divide: [
                                { $subtract: ['$createdAt', twelveMinAgo] },
                                60000 // 1 minute in ms
                            ]
                        }
                    },
                    sessions: { $addToSet: '$sessionId' }
                }
            }
        ]);

        const recentLiveActivity = Array(12).fill(0);
        sparklineAgg.forEach(bucket => {
            const idx = Math.min(Math.floor(bucket._id), 11);
            recentLiveActivity[idx] = bucket.sessions.length;
        });

        const data = {
            views: currentViews.toLocaleString('en-IN'),
            viewsChange: viewsChangeStr,
            viewsUp,
            unique: currentUnique.toLocaleString('en-IN'),
            uniqueChange: uniqueChangeStr,
            uniqueUp,
            duration: '3m 34s',
            bounce: `${currentBounceRate.toFixed(1)}%`,
            bounceChange: bounceChangeStr,
            bounceUp,
            pages,
            sources: sources.sort((a, b) => b.count - a.count),
            devices,
            browsers,
            locations: locations.sort((a, b) => b.count - a.count),
            live: {
                count: liveVisitors,
                activity: recentLiveActivity
            }
        };

        return NextResponse.json(data, { status: 200 });

    } catch (error: any) {
        console.error('Error fetching admin analytics statistics:', error);
        return NextResponse.json({ error: 'Failed to retrieve stats: ' + error.message }, { status: 500 });
    }
}
