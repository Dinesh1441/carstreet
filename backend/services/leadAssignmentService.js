// services/leadAssignmentService.js
import User from '../models/userModel.js';

class LeadAssignmentService {
  constructor() {
    this.currentIndex = -1;
    this.availableUsers = [];
  }

  // Get all active sales executives and refresh the list
  async refreshActiveSalesExecutives() {
    try {
      this.availableUsers = await User.find({
        role: 'Sales Executive',
        status: 'Active'
      }).sort({ username: 1 }); // Sort consistently

      console.log(`Refreshed available sales executives: ${this.availableUsers.length} users`);
      return this.availableUsers;
    } catch (error) {
      console.error('Error refreshing active sales executives:', error);
      throw error;
    }
  }

  // True round-robin assignment
  async assignLeadRoundRobin() {
    try {
      // Refresh the list to ensure we have current active users
      await this.refreshActiveSalesExecutives();

      if (this.availableUsers.length === 0) {
        throw new Error('No active sales executives available for lead assignment');
      }

      // If no assignment has been made yet or we've reached the end, start from beginning
      if (this.currentIndex === -1 || this.currentIndex >= this.availableUsers.length - 1) {
        this.currentIndex = 0;
      } else {
        // Move to next user
        this.currentIndex++;
      }

      const assignedUser = this.availableUsers[this.currentIndex];
      
      console.log(`Assigned lead to: ${assignedUser.username} (Index: ${this.currentIndex})`);

      // Update user's assignment tracking
      await User.findByIdAndUpdate(assignedUser._id, {
        lastAssignedAt: new Date(),
        $inc: { assignedLeadCount: 1 }
      });

      return assignedUser._id;
    } catch (error) {
      console.error('Error in round-robin lead assignment:', error);
      throw error;
    }
  }

  // Force reset the round-robin counter
  resetRoundRobin() {
    this.currentIndex = -1;
    this.availableUsers = [];
    console.log('Round-robin counter reset');
  }

  // Get current assignment state
  getAssignmentState() {
    return {
      currentIndex: this.currentIndex,
      availableUsers: this.availableUsers.map(user => ({
        id: user._id,
        username: user.username,
        email: user.email
      })),
      totalUsers: this.availableUsers.length
    };
  }

  // Handle user status changes (if a user becomes inactive, adjust the round-robin)
  async handleUserStatusChange() {
    console.log('User status changed, refreshing assignment list...');
    await this.refreshActiveSalesExecutives();
    
    // If current index is beyond new array length, reset to last position
    if (this.currentIndex >= this.availableUsers.length) {
      this.currentIndex = this.availableUsers.length - 1;
    }
  }

  // Get assignment statistics with position info
  async getAssignmentStats() {
    try {
      const stats = await User.aggregate([
        {
          $match: {
            role: 'Sales Executive',
            status: 'Active'
          }
        },
        {
          $project: {
            username: 1,
            email: 1,
            assignedLeadCount: 1,
            lastAssignedAt: 1,
            status: 1,
            createdAt: 1
          }
        },
        {
          $sort: { username: 1 } // Consistent sorting
        }
      ]);

      // Add round-robin position information
      const enhancedStats = stats.map((user, index) => ({
        ...user,
        roundRobinPosition: index,
        isNextInQueue: index === (this.currentIndex + 1) % stats.length
      }));

      return enhancedStats;
    } catch (error) {
      console.error('Error fetching assignment stats:', error);
      throw error;
    }
  }

  // Manually set the next user for assignment (admin function)
  setNextUser(userId) {
    const userIndex = this.availableUsers.findIndex(user => user._id.toString() === userId);
    if (userIndex !== -1) {
      this.currentIndex = userIndex - 1; // Next assignment will go to this user
      console.log(`Manually set next user to: ${this.availableUsers[userIndex].username}`);
      return true;
    }
    return false;
  }
}

// Create a singleton instance
const leadAssignmentService = new LeadAssignmentService();
export default leadAssignmentService;