import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { MOCK_STATS, MOCK_APPOINTMENTS, MOCK_DOCTORS } from '../services/mockData';
import { Users, Calendar, Activity, TrendingUp, DollarSign, Clock, ShieldAlert, AlertCircle, Bot, FileText, Search, Star, MapPin, ArrowRight, CreditCard, Video, User as UserIcon, Stethoscope } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Role, User, UserStatus } from '../types';
import { getPendingDoctors } from '../services/authService';

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
        {React.cloneElement(icon as React.ReactElement, { className: `h-6 w-6 ${color.replace('bg-', 'text-')}` })}
      </div>
      <span className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">Last 30 Days</span>
    </div>
    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</p>
  </div>
);

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === Role.ADMIN;
  const isDoctor = user?.role === Role.DOCTOR;
  const isPatient = user?.role === Role.PATIENT;

  const [pendingDoctors, setPendingDoctors] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isAdmin) {
      loadPending();
    }
  }, [isAdmin]);

  const loadPending = async () => {
    const list = await getPendingDoctors();
    setPendingDoctors(list);
  }

  // DOCTOR PENDING VIEW
  if (isDoctor && user?.status === UserStatus.PENDING) {
      return (
          <div className="max-w-3xl mx-auto mt-12 text-center">
              <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-12 shadow-sm">
                  <div className="bg-amber-100 dark:bg-amber-900/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Clock className="w-10 h-10 text-amber-600 dark:text-amber-500" />
                  </div>
                  <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">Account Pending Approval</h1>
                  <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-lg mx-auto">
                      Your doctor account has been created and is currently under review by the administration. 
                      Please check back later or contact support.
                  </p>
                  <div className="inline-flex gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <ShieldAlert size={18} />
                      Access restricted until verified.
                  </div>
              </div>
          </div>
      );
  }

  // DOCTOR DASHBOARD
  if (isDoctor) {
      const todaysAppointments = MOCK_APPOINTMENTS.filter(a => a.doctorId === user?.id || 'd1'); 

      return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                   <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dr. {user?.name}</h1>
                   <p className="text-slate-500 dark:text-slate-400">Practice Overview & Schedule</p>
                </div>
                <div className="flex gap-2">
                    <Link to="/schedule" className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-sm flex items-center gap-2">
                        <Clock size={16} /> Manage Availability
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Appointments Today" value={todaysAppointments.length.toString()} icon={<Calendar />} color="bg-blue-500" />
                <StatCard title="Pending Reports" value="3" icon={<FileText />} color="bg-orange-500" />
                <StatCard title="Total Patients" value="142" icon={<Users />} color="bg-emerald-500" />
                <StatCard title="Revenue (Mo)" value="$8,450" icon={<DollarSign />} color="bg-purple-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Today's Schedule */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 dark:text-white">Today's Appointments</h3>
                        <Link to="/booking" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">View All</Link>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {todaysAppointments.length > 0 ? (
                            todaysAppointments.map((appt) => (
                                <div key={appt.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-full ${appt.type === 'VIDEO' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                                            {appt.type === 'VIDEO' ? <Video size={20} /> : <UserIcon size={20} />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white">{appt.patientName}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{appt.time} • {appt.type}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {appt.type === 'VIDEO' && (
                                            <button 
                                              onClick={() => navigate(`/video-call/${appt.id}`)}
                                              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 flex items-center gap-1"
                                            >
                                                <Video size={14} /> Join
                                            </button>
                                        )}
                                        <button className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700">
                                            Details
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-slate-400 dark:text-slate-500">No appointments for today.</div>
                        )}
                    </div>
                </div>

                {/* AI Summary */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <Bot className="text-indigo-600 dark:text-indigo-400" /> AI Insights
                    </h3>
                    <div className="space-y-4">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
                            <p className="text-xs font-bold text-indigo-800 dark:text-indigo-300 mb-1">Patient: John Doe</p>
                            <p className="text-xs text-slate-600 dark:text-slate-300">
                                Lab results indicate slightly elevated cholesterol. Recommended adjusting statin dosage.
                            </p>
                        </div>
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
                            <p className="text-xs font-bold text-indigo-800 dark:text-indigo-300 mb-1">Patient: Emily Smith</p>
                            <p className="text-xs text-slate-600 dark:text-slate-300">
                                Reported severe migraine symptoms via AI Chatbot at 09:30 AM.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  // PATIENT DASHBOARD
  if (isPatient) {
      const nextAppt = MOCK_APPOINTMENTS.find(a => a.patientId === user?.id && a.status === 'CONFIRMED');
      const filteredDoctors = MOCK_DOCTORS.filter(d => 
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        d.specialization.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back, {user?.name}</h1>
                    <p className="text-slate-500 dark:text-slate-400">How are you feeling today?</p>
                </div>
                <Link to="/emergency" className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-red-200 dark:shadow-red-900/20 flex items-center justify-center gap-2 animate-pulse transition-all hover:scale-105">
                    <AlertCircle /> Emergency Assistance
                </Link>
            </div>

            {/* Widgets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col relative overflow-hidden group hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Calendar size={64} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold mb-4">
                        <Calendar size={20} /> Upcoming Appointment
                    </div>
                    {nextAppt ? (
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{nextAppt.doctorName}</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">{nextAppt.type === 'VIDEO' ? 'Video Consultation' : 'In-Person Visit'}</p>
                            <div className="inline-block bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-lg text-sm font-semibold">
                                {nextAppt.date} • {nextAppt.time}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center text-slate-400 dark:text-slate-500 text-sm">
                            No upcoming appointments scheduled.
                        </div>
                    )}
                    <Link to="/booking" className="mt-4 flex items-center gap-1 text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">
                        Manage Appointments <ArrowRight size={16} />
                    </Link>
                </div>

                <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-6 rounded-xl shadow-md text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <Bot size={64} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 font-bold mb-2 text-indigo-100">
                            <Bot size={20} /> AI Health Assistant
                        </div>
                        <p className="text-sm text-indigo-50 leading-relaxed">
                            Feeling unwell? Describe your symptoms to our AI for preliminary advice and specialist recommendations.
                        </p>
                    </div>
                    <Link to="/ai-assistant" className="mt-4 bg-white/20 hover:bg-white/30 p-2 rounded-lg text-center text-sm font-semibold backdrop-blur-sm transition-colors flex items-center justify-center gap-2">
                        Start Diagnosis <ArrowRight size={16} />
                    </Link>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold mb-4">
                        <FileText size={20} /> Medical Records
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800">
                            <span className="text-sm text-slate-700 dark:text-slate-300">Blood Test Results</span>
                            <span className="text-xs text-slate-400 dark:text-slate-500">Mar 12</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800">
                            <span className="text-sm text-slate-700 dark:text-slate-300">Chest X-Ray</span>
                            <span className="text-xs text-slate-400 dark:text-slate-500">Feb 28</span>
                        </div>
                    </div>
                    <Link to="/records" className="mt-4 flex items-center gap-1 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                        View All Records <ArrowRight size={16} />
                    </Link>
                </div>
            </div>

            {/* Find a Specialist Section */}
            <div>
                <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Find a Specialist</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Book appointments with top doctors in your area</p>
                    </div>
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-3.5 text-slate-400" size={18}/>
                        <input 
                            type="text" 
                            placeholder="Search doctors, specialties..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-sm text-slate-900 dark:text-white placeholder:text-slate-400" 
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDoctors.map((doctor) => (
                        <div key={doctor.id} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow group">
                            <div className="p-6">
                                <div className="flex items-start gap-4 mb-4">
                                    <img src={doctor.avatar} alt={doctor.name} className="w-16 h-16 rounded-full object-cover border-2 border-slate-50 dark:border-slate-700 shadow-sm group-hover:border-blue-100 dark:group-hover:border-blue-900 transition-colors" />
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">{doctor.name}</h3>
                                        <p className="text-blue-600 dark:text-blue-400 font-medium text-sm">{doctor.specialization}</p>
                                        <div className="flex items-center gap-1 text-amber-500 text-xs mt-1">
                                            <Star fill="currentColor" size={12} />
                                            <span className="font-bold">{doctor.rating}</span>
                                            <span className="text-slate-400 dark:text-slate-500">({doctor.experience} yrs exp)</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} className="text-slate-400 dark:text-slate-500" />
                                        <span className="truncate">{doctor.hospital}, {doctor.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} className="text-slate-400 dark:text-slate-500" />
                                        Next Slot: <span className="text-emerald-600 dark:text-emerald-400 font-medium">Today, {doctor.availableSlots[0]}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1"><CreditCard size={14}/> ${doctor.consultationFee || 50}</span>
                                <Link to="/booking" className="text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 transition-colors">
                                    Book Now
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      );
  }

  // ADMIN DASHBOARD
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Hospital Analytics (Admin)</h1>
        <p className="text-slate-500 dark:text-slate-400">System-wide overview of patient flow and emergencies.</p>
      </div>

      {/* ADMIN: Pending Approvals Widget */}
      {pendingDoctors.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-orange-200 dark:border-orange-900/30 overflow-hidden mb-2">
             <div className="bg-white dark:bg-slate-900 px-6 py-4 border-b border-orange-100 dark:border-orange-900/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ShieldAlert className="text-orange-600 dark:text-orange-500" />
                    <h3 className="font-bold text-orange-900 dark:text-orange-100">Pending Registrations ({pendingDoctors.length})</h3>
                </div>
                <Link to="/admin/doctors" className="text-sm text-orange-700 dark:text-orange-300 font-medium hover:underline flex items-center gap-1">
                    Review All <ArrowRight size={14} />
                </Link>
             </div>
          </div>
      )}

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Patients" value="1,284" icon={<Users />} color="bg-blue-500" />
        <StatCard title="Appointments Today" value="84" icon={<Calendar />} color="bg-green-500" />
        <StatCard title="Emergencies" value="42" icon={<Activity />} color="bg-red-500" />
        <StatCard title="Active Doctors" value="38" icon={<Stethoscope />} color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 h-96">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Patient Flow (Weekly)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MOCK_STATS}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{ fill: '#f1f5f9' }} 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
              />
              <Bar dataKey="appointments" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 h-96">
           <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Emergency Incidents</h3>
           <ResponsiveContainer width="100%" height="100%">
            <LineChart data={MOCK_STATS}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} />
              <Line type="monotone" dataKey="emergencies" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;