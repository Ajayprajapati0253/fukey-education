import { useState } from 'react';
import type { FormEvent } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input, Textarea } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
// import  { Instructor } from '../types/instructor';
import { instructorApi } from '../api/instructorApi';

interface AddInstructorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddInstructorModal({ isOpen, onClose, onSuccess }: AddInstructorModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    email: '',
    phone: '',
    subject: 'Physics',
    experience: '3 Years',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    qualification: '',
    dateOfBirth: '1995-01-01',
    country: 'India',
    state: 'Madhya Pradesh',
    city: 'Bhopal',
    address: '',
    shortBio: '',
    fullBio: '',
    skills: 'Problem Solving, Communication',
    languages: 'English, Hindi',
    teachingType: 'Hybrid' as 'Online' | 'Offline' | 'Hybrid',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await instructorApi.createInstructor({
        name: formData.name,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        designation: formData.designation || `${formData.subject} Instructor`,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        experience: formData.experience,
        gender: formData.gender,
        qualification: formData.qualification || 'M.Sc., B.Ed.',
        dateOfBirth: formData.dateOfBirth,
        country: formData.country,
        state: formData.state,
        city: formData.city,
        address: formData.address,
        shortBio: formData.shortBio,
        fullBio: formData.fullBio,
        skills: formData.skills.split(',').map((s) => s.trim()).filter(Boolean),
        languages: formData.languages.split(',').map((s) => s.trim()).filter(Boolean),
        socialLinks: {},
        teachingMedium: 'Hindi & English Both',
        classesTaught: ['9th', '10th', '11th', '12th'],
        status: 'Active',
        verification: 'Verified',
        teachingType: formData.teachingType,
        coursesCount: 1,
        liveClassesDone: 0,
        totalLiveClasses: 2,
        attendancePercentage: 95,
        studentsCount: 20,
        joinedAt: 'Just now',
        lastActive: 'Active now',
        assignedCourses: [
          {
            id: `c-${Date.now()}`,
            name: `Class 10th ${formData.subject} (Hindi & English Medium)`,
            category: 'Class 10th',
            studentCount: 20,
            status: 'Active',
            classLevel: '10th',
            medium: 'Hindi & English Both',
          },
        ],
        recentActivities: [],
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Instructor"
      subtitle="Register a new faculty member with profile and subjects"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Full Name"
            requiredBadge
            required
            placeholder="e.g. Ramesh Chandra"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Designation"
            placeholder="e.g. Mathematics Instructor"
            value={formData.designation}
            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Email Address"
            type="email"
            requiredBadge
            required
            placeholder="e.g. ramesh@fukeyeducation.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            label="Phone Number"
            requiredBadge
            required
            placeholder="+91 98765 00000"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <Select
            label="Subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            options={[
              { value: 'Physics', label: 'Physics' },
              { value: 'Mathematics', label: 'Mathematics' },
              { value: 'Chemistry', label: 'Chemistry' },
              { value: 'Biology', label: 'Biology' },
              { value: 'English', label: 'English' },
              { value: 'Computer Science', label: 'Computer Science' },
              { value: 'History', label: 'History' },
              { value: 'Hindi', label: 'Hindi' },
            ]}
          />
          <Input
            label="Experience"
            placeholder="e.g. 5 Years"
            value={formData.experience}
            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
          />
          <Select
            label="Teaching Type"
            value={formData.teachingType}
            onChange={(e) =>
              setFormData({ ...formData, teachingType: e.target.value as 'Online' | 'Offline' | 'Hybrid' })
            }
            options={[
              { value: 'Hybrid', label: 'Hybrid' },
              { value: 'Online', label: 'Online' },
              { value: 'Offline', label: 'Offline' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="State"
            placeholder="Madhya Pradesh"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
          />
          <Input
            label="City"
            placeholder="Bhopal"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          />
        </div>

        <Textarea
          label="Short Bio"
          placeholder="Brief summary of teaching background and expertise..."
          rows={2}
          value={formData.shortBio}
          onChange={(e) => setFormData({ ...formData, shortBio: e.target.value })}
        />

        <div className="pt-4 border-t border-slate-200 dark:border-[#1e2c4c] flex items-center justify-end gap-2.5">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={loading}>
            Add Instructor
          </Button>
        </div>
      </form>
    </Modal>
  );
}
