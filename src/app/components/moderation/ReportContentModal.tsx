// src/app/components/moderation/ReportContentModal.tsx (MOD-01)
import React, { useState } from 'react';
import { X, Flag, Loader } from 'lucide-react';
import ModerationService, { ReportType, ReportContentParams } from '../../services/v2/ModerationService';

const REPORT_TYPES: ReportType[] = ['Inappropriate', 'Spam', 'Copyright', 'Harassment', 'Other'];

interface ReportContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: ReportContentParams['reported_content_type'];
  contentId: number;
}

const ReportContentModal: React.FC<ReportContentModalProps> = ({
  isOpen,
  onClose,
  contentType,
  contentId,
}) => {
  const [reportType, setReportType] = useState<ReportType>('Inappropriate');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await ModerationService.reportContent({
        reported_content_type: contentType,
        reported_content_id: contentId,
        report_type: reportType,
        description: description.trim() || undefined,
      });
      setSubmitted(true);
    } catch {
      setError('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setReportType('Inappropriate');
    setDescription('');
    setSubmitted(false);
    setError(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        className="w-full max-w-md rounded-xl border border-[var(--ugflix-border,#1e1e1e)] bg-[var(--ugflix-bg,#0a0a0a)] p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Flag size={18} className="text-[var(--color-brand-red,#E50914)]" />
            <h2 id="report-modal-title" className="text-base font-semibold text-white">
              Report Content
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-[var(--ugflix-text-muted,#888)] hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
              <Flag size={22} className="text-green-400" />
            </div>
            <p className="text-white font-medium mb-1">Report submitted</p>
            <p className="text-sm text-[var(--ugflix-text-muted,#888)]">
              Our team will review it shortly.
            </p>
            <button
              onClick={handleClose}
              className="mt-4 px-5 py-2 rounded-lg bg-[var(--ugflix-bg-secondary,#161616)] text-sm text-white hover:opacity-80 transition-opacity"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Report type */}
            <div>
              <label className="block text-xs font-medium text-[var(--ugflix-text-muted,#888)] mb-1.5">
                Reason
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as ReportType)}
                className="w-full rounded-lg bg-[var(--ugflix-bg-secondary,#161616)] border border-[var(--ugflix-border,#1e1e1e)] text-white text-sm px-3 py-2 outline-none focus:border-[var(--color-brand-red,#E50914)] transition-colors"
              >
                {REPORT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-[var(--ugflix-text-muted,#888)] mb-1.5">
                Additional details <span className="text-[var(--ugflix-text-muted,#888)] font-normal">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue…"
                rows={3}
                className="w-full rounded-lg bg-[var(--ugflix-bg-secondary,#161616)] border border-[var(--ugflix-border,#1e1e1e)] text-white text-sm px-3 py-2 outline-none focus:border-[var(--color-brand-red,#E50914)] placeholder:text-[var(--ugflix-text-muted,#888)] resize-none transition-colors"
              />
            </div>

            {error && (
              <p className="text-xs text-red-400">{error}</p>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2 rounded-lg bg-[var(--ugflix-bg-secondary,#161616)] text-sm text-white hover:opacity-80 transition-opacity"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2 rounded-lg bg-[var(--color-brand-red,#E50914)] text-sm text-white disabled:opacity-60 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                {submitting && <Loader size={14} className="animate-spin" />}
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportContentModal;
