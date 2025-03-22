import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_TICKET_BY_ID } from '../graphql/queries';
import { REPLY_TO_TICKET } from '../graphql/mutations';
import { useParams } from 'react-router-dom';

function formatTimestamp(ts) {
    if (!ts) return 'N/A';
    // If purely digits => parse as integer (epoch ms)
    if (/^\d+$/.test(ts)) {
      const ms = Number(ts);
      if (!isNaN(ms)) {
        const d = new Date(ms);
        if (!isNaN(d.getTime())) {
          return d.toLocaleString();
        }
      }
      return 'N/A';
    }
    // Otherwise handle potential ISO with +00:00
    let trimmed = ts.trim();
    if (trimmed.endsWith('+00:00')) {
      trimmed = trimmed.replace('+00:00', 'Z');
    }
    const d = new Date(trimmed);
    if (isNaN(d.getTime())) {
      return 'N/A';
    }
    return d.toLocaleString();
  }

export default function SupportTicketPage() {
  const { ticketId } = useParams();
  const { data, loading, error, refetch } = useQuery(GET_TICKET_BY_ID, {
    variables: { ticketId }
  });

  const [replyText, setReplyText] = useState('');
  const [replyToTicket] = useMutation(REPLY_TO_TICKET);

  if (loading) return <div>Loading ticket...</div>;
  if (error) return <div className="alert alert-danger">{error.message}</div>;

  const ticket = data.getTicketById;

  if (!ticket) {
    return <div className="alert alert-warning">Ticket not found.</div>;
  }

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      await replyToTicket({
        variables: { input: { ticketId, message: replyText } }
      });
      setReplyText('');
      // refetch ticket to show new message
      refetch();
    } catch (err) {
      console.error(err);
      // handle error
    }
  };

  return (
    <div className="container my-4" style={{ maxWidth: '700px' }}>
      <h2>Ticket #{ticket.ticketRef}</h2>
      <p><strong>Subject:</strong> {ticket.subject}</p>
      <p><strong>Status:</strong> {ticket.status}</p>
      <p><strong>Department:</strong> {ticket.department}</p>
      <td><strong>Created:</strong> {formatTimestamp(ticket.createdAt)}</td>
      <hr />
      <h4>Thread</h4>
      {ticket.messages.map((msg, idx) => (
        <div key={idx} className="mb-2">
          <strong>{msg.sender}</strong> <em> {formatTimestamp(msg.postedAt)}</em>
          <p>{msg.text}</p>
        </div>
      ))}

      <hr />
      <form onSubmit={handleReply}>
        <label className="form-label">Reply</label>
        <textarea
          className="form-control"
          rows="3"
          value={replyText}
          onChange={e => setReplyText(e.target.value)}
        />
        <button className="btn btn-primary mt-2">
          Send Reply
        </button>
      </form>
    </div>
  );
}
