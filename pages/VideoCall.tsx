import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Share2, FileText, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MOCK_APPOINTMENTS } from '../services/mockData';

const VideoCall: React.FC = () => {
  const { id } = useParams(); // Appointment ID
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<{sender: string, text: string, time: string}[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [duration, setDuration] = useState(0);

  const appointment = MOCK_APPOINTMENTS.find(a => a.id === id);

  // Timer simulation
  useEffect(() => {
    const timer = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    setMessages([...messages, {
        sender: user?.name || 'Me',
        text: inputMsg,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setInputMsg('');
  };

  const endCall = () => {
    if (confirm("End consultation session?")) {
        navigate('/booking');
    }
  };

  if (!appointment) return <div className="p-8">Invalid Appointment Session</div>;

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-slate-900 rounded-2xl overflow-hidden shadow-2xl relative">
      
      {/* Main Video Area */}
      <div className={`flex-1 relative flex flex-col ${showChat ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Remote Stream (Doctor/Patient) */}
        <div className="flex-1 bg-slate-800 flex items-center justify-center relative">
           {/* Placeholder for Remote Stream */}
           <div className="text-center">
               <div className="w-24 h-24 bg-slate-700 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-slate-400">
                   {appointment.doctorName.charAt(0)}
               </div>
               <h3 className="text-white text-xl font-semibold">
                   {user?.role === 'PATIENT' ? appointment.doctorName : appointment.patientName}
               </h3>
               <p className="text-slate-400 animate-pulse">Connecting secure video stream...</p>
           </div>

           {/* Local Stream (PIP) */}
           <div className="absolute bottom-4 right-4 w-48 h-36 bg-black rounded-lg border-2 border-slate-700 overflow-hidden shadow-lg z-10">
               {cameraOn ? (
                   <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                       <span className="text-xs text-slate-500">Local Camera</span>
                   </div>
               ) : (
                   <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                       <VideoOff size={24} />
                   </div>
               )}
           </div>
        </div>

        {/* Controls Bar */}
        <div className="bg-slate-900 p-4 flex justify-center items-center gap-6">
            <button 
              onClick={() => setMicOn(!micOn)} 
              className={`p-4 rounded-full ${micOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-500 text-white'}`}
            >
                {micOn ? <Mic /> : <MicOff />}
            </button>
            <button 
              onClick={() => setCameraOn(!cameraOn)} 
              className={`p-4 rounded-full ${cameraOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-500 text-white'}`}
            >
                {cameraOn ? <Video /> : <VideoOff />}
            </button>
            
            <button 
              onClick={endCall} 
              className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white px-8 font-bold flex items-center gap-2"
            >
                <PhoneOff /> End Call
            </button>

            <button 
              onClick={() => setShowChat(!showChat)} 
              className={`p-4 rounded-full md:hidden ${showChat ? 'bg-blue-600 text-white' : 'bg-slate-700 text-white'}`}
            >
                <MessageSquare />
            </button>
        </div>

        <div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded text-white text-sm font-mono flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            {formatTime(duration)}
        </div>
      </div>

      {/* Side Panel (Chat & Tools) */}
      <div className={`w-full md:w-80 bg-white border-l border-slate-200 flex flex-col ${showChat ? 'flex' : 'hidden md:flex'}`}>
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
             <h3 className="font-bold text-slate-800">Consultation Chat</h3>
             <button onClick={() => setShowChat(false)} className="md:hidden text-slate-500"><Share2 /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="text-center text-xs text-slate-400 my-4">
                  Session started securely via WebRTC
              </div>
              {messages.map((msg, idx) => (
                  <div key={idx} className={`flex flex-col ${msg.sender === 'Me' ? 'items-end' : 'items-start'}`}>
                      <div className={`px-4 py-2 rounded-lg max-w-[85%] text-sm ${
                          msg.sender === 'Me' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'
                      }`}>
                          {msg.text}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1">{msg.time}</span>
                  </div>
              ))}
          </div>

          <div className="p-4 border-t border-slate-200">
             <div className="flex gap-2 mb-2">
                 <button className="flex-1 py-2 bg-slate-100 text-slate-600 rounded text-xs font-medium hover:bg-slate-200 flex justify-center items-center gap-1">
                     <FileText size={14} /> Share Report
                 </button>
                 <button className="flex-1 py-2 bg-slate-100 text-slate-600 rounded text-xs font-medium hover:bg-slate-200 flex justify-center items-center gap-1">
                    <Share2 size={14} /> Prescribe
                 </button>
             </div>
             <form onSubmit={handleSendMessage} className="flex gap-2">
                 <input 
                   type="text" 
                   value={inputMsg}
                   onChange={(e) => setInputMsg(e.target.value)}
                   className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                   placeholder="Type message..."
                 />
                 <button type="submit" className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                     <Send size={18} />
                 </button>
             </form>
          </div>
      </div>
    </div>
  );
};

export default VideoCall;