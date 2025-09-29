
import React, { useState } from 'react';
import PushChangesDialog from '../PushChangesDialog';
import { GitRepository } from '@/services/git';

interface PushChangesDialogContainerProps {
  selectedRepo: GitRepository | null;
  loading: boolean;
  onPushChanges: (repo: GitRepository, message: string) => Promise<boolean>;
  onClose: () => void;
  isOpen: boolean;
}

const PushChangesDialogContainer: React.FC<PushChangesDialogContainerProps> = ({ 
  selectedRepo, 
  loading, 
  onPushChanges, 
  onClose, 
  isOpen 
}) => {
  const [commitMessage, setCommitMessage] = useState('');

  const handlePushChanges = async () => {
    if (!selectedRepo) return;
    
    // Check if it's a GitHub repository
    const isGitHub = selectedRepo.url.includes('github.com');
    console.log(`Preparing to push to ${isGitHub ? 'GitHub' : 'Git'} repository: ${selectedRepo.name}`);
    
    const success = await onPushChanges(selectedRepo, commitMessage);
    if (success) {
      setCommitMessage('');
      onClose();
      
      // Log success information
      console.log(`Successfully pushed changes to ${isGitHub ? 'GitHub' : 'Git'} repository: ${selectedRepo.name}`);
    }
  };

  return (
    <PushChangesDialog
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      selectedRepo={selectedRepo}
      loading={loading}
      commitMessage={commitMessage}
      setCommitMessage={setCommitMessage}
      onPushChanges={handlePushChanges}
    />
  );
};

export default PushChangesDialogContainer;
