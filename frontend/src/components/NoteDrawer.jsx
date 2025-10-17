  import React, { useRef, useState } from 'react';
  import { X, Paperclip, Image, FileText } from 'lucide-react';
  import Quill from 'quill';
  import 'quill/dist/quill.snow.css';

  const NoteDrawer = ({ onClose, lead, onAddNote }) => {
    const [noteContent, setNoteContent] = useState('');
    const [attachments, setAttachments] = useState([]);
    const quillRef = useRef(null);
    const fileInputRef = useRef(null);

    // Initialize Quill editor
    React.useEffect(() => {
      if (quillRef.current && !quillRef.current.quill) {
        const quill = new Quill(quillRef.current, {
          theme: 'snow',
          modules: {
            toolbar: [
              ['bold', 'italic', 'underline'],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              ['link'],
              ['clean']
            ]
          },
          placeholder: 'Write your note here...',
        });
        
        quill.on('text-change', () => {
          setNoteContent(quill.root.innerHTML);
        });
        
        quillRef.current.quill = quill;
      }
    }, []);

    const handleFileUpload = (e) => {
      const files = Array.from(e.target.files);
      const newAttachments = files.map(file => ({
        file,
        type: file.type.startsWith('image/') ? 'image' : 'document',
        name: file.name,
        size: file.size,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
      }));
      
      setAttachments([...attachments, ...newAttachments]);
    };

    const removeAttachment = (index) => {
      const newAttachments = [...attachments];
      if (newAttachments[index].preview) {
        URL.revokeObjectURL(newAttachments[index].preview);
      }
      newAttachments.splice(index, 1);
      setAttachments(newAttachments);
    };

    const handleSubmit = () => {
      onAddNote(noteContent, attachments);
      onClose();
    };

    return (
      <div className="p-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Add Note</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mb-4">
          <div 
            ref={quillRef}
            className="mb-4"
          ></div>
        </div>
        
        <div className="mt-10 relative">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Attachments</h3>
          
          {attachments.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              {attachments.map((attachment, index) => (
                <div key={index} className="relative border rounded-lg p-2">
                  {attachment.type === 'image' ? (
                    <div className="flex flex-col items-center">
                      <img 
                        src={attachment.preview} 
                        alt={attachment.name}
                        className="h-16 w-16 object-cover rounded-md mb-1"
                      />
                      <p className="text-xs text-gray-600 truncate w-full text-center">{attachment.name}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <FileText className="h-10 w-10 text-gray-400 mb-1" />
                      <p className="text-xs text-gray-600 truncate w-full text-center">{attachment.name}</p>
                    </div>
                  )}
                  <button
                    onClick={() => removeAttachment(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current.click()}
              className="flex-1 flex justify-center items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <Paperclip className="h-4 w-4 mr-2" />
              Add Attachment
            </button>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-auto">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            disabled={!noteContent.trim() && attachments.length === 0}
          >
            Add Note
          </button>
        </div>
      </div>
    );
  };

  export default NoteDrawer;