// controllers/adminController.js
import leadAssignmentService from '../services/leadAssignmentService.js';
import User from '../models/userModel.js';

export const getAssignmentStats = async (req, res) => {
  try {
    const stats = await leadAssignmentService.getAssignmentStats();
    const currentState = leadAssignmentService.getAssignmentState();
    
    res.status(200).json({
      status: "success",
      data: {
        users: stats,
        roundRobinState: currentState,
        nextAssignment: currentState.availableUsers[(currentState.currentIndex + 1) % currentState.availableUsers.length]
      }
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

export const resetAssignmentCounts = async (req, res) => {
  try {
    // Reset database counts
    await User.updateMany(
      { role: 'Sales Executive' },
      { 
        assignedLeadCount: 0,
        lastAssignedAt: null
      }
    );
    
    // Reset round-robin service
    leadAssignmentService.resetRoundRobin();
    
    res.status(200).json({
      status: "success",
      message: 'Assignment counts and round-robin counter reset successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

export const getActiveSalesExecutives = async (req, res) => {
  try {
    const salesExecutives = await User.find({
      role: 'Sales Executive',
      status: 'Active'
    }).select('username email assignedLeadCount lastAssignedAt status createdAt')
    .sort('username');

    const currentState = leadAssignmentService.getAssignmentState();

    // Add round-robin position info
    const enhancedExecutives = salesExecutives.map((exec, index) => ({
      ...exec.toObject(),
      roundRobinPosition: index,
      isCurrent: index === currentState.currentIndex,
      isNext: index === (currentState.currentIndex + 1) % salesExecutives.length
    }));

    res.status(200).json({
      status: "success",
      data: enhancedExecutives,
      roundRobin: {
        currentIndex: currentState.currentIndex,
        totalUsers: currentState.availableUsers.length,
        nextUser: currentState.availableUsers[(currentState.currentIndex + 1) % currentState.availableUsers.length]
      }
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

export const forceRefreshAssignment = async (req, res) => {
  try {
    await leadAssignmentService.refreshActiveSalesExecutives();
    const state = leadAssignmentService.getAssignmentState();
    
    res.status(200).json({
      status: "success",
      message: 'Assignment list refreshed successfully',
      data: state
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

export const setNextUser = async (req, res) => {
  try {
    const { userId } = req.body;
    
    const success = leadAssignmentService.setNextUser(userId);
    
    if (success) {
      const state = leadAssignmentService.getAssignmentState();
      res.status(200).json({
        status: "success",
        message: 'Next user set successfully',
        data: state
      });
    } else {
      res.status(400).json({
        status: "error",
        message: 'User not found in active sales executives list'
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};