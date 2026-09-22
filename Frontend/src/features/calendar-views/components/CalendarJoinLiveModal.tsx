import React, { useState, useEffect } from 'react';
import {
  X,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Share2,
  Hand,
  MessageSquare,
  Users,
  Send,
  Radio,
  Sparkles,
  Maximize2,
  Minimize2,
  PenTool,
  Volume2,
} from 'lucide-react';
import type { CalendarLiveClass } from '../types/calendar-live-class.types';

interface CalendarJoinLiveModalProps {
  item: CalendarLiveClass | null;
  onClose: () => void;
}

export const CalendarJoinLiveModal: React.FC<CalendarJoinLiveModalProps> = ({ item, onClose }) => {
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'participants'>('chat');
  const [activeStage, setActiveStage] = useState<'camera' | 'whiteboard' | 'presentation'>('presentation');
  const [chatMessages, setChatMessages] = useState<{ sender: string; time: string; text: string; isTeacher?: boolean }[]>([
    { sender: 'Aarav Mehta', time: '3:02 PM', text: 'Good afternoon Sir! Can you please repeat the substitution step?' },
    { sender: 'Pooja Singh', time: '3:04 PM', text: 'Welcome everyone, today we will cover all core examples.' },
    { sender: 'Diya Sharma', time: '3:05 PM', text: 'Audio and screen are crystal clear 👍' },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [sessionSeconds, setSessionSeconds] = useState(1485);

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!item) return null;

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages((prev) => [
      ...prev,
      { sender: 'You (Admin)', time: nowTime, text: newMessage.trim() },
    ]);
    setNewMessage('');
  };

  return (
    <div
      id="join-live-classroom-modal-overlay"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-fadeIn"
    >
      <div
        id="join-live-classroom-container"
        className="bg-gray-950 text-white rounded-2xl w-full max-w-6xl h-[92vh] flex flex-col border border-gray-800 shadow-2xl overflow-hidden"
      >
        <div className="px-4 py-3 bg-gray-900/90 border-b border-gray-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              LIVE
            </span>
            <span className="font-bold text-sm text-gray-100 truncate max-w-xs sm:max-w-md">
              {item.title} — {item.courseName}
            </span>
            <span className="text-gray-400 hidden sm:inline">• Room: {item.roomName}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-mono text-gray-300 bg-gray-800/80 px-2.5 py-1 rounded-md text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              REC {formatSeconds(sessionSeconds)}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition"
              title="Leave Room"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          <div className="flex-1 bg-gray-900/60 p-3 sm:p-4 flex flex-col relative overflow-hidden">
            <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-md p-1 rounded-lg text-[11px] border border-white/10">
              <button
                type="button"
                onClick={() => setActiveStage('presentation')}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  activeStage === 'presentation' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
                }`}
              >
                Teacher Screen
              </button>
              <button
                type="button"
                onClick={() => setActiveStage('whiteboard')}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  activeStage === 'whiteboard' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
                }`}
              >
                Interactive Whiteboard
              </button>
              <button
                type="button"
                onClick={() => setActiveStage('camera')}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  activeStage === 'camera' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
                }`}
              >
                Gallery View
              </button>
            </div>

            <div className="flex-1 rounded-xl bg-gray-950 border border-gray-800/80 flex items-center justify-center relative overflow-hidden shadow-inner">
              {activeStage === 'presentation' && (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-radial from-gray-900 to-gray-950">
                  <div className="max-w-lg space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 mx-auto flex items-center justify-center">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        {item.title}: Lecture Slides &amp; Proof Demonstrations
                      </h3>
                      <p className="text-xs text-gray-400">
                        Presented by <span className="text-blue-400 font-semibold">{item.teacherName}</span>
                      </p>
                    </div>

                    <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-4 text-left font-mono text-xs text-emerald-400 shadow-md">
                      <div className="text-gray-500 mb-1">// Real-time formula breakdown</div>
                      <div>∫ (2x + 5) / (x² + 5x + 6) dx</div>
                      <div className="text-gray-400 mt-1">
                        = ∫ [1/(x + 2) + 1/(x + 3)] dx = ln|x + 2| + ln|x + 3| + C
                      </div>
                      <div className="text-xs text-amber-400 mt-2 font-sans flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Instructor is annotating slide 14 of 28
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeStage === 'whiteboard' && (
                <div className="w-full h-full flex flex-col p-4 bg-gray-900/40">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-800 text-xs text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <PenTool className="w-3.5 h-3.5 text-blue-400" /> Live Whiteboard Canvas
                    </span>
                    <span>42 active student pointers connected</span>
                  </div>
                  <div className="flex-1 flex items-center justify-center text-center p-8">
                    <div className="space-y-3">
                      <div className="p-4 bg-gray-900/80 border border-dashed border-gray-700 rounded-xl max-w-md mx-auto">
                        <p className="text-sm text-gray-300 font-serif italic">
                          &quot;Mathematics is not about numbers, equations, or algorithms: it is about understanding.&quot;
                        </p>
                        <span className="text-xs text-gray-500 block mt-1">— William Paul Thurston</span>
                      </div>
                      <p className="text-xs text-gray-400">
                        Interactive vector canvas active. Pen, eraser, and geometric shape tools are enabled for participants.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeStage === 'camera' && (
                <div className="w-full h-full p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-gray-900 rounded-xl border border-blue-500/50 p-2 flex flex-col justify-between relative overflow-hidden">
                    <img
                      src={item.teacherAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'}
                      alt={item.teacherName}
                      className="w-full h-full object-cover rounded-lg absolute inset-0 opacity-70"
                    />
                    <div className="relative z-10 flex justify-between">
                      <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        Teacher (Host)
                      </span>
                    </div>
                    <div className="relative z-10 bg-black/60 backdrop-blur-xs px-2 py-1 rounded text-xs font-semibold text-white">
                      {item.teacherName}
                    </div>
                  </div>

                  {['Aarav Mehta', 'Diya Sharma', 'Kabir Sen', 'Ananya Roy', 'Rohan Gupta'].map((student, i) => (
                    <div
                      key={i}
                      className="bg-gray-900 rounded-xl border border-gray-800 p-3 flex flex-col justify-between"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-900/50 text-blue-300 font-bold flex items-center justify-center text-sm">
                        {student.charAt(0)}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-300">
                        <span>{student}</span>
                        <MicOff className="w-3.5 h-3.5 text-rose-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeStage !== 'camera' && (
                <div className="absolute bottom-4 right-4 w-36 sm:w-44 h-24 sm:h-28 bg-gray-900 rounded-xl border-2 border-blue-500/80 shadow-2xl overflow-hidden flex flex-col justify-between p-1.5 z-20">
                  <img
                    src={item.teacherAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                    alt={item.teacherName}
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                  />
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      Speaking
                    </span>
                    <Volume2 className="w-3.5 h-3.5 text-white animate-bounce" />
                  </div>
                  <div className="relative z-10 bg-black/70 px-1.5 py-0.5 rounded text-[10px] font-bold text-white truncate">
                    {item.teacherName}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="w-full md:w-80 bg-gray-900/90 border-t md:border-t-0 md:border-l border-gray-800 flex flex-col">
            <div className="flex border-b border-gray-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-3 text-center transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'chat'
                    ? 'text-blue-400 border-b-2 border-blue-500 bg-gray-850'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Live Chat ({chatMessages.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('participants')}
                className={`flex-1 py-3 text-center transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'participants'
                    ? 'text-blue-400 border-b-2 border-blue-500 bg-gray-850'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Attendees ({item.currentEnrollment || 42})
              </button>
            </div>

            {activeTab === 'chat' ? (
              <div className="flex-1 flex flex-col justify-between p-3 overflow-hidden">
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className="bg-gray-850 rounded-lg p-2 text-xs border border-gray-800">
                      <div className="flex items-center justify-between text-[10px] text-gray-400 mb-0.5">
                        <span className="font-semibold text-gray-200">{msg.sender}</span>
                        <span>{msg.time}</span>
                      </div>
                      <p className="text-gray-300 text-xs">{msg.text}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="mt-2 pt-2 border-t border-gray-800 flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message or doubt..."
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex-1 p-3 overflow-y-auto divide-y divide-gray-800 text-xs">
                <div className="pb-2">
                  <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">Host &amp; Instructor</div>
                  <div className="flex items-center justify-between py-1">
                    <span className="font-semibold text-white">{item.teacherName}</span>
                    <span className="text-[10px] bg-blue-600/30 text-blue-400 px-2 py-0.5 rounded">Host</span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">
                    Students ({item.participants.length})
                  </div>
                  {item.participants.map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-1.5 text-gray-300">
                      <span>{p.name}</span>
                      <MicOff className="w-3 h-3 text-gray-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-3 bg-gray-900 border-t border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMicOn(!micOn)}
              className={`p-2.5 rounded-full text-xs font-semibold transition ${
                micOn ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-rose-600 hover:bg-rose-700 text-white'
              }`}
              title={micOn ? 'Mute Mic' : 'Unmute Mic'}
            >
              {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => setCameraOn(!cameraOn)}
              className={`p-2.5 rounded-full text-xs font-semibold transition ${
                cameraOn ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-rose-600 hover:bg-rose-700 text-white'
              }`}
              title={cameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
            >
              {cameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setHandRaised(!handRaised)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                handRaised
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}
            >
              <Hand className="w-4 h-4" />
              <span className="hidden sm:inline">{handRaised ? 'Hand Raised' : 'Raise Hand'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition"
            >
              Leave Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};