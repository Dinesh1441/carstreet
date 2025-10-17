import React, { useState } from 'react';
import { X, Paperclip, Send } from 'lucide-react';

const EmailDrawer = ({ onClose, lead }) => {
  const [email, setEmail] = useState({
    to: lead.email || '',
    subject: '',
    body: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmail(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    console.log('Sending email:', email);
    // Add API call here
    onClose();
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Send Email</h2>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
          <input 
            type="email" 
            name="to"
            value={email.to}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Recipient email"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <input 
            type="text" 
            name="subject"
            value={email.subject}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Email subject"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea 
            name="body"
            value={email.body}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows="8"
            placeholder="Your message"
          ></textarea>
        </div>
        
        <div>
          <button className="flex items-center text-sm text-blue-600 hover:text-blue-800">
            <Paperclip className="h-4 w-4 mr-1" />
            Attach files
          </button>
        </div>
      </div>
      
      <div className="mt-auto pt-6 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Send className="h-4 w-4 mr-2" />
          Send Email
        </button>
      </div>
    </div>
  );
};

export default EmailDrawer;