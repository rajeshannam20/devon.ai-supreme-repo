
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { GitRepository } from '@/services/git';
import { GitCommit, Github } from 'lucide-react';

interface PushChangesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRepo: GitRepository | null;
  loading: boolean;
  commitMessage: string;
  setCommitMessage: (message: string) => void;
  onPushChanges: () => void;
}

const PushChangesDialog = ({
  isOpen,
  onOpenChange,
  selectedRepo,
  loading,
  commitMessage,
  setCommitMessage,
  onPushChanges,
}: PushChangesDialogProps) => {
  if (!selectedRepo) return null;

  // Check if this is a GitHub repository
  const isGitHub = selectedRepo.url.includes('github.com');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isGitHub ? <Github className="h-5 w-5" /> : <GitCommit className="h-5 w-5" />}
            Push Changes to {isGitHub ? 'GitHub' : 'Git'}
          </DialogTitle>
          <DialogDescription>
            Push your changes to {selectedRepo.name} on {isGitHub ? 'GitHub' : 'Git'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="commit-message">Commit Message</Label>
            <Input
              id="commit-message"
              placeholder="Enter commit message"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
            />
          </div>
          
          {isGitHub && selectedRepo.accessToken && (
            <div className="rounded-md bg-green-50 p-2 text-green-800 text-sm">
              Using authenticated GitHub access for this repository.
            </div>
          )}
          
          {isGitHub && !selectedRepo.accessToken && (
            <div className="rounded-md bg-amber-50 p-2 text-amber-800 text-sm">
              No GitHub token provided. Using public access.
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            onClick={onPushChanges} 
            disabled={loading || !commitMessage}
            className={isGitHub ? "bg-[#2da44e] hover:bg-[#2c974b]" : ""}
          >
            {loading ? 'Pushing...' : isGitHub ? 'Push to GitHub' : 'Push Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PushChangesDialog;
