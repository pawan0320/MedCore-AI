import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Role, User, Doctor, MedicalProfile } from '../types';
import { 
  User as UserIcon, 
  Shield, 
  Settings, 
  Activity, 
  Briefcase, 
  Save, 
  Loader2, 
  Lock,
  Smartphone,
  Eye,
  EyeOff,
  Bell,
  Moon,
  Globe,
  FileText,
  AlertCircle
} from 'lucide-react';
import { countryCodes } from '../data/countryCodes';

const ProfileSettings: React.FC = () => {
  const { user, updateUserContext } = useAuth();
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'MEDICAL' | 'PROFESSIONAL' | 'SECURITY' | 'PREFS'>('GENERAL');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Local state for forms
  const [formData, setFormData] = useState<Partial<User & Doctor>>({ ...user });
  
  // Phone Separation State
  const [phoneCode, setPhoneCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Initial load parsing for phone number
  useEffect(() => {
    if (user?.phone) {
        // Try to match a known country code sorted by length desc to match +1-268 before +1
        const sortedCodes = [...countryCodes].sort((a, b) => b.dial_code.length - a.dial_code.length);
        const match = sortedCodes.find(c => user.phone?.startsWith(c.dial_code));
        
        if (match) {
            setPhoneCode(match.dial_code);
            setPhoneNumber(user.phone.slice(match.dial_code.length).trim());
        } else {
            // Fallback
            setPhoneNumber(user.phone);
        }
    }
  }, [user]);
  
  // Handlers
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMedicalChange = (field: keyof MedicalProfile, value: any) => {
    setFormData(prev => ({
      ...prev,
      medicalProfile: {
        ...prev.medicalProfile,
        [field]: value
      } as MedicalProfile
    }));
  };
  
  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
        ...prev,
        [parent]: {
            // @ts-ignore
            ...prev[parent],
            [field]: value
        }
    }));
  };

  const saveChanges = async () => {
    setLoading(true);
    setSuccessMsg('');
    
    // Merge Phone
    const updatedData = {
        ...formData,
        phone: `${phoneCode} ${phoneNumber}`
    };

    try {
      await updateUserContext(updatedData);
      setSuccessMsg('Profile updated successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage your account settings and preferences.</p>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 space-y-2">
          <TabButton 
             active={activeTab === 'GENERAL'} 
             onClick={() => setActiveTab('GENERAL')} 
             icon={<UserIcon size={18}/>} 
             label="General Info" 
          />
          
          {user.role === Role.PATIENT && (
             <TabButton 
                active={activeTab === 'MEDICAL'} 
                onClick={() => setActiveTab('MEDICAL')} 
                icon={<Activity size={18}/>} 
                label="Medical Profile" 
             />
          )}

          {user.role === Role.DOCTOR && (
             <TabButton 
                active={activeTab === 'PROFESSIONAL'} 
                onClick={() => setActiveTab('PROFESSIONAL')} 
                icon={<Briefcase size={18}/>} 
                label="Professional Info" 
             />
          )}

          <TabButton 
             active={activeTab === 'SECURITY'} 
             onClick={() => setActiveTab('SECURITY')} 
             icon={<Shield size={18}/>} 
             label="Security & Access" 
          />
          
          <TabButton 
             active={activeTab === 'PREFS'} 
             onClick={() => setActiveTab('PREFS')} 
             icon={<Settings size={18}/>} 
             label="Preferences" 
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 min-h-[500px]">
           {successMsg && (
              <div className="mb-4 p-3 bg-white dark:bg-slate-800 border border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-lg flex items-center gap-2 text-sm animate-in fade-in slide-in-from-top-2">
                  <Activity size={16} /> {successMsg}
              </div>
           )}

           {/* GENERAL TAB */}
           {activeTab === 'GENERAL' && (
             <div className="space-y-6">
               <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <img src={formData.avatar} alt="Profile" className="w-20 h-20 rounded-full border-2 border-slate-100 dark:border-slate-700 object-cover" />
                    <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full hover:bg-blue-700 border-2 border-white dark:border-slate-800">
                        <Settings size={12} />
                    </button>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{user.name}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm capitalize">{user.role.toLowerCase()}</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroup label="Full Name" value={formData.name} onChange={(v) => handleInputChange('name', v)} />
                  <InputGroup label="Email Address" value={formData.email} onChange={(v) => handleInputChange('email', v)} disabled />
                  
                  {/* Phone Input with Country Selector */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
                    <div className="flex gap-2">
                        <select
                        value={phoneCode}
                        onChange={(e) => setPhoneCode(e.target.value)}
                        className="w-32 px-2 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-950 dark:text-white text-sm"
                        >
                        {countryCodes.map((country) => (
                            <option key={country.code} value={country.dial_code}>
                            {country.code} ({country.dial_code})
                            </option>
                        ))}
                        </select>
                        <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-950 dark:text-white"
                        placeholder="123 456 7890"
                        />
                    </div>
                  </div>

                  <InputGroup label="Address" value={formData.address || ''} onChange={(v) => handleInputChange('address', v)} placeholder="123 Main St" />
                  <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Gender</label>
                      <select 
                        value={formData.gender || ''} 
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        className="p-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-950 dark:text-white"
                      >
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                      </select>
                  </div>
                  <InputGroup label="Date of Birth" type="date" value={formData.dob || ''} onChange={(v) => handleInputChange('dob', v)} />
               </div>
             </div>
           )}

           {/* MEDICAL TAB (Patient Only) */}
           {activeTab === 'MEDICAL' && user.role === Role.PATIENT && (
             <div className="space-y-6">
               <div className="bg-white dark:bg-slate-800 border border-blue-100 dark:border-blue-900/30 p-4 rounded-lg flex items-start gap-3">
                  <Lock className="text-blue-600 dark:text-blue-400 mt-0.5" size={18} />
                  <div>
                      <h4 className="font-bold text-blue-900 dark:text-blue-200 text-sm">HIPAA Protected Information</h4>
                      <p className="text-blue-700 dark:text-blue-300 text-xs mt-1">
                          This data is encrypted and only visible to doctors you authorize during consultations.
                      </p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroup label="Height" value={formData.medicalProfile?.height || ''} onChange={(v) => handleMedicalChange('height', v)} placeholder="e.g. 175 cm" />
                  <InputGroup label="Weight" value={formData.medicalProfile?.weight || ''} onChange={(v) => handleMedicalChange('weight', v)} placeholder="e.g. 70 kg" />
                  <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Blood Group</label>
                      <select 
                        value={formData.medicalProfile?.bloodGroup || ''} 
                        onChange={(e) => handleMedicalChange('bloodGroup', e.target.value)}
                        className="p-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-950 dark:text-white"
                      >
                          <option value="">Select</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                      </select>
                  </div>
                  <InputGroup label="Emergency Contact" value={formData.medicalProfile?.emergencyContact || ''} onChange={(v) => handleMedicalChange('emergencyContact', v)} placeholder="Name & Phone" />
               </div>
               
               <div className="space-y-4">
                   <TextAreaGroup label="Allergies (Comma separated)" value={formData.medicalProfile?.allergies?.join(', ') || ''} onChange={(v) => handleMedicalChange('allergies', v.split(', '))} />
                   <TextAreaGroup label="Chronic Conditions" value={formData.medicalProfile?.conditions?.join(', ') || ''} onChange={(v) => handleMedicalChange('conditions', v.split(', '))} />
                   <TextAreaGroup label="Current Medications" value={formData.medicalProfile?.medications?.join(', ') || ''} onChange={(v) => handleMedicalChange('medications', v.split(', '))} />
               </div>
             </div>
           )}

           {/* PROFESSIONAL TAB (Doctor Only) */}
           {activeTab === 'PROFESSIONAL' && user.role === Role.DOCTOR && (
               <div className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <InputGroup label="Specialization" value={(formData as Doctor).specialization} onChange={(v) => handleInputChange('specialization', v)} />
                       <InputGroup label="Hospital / Clinic" value={(formData as Doctor).hospital} onChange={(v) => handleInputChange('hospital', v)} />
                       <InputGroup label="Experience (Years)" type="number" value={(formData as Doctor).experience} onChange={(v) => handleInputChange('experience', parseInt(v))} />
                       <InputGroup label="Consultation Fee ($)" type="number" value={(formData as Doctor).consultationFee || ''} onChange={(v) => handleInputChange('consultationFee', parseInt(v))} />
                       <InputGroup label="License Number" value={(formData as Doctor).licenseNumber || ''} onChange={(v) => handleInputChange('licenseNumber', v)} />
                       <div className="flex flex-col gap-1">
                           <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Verification Status</label>
                           <div className="p-2 bg-white dark:bg-slate-950 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-lg text-sm font-semibold flex items-center gap-2">
                               <Shield size={14}/> {(formData as Doctor).verificationStatus || 'PENDING'}
                           </div>
                       </div>
                   </div>
                   <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900">
                       <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-2">Upload Documents</h4>
                       <div className="flex items-center gap-4">
                           <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-slate-200 flex items-center gap-2">
                               <FileText size={16} /> Medical License
                           </button>
                           <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-slate-200 flex items-center gap-2">
                               <FileText size={16} /> ID Proof
                           </button>
                       </div>
                   </div>
               </div>
           )}

           {/* SECURITY TAB */}
           {activeTab === 'SECURITY' && (
             <div className="space-y-6">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-6">
                   <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Password & Authentication</h3>
                   <div className="space-y-4 max-w-md">
                       <button className="w-full text-left px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex justify-between items-center group">
                           <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Change Password</span>
                           <Lock size={16} className="text-slate-400 group-hover:text-blue-600" />
                       </button>
                       
                       <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                           <div className="flex items-center gap-3">
                               <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full"><Smartphone size={20} className="text-slate-600 dark:text-slate-400"/></div>
                               <div>
                                   <p className="text-sm font-bold text-slate-900 dark:text-white">Two-Factor Authentication</p>
                                   <p className="text-xs text-slate-500 dark:text-slate-400">Secure your account with 2FA</p>
                               </div>
                           </div>
                           <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={formData.preferences?.twoFactorEnabled} 
                                onChange={(e) => handleNestedChange('preferences', 'twoFactorEnabled', e.target.checked)}
                              />
                              <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                           </label>
                       </div>
                   </div>
                </div>

                <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Active Sessions</h3>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">Chrome on macOS</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">New York, USA • Current Session</p>
                            </div>
                        </div>
                        <button className="text-xs text-red-600 font-medium hover:underline">Revoke</button>
                    </div>
                </div>
             </div>
           )}

           {/* PREFERENCES TAB */}
           {activeTab === 'PREFS' && (
             <div className="space-y-8">
                 <div className="space-y-4">
                     <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2"><Bell size={18} /> Notifications</h3>
                     <div className="flex items-center gap-2">
                        <input type="checkbox" checked={formData.preferences?.emailNotifications} onChange={(e) => handleNestedChange('preferences', 'emailNotifications', e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500"/>
                        <span className="text-sm text-slate-700 dark:text-slate-300">Email Notifications</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <input type="checkbox" checked={formData.preferences?.smsNotifications} onChange={(e) => handleNestedChange('preferences', 'smsNotifications', e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500"/>
                        <span className="text-sm text-slate-700 dark:text-slate-300">SMS Notifications</span>
                     </div>
                 </div>

                 <div className="space-y-4">
                     <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2"><Globe size={18} /> Appearance & Language</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Language</label>
                            <select 
                                value={formData.preferences?.language || 'English'} 
                                onChange={(e) => handleNestedChange('preferences', 'language', e.target.value)}
                                className="p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 dark:text-white"
                            >
                                <option>English</option>
                                <option>Spanish</option>
                                <option>French</option>
                            </select>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                           <span className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2"><Moon size={16} /> Dark Mode</span>
                           <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                className="sr-only peer"
                                checked={formData.preferences?.darkMode}
                                onChange={(e) => handleNestedChange('preferences', 'darkMode', e.target.checked)} 
                               />
                              <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-900"></div>
                           </label>
                        </div>
                     </div>
                 </div>
                 
                 {user.role === Role.PATIENT && (
                     <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                         <h3 className="font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2 text-red-600"><AlertCircle size={18} /> Danger Zone</h3>
                         <button className="px-4 py-2 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-lg text-sm hover:bg-red-50 dark:hover:bg-red-900/20 font-medium">
                             Delete Account
                         </button>
                     </div>
                 )}
             </div>
           )}

           {/* Save Button */}
           <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
               <button 
                 onClick={saveChanges}
                 disabled={loading}
                 className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
               >
                   {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                   Save Changes
               </button>
           </div>
        </div>
      </div>
    </div>
  );
};

// Sub-components for cleaner code
const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
    <button 
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${active ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
    >
        {icon} {label}
    </button>
);

const InputGroup = ({ label, value, onChange, type = "text", placeholder, disabled = false }: any) => (
    <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
        <input 
            type={type} 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder={placeholder}
            className="p-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-500 dark:disabled:text-slate-400 bg-white dark:bg-slate-950 dark:text-white"
        />
    </div>
);

const TextAreaGroup = ({ label, value, onChange }: any) => (
    <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
        <textarea 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            className="p-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-white dark:bg-slate-950 dark:text-white"
        />
    </div>
);

export default ProfileSettings;