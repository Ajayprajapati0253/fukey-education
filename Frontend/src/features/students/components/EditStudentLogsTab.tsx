import React from 'react';
import { Shield, Key, Bell, Smartphone, Laptop } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import type { Student } from '../types';

interface EditStudentLogsTabProps {
  student: Student;
}

const HEADER = 'flex items-center gap-2 mb-4 pb-2 border-b border-[#e2e8f0] dark:border-[#334155]';
const ROW = 'p-3 bg-slate-50 dark:bg-[#0F172A] border border-[#e2e8f0] dark:border-[#334155] rounded-xl';

export const EditStudentLogsTab: React.FC<EditStudentLogsTabProps> = ({ student }) => {
  const loginLogs = [
    {
      id: '1',
      device: 'Chrome on macOS (Ventura)',
      ip: '103.211.18.42',
      location: `${student.city}, ${student.country}`,
      time: 'Today at 10:14 AM',
      icon: Laptop,
      status: 'Success',
    },
    {
      id: '2',
      device: 'Fukey Android Mobile App v2.4',
      ip: '103.211.18.42',
      location: `${student.city}, ${student.country}`,
      time: 'Yesterday at 08:30 PM',
      icon: Smartphone,
      status: 'Success',
    },
    {
      id: '3',
      device: 'Firefox on Windows 11',
      ip: '49.36.128.91',
      location: 'New Delhi, India',
      time: '20 Jun 2026 at 04:12 PM',
      icon: Laptop,
      status: 'Success',
    },
  ];

  return (
    <div className="space-y-6">
      <Card padding="none" className="p-5">
        <div className={HEADER}>
          <Shield className="w-4 h-4 text-blue-500" />
          <h3 className="text-sm font-semibold text-[#0f172a] dark:text-gray-100">Device & Login History</h3>
        </div>

        <div className="space-y-3">
          {loginLogs.map((log) => {
            const Icon = log.icon;
            return (
              <div key={log.id} className={`${ROW} flex items-center justify-between gap-3`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[#0f172a] dark:text-gray-100 truncate">{log.device}</div>
                    <div className="text-[11px] text-[#64748b] dark:text-gray-400 mt-0.5">
                      IP: {log.ip} • {log.location}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <Badge variant="success" size="xs">{log.status}</Badge>
                  <div className="text-[11px] text-slate-400 dark:text-gray-500 mt-1">{log.time}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card padding="none" className="p-5">
        <div className={HEADER}>
          <Bell className="w-4 h-4 text-blue-500" />
          <h3 className="text-sm font-semibold text-[#0f172a] dark:text-gray-100">System Notification Logs</h3>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className={`${ROW} flex items-center justify-between`}>
            <div className="flex items-center gap-2.5 text-[#0f172a] dark:text-gray-300">
              <Key className="w-4 h-4 text-slate-400" />
              <span>Login authentication link dispatched via email</span>
            </div>
            <span className="text-slate-400 dark:text-gray-500 text-[11px]">12 Jun 2026</span>
          </div>

          <div className={`${ROW} flex items-center justify-between`}>
            <div className="flex items-center gap-2.5 text-[#0f172a] dark:text-gray-300">
              <Bell className="w-4 h-4 text-slate-400" />
              <span>Course enrollment welcome email delivered</span>
            </div>
            <span className="text-slate-400 dark:text-gray-500 text-[11px]">12 Jun 2026</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EditStudentLogsTab;