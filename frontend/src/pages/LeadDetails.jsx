import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, Mail, MapPin, User, FileText, Download, 
  ArrowLeft, Tag, Car, UserCheck, History, Edit,
  Briefcase, MoreVertical, Printer, Share2, X,
  ChevronDown, Calendar, MessageSquare, Clipboard, File,
  Plus, Activity as ActivityIcon, StickyNote, Target, CheckSquare, Truck,
  Paperclip, Image, FileUp, Bold, Italic, Underline, List, ListOrdered, Link
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import ActivityDrawer from '../components/ActivityDrawer';
import NoteDrawer from '../components/NoteDrawer';
import OpportunityDrawer from '../components/OpportunityDrawer';
import TaskDrawer from '../components/TaskDrawer';
import EmailDrawer from '../components/EmailDrawer';
import DeliveryFormDrawer from '../components/DeliveryFormDrawer';
import BuyOpportunity from '../components/BuyOpportunity';
import SaleOpportunity from '../components/SaleOpportunity';
import FinanceOpportunity from '../components/FinanceOpportunity';
import InsuranceOpportunity from '../components/InsuranceOpportunity';
import RtoOpportunity from '../components/RtoOpportunity';
import DocumentDrawer from '../components/DocumentDrawer';
import OpportunityDetails from '../components/OpportunityDetails';
import TaskDetails from '../components/TaskDetails';
import NoteDetails from '../components/NoteDetails';
import DocumentDetails from '../components/DocumentDetails';
import AddLead from '../components/AddLead';
import ActivityTimeline from '../components/ActivityTimeline';
// import FinanceOpportunity from '../components/FinanceOpportunity';
// import InsuranceOpportunity from '../components/InsuranceOpportunity';
// import RioOpportunity from '../components/RioOpportunity';
// import SaleOpportunity from '../components/SaleOpportunity';

const LeadDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('activity');
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerContent, setDrawerContent] = useState(null);
  const [noteContent, setNoteContent] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [selectedSubmenuItem, setSelectedSubmenuItem] = useState(null);
  const [showLeadDrawer, setShowLeadDrawer] = useState(false);
   const [drawerMode, setDrawerMode] = useState('edit'); // 'add' or 'edit'
  const quillRef = useRef(null);
  const fileInputRef = useRef(null);
  const submenuRefs = useRef({});
  const { user, token } = useAuth();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Initialize Quill editor
  useEffect(() => {
    if (drawerOpen && drawerContent === 'note' && quillRef.current && !quillRef.current.quill) {
      const quill = new Quill(quillRef.current, {
        theme: 'snow',
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link'],
            ['clean']
          ]
        },
        placeholder: 'Write your note here...',
      });
      
      quill.on('text-change', () => {
        setNoteContent(quill.root.innerHTML);
      });
      
      quillRef.current.quill = quill;
    }
  }, [drawerOpen, drawerContent]);

  // Close submenu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      let shouldCloseAll = true;
      
      // Check if click was inside any submenu
      Object.keys(submenuRefs.current).forEach(key => {
        if (submenuRefs.current[key] && submenuRefs.current[key].contains(event.target)) {
          shouldCloseAll = false;
        }
      });

      if (shouldCloseAll && openSubmenu) {
        setOpenSubmenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openSubmenu]);

  // Fetch lead data
  useEffect(() => {
    const fetchLead = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${backendUrl}/api/leads/get/${id}`
          , { headers: {
              'Authorization': `Bearer ${token}`
            }  }
        );
        
        if (response.data.status === "success") {
          setLead(response.data.data);
        } else {
          setError(response.data.message || 'Failed to fetch lead details');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch lead details');
        toast.error('Failed to fetch lead details');
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
  }, [id, backendUrl, showLeadDrawer]);

  const openDrawer = (contentType, submenuItem = null) => {
    setDrawerContent(contentType);
    setSelectedSubmenuItem(submenuItem);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setDrawerContent(null);
    setSelectedSubmenuItem(null);
    setNoteContent('');
    setAttachments([]);
    
    // Clean up Quill instance
    if (quillRef.current && quillRef.current.quill) {
      quillRef.current.quill = null;
      quillRef.current.innerHTML = '';
    }
  };

  const handleSubmenuClick = (actionId) => {
    if (openSubmenu === actionId) {
      setOpenSubmenu(null);
    } else {
      setOpenSubmenu(actionId);
    }
  };

  const handleSubmenuItemClick = (actionId, itemId, item) => {
    setOpenSubmenu(null);
    
    // Handle different submenu items - this is now flexible for any action type
    if (item.drawerContent) {
      // If the submenu item has a specific drawer content defined
      openDrawer(item.drawerContent, itemId);
    } else {
      // Default behavior - use the actionId as drawer content
      openDrawer(actionId, itemId);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      file,
      type: file.type.startsWith('image/') ? 'image' : 'document',
      name: file.name,
      size: file.size,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));
    
    setAttachments([...attachments, ...newAttachments]);
  };

  const removeAttachment = (index) => {
    const newAttachments = [...attachments];
    if (newAttachments[index].preview) {
      URL.revokeObjectURL(newAttachments[index].preview);
    }
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  const handleAddNote = async (noteContent, attachments) => {
    try {
      // Create FormData to handle file uploads
      const formData = new FormData();
     
      formData.append('leadId', id);
      formData.append('noteText', noteContent);

      formData.append('user', user._id);
      attachments.forEach((attachment, index) => {
        formData.append(`attachments`, attachment.file);
      });

      // Send the note to the backend
      const response = await axios.post(`${backendUrl}/api/notes/add`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.status === "success") {
        // Reset form and close drawer
        setNoteContent('');
        setAttachments([]);
        closeDrawer();
        toast.success('Note added successfully');
      }
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    }
  };

  // Quick action buttons with flexible submenu system
  const quickActions = [
    // { id: 'activity', label: 'Activity', icon: ActivityIcon, color: 'bg-blue-500' },
    { id: 'note', label: 'Note', icon: StickyNote, color: 'bg-green-500' },
    { 
      id: 'opportunity', 
      label: 'Opportunity', 
      icon: Target, 
      color: 'bg-purple-500',
      submenu: [
        { 
          id: 'buy', 
          label: 'Buy Opportunity', 
          icon: Briefcase, 
          drawerContent: 'buy-opportunity' 
        },
        { 
          id: 'finance', 
          label: 'Finance Opportunity', 
          icon: FileText, 
          drawerContent: 'finance-opportunity' 
        },
        { 
          id: 'insurance', 
          label: 'Insurance Opportunities', 
          icon: Clipboard, 
          drawerContent: 'insurance-opportunity' 
        },
        { 
          id: 'rto', 
          label: 'RTO Opportunities', 
          icon: Target, 
          drawerContent: 'rto-opportunity' 
        },
        { 
          id: 'sale', 
          label: 'Sell Opportunity', 
          icon: Tag, 
          drawerContent: 'sale-opportunity' 
        }
      ]
    },
    { id: 'task', label: 'Task', icon: CheckSquare, color: 'bg-yellow-500' },
     { id: 'document', label: 'Document', icon: Truck, color: 'bg-red-500' },
    // { 
    //   id: 'email', 
    //   label: 'Email', 
    //   icon: Mail, 
    //   color: 'bg-indigo-500',
    //   submenu: [
    //     { 
    //       id: 'promotional', 
    //       label: 'Promotional Email', 
    //       icon: Mail, 
    //       drawerContent: 'email' 
    //     },
    //     { 
    //       id: 'followup', 
    //       label: 'Follow-up Email', 
    //       icon: Mail, 
    //       drawerContent: 'email' 
    //     },
    //     { 
    //       id: 'thankyou', 
    //       label: 'Thank You Email', 
    //       icon: Mail, 
    //       drawerContent: 'email' 
    //     }
    //   ]
    // },
    { id: 'delivery', label: 'Delivery Form', icon: Truck, color: 'bg-red-500' },
   
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading lead details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-500 text-center">
            <p className="font-medium">Error loading lead</p>
            <p className="mt-2 text-sm">{error}</p>
            <button 
              onClick={() => navigate('/leads')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Leads
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Lead not found</p>
          <button 
            onClick={() => navigate('/leads')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Leads
          </button>
        </div>
      </div>
    );
  }

  const statusOptions = [
    { value: 'New Lead', label: 'New Lead', color: 'bg-blue-100 text-blue-800' },
    { value: 'Contacted', label: 'Contacted', color: 'bg-purple-100 text-purple-800' },
    { value: 'Qualified', label: 'Qualified', color: 'bg-green-100 text-green-800' },
    { value: 'Proposal Sent', label: 'Proposal Sent', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'Customer', label: 'Customer', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'Closed', label: 'Closed', color: 'bg-gray-100 text-gray-800' },
    { value: 'Busy/Not Reachable', label: 'Busy/Not Reachable', color: 'bg-red-100 text-red-800' },
  ];

  const currentStatus = statusOptions.find(opt => opt.value === lead.status) || 
                       { value: lead.status, label: lead.status, color: 'bg-gray-100 text-gray-800' };

  // Sample activity data
  const activities = [
    {
      date: "27 Nov 2024, 12:31 PM",
      events: [
        "Lead Stage-Changed from Interested to Busy/Not Reachable. Changed by: Inderpal Singh",
        "Lead Stage-Changed from Aunk Lead to Interested through Automation. Changed by: System"
      ]
    },
    {
      date: "26 Nov 2024",
      events: [
        "Buy Opportunities. Modified by System on 11/26/2024 01:19 PM",
        "Rahul. Added by Leads on 11/26/2024 01:19 PM"
      ]
    }
  ];

  // Render drawer content based on selected action
  const renderDrawerContent = () => {
    // If we have a specific submenu item selected, use its drawer content
    if (selectedSubmenuItem) {
      switch(selectedSubmenuItem) {
        case 'buy':
          return <BuyOpportunity onClose={closeDrawer} lead={lead} />;
        case 'finance':
          return <FinanceOpportunity onClose={closeDrawer} lead={lead} />;
        case 'insurance':
          return <InsuranceOpportunity onClose={closeDrawer} lead={lead} />;
        case 'rto':
          return <RtoOpportunity onClose={closeDrawer} lead={lead} />;
        case 'sale':
          return <SaleOpportunity onClose={closeDrawer} lead={lead} />;
        case 'document':
          return <DocumentDrawer onClose={closeDrawer} lead={lead} />;
        default:
          // Fallback to main drawer content
          break;
      }
    }

    // Main drawer content
    switch(drawerContent) {
      case 'activity':
        return <ActivityDrawer onClose={closeDrawer} lead={lead} />;
      case 'note':
        return <NoteDrawer onClose={closeDrawer} lead={lead} onAddNote={handleAddNote} />;
      case 'opportunity':
        return <OpportunityDrawer onClose={closeDrawer} lead={lead} />;
      case 'task':
        return <TaskDrawer onClose={closeDrawer} lead={lead} />;
      case 'email':
        return <EmailDrawer onClose={closeDrawer} lead={lead} />;
      case 'delivery':
        return <DeliveryFormDrawer onClose={closeDrawer} lead={lead} />;
      case 'document':
        return <DocumentDrawer onClose={closeDrawer} lead={lead}  />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white mt-4  md:mt-0 border-b border-gray-200 px-4 py-3 block lg:flex  justify-between items-center">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/leads')}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Lead Details</h1>
        </div>

        <div className="flex gap-3 mt-3 lg:mt-0 overflow-x-auto py-1 md:py-0 inset-shadow-md 41 to 50 of 53 activities ">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            
            if (action.submenu) {
              return (
                <div key={action.id} className=" w-full" ref={el => submenuRefs.current[action.id] = el}>
                  <button
                    onClick={() => handleSubmenuClick(action.id)}
                    className="flex gap-2 items-center justify-center px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors relative"
                  >
                    <div className={`h-4 w-4  rounded-full flex items-center justify-center `}>
                      <IconComponent className="h-5 w-5 " />
                    </div>
                    <span className="text-xs text-gray-700">{action.label}</span>
                    <ChevronDown className="h-3 w-3 text-gray-500" />
                  </button>
                  
                  {openSubmenu === action.id && (
                    <div className="absolute md:right-75 sm:right-0  mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                      {action.submenu.map((item) => {
                        const ItemIcon = item.icon;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleSubmenuItemClick(action.id, item.id, item)}
                            className="w-full flex items-center px-4 py-2 text-xs text-gray-700 hover:bg-gray-100"
                          >
                            <ItemIcon className="h-4 w-4 mr-2" />
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }
            
            return (

              <button
                key={action.id}
                onClick={() => openDrawer(action.id)}
                className="flex gap-2 min-w-fit items-center justify-center px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className={`h-4 w-4 rounded-full flex items-center justify-center `}>
                  <IconComponent className="h-5 w-5" />
                </div>
                <span className="text-xs text-gray-700">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className={`bg-white border-r border-gray-200 w-full md:w-80 lg:w-68 transition-all duration-300 ${sidebarOpen ? 'block' : 'hidden md:block'}`}>
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-4 mb-4">
              <div className="h-14 w-14 rounded-full uppercase bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                {lead.name?.charAt(0)}{lead.lastName?.charAt(0)}
              </div>
              
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {lead.name} {lead.lastName}
                </h2>
                <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${currentStatus.color}`}>
                  {currentStatus.label}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              {lead.phone && (
                <div className="flex items-center text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  <span className="text-sm">{lead.phone}</span>
                </div>
              )}
              
              {lead.email && (
                <div className="flex items-center text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  <span className="text-sm">{lead.email}</span>
                </div>
              )}
              
              {(lead.city || lead.country) && (
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="text-sm">{lead.cityName}{lead.country && `, ${lead.country}`}</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-3">LEAD INFORMATION</h3>
                       <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Lead Source</p>
                <p className="text-sm text-gray-800">{lead.leadSource || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Assigned To</p>
                <p className="text-sm text-gray-800">{lead.assignedTo?.name || 'Unassigned'}</p>
              </div>
              {lead.company && (
                <div>
                  <p className="text-xs text-gray-500">Company</p>
                  <p className="text-sm text-gray-800">{lead.company}</p>
                </div>
              )}
              {lead.jobTitle && (
                <div>
                  <p className="text-xs text-gray-500">Job Title</p>
                  <p className="text-sm text-gray-800">{lead.jobTitle}</p>
                </div>
              )}
            </div>
          </div>

          {(lead.carMake || lead.Model || lead.variant) && (
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-3">VEHICLE INFORMATION</h3>
              <div className="space-y-3">
                {lead.carMake && (
                  <div>
                    <p className="text-xs text-gray-500">Car Make</p>
                    <p className="text-sm text-gray-800">{lead.carMake}</p>
                  </div>
                )}
                {lead.Model && (
                  <div>
                    <p className="text-xs text-gray-500">Model</p>
                    <p className="text-sm text-gray-800">{lead.Model}</p>
                  </div>
                )}
                {lead.variant && (
                  <div>
                    <p className="text-xs text-gray-500">Variant</p>
                    <p className="text-sm text-gray-800">{lead.variant}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="p-4 hidden">
            <h3 className="text-sm font-medium text-gray-500 mb-3">QUICK ACTIONS</h3>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => {
                const IconComponent = action.icon;
                
                if (action.submenu) {
                  return (
                    <div key={action.id} className="relative" ref={el => submenuRefs.current[`sidebar-${action.id}`] = el}>
                      <button
                        onClick={() => handleSubmenuClick(`sidebar-${action.id}`)}
                        className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors w-full"
                      >
                        <div className={`h-10 w-10 rounded-full ${action.color} flex items-center justify-center text-white mb-1`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <span className="text-xs text-gray-700">{action.label}</span>
                      </button>
                      
                      {openSubmenu === `sidebar-${action.id}` && (
                        <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                          {action.submenu.map((item) => {
                            const ItemIcon = item.icon;
                            return (
                              <button
                                key={item.id}
                                onClick={() => handleSubmenuItemClick(action.id, item.id, item)}
                                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <ItemIcon className="h-4 w-4 mr-2" />
                                {item.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }
                
                return (
                  <button
                    key={action.id}
                    onClick={() => openDrawer(action.id)}
                    className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className={`h-10 w-10 rounded-full ${action.color} flex items-center justify-center text-white mb-1`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <span className="text-xs text-gray-700">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-0 mt-3 md:mt-0 md:p-2">
          <div className="bg-white rounded-sm shadow-sm border border-gray-200  p-2 md:p-6">
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex overflow-x-auto -mb-px">
                {[
                  { id: 'activity', label: 'Activity', icon: History },
                  { id: 'details', label: 'Details', icon: User },
                  { id: 'opportunities', label: 'Opportunities', icon: Briefcase },
                  { id: 'tasks', label: 'Tasks', icon: Clipboard },
                  { id: 'notes', label: 'Notes', icon: FileText },
                  { id: 'documents', label: 'Documents', icon: File },
                ].map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-3 px-4 font-medium  text-sm whitespace-nowrap border-b-2 transition-colors flex items-center ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <IconComponent className="h-4 w-4 mr-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div>
              {/* Details Tab */}
              {activeTab === 'details' && (
                <div className="px-4">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">Lead Details</h2>
                    <button onClick={() => { setShowLeadDrawer(true); setDrawerMode('edit'); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-3">PERSONAL INFORMATION</h3>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-500">Full Name</p>
                            <p className="text-gray-800">{lead.name} {lead.lastName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Job Title</p>
                            <p className="text-gray-800">{lead.jobTitle || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Company</p>
                            <p className="text-gray-800">{lead.company || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-3">LEAD INFORMATION</h3>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-500">Lead Number</p>
                            <p className="text-gray-800">142131</p>
                          </div>
                          <div>
                                                      <p className="text-gray-800">142131</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${currentStatus.color}`}>
                              {currentStatus.label}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Lead Source</p>
                            <p className="text-gray-800">{lead.leadSource || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Assigned To</p>
                            <p className="text-gray-800">{lead.assignedTo?.name || 'Unassigned'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-3">CONTACT INFORMATION</h3>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="text-gray-800">{lead.email || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="text-gray-800">{lead.phone || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Mobile</p>
                            <p className="text-gray-800">{lead.mobile || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-3">ADDRESS</h3>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-500">Street</p>
                            <p className="text-gray-800">{lead.address || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">City</p>
                            <p className="text-gray-800">{lead.cityName || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">State</p>
                            <p className="text-gray-800">{lead.stateName || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Country</p>
                            <p className="text-gray-800">{lead.country || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">ZIP Code</p>
                            <p className="text-gray-800">{lead.zip || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

             {/* // In LeadDetails.jsx - Update the activity tab section */}
                {activeTab === 'activity' && (
                  <div>
                    {/* <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold text-gray-800">Activity History</h2>
                      <button 
                        onClick={() => openDrawer('activity')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Activity
                      </button>
                    </div>
                     */}
                    <ActivityTimeline leadId={id} />
                  </div>
              )}

              {/* Opportunities Tab */}
              {activeTab === 'opportunities' && (
                <div>
                  {/* <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">Opportunities</h2>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Opportunity
                    </button>
                  </div> */}
                      <OpportunityDetails leadId={id} />

                </div>
              )}

              {/* Tasks Tab */}
              {activeTab === 'tasks' && (
                <div>
                  {/* <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">Tasks</h2>
                    <button  onClick={() => openDrawer('task')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Task
                    </button> 
                  </div> */}
                  <TaskDetails leadId={id} />
                </div>
              )}

              {/* Notes Tab */}
              {activeTab === 'notes' && (
                <div>
                  {/* <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">Notes</h2>
                    <button 
                      onClick={() => openDrawer('note')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Note
                    </button>
                  </div> */}
                  {/* <p className="text-gray-500">No notes found for this lead.</p> */}

                      <NoteDetails leadId={id} />

                </div>
              )}

              {/* Documents Tab */}
              {activeTab === 'documents' && (
                <div>
                  {/* <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">Documents</h2>
                    <button 
                      onClick={() => openDrawer('document')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add 
                    </button>
                  </div>
                   */}
                   <DocumentDetails leadId={id}  />
                  {/* <p className="text-gray-500">No documents found for this lead.</p> */}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

         {showLeadDrawer && (
        
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div 
              className="absolute inset-0 bg-gray-300 opacity-75 transition-opacity" 
              onClick={() => setShowLeadDrawer(false)}
            ></div>
            
            <div className="fixed inset-y-0 right-0 max-w-full flex">
              <div className="w-screen max-w-4xl">
                <div className="h-full flex flex-col bg-white shadow-xl overflow-y-auto">
                  <AddLead
                    onClose={() => setShowLeadDrawer(false)}
                    onSuccess={() => {
                      
                      setShowLeadDrawer(false);
                    }}
                    lead={lead}
                    isEdit={drawerMode === 'edit'}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drawer for quick actions */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div 
              className="absolute inset-0 bg-gray-300 opacity-75 transition-opacity" 
              onClick={closeDrawer}
            ></div>
            
            <div className="fixed inset-y-0 right-0 max-w-full flex">
              <div className="w-screen max-w-2xl">
                <div className="h-full flex flex-col bg-white shadow-xl overflow-y-auto">
                  {renderDrawerContent()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadDetails;