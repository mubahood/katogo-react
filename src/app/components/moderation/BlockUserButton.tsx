// src/app/components/moderation/BlockUserButton.tsx (MOD-02)
import React, { useState } from 'react';
import { ShieldOff, UserX, Loader } from 'lucide-react';
import ModerationService from '../../services/v2/ModerationService';

interface BlockUserButtonProps {
  userId: number;
  userName: string;
  /** Call after a successful block */
  onBlock?: () => void;
  className?: string;
}

const BlockUserButton: React.FC<BlockUserButtonProps> = ({
  userId,
  userName,
  onBlock,
  className = '',
}) => {
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);

  const handleBlock = async () => {
    const confirmed = window.confirm(
      `Block ${userName}? They will no longer be able to send you messages.`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      await ModerationService.blockUser({ blocked_user_id: userId, block_type: 'full' });
      setBlocked(true);
      onBlock?.();
    } catch {
      alert('Failed to block user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (blocked) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs text-[var(--ugflix-text-muted,#888)] ${className}`}>
        <ShieldOff size={14} />
        Blocked
      </span>
    );
  }

  return (
    <button
      onClick={handleBlock}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 text-xs text-[var(--ugflix-text-muted,#888)] hover:text-red-400 disabled:opacity-60 transition-colors ${className}`}
      title={`Block ${userName}`}
    >
      {loading ? <Loader size={14} className="animate-spin" /> : <UserX size={14} />}
      Block
    </button>
  );
};

export default BlockUserButton;
