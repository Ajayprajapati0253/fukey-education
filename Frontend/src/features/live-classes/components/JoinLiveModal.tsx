import React, { useState } from 'react';
import {
  X,
  Radio,
  Users,
  MessageSquare,
  Send,
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  Share2,
  Settings,
  Heart,
  ThumbsUp,
  Maximize2
} from 'lucide-react';
import type { LiveClass } from '../types/live-class.types';

interface JoinLiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  liveClass: LiveClass | null;
}

export const JoinLiveModal: React.FC<JoinLiveModalProps> = ({
  isOpen,
  onClose,
  liveClass,
}) => {
  const [messages, setMessages] = useState<Array<{ id: string; sender: string; text: string; time: string; isInstructor?: boolean }>>(
    liveClass?.chatMessages || [
      { id: '1', sender: 'Aarav Patel', text: 'Good evening sir! Are map questions included in tomorrow’s quiz?', time: '16:34' },
      { id: '2', sender: 'Khabib Nurmagomedov', text: 'Yes Aarav! We will cover top 10 map questions at the end.', time: '16:35', isInstructor: true },
      { id: '3', sender: 'Diya Sengupta', text: 'Audio and board presentation are very clear!', time: '16:37' },
      { id: '4', sender: 'Rohan Sharma', text: 'Can you please recap the core definition once more?', time: '16:40' }
    ]
  );
  const [chatInput, setChatInput] = useState('');
  const [micMuted, setMicMuted] = useState(true);
  const [camOff, setCamOff] = useState(false);
  const [likes, setLikes] = useState(48);

  if (!isOpen || !liveClass) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg = {
      id: Date.now().toString(),
      sender: 'Admin (You)',
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isInstructor: true
    };
    setMessages([...messages, newMsg]);
    setChatInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="relative flex flex-col h-[90vh] w-full max-w-6xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 text-white">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full bg-red-600/90 px-3 py-0.5 text-xs font-bold text-white shadow-xs">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
              <span>LIVE BROADCAST</span>
            </div>
            <h2 className="text-xs sm:text-sm font-bold text-white truncate max-w-md">
              {liveClass.title}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-2.5 py-1 rounded-full">
              <Users className="h-3.5 w-3.5" />
              <span>{liveClass.students + 14} Viewers</span>
            </div>

            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Main Body: Video Stream on Left, Live Chat on Right */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Video Stream Stage */}
          <div className="lg:col-span-8 flex flex-col justify-between bg-black relative p-4">
            {/* Stream Canvas Mockup */}
            <div className="relative flex-1 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800">
              <img
                src={liveClass.thumbnail}
                alt="Live Stream"
                className="absolute inset-0 h-full w-full object-cover opacity-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

              {/* Center Instructor Badge */}
              <div className="relative z-10 flex flex-col items-center p-4 text-center">
                <img
                  src={liveClass.instructor.avatar}
                  alt={liveClass.instructor.name}
                  className="h-20 w-20 rounded-full ring-4 ring-blue-500/50 object-cover shadow-2xl"
                />
                <span className="mt-3 text-lg font-bold text-white tracking-wide">
                  {liveClass.instructor.name}
                </span>
                <span className="text-xs text-blue-300 font-medium">
                  Broadcasting via {liveClass.platform} High-Definition Stream
                </span>
              </div>

              {/* Lower Overlay Badge */}
              <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2">
                <span className="rounded bg-black/60 backdrop-blur-xs px-2.5 py-1 text-xs font-mono text-emerald-400 border border-white/10">
                  Bitrate: 1080p @ 60fps
                </span>
                <span className="rounded bg-black/60 backdrop-blur-xs px-2.5 py-1 text-xs font-mono text-slate-300 border border-white/10">
                  Latency: 1.2s Ultra-low
                </span>
              </div>

              {/* Reactions Floating */}
              <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
                <button
                  onClick={() => setLikes(likes + 1)}
                  className="flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1.5 text-xs font-bold text-white hover:bg-white/30 transition-all cursor-pointer"
                >
                  <Heart className="h-4 w-4 text-rose-400 fill-rose-400" />
                  <span>{likes}</span>
                </button>
              </div>
            </div>

            {/* Stream Control Bar */}
            <div className="mt-3 flex items-center justify-between px-2 pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMicMuted(!micMuted)}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                    micMuted ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-800 text-white'
                  }`}
                  title={micMuted ? 'Unmute Mic' : 'Mute Mic'}
                >
                  {micMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>

                <button
                  onClick={() => setCamOff(!camOff)}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                    camOff ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-800 text-white'
                  }`}
                  title={camOff ? 'Turn on Camera' : 'Turn off Camera'}
                >
                  {camOff ? <VideoOff className="h-4 w-4" /> : <VideoIcon className="h-4 w-4" />}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.open(liveClass.meetingUrl, '_blank')}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors"
                >
                  <span>Open in {liveClass.platform}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Live Chat Panel */}
          <div className="lg:col-span-4 flex flex-col border-l border-slate-800 bg-slate-900">
            {/* Chat Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-400" />
                <span className="text-xs font-bold text-white">Live Student Q&A</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Real-time</span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m) => (
                <div key={m.id} className="text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-bold ${
                        m.isInstructor ? 'text-blue-400' : 'text-slate-300'
                      }`}
                    >
                      {m.sender} {m.isInstructor && <span className="text-[9px] bg-blue-500/20 border border-blue-400/40 rounded px-1 ml-1">Staff</span>}
                    </span>
                    <span className="text-[10px] text-slate-500">{m.time}</span>
                  </div>
                  <p className="text-slate-300 bg-slate-800/60 rounded-lg p-2 leading-relaxed border border-slate-700/50">
                    {m.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-900/90">
              <div className="relative">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Post message as Admin / Instructor..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2 pl-3 pr-10 text-xs text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
