import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';



function AddUser() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    status: 'Active',
    profileImage: null
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match('image.*')) {
        setErrors({
          ...errors,
          profileImage: 'Please select an image file'
        });
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrors({
          ...errors,
          profileImage: 'Image must be less than 2MB'
        });
        return;
      }
      
      setFormData({
        ...formData,
        profileImage: file
      });
      
      // Clear any previous image errors
      if (errors.profileImage) {
        setErrors({
          ...errors,
          profileImage: ''
        });
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData({
      ...formData,
      profileImage: null
    });
    setImagePreview(null);
    // Clear the file input
    document.getElementById('profileImage').value = '';
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Create FormData object to handle file upload
      const submitData = new FormData();
      submitData.append('username', formData.username);
      submitData.append('email', formData.email);
      submitData.append('password', formData.password);
      submitData.append('role', formData.role);
      submitData.append('status', formData.status);
      
      if (formData.profileImage) {
        submitData.append('profileImage', formData.profileImage);
      }

      const response = await axios.post(`${backendUrl}/api/users/add`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.status === 201) {
        alert('User created successfully!');
        navigate('/users');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert('An error occurred while creating the user.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto">
        

        <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
          {/* Form Header */}
          <div className="px-8 py-5 bg-gradient-to-r from-blue-600 to-blue-700">
            <h2 className="text-2xl font-semibold text-white">Create New User</h2>
            <p className="mt-1 text-blue-100">Fill in the details below to add a new user account</p>
          </div>
          
          <form onSubmit={handleSubmit} className="px-8 py-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Left Column - Image Upload */}
              <div className="lg:col-span-1">
                <div className="sticky top-6">
                  <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Profile Image <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    
                    <div className="relative mb-4">
                      {imagePreview ? (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Profile preview"
                            className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 hover:opacity-100 transition-opacity">
                            <label
                              htmlFor="profileImage"
                              className="cursor-pointer bg-white text-blue-600 rounded-full p-2 shadow-md hover:bg-blue-50 transition-colors"
                              title="Change image"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </label>
                          </div>
                        </div>
                      ) : (
                        <label
                          htmlFor="profileImage"
                          className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-gray-300 rounded-full cursor-pointer hover:border-blue-400 transition-all duration-200 bg-white"
                        >
                          <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm text-gray-500 text-center px-2">Upload Photo</span>
                        </label>
                      )}
                      
                      <input
                        type="file"
                        id="profileImage"
                        name="profileImage"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                    
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={removeImage}
                        className="flex items-center justify-center px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors mb-2"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove Image
                      </button>
                    )}
                    
                    {errors.profileImage && (
                      <p className="mt-2 text-sm text-red-600 text-center">{errors.profileImage}</p>
                    )}
                    
                    <div className="text-center mt-4">
                      <p className="text-xs text-gray-500">
                        Supported formats: JPG, PNG, GIF
                      </p>
                      <p className="text-xs text-gray-500">
                        Max file size: 2MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Column - Form Fields */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {/* Username Field */}
                  <div className="sm:col-span-2">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                      Username *
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-colors ${
                        errors.username 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                      }`}
                      placeholder="Enter username"
                    />
                    {errors.username && <p className="mt-2 text-sm text-red-600">{errors.username}</p>}
                  </div>

                  {/* Email Field */}
                  <div className="sm:col-span-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-colors ${
                        errors.email 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                      }`}
                      placeholder="user@example.com"
                    />
                    {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
                  </div>

                  {/* Password Field */}
                  <div className="sm:col-span-1">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-colors ${
                        errors.password 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                      }`}
                      placeholder="Minimum 6 characters"
                    />
                    {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="sm:col-span-1">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-colors ${
                        errors.confirmPassword 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                      }`}
                      placeholder="Re-enter password"
                    />
                    {errors.confirmPassword && <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>}
                  </div>

                  {/* Role Selection */}
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors"
                    >
                      <option value="Sales Executive">Sales Executive</option>
                      <option value="Finance Department">Finance Department</option>
                      <option value="Insurance Department">Insurance Department</option>
                      <option value="RTO Department">RTO Department</option>
                      <option value="Super Admin">Super Admin</option>
                    </select>
                  </div>

                  {/* Status Selection */}
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors"
                    >
                      <option value="Active">Active</option>
                      <option value="Suspended">Suspended</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="mt-10 pt-6 border-t border-gray-200 flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-75 transition-all duration-200"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating User...
                      </span>
                    ) : (
                      'Create User'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

 
      </div>
    </div>
  );
}

export default AddUser;