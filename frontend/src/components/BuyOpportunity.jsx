import React, { useState, useEffect } from 'react';
import { X, IndianRupee, Target, Percent, Calendar, User, Mail, Phone, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify'; 
import { useAuth } from '../contexts/AuthContext';

const BuyOpportunity = ({ onClose, onSuccess, opportunity, isEdit = false, lead }) => {
  const [formData, setFormData] = useState({
    name: opportunity?.name || lead?.name || '',
    email: opportunity?.email || lead?.email || '',
    phoneNumber: opportunity?.phoneNumber || lead?.phone || '',
    owner: opportunity?.owner?._id || opportunity?.owner || '',
    source: opportunity?.source || lead?.leadSource || '',
    status: opportunity?.status || 'Open',
    stage: opportunity?.stage || 'Fresh Lead',
    year: opportunity?.year || '',
    minBudget: opportunity?.minBudget || '',
    maxBudget: opportunity?.maxBudget || '',
    make: opportunity?.make?._id || opportunity?.make || '',
    model: opportunity?.model?._id || opportunity?.model || '',
    variant: opportunity?.variant?._id || opportunity?.variant || '',
    colour: opportunity?.colour || '',
    carStatus: opportunity?.carStatus || 'Used',
    carAvailabilityStatus: opportunity?.carAvailabilityStatus || '',
    buyingIntent: opportunity?.buyingIntent || '',
    finance: opportunity?.finance || '',
    rto: opportunity?.rto || '',
    insurance: opportunity?.insurance || '',
    amount: opportunity?.amount || '',
    probability: opportunity?.probability || '',
    closeDate: opportunity?.closeDate || '',
    financeAmount: opportunity?.financeAmount || '',
    rtoTransferName: opportunity?.rtoTransferName || '',
    rtoChoiceNumber: opportunity?.rtoChoiceNumber || '',
    rtoProcess: opportunity?.rtoProcess || '',
    rtoRequiredState: opportunity?.rtoRequiredState || '',
    rtoProcessToBeDone: opportunity?.rtoProcessToBeDone || '',
    leadId: opportunity?.leadId || lead?._id || '',
  });

  const [errors, setErrors] = useState({});
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [variants, setVariants] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]);
  const [filteredVariants, setFilteredVariants] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const {token} = useAuth();

  const backend_url = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetchDropdownData();
    if (isEdit && opportunity) {
      // If editing, pre-fill the form with existing data
      setFormData(prev => ({
        ...prev,
        ...opportunity,
        owner: opportunity.owner?._id || opportunity.owner,
        make: opportunity.make?._id || opportunity.make,
        model: opportunity.model?._id || opportunity.model,
        variant: opportunity.variant?._id || opportunity.variant,
      }));
    }
  }, [isEdit, opportunity]);

  useEffect(() => {
    if (formData.make) {
      const brandModels = models.filter(model => model.make && model.make._id === formData.make);
      setFilteredModels(brandModels);
    } else {
      setFilteredModels([]);
    }
  }, [formData.make, models]);

  useEffect(() => {
    if (formData.model) {
      const modelVariants = variants.filter(variant => variant.model && variant.model._id === formData.model);
      setFilteredVariants(modelVariants);
    } else {
      setFilteredVariants([]);
    }
  }, [formData.model, variants]);

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const ownersResponse = await axios.get(`${backend_url}/api/users/all` , { headers: { 'Authorization': `Bearer ${token}` } });
        if (ownersResponse.data.status === 'success') {
          setOwners(ownersResponse.data.data || []);
        }
      } catch (error) {
        console.error('Error fetching owners:', error);
      }
    };
    fetchOwners();
  }, [backend_url]);

  const fetchDropdownData = async () => {
    try {
      setLoading(true);
      const [brandsResponse, modelsResponse, variantsResponse] = await Promise.all([
        axios.get(`${backend_url}/api/makes/all`, { headers: { 'Authorization': `Bearer ${token}` } }),
        axios.get(`${backend_url}/api/models/all`, { headers: { 'Authorization': `Bearer ${token}` } }),
        axios.get(`${backend_url}/api/variants/all`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      setBrands(brandsResponse.data.makes || []);
      setModels(modelsResponse.data.models || []);
      setVariants(variantsResponse.data.variants || []);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      toast.error('Failed to load dropdown data');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.name?.trim()) newErrors.name = 'Opportunity name is required';
    if (!formData.owner) newErrors.owner = 'Owner is required';
    if (!formData.source?.trim()) newErrors.source = 'Source is required';
    if (!formData.stage?.trim()) newErrors.stage = 'Stage is required';
    if (!formData.make) newErrors.make = 'Make is required';
    if (!formData.model) newErrors.model = 'Model is required';
    if (!formData.finance) newErrors.finance = 'Finance selection is required';
    if (!formData.rto) newErrors.rto = 'RTO selection is required';
    if (!formData.insurance) newErrors.insurance = 'Insurance selection is required';

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Phone validation
    if (formData.phoneNumber && !/^\+?[\d\s-]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number is invalid';
    }

    // Budget validation
    if (formData.minBudget && formData.maxBudget) {
      const min = parseFloat(formData.minBudget);
      const max = parseFloat(formData.maxBudget);
      if (min > max) {
        newErrors.maxBudget = 'Max budget should be greater than min budget';
      }
    }

    // Finance amount validation
    if (formData.finance === 'Yes' && (!formData.financeAmount || formData.financeAmount <= 0)) {
      newErrors.financeAmount = 'Finance amount is required when finance is Yes';
    }

    // RTO validation when RTO is Yes
    if (formData.rto === 'Yes' && !formData.rtoProcessToBeDone) {
      newErrors.rtoProcessToBeDone = 'RTO process is required when RTO is Yes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
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
        email: formData.email.trim() || undefined,
        phoneNumber: formData.phoneNumber.trim() || undefined,
        owner: formData.owner,
        source: formData.source,
        status: formData.status,
        stage: formData.stage,
        year: formData.year ? parseInt(formData.year) : undefined,
        minBudget: formData.minBudget ? parseFloat(formData.minBudget) : undefined,
        maxBudget: formData.maxBudget ? parseFloat(formData.maxBudget) : undefined,
        make: formData.make,
        model: formData.model,
        variant: formData.variant || undefined,
        colour: formData.colour.trim() || undefined,
        carStatus: formData.carStatus,
        carAvailabilityStatus: formData.carAvailabilityStatus || '',
        buyingIntent: formData.buyingIntent || '',
        finance: formData.finance,
        financeAmount: formData.financeAmount ? parseFloat(formData.financeAmount) : undefined,
        rto: formData.rto,
        rtoTransferName: formData.rtoTransferName?.trim() || undefined,
        rtoChoiceNumber: formData.rtoChoiceNumber?.trim() || undefined,
        rtoProcessToBeDone: formData.rtoProcessToBeDone || '',
        rtoRequiredState: formData.rtoRequiredState?.trim() || undefined,
        rtoProcess: formData.rtoProcess || '',
        insurance: formData.insurance,
        leadId: formData.leadId
      };

      let response;
      
      if (isEdit && opportunity) {
        // Update existing opportunity
        console.log('Updating opportunity:', opportunity._id, opportunityData);
        response = await axios.put(
          `${backend_url}/api/buyopportunity/${opportunity._id}`, 
          opportunityData,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
      } else {
        // Create new opportunity
        console.log('Adding opportunity:', opportunityData);
        response = await axios.post(
          `${backend_url}/api/buyopportunity/add`, 
          opportunityData
          , { headers: { 'Authorization': `Bearer ${token}` } }
        );
      }
      
      if (response.data.status === 'success') {
        toast.success(
          isEdit 
            ? 'Buy opportunity updated successfully' 
            : 'Buy opportunity created successfully'
        );
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      } else {
        toast.error(
          isEdit 
            ? 'Failed to update buy opportunity' 
            : 'Failed to create buy opportunity'
        );
      }
    } catch (error) {
      console.error('Error saving buy opportunity:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(
          isEdit 
            ? 'Failed to update buy opportunity' 
            : 'Failed to create buy opportunity'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Options for dropdowns
  const sourceOptions = ['Cartrade', 'Website', 'Referral', 'Walk-in', 'Social Media', 'Other'];
  const yearOptions = Array.from({ length: 25 }, (_, i) => new Date().getFullYear() - i);
  const buyingIntentOptions = ["Within 15 days", "Within 30 days", "Within 2-3 Months"];
  const financeOptions = ['Yes', 'No', 'Maybe'];
  const insuranceOptions = ['Yes', 'No'];
  const rtoOptions = ['Yes', 'No', 'Maybe'];
  const statusOptions = ['Open', 'Won', 'Lost'];
  const rtoProcessOptions = [
    "RC Transfer to Other State",
    "Normal care-of Transfer",
    "Hypothecation Add-On",
    "Hypothecation Remove",
    "Transfer to other State with Owner Change",
    "No Transfer"
  ];
  const carStageOptions = ["Fresh Lead", "Lead", "Negotiation", "Test Drive", "Showroom Visit"];
  const carAvailabilityOptions = ["Available", "Not Available"];

  return (
    <div className="p-3 h-full flex flex-col bg-white rounded-lg">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          {isEdit ? 'Edit Buy Opportunity' : 'Create Buy Opportunity'}
        </h2>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          disabled={submitting}
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[70vh] pr-2">
        {/* Left Column */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Opportunity Name *</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full pl-9 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Opportunity name"
                disabled={submitting}
              />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-9 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Email address"
                disabled={submitting}
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input 
                type="tel" 
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={`w-full pl-9 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+91-6005804808"
                disabled={submitting}
              />
            </div>
            {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Owner *</label>
            <select  
              name="owner"
              value={formData.owner}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.owner ? 'border-red-500' : 'border-gray-300'
              }`}
              required
              disabled={submitting}
            >
              <option value="">Select Owner</option>
              {owners.map(owner => (
                <option key={owner._id} value={owner._id}>{owner.username}</option>
              ))}
            </select>
            {errors.owner && <p className="text-red-500 text-xs mt-1">{errors.owner}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source *</label>
            <div className="relative">
              <select 
                name="source"
                value={formData.source}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.source ? 'border-red-500' : 'border-gray-300'
                }`}
                required
                disabled={submitting}
              >
                <option value="">Select Source</option>
                {sourceOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            {errors.source && <p className="text-red-500 text-xs mt-1">{errors.source}</p>}
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
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
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
                {carStageOptions.map(stage => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            {errors.stage && <p className="text-red-500 text-xs mt-1">{errors.stage}</p>}
          </div>
                      
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Make *</label>
            <div className="relative">
              <select 
                name="make"
                value={formData.make}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.make ? 'border-red-500' : 'border-gray-300'
                }`}
                required
                disabled={loading || submitting}
              >
                <option value="">Select Make</option>
                {brands.map(brand => (
                  <option key={brand._id} value={brand._id}>{brand.make}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            {errors.make && <p className="text-red-500 text-xs mt-1">{errors.make}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
            <div className="relative">
              <select 
                name="model"
                value={formData.model}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.model ? 'border-red-500' : 'border-gray-300'
                }`}
                required
                disabled={!formData.make || loading || submitting}
              >
                <option value="">Select Model</option>
                {filteredModels.map(model => (
                  <option key={model._id} value={model._id}>{model.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            {errors.model && <p className="text-red-500 text-xs mt-1">{errors.model}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Variant</label>
            <div className="relative">
              <select 
                name="variant"
                value={formData.variant}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!formData.model || loading || submitting}
              >
                <option value="">Select Variant</option>
                {filteredVariants.map(variant => (
                  <option key={variant._id} value={variant._id}>{variant.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Colour</label>
            <input 
              type="text" 
              name="colour"
              value={formData.colour}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Colour"
              disabled={submitting}
            />
          </div>
        </div>
        
        {/* Right Column */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <div className="relative">
              <select 
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={submitting}
              >
                <option value="">Select Year</option>
                {yearOptions.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Budget (In Lakh)</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input 
                  type="number" 
                  name="minBudget"
                  value={formData.minBudget}
                  onChange={handleChange}
                  className="w-full pl-9 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Min"
                  min="0"
                  step="0.01"
                  disabled={submitting}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Budget (In Lakh)</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input 
                  type="number" 
                  name="maxBudget"
                  value={formData.maxBudget}
                  onChange={handleChange}
                  className={`w-full pl-9 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.maxBudget ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Max"
                  min="0"
                  step="0.01"
                  disabled={submitting}
                />
              </div>
              {errors.maxBudget && <p className="text-red-500 text-xs mt-1">{errors.maxBudget}</p>}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Car Availability Status</label>
            <div className="flex items-center space-x-4 mt-3 mb-5">
              {carAvailabilityOptions.map(option => (
                <label key={option} className="inline-flex items-center">
                  <input 
                    type="radio" 
                    name="carAvailabilityStatus"
                    value={option}
                    checked={formData.carAvailabilityStatus === option}
                    onChange={handleChange}
                    className="text-blue-600 focus:ring-blue-500"
                    disabled={submitting}
                  />
                  <span className="ml-2">{option}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buying Intent</label>
            <div className="relative">
              <select 
                name="buyingIntent"
                value={formData.buyingIntent}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={submitting}
              >
                <option value="">Select Buying Intent</option>
                {buyingIntentOptions.map(intent => (
                  <option key={intent} value={intent}>{intent}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Finance *</label>
              <div className="relative">
                <select 
                  name="finance"
                  value={formData.finance}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.finance ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                  disabled={submitting}
                >
                  <option value="">Select</option>
                  {financeOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              {errors.finance && <p className="text-red-500 text-xs mt-1">{errors.finance}</p>}
            </div>
            
            {formData.finance === 'Yes' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Finance Amount</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input 
                    type="number" 
                    name="financeAmount"
                    value={formData.financeAmount}
                    onChange={handleChange}
                    className={`w-full pl-9 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.financeAmount ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Finance Amount"
                    min="0"
                    step="0.01"
                    disabled={submitting}
                  />
                </div>
                {errors.financeAmount && <p className="text-red-500 text-xs mt-1">{errors.financeAmount}</p>}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">RTO *</label>
              <div className="relative">
                <select 
                  name="rto"
                  value={formData.rto}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.rto ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                  disabled={submitting}
                >
                  <option value="">Select</option>
                  {rtoOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              {errors.rto && <p className="text-red-500 text-xs mt-1">{errors.rto}</p>}
            </div>
            
            {formData.rto === 'Yes' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RTO - RC Transfer Name</label>
                  <input 
                    type="text" 
                    name="rtoTransferName"
                    value={formData.rtoTransferName}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="RC Transfer Name"
                    disabled={submitting}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RTO - Choice Number</label>
                  <input 
                    type="text" 
                    name="rtoChoiceNumber"
                    value={formData.rtoChoiceNumber}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Choice Number"
                    disabled={submitting}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RTO - Process to be done</label>
                  <div className="relative">
                    <select 
                      name="rtoProcessToBeDone"
                      value={formData.rtoProcessToBeDone}
                      onChange={handleChange}
                      className={`w-full p-2 border rounded-md appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.rtoProcessToBeDone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={submitting}
                    >
                      <option value="">Select Process</option>
                      {rtoProcessOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.rtoProcessToBeDone && <p className="text-red-500 text-xs mt-1">{errors.rtoProcessToBeDone}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RTO - Required State</label>
                  <input 
                    type="text" 
                    name="rtoRequiredState"
                    value={formData.rtoRequiredState}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Required State"
                    disabled={submitting}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RTO - Process</label>
                  <div className="flex items-center">
                    <input 
                      type="text" 
                      name="rtoProcess"
                      value={formData.rtoProcess}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Process"
                      disabled={submitting}
                    />
                  </div>
                </div>
              </>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Insurance *</label>
              <div className="relative">
                <select 
                  name="insurance"
                  value={formData.insurance}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.insurance ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                  disabled={submitting}
                >
                  <option value="">Select</option>
                  {insuranceOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              {errors.insurance && <p className="text-red-500 text-xs mt-1">{errors.insurance}</p>}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={submitting}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              {isEdit ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              {isEdit ? 'Update Opportunity' : 'Add Opportunity'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default BuyOpportunity;