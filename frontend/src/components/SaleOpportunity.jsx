import React, { useState, useEffect, useRef } from 'react';
import { 
  X, ChevronDown, User, Mail, Phone, MapPin, Car, Calendar, 
  FileText, Upload, Eye, EyeOff, Check, Search, DollarSign,
  Shield, Key, Wrench, Image
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const SellOpportunity = ({ onClose, onSuccess, opportunity, isEdit = false, lead }) => {

  const [formData, setFormData] = useState({
    // 1. PERSONAL DETAIL
    owner: opportunity?.owner?._id || opportunity?.owner || null,
    source: opportunity?.source || '',
    status: opportunity?.status || 'Open',
    stage: opportunity?.stage || '',
    email: opportunity?.email || lead?.email || '',
    phoneNumber: opportunity?.phoneNumber || lead?.phone || '',
    state: opportunity?.state || '',
    city: opportunity?.city || '',

    // 2. CAR DETAILS
    monthOfRegistration: opportunity?.monthOfRegistration || '',
    yearOfRegistration: opportunity?.yearOfRegistration || '',
    monthOfManufacturing: opportunity?.monthOfManufacturing || '',
    yearOfManufacturing: opportunity?.yearOfManufacturing || '',
    make: opportunity?.make || '',
    model: opportunity?.model || '',
    variant: opportunity?.variant || '',
    color: opportunity?.color || '',
    sunroof: opportunity?.sunroof || 'No',
    fuelType: opportunity?.fuelType || '',
    ownership: opportunity?.ownership || '',

    // 3. REGISTRATION & INSURANCE DETAILS
    registrationType: opportunity?.registrationType || '',
    registrationState: opportunity?.registrationState || '',
    registrationNumber: opportunity?.registrationNumber || '',
    insuranceType: opportunity?.insuranceType || '',
    insuranceCompany: opportunity?.insuranceCompany || '',
    insuranceExpiryDate: opportunity?.insuranceExpiryDate || '',

    // 4. KILOMETERS AND PRICING
    kilometersDriven: opportunity?.kilometersDriven || '',
    expectedSellingPrice: opportunity?.expectedSellingPrice || '',
    documents: opportunity?.documents || 'Pending',
    notes: opportunity?.notes || '',

    // 5. OTHERS
    secondKeyAvailable: opportunity?.secondKeyAvailable || 'No',
    servicePackage: opportunity?.servicePackage || 'No',
    warrantyValidity: opportunity?.warrantyValidity || 'Normal',
    
    // File uploads
    carImages: opportunity?.carImages || [],
    rcUpload: opportunity?.rcUpload || [],
    serviceHistory: opportunity?.serviceHistory || []
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Dropdown states
  const [owners, setOwners] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [variants, setVariants] = useState([]);
  
  // Search states for dropdowns
  const [ownerSearch, setOwnerSearch] = useState('');
  const [stateSearch, setStateSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [makeSearch, setMakeSearch] = useState('');
  const [modelSearch, setModelSearch] = useState('');
  const [variantSearch, setVariantSearch] = useState('');

  // Registration State dropdown
  const [registrationStateSearch, setRegistrationStateSearch] = useState('');
  const [showRegistrationStateDropdown, setShowRegistrationStateDropdown] = useState(false);

  // Dropdown visibility states
  const [showOwnerDropdown, setShowOwnerDropdown] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showMakeDropdown, setShowMakeDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showVariantDropdown, setShowVariantDropdown] = useState(false);

  // File upload states
  const [uploadingFiles, setUploadingFiles] = useState({
    carImages: false,
    rcUpload: false,
    serviceHistory: false
  });

  const backend_url = import.meta.env.VITE_BACKEND_URL;

  // Refs for dropdown click outside
  const ownerDropdownRef = useRef(null);
  const stateDropdownRef = useRef(null);
  const cityDropdownRef = useRef(null);
  const makeDropdownRef = useRef(null);
  const modelDropdownRef = useRef(null);
  const variantDropdownRef = useRef(null);
  const registrationStateDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const refs = [
        ownerDropdownRef, stateDropdownRef, cityDropdownRef,
        makeDropdownRef, modelDropdownRef, variantDropdownRef,
        registrationStateDropdownRef
      ];
      
      refs.forEach(ref => {
        if (ref.current && !ref.current.contains(event.target)) {
          if (ref === ownerDropdownRef) setShowOwnerDropdown(false);
          if (ref === stateDropdownRef) setShowStateDropdown(false);
          if (ref === cityDropdownRef) setShowCityDropdown(false);
          if (ref === makeDropdownRef) setShowMakeDropdown(false);
          if (ref === modelDropdownRef) setShowModelDropdown(false);
          if (ref === variantDropdownRef) setShowVariantDropdown(false);
          if (ref === registrationStateDropdownRef) setShowRegistrationStateDropdown(false);
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [ownersRes, statesRes, makesRes] = await Promise.all([
          axios.get(`${backend_url}/api/users/all`),
          axios.get(`${backend_url}/api/state/all`),
          axios.get(`${backend_url}/api/makes/all`)
        ]);

        setOwners(ownersRes.data.data || ownersRes.data.users || []);
        setStates(statesRes.data.states || statesRes.data.data || []);
        setMakes(makesRes.data.makes || makesRes.data.data || []);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        toast.error('Failed to load initial data');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [backend_url]);

  // Fetch cities when state changes
  useEffect(() => {
    const fetchCities = async () => {
      if (formData.state) {
        try {
          const response = await axios.get(`${backend_url}/api/city/state/${formData.state}`);
          setCities(response.data.data || response.data.cities || []);
        } catch (error) {
          console.error('Error fetching cities:', error);
          toast.error('Failed to load cities');
        }
      } else {
        setCities([]);
      }
    };

    fetchCities();
  }, [formData.state, backend_url]);

  // Fetch models when make changes
  useEffect(() => {
    const fetchModels = async () => {
      if (formData.make) {
        try {
          // Ensure we're passing the ID as a string, not an object
          const makeId = typeof formData.make === 'object' ? formData.make._id : formData.make;
          const response = await axios.get(`${backend_url}/api/models/make/${makeId}`);
          setModels(response.data.models || response.data.data || []);
        } catch (error) {
          console.error('Error fetching models:', error);
          toast.error('Failed to load models');
        }
      } else {
        setModels([]);
        setFormData(prev => ({ ...prev, model: '', variant: '' }));
      }
    };

    fetchModels();
  }, [formData.make, backend_url]);

  // Fetch variants when model changes
  useEffect(() => {
    const fetchVariants = async () => {
      if (formData.model) {
        try {
          // Ensure we're passing the ID as a string, not an object
          const modelId = typeof formData.model === 'object' ? formData.model._id : formData.model;
          const response = await axios.get(`${backend_url}/api/variants/model/${modelId}`);
          setVariants(response.data.variants || response.data.data || []);
        } catch (error) {
          console.error('Error fetching variants:', error);
          toast.error('Failed to load variants');
        }
      } else {
        setVariants([]);
        setFormData(prev => ({ ...prev, variant: '' }));
      }
    };

    fetchVariants();
  }, [formData.model, backend_url]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // File upload handler
  const handleFileUpload = async (fieldName, files) => {
    if (!files || files.length === 0) return;

    try {
      setUploadingFiles(prev => ({ ...prev, [fieldName]: true }));
      
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append(fieldName, file);
      });

      const response = await axios.post(`${backend_url}/api/sellopportunity/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.status === 'success') {
        const responseFiles = response.data.files;
        
        if (responseFiles && typeof responseFiles === 'object') {
          const uploadedFiles = responseFiles[fieldName] || [];
          
          if (Array.isArray(uploadedFiles) && uploadedFiles.length > 0) {
            setFormData(prev => ({
              ...prev,
              [fieldName]: [...prev[fieldName], ...uploadedFiles]
            }));
            toast.success(`${uploadedFiles.length} file(s) uploaded successfully`);
          } else {
            toast.info('No files were uploaded for this field');
          }
        } else {
          console.error('Unexpected files structure in response:', responseFiles);
          toast.error('Unexpected response format from server');
        }
      } else {
        toast.error(response.data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      const errorMessage = error.response?.data?.message || 'Failed to upload files';
      toast.error(errorMessage);
    } finally {
      setUploadingFiles(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  // Remove uploaded file
  const handleRemoveFile = (fieldName, fileIndex) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, index) => index !== fileIndex)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation according to model
    if (!formData.owner) newErrors.owner = 'Owner is required';
    if (!formData.source) newErrors.source = 'Source is required';
    if (!formData.stage) newErrors.stage = 'Stage is required';
    if (!formData.make) newErrors.make = 'Make is required';
    if (!formData.model) newErrors.model = 'Model is required';

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Phone validation
    if (formData.phoneNumber && !/^\+?[\d\s-]{10,}$/.test(formData.phoneNumber.replace(/[\s-]/g, ''))) {
      newErrors.phoneNumber = 'Phone number must be at least 10 digits';
    }

    // Numeric field validation with range checks
    if (formData.kilometersDriven) {
      if (isNaN(formData.kilometersDriven) || formData.kilometersDriven < 0) {
        newErrors.kilometersDriven = 'Kilometers driven must be a positive number';
      } else if (formData.kilometersDriven > 1000000) {
        newErrors.kilometersDriven = 'Kilometers driven seems too high';
      }
    }

    if (formData.expectedSellingPrice) {
      if (isNaN(formData.expectedSellingPrice) || formData.expectedSellingPrice < 0) {
        newErrors.expectedSellingPrice = 'Expected selling price must be a positive number';
      } else if (formData.expectedSellingPrice > 100000000) {
        newErrors.expectedSellingPrice = 'Expected selling price seems too high';
      }
    }

    if (formData.yearOfRegistration) {
      const currentYear = new Date().getFullYear();
      if (isNaN(formData.yearOfRegistration) || formData.yearOfRegistration < 1990 || formData.yearOfRegistration > currentYear) {
        newErrors.yearOfRegistration = `Year of registration must be between 1990 and ${currentYear}`;
      }
    }

    if (formData.yearOfManufacturing) {
      const currentYear = new Date().getFullYear();
      if (isNaN(formData.yearOfManufacturing) || formData.yearOfManufacturing < 1990 || formData.yearOfManufacturing > currentYear) {
        newErrors.yearOfManufacturing = `Year of manufacturing must be between 1990 and ${currentYear}`;
      }
    }

    // Registration number validation
    if (formData.registrationNumber && !/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{1,4}$/i.test(formData.registrationNumber)) {
      newErrors.registrationNumber = 'Registration number format is invalid (e.g., DL01AB1234)';
    }

    // Insurance expiry date validation
    if (formData.insuranceExpiryDate) {
      const expiryDate = new Date(formData.insuranceExpiryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (expiryDate < today) {
        newErrors.insuranceExpiryDate = 'Insurance expiry date cannot be in the past';
      }
    }

    // Enum value validations
    const sourceOptions = ['Website', 'Walk-in', 'Reference', 'Social Media', 'Campaign', 'Other'];
    if (formData.source && !sourceOptions.includes(formData.source)) {
      newErrors.source = 'Invalid source selected';
    }

    const stageOptions = ['Fresh Lead', 'Lead', 'Marketing Qualified Lead', 'Purchase Qualified Lead', 'Negotiation'];
    if (formData.stage && !stageOptions.includes(formData.stage)) {
      newErrors.stage = 'Invalid stage selected';
    }

    const statusOptions = ['Open', 'Won', 'Lost'];
    if (formData.status && !statusOptions.includes(formData.status)) {
      newErrors.status = 'Invalid status selected';
    }

    const fuelTypeOptions = ['Petrol', 'Diesel', 'Electric', 'Hybrid', ''];
    if (formData.fuelType && !fuelTypeOptions.includes(formData.fuelType)) {
      newErrors.fuelType = 'Invalid fuel type selected';
    }

    const ownershipOptions = ['1st', '2nd', '3rd', '4th', ''];
    if (formData.ownership && !ownershipOptions.includes(formData.ownership)) {
      newErrors.ownership = 'Invalid ownership selected';
    }

    const registrationTypeOptions = ['Individual', 'Corporate', 'Taxi', ''];
    if (formData.registrationType && !registrationTypeOptions.includes(formData.registrationType)) {
      newErrors.registrationType = 'Invalid registration type selected';
    }

    const insuranceTypeOptions = ['Return To Invoice (RTI)', 'Zero Dep', '3rd Party Only', 'Comprehensive / Normal', ''];
    if (formData.insuranceType && !insuranceTypeOptions.includes(formData.insuranceType)) {
      newErrors.insuranceType = 'Invalid insurance type selected';
    }

    const yesNoOptions = ['Yes', 'No'];
    if (formData.sunroof && !yesNoOptions.includes(formData.sunroof)) {
      newErrors.sunroof = 'Invalid sunroof value';
    }

    if (formData.secondKeyAvailable && !yesNoOptions.includes(formData.secondKeyAvailable)) {
      newErrors.secondKeyAvailable = 'Invalid second key value';
    }

    if (formData.servicePackage && !yesNoOptions.includes(formData.servicePackage)) {
      newErrors.servicePackage = 'Invalid service package value';
    }

    const warrantyOptions = ['Normal', 'Extended', 'NA'];
    if (formData.warrantyValidity && !warrantyOptions.includes(formData.warrantyValidity)) {
      newErrors.warrantyValidity = 'Invalid warranty validity value';
    }

    const documentsOptions = ['Pending', 'Completed'];
    if (formData.documents && !documentsOptions.includes(formData.documents)) {
      newErrors.documents = 'Invalid documents value';
    }

    // File validation
    if (formData.carImages && formData.carImages.length > 10) {
      newErrors.carImages = 'Maximum 10 car images allowed';
    }

    if (formData.rcUpload && formData.rcUpload.length > 5) {
      newErrors.rcUpload = 'Maximum 5 RC documents allowed';
    }

    if (formData.serviceHistory && formData.serviceHistory.length > 10) {
      newErrors.serviceHistory = 'Maximum 10 service history documents allowed';
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
      
      const opportunityData = {
        // Personal Details
        owner: formData.owner,
        source: formData.source,
        status: formData.status,
        stage: formData.stage,
        email: formData.email || undefined,
        phoneNumber: formData.phoneNumber || undefined,
        state: formData.state || undefined,
        city: formData.city || undefined,

        // Car Details
        monthOfRegistration: formData.monthOfRegistration || undefined,
        yearOfRegistration: formData.yearOfRegistration ? parseInt(formData.yearOfRegistration) : undefined,
        monthOfManufacturing: formData.monthOfManufacturing || undefined,
        yearOfManufacturing: formData.yearOfManufacturing ? parseInt(formData.yearOfManufacturing) : undefined,
        make: formData.make,
        model: formData.model,
        variant: formData.variant || undefined,
        color: formData.color || undefined,
        sunroof: formData.sunroof,
        fuelType: formData.fuelType || undefined,
        ownership: formData.ownership || undefined,

        // Registration & Insurance
        registrationType: formData.registrationType || undefined,
        registrationState: formData.registrationState || undefined,
        registrationNumber: formData.registrationNumber || undefined,
        insuranceType: formData.insuranceType || undefined,
        insuranceCompany: formData.insuranceCompany || undefined,
        insuranceExpiryDate: formData.insuranceExpiryDate || undefined,

        // Kilometers & Pricing
        kilometersDriven: formData.kilometersDriven ? parseInt(formData.kilometersDriven) : undefined,
        expectedSellingPrice: formData.expectedSellingPrice ? parseInt(formData.expectedSellingPrice) : undefined,
        documents: formData.documents,
        notes: formData.notes || undefined,

        // Others
        secondKeyAvailable: formData.secondKeyAvailable,
        servicePackage: formData.servicePackage,
        warrantyValidity: formData.warrantyValidity,

        // Files
        carImages: formData.carImages,
        rcUpload: formData.rcUpload,
        serviceHistory: formData.serviceHistory,

        leadId: lead?._id || opportunity?.leadId || undefined
      };

      // Remove undefined values
      Object.keys(opportunityData).forEach(key => {
        if (opportunityData[key] === undefined) {
          delete opportunityData[key];
        }
      });

      let response;
      if (isEdit && opportunity) {
        response = await axios.put(`${backend_url}/api/sellopportunity/${opportunity._id}`, opportunityData);
      } else {
        response = await axios.post(`${backend_url}/api/sellopportunity/add`, opportunityData);
      }

      if (response.data.status === 'success') {
        toast.success(`Sell opportunity ${isEdit ? 'updated' : 'created'} successfully`);
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error saving sell opportunity:', error);
      toast.error(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} sell opportunity`);
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered data for searchable dropdowns
  const filteredOwners = owners.filter(owner =>
    owner.username?.toLowerCase().includes(ownerSearch.toLowerCase()) ||
    owner.email?.toLowerCase().includes(ownerSearch.toLowerCase())
  );

  const filteredStates = states.filter(state =>
    state.name?.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const filteredCities = cities.filter(city =>
    city.name?.toLowerCase().includes(citySearch.toLowerCase())
  );

  const filteredMakes = makes.filter(make =>
    make.make?.toLowerCase().includes(makeSearch.toLowerCase())
  );

  const filteredModels = models.filter(model =>
    model.name?.toLowerCase().includes(modelSearch.toLowerCase())
  );

  const filteredVariants = variants.filter(variant =>
    variant.name?.toLowerCase().includes(variantSearch.toLowerCase())
  );

  const filteredRegistrationStates = states.filter(state =>
    state.name?.toLowerCase().includes(registrationStateSearch.toLowerCase())
  );

  // Options for dropdowns
  const statusOptions = ['Open', 'Won', 'Lost'];
  const stageOptions = ['Fresh Lead', 'Lead', 'Marketing Qualified Lead', 'Purchase Qualified Lead', 'Negotiation'];
  const sourceOptions = ['Website', 'Walk-in', 'Reference', 'Social Media', 'Campaign', 'Other'];
  const monthOptions = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const yearOptions = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);
  const fuelTypeOptions = ['Petrol', 'Diesel', 'Electric', 'Hybrid', ''];
  const ownershipOptions = ['1st', '2nd', '3rd', '4th', ''];
  const registrationTypeOptions = ['Individual', 'Corporate', 'Taxi', ''];
  const insuranceTypeOptions = ['Return To Invoice (RTI)', 'Zero Dep', '3rd Party Only', 'Comprehensive / Normal', ''];
  const insuranceCompanyOptions = [
    'Bajaj Allianz General Insurance',
    'Bharti AXA General Insurance Company Limited',
    'Chola MS (Cholamandalam MS General Insurance)',
    'Future Generali India Insurance Company',
    'HDFC ERGO General Insurance Company',
    'ICICI Lombard',
    'IFFCO Tokio General Insurance Company Limited',
    'Kotak Mahindra Bank',
    'Liberty Mutual',
    'New India Assurance',
    'Reliance General Insurance',
    'Royal Sundaram General Insurance',
    'TATA AIG',
    'The Oriental Insurance Company',
    'United India Insurance Company',
    'Universal Sompo General Insurance Company'
  ];
  const documentsOptions = ['Pending', 'Completed'];
  const yesNoOptions = ['Yes', 'No'];
  const warrantyOptions = ['Normal', 'Extended', 'NA'];

  // Helper functions
  const getSelectedName = (id, list, field = 'name') => {
    if (!id) return '';
    const item = list.find(item => item._id === id);
    return item ? item[field] : '';
  };

  return (
    <div className="p-6 h-full flex flex-col bg-white rounded-lg">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          {isEdit ? 'Edit Sell Opportunity' : 'Create Sell Opportunity'}
        </h2>
        <button onClick={onClose} disabled={submitting} className="text-gray-400 hover:text-gray-600">
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          {/* 1. PERSONAL DETAIL */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Personal Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Owner Dropdown with Search */}
              <div className="relative" ref={ownerDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Owner *</label>
                <button
                  type="button"
                  onClick={() => setShowOwnerDropdown(!showOwnerDropdown)}
                  className={`w-full p-2 border rounded-md text-left flex justify-between items-center ${
                    errors.owner ? 'border-red-500' : 'border-gray-300'
                  } ${submitting ? 'bg-gray-100' : 'bg-white'}`}
                  disabled={submitting}
                >
                  <span className={formData.owner ? 'text-gray-900' : 'text-gray-500'}>
                    {formData.owner ? getSelectedName(formData.owner, owners, 'username') : 'Select Owner'}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
                {showOwnerDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2 border-b border-gray-200">
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search owners..."
                          value={ownerSearch}
                          onChange={(e) => setOwnerSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="py-1">
                      {filteredOwners.map(owner => (
                        <button
                          key={owner._id}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, owner: owner._id }));
                            setShowOwnerDropdown(false);
                            setOwnerSearch('');
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium">{owner.username}</div>
                            <div className="text-xs text-gray-500">{owner.email}</div>
                          </div>
                          {formData.owner === owner._id && <Check className="h-4 w-4 text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {errors.owner && <p className="text-red-500 text-xs mt-1">{errors.owner}</p>}
              </div>

              {/* Source */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source *</label>
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
                {errors.source && <p className="text-red-500 text-xs mt-1">{errors.source}</p>}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.status ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={submitting}
                >
                  {statusOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
              </div>

              {/* Stage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stage *</label>
                <select
                  name="stage"
                  value={formData.stage}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
                {errors.stage && <p className="text-red-500 text-xs mt-1">{errors.stage}</p>}
              </div>

              {/* Email */}
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

              {/* Phone Number */}
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

              {/* State Dropdown with Search */}
              <div className="relative" ref={stateDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <button
                  type="button"
                  onClick={() => setShowStateDropdown(!showStateDropdown)}
                  className="w-full p-2 border border-gray-300 rounded-md text-left flex justify-between items-center bg-white"
                  disabled={submitting}
                >
                  <span className={formData.state ? 'text-gray-900' : 'text-gray-500'}>
                    {formData.state ? getSelectedName(formData.state, states) : 'Select State'}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
                {showStateDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2 border-b border-gray-200">
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search states..."
                          value={stateSearch}
                          onChange={(e) => setStateSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="py-1">
                      {filteredStates.map(state => (
                        <button
                          key={state._id}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, state: state._id, city: '' }));
                            setShowStateDropdown(false);
                            setStateSearch('');
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
                        >
                          {state.name}
                          {formData.state === state._id && <Check className="h-4 w-4 text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* City Dropdown with Search */}
              <div className="relative" ref={cityDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <button
                  type="button"
                  onClick={() => setShowCityDropdown(!showCityDropdown)}
                  disabled={!formData.state || submitting}
                  className="w-full p-2 border border-gray-300 rounded-md text-left flex justify-between items-center bg-white disabled:bg-gray-100"
                >
                  <span className={formData.city ? 'text-gray-900' : 'text-gray-500'}>
                    {formData.city ? getSelectedName(formData.city, cities) : 
                     formData.state ? 'Select City' : 'Select State First'}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
                {showCityDropdown && formData.state && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2 border-b border-gray-200">
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search cities..."
                          value={citySearch}
                          onChange={(e) => setCitySearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="py-1">
                      {filteredCities.map(city => (
                        <button
                          key={city._id}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, city: city._id }));
                            setShowCityDropdown(false);
                            setCitySearch('');
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
                        >
                          {city.name}
                          {formData.city === city._id && <Check className="h-4 w-4 text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2. CAR DETAILS */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
              <Car className="h-5 w-5 mr-2" />
              Car Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Make Dropdown with Search */}
              <div className="relative" ref={makeDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Make *</label>
                <button
                  type="button"
                  onClick={() => setShowMakeDropdown(!showMakeDropdown)}
                  className={`w-full p-2 border rounded-md text-left flex justify-between items-center ${
                    errors.make ? 'border-red-500' : 'border-gray-300'
                  } ${submitting ? 'bg-gray-100' : 'bg-white'}`}
                  disabled={submitting}
                >
                  <span className={formData.make ? 'text-gray-900' : 'text-gray-500'}>
                    {formData.make ? getSelectedName(formData.make, makes, 'make') : 'Select Make'}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
                {showMakeDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2 border-b border-gray-200">
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search makes..."
                          value={makeSearch}
                          onChange={(e) => setMakeSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="py-1">
                      {filteredMakes.map(make => (
                        <button
                          key={make._id}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, make: make._id, model: '', variant: '' }));
                            setShowMakeDropdown(false);
                            setMakeSearch('');
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
                        >
                          {make.make}
                          {formData.make === make._id && <Check className="h-4 w-4 text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {errors.make && <p className="text-red-500 text-xs mt-1">{errors.make}</p>}
              </div>

              {/* Model Dropdown with Search */}
              <div className="relative" ref={modelDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
                <button
                  type="button"
                  onClick={() => setShowModelDropdown(!showModelDropdown)}
                  disabled={!formData.make || submitting}
                  className={`w-full p-2 border rounded-md text-left flex justify-between items-center ${
                    errors.model ? 'border-red-500' : 'border-gray-300'
                  } ${!formData.make || submitting ? 'bg-gray-100' : 'bg-white'}`}
                >
                  <span className={formData.model ? 'text-gray-900' : 'text-gray-500'}>
                    {formData.model ? getSelectedName(formData.model, models) : 
                     formData.make ? 'Select Model' : 'Select Make First'}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
                {showModelDropdown && formData.make && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2 border-b border-gray-200">
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search models..."
                          value={modelSearch}
                          onChange={(e) => setModelSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="py-1">
                      {filteredModels.map(model => (
                        <button
                          key={model._id}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, model: model._id, variant: '' }));
                            setShowModelDropdown(false);
                            setModelSearch('');
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
                        >
                          {model.name}
                          {formData.model === model._id && <Check className="h-4 w-4 text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {errors.model && <p className="text-red-500 text-xs mt-1">{errors.model}</p>}
              </div>

              {/* Variant Dropdown with Search */}
              <div className="relative" ref={variantDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Variant</label>
                <button
                  type="button"
                  onClick={() => setShowVariantDropdown(!showVariantDropdown)}
                  disabled={!formData.model || submitting}
                  className="w-full p-2 border border-gray-300 rounded-md text-left flex justify-between items-center bg-white disabled:bg-gray-100"
                >
                  <span className={formData.variant ? 'text-gray-900' : 'text-gray-500'}>
                    {formData.variant ? getSelectedName(formData.variant, variants) : 
                     formData.model ? 'Select Variant' : 'Select Model First'}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
                {showVariantDropdown && formData.model && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2 border-b border-gray-200">
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search variants..."
                          value={variantSearch}
                          onChange={(e) => setVariantSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="py-1">
                      {filteredVariants.map(variant => (
                        <button
                          key={variant._id}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, variant: variant._id }));
                            setShowVariantDropdown(false);
                            setVariantSearch('');
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
                        >
                          {variant.name}
                          {formData.variant === variant._id && <Check className="h-4 w-4 text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Other car details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month of Registration</label>
                <select
                  name="monthOfRegistration"
                  value={formData.monthOfRegistration}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={submitting}
                >
                  <option value="">Select Month</option>
                  {monthOptions.map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year of Registration</label>
                <input
                  type="number"
                  name="yearOfRegistration"
                  value={formData.yearOfRegistration}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.yearOfRegistration ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={submitting}
                  placeholder="e.g., 2020"
                  min="1990"
                  max={new Date().getFullYear()}
                />
                {errors.yearOfRegistration && <p className="text-red-500 text-xs mt-1">{errors.yearOfRegistration}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month of Manufacturing</label>
                <select
                  name="monthOfManufacturing"
                  value={formData.monthOfManufacturing}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={submitting}
                >
                  <option value="">Select Month</option>
                  {monthOptions.map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year of Manufacturing</label>
                <input
                  type="number"
                  name="yearOfManufacturing"
                  value={formData.yearOfManufacturing}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.yearOfManufacturing ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={submitting}
                  placeholder="e.g., 2020"
                  min="1990"
                  max={new Date().getFullYear()}
                />
                {errors.yearOfManufacturing && <p className="text-red-500 text-xs mt-1">{errors.yearOfManufacturing}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={submitting}
                  placeholder="e.g., Red"
                  maxLength="50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sunroof</label>
                <select
                  name="sunroof"
                  value={formData.sunroof}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.sunroof ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={submitting}
                >
                  {yesNoOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {errors.sunroof && <p className="text-red-500 text-xs mt-1">{errors.sunroof}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
                <select
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.fuelType ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={submitting}
                >
                  <option value="">Select Fuel Type</option>
                  {fuelTypeOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {errors.fuelType && <p className="text-red-500 text-xs mt-1">{errors.fuelType}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ownership</label>
                <select
                  name="ownership"
                  value={formData.ownership}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.ownership ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={submitting}
                >
                  <option value="">Select Ownership</option>
                  {ownershipOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {errors.ownership && <p className="text-red-500 text-xs mt-1">{errors.ownership}</p>}
              </div>
            </div>
          </div>

          {/* 3. REGISTRATION & INSURANCE DETAILS */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Registration & Insurance Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Type</label>
                <select
                  name="registrationType"
                  value={formData.registrationType}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.registrationType ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={submitting}
                >
                  <option value="">Select Type</option>
                  {registrationTypeOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {errors.registrationType && <p className="text-red-500 text-xs mt-1">{errors.registrationType}</p>}
              </div>

              {/* Registration State Dropdown */}
              <div className="relative" ref={registrationStateDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration State</label>
                <button
                  type="button"
                  onClick={() => setShowRegistrationStateDropdown(!showRegistrationStateDropdown)}
                  className="w-full p-2 border border-gray-300 rounded-md text-left flex justify-between items-center bg-white"
                  disabled={submitting}
                >
                  <span className={formData.registrationState ? 'text-gray-900' : 'text-gray-500'}>
                    {formData.registrationState ? getSelectedName(formData.registrationState, states) : 'Select Registration State'}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
                {showRegistrationStateDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2 border-b border-gray-200">
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search registration states..."
                          value={registrationStateSearch}
                          onChange={(e) => setRegistrationStateSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="py-1">
                      {filteredRegistrationStates.map(state => (
                        <button
                          key={state._id}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, registrationState: state._id }));
                            setShowRegistrationStateDropdown(false);
                            setRegistrationStateSearch('');
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
                        >
                          {state.name}
                          {formData.registrationState === state._id && <Check className="h-4 w-4 text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.registrationNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={submitting}
                  placeholder="e.g., DL01AB1234"
                  maxLength="20"
                />
                {errors.registrationNumber && <p className="text-red-500 text-xs mt-1">{errors.registrationNumber}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Type</label>
                <select
                  name="insuranceType"
                  value={formData.insuranceType}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.insuranceType ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={submitting}
                >
                  <option value="">Select Insurance Type</option>
                  {insuranceTypeOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {errors.insuranceType && <p className="text-red-500 text-xs mt-1">{errors.insuranceType}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Company</label>
                <select
                  name="insuranceCompany"
                  value={formData.insuranceCompany}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={submitting}
                >
                  <option value="">Select Company</option>
                  {insuranceCompanyOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Expiry Date</label>
                <input
                  type="date"
                  name="insuranceExpiryDate"
                  value={formData.insuranceExpiryDate}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.insuranceExpiryDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={submitting}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.insuranceExpiryDate && <p className="text-red-500 text-xs mt-1">{errors.insuranceExpiryDate}</p>}
              </div>
            </div>
          </div>

          {/* 4. KILOMETERS AND PRICING */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Kilometers & Pricing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kilometers Driven</label>
                <input
                  type="number"
                  name="kilometersDriven"
                  value={formData.kilometersDriven}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.kilometersDriven ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={submitting}
                  placeholder="e.g., 45000"
                  min="0"
                  max="1000000"
                />
                {errors.kilometersDriven && <p className="text-red-500 text-xs mt-1">{errors.kilometersDriven}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Selling Price</label>
                <input
                  type="number"
                  name="expectedSellingPrice"
                  value={formData.expectedSellingPrice}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.expectedSellingPrice ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={submitting}
                  placeholder="e.g., 500000"
                  min="0"
                  max="100000000"
                />
                {errors.expectedSellingPrice && <p className="text-red-500 text-xs mt-1">{errors.expectedSellingPrice}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Documents</label>
                <select
                  name="documents"
                  value={formData.documents}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.documents ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={submitting}
                >
                  {documentsOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {errors.documents && <p className="text-red-500 text-xs mt-1">{errors.documents}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={submitting}
                  placeholder="Additional notes about the car..."
                  maxLength="1000"
                />
              </div>
            </div>
          </div>

          {/* 5. OTHERS */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
              <Wrench className="h-5 w-5 mr-2" />
              Others
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Second Key Available</label>
                <select
                  name="secondKeyAvailable"
                  value={formData.secondKeyAvailable}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.secondKeyAvailable ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={submitting}
                >
                  {yesNoOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {errors.secondKeyAvailable && <p className="text-red-500 text-xs mt-1">{errors.secondKeyAvailable}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Package</label>
                <select
                  name="servicePackage"
                  value={formData.servicePackage}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.servicePackage ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={submitting}
                >
                  {yesNoOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {errors.servicePackage && <p className="text-red-500 text-xs mt-1">{errors.servicePackage}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Validity</label>
                <select
                  name="warrantyValidity"
                  value={formData.warrantyValidity}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.warrantyValidity ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={submitting}
                >
                  {warrantyOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {errors.warrantyValidity && <p className="text-red-500 text-xs mt-1">{errors.warrantyValidity}</p>}
              </div>
            </div>

            {/* File Upload Sections */}
            <div className="mt-6 space-y-6">
              {/* Car Images Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Image className="h-4 w-4 mr-2" />
                  Car Images
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileUpload('carImages', e.target.files)}
                    className="hidden"
                    id="carImages"
                    disabled={submitting || uploadingFiles.carImages}
                  />
                  <label
                    htmlFor="carImages"
                    className={`cursor-pointer flex flex-col items-center justify-center p-4 ${
                      submitting || uploadingFiles.carImages ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      {uploadingFiles.carImages ? 'Uploading...' : 'Click to upload car images'}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 3MB (Max 10 images)</span>
                  </label>
                </div>
                {formData.carImages.length > 0 && (
                  <div className="mt-2">
                    {errors.carImages && <p className="text-red-500 text-xs mb-2">{errors.carImages}</p>}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {formData.carImages.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={backend_url + file.fileUrl || URL.createObjectURL(file)}
                            alt={`Car image ${index + 1}`}
                            className="w-full h-20 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveFile('carImages', index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* RC Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">RC Upload</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload('rcUpload', e.target.files)}
                    className="hidden"
                    id="rcUpload"
                    disabled={submitting || uploadingFiles.rcUpload}
                  />
                  <label
                    htmlFor="rcUpload"
                    className={`cursor-pointer flex flex-col items-center justify-center p-4 ${
                      submitting || uploadingFiles.rcUpload ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      {uploadingFiles.rcUpload ? 'Uploading...' : 'Click to upload RC document'}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">PDF, DOC, JPG, PNG up to 10MB (Max 5 files)</span>
                  </label>
                </div>
                {formData.rcUpload.length > 0 && (
                  <div className="mt-2">
                    {errors.rcUpload && <p className="text-red-500 text-xs mb-2">{errors.rcUpload}</p>}
                    <div className="space-y-2">
                      {formData.rcUpload.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm text-gray-700 truncate">{file.originalName || file.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile('rcUpload', index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Service History Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service History</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload('serviceHistory', e.target.files)}
                    className="hidden"
                    id="serviceHistory"
                    disabled={submitting || uploadingFiles.serviceHistory}
                  />
                  <label
                    htmlFor="serviceHistory"
                    className={`cursor-pointer flex flex-col items-center justify-center p-4 ${
                      submitting || uploadingFiles.serviceHistory ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      {uploadingFiles.serviceHistory ? 'Uploading...' : 'Click to upload service history'}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">PDF, DOC, XLS, JPG, PNG up to 10MB (Max 10 files)</span>
                  </label>
                </div>
                {formData.serviceHistory.length > 0 && (
                  <div className="mt-2">
                    {errors.serviceHistory && <p className="text-red-500 text-xs mb-2">{errors.serviceHistory}</p>}
                    <div className="space-y-2">
                      {formData.serviceHistory.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm text-gray-700 truncate">{file.originalName || file.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile('serviceHistory', index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {isEdit ? 'Updating...' : 'Saving...'}
              </>
            ) : (
              isEdit ? 'Update Sell Opportunity' : 'Save Sell Opportunity'
            )}
          </button>
        </div>a
      </div>
    </div>
  );
};

export default SellOpportunity;