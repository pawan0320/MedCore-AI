import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Clock, Save, Calendar, CheckCircle } from 'lucide-react';
import { Doctor } from '../types';

const DoctorSchedule: React.FC = () => {
  const { user, updateUserContext } = useAuth();
  const doctor = user as Doctor;
  
  const [slots, setSlots] = useState<string[]>(doctor.availableSlots || []);
  const [newSlot, setNewSlot] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const addSlot = () => {
    if (newSlot && !slots.includes(newSlot)) {
      setSlots([...slots, newSlot].sort());
      setNewSlot('');
    }
  };

  const removeSlot = (slotToRemove: string) => {
    setSlots(slots.filter(s => s !== slotToRemove));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateUserContext({ availableSlots: slots } as Partial<Doctor>);
      setSuccess('Availability updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      alert("Failed to save schedule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Availability Management</h1>
          <p className="text-slate-500">Set your weekly recurring consultation slots</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 shadow-sm"
        >
          {loading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
        </button>
      </div>

      {success && (
        <div className="p-4 bg-white border border-green-200 text-green-700 rounded-lg flex items-center gap-2 shadow-sm animate-in fade-in slide-in-from-top-2">
          <CheckCircle size={20} /> {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Add Panel */}
        <div className="md:col-span-1 space-y-6">
           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                 <Clock size={18} className="text-blue-600"/> Add Time Slot
              </h3>
              <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                    <select 
                      value={newSlot}
                      onChange={(e) => setNewSlot(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                        <option value="">Select Time</option>
                        {Array.from({ length: 9 }).map((_, i) => {
                            const hour = i + 9; // Start at 9 AM
                            const time = hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 ${hour === 12 ? 'PM' : 'AM'}`;
                            const halfTime = hour > 12 ? `${hour - 12}:30 PM` : `${hour}:30 ${hour === 12 ? 'PM' : 'AM'}`;
                            return (
                                <React.Fragment key={hour}>
                                    <option value={time}>{time}</option>
                                    <option value={halfTime}>{halfTime}</option>
                                </React.Fragment>
                            );
                        })}
                    </select>
                 </div>
                 <button 
                   onClick={addSlot}
                   disabled={!newSlot}
                   className="w-full py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 flex justify-center items-center gap-2"
                 >
                    <Plus size={18} /> Add Slot
                 </button>
              </div>
           </div>

           <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800">
              <p className="font-bold mb-1">Note:</p>
              <p>These slots repeat weekly. To block specific dates, please use the vacation mode in your profile settings.</p>
           </div>
        </div>

        {/* Slots List */}
        <div className="md:col-span-2">
           <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                 <h3 className="font-bold text-slate-700 flex items-center gap-2">
                    <Calendar size={18} /> Current Schedule
                 </h3>
                 <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                    {slots.length} Active Slots
                 </span>
              </div>
              
              {slots.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                      {slots.map((slot) => (
                          <div key={slot} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                              <div className="flex items-center gap-3">
                                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                                      <Clock size={18} />
                                  </div>
                                  <span className="font-medium text-slate-900">{slot}</span>
                              </div>
                              <button 
                                onClick={() => removeSlot(slot)}
                                className="text-slate-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                              >
                                  <Trash2 size={18} />
                              </button>
                          </div>
                      ))}
                  </div>
              ) : (
                  <div className="p-12 text-center text-slate-400">
                      No availability slots configured.
                  </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSchedule;