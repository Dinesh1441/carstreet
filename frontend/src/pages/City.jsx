import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Download, X, ChevronLeft, ChevronRight, AlertCircle, MapPin, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

const City = () => {
  // State management
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [states, setStates] = useState([]);
  const [filteredStates, setFilteredStates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stateSearchTerm, setStateSearchTerm] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
  const [cityToDelete, setCityToDelete] = useState(null);
  const {token} = useAuth();
  const [currentCity, setCurrentCity] = useState({ 
    _id: '', 
    name: '', 
    state: '',
    stateName: ''
  });
  const [newCity, setNewCity] = useState({ 
    name: '', 
    state: '',
    stateName: ''
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Fetch all cities and states
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch cities with state population
        const citiesResponse = await axios.get(`${backendUrl}/api/city/all`, { headers: { 'Authorization': `Bearer ${token}` } });
        console.log('Fetched cities:', citiesResponse.data);
        
        // Fetch states for dropdown
        const statesResponse = await axios.get(`${backendUrl}/api/state/all`, { headers: { 'Authorization': `Bearer ${token}` } });
        console.log('Fetched states:', statesResponse.data);

        const citiesData = citiesResponse.data.data || citiesResponse.data.cities || [];
        const statesData = statesResponse.data.states || statesResponse.data.data || [];

        setCities(citiesData);
        setFilteredCities(citiesData);
        setStates(statesData);
        setFilteredStates(statesData);
        setTotalPages(Math.ceil(citiesData.length / itemsPerPage));
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch data');
      }
    };
    
    fetchData();
  }, [backendUrl, itemsPerPage]);

  // Search functionality for cities
  useEffect(() => {
    const results = cities.filter(city =>
      city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (city.state && city.state.name && city.state.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredCities(results);
    setTotalPages(Math.ceil(results.length / itemsPerPage));
    setCurrentPage(1); // Reset to first page when searching
  }, [searchTerm, cities, itemsPerPage]);

  // Search functionality for states dropdown
  useEffect(() => {
    const results = states.filter(state =>
      state.name.toLowerCase().includes(stateSearchTerm.toLowerCase())
    );
    setFilteredStates(results);
  }, [stateSearchTerm, states]);

  // Get current cities for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCities = filteredCities.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Add a new city
  const handleAddCity = async () => {
    if (newCity.name.trim() === '') {
      toast.error('Please enter a city name');
      return;
    }
    
    if (newCity.state === '') {
      toast.error('Please select a state');
      return;
    }
    
    try {
      const response = await axios.post(`${backendUrl}/api/city/add`, {
        name: newCity.name,
        state: newCity.state
      } , { headers: { 'Authorization': `Bearer ${token}` } });
     
      if(response.data.status === 'success') {
        // Fetch updated cities list to get populated state data
        const citiesResponse = await axios.get(`${backendUrl}/api/city/all`, { headers: { 'Authorization': `Bearer ${token}` } });
        const citiesData = citiesResponse.data.data || citiesResponse.data.cities || [];
        setCities(citiesData);
        setFilteredCities(citiesData);
        toast.success('City added successfully');
      }
    } catch (error) {
      console.error('Error adding city:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to add city');
      }
    }

    setNewCity({ name: '', state: '', stateName: '' });
    setIsAddModalOpen(false);
    setIsStateDropdownOpen(false);
  };

  // Update a city - FIXED FUNCTION
  const handleUpdateCity = async () => {
    if (currentCity.name.trim() === '') {
      toast.error('Please enter a city name');
      return;
    }
    
    if (currentCity.state === '') {
      toast.error('Please select a state');
      return;
    }
    
    try {
      const response = await axios.put(`${backendUrl}/api/city/${currentCity._id}`, {
        name: currentCity.name,
        state: currentCity.state
      } , { headers: { 'Authorization': `Bearer ${token}` } });
      
      if(response.data.status === 'success') {
        // Fetch updated cities list
        const citiesResponse = await axios.get(`${backendUrl}/api/city/all`, { headers: { 'Authorization': `Bearer ${token}` } });
        const citiesData = citiesResponse.data.data || citiesResponse.data.cities || [];
        setCities(citiesData);
        setFilteredCities(citiesData);
        toast.success('City updated successfully');
      }
    } catch (error) {
      console.error('Error updating city:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to update city');
      }
    }
    
    setIsEditModalOpen(false);
    setIsStateDropdownOpen(false);
  };

  // Delete a city
  const handleDeleteCity = async () => {
    try {
      const response = await axios.delete(`${backendUrl}/api/city/${cityToDelete}` , { headers: { 'Authorization': `Bearer ${token}` } });

      if(response.data.status === 'success') {
        setCities(cities.filter(city => city._id !== cityToDelete));
        setFilteredCities(filteredCities.filter(city => city._id !== cityToDelete));
        toast.success('City deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting city:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to delete city');
      }
    }
    
    setIsDeleteModalOpen(false);
    setCityToDelete(null);
  };

  // Export to CSV 
  const exportToCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "ID,City Name,State,Created At\n"
      + cities.map(city => 
          `${city._id},"${city.name}","${city.state?.name || 'N/A'}","${new Date(city.createdAt).toLocaleDateString()}"`
        ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "cities.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open edit modal - FIXED FUNCTION
  const openEditModal = (city) => { 
    setCurrentCity({
      _id: city._id,
      name: city.name,
      state: city.state?._id || city.state,
      stateName: city.state?.name || ''
    });
    setIsEditModalOpen(true);
  };

  // Open delete confirmation
  const openDeleteModal = (id) => {
    setCityToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // Handle state selection for add modal
  const handleStateSelectAdd = (state) => {
    setNewCity({
      ...newCity,
      state: state._id,
      stateName: state.name
    });
    setIsStateDropdownOpen(false);
    setStateSearchTerm('');
  };

  // Handle state selection for edit modal
  const handleStateSelectEdit = (state) => {
    setCurrentCity({
      ...currentCity,
      state: state._id,
      stateName: state.name
    });
    setIsStateDropdownOpen(false);
    setStateSearchTerm('');
  };

  // Clear state selection
  const clearStateSelection = (isEdit = false) => {
    if (isEdit) {
      setCurrentCity({
        ...currentCity,
        state: '',
        stateName: ''
      });
    } else {
      setNewCity({
        ...newCity,
        state: '',
        stateName: ''
      });
    }
    setIsStateDropdownOpen(false);
    setStateSearchTerm('');
  };

  // Get selected state name
  const getSelectedStateName = (stateId) => {
    const state = states.find(s => s._id === stateId);
    return state ? state.name : '';
  };

  // Generate page numbers for pagination
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="min-h-screen py-6 md:py-0">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <MapPin className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Cities Management</h1>
              <p className="text-gray-600 mt-2">Manage your cities and their associated states</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search cities by name or state..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={exportToCSV}
                className="inline-flex items-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </button>
              
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add City
              </button>
            </div>
          </div>
        </div>

        {/* Cities Table */}
        <div className="bg-white shadow-md rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    City Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    State
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentCities.length > 0 ? (
                  currentCities.map((city, index) => (
                    <tr key={city._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {indexOfFirstItem + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-blue-500 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {city.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {city.state ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {city.state.name || getSelectedStateName(city.state)}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(city.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(city)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50 transition-colors"
                            title="Edit city"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(city._id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition-colors"
                            title="Delete city"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <AlertCircle className="h-16 w-16 mb-4 text-gray-300" />
                        <p className="text-lg font-medium mb-2">No cities found</p>
                        <p className="text-sm">Try adding a new city or adjusting your search</p>
                        <button 
                          onClick={() => setIsAddModalOpen(true)}
                          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First City
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                    <span className="font-medium">
                      {indexOfLastItem > filteredCities.length ? filteredCities.length : indexOfLastItem}
                    </span>{' '}
                    of <span className="font-medium">{filteredCities.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    
                    {pageNumbers.map(number => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                          currentPage === number
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {number}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add City Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <div className="bg-white border border-gray-300 rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Add New City</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-500 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City Name</label>
                  <input
                    type="text"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={newCity.name}
                    onChange={(e) => setNewCity({...newCity, name: e.target.value})}
                    placeholder="Enter city name"
                  />
                </div>
                
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsStateDropdownOpen(!isStateDropdownOpen)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-left focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm flex justify-between items-center"
                    >
                      <span className={newCity.stateName ? 'text-gray-900' : 'text-gray-500'}>
                        {newCity.stateName || 'Select a state'}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isStateDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isStateDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        <div className="p-2 border-b border-gray-200">
                          <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                              type="text"
                              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Search states..."
                              value={stateSearchTerm}
                              onChange={(e) => setStateSearchTerm(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                        <div className="py-1">
                          {filteredStates.length > 0 ? (
                            filteredStates.map(state => (
                              <button
                                key={state._id}
                                type="button"
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                                onClick={() => handleStateSelectAdd(state)}
                              >
                                {state.name}
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-sm text-gray-500">No states found</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {newCity.stateName && (
                    <button
                      type="button"
                      onClick={() => clearStateSelection(false)}
                      className="mt-1 text-xs text-red-600 hover:text-red-800"
                    >
                      Clear selection
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCity}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  Add City
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit City Modal - FIXED */}
        {isEditModalOpen && (
          <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white border border-gray-300 rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Edit City</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-500 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City Name</label>
                  <input
                    type="text"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={currentCity.name}
                    onChange={(e) => setCurrentCity({...currentCity, name: e.target.value})}
                  />
                </div>
                
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsStateDropdownOpen(!isStateDropdownOpen)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-left focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm flex justify-between items-center"
                    >
                      <span className={currentCity.stateName ? 'text-gray-900' : 'text-gray-500'}>
                        {currentCity.stateName || 'Select a state'}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isStateDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isStateDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        <div className="p-2 border-b border-gray-200">
                          <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                              type="text"
                              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Search states..."
                              value={stateSearchTerm}
                              onChange={(e) => setStateSearchTerm(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                        <div className="py-1">
                          {filteredStates.length > 0 ? (
                            filteredStates.map(state => (
                              <button
                                key={state._id}
                                type="button"
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                                onClick={() => handleStateSelectEdit(state)}
                              >
                                {state.name}
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-sm text-gray-500">No states found</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {currentCity.stateName && (
                    <button
                      type="button"
                      onClick={() => clearStateSelection(true)}
                      className="mt-1 text-xs text-red-600 hover:text-red-800"
                    >
                      Clear selection
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateCity}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  Update City
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white border border-gray-300 rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Confirm Deletion</h3>
                <button onClick={() => setIsDeleteModalOpen(false)} className="text-gray-400 hover:text-gray-500 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-600">Are you sure you want to delete this city? This action cannot be undone.</p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCity}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                >
                  Delete City
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default City;