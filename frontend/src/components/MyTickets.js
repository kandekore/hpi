import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_MY_TICKETS } from '../graphql/queries';
import { Link } from 'react-router-dom';
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

  
export default function MyTickets() {
  const { data, loading, error } = useQuery(GET_MY_TICKETS);
// console.log('MyTickets data =>', data);
  if (loading) return <div>Loading your tickets...</div>;
  if (error) return <div className="alert alert-danger">{error.message}</div>;

  const tickets = data.getMyTickets;
// console.log('MyTickets tickets =>', tickets);
  if (!tickets.length) {
    return <p>No support tickets yet.</p>;
  }

 

  return (
    <div>
      <h3>My Support Tickets</h3>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Ref</th>
            <th>Subject</th>
            <th>Status</th>
            <th>Department</th>
            <th>Last Updated</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map(ticket => (
            <tr key={ticket.id}>
              <td>{ticket.ticketRef}</td>
              <td>{ticket.subject}</td>
              <td>{ticket.status}</td>
              <td>{ticket.department}</td>
              <td>{formatTimestamp(ticket.createdAt)}</td>

              <td>
                <Link to={`/support/ticket/${ticket.id}`}>
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
