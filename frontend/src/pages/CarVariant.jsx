import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Download, X, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

const CarVariant = () => {
  // State management
  const [variants, setVariants] = useState([]);
  const [filteredVariants, setFilteredVariants] = useState([]);
  const [models, setModels] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState(null);
  const [currentVariant, setCurrentVariant] = useState({ _id: '', name: '', model: '' });
  const [newVariant, setNewVariant] = useState({ name: '', model: '' });
  const { token } = useAuth();
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Fetch all car variants and models
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch variants
        const variantsResponse = await axios.get(`${backendUrl}/api/variants/all` , { headers: { 'Authorization': `Bearer ${token}` } } );
        console.log('Fetched variants:', variantsResponse.data.variants);
        setVariants(variantsResponse.data.variants);
        setFilteredVariants(variantsResponse.data.variants);
        setTotalPages(Math.ceil(variantsResponse.data.variants.length / itemsPerPage));

        // Fetch models for dropdown
        const modelsResponse = await axios.get(`${backendUrl}/api/models/all` , { headers: { 'Authorization': `Bearer ${token}` } } );
        console.log('Fetched models:', modelsResponse.data.models);
        setModels(modelsResponse.data.models);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch data');
      }
    };
    fetchData();
  }, [backendUrl, itemsPerPage]);

  // Search functionality
  useEffect(() => {
    const results = variants.filter(variant =>
      variant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (variant.model && variant.model.name && variant.model.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (variant.model && variant.model.make && variant.model.make.make && variant.model.make.make.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredVariants(results);
    setTotalPages(Math.ceil(results.length / itemsPerPage));
    setCurrentPage(1); // Reset to first page when searching
  }, [searchTerm, variants, itemsPerPage]);

  // Get current variants for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVariants = filteredVariants.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Add a new variant
  const handleAddVariant = async () => {
    if (newVariant.name.trim() === '' || newVariant.model === '') {
      toast.error('Please fill all fields');
      return;
    }
    
    try {
      const response = await axios.post(`${backendUrl}/api/variants/add`, {
        name: newVariant.name,
        model: newVariant.model
      } , { headers: { 'Authorization': `Bearer ${token}` } });
     
      if(response.data.status === 'success') {
        // Refetch variants to get the populated model data
        const variantsResponse = await axios.get(`${backendUrl}/api/variants/all` , { headers: { 'Authorization': `Bearer ${token}` } });
        setVariants(variantsResponse.data.variants);
        setFilteredVariants(variantsResponse.data.variants);
        toast.success('Variant added successfully');
      }
    } catch (error) {
      console.error('Error adding variant:', error);
      toast.error('Failed to add variant');
    }

    setNewVariant({ name: '', model: '' });
    setIsAddModalOpen(false);
  };

  // Update a variant
  const handleUpdateVariant = async () => {
    if (currentVariant.name.trim() === '' || currentVariant.model === '') {
      toast.error('Please fill all fields');
      return;
    }
    
    try {
      const response = await axios.put(`${backendUrl}/api/variants/update/${currentVariant._id}`, {
        name: currentVariant.name,
        model: currentVariant.model
      } , { headers: { 'Authorization': `Bearer ${token}` } });
      
      if(response.data.status === 'success') {
        // Refetch variants to get updated data
        const variantsResponse = await axios.get(`${backendUrl}/api/variants/all`, { headers: { 'Authorization': `Bearer ${token}` } });
        setVariants(variantsResponse.data.variants);
        setFilteredVariants(variantsResponse.data.variants);
        toast.success('Variant updated successfully');
      }
    } catch (error) {
      console.error('Error updating variant:', error);
      toast.error('Failed to update variant');
    }
    
    setIsEditModalOpen(false);
  };

  // Delete a variant
  const handleDeleteVariant = async () => {
    try {
      const response = await axios.delete(`${backendUrl}/api/variants/delete/${variantToDelete}` , { headers: { 'Authorization': `Bearer ${token}` } });

      if(response.data.status === 'success') {
        setVariants(variants.filter(variant => variant._id !== variantToDelete));
        setFilteredVariants(filteredVariants.filter(variant => variant._id !== variantToDelete));
        toast.success('Variant deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting variant:', error);
      toast.error('Failed to delete variant');
    }
    
    setIsDeleteModalOpen(false);
    setVariantToDelete(null);
  };

  // Export to CSV 
  const exportToCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "ID,Name,Model,Make\n"
      + variants.map(variant => 
        `${variant._id},${variant.name},${variant.model ? variant.model.name : 'N/A'},${variant.model && variant.model.make ? variant.model.make.make : 'N/A'}`
      ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "car_variants.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open edit modal
  const openEditModal = (variant) => { 
    setCurrentVariant({
      _id: variant._id,
      name: variant.name,
      model: variant.model ? variant.model._id : ''
    });
    setIsEditModalOpen(true);
  };

  // Open delete confirmation
  const openDeleteModal = (id) => {
    setVariantToDelete(id);
    setIsDeleteModalOpen(true);
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
          <h1 className="text-2xl font-bold text-gray-800">Car Variants Management</h1>
          <p className="text-gray-600 mt-2">Manage your car variants with ease</p>
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
                placeholder="Search variants by name, model, or make..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={exportToCSV}
                className="inline-flex items-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </button>
              
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Variant
              </button>
            </div>
          </div>
        </div>

        {/* Variants Table */}
        <div className="bg-white shadow-md rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Variant Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Model
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Make
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentVariants.length > 0 ? (
                  currentVariants.map((variant, index) => (
                    <tr key={variant._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {indexOfFirstItem + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {variant.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {variant.model ? variant.model.name : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {variant.model && variant.model.make ? variant.model.make.make : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(variant)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                            title="Edit variant"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(variant._id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                            title="Delete variant"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <AlertCircle className="h-12 w-12 mb-2 text-gray-300" />
                        <p className="text-lg font-medium">No variants found</p>
                        <p className="text-sm">Try adding a new variant or adjusting your search</p>
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
                      {indexOfLastItem > filteredVariants.length ? filteredVariants.length : indexOfLastItem}
                    </span>{' '}
                    of <span className="font-medium">{filteredVariants.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    
                    {pageNumbers.map(number => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
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
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
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

        {/* Add Variant Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Add New Variant</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Variant Name</label>
                <input
                  type="text"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={newVariant.name}
                  onChange={(e) => setNewVariant({...newVariant, name: e.target.value})}
                  placeholder="Enter variant name"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                <select
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={newVariant.model}
                  onChange={(e) => setNewVariant({...newVariant, model: e.target.value})}
                >
                  <option value="">Select a model</option>
                  {models.map(model => (
                    <option key={model._id} value={model._id}>
                      {model.name} ({model.make ? model.make.make : 'N/A'})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddVariant}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add Variant
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Variant Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Edit Variant</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Variant Name</label>
                <input
                  type="text"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={currentVariant.name}
                  onChange={(e) => setCurrentVariant({...currentVariant, name: e.target.value})}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                <select
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={currentVariant.model}
                  onChange={(e) => setCurrentVariant({...currentVariant, model: e.target.value})}
                >
                  <option value="">Select a model</option>
                  {models.map(model => (
                    <option key={model._id} value={model._id}>
                      {model.name} ({model.make ? model.make.make : 'N/A'})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateVariant}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Update Variant
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
                <button onClick={() => setIsDeleteModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-600">Are you sure you want to delete this variant? This action cannot be undone.</p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteVariant}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Delete Variant
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarVariant;