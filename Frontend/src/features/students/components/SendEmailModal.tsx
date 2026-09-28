import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import type { Student } from '../types';

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  selectedCount?: number;
  onSend: (subject: string, message: string) => void;
}

const LABEL = 'block text-xs font-medium text-[#0f172a] dark:text-gray-300 mb-1';

export const SendEmailModal: React.FC<SendEmailModalProps> = ({ isOpen, onClose, student, selectedCount, onSend }) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sentNotice, setSentNotice] = useState(false);

  if (!isOpen) return null;

  const recipient = student ? `${student.name} <${student.email}>` : `${selectedCount || 'all selected'} students`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSend(subject, body);
    setSentNotice(true);
    setTimeout(() => {
      setSentNotice(false);
      onClose();
    }, 1200);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Send Student Notification Email" maxWidth="lg">
      {sentNotice ? (
        <div className="py-8 text-center text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
          ✓ Email sent successfully!
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={LABEL}>Recipient</label>
            <div className="px-3.5 py-2 bg-slate-50 dark:bg-[#0F172A] border border-[#e2e8f0] dark:border-[#334155] rounded-lg text-xs text-[#0f172a] dark:text-gray-300">
              {recipient}
            </div>
          </div>

          <div>
            <label className={LABEL}>Subject *</label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Important Update regarding your Fukey course enrollment" required />
          </div>

          <div>
            <label className={LABEL}>Message *</label>
            <textarea
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your email announcement or reminder message here..."
              className="w-full bg-white dark:bg-[#0F172A] border border-[#e2e8f0] dark:border-[#334155] text-[#0f172a] dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-500 text-sm rounded-lg p-3 outline-hidden focus:border-[#3b82f6] focus:ring-2 focus:ring-blue-500/20 resize-none"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e2e8f0] dark:border-[#334155]">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm">Send Email</Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default SendEmailModal;