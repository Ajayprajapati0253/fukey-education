import React, { useState } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Maximize,
  Download,
  FileText,
  Star,
  Clock,
  User,
  CheckCircle,
} from 'lucide-react';
import type { CalendarLiveClass } from '../types/calendar-live-class.types';

interface CalendarViewRecordingModalProps {
  item: CalendarLiveClass | null;
  onClose: () => void;
}

export const CalendarViewRecordingModal: React.FC<CalendarViewRecordingModalProps> = ({ item, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [progressPercent, setProgressPercent] = useState<number>(24);
  const [activeChapter, setActiveChapter] = useState(1);

  if (!item) return null;

  const chapters = [
    { title: 'Intro & Recap of Previous Lecture', time: '00:00' },
    { title: 'Core Principles & Theorem Derivation', time: '12:45' },
    { title: 'Interactive Problem Solving & Examples', time: '28:10' },
    { title: 'Q&A & Student Doubt Resolution', time: '48:30' },
  ];

  return (
    <div
      id="view-recording-modal-overlay"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="view-recording-modal-card"
        className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                CLASS RECORDING
              </span>
              <span className="text-xs text-gray-400 font-mono">
                Duration: {item.recordingDuration || '58m 20s'}
              </span>
            </div>
            <h2 className="text-base font-bold text-gray-900">{item.title} — {item.courseName}</h2>
            <p className="text-xs text-gray-500">Instructor: {item.teacherName} • Held on {item.date}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Player Simulation Stage */}
        <div className="relative bg-gray-950 aspect-video w-full flex items-center justify-center overflow-hidden group">
          <div className="text-center p-6 space-y-2">
            <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white mx-auto backdrop-blur-xs shadow-xl group-hover:scale-110 transition-transform">
              {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
            </div>
            <div className="text-white font-bold text-sm tracking-wide">
              {isPlaying ? 'Playing High Definition Stream (1080p 60fps)' : 'Click to Play Session Video'}
            </div>
            <div className="text-xs text-gray-400">
              Chapter: {chapters[activeChapter - 1]?.title}
            </div>
          </div>

          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-6 text-white text-xs flex flex-col gap-2">
            <div
              className="w-full h-1.5 bg-gray-700 rounded-full cursor-pointer relative overflow-hidden"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = ((e.clientX - rect.left) / rect.width) * 100;
                setProgressPercent(Math.min(100, Math.max(0, pos)));
              }}
            >
              <div
                className="h-full bg-blue-500 rounded-full relative"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="hover:text-blue-400 transition"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => setProgressPercent((p) => Math.max(0, p - 5))}
                  className="hover:text-blue-400 transition"
                  title="Rewind 10s"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <div className="font-mono text-[11px] text-gray-300">
                  14:20 / {item.recordingDuration || '58:20'}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded text-[11px]">
                  {[1, 1.25, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setPlaybackSpeed(s)}
                      className={`px-1 rounded ${
                        playbackSpeed === s ? 'bg-blue-600 font-bold text-white' : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>

                <Volume2 className="w-4 h-4 text-gray-300" />
                <Maximize className="w-4 h-4 text-gray-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Chapters & Class Materials Row */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-gray-50/50">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" /> Key Chapters
            </h4>
            <div className="space-y-1.5">
              {chapters.map((ch, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setActiveChapter(idx + 1);
                    setProgressPercent((idx + 1) * 22);
                  }}
                  className={`w-full text-left p-2 rounded-lg border text-[11px] flex items-center justify-between transition ${
                    activeChapter === idx + 1
                      ? 'bg-blue-50 border-blue-200 text-blue-900 font-semibold'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="truncate">{idx + 1}. {ch.title}</span>
                  <span className="font-mono text-gray-400 ml-2">{ch.time}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" /> Class Assets &amp; Notes
            </h4>
            <div className="space-y-2">
              <div className="p-2.5 bg-white border border-gray-200 rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-800 block text-[11px]">{item.title}_Master_Notes.pdf</span>
                  <span className="text-[10px] text-gray-400">PDF Document • 4.2 MB</span>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Downloading official class lecture notes...')}
                  className="p-1.5 bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-md transition"
                  title="Download Notes"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-2.5 bg-white border border-gray-200 rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-800 block text-[11px]">Formula_Cheatsheet_Handout.pdf</span>
                  <span className="text-[10px] text-gray-400">PDF Document • 1.8 MB</span>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Downloading formula cheatsheet...')}
                  className="p-1.5 bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-md transition"
                  title="Download Cheatsheet"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};