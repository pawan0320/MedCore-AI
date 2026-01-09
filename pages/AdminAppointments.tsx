import React, { useState } from 'react';
import { MOCK_APPOINTMENTS } from '../services/mockData';
import { Calendar, Filter, User, Video, MapPin, CheckCircle, Clock } from 'lucide-react';

const AdminAppointments: React.FC = () => {
  const [filter, setFilter] = useState('ALL');

  const filtered = MOCK_APPOINTMENTS.filter(a => 
    filter === 'ALL' ? true : a.status === filter
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <div>
            <h1 className="text-2xl font-bold text-slate-900">Appointment Monitor</h1>
            <p className="text-slate-500">Track all consultations across the platform</p>
         </div>
         <div className="flex items-center gap-2 bg-white border border-slate-200 p-1 rounded-lg">
             <Filter size={16} className="text-slate-400 ml-2" />
             <select 
               value={filter} 
               onChange={(e) => setFilter(e.target.value)}
               className="bg-transparent text-sm text-slate-700 outline-none p-1"
             >
                 <option value="ALL">All Status</option>
                 <option value="CONFIRMED">Confirmed</option>
                 <option value="COMPLETED">Completed</option>
                 <option value="CANCELLED">Cancelled</option>
             </select>
         </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                  <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Doctor</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Patient</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                  {filtered.map(appt => (
                      <tr key={appt.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                              <span className="font-medium text-slate-900">{appt.doctorName}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-slate-600">{appt.patientName}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                              <div className="flex items-center gap-2">
                                  <Calendar size={14} /> {appt.date}
                                  <Clock size={14} /> {appt.time}
                              </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`flex items-center gap-1 text-xs font-bold ${appt.type === 'VIDEO' ? 'text-purple-600' : 'text-blue-600'}`}>
                                  {appt.type === 'VIDEO' ? <Video size={14}/> : <MapPin size={14}/>} {appt.type}
                              </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  appt.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                                  appt.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                                  'bg-slate-100 text-slate-800'
                              }`}>
                                  {appt.status}
                              </span>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>
    </div>
  );
};

export default AdminAppointments;