import React, { useState } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Share2,
  Bookmark,
  CheckCircle2,
  Clock,
  ListVideo
} from 'lucide-react';
import type { LiveClass } from '../types/live-class.types';

interface ViewRecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
  liveClass: LiveClass | null;
}

export const ViewRecordingModal: React.FC<ViewRecordingModalProps> = ({
  isOpen,
  onClose,
  liveClass,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(35); // simulated percent

  if (!isOpen || !liveClass) return null;

  const chapters = [
    { time: '00:00', title: 'Session Introduction & Syllabus Outline' },
    { time: '08:15', title: 'Conceptual Derivation & Key Formulae' },
    { time: '22:40', title: 'NCERT Exemplar Problems & Step Solutions' },
    { time: '38:00', title: 'Student Doubt Resolution & Summary Quiz' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="relative flex flex-col w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800">
          <div>
            <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-400">
              ARCHIVED RECORDING
            </span>
            <h2 className="mt-1 text-sm sm:text-base font-bold text-white truncate max-w-lg">
              {liveClass.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Video Player Stage */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
          <img
            src={liveClass.thumbnail}
            alt="Recording Preview"
            className="absolute inset-0 h-full w-full object-cover opacity-60"
          />

          {/* Central Play Button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600/90 text-white shadow-2xl hover:scale-110 transition-transform cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="h-8 w-8 fill-white" />
            ) : (
              <Play className="h-8 w-8 fill-white ml-1" />
            )}
          </button>

          {/* Bottom Controls Bar */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex flex-col gap-2">
            {/* Progress Bar */}
            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                setProgress(Math.round(pos * 100));
              }}
              className="relative h-1.5 w-full rounded-full bg-white/20 cursor-pointer overflow-hidden"
            >
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-3">
                <button onClick={() => setIsPlaying(!isPlaying)}>
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
                <button onClick={() => setProgress(0)}>
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => setIsMuted(!isMuted)}>
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <span className="font-mono text-[11px]">
                  {Math.floor((liveClass.duration * progress) / 100)}:00 / {liveClass.duration}:00
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold">1080p Full HD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chapters & Session Metadata */}
        <div className="p-5 bg-slate-900 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-2">
              <ListVideo className="h-4 w-4 text-blue-400" />
              <span>Timestamp Chapters</span>
            </h4>
            <div className="space-y-1.5">
              {chapters.map((ch, idx) => (
                <button
                  key={idx}
                  onClick={() => setProgress(idx * 25 + 5)}
                  className="flex w-full items-center justify-between rounded-lg bg-slate-800/60 px-3 py-2 text-xs hover:bg-slate-800 transition-colors text-left"
                >
                  <span className="text-slate-300 truncate">{ch.title}</span>
                  <span className="font-mono text-blue-400 font-bold ml-2">{ch.time}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-300 mb-2">Class Attendance Metrics</h4>
              <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-3 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Total Attended:</span>
                  <span className="font-bold text-white">{liveClass.students} Students</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Avg Watch Time:</span>
                  <span className="font-bold text-emerald-400">{Math.round(liveClass.duration * 0.82)} mins (82%)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Recorded Date:</span>
                  <span className="font-bold text-white">{liveClass.startTime}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => alert(`Starting download for ${liveClass.title} (HD MP4)...`)}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download MP4</span>
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(liveClass.recordingUrl || liveClass.meetingUrl);
                  alert('Recording link copied to clipboard!');
                }}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>Share Link</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
