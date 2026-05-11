import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Sparkles, User as UserIcon, Ticket as TicketIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';

/**
 * A single chat message bubble.
 * - User messages: right-aligned, green
 * - Bot messages: left-aligned, white card with AI avatar
 */
export default function MessageBubble({ message, onCreateTicket, showAvatar = true }) {
  const isUser = message.role === 'user';
  const ts = message.timestamp ? new Date(message.timestamp) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && showAvatar && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-green-700 flex items-center justify-center text-white shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
      )}
      {!isUser && !showAvatar && <div className="w-7 flex-shrink-0" />}

      <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
            isUser
              ? 'bg-green-700 text-white rounded-br-sm'
              : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-headings:my-1 prose-headings:text-gray-900">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}

          {!isUser && message.suggest_ticket && (
            <Button
              size="sm"
              onClick={() => onCreateTicket?.({
                title: message.suggested_title,
                description: message.suggested_description,
              })}
              className="mt-2 bg-green-700 hover:bg-green-800 text-white text-xs h-7"
            >
              <TicketIcon className="w-3 h-3 mr-1" />
              Create Ticket
            </Button>
          )}
        </div>

        {ts && (
          <span className="text-[10px] text-gray-400 mt-0.5 px-1">
            {format(ts, 'HH:mm')}
          </span>
        )}
      </div>

      {isUser && showAvatar && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 shadow-sm">
          <UserIcon className="w-3.5 h-3.5" />
        </div>
      )}
      {isUser && !showAvatar && <div className="w-7 flex-shrink-0" />}
    </motion.div>
  );
}