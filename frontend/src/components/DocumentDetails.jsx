import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, Download, Eye, Trash2, Filter,
  Search, AlertCircle, User, Calendar, File, 
  Image, FileType, FileImage, FileArchive, FileVideo, X
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const DocumentDetails = ({ leadId }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    fileType: '',
    search: ''
  });
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Add ref for search input
  const searchInputRef = useRef(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // File type options
  const fileTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'image', label: 'Images', icon: FileImage },
    { value: 'pdf', label: 'PDFs', icon: FileText },
    { value: 'document', label: 'Documents', icon: FileType }
  ];

  // File type icons mapping
  const fileTypeIcons = {
    'image': FileImage,
    'pdf': FileText,
    'document': FileType,
    'default': File
  };

  // Fetch documents
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      
      // Build query parameters properly
      const params = new URLSearchParams();
      
      // Always include leadId if available
      if (leadId) {
        params.append('associatedLead', leadId);
      }
      
      // Add filters if they have values
      if (filters.fileType) {
        params.append('fileType', filters.fileType);
      }
      if (filters.search) {
        params.append('search', filters.search);
      }

      const response = await axios.get(`${backendUrl}/api/documents/all?${params.toString()}`);
      
      if (response.data.status === 'success') {
        setDocuments(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch documents');
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch documents');
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (leadId) {
        fetchDocuments();
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [leadId, filters]);

  // Handle search input focus
  const handleSearchContainerClick = (e) => {
    e.stopPropagation();
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Handle search input change with debouncing
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setFilters(prev => ({ ...prev, search: value }));
  };

  // Get direct file URL for download
  const getFileUrl = (document) => {
    return `${backendUrl}/uploads/documents/${document.filename}`;
  };

  // Handle document view
  const handleView = (document) => {
    if (document.fileType.startsWith('image/') || document.fileType === 'application/pdf') {
      // Open in new tab for images and PDFs
      const viewUrl = `${backendUrl}/api/documents/${document._id}/view`;
      window.open(viewUrl, '_blank');
    } else {
      // For other file types, trigger download
      const fileUrl = getFileUrl(document);
      window.open(fileUrl, '_blank');
    }
  };

  // Handle document deletion
  const handleDeleteDocument = async (documentId) => {
    try {
      const response = await axios.delete(`${backendUrl}/api/documents/${documentId}`);
      
      if (response.data.status === 'success') {
        toast.success('Document deleted successfully');
        setShowDeleteConfirm(false);
        setDocumentToDelete(null);
        fetchDocuments(); // Refresh the list
      }
    } catch (error) {
      toast.error('Failed to delete document');
      console.error('Error deleting document:', error);
    }
  };

  // View document details
  const handleViewDetails = (document) => {
    setSelectedDocument(document);
    setShowDocumentPreview(true);
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get file type icon
  const getFileTypeIcon = (fileType) => {
    if (fileType.startsWith('image/')) return FileImage;
    if (fileType === 'application/pdf') return FileText;
    if (fileType.includes('word') || fileType.includes('document')) return FileType;
    if (fileType.includes('excel') || fileType.includes('sheet')) return FileType;
    if (fileType.includes('zip') || fileType.includes('archive')) return FileArchive;
    if (fileType.startsWith('video/')) return FileVideo;
    return File;
  };

  // Get readable file type
  const getReadableFileType = (fileType) => {
    if (fileType.startsWith('image/')) {
      return 'Image';
    } else if (fileType === 'application/pdf') {
      return 'PDF';
    } else if (fileType.includes('word')) {
      return 'Word Document';
    } else if (fileType.includes('excel') || fileType.includes('sheet')) {
      return 'Excel Document';
    } else if (fileType === 'text/plain') {
      return 'Text File';
    } else if (fileType.includes('zip') || fileType.includes('archive')) {
      return 'Archive';
    } else {
      return 'Document';
    }
  };

  // Clear search
  const clearSearch = () => {
    setFilters(prev => ({ ...prev, search: '' }));
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Loading documents...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-700">{error}</p>
        <button 
          onClick={fetchDocuments}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Documents</h2>
          <p className="text-sm text-gray-600">
            {documents.length} document{documents.length !== 1 ? 's' : ''} found
            {filters.search && ` for "${filters.search}"`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div 
            className="cursor-text"
            onClick={handleSearchContainerClick}
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by title, filename..."
                value={filters.search}
                onChange={handleSearchChange}
                className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-text"
              />
              {filters.search && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* File Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">File Type</label>
            <select
              value={filters.fileType}
              onChange={(e) => setFilters(prev => ({ ...prev, fileType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {fileTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ fileType: '', search: '' })}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 w-full"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {documents.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No documents found</p>
            <p className="text-gray-400 text-sm">
              {filters.search || filters.fileType
                ? 'Try adjusting your filters' 
                : 'No documents have been uploaded for this lead yet'
              }
            </p>
            {(filters.search || filters.fileType) && (
              <button
                onClick={() => setFilters({ fileType: '', search: '' })}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-6/12">
                    Document
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                    Size
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">
                    Uploaded
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map((document) => {
                  const FileIcon = getFileTypeIcon(document.fileType);
                  const fileUrl = getFileUrl(document);

                  return (
                    <tr key={document._id} className="hover:bg-gray-50">
                      {/* Document Column */}
                      <td className="px-4 py-3">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 rounded-lg bg-blue-100 text-blue-600 flex-shrink-0">
                            <FileIcon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate" title={document.title}>
                              {document.title}
                            </p>
                            <p className="text-xs text-gray-500 truncate mt-1" title={document.originalName}>
                              {document.originalName}
                            </p>
                            <div className="flex items-center mt-1 text-xs text-gray-400">
                              <User className="h-3 w-3 mr-1" />
                              {document.uploadedBy?.username || 'Unknown'}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Type Column */}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {getReadableFileType(document.fileType)}
                        </span>
                      </td>
                      
                      {/* Size Column */}
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-500 whitespace-nowrap">
                          {formatFileSize(document.fileSize)}
                        </div>
                      </td>
                      
                      {/* Uploaded Column */}
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 whitespace-nowrap">
                          {formatDate(document.createdAt)}
                        </div>
                      </td>
                      
                      {/* Actions Column */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end space-x-1">
                          <button
                            onClick={() => handleViewDetails(document)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          {/* Direct download link */}
                          <a
                            href={fileUrl}
                            download={document.originalName}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
                            title="Download document"
                            onClick={(e) => {
                              e.stopPropagation();
                              toast.success('Download started');
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </a>
                          
                          <button
                            onClick={() => {
                              setDocumentToDelete(document);
                              setShowDeleteConfirm(true);
                            }}
                            className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                            title="Delete document"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Document Details Modal */}
      {showDocumentPreview && selectedDocument && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowDocumentPreview(false)}></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block relative align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  onClick={() => setShowDocumentPreview(false)}
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Document Details
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Title</label>
                        <p className="text-sm text-gray-900 mt-1 break-words">{selectedDocument.title}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Filename</label>
                        <p className="text-sm text-gray-900 mt-1 break-words">{selectedDocument.originalName}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">File Type</label>
                        <p className="text-sm text-gray-900 mt-1">
                          {getReadableFileType(selectedDocument.fileType)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">File Size</label>
                        <p className="text-sm text-gray-900 mt-1">
                          {formatFileSize(selectedDocument.fileSize)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Uploaded</label>
                        <p className="text-sm text-gray-900 mt-1">
                          {formatDate(selectedDocument.createdAt)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Uploaded By</label>
                        <p className="text-sm text-gray-900 mt-1">
                          {selectedDocument.uploadedBy?.username || 'Unknown'}
                        </p>
                      </div>
                    </div>

                    {/* Preview for images */}
                    {selectedDocument.fileType.startsWith('image/') && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Preview</label>
                        <div className="mt-2 border rounded-lg p-2 bg-gray-50">
                          <img 
                            src={getFileUrl(selectedDocument)}
                            alt={selectedDocument.title}
                            className="max-h-64 mx-auto object-contain rounded"
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCA2MEgxMjBWODBIMzBWOTBIMTIwVjExMEg4MFY2MFoiIGZpbGw9IiM5Q0EwQTYiLz4KPC9zdmc+';
                            }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-4">
                      {/* Direct download link in modal */}
                      <a
                        href={getFileUrl(selectedDocument)}
                        download={selectedDocument.originalName}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm transition-colors"
                        onClick={() => toast.success('Download started')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && documentToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowDeleteConfirm(false)}></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Delete Document
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete the document "{documentToDelete.title}"? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => handleDeleteDocument(documentToDelete._id)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDocumentToDelete(null);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentDetails;