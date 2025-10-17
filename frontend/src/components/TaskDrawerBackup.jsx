import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Clock, ChevronDown, Check, Search } from 'lucide-react';
import axios from 'axios';

const TaskDrawer = ({ onClose, lead }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState({
    taskType: 'Call Back',
    owner: '',
    associatedLead: lead ? `${lead.name} ${lead.lastName}` : '',
    associatedOpportunity: '',
    subject: lead ? `Call Back : ${lead.name}` : 'Call Back',
    startDate: new Date().toISOString().split('T')[0],
    startTime: '07:00',
    endDate: new Date().toISOString().split('T')[0],
    endTime: '07:30',
    timezone: 'IST',
    makeRecurring: false,
    reminder: false,
    description: '',
    organizer: ''
  });

  const [dropdownOpen, setDropdownOpen] = useState({
    taskType: false,
    owner: false,
    associatedLead: false,
    associatedOpportunity: false,
    organizer: false
  });

  const [searchTerm, setSearchTerm] = useState({
    owner: '',
    associatedLead: '',
    associatedOpportunity: '',
    organizer: ''
  });

  const dropdownRefs = {
    taskType: useRef(null),
    owner: useRef(null),
    associatedLead: useRef(null),
    associatedOpportunity: useRef(null),
    organizer: useRef(null)
  };

  const taskTypes = ['Call Back', 'Follow-Up', 'Inspection', 'Negotiation', 'Pitch-Sell opportunity', 'Other'];
  const opportunities = ['Opportunity 1', 'Opportunity 2', 'Opportunity 3'];

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:3000/api/users/all');
        if (response.data && response.data.data) {
          setUsers(response.data.data);
          
          // Set default owner and organizer to the first user if available
          if (response.data.data.length > 0) {
            const defaultUser = `${response.data.data[0].username}`;
            setTask(prev => ({
              ...prev,
              owner: defaultUser,
              organizer: defaultUser
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      let shouldCloseAll = true;
      
      // Check if click was inside any dropdown
      Object.keys(dropdownRefs).forEach(key => {
        if (dropdownRefs[key].current && dropdownRefs[key].current.contains(event.target)) {
          shouldCloseAll = false;
        }
      });

      if (shouldCloseAll) {
        setDropdownOpen({
          taskType: false,
          owner: false,
          associatedLead: false,
          associatedOpportunity: false,
          organizer: false
        });
        
        // Clear search terms when closing dropdowns
        setSearchTerm({
          owner: '',
          associatedLead: '',
          associatedOpportunity: '',
          organizer: ''
        });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTask(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSearchChange = (field, value) => {
    setSearchTerm(prev => ({ ...prev, [field]: value }));
  };

  const toggleDropdown = (field) => {
    // Close all other dropdowns when opening a new one
    const newState = {
      taskType: false,
      owner: false,
      associatedLead: false,
      associatedOpportunity: false,
      organizer: false,
      [field]: !dropdownOpen[field]
    };
    
    setDropdownOpen(newState);
    
    // Clear search term when opening dropdown
    if (!dropdownOpen[field]) {
      setSearchTerm(prev => ({ ...prev, [field]: '' }));
    }
  };

  const selectOption = (field, value) => {
    setTask(prev => ({ ...prev, [field]: value }));
    setDropdownOpen(prev => ({ ...prev, [field]: false }));
    setSearchTerm(prev => ({ ...prev, [field]: '' })); // Clear search term after selection
  };

  const handleSubmit = () => {
    console.log('Adding task:', task);
    // Add API call here
    onClose();
  };

  // Filter users based on search term
  const filteredUsers = (field) => {
    const search = searchTerm[field] || '';
    return users.filter(user => 
      user.username.toLowerCase().includes(search.toLowerCase())
    );
  };

  // Filter opportunities based on search term
  const filteredOpportunities = () => {
    const search = searchTerm.associatedOpportunity || '';
    return opportunities.filter(opp => 
      opp.toLowerCase().includes(search.toLowerCase())
    );
  };

  if (loading) {
    return (
      <div className="p-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Add Task</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Add Task</h2>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="space-y-4 flex-1 overflow-y-auto">
        {/* Task Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Task Type</label>
          <div className="relative" ref={dropdownRefs.taskType}>
            <button
              type="button"
              onClick={() => toggleDropdown('taskType')}
              className="w-full p-2 border border-gray-300 rounded-md flex justify-between items-center"
            >
              <span>{task.taskType}</span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
            {dropdownOpen.taskType && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {taskTypes.map((type) => (
                  <div
                    key={type}
                    onClick={() => selectOption('taskType', type)}
                    className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                  >
                    <span>{type}</span>
                    {task.taskType === type && <Check className="h-4 w-4 text-blue-500" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Owner */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Owner*</label>
          <div className="relative" ref={dropdownRefs.owner}>
            <button
              type="button"
              onClick={() => toggleDropdown('owner')}
              className="w-full p-2 border border-gray-300 rounded-md flex justify-between items-center"
            >
              <span>{task.owner}</span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
            {dropdownOpen.owner && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                <div className="p-2 border-b">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search users..."
                      className="w-full pl-8 p-1.5 border border-gray-300 rounded text-sm"
                      value={searchTerm.owner}
                      onChange={(e) => handleSearchChange('owner', e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>
                {filteredUsers('owner').length > 0 ? (
                  filteredUsers('owner').map((user) => (
                    <div
                      key={user._id}
                      onClick={() => selectOption('owner', user.username)}
                      className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                    >
                      <span>{user.username}</span>
                      {task.owner === user.username && <Check className="h-4 w-4 text-blue-500" />}
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-gray-500 text-center">No users found</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Associated Lead */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Associated Lead</label>
          <div className="relative" ref={dropdownRefs.associatedLead}>
            <button
              type="button"
              onClick={() => toggleDropdown('associatedLead')}
              className="w-full p-2 border border-gray-300 rounded-md flex justify-between items-center"
            >
              <span>{task.associatedLead || 'Select lead'}</span>
              <div className="flex items-center">
                {task.associatedLead && <Check className="h-4 w-4 text-green-500 mr-1" />}
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </button>
            {dropdownOpen.associatedLead && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                <div className="p-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Type to Search"
                      className="w-full pl-8 p-1.5 border border-gray-300 rounded text-sm"
                      value={searchTerm.associatedLead}
                      onChange={(e) => handleSearchChange('associatedLead', e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>
                <div
                  onClick={() => selectOption('associatedLead', lead ? `${lead.name} ${lead.lastName}` : '')}
                  className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                >
                  <span>{lead ? `${lead.name} ${lead.lastName}` : 'Current Lead'}</span>
                  {task.associatedLead === (lead ? `${lead.name} ${lead.lastName}` : '') && 
                    <Check className="h-4 w-4 text-blue-500" />}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Associated Opportunity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Associated Opportunity</label>
          <div className="relative" ref={dropdownRefs.associatedOpportunity}>
            <button
              type="button"
              onClick={() => toggleDropdown('associatedOpportunity')}
              className="w-full p-2 border border-gray-300 rounded-md flex justify-between items-center"
            >
              <span>{task.associatedOpportunity || 'Type to Search'}</span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
            {dropdownOpen.associatedOpportunity && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                <div className="p-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Type to Search"
                      className="w-full pl-8 p-1.5 border border-gray-300 rounded text-sm"
                      value={searchTerm.associatedOpportunity}
                      onChange={(e) => handleSearchChange('associatedOpportunity', e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>
                {filteredOpportunities().length > 0 ? (
                  filteredOpportunities().map((opp) => (
                    <div
                      key={opp}
                      onClick={() => selectOption('associatedOpportunity', opp)}
                      className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                    >
                      <span>{opp}</span>
                      {task.associatedOpportunity === opp && <Check className="h-4 w-4 text-blue-500" />}
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-gray-500 text-center">No opportunities found</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject*</label>
          <input 
            type="text" 
            name="subject"
            value={task.subject}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Schedule */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Schedule*</label>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input 
                type="date" 
                name="startDate"
                value={task.startDate}
                onChange={handleChange}
                className="w-full pl-9 p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="relative">
              <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input 
                type="time" 
                name="startTime"
                value={task.startTime}
                onChange={handleChange}
                className="w-full pl-9 p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <div className="text-center text-sm text-gray-500 mb-2">to</div>
          
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input 
                type="date" 
                name="endDate"
                value={task.endDate}
                onChange={handleChange}
                className="w-full pl-9 p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="relative">
              <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input 
                type="time" 
                name="endTime"
                value={task.endTime}
                onChange={handleChange}
                className="w-full pl-9 p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <div className="text-sm text-gray-500 mb-2">{task.timezone}</div>
          
          <div className="flex items-center mb-4">
            <input 
              type="checkbox" 
              id="makeRecurring"
              name="makeRecurring"
              checked={task.makeRecurring}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <label htmlFor="makeRecurring" className="ml-2 text-sm text-gray-700">
              Make Recurring
            </label>
          </div>
        </div>

        {/* Reminder */}
        <div className="flex items-center">
          <input 
            type="checkbox" 
            id="reminder"
            name="reminder"
            checked={task.reminder}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 rounded"
          />
          <label htmlFor="reminder" className="ml-2 text-sm text-gray-700">
            Reminder
          </label>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea 
            name="description"
            value={task.description}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows="4"
            placeholder="Enter task description"
          ></textarea>
        </div>

        {/* Organizer */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Organizer*</label>
          <div className="relative" ref={dropdownRefs.organizer}>
            <button
              type="button"
              onClick={() => toggleDropdown('organizer')}
              className="w-full p-2 border border-gray-300 rounded-md flex justify-between items-center"
            >
              <span>{task.organizer}</span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
            {dropdownOpen.organizer && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                <div className="p-2 border-b">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search users..."
                      className="w-full pl-8 p-1.5 border border-gray-300 rounded text-sm"
                      value={searchTerm.organizer}
                      onChange={(e) => handleSearchChange('organizer', e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>
                {filteredUsers('organizer').length > 0 ? (
                  filteredUsers('organizer').map((user) => (
                    <div
                      key={user._id}
                      onClick={() => selectOption('organizer', user.username)}
                      className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                    >
                      <span>{user.username}</span>
                      {task.organizer === user.username && <Check className="h-4 w-4 text-blue-500" />}
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-gray-500 text-center">No users found</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-auto pt-6 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Task
        </button>
      </div>
    </div>
  );
};

export default TaskDrawer;