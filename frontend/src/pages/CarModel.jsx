import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Download, X, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const CarModel = () => {
  // State management
  const [models, setModels] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]);
  const [makes, setMakes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState(null);
  const [currentModel, setCurrentModel] = useState({ _id: '', name: '', make: '' });
  const [newModel, setNewModel] = useState({ name: '', make: '' });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Fetch all car models and makes
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch models
        const modelsResponse = await axios.get(`${backendUrl}/api/models/all`);
        console.log('Fetched models:', modelsResponse.data.models);
        setModels(modelsResponse.data.models);
        setFilteredModels(modelsResponse.data.models);
        setTotalPages(Math.ceil(modelsResponse.data.models.length / itemsPerPage));

        // Fetch makes for dropdown
        const makesResponse = await axios.get(`${backendUrl}/api/makes/all`);
        console.log('Fetched makes:', makesResponse.data.makes);
        setMakes(makesResponse.data.makes);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch data');
      }
    };
    fetchData();
  }, [backendUrl, itemsPerPage]);

  // Search functionality
  useEffect(() => {
    const results = models.filter(model =>
      model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (model.make && model.make.make && model.make.make.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredModels(results);
    setTotalPages(Math.ceil(results.length / itemsPerPage));
    setCurrentPage(1); // Reset to first page when searching
  }, [searchTerm, models, itemsPerPage]);

  // Get current models for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentModels = filteredModels.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Add a new model
  const handleAddModel = async () => {
    if (newModel.name.trim() === '' || newModel.make === '') {
      toast.error('Please fill all fields');
      return;
    }
    
    try {
      const response = await axios.post(`${backendUrl}/api/models/add`, {
        name: newModel.name,
        make: newModel.make
      });
     
      if(response.data.status === 'success') {
        // Refetch models to get the populated make data
        const modelsResponse = await axios.get(`${backendUrl}/api/models/all`);
        setModels(modelsResponse.data.models);
        setFilteredModels(modelsResponse.data.models);
        toast.success('Model added successfully');
      }
    } catch (error) {
      console.error('Error adding model:', error);
      toast.error('Failed to add model');
    }

    setNewModel({ name: '', make: '' });
    setIsAddModalOpen(false);
  };

  // Update a model
  const handleUpdateModel = async () => {
    if (currentModel.name.trim() === '' || currentModel.make === '') {
      toast.error('Please fill all fields');
      return;
    }
    
    try {
      const response = await axios.put(`${backendUrl}/api/models/update/${currentModel._id}`, {
        name: currentModel.name,
        make: currentModel.make
      });
      
      if(response.data.status === 'success') {
        // Refetch models to get updated data
        const modelsResponse = await axios.get(`${backendUrl}/api/models/all`);
        setModels(modelsResponse.data.models);
        setFilteredModels(modelsResponse.data.models);
        toast.success('Model updated successfully');
      }
    } catch (error) {
      console.error('Error updating model:', error);
      toast.error('Failed to update model');
    }
    
    setIsEditModalOpen(false);
  };

  // Delete a model
  const handleDeleteModel = async () => {
    try {
      const response = await axios.delete(`${backendUrl}/api/models/delete/${modelToDelete}`);

      if(response.data.status === 'success') {
        setModels(models.filter(model => model._id !== modelToDelete));
        setFilteredModels(filteredModels.filter(model => model._id !== modelToDelete));
        toast.success('Model deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting model:', error);
      toast.error('Failed to delete model');
    }
    
    setIsDeleteModalOpen(false);
    setModelToDelete(null);
  };

  // Export to CSV 
  const exportToCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "ID,Name,Make\n"
      + models.map(model => `${model._id},${model.name},${model.make ? model.make.make : 'N/A'}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "car_models.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open edit modal
  const openEditModal = (model) => { 
    setCurrentModel({
      _id: model._id,
      name: model.name,
      make: model.make ? model.make._id : ''
    });
    setIsEditModalOpen(true);
  };

  // Open delete confirmation
  const openDeleteModal = (id) => {
    setModelToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // Generate page numbers for pagination
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Car Models Management</h1>
          <p className="text-gray-600 mt-2">Manage your car models with ease</p>
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
                placeholder="Search models by name or make..."
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
                Add Model
              </button>
            </div>
          </div>
        </div>

        {/* Models Table */}
        <div className="bg-white shadow-md rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Model Name
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
                {currentModels.length > 0 ? (
                  currentModels.map((model, index) => (
                    <tr key={model._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {indexOfFirstItem + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {model.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {model.make ? model.make.make : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(model)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                            title="Edit model"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(model._id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                            title="Delete model"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <AlertCircle className="h-12 w-12 mb-2 text-gray-300" />
                        <p className="text-lg font-medium">No models found</p>
                        <p className="text-sm">Try adding a new model or adjusting your search</p>
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
                      {indexOfLastItem > filteredModels.length ? filteredModels.length : indexOfLastItem}
                    </span>{' '}
                    of <span className="font-medium">{filteredModels.length}</span> results
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

        {/* Add Model Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white border border-gray-300 rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Add New Model</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Model Name</label>
                <input
                  type="text"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={newModel.name}
                  onChange={(e) => setNewModel({...newModel, name: e.target.value})}
                  placeholder="Enter model name"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
                <select
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={newModel.make}
                  onChange={(e) => setNewModel({...newModel, make: e.target.value})}
                >
                  <option value="">Select a make</option>
                  {makes.map(make => (
                    <option key={make._id} value={make._id}>{make.make}</option>
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
                  onClick={handleAddModel}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add Model
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Model Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white border border-gray-300 rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Edit Model</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Model Name</label>
                <input
                  type="text"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={currentModel.name}
                  onChange={(e) => setCurrentModel({...currentModel, name: e.target.value})}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
                <select
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={currentModel.make}
                  onChange={(e) => setCurrentModel({...currentModel, make: e.target.value})}
                >
                  <option value="">Select a make</option>
                  {makes.map(make => (
                    <option key={make._id} value={make._id}>{make.make}</option>
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
                  onClick={handleUpdateModel}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Update Model
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
                <p className="text-gray-600">Are you sure you want to delete this model? This action cannot be undone.</p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteModel}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Delete Model
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarModel;