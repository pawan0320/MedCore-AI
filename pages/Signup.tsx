import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { Activity, User, Stethoscope, ArrowRight, Loader2, CheckCircle, Shield } from 'lucide-react';
import { countryCodes } from '../data/countryCodes';

const Signup: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>(Role.PATIENT);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialization: '',
    hospital: '',
    licenseNumber: '',
  });
  const [phoneCode, setPhoneCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: role,
        phone: `${phoneCode} ${phoneNumber}`, // Combine code and number
        // Only include doctor fields if role is doctor
        ...(role === Role.DOCTOR && {
            specialization: formData.specialization,
            hospital: formData.hospital,
            licenseNumber: formData.licenseNumber
        })
      });
      
      // If Doctor, we don't get logged in automatically because of PENDING status
      if (role === Role.DOCTOR) {
          alert("Account created successfully! Your account is pending admin approval.");
          navigate('/login');
      } else {
          // Patient gets logged in automatically via context update in register
          navigate('/ai-assistant');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
         <div className="inline-flex items-center gap-2 text-blue-600 font-bold text-xl mb-2">
            <Activity /> MediCore AI
         </div>
         <h1 className="text-3xl font-bold text-slate-900">Create your account</h1>
         <p className="text-slate-500 mt-2">Join the future of healthcare technology</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-100">
        {/* Role Toggles */}
        <div className="grid grid-cols-2 p-2 bg-white border-b border-slate-100 gap-2">
           <button 
             type="button"
             onClick={() => setRole(Role.PATIENT)}
             className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
               role === Role.PATIENT 
               ? 'bg-blue-600 text-white shadow-md' 
               : 'text-slate-500 hover:bg-slate-50'
             }`}
           >
             <User size={18} /> Patient
           </button>
           <button 
             type="button"
             onClick={() => setRole(Role.DOCTOR)}
             className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
               role === Role.DOCTOR 
               ? 'bg-emerald-600 text-white shadow-md' 
               : 'text-slate-500 hover:bg-slate-50'
             }`}
           >
             <Stethoscope size={18} /> Doctor
           </button>
        </div>

        <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
               {error && (
                 <div className="p-3 bg-white border border-red-100 text-red-600 text-sm rounded-lg">
                   {error}
                 </div>
               )}

               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    placeholder="John Doe"
                  />
               </div>

               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    placeholder="you@example.com"
                  />
               </div>

               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                  <div className="flex gap-2">
                    <select
                      value={phoneCode}
                      onChange={(e) => setPhoneCode(e.target.value)}
                      className="w-32 px-2 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
                    >
                      {countryCodes.map((country) => (
                        <option key={country.code} value={country.dial_code}>
                          {country.code} ({country.dial_code})
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      placeholder="123 456 7890"
                    />
                  </div>
               </div>
               
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    placeholder="••••••••"
                  />
               </div>

               {/* Doctor Specific Fields */}
               {role === Role.DOCTOR && (
                   <div className="space-y-5 pt-2 animate-in fade-in slide-in-from-top-4">
                       <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Medical License Number</label>
                          <div className="relative">
                              <Shield className="absolute left-3 top-3 text-emerald-500" size={16} />
                              <input
                                type="text"
                                required
                                value={formData.licenseNumber}
                                onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                                placeholder="MD-12345-US"
                              />
                          </div>
                       </div>

                       <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Specialization</label>
                          <select 
                             required
                             value={formData.specialization}
                             onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                             className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                          >
                             <option value="">Select Specialization</option>
                             <option value="Cardiologist">Cardiologist</option>
                             <option value="Dermatologist">Dermatologist</option>
                             <option value="General Practitioner">General Practitioner</option>
                             <option value="Pediatrician">Pediatrician</option>
                             <option value="Neurologist">Neurologist</option>
                             <option value="Orthopedic">Orthopedic</option>
                          </select>
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Hospital / Clinic Name</label>
                          <input
                            type="text"
                            required
                            value={formData.hospital}
                            onChange={(e) => setFormData({...formData, hospital: e.target.value})}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                            placeholder="City General Hospital"
                          />
                       </div>
                       
                       <div className="bg-white p-4 rounded-lg border border-amber-200 text-sm text-amber-800 flex gap-3">
                          <CheckCircle className="shrink-0" size={18} />
                          <p>Doctor accounts require Admin verification. You will not be able to login until your license is verified.</p>
                       </div>
                   </div>
               )}

               <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-4 rounded-lg font-bold text-white shadow-lg transition-all hover:scale-[1.02] flex justify-center items-center gap-2 ${
                        role === Role.DOCTOR ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {loading ? <Loader2 className="animate-spin" /> : 'Create Account'}
                    <ArrowRight size={18} />
                  </button>
               </div>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500">
               Already have an account? <Link to="/login" className="text-blue-600 font-semibold hover:underline">Log in</Link>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;