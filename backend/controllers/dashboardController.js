import Lead from "../models/leadModel.js";
import BuyOpportunity from "../models/buyopportunityModel.js";
import SellOpportunity from "../models/sellopportunityModel.js";
import FinanceOpportunity from "../models/financeopportunityModel.js";
import InsuranceOpportunity from "../models/insuranceopportunityModel.js";
import RtoOpportunity from "../models/rtoopportunityModel.js";
import DeliveryForm from "../models/deliveryModel.js";
import Task from "../models/taskModel.js";
import User from "../models/userModel.js";
import Activity from "../models/activityModel.js";
import mongoose from "mongoose";

// Get comprehensive dashboard statistics
export const getDashboardStats = async (req, res) => {
    try {
        const { startDate, endDate, userId } = req.query;
        
            let createdBy;
             // If regular user (not Super Admin) and no userId specified, show only their leads
            if (req.user.role !== 'Super Admin') {
                createdBy = req.user.id;
                
            }
            // console.log(createdBy);
        // Build date filter
        const dateFilter = {};
        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
            if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
        }

        // Get current date ranges for comparison
        const currentDate = new Date();
        const startOfCurrentWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
        const startOfPreviousWeek = new Date(startOfCurrentWeek);
        startOfPreviousWeek.setDate(startOfPreviousWeek.getDate() - 7);

        // 1. Lead Statistics
        const leadStats = await getLeadStatistics(dateFilter, userId, createdBy);
        
        // 2. Opportunity Statistics
        const opportunityStats = await getOpportunityStatistics(dateFilter, userId);
        
        // 3. User Performance
        const userPerformance = await getUserPerformance(dateFilter);
        
        // 4. Task Statistics
        const taskStats = await getTaskStatistics(dateFilter, userId);
        
        // 5. Delivery Statistics
        const deliveryStats = await getDeliveryStatistics(dateFilter, userId);
        
        // 6. Recent Activities
        const recentActivities = await getRecentActivities();

        res.status(200).json({
            status: "success",
            message: "Dashboard statistics fetched successfully",
            data: {
                leadStats,
                opportunityStats,
                userPerformance,
                taskStats,
                deliveryStats,
                recentActivities,
                summary: {
                    totalLeads: leadStats.total,
                    totalOpportunities: opportunityStats.total,
                    totalTasks: taskStats.total,
                    totalDeliveries: deliveryStats.total
                }
            }
        });

    } catch (error) {
        console.error("Error fetching dashboard statistics:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to fetch dashboard statistics",
            error: error.message
        });
    }
};

