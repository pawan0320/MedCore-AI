import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_DOCTORS, MOCK_APPOINTMENTS } from '../services/mockData';
import { Star, MapPin, Clock, CalendarCheck, User, Video, CreditCard, CheckCircle } from 'lucide-react';
import { Appointment, Role } from '../types';
import { useAuth } from '../context/AuthContext';

const Booking: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [view, setView] = useState<'LIST' | 'BROWSE'>('BROWSE');

  const handleBook = (doctorId: string, time: string, doctorName: string) => {
    // Simulate Payment Gateway
    if (confirm(`Proceed to payment ($50) for appointment with ${doctorName}?`)) {
        const newAppointment: Appointment = {
            id: Date.now().toString(),
            doctorId,
            doctorName,
            patientId: user?.id || 'guest',
            patientName: user?.name,
            date: new Date().toLocaleDateString(),
            time,
            status: 'CONFIRMED',
            type: 'VIDEO',
            paymentStatus: 'PAID'
        };
        setAppointments([...appointments, newAppointment]);
        alert("Payment Successful! Appointment Confirmed.");
        setView('LIST');
    }
  };

  const startVideoCall = (id: string) => {
      navigate(`/video-call/${id}`);
  };

  // DOCTOR VIEW: Show their schedule
  if (user?.role === Role.DOCTOR) {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                   <h1 className="text-2xl font-bold text-slate-800">My Schedule</h1>
                   <p className="text-slate-500">Manage your upcoming patient consultations</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-white">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Patient</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Payment</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {appointments.map((appt) => (
                            <tr key={appt.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                            <User size={20} />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-slate-900">{appt.patientName}</div>
                                            <div className="text-sm text-slate-500">Follow-up</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-slate-900">{appt.date}</div>
                                    <div className="text-sm text-slate-500">{appt.time}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        appt.type === 'VIDEO' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                    }`}>
                                        {appt.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
                                        <CheckCircle size={14} /> Paid
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {appt.type === 'VIDEO' && (
                                        <button 
                                          onClick={() => startVideoCall(appt.id)}
                                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1 justify-end"
                                        >
                                            <Video size={16} /> Join Call
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
  }

  // PATIENT VIEW
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">Appointments</h1>
           <p className="text-slate-500">Book new consultations or manage existing ones</p>
        </div>
        <div className="bg-white border border-slate-200 p-1 rounded-lg flex">
            <button 
                onClick={() => setView('BROWSE')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${view === 'BROWSE' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                Book New
            </button>
            <button 
                onClick={() => setView('LIST')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${view === 'LIST' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                My Appointments
            </button>
        </div>
      </div>

      {view === 'LIST' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             {appointments.filter(a => a.patientId === user?.id || 'p1').length > 0 ? (
                appointments.map(appt => (
                    <div key={appt.id} className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <div className="flex gap-4 items-center">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                                {appt.type === 'VIDEO' ? <Video /> : <User />}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">{appt.doctorName}</h3>
                                <p className="text-sm text-slate-500">{appt.date} at {appt.time}</p>
                                <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{appt.status}</span>
                            </div>
                        </div>
                        {appt.type === 'VIDEO' && (
                            <button 
                                onClick={() => startVideoCall(appt.id)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
                            >
                                <Video size={16} /> Join Video
                            </button>
                        )}
                    </div>
                ))
             ) : (
                <div className="p-12 text-center text-slate-400">
                    No upcoming appointments.
                </div>
             )}
          </div>
      )}

      {view === 'BROWSE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_DOCTORS.map((doctor) => (
            <div key={doctor.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-4">
                    <img src={doctor.avatar} alt={doctor.name} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" />
                    <div>
                        <h3 className="font-bold text-lg text-slate-900">{doctor.name}</h3>
                        <p className="text-blue-600 font-medium text-sm">{doctor.specialization}</p>
                        <div className="flex items-center gap-1 text-yellow-500 text-xs mt-1">
                        <Star fill="currentColor" size={12} />
                        <span className="font-bold">{doctor.rating}</span>
                        <span className="text-slate-400">({doctor.experience} yrs exp)</span>
                        </div>
                    </div>
                    </div>
                </div>

                <div className="space-y-2 text-sm text-slate-600 mb-6">
                    <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-slate-400" />
                    {doctor.hospital}, {doctor.location}
                    </div>
                    <div className="flex items-center gap-2">
                    <Clock size={16} className="text-slate-400" />
                    Next Available: Today
                    </div>
                </div>

                <div className="space-y-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase">Available Slots</p>
                    <div className="flex flex-wrap gap-2">
                    {doctor.availableSlots.map((slot) => (
                        <button
                        key={slot}
                        onClick={() => handleBook(doctor.id, slot, doctor.name)}
                        className="px-3 py-1 bg-white text-slate-700 text-xs font-medium rounded-md border border-slate-200 hover:border-blue-500 hover:text-blue-600 transition-colors"
                        >
                        {slot}
                        </button>
                    ))}
                    </div>
                </div>
                </div>
                <div className="bg-white p-4 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-700 flex items-center gap-1"><CreditCard size={14}/> $50 <span className="text-slate-400 font-normal">/ visit</span></span>
                    <button className="text-blue-600 text-sm font-semibold hover:underline">View Profile</button>
                </div>
            </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default Booking;