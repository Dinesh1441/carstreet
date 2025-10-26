import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Edit,
  Trash2,
  Download,
  X,
  Image as ImageIcon,
  FileText,
  Car,
  IndianRupee,
  BookOpen,
  FileCheck,
  Shield,
  Plus,
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useTable, useSortBy, usePagination, useFilters } from 'react-table';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { useAuth } from '../contexts/AuthContext';

const ManageCar = () => {
  const backend_url = import.meta.env.VITE_BACKEND_URL;

  // Data and loading state
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [totalCars, setTotalCars] = useState(0);

  // Modal and editing state
  const [showModal, setShowModal] = useState(false);
  const [editingCar, setEditingCar] = useState(null);

  // Dropdown data
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [variants, setVariants] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedVariant, setSelectedVariant] = useState('');

  // Image/document preview and refs
  const imageInputRef = useRef(null);
  const documentInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [documentPreview, setDocumentPreview] = useState(null);

  // react-table state
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSizes] = useState(10);
  const [sortBy, setSortBy] = useState([]);
  const [filters, setFilters] = useState({});
  const [globalSearch, setGlobalSearch] = useState('');
  const { isSuperAdmin, token } = useAuth();

  // Fetch brands, models, and variants
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        // Fetch brands
        const brandsResponse = await axios.get(`${backend_url}/api/makes/all`, { headers: { 'Authorization': `Bearer ${token}` } });
        setBrands(brandsResponse.data.makes || []);

        // Fetch models
        const modelsResponse = await axios.get(`${backend_url}/api/models/all`, { headers: { 'Authorization': `Bearer ${token}` } });
        setModels(modelsResponse.data.models || []);

        // Fetch variants
        const variantsResponse = await axios.get(`${backend_url}/api/variants/all`, { headers: { 'Authorization': `Bearer ${token}` } });
        setVariants(variantsResponse.data.variants || []);
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
        toast.error('Failed to load dropdown data');
      }
    };

    fetchDropdownData();
  }, [backend_url]);

  // Filter models based on selected brand
  const filteredModels = useMemo(() => {
    if (!selectedBrand) return models;
    return models.filter(model => model.make?._id === selectedBrand);
  }, [models, selectedBrand]);

  // Filter variants based on selected model
  const filteredVariants = useMemo(() => {
    if (!selectedModel) return variants;
    return variants.filter(variant => variant.model?._id === selectedModel);
  }, [variants, selectedModel]);

  // Column filter UI component
  function ColumnFilter({ column: { filterValue, setFilter } }) {
    return (
      <input
        value={filterValue || ''}
        onChange={e => setFilter(e.target.value || undefined)}
        placeholder="Search..."
        className="border rounded px-2 py-1 text-sm w-full"
      />
    );
  }

  // Define columns
  const columns = useMemo(
    () => [
      { 
        Header: 'Brand', 
        accessor: 'brand.make',
        Filter: ColumnFilter,
        Cell: ({ value }) => value || 'N/A'
      },
      { 
        Header: 'Model', 
        accessor: 'model.name',
        Filter: ColumnFilter,
        Cell: ({ value }) => value || 'N/A'
      },
      { 
        Header: 'Variant', 
        accessor: 'variant.name',
        Filter: ColumnFilter,
        Cell: ({ value }) => value || 'N/A'
      },
      { Header: 'Color', accessor: 'color', Filter: ColumnFilter },
      { Header: 'Car Type', accessor: 'carType', Filter: ColumnFilter },
      { Header: 'Manufacturing Year', accessor: 'manufacturingYear', Filter: ColumnFilter },
      { Header: 'Registration Year', accessor: 'registrationYear', Filter: ColumnFilter },
      { Header: 'Number of Owners', accessor: 'numberOfOwners', Filter: ColumnFilter },
      { Header: 'Kilometers Driven', accessor: 'kilometersDriven', Filter: ColumnFilter },
      { Header: 'Fuel Type', accessor: 'fuelType', Filter: ColumnFilter },
      { Header: 'Registration State', accessor: 'registrationState', Filter: ColumnFilter },
      { Header: 'Registration Number', accessor: 'registrationNumber', Filter: ColumnFilter },
      { Header: 'Insurance Validity', accessor: 'insuranceValidity', Filter: ColumnFilter },
      { Header: 'Insurance Type', accessor: 'insuranceType', Filter: ColumnFilter },
      { Header: 'Warranty Validity', accessor: 'warrantyValidity', Filter: ColumnFilter },
      { Header: 'Status', accessor: 'status', Filter: ColumnFilter },
      {
        Header: 'Asking Price',
        accessor: 'askingPrice',
        Filter: ColumnFilter,
        Cell: ({ value }) => `$${value?.toLocaleString()}`,
      },
      {
        Header: 'Actions',
        accessor: '_id',
        disableSortBy: true,
        disableFilters: true,
        Cell: ({ row }) => (
          <div className="flex space-x-2">
            <button
              onClick={() => editCar(row.original)}
              className="text-blue-600 hover:text-blue-900"
              title="Edit"
              type="button"
            >
              <Edit className="h-5 w-5" />
            </button>
            {isSuperAdmin && (<button
              onClick={() => confirmDelete(row.original._id)}
              className="text-red-600 hover:text-red-900"
              title="Delete"
              type="button"
            >
              <Trash2 className="h-5 w-5" />
            </button> )}
          </div>
        ),
      },
    ],
    []
  );

  // Fetch data from backend
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pageIndex + 1,
        limit: pageSize,
        sortBy: 'createdAt',
      };

      if (sortBy.length > 0) {
        params.sortBy = sortBy[0].id;
        params.sortOrder = sortBy[0].desc ? 'desc' : 'asc';
      }

      // Add global search parameter
      if (globalSearch) {
        params.search = globalSearch;
      }

      // Add column filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });

      const res = await axios.get(`${backend_url}/api/cars`, { params,
        headers: { 'Authorization': `Bearer ${token}` } 

       });

      if (res.data.status === 'success') {
        setData(res.data.data.cars);
        setPageCount(res.data.data.pagination.totalPages);
        setTotalCars(res.data.data.pagination.totalCars);
      } else {
        toast.error('Failed to fetch cars');
      }
    } catch (error) {
      toast.error(error.message || 'Error fetching cars');
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize, sortBy, filters, globalSearch, backend_url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // react-table instance
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex: tablePageIndex, pageSize: tablePageSize, sortBy: tableSortBy, filters: tableFilters },
  } = useTable(
    {
      columns,
      data,
      manualPagination: true,
      pageCount,
      manualSortBy: true,
      manualFilters: true,
      initialState: { pageIndex, pageSize },
    },
    useFilters,
    useSortBy,
    usePagination
  );

  // Sync react-table state with local state
  useEffect(() => {
    setPageIndex(tablePageIndex);
  }, [tablePageIndex]);

  useEffect(() => {
    setPageSizes(tablePageSize);
  }, [tablePageSize]);

  useEffect(() => {
    setSortBy(tableSortBy);
  }, [tableSortBy]);

  useEffect(() => {
    const filterObj = {};
    tableFilters.forEach(({ id, value }) => {
      filterObj[id] = value;
    });
    setFilters(filterObj);
  }, [tableFilters]);

  // Delete confirmation popup
  const confirmDelete = (id) => {
    confirmAlert({
      title: 'Confirm to delete',
      message: 'Are you sure you want to delete this car?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => deleteCar(id),
        },
        {
          label: 'No',
          onClick: () => {},
        },
      ],
    });
  };

  // Delete car API call
  const deleteCar = async (id) => {
    try {
      const res = await axios.delete(`${backend_url}/api/cars/delete/${id}` , { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.data.status === 'success') {
        toast.success('Car deleted successfully');
        fetchData();
      } else {
        toast.error('Failed to delete car');
      }
    } catch (error) {
      toast.error('Error deleting car: ' + (error.response?.data?.message || error.message));
    }
  };

  // Edit car handler
  const editCar = (car) => {
    setEditingCar(car);
    setSelectedBrand(car.brand?._id || '');
    setSelectedModel(car.model?._id || '');
    setSelectedVariant(car.variant?._id || '');
    setShowModal(true);
    
    if (car.photos && car.photos.length > 0) {
      setImagePreview(car.photos[0]);
    } else {
      setImagePreview(null);
    }
    if (car.documents && car.documents.length > 0) {
      setDocumentPreview({ name: car.documents[0].split('/').pop() || '' });
    } else {
      setDocumentPreview(null);
    }
  };

  // Close modal and reset states
  const closeModal = () => {
    setShowModal(false);
    setEditingCar(null);
    setSelectedBrand('');
    setSelectedModel('');
    setSelectedVariant('');
    setImagePreview(null);
    setDocumentPreview(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (documentInputRef.current) documentInputRef.current.value = '';
  };

  // Handle image change with preview
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  // Handle document change with preview
  const handleDocumentChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocumentPreview({
        name: file.name,
        type: file.type,
        size: file.size,
      });
    } else {
      setDocumentPreview(null);
    }
  };

  // Handle add/edit car submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const apiFormData = new FormData();

    // Add all form fields
    [
      'color',
      'carType',
      'manufacturingYear',
      'registrationYear',
      'numberOfOwners',
      'kilometersDriven',
      'fuelType',
      'registrationState',
      'registrationNumber',
      'insuranceValidity',
      'insuranceType',
      'warrantyValidity',
      'status',
      'askingPrice',
    ].forEach((field) => {
      apiFormData.append(field, formData.get(field));
    });

    // Add brand, model, and variant IDs
    if (selectedBrand) {
      apiFormData.append('brand', selectedBrand);
    }
    if (selectedModel) {
      apiFormData.append('model', selectedModel);
    }
    if (selectedVariant) {
      apiFormData.append('variant', selectedVariant);
    }

    if (imageInputRef.current && imageInputRef.current.files[0]) {
      apiFormData.append('carImages', imageInputRef.current.files[0]);
    }

    if (documentInputRef.current && documentInputRef.current.files[0]) {
      apiFormData.append('carDocuments', documentInputRef.current.files[0]);
    }

    try {
      const url = editingCar
        ? `${backend_url}/api/cars/${editingCar._id}`
        : `${backend_url}/api/cars/add`;

      const method = editingCar ? 'put' : 'post';

      const res = await axios[method](url, apiFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.data.status === 'success') {
        toast.success(editingCar ? 'Car updated successfully' : 'Car added successfully');
        fetchData();
        closeModal();
      } else {
        toast.error(editingCar ? 'Failed to update car' : 'Failed to add car');
      }
    } catch (error) {
      toast.error('Error saving car: ' + (error.response?.data?.message || error.message));
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    if (data.length === 0) {
      toast.info('No data to export');
      return;
    }

    const headers = [
      'Brand',
      'Model',
      'Variant',
      'Color',
      'Car Type',
      'Manufacturing Year',
      'Registration Year',
      'Number of Owners',
      'Kilometers Driven',
      'Fuel Type',
      'Registration State',
      'Registration Number',
      'Insurance Validity',
      'Insurance Type',
      'Warranty Validity',
      'Status',
      'Asking Price',
    ];

    const csvRows = [
      headers.join(','),
      ...data.map((car) =>
        headers
          .map((h) => {
            switch (h) {
              case 'Brand':
                return `"${car.brand?.make || ''}"`;
              case 'Model':
                return `"${car.model?.name || ''}"`;
              case 'Variant':
                return `"${car.variant?.name || ''}"`;
              case 'Car Type':
                return `"${car.carType}"`;
              case 'Manufacturing Year':
                return `"${car.manufacturingYear}"`;
              case 'Registration Year':
                return `"${car.registrationYear}"`;
              case 'Number of Owners':
                return `"${car.numberOfOwners}"`;
              case 'Kilometers Driven':
                return `"${car.kilometersDriven}"`;
              case 'Registration State':
                return `"${car.registrationState}"`;
              case 'Registration Number':
                return `"${car.registrationNumber}"`;
              case 'Insurance Validity':
                return `"${car.insuranceValidity}"`;
              case 'Insurance Type':
                return `"${car.insuranceType}"`;
              case 'Warranty Validity':
                return `"${car.warrantyValidity}"`;
              case 'Asking Price':
                return `"${car.askingPrice}"`;
              default:
                return `"${car[h.toLowerCase()] || ''}"`;
            }
          })
          .join(',')
      ),
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', 'cars_export.csv');
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen md:py-0 py-6">
      <div className="mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Car Management</h1>
          
          {/* Global Search */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Global search..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex space-x-2">
              {isSuperAdmin && (
                <button
                  onClick={exportToCSV}
                  className="flex items-center w-full px-4 py-2 justify-center bg-blue-600 text-white rounded hover:bg-blue-700"
                  title="Export to CSV"
                  type="button"
                >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button> )}
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center px-4 w-full md:min-w-max justify-center py-2 bg-green-600 text-white rounded hover:bg-green-700"
                title="Add New Car"
                type="button"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Car
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table {...getTableProps()} className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                  {headerGroup.headers.map((column) => (
                    <th
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      key={column.id}
                      className="px-6 py-3 text-left min-w-[200px] text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <div className="flex w-full items-center justify-between mb-1">
                        {column.render('Header')}
                        <span>
                          {column.isSorted ? (column.isSortedDesc ? ' ↓' : ' ↑') : ''}
                        </span>
                      </div>
                      <div>{column.canFilter ? column.render('Filter') : null}</div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="text-center p-4">
                    Loading...
                  </td>
                </tr>
              ) : page.length > 0 ? (
                page.map((row) => {
                  prepareRow(row);
                  return (
                    <tr {...row.getRowProps()} key={row.id} className="hover:bg-gray-50">
                      {row.cells.map((cell) => (
                        <td
                          {...cell.getCellProps()}
                          key={cell.column.id}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                          {cell.render('Cell')}
                        </td>
                      ))}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={columns.length} className="text-center p-4 text-gray-500">
                    No cars found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex md:items-center justify-between py-3">
          <div>
            <button
              onClick={() => gotoPage(0)}
              disabled={!canPreviousPage}
              className="btn px-3 py-1 border rounded mr-1 disabled:opacity-50"
              type="button"
            >
              {'<<'}
            </button>
            <button
              onClick={() => previousPage()}
              disabled={!canPreviousPage}
              className="btn px-3 py-1 border rounded mr-1 disabled:opacity-50"
              type="button"
            >
              {'<'}
            </button>
            <button
              onClick={() => nextPage()}
              disabled={!canNextPage}
              className="btn px-3 py-1 border rounded mr-1 disabled:opacity-50"
              type="button"
            >
              {'>'}
            </button>
            <button
              onClick={() => gotoPage(pageCount - 1)}
              disabled={!canNextPage}
              className="btn px-3 py-1 border rounded disabled:opacity-50"
              type="button"
            >
              {'>>'}
            </button>
            <span className="md:ml-4 md:inline block">
              Page <strong>{pageIndex + 1} of {pageCount}</strong>
            </span>
          </div>
          <div>
            <select
              value={pageSize}
              onChange={(e) => setPageSizes(Number(e.target.value))}
              className="border rounded px-2 py-1"
              aria-label="Select page size"
            >
              {[10, 20, 30, 50].map((size) => (
                <option key={size} value={size}>
                  Show {size}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Add/Edit Car Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50  overflow-auto">
          <div className="bg-white rounded-lg hide-scrollbar shadow-xl border border-gray-300 max-w-3xl w-full max-h-screen overflow-y-auto h-[95vh]">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <Car className="h-6 w-6 mr-2 text-blue-600" />
                {editingCar ? 'Edit Car Details' : 'Add New Car'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close modal"
                type="button"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
<form onSubmit={handleSubmit} className="p-6 space-y-6">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Basic Information */}
    <div className="space-y-3">
      <h4 className="text-lg font-medium text-gray-900 flex items-center">
        <Car className="h-5 w-5 mr-2 text-blue-500" />
        Basic Information
      </h4>

      {/* Brand Dropdown */}
      <label className="block text-sm font-medium text-gray-700">Brand</label>
      <select
        value={selectedBrand}
        onChange={(e) => {
          setSelectedBrand(e.target.value);
          setSelectedModel('');
          setSelectedVariant('');
        }}
        required
        className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      >
        <option value="">Select Brand</option>
        {brands.map((brand) => (
          <option key={brand._id} value={brand._id}>
            {brand.make}
          </option>
        ))}
      </select>

      {/* Model Dropdown */}
      <label className="block text-sm font-medium text-gray-700">Model</label>
      <select
        value={selectedModel}
        onChange={(e) => {
          setSelectedModel(e.target.value);
          setSelectedVariant('');
        }}
        required
        disabled={!selectedBrand}
        className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      >
        <option value="">Select Model</option>
        {filteredModels.map((model) => (
          <option key={model._id} value={model._id}>
            {model.name}
          </option>
        ))}
      </select>

      {/* Variant Dropdown */}
      <label className="block text-sm font-medium text-gray-700">Variant</label>
      <select
        value={selectedVariant}
        onChange={(e) => setSelectedVariant(e.target.value)}
        required
        disabled={!selectedModel}
        className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      >
        <option value="">Select Variant</option>
        {filteredVariants.map((variant) => (
          <option key={variant._id} value={variant._id}>
            {variant.name}
          </option>
        ))}
        <option value="other">Other</option>
      </select>

      <label className="block text-sm font-medium text-gray-700">Color</label>
      <input
        type="text"
        name="color"
        defaultValue={editingCar?.color || ''}
        required
        placeholder="Color"
        className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      />

      <label className="block text-sm font-medium text-gray-700">Car Type</label>
      <select
        name="carType"
        defaultValue={editingCar?.carType || ''}
        required
        className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      >
        <option value="">Select Car Type</option>
        <option value="Automatic">Automatic</option>
        <option value="Manual">Manual</option>
      </select>
    </div>

    {/* Specifications */}
    <div className="space-y-3">
      <h4 className="text-lg font-medium text-gray-900 flex items-center">
        <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
        Specifications
      </h4>

      <label className="block text-sm font-medium text-gray-700">Manufacturing Year</label>
      <input
        type="month"
        name="manufacturingYear"
        defaultValue={editingCar?.manufacturingYear || ''}
        required
        className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      />

      <label className="block text-sm font-medium text-gray-700">Registration Year</label>
      <input
        type="month"
        name="registrationYear"
        defaultValue={editingCar?.registrationYear || ''}
        required
        className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      />

      <label className="block text-sm font-medium text-gray-700">Number of Owners</label>
      
      <select
        name="numberOfOwners"
        defaultValue={editingCar?.numberOfOwners || ''}
        required
        className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      >
        <option value="">Select Number of Owners</option>
        <option value="1st">1st</option>
        <option value="2nd">2nd</option>
        <option value="3rd">3rd</option>
        <option value="4th">4th</option>
      </select>

      <label className="block text-sm font-medium text-gray-700">Kilometers Driven</label>
      <input
        type="text"
        name="kilometersDriven"
        defaultValue={editingCar?.kilometersDriven || ''}
        required
        placeholder="Kilometers Driven"
        className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      />

      <label className="block text-sm font-medium text-gray-700">Fuel Type</label>
      <select
        name="fuelType"
        defaultValue={editingCar?.fuelType || ''}
        required
        className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      >
        <option value="">Select Fuel Type</option>
        <option value="Diesel">Diesel</option>
        <option value="Electric">Electric</option>
        <option value="Hybrid">Hybrid</option>
        <option value="Petrol">Petrol</option>
        <option value="Petrol Hybrid">Petrol Hybrid</option>
      </select>
    </div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Registration Details */}
    <div className="space-y-4">
      <h4 className="text-lg font-medium text-gray-900 flex items-center">
        <FileCheck className="h-5 w-5 mr-2 text-blue-500" />
        Registration Details
      </h4>

      <label className="block text-sm font-medium text-gray-700">Registration State</label>
      <input
        type="text"
        name="registrationState"
        defaultValue={editingCar?.registrationState || ''}
        required
        placeholder="Registration State"
        className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      />

      <label className="block text-sm font-medium text-gray-700">Registration Number</label>
      <input
        type="text"
        name="registrationNumber"
        defaultValue={editingCar?.registrationNumber || ''}
        required
        placeholder="Registration Number"
        className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      />
    </div>

    {/* Insurance & Warranty */}
    <div className="space-y-4">
      <h4 className="text-lg font-medium text-gray-900 flex items-center">
        <Shield className="h-5 w-5 mr-2 text-blue-500" />
        Insurance & Warranty
      </h4>

      <label className="block text-sm font-medium text-gray-700">Insurance Validity</label>
      <input
        type="text"
        name="insuranceValidity"
        defaultValue={editingCar?.insuranceValidity || ''}
        required
        placeholder="Insurance Validity"
        className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      />

      <label className="block text-sm font-medium text-gray-700">Insurance Type</label>
      <select
        name="insuranceType"
        defaultValue={editingCar?.insuranceType || ''}
        required
        className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      >
        <option value="">Select Insurance Type</option>
        <option value="No Insurance">No Insurance</option>
        <option value="Comprehensive">Comprehensive</option>
        <option value="Zero-Depreciation">Zero-Depreciation</option>
        <option value="Third Party">Third Party</option>
      </select>

      <label className="block text-sm font-medium text-gray-700">Warranty Validity</label>
      <input
        type="text"
        name="warrantyValidity"
        defaultValue={editingCar?.warrantyValidity || ''}
        required
        placeholder="Warranty Validity"
        className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      />
    </div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Pricing & Status */}
    <div className="space-y-4">
      <h4 className="text-lg font-medium text-gray-900 flex items-center">
        <IndianRupee className="h-5 w-5 mr-2 text-blue-500" />
        Pricing & Status
      </h4>

      <label className="block text-sm font-medium text-gray-700">Asking Price</label>
      <input
        type="number"
        name="askingPrice"
        defaultValue={editingCar?.askingPrice || ''}
        required
        placeholder="Asking Price"
        className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      />

      <label className="block text-sm font-medium text-gray-700">Status</label>
      <select
        name="status"
        defaultValue={editingCar?.status || ''}
        required
        className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      >
        <option value="">Select Status</option>
        <option value="Available">Available</option>
        <option value="Sold">Sold</option>
        <option value="Reserved">Reserved</option>
        <option value="Under Maintenance">Under Maintenance</option>
      </select>
    </div>

    {/* Uploads */}
    <div className="space-y-4">
      <h4 className="text-lg font-medium text-gray-900 flex items-center">
        <ImageIcon className="h-5 w-5 mr-2 text-blue-500" />
        Uploads
      </h4>

      {/* Car Image */}
      <label className="block text-sm font-medium text-gray-700">Car Image</label>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      {imagePreview && (
        <div className="mt-2">
          <img
            src={imagePreview}
            alt="Preview"
            className="h-20 w-20 object-cover rounded border"
          />
        </div>
      )}

      {/* Car Document */}
      <label className="block text-sm font-medium text-gray-700">Car Document</label>
      <input
        ref={documentInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        onChange={handleDocumentChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      {documentPreview && (
        <div className="mt-2 flex items-center text-sm text-gray-600">
          <FileText className="h-4 w-4 mr-1" />
          {documentPreview.name}
        </div>
      )}
    </div>
  </div>

  {/* Form Actions */}
  <div className="flex justify-end space-x-3 pt-6 border-t">
    <button
      type="button"
      onClick={closeModal}
      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
    >
      Cancel
    </button>
    <button
      type="submit"
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      {editingCar ? 'Update Car' : 'Add Car'}
    </button>
  </div>
</form>

          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCar;