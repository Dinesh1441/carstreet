import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, FileText, MapPin, User, Mail, Phone, Calendar, Car, Check } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const RtoOpportunity = ({ onClose, onSuccess, opportunity, isEdit = false, lead }) => {
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    owner: null,
    email: '',
    phoneNumber: '',
    status: 'Open',
    stage: '',
    
    // RTO Process Details
    processToBeDone: '',
    transferType: '',
    documentsPending: [],
    rtoStatus: '',
    expectedDateOfTransfer: '',
    newRegNumber: '',
    newRcCardStatus: '',
  });

  const [errors, setErrors] = useState({});
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showDocumentsDropdown, setShowDocumentsDropdown] = useState(false);
  const documentsDropdownRef = useRef(null);

  const backend_url = import.meta.env.VITE_BACKEND_URL;

  // Initialize form data for edit mode
  useEffect(() => {
    if (isEdit && opportunity) {
      setFormData({
        name: opportunity.name || '',
        owner: opportunity.owner?._id || opportunity.owner || null,
        email: opportunity.email || '',
        phoneNumber: opportunity.phoneNumber || '',
        status: opportunity.status || 'Open',
        stage: opportunity.stage || '',
        processToBeDone: opportunity.processToBeDone || '',
        transferType: opportunity.transferType || '',
        documentsPending: opportunity.documentsPending || [],
        rtoStatus: opportunity.rtoStatus || '',
        expectedDateOfTransfer: opportunity.expectedDateOfTransfer ? 
          new Date(opportunity.expectedDateOfTransfer).toISOString().split('T')[0] : '',
        newRegNumber: opportunity.newRegNumber || '',
        newRcCardStatus: opportunity.newRcCardStatus || '',
      });
    } else if (lead) {
      // Pre-fill from lead for new opportunity
      setFormData(prev => ({
        ...prev,
        name: lead.name || '',
        email: lead.email || '',
        phoneNumber: lead.phone || '',
      }));
    }
  }, [isEdit, opportunity, lead]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (documentsDropdownRef.current && !documentsDropdownRef.current.contains(event.target)) {
        setShowDocumentsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        setLoading(true);
        const ownersResponse = await axios.get(`${backend_url}/api/users/all`);
        if (ownersResponse.data.status === 'success') {
          setOwners(ownersResponse.data.data || []);
        }
      } catch (error) {
        console.error('Error fetching owners:', error);
        toast.error('Failed to load owners data');
      } finally {
        setLoading(false);
      }
    }
    fetchOwners();
  }, [backend_url]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDocumentSelection = (document) => {
    setFormData(prev => {
      const isSelected = prev.documentsPending.includes(document);
      if (isSelected) {
        // Remove document if already selected
        return {
          ...prev,
          documentsPending: prev.documentsPending.filter(d => d !== document)
        };
      } else {
        // Add document if not selected
        return {
          ...prev,
          documentsPending: [...prev.documentsPending, document]
        };
      }
    });
  };

  const handleSelectAllDocuments = () => {
    if (formData.documentsPending.length === documentOptions.length) {
      // Deselect all
      setFormData(prev => ({
        ...prev,
        documentsPending: []
      }));
    } else {
      // Select all
      setFormData(prev => ({
        ...prev,
        documentsPending: [...documentOptions]
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.name?.trim()) newErrors.name = 'Name is required';
    if (!formData.owner) newErrors.owner = 'Owner is required';
    if (!formData.stage?.trim()) newErrors.stage = 'Stage is required';
    if (!formData.processToBeDone?.trim()) newErrors.processToBeDone = 'Process to be done is required';

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Phone validation
    if (formData.phoneNumber && !/^\+?[\d\s-]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    try {
      setSubmitting(true);

      // Prepare data for API call
      const opportunityData = {
        name: formData.name.trim(),
        email: formData.email?.trim() || undefined,
        phoneNumber: formData.phoneNumber?.trim() || undefined,
        owner: formData.owner,
        status: formData.status || 'Open',
        stage: formData.stage,
        processToBeDone: formData.processToBeDone,
        transferType: formData.transferType || undefined,
        documentsPending: formData.documentsPending,
        rtoStatus: formData.rtoStatus || undefined,
        expectedDateOfTransfer: formData.expectedDateOfTransfer || undefined,
        newRegNumber: formData.newRegNumber?.trim() || undefined,
        newRcCardStatus: formData.newRcCardStatus || undefined,
        leadId: lead?._id
      };

      let response;
      
      if (isEdit && opportunity) {
        // Update existing opportunity
        response = await axios.put(`${backend_url}/api/rtoopportunity/${opportunity._id}`, opportunityData);
      } else {
        // Create new opportunity
        response = await axios.post(`${backend_url}/api/rtoopportunity/add`, opportunityData);
      }
      
      if (response.data.status === 'success') {
        toast.success(`RTO opportunity ${isEdit ? 'updated' : 'created'} successfully`);
        onSuccess();
      } else {
        toast.error(response.data.message || `Failed to ${isEdit ? 'update' : 'create'} RTO opportunity`);
      }
    } catch (error) {
      console.error(`Error ${isEdit ? 'updating' : 'creating'} RTO opportunity:`, error);
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorData.errors.forEach(err => toast.error(err));
        } else if (errorData.message) {
          toast.error(errorData.message);
        } else {
          toast.error(`Failed to ${isEdit ? 'update' : 'create'} RTO opportunity`);
        }
      } else if (error.request) {
        toast.error('Network error: Unable to connect to server');
      } else {
        toast.error(`Failed to ${isEdit ? 'update' : 'create'} RTO opportunity`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Options for dropdowns
  const statusOptions = ['Open', 'Won', 'Lost'];
  const stageOptions = ["Prospecting", "Qualification", "Need Analysis", "Proposal", "Negotiation"];
  const processOptions = [
    'RC Transfer to Same State',
    'RC Transfer to Other State',
    'Normal care-of Transfer',
    'Hypothecation Add-On',
    'Transfer to other State with Owner Change',
    'No Transfer'
  ];
  const transferTypeOptions = ['Individual', 'Company'];
  const rtoStatusOptions = ['Documentation', 'File Sent to RTO', 'In-Progress', 'Completed'];
  const newRcCardStatusOptions = ['Received', 'Pending'];
  const documentOptions = ['RC', 'Aadhar', 'Pan Card', 'Photo', 'Insurance', 'Pollution Certificate', 'Sale Deed', 'NOC'];

  const selectedDocumentsText = formData.documentsPending.length > 0 
    ? `${formData.documentsPending.length} document${formData.documentsPending.length > 1 ? 's' : ''} selected`
    : 'Select documents...';

  return (
    <div className="p-6 h-full flex flex-col bg-white rounded-lg">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          {isEdit ? 'Edit RTO Opportunity' : 'Create RTO Opportunity'}
        </h2>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          disabled={submitting}
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2">
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          {/* Basic Information Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
              <User size={18} className="mr-2" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                  disabled={submitting}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={submitting}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={submitting}
                />
                {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Owner *</label>
                <select
                  name="owner"
                  value={formData.owner || ''}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.owner ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                  disabled={loading || submitting}
                >
                  <option value="">Select Owner</option>
                  {owners.map(owner => (
                    <option key={owner._id} value={owner._id}>{owner.username}</option>
                  ))}
                </select>
                {errors.owner && <p className="text-red-500 text-xs mt-1">{errors.owner}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <div className="relative">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={submitting}
                  >
                    <option value="">Select Status</option>
                    {statusOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stage *</label>
                <div className="relative">
                  <select
                    name="stage"
                    value={formData.stage}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-md appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.stage ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                    disabled={submitting}
                  >
                    <option value="">Select Stage</option>
                    {stageOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                {errors.stage && <p className="text-red-500 text-xs mt-1">{errors.stage}</p>}
              </div>
            </div>
          </div>

          {/* RTO Process Details Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
              <MapPin size={18} className="mr-2" />
              RTO Process Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Process to be done *</label>
                <div className="relative">
                  <select
                    name="processToBeDone"
                    value={formData.processToBeDone}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-md appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.processToBeDone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                    disabled={submitting}
                  >
                    <option value="">Select Process</option>
                    {processOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                {errors.processToBeDone && <p className="text-red-500 text-xs mt-1">{errors.processToBeDone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transfer Type</label>
                <div className="relative">
                  <select
                    name="transferType"
                    value={formData.transferType}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={submitting}
                  >
                    <option value="">Select Transfer Type</option>
                    {transferTypeOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RTO Status</label>
                <div className="relative">
                  <select
                    name="rtoStatus"
                    value={formData.rtoStatus}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={submitting}
                  >
                    <option value="">Select RTO Status</option>
                    {rtoStatusOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Date of Transfer</label>
                <div className="relative">
                  <input
                    type="date"
                    name="expectedDateOfTransfer"
                    value={formData.expectedDateOfTransfer}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={submitting}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Registration Number</label>
                <input
                  type="text"
                  name="newRegNumber"
                  value={formData.newRegNumber}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., DL02CD5678"
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New RC Card Status</label>
                <div className="relative">
                  <select
                    name="newRcCardStatus"
                    value={formData.newRcCardStatus}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={submitting}
                  >
                    <option value="">Select RC Status</option>
                    {newRcCardStatusOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
              <FileText size={18} className="mr-2" />
              Documents
            </h3>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Documents Pending</label>
              <div className="relative" ref={documentsDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowDocumentsDropdown(!showDocumentsDropdown)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left flex justify-between items-center bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                  <span className={formData.documentsPending.length === 0 ? 'text-gray-400' : 'text-gray-700'}>
                    {selectedDocumentsText}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showDocumentsDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showDocumentsDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2 border-b border-gray-200">
                      <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={formData.documentsPending.length === documentOptions.length}
                          onChange={handleSelectAllDocuments}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          disabled={submitting}
                        />
                        <span className="text-sm font-medium text-gray-700">Select All</span>
                      </label>
                    </div>
                    <div className="py-1">
                      {documentOptions.map((document) => (
                        <label
                          key={document}
                          className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 px-4 py-2"
                        >
                          <input
                            type="checkbox"
                            checked={formData.documentsPending.includes(document)}
                            onChange={() => handleDocumentSelection(document)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            disabled={submitting}
                          />
                          <span className="text-sm text-gray-700">{document}</span>
                          {formData.documentsPending.includes(document) && (
                            <Check className="h-4 w-4 text-blue-600 ml-auto" />
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {formData.documentsPending.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {formData.documentsPending.map((document) => (
                    <span
                      key={document}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {document}
                      <button
                        type="button"
                        onClick={() => handleDocumentSelection(document)}
                        className="ml-1 hover:bg-blue-200 rounded-full disabled:cursor-not-allowed"
                        disabled={submitting}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {isEdit ? 'Updating...' : 'Saving...'}
                </>
              ) : (
                `${isEdit ? 'Update' : 'Save'} RTO Opportunity`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RtoOpportunity;