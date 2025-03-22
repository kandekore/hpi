import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_SUPPORT_TICKET } from '../graphql/mutations';

function SupportForm({ email }) {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [department, setDepartment] = useState('Support');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('Low');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [createTicketMutation, { loading }] = useMutation(CREATE_SUPPORT_TICKET);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name || !subject || !message) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    try {
      const { data } = await createTicketMutation({
        variables: {
          input: {
            email,
            name,
            subject,
            department,
            priority,
            message
          }
        }
      });
      if (data.createSupportTicket) {
        setSuccessMsg(
          `Ticket created! Ref #${data.createSupportTicket.ticketRef}`
        );
        // Optional: clear out fields
        setName('');
        setSubject('');
        setDepartment('Support');
        setPriority('Low');
        setMessage('');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {/* Email read-only */}
      <div className="mb-3">
        <label className="form-label">Email (cannot change)</label>
        <input
          type="email"
          className="form-control"
          value={email || ''}
          readOnly
        />
      </div>

      {/* Name */}
      <div className="mb-3">
        <label className="form-label">Your Name</label>
        <input
          type="text"
          className="form-control"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      {/* Department */}
      <div className="mb-3">
        <label className="form-label">Department</label>
        <select
          className="form-select"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        >
          <option value="Support">Support</option>
          <option value="Billing">Billing</option>
          <option value="Complaint">Complaint</option>
          <option value="Feedback">Feedback</option>
        </select>
      </div>

      {/* Priority */}
      <div className="mb-3">
        <label className="form-label">Priority</label>
        <select
          className="form-select"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Urgent">Urgent</option>
        </select>
      </div>

      {/* Subject */}
      <div className="mb-3">
        <label className="form-label">Subject</label>
        <input
          type="text"
          className="form-control"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
      </div>

      {/* Message */}
      <div className="mb-3">
        <label className="form-label">Message</label>
        <textarea
          className="form-control"
          rows="4"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading}
      >
        {loading ? 'Submitting...' : 'Submit Ticket'}
      </button>
    </form>
  );
}

export default SupportForm;
