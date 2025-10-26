import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  ArrowLeft,
  User,
  Mail,
  Shield,
  Upload,
  X,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function EditUser() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { token } = useAuth();
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);


  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Fetch user data by ID
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${backendUrl}/api/users/get/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.status === "success") {
          const user = response.data.data;
          setFormData({
            username: user.username,
            email: user.email,
            password: '',
            confirmPassword: '',
            role: user.role,
            status: user.status,
            profileImage: null
          });
          
          if (user.profileImage) {
            setCurrentImage(`${backendUrl}${user.profileImage}`);
            setImagePreview(`${backendUrl}${user.profileImage}`);
          }
        } else {
          throw new Error(response.data.message || 'Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to load user data';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUser();
    }
  }, [id, backendUrl]);

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
        toast.error('Please select an image file (JPG, PNG, GIF)');
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrors({
          ...errors,
          profileImage: 'Image must be less than 2MB'
        });
        toast.error('Image must be less than 2MB');
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
      
      toast.success('Image selected successfully');
    }
  };

  const removeImage = () => {
    setFormData({
      ...formData,
      profileImage: null
    });
    setImagePreview(currentImage);
    // Clear the file input
    document.getElementById('profileImage').value = '';
    toast.info('New image removed');
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
    
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fix the form errors');
      return false;
    }
    
    return true;
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
      submitData.append('role', formData.role);
      submitData.append('status', formData.status);
      
      // Only append password if it's provided
      if (formData.password) {
        submitData.append('password', formData.password);
      }
      
      if (formData.profileImage) {
        submitData.append('profileImage', formData.profileImage);
      }

      const response = await axios.put(`${backendUrl}/api/users/update/${id}`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 200) {
        toast.success('User updated successfully!');
        // Wait a moment before navigating to show the success message
        // setTimeout(() => {
        //   navigate('/settings/users');
        // }, 1500);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      const errorMessage = error.response?.data?.message || 'An error occurred while updating the user.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user data...</p>
        </div>
        <ToastContainer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading User</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/settings/users')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Users
          </button>
        </div>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <div className="mx-auto max-w-6xl">
        {/* Header with back button */}
       

        <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
          {/* Form Header */}
          <div className="px-8 py-5 bg-gradient-to-r from-blue-600 to-blue-700">
            <h2 className="text-2xl font-semibold text-white">Edit User Account</h2>
            <p className="mt-1 text-blue-100">Update the details for this user account</p>
          </div>
          
          <form onSubmit={handleSubmit} className="px-8 py-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Left Column - Image Upload */}
              <div className="lg:col-span-1">
                <div className="sticky top-6">
                  <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Profile Image
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
                              <Upload size={20} />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <label
                          htmlFor="profileImage"
                          className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-gray-300 rounded-full cursor-pointer hover:border-blue-400 transition-all duration-200 bg-white"
                        >
                          <User size={48} className="text-gray-400 mb-2" />
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
                    
                    {imagePreview && imagePreview !== currentImage && (
                      <button
                        type="button"
                        onClick={removeImage}
                        className="flex items-center justify-center px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors mb-2"
                      >
                        <X size={16} className="mr-2" />
                        Remove New Image
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
                      New Password
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
                      placeholder="Leave blank to keep current"
                    />
                    {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="sm:col-span-1">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
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
                      placeholder="Re-enter new password"
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
                    onClick={() => navigate('/settings/users')}
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
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating User...
                      </span>
                    ) : (
                      'Update User'
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

export default EditUser;