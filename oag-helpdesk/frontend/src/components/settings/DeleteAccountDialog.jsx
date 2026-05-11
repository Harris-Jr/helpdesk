import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { User } from '@/api/entities';
import { signOut } from '@/lib/auth';

/**
 * Delete Account confirmation dialog.
 * Requires typing "DELETE" to enable the destructive action.
 */
export default function DeleteAccountDialog({ open, onOpenChange, userEmail }) {
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const canDelete = confirmText.trim().toUpperCase() === 'DELETE' && !deleting;

  const handleDelete = async () => {
    setError('');
    setDeleting(true);
    try {
      // Try to remove the user record if we can find it
      try {
        const matches = await User.filter({ email: userEmail });
        if (matches && matches.length > 0) {
          await User.delete(matches[0].id);
        }
      } catch {}
      // Clear local session and sign out
      await signOut();
    } catch {
      setError('Failed to delete account. Please contact your administrator.');
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!deleting) { setConfirmText(''); setError(''); onOpenChange(o); } }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Delete Account
          </DialogTitle>
          <DialogDescription>
            This action is permanent and cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
            <p className="font-medium mb-1">You are about to delete:</p>
            <p className="font-mono text-xs">{userEmail}</p>
            <ul className="mt-2 list-disc list-inside text-xs space-y-0.5">
              <li>Your account will be permanently removed</li>
              <li>You will be signed out immediately</li>
              <li>Your submitted tickets will remain in the system</li>
            </ul>
          </div>

          <div>
            <Label className="text-sm">Type <span className="font-mono font-bold">DELETE</span> to confirm</Label>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="mt-1 font-mono"
              disabled={deleting}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={!canDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              {deleting ? 'Deleting...' : 'Delete My Account'}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