// Lead Statistics
const getLeadStatistics = async (dateFilter, userId, createdBy) => {
    const leadFilter = { ...dateFilter };
   

    const [
        totalLeads,
        leadsByStatus,
        leadsBySource,
        leadTrend
    ] = await Promise.all([
        Lead.countDocuments(leadFilter),
        Lead.aggregate([
            { $match: leadFilter },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]),
        Lead.aggregate([
            { $match: leadFilter },
            {
                $group: {
                    _id: "$leadSource",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]),
        getLeadTrendData(leadFilter)
    ]);

    const statusBreakdown = {
        new: leadsByStatus.find(s => s._id === 'New Lead')?.count || 0,
        contacted: leadsByStatus.find(s => s._id === 'Contacted')?.count || 0,
        qualified: leadsByStatus.find(s => s._id === 'Qualified')?.count || 0,
        converted: leadsByStatus.find(s => s._id === 'Converted')?.count || 0
    };

    return {
        total: totalLeads,
        byStatus: statusBreakdown,
        bySource: leadsBySource.map(source => ({
            source: source._id || 'Unknown',
            count: source.count,
            percentage: Math.round((source.count / totalLeads) * 100) || 0
        })),
        trend: leadTrend
    };
};

// Lead Trend Data (Last 7 days)
const getLeadTrendData = async (filter) => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push(date.toISOString().split('T')[0]);
    }

    const leadTrend = await Lead.aggregate([
        {
            $match: {
                ...filter,
                createdAt: {
                    $gte: new Date(last7Days[0]),
                    $lte: new Date(last7Days[6] + 'T23:59:59.999Z')
                }
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // Fill in missing days
    return last7Days.map(day => {
        const found = leadTrend.find(t => t._id === day);
        return {
            date: day,
            count: found ? found.count : 0
        };
    });
};

// Opportunity Statistics
const getOpportunityStatistics = async (dateFilter, userId) => {
    const oppFilter = { ...dateFilter };
    if (userId) oppFilter.owner = userId;

    const [
        buyOpps,
        sellOpps,
        financeOpps,
        insuranceOpps,
        rtoOpps
    ] = await Promise.all([
        BuyOpportunity.aggregate([
            { $match: oppFilter },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                    totalValue: { $sum: { $add: ["$minBudget", "$maxBudget"] } }
                }
            }
        ]),
        SellOpportunity.aggregate([
            { $match: oppFilter },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                    totalValue: { $sum: "$expectedSellingPrice" }
                }
            }
        ]),
        FinanceOpportunity.aggregate([
            { $match: oppFilter },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                    totalValue: { $sum: "$loanAmount" }
                }
            }
        ]),
        InsuranceOpportunity.find(oppFilter).countDocuments(),
        RtoOpportunity.find(oppFilter).countDocuments()
    ]);

    const totalOpportunities = buyOpps.reduce((sum, opp) => sum + opp.count, 0) +
                              sellOpps.reduce((sum, opp) => sum + opp.count, 0) +
                              financeOpps.reduce((sum, opp) => sum + opp.count, 0) +
                              insuranceOpps + rtoOpps;

    const wonOpportunities = buyOpps.find(opp => opp._id === 'Won')?.count || 0 +
                            sellOpps.find(opp => opp._id === 'Won')?.count || 0 +
                            financeOpps.find(opp => opp._id === 'Won')?.count || 0;

    const totalValue = (buyOpps.find(opp => opp._id === 'Won')?.totalValue || 0) +
                      (sellOpps.find(opp => opp._id === 'Won')?.totalValue || 0) +
                      (financeOpps.find(opp => opp._id === 'Won')?.totalValue || 0);

    return {
        total: totalOpportunities,
        won: wonOpportunities,
        totalValue,
        byType: {
            buy: buyOpps.reduce((sum, opp) => sum + opp.count, 0),
            sell: sellOpps.reduce((sum, opp) => sum + opp.count, 0),
            finance: financeOpps.reduce((sum, opp) => sum + opp.count, 0),
            insurance: insuranceOpps,
            rto: rtoOpps
        }
    };
};

// User Performance
const getUserPerformance = async (dateFilter) => {
    const users = await User.find({ status: 'Active' }).select('username email role');
    
    const userPerformance = await Promise.all(
        users.map(async (user) => {
            const [
                leadsAssigned,
                leadsConverted,
                tasksCompleted,
                opportunitiesWon
            ] = await Promise.all([
                Lead.countDocuments({ ...dateFilter, assignedTo: user._id }),
                Lead.countDocuments({ ...dateFilter, assignedTo: user._id, status: 'Converted' }),
                Task.countDocuments({ ...dateFilter, owner: user._id, status: 'Completed' }),
                BuyOpportunity.countDocuments({ ...dateFilter, owner: user._id, status: 'Won' })
            ]);

            const conversionRate = leadsAssigned > 0 ? Math.round((leadsConverted / leadsAssigned) * 100) : 0;

            return {
                userId: user._id,
                name: user.username,
                email: user.email,
                role: user.role,
                leadsAssigned,
                leadsConverted,
                conversionRate,
                tasksCompleted,
                opportunitiesWon,
                performanceScore: Math.round((conversionRate + tasksCompleted + opportunitiesWon) / 3)
            };
        })
    );

    return userPerformance.sort((a, b) => b.performanceScore - a.performanceScore);
};

