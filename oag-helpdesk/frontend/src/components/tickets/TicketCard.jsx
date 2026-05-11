import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Clock, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const statusStyles = {
  'Open': 'bg-blue-100 text-blue-800',
  'In Progress': 'bg-yellow-100 text-yellow-800',
  'Resolved': 'bg-green-100 text-green-800',
  'Closed': 'bg-gray-100 text-gray-800',
};

const priorityStyles = {
  'Low': 'bg-gray-100 text-gray-700',
  'Medium': 'bg-yellow-100 text-yellow-700',
  'High': 'bg-red-100 text-red-700',
};

export default function TicketCard({ ticket, detailsPath }) {
  return (
    <Link to={`${detailsPath}?id=${ticket.id}`} className="block">
      <Card className="hover:shadow-md transition-shadow border border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-gray-500">
                  {ticket.ticket_number || `#${ticket.id?.slice(-6)}`}
                </span>
                <Badge className={statusStyles[ticket.status] || statusStyles.Open}>
                  {ticket.status || 'Open'}
                </Badge>
                <Badge variant="outline" className={priorityStyles[ticket.priority] || priorityStyles.Medium}>
                  {ticket.priority || 'Medium'}
                </Badge>
              </div>
              <h3 className="font-semibold text-gray-900 truncate">{ticket.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2 mt-1">{ticket.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(new Date(ticket.created_date), { addSuffix: true })}
            </span>
            {ticket.assigned_to && (
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {ticket.assigned_to}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}