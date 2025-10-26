import React, { useState, useEffect, useRef } from 'react';
import { 
  X, User, Phone, Car, Truck, Calendar, 
  MapPin, FileText, Upload, Search, 
  ChevronDown, Check, Loader, Edit, AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

const DeliveryFormDrawer = ({ onClose, onSuccess, lead, deliveryForm, isEdit = false }) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState([]);
  const [cars, setCars] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [existingDocuments, setExistingDocuments] = useState([]);
  const { token } = useAuth();
  
  const [dropdownOpen, setDropdownOpen] = useState({
    soldBy: false,
    car: false,
    deliveryStatus: false,
    rtoTransferred: false
  });

  const [searchTerm, setSearchTerm] = useState({
    soldBy: '',
    car: ''
  });

  // Validation errors state
  const [errors, setErrors] = useState({
    name: '',
    phoneNumber: '',
    soldBy: '',
    car: '',
    deliveryStatus: '',
    rtoTransferred: '',
    expectedCompletionDate: ''
  });

  const dropdownRefs = {
    soldBy: useRef(null),
    car: useRef(null),
    deliveryStatus: useRef(null),
    rtoTransferred: useRef(null)
  };

  const [formData, setFormData] = useState({
    leadId: lead?._id || deliveryForm?.leadId || '',
    name: lead?.name || deliveryForm?.name || '',
    phoneNumber: lead?.phone || deliveryForm?.phoneNumber || '',
    soldBy: deliveryForm?.soldBy?._id || deliveryForm?.soldBy || '',
    car: deliveryForm?.car?._id || deliveryForm?.car || '',
    deliveryStatus: deliveryForm?.deliveryStatus || 'Not Delivered',
    rtoTransferred: deliveryForm?.rtoTransferred || 'No',
    expectedCompletionDate: deliveryForm?.expectedCompletionDate ? 
      new Date(deliveryForm.expectedCompletionDate).toISOString().split('T')[0] : '',
    status: deliveryForm?.status || 'Pending'
  });

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Delivery status options
  const deliveryStatusOptions = ['Delivered', 'Not Delivered'];
  
  // RTO options
  const rtoOptions = ['Yes', 'No'];

  // Validation rules
  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'name':
        if (!value.trim()) {
          error = 'Name is required';
        } else if (value.trim().length < 2) {
          error = 'Name must be at least 2 characters long';
        }
        break;

      case 'phoneNumber':
        if (!value.trim()) {
          error = 'Phone number is required';
        } else if (!/^\d{10}$/.test(value.trim())) {
          error = 'Phone number must be 10 digits';
        }
        break;

      case 'soldBy':
        if (!value) {
          error = 'Please select a sales person';
        }
        break;

      case 'car':
        if (!value) {
          error = 'Please select a car';
        }
        break;

      case 'deliveryStatus':
        if (!value) {
          error = 'Please select delivery status';
        }
        break;

      case 'expectedCompletionDate':
        if (!value) {
          error = 'Expected completion date is required';
        } else {
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (selectedDate < today) {
            error = 'Date cannot be in the past';
          }
        }
        break;

      default:
        break;
    }

    return error;
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(formData).forEach(key => {
      // Only validate required fields
      if (['name', 'phoneNumber', 'soldBy', 'car', 'deliveryStatus', 'expectedCompletionDate'].includes(key)) {
        const error = validateField(key, formData[key]);
        if (error) {
          newErrors[key] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Validate single field on change
  const handleFieldValidation = (name, value) => {
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  // Fetch users and cars on component mount
  useEffect(() => {
    fetchUsers();
    fetchCars();
    
    // If editing, load existing documents
    if (isEdit && deliveryForm?.documents) {
      setExistingDocuments(deliveryForm.documents);
    }
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      let shouldCloseAll = true;
      
      Object.keys(dropdownRefs).forEach(key => {
        if (dropdownRefs[key].current && dropdownRefs[key].current.contains(event.target)) {
          shouldCloseAll = false;
        }
      });

      if (shouldCloseAll) {
        setDropdownOpen({
          soldBy: false,
          car: false,
          deliveryStatus: false,
          rtoTransferred: false
        });
        
        setSearchTerm({
          soldBy: '',
          car: ''
        });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/users/all`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.data.status === 'success') {
        setUsers(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    }
  };

  const fetchCars = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/cars/` , { headers: { 'Authorization': `Bearer ${token}` } });
      let carsData = [];
      
      if (response.data.status === 'success') {
        if (response.data.data && response.data.data.cars && Array.isArray(response.data.data.cars)) {
          carsData = response.data.data.cars;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          carsData = response.data.data;
        }
      }
      
      setCars(carsData || []);
    } catch (error) {
      console.error('Error fetching cars:', error);
      toast.error('Failed to load cars');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    }));
    
    // Validate the field after change
    handleFieldValidation(name, value);
  };

  const handleSearchChange = (field, value) => {
    setSearchTerm(prev => ({ ...prev, [field]: value }));
  };

  const toggleDropdown = (field) => {
    const newState = {
      soldBy: false,
      car: false,
      deliveryStatus: false,
      rtoTransferred: false,
      [field]: !dropdownOpen[field]
    };
    
    setDropdownOpen(newState);
    
    if (!dropdownOpen[field]) {
      setSearchTerm(prev => ({ ...prev, [field]: '' }));
    }
  };

  const selectOption = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setDropdownOpen(prev => ({ ...prev, [field]: false }));
    setSearchTerm(prev => ({ ...prev, [field]: '' }));
    
    // Validate the field after selection
    handleFieldValidation(field, value);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file sizes (max 10MB each)
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });
    
    setDocuments(prev => [...prev, ...validFiles]);
  };

  const removeDocument = (index) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingDocument = async (documentId) => {
    try {
      if (isEdit && deliveryForm?._id) {
        const response = await axios.delete(
          `${backendUrl}/api/delivery/${deliveryForm._id}/documents/${documentId}` ,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        if (response.data.success) {
          setExistingDocuments(prev => prev.filter(doc => doc._id !== documentId));
          toast.success('Document removed successfully');
        }
      }
    } catch (error) {
      console.error('Error removing document:', error);
      toast.error('Failed to remove document');
    }
  };

  const downloadDocument = async (fileUrl, fileName) => {
    try {
      const response = await axios.get(`${backendUrl}${fileUrl}`, {
        responseType: 'blob',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'document');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  // Helper function to get car display text
  const getCarDisplayText = (car) => {
    if (!car) return '';
    
    const brandName = car.brand?.make || car.brand || 'Unknown Brand';
    const modelName = car.model?.name || car.model || 'Unknown Model';
    const variantName = car.variant?.name || car.variant || '';
    const registration = car.registrationNumber || 'No Registration';
    const color = car.color || 'Unknown Color';
    
    return `${brandName} ${modelName} ${variantName ? `- ${variantName}` : ''} - ${registration} (${color})`;
  };

  // Get display name for selected user
  const getUserDisplayName = (userId) => {
    const user = users.find(u => u._id === userId);
    return user ? `${user.username} - ${user.email}` : 'Select user';
  };

  // Filter users based on search term
  const filteredUsers = () => {
    const search = searchTerm.soldBy || '';
    return users.filter(user => 
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    );
  };

  // Filter cars based on search term
  const filteredCars = () => {
    const search = searchTerm.car || '';
    return cars.filter(car => {
      const searchTerm = search.toLowerCase();
      return (
        car.registrationNumber?.toLowerCase().includes(searchTerm) ||
        (car.brand?.make && car.brand.make.toLowerCase().includes(searchTerm)) ||
        (car.model?.name && car.model.name.toLowerCase().includes(searchTerm)) ||
        (car.variant?.name && car.variant.name.toLowerCase().includes(searchTerm)) ||
        car.color?.toLowerCase().includes(searchTerm)
      );
    });
  };

  const handleSubmit = async () => {
    // Validate all fields before submission
    if (!validateForm()) {
      // toast.error('Please fix the validation errors before submitting');
      return;
    }

    try {
      setSubmitting(true);

      const submitData = new FormData();
      
      // Append form data
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });

      // Append documents
      documents.forEach((file) => {
        submitData.append('deliveryFiles', file);
      });

      let response;
      
      if (isEdit && deliveryForm?._id) {
        // For update, use PUT request
        response = await axios.put(
          `${backendUrl}/api/delivery/${deliveryForm._id}`,
          submitData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${token}`
            },
          }
        );
      } else {
        // For create, use POST request
        response = await axios.post(
          `${backendUrl}/api/delivery`,
          submitData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${token}`
            },
          }
        );
      }

      if (response.data.success) {
        toast.success(
          isEdit 
            ? 'Delivery form updated successfully' 
            : 'Delivery form created successfully'
        );
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(response.data.message || `Failed to ${isEdit ? 'update' : 'create'} delivery form`);
      }
    } catch (error) {
      console.error('Error saving delivery form:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || `Failed to ${isEdit ? 'update' : 'create'} delivery form`;
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function to render field with error
  const renderFieldWithError = (fieldName, children) => (
    <div>
      {children}
      {errors[fieldName] && (
        <div className="flex items-center mt-1 text-red-600 text-sm">
          <AlertCircle className="h-3 w-3 mr-1" />
          {errors[fieldName]}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {isEdit ? 'Edit Delivery Form' : 'Create Delivery Form'}
        </h2>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
          disabled={submitting}
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="space-y-4 flex-1 overflow-y-auto">
        {/* Name */}
        {renderFieldWithError('name',
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full pl-9 p-2 border rounded-md ${
                  errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="Customer name"
                disabled={submitting}
                required
              />
            </div>
          </div>
        )}

        {/* Phone Number */}
        {renderFieldWithError('phoneNumber',
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input 
                type="tel" 
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={`w-full pl-9 p-2 border rounded-md ${
                  errors.phoneNumber ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="Phone number"
                disabled={submitting}
                required
              />
            </div>
          </div>
        )}

        {/* Sold By */}
        {renderFieldWithError('soldBy',
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sold By *</label>
            <div className="relative" ref={dropdownRefs.soldBy}>
              <button
                type="button"
                onClick={() => toggleDropdown('soldBy')}
                className={`w-full p-2 border rounded-md flex justify-between items-center text-left ${
                  errors.soldBy ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={submitting}
              >
                <span className={formData.soldBy ? 'text-gray-900' : 'text-gray-500'}>
                  {formData.soldBy ? getUserDisplayName(formData.soldBy) : 'Select user'}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
              {dropdownOpen.soldBy && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  <div className="p-2 border-b">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Type to Search"
                        className="w-full pl-8 p-1.5 border border-gray-300 rounded text-sm"
                        value={searchTerm.soldBy}
                        onChange={(e) => handleSearchChange('soldBy', e.target.value)}
                        autoFocus
                      />
                    </div>
                  </div>
                  {filteredUsers().length > 0 ? (
                    filteredUsers().map((user) => (
                      <div
                        key={user._id}
                        onClick={() => selectOption('soldBy', user._id)}
                        className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium">{user.username}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                        {formData.soldBy === user._id && <Check className="h-4 w-4 text-blue-500" />}
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-gray-500 text-center">No users found</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Car */}
        {renderFieldWithError('car',
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Car *</label>
            <div className="relative" ref={dropdownRefs.car}>
              <button
                type="button"
                onClick={() => toggleDropdown('car')}
                className={`w-full p-2 border rounded-md flex justify-between items-center text-left ${
                  errors.car ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={submitting}
              >
                <span className={formData.car ? 'text-gray-900' : 'text-gray-500'}>
                  {formData.car ? getCarDisplayText(cars.find(c => c._id === formData.car)) : 'Select car'}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
              {dropdownOpen.car && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  <div className="p-2 border-b">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Search cars by registration, brand, model..."
                        className="w-full pl-8 p-1.5 border border-gray-300 rounded text-sm"
                        value={searchTerm.car}
                        onChange={(e) => handleSearchChange('car', e.target.value)}
                        autoFocus
                      />
                    </div>
                  </div>
                  {filteredCars().length > 0 ? (
                    filteredCars().map((car) => (
                      <div
                        key={car._id}
                        onClick={() => selectOption('car', car._id)}
                        className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium">
                            {car.brand?.make || car.brand} {car.model?.name || car.model}
                          </div>
                          <div className="text-xs text-gray-500">
                            {car.registrationNumber} • {car.color}
                            {car.variant?.name && ` • ${car.variant.name}`}
                          </div>
                        </div>
                        {formData.car === car._id && <Check className="h-4 w-4 text-blue-500" />}
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-gray-500 text-center">No cars found</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delivery Status */}
        {renderFieldWithError('deliveryStatus',
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Status *</label>
            <div className="relative" ref={dropdownRefs.deliveryStatus}>
              <button
                type="button"
                onClick={() => toggleDropdown('deliveryStatus')}
                className={`w-full p-2 border rounded-md flex justify-between items-center ${
                  errors.deliveryStatus ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={submitting}
              >
                <span>{formData.deliveryStatus}</span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
              {dropdownOpen.deliveryStatus && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                  {deliveryStatusOptions.map((status) => (
                    <div
                      key={status}
                      onClick={() => selectOption('deliveryStatus', status)}
                      className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                    >
                      <span>{status}</span>
                      {formData.deliveryStatus === status && <Check className="h-4 w-4 text-blue-500" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* RTO Transferred */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">RTO Transferred</label>
          <div className="relative" ref={dropdownRefs.rtoTransferred}>
            <button
              type="button"
              onClick={() => toggleDropdown('rtoTransferred')}
              className="w-full p-2 border border-gray-300 rounded-md flex justify-between items-center"
              disabled={submitting}
            >
              <span className={formData.rtoTransferred ? 'text-gray-900' : 'text-gray-500'}>
                {formData.rtoTransferred || 'Select option'}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
            {dropdownOpen.rtoTransferred && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                {rtoOptions.map((option) => (
                  <div
                    key={option}
                    onClick={() => selectOption('rtoTransferred', option)}
                    className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                  >
                    <span>{option}</span>
                    {formData.rtoTransferred === option && <Check className="h-4 w-4 text-blue-500" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Expected Date of Completion */}
        {renderFieldWithError('expectedCompletionDate',
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expected Date of Completion *</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input 
                type="date" 
                name="expectedCompletionDate"
                value={formData.expectedCompletionDate}
                onChange={handleChange}
                className={`w-full pl-9 p-2 border rounded-md ${
                  errors.expectedCompletionDate ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
                disabled={submitting}
                required
              />
            </div>
          </div>
        )}

        {/* Document Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Documents {isEdit && '(Existing documents will be preserved)'}
          </label>
          
          {/* Existing Documents */}
          {isEdit && existingDocuments.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Existing Documents:</p>
              <div className="space-y-2">
                {existingDocuments.map((doc, index) => (
                  <div key={doc._id || index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-700 truncate">{doc.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => downloadDocument(doc.fileUrl, doc.name)}
                        className="text-blue-500 hover:text-blue-700"
                        title="Download"
                        disabled={submitting}
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeExistingDocument(doc._id)}
                        className="text-red-500 hover:text-red-700"
                        title="Remove"
                        disabled={submitting}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Document Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              id="document-upload"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              disabled={submitting}
            />
            <label
              htmlFor="document-upload"
              className={`flex flex-col items-center justify-center cursor-pointer p-4 ${
                submitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">Click to upload documents</span>
              <span className="text-xs text-gray-500">PDF, DOC, DOCX, JPG, PNG (Max 10MB each)</span>
            </label>
          </div>

          {/* New Uploaded documents list */}
          {documents.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-sm font-medium text-gray-700">New files to upload:</p>
              {documents.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-blue-400 mr-2" />
                    <span className="text-sm text-gray-700 truncate">{file.name}</span>
                  </div>
                  <button
                    onClick={() => removeDocument(index)}
                    className="text-red-500 hover:text-red-700"
                    disabled={submitting}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
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
              <Loader className="h-4 w-4 mr-2 animate-spin" />
              {isEdit ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              {isEdit ? <Edit className="h-4 w-4 mr-2" /> : <Truck className="h-4 w-4 mr-2" />}
              {isEdit ? 'Update Delivery Form' : 'Create Delivery Form'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default DeliveryFormDrawer;