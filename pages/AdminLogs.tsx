import React from 'react';
import { AlertTriangle, Info, CheckCircle, Shield } from 'lucide-react';

const AdminLogs: React.FC = () => {
  const logs = [
      { id: 1, level: 'CRITICAL', msg: 'Emergency SOS triggered by User[p1] at 40.7128, -74.0060', time: '10 mins ago' },
      { id: 2, level: 'INFO', msg: 'New Doctor Registration: Dr. Strange (Cardiology)', time: '1 hour ago' },
      { id: 3, level: 'WARN', msg: 'Failed login attempt from IP 192.168.1.1', time: '2 hours ago' },
      { id: 4, level: 'SUCCESS', msg: 'System backup completed successfully', time: '5 hours ago' },
      { id: 5, level: 'INFO', msg: 'Appointment #a123 marked as COMPLETED', time: '6 hours ago' },
  ];

  return (
    <div className="space-y-6">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">System Audit Logs</h1>
           <p className="text-slate-500">Monitor system activities, security events, and errors.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="divide-y divide-slate-100">
                {logs.map(log => (
                    <div key={log.id} className="p-4 flex items-center gap-4 hover:bg-slate-50">
                        <div className={`p-2 rounded-lg ${
                            log.level === 'CRITICAL' ? 'bg-red-100 text-red-600' :
                            log.level === 'WARN' ? 'bg-orange-100 text-orange-600' :
                            log.level === 'SUCCESS' ? 'bg-green-100 text-green-600' :
                            'bg-blue-100 text-blue-600'
                        }`}>
                            {log.level === 'CRITICAL' && <AlertTriangle size={18} />}
                            {log.level === 'WARN' && <Shield size={18} />}
                            {log.level === 'SUCCESS' && <CheckCircle size={18} />}
                            {log.level === 'INFO' && <Info size={18} />}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">{log.msg}</p>
                            <p className="text-xs text-slate-500">{log.time}</p>
                        </div>
                        <span className="text-xs font-bold text-slate-400 border border-slate-200 px-2 py-1 rounded">
                            {log.level}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default AdminLogs;