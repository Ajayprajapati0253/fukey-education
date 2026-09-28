import React from 'react';
import { User, Mail, Phone, GraduationCap, Calendar, Contact, MapPin, Flag } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import type { Student } from '../types';

interface EditStudentProfileTabProps {
  student: Student;
  onChange: (updatedFields: Partial<Student>) => void;
}

const LABEL = 'block text-xs font-medium text-[#0f172a] dark:text-gray-300 mb-1.5';
const HEADER = 'flex items-center gap-2 mb-4 pb-2 border-b border-[#e2e8f0] dark:border-[#334155]';
const TITLE = 'text-sm font-semibold text-[#0f172a] dark:text-gray-100';

const STATES = [
  'Madhya Pradesh', 'Maharashtra', 'Delhi', 'Gujarat', 'Uttar Pradesh', 'Rajasthan',
  'Karnataka', 'Bihar', 'Haryana', 'Punjab', 'West Bengal',
];
const COUNTRIES = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia'];

export const EditStudentProfileTab: React.FC<EditStudentProfileTabProps> = ({ student, onChange }) => {
  return (
    <div className="space-y-6">
      <Card padding="none" className="p-5">
        <div className={HEADER}>
          <User className="w-4 h-4 text-blue-500" />
          <h3 className={TITLE}>Basic Information</h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Full Name <span className="text-rose-500">*</span></label>
              <Input icon={<User className="w-4 h-4" />} value={student.name} onChange={(e) => onChange({ name: e.target.value })} placeholder="Rohit Jain" required />
            </div>
            <div>
              <label className={LABEL}>Email <span className="text-rose-500">*</span></label>
              <Input type="email" icon={<Mail className="w-4 h-4" />} value={student.email} onChange={(e) => onChange({ email: e.target.value })} placeholder="rohitjain@gmail.com" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Phone <span className="text-rose-500">*</span></label>
              <Input icon={<Phone className="w-4 h-4" />} value={student.phone} onChange={(e) => onChange({ phone: e.target.value })} placeholder="+91 98765 43210" required />
            </div>
            <div>
              <label className={LABEL}>Gender</label>
              <Select icon={<User className="w-4 h-4" />} value={student.gender} onChange={(e) => onChange({ gender: e.target.value as 'Male' | 'Female' | 'Other' })}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Class</label>
              <Select icon={<GraduationCap className="w-4 h-4" />} value={student.class} onChange={(e) => onChange({ class: e.target.value })}>
                <option value="9th">Class 9th</option>
                <option value="10th">Class 10th</option>
                <option value="11th">Class 11th</option>
                <option value="12th">Class 12th</option>
              </Select>
            </div>
            <div>
              <label className={LABEL}>Age</label>
              <Input type="number" icon={<Calendar className="w-4 h-4" />} value={student.age} onChange={(e) => onChange({ age: e.target.value })} placeholder="17" />
            </div>
          </div>
        </div>
      </Card>

      <Card padding="none" className="p-5">
        <div className={HEADER}>
          <Contact className="w-4 h-4 text-blue-500" />
          <h3 className={TITLE}>Profile Information</h3>
        </div>
        <div>
          <label className={LABEL}>Bio</label>
          <textarea
            rows={4}
            value={student.bio}
            onChange={(e) => onChange({ bio: e.target.value })}
            placeholder="Student and learning enthusiast."
            className="w-full bg-white dark:bg-[#0F172A] border border-[#e2e8f0] dark:border-[#334155] text-[#0f172a] dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-500 text-sm rounded-lg p-3.5 outline-hidden focus:border-[#3b82f6] focus:ring-2 focus:ring-blue-500/20 resize-none leading-relaxed"
          />
        </div>
      </Card>

      <Card padding="none" className="p-5">
        <div className={HEADER}>
          <MapPin className="w-4 h-4 text-blue-500" />
          <h3 className={TITLE}>Location Details</h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={LABEL}>Country <span className="text-rose-500">*</span></label>
              <Select icon={<Flag className="w-4 h-4" />} value={student.country} onChange={(e) => onChange({ country: e.target.value })}>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className={LABEL}>State <span className="text-rose-500">*</span></label>
              <Select value={student.state} onChange={(e) => onChange({ state: e.target.value })}>
                {STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className={LABEL}>City <span className="text-rose-500">*</span></label>
              <Input value={student.city} onChange={(e) => onChange({ city: e.target.value })} placeholder="Bhopal" required />
            </div>
          </div>

          <div>
            <label className={LABEL}>Address</label>
            <Input value={student.address} onChange={(e) => onChange({ address: e.target.value })} placeholder="Bhopal, Madhya Pradesh, India" />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EditStudentProfileTab;