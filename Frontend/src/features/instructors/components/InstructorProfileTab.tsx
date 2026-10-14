import { useState } from 'react';
import {
  User,
  MapPin,
  FileText,
  Share2,
  Linkedin,
  Youtube,
  Code2,
  Clock,
  ExternalLink,
  Plus,
  X,
  GraduationCap,
  Radio,
  Globe
} from 'lucide-react';
import type { Instructor, SocialLinks } from '../types/instructor';

interface InstructorProfileTabProps {
  instructor: Instructor;
  onUpdateField: <K extends keyof Instructor>(key: K, value: Instructor[K]) => void;
  onUpdateSocialLink: (platform: keyof SocialLinks, value: string) => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export function InstructorProfileTab({
  instructor,
  onUpdateField,
  onUpdateSocialLink,
  onShowToast,
}: InstructorProfileTabProps) {
  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [showSkillInput, setShowSkillInput] = useState(false);
  const [showLangInput, setShowLangInput] = useState(false);

  const handleAddSkill = () => {
    if (newSkill.trim() && !instructor.skills.includes(newSkill.trim())) {
      onUpdateField('skills', [...instructor.skills, newSkill.trim()]);
      setNewSkill('');
      setShowSkillInput(false);
      onShowToast('Skill added', 'success');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    onUpdateField(
      'skills',
      instructor.skills.filter((s) => s !== skillToRemove)
    );
  };

  const handleAddLanguage = () => {
    if (newLanguage.trim() && !instructor.languages.includes(newLanguage.trim())) {
      onUpdateField('languages', [...instructor.languages, newLanguage.trim()]);
      setNewLanguage('');
      setShowLangInput(false);
      onShowToast('Language added', 'success');
    }
  };

  const handleRemoveLanguage = (langToRemove: string) => {
    onUpdateField(
      'languages',
      instructor.languages.filter((l) => l !== langToRemove)
    );
  };

  return (
    <div className="space-y-5">
      {/* Row 1: Basic Information (Full Width) */}
      <div className="bg-white dark:bg-[#111c34] border border-slate-200/80 dark:border-[#1e2c4c] rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-[#1e2c4c]">
          <User className="w-4 h-4 text-blue-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Basic Information
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={instructor.name}
              onChange={(e) => onUpdateField('name', e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Designation */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Designation
            </label>
            <input
              type="text"
              value={instructor.designation}
              onChange={(e) => onUpdateField('designation', e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Email <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              value={instructor.email}
              onChange={(e) => onUpdateField('email', e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Subject / Specialization */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Subject / Specialization
            </label>
            <input
              type="text"
              value={instructor.subject}
              onChange={(e) => onUpdateField('subject', e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Phone <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={instructor.phone}
              onChange={(e) => onUpdateField('phone', e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Experience */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Experience
            </label>
            <input
              type="text"
              value={instructor.experience}
              onChange={(e) => onUpdateField('experience', e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Gender
            </label>
            <select
              value={instructor.gender}
              onChange={(e) =>
                onUpdateField('gender', e.target.value as 'Male' | 'Female' | 'Other')
              }
              className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Qualification */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Qualification
            </label>
            <input
              type="text"
              value={instructor.qualification}
              onChange={(e) => onUpdateField('qualification', e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Date of Birth
            </label>
            <input
              type="text"
              value={instructor.dateOfBirth}
              onChange={(e) => onUpdateField('dateOfBirth', e.target.value)}
              placeholder="e.g. 15 Aug 1992"
              className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Teaching Medium (Hindi & English Both) */}
          <div className="sm:col-span-1 lg:col-span-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Teaching Medium <span className="text-rose-500">*</span>
            </label>
            <select
              value={instructor.teachingMedium || 'Hindi & English Both'}
              onChange={(e) =>
                onUpdateField('teachingMedium', e.target.value as any)
              }
              className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="Hindi & English Both">Hindi & English Both (हिंदी और इंग्लिश दोनों)</option>
              <option value="Hindi Medium">Hindi Medium (हिंदी माध्यम)</option>
              <option value="English Medium">English Medium (अंग्रेजी माध्यम)</option>
            </select>
          </div>

          {/* Classes Taught (9th to 12th) */}
          <div className="sm:col-span-2 lg:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Classes Taught (9th to 12th) <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              {['9th', '10th', '11th', '12th'].map((cls) => {
                const isChecked = instructor.classesTaught?.includes(cls) ?? true;
                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => {
                      const current = instructor.classesTaught || ['9th', '10th', '11th', '12th'];
                      const updated = isChecked
                        ? current.filter((c) => c !== cls)
                        : [...current, cls];
                      onUpdateField('classesTaught', updated.length > 0 ? updated : [cls]);
                    }}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Class {cls}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Location Details */}
      <div className="bg-white dark:bg-[#111c34] border border-slate-200/80 dark:border-[#1e2c4c] rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-[#1e2c4c]">
          <MapPin className="w-4 h-4 text-rose-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Location Details
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Country <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={instructor.country}
              onChange={(e) => onUpdateField('country', e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              State <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={instructor.state}
              onChange={(e) => onUpdateField('state', e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              City <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={instructor.city}
              onChange={(e) => onUpdateField('city', e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Address
          </label>
          <textarea
            rows={2}
            value={instructor.address}
            onChange={(e) => onUpdateField('address', e.target.value)}
            className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg p-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Row 3: Professional Information */}
      <div className="bg-white dark:bg-[#111c34] border border-slate-200/80 dark:border-[#1e2c4c] rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-[#1e2c4c]">
          <FileText className="w-4 h-4 text-emerald-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Professional Information
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left Column: Bios */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Short Bio
              </label>
              <textarea
                rows={2}
                value={instructor.shortBio}
                onChange={(e) => onUpdateField('shortBio', e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg p-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Bio <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                value={instructor.fullBio}
                onChange={(e) => onUpdateField('fullBio', e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg p-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Right Column: Teaching Experience, Skills, Languages */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Teaching Experience
              </label>
              <input
                type="text"
                value={instructor.experience}
                onChange={(e) => onUpdateField('experience', e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Skills */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Skills
                </label>
                <button
                  type="button"
                  onClick={() => setShowSkillInput(!showSkillInput)}
                  className="text-[11px] font-bold text-blue-500 hover:text-blue-400 inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Skill</span>
                </button>
              </div>

              {showSkillInput && (
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Enter skill name..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                    className="flex-1 text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg px-3 py-1.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {instructor.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Languages
                </label>
                <button
                  type="button"
                  onClick={() => setShowLangInput(!showLangInput)}
                  className="text-[11px] font-bold text-blue-500 hover:text-blue-400 inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Language</span>
                </button>
              </div>

              {showLangInput && (
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Enter language..."
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddLanguage()}
                    className="flex-1 text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg px-3 py-1.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddLanguage}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {instructor.languages.map((lang) => (
                  <span
                    key={lang}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    <span>{lang}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLanguage(lang)}
                      className="hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Social Links */}
      <div className="bg-white dark:bg-[#111c34] border border-slate-200/80 dark:border-[#1e2c4c] rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-[#1e2c4c]">
          <Share2 className="w-4 h-4 text-sky-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Social Links
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* LinkedIn */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              LinkedIn
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3 text-blue-500">
                <Linkedin className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={instructor.socialLinks.linkedin || ''}
                onChange={(e) => onUpdateSocialLink('linkedin', e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg pl-9 pr-9 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {instructor.socialLinks.linkedin && (
                <a
                  href={instructor.socialLinks.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute right-2.5 p-1 text-slate-400 hover:text-blue-500 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
            </div>

          {/* YouTube */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              YouTube
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3 text-rose-500">
                <Youtube className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={instructor.socialLinks.youtube || ''}
                onChange={(e) => onUpdateSocialLink('youtube', e.target.value)}
                placeholder="https://youtube.com/@channel"
                className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg pl-9 pr-9 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {instructor.socialLinks.youtube && (
                <a
                  href={instructor.socialLinks.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute right-2.5 p-1 text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* GitHub */}
            <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                GitHub
                </label>

                <div className="relative flex items-center">
                    <div className="absolute left-3 text-slate-400">
                    <Code2 className="w-4 h-4" />
                    </div>

                    <input
                    type="text"
                    value={instructor.socialLinks.github || ''}
                    onChange={(e) => onUpdateSocialLink('github', e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg pl-9 pr-9 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {instructor.socialLinks.github && (
                    <a
                        href={instructor.socialLinks.github}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute right-2.5 p-1 text-slate-400 hover:text-white transition-colors"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    )}
                </div>
            </div>

          {/* Website */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Website
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3 text-emerald-500">
                <Globe className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={instructor.socialLinks.website || ''}
                onChange={(e) => onUpdateSocialLink('website', e.target.value)}
                placeholder="https://www.example.com"
                className="w-full text-xs bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-[#203158] rounded-lg pl-9 pr-9 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {instructor.socialLinks.website && (
                <a
                  href={instructor.socialLinks.website}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute right-2.5 p-1 text-slate-400 hover:text-emerald-500 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Row 5: Recent Activity (Matching Reference 2 bottom section) */}
      <div className="bg-white dark:bg-[#111c34] border border-slate-200/80 dark:border-[#1e2c4c] rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-[#1e2c4c]">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Recent Activity
            </h3>
          </div>
          <button
            type="button"
            className="text-xs font-semibold text-blue-500 hover:text-blue-400 transition-colors cursor-pointer"
          >
            View All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Activity 1: Profile updated */}
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-[#0b1329] border border-slate-200/70 dark:border-[#1e2c4c] flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Profile updated
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                Instructor updated their profile information
              </div>
              <div className="text-[10px] text-slate-400 mt-1">2 hours ago</div>
            </div>
          </div>

          {/* Activity 2: Course assigned */}
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-[#0b1329] border border-slate-200/70 dark:border-[#1e2c4c] flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Course assigned
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                Assigned 'Advanced Physics' course
              </div>
              <div className="text-[10px] text-slate-400 mt-1">5 hours ago</div>
            </div>
          </div>

          {/* Activity 3: Live class created */}
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-[#0b1329] border border-slate-200/70 dark:border-[#1e2c4c] flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-purple-500/10 text-purple-500 dark:bg-purple-500/20 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
              <Radio className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Live class created
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                Created live class 'Thermodynamics - Part 2'
              </div>
              <div className="text-[10px] text-slate-400 mt-1">1 day ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
