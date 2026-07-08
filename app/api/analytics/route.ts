import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Lead from '@/models/Lead';
import Activity from '@/models/Activity';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();

  const [
    totalLeads,
    newLeads,
    coldLeads,
    interestedLeads,
    lostLeads,
    convertedLeads,
    recentLeads,
  ] = await Promise.all([
    Lead.countDocuments(),
    Lead.countDocuments({ status: 'New' }),
    Lead.countDocuments({ status: 'Cold' }),
    Lead.countDocuments({ status: '1. Interested' }),
    Lead.countDocuments({ status: 'Lost' }),
    Lead.countDocuments({ status: 'Converted' }),
    Lead.find().sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  // Monthly leads for the last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyLeads = await Lead.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const statusBreakdown = await Lead.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // Sales funnel grouped by lead source (real replacement for Privyr's "by Location")
  const sourceFunnel = await Lead.aggregate([
    {
      $group: {
        _id: { $ifNull: ['$source', 'Manual'] },
        total: { $sum: 1 },
        interested: { $sum: { $cond: [{ $eq: ['$status', '1. Interested'] }, 1, 0] } },
        warm: { $sum: { $cond: [{ $in: ['$status', ['Warm', 'No Response']] }, 1, 0] } },
        converted: { $sum: { $cond: [{ $eq: ['$status', 'Converted'] }, 1, 0] } },
      },
    },
    { $sort: { total: -1 } },
    { $limit: 8 },
  ]);

  // Activities grouped by type
  const activityByType = await Activity.aggregate([
    { $group: { _id: '$type', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // Leads per day for the last 14 days
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 13);
  twoWeeksAgo.setHours(0, 0, 0, 0);
  const dailyLeads = await Lead.aggregate([
    { $match: { createdAt: { $gte: twoWeeksAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const totalActivities = await Activity.countDocuments();

  return NextResponse.json({
    stats: {
      totalLeads,
      newLeads,
      coldLeads,
      interestedLeads,
      lostLeads,
      convertedLeads,
      totalActivities,
    },
    monthlyLeads,
    statusBreakdown,
    sourceFunnel,
    activityByType,
    dailyLeads,
    recentLeads,
  });
}
