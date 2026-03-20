// src/app/components/auth/LegalConsentModal.tsx (LEGAL-01)
import React, { useState } from 'react';
import { Shield, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import ModerationService from '../../services/v2/ModerationService';

interface LegalConsentModalProps {
  onConsented: () => void;
}

const LegalConsentModal: React.FC<LegalConsentModalProps> = ({ onConsented }) => {
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await ModerationService.submitLegalConsent(true);
      onConsented();
    } catch {
      setError('Failed to save consent. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.92)' }}
    >
      <div className="w-full max-w-md rounded-2xl border border-[var(--ugflix-border,#1e1e1e)] bg-[var(--ugflix-bg,#0a0a0a)] p-7 shadow-2xl">
        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-full bg-[var(--color-brand-red,#E50914)]/10 flex items-center justify-center">
            <Shield size={28} className="text-[var(--color-brand-red,#E50914)]" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-white text-center mb-2">
          Terms & Privacy Policy
        </h2>
        <p className="text-sm text-[var(--ugflix-text-muted,#888)] text-center mb-6">
          Before continuing, please review and agree to our policies.
        </p>

        {/* Scrollable policy summary */}
        <div className="bg-[var(--ugflix-bg-secondary,#161616)] rounded-xl p-4 text-xs text-gray-400 leading-relaxed max-h-36 overflow-y-auto mb-6 space-y-2">
          <p>
            By using Katogo, you agree to our{' '}
            <Link to="/terms" target="_blank" className="text-[var(--color-brand-red,#E50914)] hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" target="_blank" className="text-[var(--color-brand-red,#E50914)] hover:underline">
              Privacy Policy
            </Link>.
          </p>
          <p>
            Your data is used to personalise your experience and improve our service.
            We do not sell your personal information to third parties.
          </p>
          <p>
            Katogo content is licensed for personal, non-commercial viewing only.
            Redistribution or unauthorised sharing is prohibited.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="flex items-start gap-3 mb-5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 accent-[var(--color-brand-red,#E50914)] w-4 h-4 shrink-0"
            />
            <span className="text-sm text-gray-300">
              I have read and agree to the{' '}
              <Link to="/terms" target="_blank" className="text-[var(--color-brand-red,#E50914)] hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" target="_blank" className="text-[var(--color-brand-red,#E50914)] hover:underline">
                Privacy Policy
              </Link>
            </span>
          </label>

          {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

          <button
            type="submit"
            disabled={!agreed || submitting}
            className="w-full py-3 rounded-xl bg-[var(--color-brand-red,#E50914)] text-white font-semibold text-sm disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            {submitting && <Loader size={16} className="animate-spin" />}
            Continue to Katogo
          </button>
        </form>
      </div>
    </div>
  );
};

export default LegalConsentModal;
