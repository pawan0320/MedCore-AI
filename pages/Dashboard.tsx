import React, { useEffect, useState } from 'react';
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
import { MOCK_STATS } from '../services/mockData';
import { Users, Calendar, Activity, TrendingUp, DollarSign, CheckCircle, XCircle, Clock, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Role, User, UserStatus } from '../types';
import { getPendingDoctors, updateUserStatus } from '../services/authService';

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
        {React.cloneElement(icon as React.ReactElement, { className: `h-6 w-6 ${color.replace('bg-', 'text-')}` })}
      </div>
      <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Last 30 Days</span>
    </div>
    <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
    <p className="text-slate-500 text-sm font-medium">{title}</p>
  </div>
);

const Dashboard: React.FC = () => {
  const { user, updateUserStatus: updateStatus } = useAuth();
  const isAdmin = user?.role === Role.ADMIN;
  const isDoctor = user?.role === Role.DOCTOR;
  const [pendingDoctors, setPendingDoctors] = useState<User[]>([]);

  useEffect(() => {
    if (isAdmin) {
      loadPending();
    }
  }, [isAdmin]);

  const loadPending = async () => {
    const list = await getPendingDoctors();
    setPendingDoctors(list);
  }

  const handleApprove = async (id: string) => {
    await updateStatus(id, UserStatus.ACTIVE);
    loadPending(); // refresh list
  };

  const handleReject = async (id: string) => {
    await updateStatus(id, UserStatus.BLOCKED);
    loadPending();
  };

  // DOCTOR PENDING VIEW
  if (isDoctor && user?.status === UserStatus.PENDING) {
      return (
          <div className="max-w-3xl mx-auto mt-12 text-center">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-12">
                  <div className="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Clock className="w-10 h-10 text-amber-600" />
                  </div>
                  <h1 className="text-3xl font-bold text-slate-800 mb-4">Account Pending Approval</h1>
                  <p className="text-lg text-slate-600 mb-8 max-w-lg mx-auto">
                      Your doctor account has been created and is currently under review by the administration. 
                      Please check back later or contact support.
                  </p>
                  <div className="inline-flex gap-2 text-sm text-slate-500">
                      <ShieldAlert size={18} />
                      Access restricted until verified.
                  </div>
              </div>
          </div>
      );
  }

  // STANDARD DASHBOARD
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
            {isAdmin ? 'Hospital Analytics (Admin)' : 'My Practice Dashboard'}
        </h1>
        <p className="text-slate-500">
            {isAdmin ? 'System-wide overview of patient flow and emergencies.' : 'Overview of your appointments and patient satisfaction.'}
        </p>
      </div>

      {/* ADMIN: Pending Approvals Section */}
      {isAdmin && pendingDoctors.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-orange-200 overflow-hidden mb-8">
             <div className="bg-orange-50 px-6 py-4 border-b border-orange-100 flex items-center gap-2">
                <ShieldAlert className="text-orange-600" />
                <h3 className="font-bold text-orange-900">Pending Doctor Registrations ({pendingDoctors.length})</h3>
             </div>
             <div className="divide-y divide-slate-100">
                {pendingDoctors.map(doc => (
                    <div key={doc.id} className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                             <img src={doc.avatar} alt={doc.name} className="w-12 h-12 rounded-full" />
                             <div>
                                 <p className="font-bold text-slate-900">{doc.name}</p>
                                 <p className="text-sm text-slate-500">{doc.email}</p>
                                 {/* In a real app we'd show the license number here */}
                             </div>
                        </div>
                        <div className="flex gap-2">
                             <button onClick={() => handleApprove(doc.id)} className="flex items-center gap-1 px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-medium text-sm transition-colors">
                                <CheckCircle size={16} /> Approve
                             </button>
                             <button onClick={() => handleReject(doc.id)} className="flex items-center gap-1 px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg font-medium text-sm transition-colors">
                                <XCircle size={16} /> Reject
                             </button>
                        </div>
                    </div>
                ))}
             </div>
          </div>
      )}

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
            title={isAdmin ? "Total Patients" : "My Patients"} 
            value={isAdmin ? "1,284" : "142"} 
            icon={<Users />} 
            color="bg-blue-500" 
        />
        <StatCard 
            title="Appointments" 
            value={isAdmin ? "845" : "38"} 
            icon={<Calendar />} 
            color="bg-green-500" 
        />
        {isAdmin ? (
             <StatCard title="Emergencies" value="42" icon={<Activity />} color="bg-red-500" />
        ) : (
             <StatCard title="Rating" value="4.9/5.0" icon={<Activity />} color="bg-yellow-500" />
        )}
        <StatCard 
            title={isAdmin ? "Growth Rate" : "Revenue"} 
            value={isAdmin ? "+12.5%" : "$8,450"} 
            icon={isAdmin ? <TrendingUp /> : <DollarSign />} 
            color="bg-purple-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-96">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Patient Flow (Weekly)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MOCK_STATS}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#f1f5f9' }} />
              <Bar dataKey="appointments" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-96">
           <h3 className="text-lg font-bold text-slate-800 mb-6">
                {isAdmin ? 'Emergency Incidents' : 'Consultation Hours'}
           </h3>
           <ResponsiveContainer width="100%" height="100%">
            <LineChart data={MOCK_STATS}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="emergencies" stroke={isAdmin ? "#ef4444" : "#10b981"} strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;