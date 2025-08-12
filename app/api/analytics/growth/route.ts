import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import Post from '@/models/Post'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    const userType = searchParams.get('userType') || 'all' // 'all', 'real', 'generated'
    
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000))
    
    // Build user filter based on userType
    let userFilter = {}
    if (userType === 'real') {
      userFilter = { isGenerated: { $ne: true } }
    } else if (userType === 'generated') {
      userFilter = { isGenerated: true }
    }
    
    // Get user growth data with filtering
    const totalUsers = await User.countDocuments(userFilter)
    const newUsers = await User.countDocuments({
      ...userFilter,
      createdAt: { $gte: startDate }
    })
    
    // Calculate growth rate
    const previousPeriodStart = new Date(startDate.getTime() - (days * 24 * 60 * 60 * 1000))
    const previousNewUsers = await User.countDocuments({
      ...userFilter,
      createdAt: { $gte: previousPeriodStart, $lt: startDate }
    })
    
    const growthRate = previousNewUsers > 0 
      ? ((newUsers - previousNewUsers) / previousNewUsers * 100).toFixed(2)
      : '0.00'
    
    // Get daily growth data for chart
    const dailyGrowth = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(endDate.getTime() - (i * 24 * 60 * 60 * 1000))
      const nextDate = new Date(date.getTime() + (24 * 60 * 60 * 1000))
      
      const dayNewUsers = await User.countDocuments({
        ...userFilter,
        createdAt: { $gte: date, $lt: nextDate }
      })
      
      dailyGrowth.push({
        date: date.toISOString().split('T')[0],
        growth: dayNewUsers,
        churn: Math.floor(Math.random() * 5) // Mock churn data
      })
    }
    
    // Get acquisition channels with user filtering
    const acquisitionChannels = [
      { 
        channel: 'Organic Search', 
        users: Math.floor(totalUsers * 0.35), 
        cac: 0 
      },
      { 
        channel: 'Social Media', 
        users: Math.floor(totalUsers * 0.25), 
        cac: 5.4 
      },
      { 
        channel: 'Direct', 
        users: Math.floor(totalUsers * 0.20), 
        cac: 0 
      },
      { 
        channel: 'Referrals', 
        users: Math.floor(totalUsers * 0.15), 
        cac: 4.7 
      },
      { 
        channel: 'Paid Ads', 
        users: Math.floor(totalUsers * 0.05), 
        cac: 15.0 
      }
    ]
    
    // Cohort analysis (mock data for now)
    const cohortAnalysis = [
      { cohort: 'Dec 2023', day0: 100, day1: 78, day7: 45, day30: 23, day90: 12 },
      { cohort: 'Jan 2024', day0: 100, day1: 82, day7: 52, day30: 28, day90: 15 },
      { cohort: 'Feb 2024', day0: 100, day1: 85, day7: 58, day30: 34, day90: 18 },
      { cohort: 'Mar 2024', day0: 100, day1: 88, day7: 62, day30: 38, day90: 21 }
    ]
    
    return NextResponse.json({
      summary: {
        currentGrowthRate: parseFloat(growthRate),
        totalUsers,
        newUsers,
        netGrowth: parseFloat(growthRate),
        churnRate: 2.5 // Mock churn rate
      },
      metrics: {
        growthVsChurn: dailyGrowth
      },
      acquisitionChannels,
      cohortAnalysis,
      trends: dailyGrowth,
      userType,
      userCounts: {
        total: await User.countDocuments(),
        real: await User.countDocuments({ isGenerated: { $ne: true } }),
        generated: await User.countDocuments({ isGenerated: true })
      }
    })
    
  } catch (error) {
    console.error('Growth analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch growth analytics' },
      { status: 500 }
    )
  }
}