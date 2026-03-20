// src/app/pages/account/AccountBlockedUsersPage.tsx (MOD-05)
import React, { useState, useEffect } from 'react';
import ModerationService, { BlockedUser } from '../../services/v2/ModerationService';
import { UserX, Loader, ShieldCheck } from 'lucide-react';

const AccountBlockedUsersPage: React.FC = () => {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [unblockedIds, setUnblockedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    ModerationService.getBlockedUsers()
      .then((data) => setBlockedUsers(data.items))
      .catch(() => setBlockedUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const handleUnblock = async (entry: BlockedUser) => {
    const confirmed = window.confirm(`Unblock ${entry.blocked_user.name}?`);
    if (!confirmed) return;
    try {
      await ModerationService.unblockUser(entry.blocked_user.id);
      setUnblockedIds((prev) => new Set([...prev, entry.id]));
    } catch {
      alert('Failed to unblock user. Please try again.');
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <UserX size={20} className="text-[var(--color-brand-red,#E50914)]" />
        Blocked Users
      </h2>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="animate-spin text-[var(--color-brand-red,#E50914)]" size={28} />
        </div>
      ) : blockedUsers.length === 0 ? (
        <div className="text-center py-12">
          <ShieldCheck size={40} className="mx-auto mb-3 text-gray-600" />
          <p className="text-gray-400">You haven't blocked anyone.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {blockedUsers.map((entry) => {
            const isUnblocked = unblockedIds.has(entry.id);
            return (
              <li
                key={entry.id}
                className="flex items-center justify-between gap-4 bg-[var(--ugflix-bg-secondary,#161616)] rounded-lg px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  {entry.blocked_user.avatar ? (
                    <img
                      src={entry.blocked_user.avatar}
                      alt={entry.blocked_user.name}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold text-white">
                      {entry.blocked_user.name[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className={`text-sm font-medium ${isUnblocked ? 'text-gray-500 line-through' : 'text-white'}`}>
                      {entry.blocked_user.name}
                    </p>
                    {entry.reason && (
                      <p className="text-xs text-gray-500 mt-0.5">{entry.reason}</p>
                    )}
                  </div>
                </div>
                {!isUnblocked ? (
                  <button
                    onClick={() => handleUnblock(entry)}
                    className="text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded-lg px-3 py-1.5 transition-colors"
                  >
                    Unblock
                  </button>
                ) : (
                  <span className="text-xs text-green-400">Unblocked</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default AccountBlockedUsersPage;
