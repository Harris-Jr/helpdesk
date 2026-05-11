import React, { useState } from 'react';
import { Feedback } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, MessageSquare } from 'lucide-react';

export default function FeedbackForm({ user }) {
  const [type, setType] = useState('General Praise');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      await Feedback.create({
        type,
        content: content.trim(),
        page_url: window.location.href,
        status: 'New',
      });
      setDone(true);
      setContent('');
    } catch (e) {
      alert('Failed to submit feedback. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="w-5 h-5 text-green-700" />
          Share Feedback
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {done ? (
          <div className="flex items-center gap-2 text-green-700 text-sm">
            <CheckCircle className="w-4 h-4" />
            Thanks — your feedback was submitted.
          </div>
        ) : (
          <>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Bug Report">Bug Report</SelectItem>
                <SelectItem value="Feature Request">Feature Request</SelectItem>
                <SelectItem value="General Praise">General Praise</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tell us what you think, suggestions, or issues..."
              rows={3}
            />
            <Button
              onClick={submit}
              disabled={submitting || !content.trim()}
              className="bg-green-700 hover:bg-green-800 text-white"
            >
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
