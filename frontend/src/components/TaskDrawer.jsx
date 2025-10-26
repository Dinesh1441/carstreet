import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Clock, ChevronDown, Check, Search, Bell } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

const TaskDrawer = ({ onClose, lead, onTaskAdded }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user, token } = useAuth();
  
  const [task, setTask] = useState({
    taskType: 'Call Back',
    owner: '',
    subject: lead ? `Call Back : ${lead.name}` : 'Call Back',
    startDate: new Date().toISOString().split('T')[0],
    startTime: '07:00',
    endDate: new Date().toISOString().split('T')[0],
    endTime: '07:30',
    reminder: false,
    reminderTime: '15', // minutes before
    description: '',
    organizer: '',
    priority: 'Medium'
  });

  const [dropdownOpen, setDropdownOpen] = useState({
    taskType: false,
    owner: false,
    organizer: false,
    reminder: false
  });

  const [searchTerm, setSearchTerm] = useState({
    owner: '',
    organizer: ''
  });

  const dropdownRefs = {
    taskType: useRef(null),
    owner: useRef(null),
    organizer: useRef(null),
    reminder: useRef(null)
  };

  const backend_url = import.meta.env.VITE_BACKEND_URL;

  // Updated task types based on requirements
  const appointmentTypes = ['Call Back', 'Follow-Up', 'Inspection', 'Negotiation', 'Pitch-Sell opportunity', 'Test Drive', 'Vehicle Pick-Up'];
  const todoTypes = ['Finance', 'Insurance', 'RTO'];
  const taskTypes = [...appointmentTypes, ...todoTypes];

  // Reminder options
  const reminderOptions = [
    { value: '5', label: '5 minutes before' },
    { value: '10', label: '10 minutes before' },
    { value: '15', label: '15 minutes before' },
    { value: '30', label: '30 minutes before' },
    { value: '60', label: '1 hour before' },
    { value: '1440', label: '1 day before' }
  ];

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${backend_url}/api/users/all` , { headers: { 'Authorization': `Bearer ${token}` } });
        if (response.data && response.data.status === 'success') {
          setUsers(response.data.data || []);
          
          // Set default owner and organizer to the first user if available
          if (response.data.data.length > 0) {
            const defaultUser = response.data.data[0]._id;
            setTask(prev => ({
              ...prev,
              owner: defaultUser,
              organizer: defaultUser
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [backend_url]);

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
          organizer: false,
          reminder: false
        });
        
        // Clear search terms when closing dropdowns
        setSearchTerm({
          owner: '',
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

    // Update subject when task type changes
    if (name === 'taskType') {
      const subjectPrefix = value === 'Call Back' ? 'Call Back : ' : 
                           value === 'Follow-Up' ? 'Follow-Up : ' :
                           value === 'Inspection' ? 'Inspection : ' :
                           value === 'Negotiation' ? 'Negotiation : ' :
                           value === 'Pitch-Sell opportunity' ? 'Pitch-Sell opportunity : ' :
                           value === 'Test Drive' ? 'Test Drive : ' :
                           value === 'Vehicle Pick-Up' ? 'Vehicle Pick-Up : ' :
                           value === 'Finance' ? 'Finance : ' :
                           value === 'Insurance' ? 'Insurance : ' :
                           value === 'RTO' ? 'RTO : ' : '';
      
      setTask(prev => ({
        ...prev,
        subject: lead ? `${subjectPrefix}${lead.name}` : subjectPrefix
      }));
    }

    // If reminder is unchecked, reset reminder time
    if (name === 'reminder' && !checked) {
      setTask(prev => ({
        ...prev,
        reminderTime: '15'
      }));
    }
  };

  const handleSearchChange = (field, value) => {
    setSearchTerm(prev => ({ ...prev, [field]: value }));
  };

  const toggleDropdown = (field) => {
    // Close all other dropdowns when opening a new one
    const newState = {
      taskType: false,
      owner: false,
      organizer: false,
      reminder: false,
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

    // Update subject when task type is selected
    if (field === 'taskType') {
      const subjectPrefix = value === 'Call Back' ? 'Call Back : ' : 
                           value === 'Follow-Up' ? 'Follow-Up : ' :
                           value === 'Inspection' ? 'Inspection : ' :
                           value === 'Negotiation' ? 'Negotiation : ' :
                           value === 'Pitch-Sell opportunity' ? 'Pitch-Sell opportunity : ' :
                           value === 'Test Drive' ? 'Test Drive : ' :
                           value === 'Vehicle Pick-Up' ? 'Vehicle Pick-Up : ' :
                           value === 'Finance' ? 'Finance : ' :
                           value === 'Insurance' ? 'Insurance : ' :
                           value === 'RTO' ? 'RTO : ' : '';
      
      setTask(prev => ({
        ...prev,
        subject: lead ? `${subjectPrefix}${lead.name}` : subjectPrefix
      }));
    }
  };

  const selectReminder = (value) => {
    setTask(prev => ({ 
      ...prev, 
      reminderTime: value,
      reminder: true 
    }));
    setDropdownOpen(prev => ({ ...prev, reminder: false }));
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!task.owner || !task.organizer || !task.subject || !task.startDate || !task.startTime || !task.endDate || !task.endTime) {
      toast.error('Please fill all required fields');
      return;
    }

    // Validate date consistency
    const startDateTime = new Date(`${task.startDate}T${task.startTime}`);
    const endDateTime = new Date(`${task.endDate}T${task.endTime}`);
    
    if (endDateTime <= startDateTime) {
      toast.error('End date/time must be after start date/time');
      return;
    }

    try {
      setSubmitting(true);

      // Prepare task data for API
      const taskData = {
        taskType: task.taskType,
        subject: task.subject,
        description: task.description,
        owner: task.owner,
        organizer: task.organizer,
        startDate: task.startDate,
        startTime: task.startTime,
        endDate: task.endDate,
        endTime: task.endTime,
        reminder: task.reminder,
        reminderTime: task.reminderTime,
        priority: task.priority,
        associatedLead: lead?._id || null,
        createdBy: user?._id || task.organizer
      };

      console.log('Sending task data:', taskData);

      // Make API call
      const response = await axios.post(`${backend_url}/api/task/add`, taskData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.status === 'success') {
        toast.success('Task created successfully!');
        
        // Call the callback if provided
        if (onTaskAdded) {
          onTaskAdded(response.data.data);
        }
        
        onClose();
      } else {
        toast.error(response.data.message || 'Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || 'Failed to create task';
        
        // Handle validation errors
        if (error.response.data?.errors) {
          error.response.data.errors.forEach(err => {
            toast.error(err);
          });
        } else {
          toast.error(errorMessage);
        }
      } else if (error.request) {
        // Request was made but no response received
        toast.error('Network error: Unable to connect to server');
      } else {
        // Something else happened
        toast.error('An unexpected error occurred');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Filter users based on search term
  const filteredUsers = (field) => {
    const search = searchTerm[field] || '';
    return users.filter(user => 
      user.username.toLowerCase().includes(search.toLowerCase())
    );
  };

  // Get display name for selected user
  const getUserDisplayName = (userId) => {
    const user = users.find(u => u._id === userId);
    return user ? user.username : 'Select user';
  };

  // Get selected reminder label
  const getReminderLabel = () => {
    const option = reminderOptions.find(opt => opt.value === task.reminderTime);
    return option ? option.label : '15 minutes before';
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
          disabled={submitting}
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="space-y-4 flex-1 overflow-y-auto">
        {/* Task Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Task Type *</label>
          <div className="relative" ref={dropdownRefs.taskType}>
            <button
              type="button"
              onClick={() => toggleDropdown('taskType')}
              className="w-full p-2 border border-gray-300 rounded-md flex justify-between items-center"
              disabled={submitting}
            >
              <span>{task.taskType}</span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
            {dropdownOpen.taskType && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {/* Appointment Types */}
                <div className="p-2 text-xs font-semibold text-gray-500 uppercase border-b">APPOINTMENT</div>
                {appointmentTypes.map((type) => (
                  <div
                    key={type}
                    onClick={() => selectOption('taskType', type)}
                    className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                  >
                    <span>{type}</span>
                    {task.taskType === type && <Check className="h-4 w-4 text-blue-500" />}
                  </div>
                ))}
                
                {/* TODO Types */}
                <div className="p-2 text-xs font-semibold text-gray-500 uppercase border-b border-t">TODO</div>
                {todoTypes.map((type) => (
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Owner *</label>
          <div className="relative" ref={dropdownRefs.owner}>
            <button
              type="button"
              onClick={() => toggleDropdown('owner')}
              className="w-full p-2 border border-gray-300 rounded-md flex justify-between items-center"
              disabled={submitting}
            >
              <span>{getUserDisplayName(task.owner)}</span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
            {dropdownOpen.owner && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                <div className="p-2 border-b">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Type to Search"
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
                      onClick={() => selectOption('owner', user._id)}
                      className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                    >
                      <span>{user.username}</span>
                      {task.owner === user._id && <Check className="h-4 w-4 text-blue-500" />}
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-gray-500 text-center">No users found</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
          <input 
            type="text" 
            name="subject"
            value={task.subject}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Enter subject"
            disabled={submitting}
          />
        </div>

        {/* Schedule */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Schedule *</label>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input 
                type="date" 
                name="startDate"
                value={task.startDate}
                onChange={handleChange}
                className="w-full pl-9 p-2 border border-gray-300 rounded-md"
                disabled={submitting}
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
                disabled={submitting}
              />
            </div>
          </div>
          
          <div className="text-center text-sm text-gray-500 mb-2">to</div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input 
                type="date" 
                name="endDate"
                value={task.endDate}
                onChange={handleChange}
                className="w-full pl-9 p-2 border border-gray-300 rounded-md"
                disabled={submitting}
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
                disabled={submitting}
              />
            </div>
          </div>
        </div>

        {/* Reminder */}
        <div className='hidden'>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reminder</label>
          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="reminder"
              name="reminder"
              checked={task.reminder}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 rounded"
              disabled={submitting}
            />
            <div className="relative flex-1" ref={dropdownRefs.reminder}>
              <button
                type="button"
                onClick={() => task.reminder && toggleDropdown('reminder')}
                disabled={!task.reminder || submitting}
                className={`w-full p-2 border border-gray-300 rounded-md flex justify-between items-center ${
                  !task.reminder ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''
                }`}
              >
                <span>{task.reminder ? getReminderLabel() : 'Set reminder'}</span>
                <Bell className="h-4 w-4 text-gray-400" />
              </button>
              {dropdownOpen.reminder && task.reminder && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                  {reminderOptions.map((option) => (
                    <div
                      key={option.value}
                      onClick={() => selectReminder(option.value)}
                      className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                    >
                      <span>{option.label}</span>
                      {task.reminderTime === option.value && <Check className="h-4 w-4 text-blue-500" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
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
            disabled={submitting}
          ></textarea>
        </div>

        {/* Organizer */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Organizer *</label>
          <div className="relative" ref={dropdownRefs.organizer}>
            <button
              type="button"
              onClick={() => toggleDropdown('organizer')}
              className="w-full p-2 border border-gray-300 rounded-md flex justify-between items-center"
              disabled={submitting}
            >
              <span>{getUserDisplayName(task.organizer)}</span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
            {dropdownOpen.organizer && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                <div className="p-2 border-b">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Type to Search"
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
                      onClick={() => selectOption('organizer', user._id)}
                      className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                    >
                      <span>{user.username}</span>
                      {task.organizer === user._id && <Check className="h-4 w-4 text-blue-500" />}
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
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          disabled={submitting}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              Adding...
            </>
          ) : (
            'Add Task'
          )}
        </button>
      </div>
    </div>
  );
};

export default TaskDrawer;