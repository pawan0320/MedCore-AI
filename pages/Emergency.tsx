import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Phone, MapPin, Activity, CheckCircle, Ambulance, List, Mic, StopCircle } from 'lucide-react';
import { assessEmergency } from '../services/geminiService';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

// Extend Window interface for Web Speech API
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

const Emergency: React.FC = () => {
  const { user } = useAuth();
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [status, setStatus] = useState<'IDLE' | 'ASSESSING' | 'DISPATCHED'>('IDLE');
  const [description, setDescription] = useState('');
  const [riskLevel, setRiskLevel] = useState<'LOW' | 'MEDIUM' | 'HIGH' | null>(null);
  const [aiAdvice, setAiAdvice] = useState('');
  
  // Voice Input State
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Mock logs for Admin
  const [logs] = useState([
      { id: 1, type: 'HIGH', location: '40.7128, -74.0060', time: '10:42 AM', status: 'DISPATCHED' },
      { id: 2, type: 'MEDIUM', location: '40.7580, -73.9855', time: '09:15 AM', status: 'RESOLVED' },
      { id: 3, type: 'LOW', location: '40.7829, -73.9654', time: '08:30 AM', status: 'RESOLVED' },
  ]);

  useEffect(() => {
    // Simulate getting location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => console.log("Location access denied")
      );
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support voice input. Please use Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setDescription(prev => prev ? `${prev} ${transcript}` : transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSOS = async () => {
    if (!description) return;
    setStatus('ASSESSING');
    
    const assessment = await assessEmergency(description);
    setRiskLevel(assessment.severity);
    setAiAdvice(assessment.advice);

    if (assessment.severity === 'HIGH' || assessment.severity === 'MEDIUM') {
        setTimeout(() => {
            setStatus('DISPATCHED');
        }, 2000);
    } else {
        setStatus('IDLE');
    }
  };

  // ADMIN VIEW: Monitor Logs
  if (user?.role === Role.ADMIN) {
      return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white text-slate-900 border border-slate-200 shadow-sm p-6 rounded-2xl flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-3">
                        <Activity className="text-red-500" /> Emergency Monitor
                    </h1>
                    <p className="text-slate-500">Live feed of incoming SOS requests</p>
                </div>
                <div className="bg-red-100 text-red-700 border border-red-200 px-4 py-2 rounded-lg font-bold animate-pulse">
                    LIVE
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Severity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Location</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {logs.map((log) => (
                            <tr key={log.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        log.type === 'HIGH' ? 'bg-red-100 text-red-800' :
                                        log.type === 'MEDIUM' ? 'bg-orange-100 text-orange-800' :
                                        'bg-blue-100 text-blue-800'
                                    }`}>
                                        {log.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                    {log.location}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                    {log.time}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                    {log.status}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      );
  }

  // PATIENT VIEW: Request Help
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-8 w-8 text-red-600" />
          <h1 className="text-2xl font-bold text-red-700">Emergency Assistance Center</h1>
        </div>
        <p className="mt-2 text-red-800">
          If you are experiencing a life-threatening emergency, please call 911 immediately. 
          Use this tool for quick triage and automated ambulance dispatch.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Triage Form */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Activity className="text-blue-500" /> Quick Triage
            </h2>
            <div className="space-y-4">
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-slate-700">Describe the situation</label>
                        <button 
                            onClick={toggleRecording}
                            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors ${
                                isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                            title="Use Voice Input"
                        >
                            {isRecording ? <><StopCircle size={12} /> Recording...</> : <><Mic size={12} /> Voice Input</>}
                        </button>
                    </div>
                    <textarea 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-shadow"
                        rows={3}
                        placeholder={isRecording ? "Listening..." : "e.g., Severe chest pain, difficulty breathing, bleeding..."}
                    />
                </div>
                
                {location ? (
                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                        <MapPin size={16} /> Location detected: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
                        <MapPin size={16} /> Locating...
                    </div>
                )}

                <button 
                    onClick={handleSOS}
                    disabled={status === 'ASSESSING' || !description}
                    className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform hover:scale-105 active:scale-95 flex justify-center items-center gap-2 ${
                        status === 'DISPATCHED' ? 'bg-green-600' : 'bg-red-600 hover:bg-red-700'
                    }`}
                >
                    {status === 'ASSESSING' ? 'AI Assessing Risk...' : status === 'DISPATCHED' ? 'Help is on the way!' : 'REQUEST IMMEDIATE HELP'}
                </button>
            </div>
        </div>

        {/* Status / Advice Panel */}
        <div className="space-y-6">
            {riskLevel && (
                <div className={`p-6 rounded-2xl border-2 ${
                    riskLevel === 'HIGH' ? 'bg-red-50 border-red-200' : 
                    riskLevel === 'MEDIUM' ? 'bg-orange-50 border-orange-200' : 
                    'bg-blue-50 border-blue-200'
                }`}>
                    <h3 className="font-bold text-lg mb-2">AI Risk Assessment: {riskLevel}</h3>
                    <p className="text-slate-700 mb-4">{aiAdvice}</p>
                    
                    {riskLevel === 'HIGH' && (
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-red-100">
                             <div className="flex items-center gap-2 text-red-600 font-bold mb-2">
                                <Ambulance /> Auto-Dispatch Triggered
                             </div>
                             <p className="text-sm text-slate-500">Nearest hospital (St. Mary's) has been notified. Ambulance ETA: 8 mins.</p>
                        </div>
                    )}
                </div>
            )}

            <div className="bg-white border border-slate-200 shadow-sm text-slate-900 p-6 rounded-2xl">
                <h3 className="font-bold text-lg mb-4">Emergency Contacts</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="font-medium text-slate-700">Ambulance / Fire</span>
                        <a href="tel:911" className="flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full text-white text-sm hover:bg-red-500 shadow-sm">
                            <Phone size={14} /> 911
                        </a>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="font-medium text-slate-700">National Poison Control</span>
                        <a href="tel:18002221222" className="flex items-center gap-2 bg-blue-600 px-3 py-1 rounded-full text-white text-sm hover:bg-blue-500 shadow-sm">
                            <Phone size={14} /> Call
                        </a>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Emergency;