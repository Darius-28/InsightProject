import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

interface Ticket {
  title: string;
  description: string;
  priority: string;
  email: string;
  stepsToReproduce: string;
}

interface AttachmentInfo {
  file: File;
  preview: string;
}

const TicketForm: React.FC = () => {
  const [ticket, setTicket] = useState<Ticket>({
    title: '',
    description: '',
    priority: 'Low',
    email: '',
    stepsToReproduce: '',
  });
  const [attachments, setAttachments] = useState<AttachmentInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTicket(prevTicket => ({
      ...prevTicket,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newAttachments = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setAttachments(prevAttachments => [...prevAttachments, ...newAttachments]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prevAttachments => prevAttachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData();
      Object.entries(ticket).forEach(([key, value]) => {
        formData.append(key, value);
      });
      attachments.forEach((attachment, index) => {
        formData.append(`attachments`, attachment.file);
      });

      const response = await axios.post('http://localhost:5000/api/tickets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Ticket created:', response.data);
      alert('Ticket created successfully!');
      setTicket({ title: '', description: '', priority: 'Low', email: '', stepsToReproduce: '' });
      setAttachments([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Clear the file input
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Error creating ticket. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Cleanup function to revoke object URLs
    return () => {
      attachments.forEach(attachment => URL.revokeObjectURL(attachment.preview));
    };
  }, [attachments]);

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="title">Title:</label>
        <input
          type="text"
          id="title"
          name="title"
          value={ticket.title}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          name="description"
          value={ticket.description}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="priority">Priority:</label>
        <select
          id="priority"
          name="priority"
          value={ticket.priority}
          onChange={handleChange}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>
      </div>
      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={ticket.email}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="stepsToReproduce">Steps to Reproduce:</label>
        <textarea
          id="stepsToReproduce"
          name="stepsToReproduce"
          value={ticket.stepsToReproduce}
          onChange={handleChange}
        />
      </div>
      <div>
        <label htmlFor="attachments">Attachments:</label>
        <input
          type="file"
          id="attachments"
          name="attachments"
          onChange={handleFileChange}
          multiple
          ref={fileInputRef}
        />
      </div>
      {attachments.length > 0 && (
        <div>
          <h4>Selected Attachments:</h4>
          <ul>
            {attachments.map((attachment, index) => (
              <li key={index}>
                {attachment.file.name} ({(attachment.file.size / 1024).toFixed(2)} KB)
                <button type="button" onClick={() => removeAttachment(index)}>Remove</button>
                <img src={attachment.preview} alt="Preview" style={{maxWidth: '100px', maxHeight: '100px'}} />
              </li>
            ))}
          </ul>
        </div>
      )}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Ticket'}
      </button>
    </form>
  );
};

export default TicketForm;