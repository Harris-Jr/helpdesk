import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export default function SaveBar({ onSave, onCancel, saved, saving }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <Button
        onClick={onSave}
        disabled={saving}
        className="bg-green-700 hover:bg-green-800 text-white"
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
      {onCancel && (
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      )}
      {saved && (
        <span className="flex items-center gap-1 text-sm text-green-700 font-medium">
          <CheckCircle2 className="w-4 h-4" /> Saved
        </span>
      )}
    </div>
  );
}