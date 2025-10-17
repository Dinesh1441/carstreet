import React, { useState, useEffect, useRef } from 'react';
import { 
  X, ChevronDown, User, Mail, Phone, MapPin, Building, 
  Briefcase, Globe, Twitter, Facebook, Linkedin, 
  Check, Search, Upload, Image
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AddLead = ({ onClose, onSuccess, lead, isEdit = false }) => {
  const [formData, setFormData] = useState({
    // Personal Information
    name: lead?.name || '',
    lastName: lead?.lastName || '',
    email: lead?.email || '',
    phone: lead?.phone || '',
    mobile: lead?.mobile || '',
    profileImage: lead?.profileImage || null,
    
    // Professional Information
    jobTitle: lead?.jobTitle || '',
    company: lead?.company || '',
    
    // Address Information
    address: lead?.address || '',
    city: lead?.city || '',
    cityName: lead?.cityName || '',
    state: lead?.state || '',
    stateName: lead?.stateName || '',
    zip: lead?.zip || '',
    country: lead?.country || '',
    
    // Lead Information
    leadSource: lead?.leadSource || '',
    status: lead?.status || 'New Lead',
    assignedTo: lead?.assignedTo?._id || lead?.assignedTo || '',
    
    // Social Media
    twitter: lead?.twitter || '',
    facebook: lead?.facebook || '',
    linkedin: lead?.linkedin || '',
    skype: lead?.skype || '',
    gtalk: lead?.gtalk || '',
    googlePlus: lead?.googlePlus || '',
    
    callCount: lead?.callCount || 0
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Dropdown states
  const [users, setUsers] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  
  // Search states for dropdowns
  const [userSearch, setUserSearch] = useState('');
  const [stateSearch, setStateSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [countrySearch, setCountrySearch] = useState('');

  // Dropdown visibility states
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  // File upload state
  const [uploadingImage, setUploadingImage] = useState(false);

  const backend_url = import.meta.env.VITE_BACKEND_URL;

  // Refs for dropdown click outside
  const userDropdownRef = useRef(null);
  const stateDropdownRef = useRef(null);
  const cityDropdownRef = useRef(null);
  const countryDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const refs = [
        userDropdownRef, stateDropdownRef, cityDropdownRef, countryDropdownRef
      ];
      
      refs.forEach(ref => {
        if (ref.current && !ref.current.contains(event.target)) {
          if (ref === userDropdownRef) setShowUserDropdown(false);
          if (ref === stateDropdownRef) setShowStateDropdown(false);
          if (ref === cityDropdownRef) setShowCityDropdown(false);
          if (ref === countryDropdownRef) setShowCountryDropdown(false);
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
        const [usersRes, statesRes] = await Promise.all([
          axios.get(`${backend_url}/api/users/all`),
          axios.get(`${backend_url}/api/state/all`)
        ]);

        setUsers(usersRes.data.data || usersRes.data.users || []);
        setStates(statesRes.data.states || statesRes.data.data || []);
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

  const handleImageUpload = async (files) => {
  if (!files || files.length === 0) return;

  try {
    setUploadingImage(true);
    
    const formData = new FormData();
    formData.append('profileImage', files[0]);

    const response = await axios.post(`${backend_url}/api/leads/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    if (response.data.status === 'success') {
      setFormData(prev => ({
        ...prev,
        profileImage: response.data.fileUrl
      }));
      toast.success('Profile image uploaded successfully');
    } else {
      toast.error(response.data.message || 'Upload failed');
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    const errorMessage = error.response?.data?.message || 'Failed to upload image';
    toast.error(errorMessage);
  } finally {
    setUploadingImage(false);
  }
};

  // Remove profile image
  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      profileImage: null
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Phone validation
    if (formData.phone && !/^\+?[\d\s-]{10,}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
      newErrors.phone = 'Phone number must be at least 10 digits';
    }

    // Mobile validation (if provided)
    if (formData.mobile && !/^\+?[\d\s-]{10,}$/.test(formData.mobile.replace(/[\s-]/g, ''))) {
      newErrors.mobile = 'Mobile number must be at least 10 digits';
    }

    // URL validations for social media
    const urlFields = ['twitter', 'facebook', 'linkedin'];
    urlFields.forEach(field => {
      if (formData[field] && !/^https?:\/\/.+\..+/.test(formData[field])) {
        newErrors[field] = 'Please enter a valid URL';
      }
    });

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
      
      const leadData = {
        // Personal Information
        name: formData.name,
        lastName: formData.lastName || undefined,
        email: formData.email || undefined,
        phone: formData.phone,
        mobile: formData.mobile || undefined,
        profileImage: formData.profileImage || undefined,
        
        // Professional Information
        jobTitle: formData.jobTitle || undefined,
        company: formData.company || undefined,
        
        // Address Information
        address: formData.address || undefined,
        city: formData.city || undefined,
        cityName: formData.cityName || undefined,
        state: formData.state || undefined,
        stateName: formData.stateName || undefined,
        zip: formData.zip || undefined,
        country: formData.country || undefined,
        
        // Lead Information
        leadSource: formData.leadSource || undefined,
        status: formData.status,
        assignedTo: formData.assignedTo || undefined,
        
        // Social Media
        twitter: formData.twitter || undefined,
        facebook: formData.facebook || undefined,
        linkedin: formData.linkedin || undefined,
        skype: formData.skype || undefined,
        gtalk: formData.gtalk || undefined,
        googlePlus: formData.googlePlus || undefined,
        
        callCount: formData.callCount ? parseInt(formData.callCount) : 0
      };

      // Remove undefined values
      Object.keys(leadData).forEach(key => {
        if (leadData[key] === undefined) {
          delete leadData[key];
        }
      });

      let response;
      if (isEdit && lead) {
        response = await axios.put(`${backend_url}/api/leads/update/${lead._id}`, leadData);
      } else {
        response = await axios.post(`${backend_url}/api/leads/add`, leadData);
      }

      if (response.data.status === 'success') {
        toast.success(`Lead ${isEdit ? 'updated' : 'created'} successfully`);
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error saving lead:', error);
      const errorMessage = error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} lead`;
      
      if (error.response?.status === 400 && errorMessage.includes('already exists')) {
        toast.error('A lead with this phone number already exists');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered data for searchable dropdowns
  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredStates = states.filter(state =>
    state.name?.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const filteredCities = cities.filter(city =>
    city.name?.toLowerCase().includes(citySearch.toLowerCase())
  );

  // Country options with search
  const allCountries = [
    'India', 'United States', 'United Kingdom', 'Canada', 'Australia',
    'Germany', 'France', 'Japan', 'China', 'Brazil', 'Russia', 'Italy',
    'Spain', 'Mexico', 'South Korea', 'Indonesia', 'Netherlands', 'Turkey',
    'Saudi Arabia', 'Switzerland', 'Sweden', 'Norway', 'Denmark', 'Finland',
    'Belgium', 'Austria', 'Ireland', 'Portugal', 'Greece', 'Poland',
    'Ukraine', 'Romania', 'Czech Republic', 'Hungary', 'Bulgaria', 'Croatia',
    'Slovakia', 'Slovenia', 'Lithuania', 'Latvia', 'Estonia', 'Malta',
    'Cyprus', 'Luxembourg', 'Monaco', 'Andorra', 'Liechtenstein', 'San Marino',
    'Vatican City', 'Iceland', 'Greenland', 'New Zealand', 'South Africa',
    'Egypt', 'Nigeria', 'Kenya', 'Ethiopia', 'Ghana', 'Tanzania', 'Uganda',
    'Algeria', 'Morocco', 'Angola', 'Mozambique', 'Madagascar', 'Cameroon',
    'Ivory Coast', 'Niger', 'Burkina Faso', 'Mali', 'Malawi', 'Zambia',
    'Senegal', 'Chad', 'Somalia', 'Zimbabwe', 'Guinea', 'Rwanda', 'Benin',
    'Burundi', 'Tunisia', 'South Sudan', 'Togo', 'Sierra Leone', 'Libya',
    'Congo', 'Central African Republic', 'Mauritania', 'Eritrea', 'Namibia',
    'Gambia', 'Botswana', 'Gabon', 'Lesotho', 'Guinea-Bissau', 'Equatorial Guinea',
    'Mauritius', 'Eswatini', 'Djibouti', 'Comoros', 'Cabo Verde', 'Sao Tome and Principe',
    'Seychelles', 'Argentina', 'Chile', 'Colombia', 'Peru', 'Venezuela', 'Ecuador',
    'Bolivia', 'Paraguay', 'Uruguay', 'Guyana', 'Suriname', 'French Guiana',
    'Falkland Islands', 'Pakistan', 'Bangladesh', 'Sri Lanka', 'Nepal', 'Bhutan',
    'Maldives', 'Afghanistan', 'Iran', 'Iraq', 'Syria', 'Jordan', 'Lebanon',
    'Israel', 'Palestine', 'Kuwait', 'Qatar', 'United Arab Emirates', 'Oman',
    'Bahrain', 'Yemen', 'Saudi Arabia', 'Turkey', 'Azerbaijan', 'Armenia',
    'Georgia', 'Kazakhstan', 'Uzbekistan', 'Turkmenistan', 'Kyrgyzstan', 'Tajikistan',
    'Mongolia', 'North Korea', 'Taiwan', 'Hong Kong', 'Macau', 'Singapore',
    'Malaysia', 'Thailand', 'Vietnam', 'Philippines', 'Myanmar', 'Cambodia',
    'Laos', 'Brunei', 'Timor-Leste', 'Papua New Guinea', 'Fiji', 'Solomon Islands',
    'Vanuatu', 'Samoa', 'Kiribati', 'Tonga', 'Micronesia', 'Marshall Islands',
    'Palau', 'Nauru', 'Tuvalu'
  ];

  const filteredCountries = allCountries.filter(country =>
    country.toLowerCase().includes(countrySearch.toLowerCase())
  );

  // Options for dropdowns
  const leadSourceOptions = [
     '7070707026', 'Cartrade', 'Direct Traffic', 'FB Lead Ads', 
    'Form Ads', 'Inbound Email', 'Inbound Phone call', 'Instagram', 
    'OLX', 'Organic Search', 'Outbound Phone call', 'Pay per Click Ads', 
    'Reference', 'Referral Sites', 'Social Media', 'Unknown', 'Walk-In', 
    'Website', 'WhatsApp'
  ];

  const statusOptions = [
    'New Lead', 'Car Not Available', 'Busy/Not Reachable', 'Requested Call Back', 
    'Interested', 'Visited. Deal Ongoing', 'Advance Booking', 'Amount Recieved', 
    'Sold', 'Advance received', 'Showroom visit Customer', 'Junk Lead', 'Not Interested'
  ];

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
          {isEdit ? 'Edit Lead' : 'Create New Lead'}
        </h2>
        <button onClick={onClose} disabled={submitting} className="text-gray-400 hover:text-gray-600">
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          {/* 1. PERSONAL INFORMATION */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={submitting}
                  placeholder="Enter first name"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={submitting}
                  placeholder="Enter last name"
                />
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
                  placeholder="Enter email address"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={submitting}
                  placeholder="Enter phone number"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.mobile ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={submitting}
                  placeholder="Enter mobile number"
                />
                {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
              </div>

              {/* Profile Image Upload */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
                <div className="flex items-center space-x-4">
                  {formData.profileImage ? (
                    <div className="relative">
                      <img
                        src={backend_url + formData.profileImage}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files)}
                      className="hidden"
                      id="profileImage"
                      disabled={submitting || uploadingImage}
                    />
                    <label
                      htmlFor="profileImage"
                      className={`cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 ${
                        submitting || uploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploadingImage ? 'Uploading...' : 'Upload Image'}
                    </label>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 2MB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. PROFESSIONAL INFORMATION */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
              <Briefcase className="h-5 w-5 mr-2" />
              Professional Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={submitting}
                  placeholder="Enter job title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={submitting}
                  placeholder="Enter company name"
                />
              </div>
            </div>
          </div>

          {/* 3. ADDRESS INFORMATION */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Address Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={submitting}
                  placeholder="Enter full address"
                />
              </div>

              {/* Country Dropdown with Search */}
              <div className="relative" ref={countryDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <button
                  type="button"
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  className="w-full p-2 border border-gray-300 rounded-md text-left flex justify-between items-center bg-white"
                  disabled={submitting}
                >
                  <span className={formData.country ? 'text-gray-900' : 'text-gray-500'}>
                    {formData.country || 'Select Country'}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
                {showCountryDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2 border-b border-gray-200">
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search countries..."
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="py-1 max-h-48 overflow-y-auto">
                      {filteredCountries.map(country => (
                        <button
                          key={country}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, country }));
                            setShowCountryDropdown(false);
                            setCountrySearch('');
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
                        >
                          {country}
                          {formData.country === country && <Check className="h-4 w-4 text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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
                            setFormData(prev => ({ ...prev, state: state._id, stateName: state.name, city: '' }));
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
                            setFormData(prev => ({ ...prev, city: city._id, cityName: city.name }));
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP/Postal Code</label>
                <input
                  type="text"
                  name="zip"
                  value={formData.zip}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={submitting}
                  placeholder="Enter ZIP code"
                />
              </div>
            </div>
          </div>

          {/* 4. LEAD INFORMATION */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Lead Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lead Source</label>
                <select
                  name="leadSource"
                  value={formData.leadSource}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={submitting}
                >
                  <option value="">Select Source</option>
                  {leadSourceOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={submitting}
                >
                  {statusOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              {/* Assigned To Dropdown */}
              <div className="relative" ref={userDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                <button
                  type="button"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="w-full p-2 border border-gray-300 rounded-md text-left flex justify-between items-center bg-white"
                  disabled={submitting}
                >
                  <span className={formData.assignedTo ? 'text-gray-900' : 'text-gray-500'}>
                    {formData.assignedTo ? getSelectedName(formData.assignedTo, users, 'username') : 'Select User'}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
                {showUserDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2 border-b border-gray-200">
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search users..."
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="py-1">
                      {filteredUsers.map(user => (
                        <button
                          key={user._id}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, assignedTo: user._id }));
                            setShowUserDropdown(false);
                            setUserSearch('');
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium">{user.username}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                          {formData.assignedTo === user._id && <Check className="h-4 w-4 text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Call Count</label>
                <input
                  type="number"
                  name="callCount"
                  value={formData.callCount}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={submitting}
                  min="0"
                  placeholder="Number of calls made"
                />
              </div>
            </div>
          </div>

          {/* 5. SOCIAL MEDIA */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              Social Media
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <Twitter className="h-4 w-4 mr-2 text-blue-400" />
                  Twitter
                </label>
                <input
                  type="url"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.twitter ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={submitting}
                  placeholder="https://twitter.com/username"
                />
                {errors.twitter && <p className="text-red-500 text-xs mt-1">{errors.twitter}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <Facebook className="h-4 w-4 mr-2 text-blue-600" />
                  Facebook
                </label>
                <input
                  type="url"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.facebook ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={submitting}
                  placeholder="https://facebook.com/username"
                />
                {errors.facebook && <p className="text-red-500 text-xs mt-1">{errors.facebook}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <Linkedin className="h-4 w-4 mr-2 text-blue-700" />
                  LinkedIn
                </label>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.linkedin ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={submitting}
                  placeholder="https://linkedin.com/in/username"
                />
                {errors.linkedin && <p className="text-red-500 text-xs mt-1">{errors.linkedin}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skype</label>
                <input
                  type="text"
                  name="skype"
                  value={formData.skype}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={submitting}
                  placeholder="Skype ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Google Talk</label>
                <input
                  type="text"
                  name="gtalk"
                  value={formData.gtalk}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={submitting}
                  placeholder="GTalk ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Google+</label>
                <input
                  type="text"
                  name="googlePlus"
                  value={formData.googlePlus}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={submitting}
                  placeholder="Google+ ID"
                />
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
              isEdit ? 'Update Lead' : 'Create Lead'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddLead;