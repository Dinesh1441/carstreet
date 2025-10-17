import React, { useState, useEffect } from 'react';
import { 
  FileText, User, Calendar, Clock, 
  Download, Trash2, Edit, Plus,
  Search, Filter, X, Eye,
  Paperclip, AlertCircle, MoreVertical
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const NoteDetails = ({ leadId }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'newest'
  });
  const [selectedNote, setSelectedNote] = useState(null);
  const [showNoteDetails, setShowNoteDetails] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Fetch notes
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/notes/lead/${leadId}`);
      
      if (response.data.status === 'success') {
        setNotes(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch notes');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch notes');
      toast.error('Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (leadId) {
      fetchNotes();
    }
  }, [leadId]);

  // Handle note deletion
  const handleDeleteNote = async (noteId) => {
    try {
      const response = await axios.delete(`${backendUrl}/api/notes/${noteId}`);
      
      if (response.data.status === 'success') {
        toast.success('Note deleted successfully');
        setShowDeleteConfirm(false);
        setNoteToDelete(null);
        fetchNotes(); // Refresh the list
      }
    } catch (error) {
      toast.error('Failed to delete note');
      console.error('Error deleting note:', error);
    }
  };

  // View note details
  const handleViewNote = (note) => {
    setSelectedNote(note);
    setShowNoteDetails(true);
  };

  // Download attachment
  const handleDownloadAttachment = (attachmentUrl) => {
    // Create a temporary link to trigger download
    const link = document.createElement('a');
    link.href = `${backendUrl}/${attachmentUrl}`;
    link.target = '_blank';
    link.download = attachmentUrl.split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Filter and sort notes
  const filteredAndSortedNotes = notes
    .filter(note => {
      if (!filters.search) return true;
      
      const searchTerm = filters.search.toLowerCase();
      return (
        note.noteText.toLowerCase().includes(searchTerm) ||
        (note.createdBy?.name && note.createdBy.name.toLowerCase().includes(searchTerm)) ||
        (note.createdBy?.email && note.createdBy.email.toLowerCase().includes(searchTerm))
      );
    })
    .sort((a, b) => {
      if (filters.sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (filters.sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      return 0;
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Loading notes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-700">{error}</p>
        <button 
          onClick={fetchNotes}
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
          <h2 className="text-xl font-semibold text-gray-800">Notes</h2>
          <p className="text-sm text-gray-600">
            {notes.length} note{notes.length !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Notes</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search in notes..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ search: '', sortBy: 'newest' })}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 w-full"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Notes List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredAndSortedNotes.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No notes found</p>
            <p className="text-gray-400 text-sm">
              {filters.search 
                ? 'Try adjusting your search terms' 
                : 'No notes have been added for this lead yet'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredAndSortedNotes.map((note) => (
              <div key={note._id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {/* Note Content */}
                    <div className="mb-3">
                        {note.noteText && (
                        <div 
                            className="text-sm text-gray-500 truncate mt-1"
                            dangerouslySetInnerHTML={{ __html: note.noteText }}
                        />
                        )}
                      {/* <p className="text-gray-800 whitespace-pre-wrap">{note.noteText}</p> */}
                    </div>

                    {/* Attachments */}
                    {note.attachments && note.attachments.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <Paperclip className="h-4 w-4 mr-1" />
                          <span>Attachments ({note.attachments.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {note.attachments.map((attachment, index) => (
                            <button
                              key={index}
                              onClick={() => handleDownloadAttachment(attachment)}
                              className="flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100 transition-colors"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              {attachment.split('/').pop()}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        <span>By {note.createdBy?.name || 'Unknown User'}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{formatDate(note.createdAt)}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{formatTime(note.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleViewNote(note)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => {
                        setNoteToDelete(note);
                        setShowDeleteConfirm(true);
                      }}
                      className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                      title="Delete note"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Note Details Modal */}
      {showNoteDetails && selectedNote && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowNoteDetails(false)}></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block relative align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  onClick={() => setShowNoteDetails(false)}
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Note Details
                  </h3>
                  
                  <div className="space-y-6">
                    {/* Note Content */}
                    <div>
                      <label className="text-sm font-medium text-gray-500">Note Content</label>
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                                {selectedNote.noteText && (
                        <div 
                            className="text-sm text-gray-500 truncate mt-1"
                            dangerouslySetInnerHTML={{ __html: selectedNote.noteText }}
                        />
                        )}

                      
                      </div>
                    </div>

                    {/* Attachments */}
                    {selectedNote.attachments && selectedNote.attachments.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 mb-2 block">
                          Attachments ({selectedNote.attachments.length})
                        </label>
                        <div className="space-y-2">
                          {selectedNote.attachments.map((attachment, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center">
                                <Paperclip className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-700 truncate max-w-xs">
                                  {attachment.split('/').pop()}
                                </span>
                              </div>
                              <button
                                onClick={() => handleDownloadAttachment(attachment)}
                                className="flex items-center px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Created By</label>
                        <p className="text-sm text-gray-900 mt-1">
                          {selectedNote.createdBy?.name || 'Unknown User'}
                        </p>
                        {selectedNote.createdBy?.email && (
                          <p className="text-xs text-gray-500">{selectedNote.createdBy.email}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500">Created On</label>
                        <p className="text-sm text-gray-900 mt-1">
                          {formatDate(selectedNote.createdAt)} at {formatTime(selectedNote.createdAt)}
                        </p>
                      </div>

                      {selectedNote.updatedAt && selectedNote.updatedAt !== selectedNote.createdAt && (
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium text-gray-500">Last Updated</label>
                          <p className="text-sm text-gray-900 mt-1">
                            {formatDate(selectedNote.updatedAt)} at {formatTime(selectedNote.updatedAt)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && noteToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowDeleteConfirm(false)}></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block relative align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Delete Note
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this note? This action cannot be undone.
                    </p>
                    {noteToDelete.attachments && noteToDelete.attachments.length > 0 && (
                      <p className="text-sm text-orange-600 mt-2">
                        This note has {noteToDelete.attachments.length} attachment(s) that will also be deleted.
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => handleDeleteNote(noteToDelete._id)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setNoteToDelete(null);
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

export default NoteDetails;