// Task Statistics
const getTaskStatistics = async (dateFilter, userId) => {
    const taskFilter = { ...dateFilter };
    if (userId) taskFilter.owner = userId;

    const [
        totalTasks,
        tasksByStatus,
        tasksByPriority,
        completedTasks,
        overdueTasks
    ] = await Promise.all([
        Task.countDocuments(taskFilter),
        Task.aggregate([
            { $match: taskFilter },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]),
        Task.aggregate([
            { $match: taskFilter },
            {
                $group: {
                    _id: "$priority",
                    count: { $sum: 1 }
                }
            }
        ]),
        Task.countDocuments({ ...taskFilter, status: 'Completed' }),
        Task.aggregate([
            {
                $match: {
                    ...taskFilter,
                    status: { $ne: 'Completed' },
                    endDate: { $lt: new Date().toISOString().split('T')[0] }
                }
            },
            { $count: "count" }
        ])
    ]);

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
        total: totalTasks,
        completed: completedTasks,
        overdue: overdueTasks[0]?.count || 0,
        completionRate,
        byStatus: tasksByStatus.reduce((acc, status) => {
            acc[status._id] = status.count;
            return acc;
        }, {}),
        byPriority: tasksByPriority.reduce((acc, priority) => {
            acc[priority._id] = priority.count;
            return acc;
        }, {})
    };
};

// Delivery Statistics
const getDeliveryStatistics = async (dateFilter, userId) => {
    const deliveryFilter = { ...dateFilter };
    if (userId) deliveryFilter.soldBy = userId;

    const [
        totalDeliveries,
        deliveriesByStatus,
        rtoTransferred,
        overdueDeliveries,
        deliveryTrend
    ] = await Promise.all([
        DeliveryForm.countDocuments(deliveryFilter),
        DeliveryForm.aggregate([
            { $match: deliveryFilter },
            {
                $group: {
                    _id: "$deliveryStatus",
                    count: { $sum: 1 }
                }
            }
        ]),
        DeliveryForm.countDocuments({ ...deliveryFilter, rtoTransferred: 'Yes' }),
        DeliveryForm.countDocuments({
            ...deliveryFilter,
            deliveryStatus: 'Not Delivered',
            expectedCompletionDate: { $lt: new Date() }
        }),
        getDeliveryTrendData(deliveryFilter)
    ]);

    const deliveredCount = deliveriesByStatus.find(d => d._id === 'Delivered')?.count || 0;
    const deliveryRate = totalDeliveries > 0 ? Math.round((deliveredCount / totalDeliveries) * 100) : 0;

    return {
        total: totalDeliveries,
        delivered: deliveredCount,
        pending: deliveriesByStatus.find(d => d._id === 'Not Delivered')?.count || 0,
        rtoTransferred,
        overdue: overdueDeliveries,
        deliveryRate,
        trend: deliveryTrend
    };
};

// Delivery Trend Data
const getDeliveryTrendData = async (filter) => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push(date.toISOString().split('T')[0]);
    }

    const deliveryTrend = await DeliveryForm.aggregate([
        {
            $match: {
                ...filter,
                createdAt: {
                    $gte: new Date(last7Days[0]),
                    $lte: new Date(last7Days[6] + 'T23:59:59.999Z')
                }
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    return last7Days.map(day => {
        const found = deliveryTrend.find(t => t._id === day);
        return {
            date: day,
            count: found ? found.count : 0
        };
    });
};

// Recent Activities
const getRecentActivities = async () => {
    const activities = await Activity.find()
        .populate('user', 'username email')
        .sort({ createdAt: -1 })
        .limit(10);

    return activities.map(activity => ({
        id: activity._id,
        user: activity.user?.username || 'System',
        type: activity.type,
        content: activity.content,
        timestamp: activity.createdAt,
        metadata: activity.metadata
    }));
};

// Get quick stats for dashboard cards
export const getQuickStats = async (req, res) => {
    try {
        const { userId } = req.query;

        const filter = userId ? { assignedTo: userId } : {};

        const [
            totalLeads,
          newLeads,
          totalOpportunities,
          pendingTasks,
          completedDeliveries
        ] = await Promise.all([
            Lead.countDocuments(filter),
            Lead.countDocuments({ ...filter, status: 'New Lead' }),
            BuyOpportunity.countDocuments(userId ? { owner: userId } : {}),
            Task.countDocuments({ ...filter, status: 'Pending' }),
            DeliveryForm.countDocuments({ ...filter, deliveryStatus: 'Delivered' })
        ]);

        res.status(200).json({
            status: "success",
            message: "Quick stats fetched successfully",
            data: {
                totalLeads,
                newLeads,
                totalOpportunities,
                pendingTasks,
                completedDeliveries
            }
        });

    } catch (error) {
        console.error("Error fetching quick stats:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to fetch quick stats",
            error: error.message
        });
    }
};