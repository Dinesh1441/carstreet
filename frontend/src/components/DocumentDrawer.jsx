import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  Image, 
  File, 
  Eye,
  Trash2,
  CheckCircle
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';


const DocumentDrawer = ({ onClose, lead, onDocumentAdded }) => {
  const [uploading, setUploading] = useState(false);
  const [document, setDocument] = useState({
    title: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
   const { user } = useAuth();

  const backend_url = import.meta.env.VITE_BACKEND_URL;

  // Supported file types
  const supportedFileTypes = {
    image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    document: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ]
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDocument(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return;
    }

    // Validate file type
    const isImage = supportedFileTypes.image.includes(file.type);
    const isDocument = supportedFileTypes.document.includes(file.type);
    
    if (!isImage && !isDocument) {
      toast.error('Please select a valid image or document file');
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }

    // Auto-fill title if empty
    if (!document.title) {
      const fileNameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
      setDocument(prev => ({
        ...prev,
        title: fileNameWithoutExtension
      }));
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (file) => {
    if (!file) return <File className="h-12 w-12 text-gray-400" />;
    
    const fileType = file.type;
    
    if (supportedFileTypes.image.includes(fileType)) {
      return <Image className="h-12 w-12 text-blue-500" />;
    } else if (fileType === 'application/pdf') {
      return <FileText className="h-12 w-12 text-red-500" />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <FileText className="h-12 w-12 text-blue-600" />;
    } else if (fileType.includes('excel') || fileType.includes('sheet')) {
      return <FileText className="h-12 w-12 text-green-600" />;
    } else {
      return <File className="h-12 w-12 text-gray-500" />;
    }
  };

  const getFileTypeLabel = (file) => {
    if (!file) return '';
    
    const fileType = file.type;
    if (supportedFileTypes.image.includes(fileType)) {
      return 'Image';
    } else if (fileType === 'application/pdf') {
      return 'PDF Document';
    } else if (fileType.includes('word')) {
      return 'Word Document';
    } else if (fileType.includes('excel')) {
      return 'Excel Document';
    } else if (fileType === 'text/plain') {
      return 'Text File';
    } else {
      return 'Document';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async () => {
    // Validation
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    if (!document.title.trim()) {
      toast.error('Please enter a document title');
      return;
    }

    try {
      setUploading(true);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('document', selectedFile);
      formData.append('title', document.title);
      formData.append('leadId', lead._id); // Add associated lead ID if provided
      formData.append('userId', user._id); // Add associated lead ID if provided
      
      if (lead?._id) {
        formData.append('associatedLead', lead._id);
      }

      // Make API call to upload document
      const response = await axios.post(`${backend_url}/api/documents/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${progress}%`);
        }
      });

      if (response.data.status === 'success') {
        toast.success('Document uploaded successfully!');
        
        // Call callback if provided
        if (onDocumentAdded) {
          onDocumentAdded(response.data.data);
        }
        
        // Reset form and close drawer
        setDocument({
          title: ''
        });
        removeFile();
        onClose();
      } else {
        toast.error(response.data.message || 'Failed to upload document');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      
      if (error.response) {
        toast.error(error.response.data?.message || 'Failed to upload document');
      } else if (error.request) {
        toast.error('Network error: Unable to connect to server');
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Add Document</h2>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
          disabled={uploading}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto">
        {/* File Upload Area */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Document *
          </label>
          
          {!selectedFile ? (
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
              <p className="text-sm text-gray-500">
                Supports: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF (Max 10MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept={[...supportedFileTypes.image, ...supportedFileTypes.document].join(',')}
              />
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              {/* File Preview */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex-shrink-0">
                  {previewUrl ? (
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="h-16 w-16 object-cover rounded border"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity rounded flex items-center justify-center">
                        <Eye className="h-6 w-6 text-white opacity-0 hover:opacity-100" />
                      </div>
                    </div>
                  ) : (
                    getFileIcon(selectedFile)
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {getFileTypeLabel(selectedFile)} • {formatFileSize(selectedFile.size)}
                  </p>
                  <div className="flex items-center mt-1">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-xs text-green-600">Ready to upload</span>
                  </div>
                </div>
                
                <button
                  onClick={removeFile}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  disabled={uploading}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              {/* Change File Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
                disabled={uploading}
              >
                Change File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept={[...supportedFileTypes.image, ...supportedFileTypes.document].join(',')}
              />
            </div>
          )}
        </div>

        {/* Document Title Only */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Document Title *
          </label>
          <input
            type="text"
            name="title"
            value={document.title}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Enter document title"
            disabled={uploading}
          />
        </div>

        {/* Lead Information (if available) */}
        {lead && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              Associated Lead
            </h3>
            <p className="text-sm text-blue-700">
              {lead.name} {lead.lastName}
            </p>
            {lead.email && (
              <p className="text-sm text-blue-600">{lead.email}</p>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="mt-auto pt-6 flex justify-end gap-3 border-t border-gray-200">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          disabled={uploading}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={uploading || !selectedFile}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default DocumentDrawer;