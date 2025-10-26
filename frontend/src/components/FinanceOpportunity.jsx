import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, IndianRupee, Building, FileText, User, Mail, Phone, Calendar, Check, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

const FinanceOpportunity = ({ onClose, onSuccess, opportunity, isEdit = false, lead }) => {
  const [formData, setFormData] = useState({
    // Basic Information
    name: opportunity?.name || lead?.name || '',
    owner: opportunity?.owner?._id || opportunity?.owner || null,
    email: opportunity?.email || lead?.email || '',
    phoneNumber: opportunity?.phoneNumber || lead?.phone || '',
    status: opportunity?.status || 'Open',
    stage: opportunity?.stage || '',
    
    // Loan Details
    loanAmount: opportunity?.loanAmount || '',
    documentsPending: opportunity?.documentsPending || '',
    loanType: opportunity?.loanType || '',
    financeStatus: opportunity?.financeStatus || '',
    banksAppliedTo: opportunity?.banksAppliedTo || [],
    approvedBank: opportunity?.approvedBank || '',
    rateOfInterest: opportunity?.rateOfInterest || '',
    periodOfRepayment: opportunity?.periodOfRepayment || '',
    loanNumber: opportunity?.loanNumber || '',
    loanSanctioned: opportunity?.loanSanctioned || false,
  });

  const [errors, setErrors] = useState({});
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const bankDropdownRef = useRef(null);
  const { token } = useAuth();

  const backend_url = import.meta.env.VITE_BACKEND_URL;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bankDropdownRef.current && !bankDropdownRef.current.contains(event.target)) {
        setShowBankDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Initialize form data when editing
  useEffect(() => {
    if (isEdit && opportunity) {
      setFormData({
        name: opportunity.name || '',
        owner: opportunity.owner?._id || opportunity.owner || null,
        email: opportunity.email || '',
        phoneNumber: opportunity.phoneNumber || '',
        status: opportunity.status || 'Open',
        stage: opportunity.stage || '',
        loanAmount: opportunity.loanAmount || '',
        documentsPending: opportunity.documentsPending || '',
        loanType: opportunity.loanType || '',
        financeStatus: opportunity.financeStatus || '',
        banksAppliedTo: opportunity.banksAppliedTo || [],
        approvedBank: opportunity.approvedBank || '',
        rateOfInterest: opportunity.rateOfInterest || '',
        periodOfRepayment: opportunity.periodOfRepayment || '',
        loanNumber: opportunity.loanNumber || '',
        loanSanctioned: opportunity.loanSanctioned || false,
      });
    }
  }, [isEdit, opportunity]);

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        setLoading(true);
        const ownersResponse = await axios.get(`${backend_url}/api/users/all`, { headers: { 'Authorization': `Bearer ${token}` } });
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
  }, [lead, backend_url]);

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

  const handleBankSelection = (bank) => {
    setFormData(prev => {
      const isSelected = prev.banksAppliedTo.includes(bank);
      if (isSelected) {
        // Remove bank if already selected
        return {
          ...prev,
          banksAppliedTo: prev.banksAppliedTo.filter(b => b !== bank)
        };
      } else {
        // Add bank if not selected
        return {
          ...prev,
          banksAppliedTo: [...prev.banksAppliedTo, bank]
        };
      }
    });
  };

  const handleSelectAllBanks = () => {
    if (formData.banksAppliedTo.length === bankOptions.length) {
      // Deselect all
      setFormData(prev => ({
        ...prev,
        banksAppliedTo: []
      }));
    } else {
      // Select all
      setFormData(prev => ({
        ...prev,
        banksAppliedTo: [...bankOptions]
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.name?.trim()) newErrors.name = 'Name is required';
    if (!formData.owner) newErrors.owner = 'Owner is required';
    if (!formData.stage?.trim()) newErrors.stage = 'Stage is required';
    if (!formData.loanType?.trim()) newErrors.loanType = 'Loan type is required';
    if (!formData.financeStatus?.trim()) newErrors.financeStatus = 'Finance status is required';
    if (!formData.loanAmount || formData.loanAmount <= 0) newErrors.loanAmount = 'Valid loan amount is required';

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
        loanAmount: parseFloat(formData.loanAmount),
        documentsPending: formData.documentsPending?.trim() || '',
        loanType: formData.loanType,
        financeStatus: formData.financeStatus,
        banksAppliedTo: formData.banksAppliedTo,
        approvedBank: formData.approvedBank || undefined,
        rateOfInterest: formData.rateOfInterest ? parseFloat(formData.rateOfInterest) : undefined,
        periodOfRepayment: formData.periodOfRepayment || undefined,
        loanNumber: formData.loanNumber?.trim() || undefined,
        loanSanctioned: formData.loanSanctioned,
        leadId: lead?._id || opportunity?.leadId
      };

      let response;
      
      if (isEdit && opportunity) { 
        // Update existing opportunity
        console.log('Updating finance opportunity:', opportunity._id, opportunityData);
        response = await axios.put(
          `${backend_url}/api/financeopportunity/update/${opportunity._id}`, 
          opportunityData,
          { headers: { 'Authorization': `Bearer ${token}` } }
          
        );
      } else {
        // Create new opportunity
        console.log('Creating finance opportunity:', opportunityData);
        response = await axios.post(
          `${backend_url}/api/financeopportunity/add`, 
          opportunityData,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
      }
      
      if (response.data.status === 'success') {
        toast.success(
          isEdit 
            ? 'Finance opportunity updated successfully' 
            : 'Finance opportunity created successfully'
        );
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      } else {
        toast.error(response.data.message || `Failed to ${isEdit ? 'update' : 'create'} finance opportunity`);
      }
    } catch (error) {
      console.error(`Error ${isEdit ? 'updating' : 'creating'} finance opportunity:`, error);
      
      // Handle different error scenarios
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.errors && Array.isArray(errorData.errors)) {
          // Validation errors from backend
          errorData.errors.forEach(err => toast.error(err));
        } else if (errorData.message) {
          toast.error(errorData.message);
        } else {
          toast.error(`Failed to ${isEdit ? 'update' : 'create'} finance opportunity`);
        }
      } else if (error.request) {
        toast.error('Network error: Unable to connect to server');
      } else {
        toast.error(`Failed to ${isEdit ? 'update' : 'create'} finance opportunity`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Format currency for preview
  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Get owner name for preview
  const getOwnerName = () => {
    const owner = owners.find(o => o._id === formData.owner);
    return owner ? owner.username : 'Not selected';
  };

  // Options for dropdowns
  const statusOptions = ['Open', 'Won', 'Lost'];
  const stageOptions = ['Document Pending', 'Under Process/Application', 'Loan Approved'];
  const loanTypeOptions = [
    'Individual',
    'Company', 
    'Salaried Persons',
    'Limited Company',
    'Private Limited Company',
    'Limited Liability Partnership',
    'Partnership',
    'Society/Trust'
  ];
  const financeStatusOptions = [
    'Documents Pending',
    'Under Process/Application',
    'Loan Approved',
    'Loan Rejected',
    'Loan Disbursed'
  ];
  const bankOptions = [
    'ICICI Bank',
    'Axis Bank',
    'Kotak Bank',
    'IDFC Bank',
    'Bajaj Finserv',
    'Yes Bank',
    'AU Bank',
    'HDFC Bank',
    'Other'
  ];
  const repaymentPeriodOptions = Array.from({ length: 7 }, (_, i) => `${i + 1} Year${i > 0 ? 's' : ''}`);

  const selectedBanksText = formData.banksAppliedTo.length > 0 
    ? `${formData.banksAppliedTo.length} bank${formData.banksAppliedTo.length > 1 ? 's' : ''} selected`
    : 'Select banks...';

  return (
    <div className="p-6 h-full flex flex-col bg-white rounded-lg">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          {isEdit ? 'Edit Finance Opportunity' : 'Create Finance Opportunity'}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`px-3 hidden py-2 border rounded-lg flex items-center text-sm transition-colors ${
              showPreview 
                ? 'bg-blue-100 border-blue-300 text-blue-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            disabled={submitting}
          >
            {showPreview ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Hide Preview
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Show Preview
              </>
            )}
          </button>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={submitting}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2">
        {showPreview ? (
          // Preview Mode
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Opportunity Preview
              </h3>
              <p className="text-blue-700 text-sm">
                This is how your finance opportunity will appear. Review the details before submitting.
              </p>
            </div>

            {/* Preview Content */}
            <div className="space-y-6">
              {/* Basic Information Preview */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
                  <User size={18} className="mr-2" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <PreviewItem label="Name" value={formData.name || 'Not provided'} />
                  <PreviewItem label="Email" value={formData.email || 'Not provided'} />
                  <PreviewItem label="Phone Number" value={formData.phoneNumber || 'Not provided'} />
                  <PreviewItem label="Owner" value={getOwnerName()} />
                  <PreviewItem label="Status" value={formData.status || 'Not selected'} />
                  <PreviewItem label="Stage" value={formData.stage || 'Not selected'} />
                </div>
              </div>

              {/* Loan Details Preview */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
                  <IndianRupee size={18} className="mr-2" />
                  Loan Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <PreviewItem label="Loan Amount" value={formatCurrency(formData.loanAmount)} />
                  <PreviewItem label="Loan Type" value={formData.loanType || 'Not selected'} />
                  <PreviewItem label="Finance Status" value={formData.financeStatus || 'Not selected'} />
                  <PreviewItem label="Rate of Interest" value={formData.rateOfInterest ? `${formData.rateOfInterest}%` : 'Not provided'} />
                  <PreviewItem label="Period of Repayment" value={formData.periodOfRepayment || 'Not selected'} />
                  <PreviewItem label="Loan Number" value={formData.loanNumber || 'Not provided'} />
                  <PreviewItem label="Loan Sanctioned" value={formData.loanSanctioned ? 'Yes' : 'No'} />
                </div>
              </div>

              {/* Bank Information Preview */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
                  <Building size={18} className="mr-2" />
                  Bank Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <PreviewItem 
                      label="Banks Applied To" 
                      value={formData.banksAppliedTo.length > 0 ? formData.banksAppliedTo.join(', ') : 'No banks selected'} 
                    />
                  </div>
                  <PreviewItem label="Approved Bank" value={formData.approvedBank || 'Not selected'} />
                </div>
              </div>

              {/* Documents Preview */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
                  <FileText size={18} className="mr-2" />
                  Documents
                </h3>
                <PreviewItem 
                  label="Documents Pending" 
                  value={formData.documentsPending || 'No pending documents listed'} 
                />
              </div>
            </div>
          </div>
        ) : (
          // Form Mode
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

            {/* Loan Details Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
                <IndianRupee size={18} className="mr-2" />
                Loan Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loan Amount *</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      name="loanAmount"
                      value={formData.loanAmount}
                      onChange={handleChange}
                      className={`w-full pl-9 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.loanAmount ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                      required
                      min="0"
                      step="0.01"
                      disabled={submitting}
                    />
                  </div>
                  {errors.loanAmount && <p className="text-red-500 text-xs mt-1">{errors.loanAmount}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loan Type *</label>
                  <div className="relative">
                    <select
                      name="loanType"
                      value={formData.loanType}
                      onChange={handleChange}
                      className={`w-full p-2 border rounded-md appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.loanType ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                      disabled={submitting}
                    >
                      <option value="">Select Loan Type</option>
                      {loanTypeOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.loanType && <p className="text-red-500 text-xs mt-1">{errors.loanType}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Finance Status *</label>
                  <div className="relative">
                    <select
                      name="financeStatus"
                      value={formData.financeStatus}
                      onChange={handleChange}
                      className={`w-full p-2 border rounded-md appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.financeStatus ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                      disabled={submitting}
                    >
                      <option value="">Select Finance Status</option>
                      {financeStatusOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.financeStatus && <p className="text-red-500 text-xs mt-1">{errors.financeStatus}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rate of Interest (%)</label>
                  <input
                    type="number"
                    name="rateOfInterest"
                    value={formData.rateOfInterest}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.0"
                    step="0.1"
                    min="0"
                    max="30"
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Period of Repayment</label>
                  <div className="relative">
                    <select
                      name="periodOfRepayment"
                      value={formData.periodOfRepayment}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={submitting}
                    >
                      <option value="">Select Period</option>
                      {repaymentPeriodOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loan Number</label>
                  <input
                    type="text"
                    name="loanNumber"
                    value={formData.loanNumber}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Loan Number"
                    disabled={submitting}
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="loanSanctioned"
                    checked={formData.loanSanctioned}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={submitting}
                  />
                  <label className="ml-2 block text-sm text-gray-700">Loan Sanctioned</label>
                </div>
              </div>
            </div>

            {/* Bank Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
                <Building size={18} className="mr-2" />
                Bank Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Banks Applied To</label>
                  <div className="relative" ref={bankDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setShowBankDropdown(!showBankDropdown)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left flex justify-between items-center bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                      disabled={submitting}
                    >
                      <span className={formData.banksAppliedTo.length === 0 ? 'text-gray-400' : 'text-gray-700'}>
                        {selectedBanksText}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showBankDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showBankDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        <div className="p-2 border-b border-gray-200">
                          <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input
                              type="checkbox"
                              checked={formData.banksAppliedTo.length === bankOptions.length}
                              onChange={handleSelectAllBanks}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              disabled={submitting}
                            />
                            <span className="text-sm font-medium text-gray-700">Select All</span>
                          </label>
                        </div>
                        <div className="py-1">
                          {bankOptions.map((bank) => (
                            <label
                              key={bank}
                              className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 px-4 py-2"
                            >
                              <input
                                type="checkbox"
                                checked={formData.banksAppliedTo.includes(bank)}
                                onChange={() => handleBankSelection(bank)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                disabled={submitting}
                              />
                              <span className="text-sm text-gray-700">{bank}</span>
                              {formData.banksAppliedTo.includes(bank) && (
                                <Check className="h-4 w-4 text-blue-600 ml-auto" />
                              )}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {formData.banksAppliedTo.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {formData.banksAppliedTo.map((bank) => (
                        <span
                          key={bank}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {bank}
                          <button
                            type="button"
                            onClick={() => handleBankSelection(bank)}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Approved Bank</label>
                  <div className="relative">
                    <select
                      name="approvedBank"
                      value={formData.approvedBank}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      disabled={submitting}
                    >
                      <option value="">Select Approved Bank</option>
                      {bankOptions.map(option => (
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Documents Pending</label>
              <textarea
                name="documentsPending"
                value={formData.documentsPending}
                onChange={handleChange}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                placeholder="List any pending documents required for loan processing"
                disabled={submitting}
              />
            </div>
          </div>
        </form>
        )}

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
          {!showPreview && (
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="px-4 hidden py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={submitting}
            >
              <Eye className="h-4 w-4" />
              Preview
            </button>
          )}
          {showPreview && (
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={submitting}
            >
              <EyeOff className="h-4 w-4" />
              Back to Edit
            </button>
          )}
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
              isEdit ? 'Update Finance Opportunity' : 'Save Finance Opportunity'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Preview Item Component
const PreviewItem = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-sm font-medium text-gray-700 mb-1">{label}</span>
    <span className="text-sm text-gray-900 bg-gray-50 p-2 rounded border border-gray-200 min-h-[40px] flex items-center">
      {value || 'Not provided'}
    </span>
  </div>
);

export default FinanceOpportunity;