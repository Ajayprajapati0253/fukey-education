import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import type { Student } from '../types';
import { buildEnrolledCourseWithStats } from '../data/courseSyllabusData';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: Omit<Student, 'id' | 'sn'>) => void;
}

const LABEL = 'block text-xs font-medium text-[#0f172a] dark:text-gray-300 mb-1';

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    course: 'Class 10th (All Subjects)',
    accessPeriod: '1 Year',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    class: '10th',
    age: '15',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    country: 'India',
    address: '',
    bio: '',
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Please fill in required fields (Name, Email, Phone).');
      return;
    }

    setLoading(true);

    const initials = formData.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const now = new Date();
    const joinedAt = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const accessUntilDate = new Date();
    if (formData.accessPeriod === '3 Months') {
      accessUntilDate.setMonth(accessUntilDate.getMonth() + 3);
    } else if (formData.accessPeriod === '6 Months') {
      accessUntilDate.setMonth(accessUntilDate.getMonth() + 6);
    } else if (formData.accessPeriod === '2 Years') {
      accessUntilDate.setFullYear(accessUntilDate.getFullYear() + 2);
    } else {
      accessUntilDate.setFullYear(accessUntilDate.getFullYear() + 1);
    }
    const accessUntil = accessUntilDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    onAdd({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      initials,
      avatarBgColor: 'bg-blue-600',
      gender: formData.gender,
      class: formData.class,
      age: Number(formData.age) || 18,
      bio: formData.bio || 'New student at Fukey Education.',
      country: formData.country,
      state: formData.state,
      city: formData.city,
      address: formData.address || `${formData.city}, ${formData.state}, ${formData.country}`,
      joinedAt,
      joinedTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      accessUntil,
      accessPeriodLabel: `(${formData.accessPeriod})`,
      status: 'Active',
      progress: 0,
      totalCourses: 1,
      certificates: 0,
      primaryCourse: formData.course,
      additionalCoursesCount: 0,
      courses: [
        buildEnrolledCourseWithStats({
          id: `c_${Date.now()}`,
          name: formData.course,
          status: 'Active',
          enrolledAt: joinedAt,
          endsAt: accessUntil,
          category: formData.course.includes('Class 9th') || formData.course.includes('Class 10th') ? 'Secondary School' : 'Senior Secondary',
          progress: 0,
        }),
      ],
    });

    setLoading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Student" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className={LABEL}>Full Name *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Rahul Sharma"
              required
            />
          </div>

          <div>
            <label className={LABEL}>Email Address *</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. rahul@example.com"
              required
            />
          </div>

          <div>
            <label className={LABEL}>Phone Number *</label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98765 00000"
              required
            />
          </div>

          <div>
            <label className={LABEL}>Course *</label>
            <Select
              value={formData.course}
              onChange={(e) => setFormData({ ...formData, course: e.target.value })}
            >
              <option value="Class 9th (All Subjects)">Class 9th (All Subjects)</option>
              <option value="Class 9th (Science & Maths)">Class 9th (Science & Maths)</option>
              <option value="Class 10th (All Subjects)">Class 10th (All Subjects)</option>
              <option value="Class 10th (Maths & Science)">Class 10th (Maths & Science)</option>
              <option value="Class 11th (Science - PCM)">Class 11th (Science - PCM)</option>
              <option value="Class 11th (Science - PCB)">Class 11th (Science - PCB)</option>
              <option value="Class 11th (Commerce)">Class 11th (Commerce)</option>
              <option value="Class 11th (Arts / Humanities)">Class 11th (Arts / Humanities)</option>
              <option value="Class 12th (Science - PCM)">Class 12th (Science - PCM)</option>
              <option value="Class 12th (Science - PCB)">Class 12th (Science - PCB)</option>
              <option value="Class 12th (Commerce)">Class 12th (Commerce)</option>
              <option value="Class 12th (Arts / Humanities)">Class 12th (Arts / Humanities)</option>
            </Select>
          </div>

          <div>
            <label className={LABEL}>Access Validity</label>
            <Select
              value={formData.accessPeriod}
              onChange={(e) => setFormData({ ...formData, accessPeriod: e.target.value })}
            >
              <option value="3 Months">3 Months</option>
              <option value="6 Months">6 Months</option>
              <option value="1 Year">1 Year</option>
              <option value="2 Years">2 Years</option>
            </Select>
          </div>

          <div>
            <label className={LABEL}>Class / Standard</label>
            <Select
              value={formData.class}
              onChange={(e) => setFormData({ ...formData, class: e.target.value })}
            >
              <option value="9th">9th Standard</option>
              <option value="10th">10th Standard</option>
              <option value="11th">11th Standard</option>
              <option value="12th">12th Standard</option>
            </Select>
          </div>
        </div>

        <div>
          <label className={LABEL}>Address / City</label>
          <Input
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="e.g. Bhopal, Madhya Pradesh, India"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e2e8f0] dark:border-[#334155]">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={loading}>
            Create Student
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddStudentModal;