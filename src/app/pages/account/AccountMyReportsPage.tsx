// src/app/pages/account/AccountMyReportsPage.tsx (MOD-06)
import React, { useState, useEffect } from 'react';
import ModerationService, { MyReport } from '../../services/v2/ModerationService';
import { Flag, Loader, ClipboardList } from 'lucide-react';

const STATUS_COLORS: Record<MyReport['status'], string> = {
  pending: 'bg-yellow-500/15 text-yellow-400',
  reviewed: 'bg-blue-500/15 text-blue-400',
  resolved: 'bg-green-500/15 text-green-400',
};

const AccountMyReportsPage: React.FC = () => {
  const [reports, setReports] = useState<MyReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ModerationService.getMyReports()
      .then((data) => setReports(data.items))
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <Flag size={20} className="text-[var(--color-brand-red,#E50914)]" />
        My Reports
      </h2>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="animate-spin text-[var(--color-brand-red,#E50914)]" size={28} />
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12">
          <ClipboardList size={40} className="mx-auto mb-3 text-gray-600" />
          <p className="text-gray-400">You haven't submitted any reports.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {reports.map((report) => (
            <li
              key={report.id}
              className="bg-[var(--ugflix-bg-secondary,#161616)] rounded-lg px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-white capitalize">
                      {report.report_type}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">
                      — {report.reported_content_type.replace('_', ' ')} #{report.reported_content_id}
                    </span>
                  </div>
                  {report.description && (
                    <p className="text-xs text-gray-400 truncate">{report.description}</p>
                  )}
                  <p className="text-[10px] text-gray-600 mt-1">
                    Submitted {new Date(report.created_at).toLocaleDateString('en-UG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <span className={`shrink-0 text-[11px] font-medium rounded-full px-2.5 py-0.5 capitalize ${STATUS_COLORS[report.status]}`}>
                  {report.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AccountMyReportsPage;
