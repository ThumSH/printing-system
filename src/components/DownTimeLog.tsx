import React, { useState } from 'react';
import { DowntimeRecord } from '../types';

interface DowntimeLogProps {
  records: DowntimeRecord[];
  setRecords: React.Dispatch<React.SetStateAction<DowntimeRecord[]>>;
  userRole: 'admin' | 'development' | 'worker';
  userName: string;
}

const DOWNTIME_CATEGORIES = [
  "Input Delay", "Ink Delay", "Screen Printing", "Glass Cleaning",
  "Correction", "Style Change", "Trainee", "Absent"
];

export default function DowntimeLog({ records, setRecords, userRole, userName }: DowntimeLogProps) {
  // State for new entries
  const [inputs, setInputs] = useState<{ [key: string]: { hours: string; reason: string; ack: string } }>({});

  // State for editing existing entries
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState({ hours: '', reason: '' });

  // --- HANDLERS FOR NEW ENTRIES ---
  const handleInputChange = (category: string, field: string, value: string) => {
    setInputs(prev => ({
      ...prev,
      [category]: { ...(prev[category] || { hours: '', reason: '', ack: '' }), [field]: value }
    }));
  };

  const handleAddRow = (category: string) => {
    const data = inputs[category];
    
    // 1. VALIDATION: Check Hours
    if (!data || !data.hours || parseFloat(data.hours) <= 0) {
      alert(`Please enter valid Hours for ${category}`);
      return;
    }

    // 2. VALIDATION: Check Reason (Compulsory for Workers)
    if (!data.reason || data.reason.trim() === "") {
      alert(`Reason / Remarks is compulsory for ${category}`);
      return;
    }

    const newRecord: DowntimeRecord = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      category: category,
      hours: parseFloat(data.hours),
      reason: data.reason,
      acknowledgedBy: userRole === 'admin' ? (data.ack || userName) : 'Pending Ack'
    };

    setRecords([newRecord, ...records]);
    setInputs(prev => ({ ...prev, [category]: { hours: '', reason: '', ack: '' } }));
  };

  // --- HANDLERS FOR EDITING ---
  const startEdit = (record: DowntimeRecord) => {
    setEditingId(record.id);
    setEditFormData({ 
      hours: record.hours.toString(), 
      reason: record.reason 
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFormData({ hours: '', reason: '' });
  };

  const saveEdit = (id: number) => {
    if (!editFormData.hours || parseFloat(editFormData.hours) <= 0) {
      alert("Hours must be valid.");
      return;
    }
    if (!editFormData.reason.trim()) {
      alert("Reason is compulsory.");
      return;
    }

    setRecords(prev => prev.map(r => r.id === id ? { 
      ...r, 
      hours: parseFloat(editFormData.hours), 
      reason: editFormData.reason 
    } : r));
    
    setEditingId(null);
  };

  // --- ADMIN ACTIONS ---
  const handleAcknowledge = (id: number) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, acknowledgedBy: userName } : r));
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this record?")) {
      setRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 mt-8">
      
      {/* INPUT SECTION */}
      <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6 shadow-xl mb-10">
        <h2 className="text-sm font-bold text-white mb-6 uppercase tracking-wider border-b border-neutral-800 pb-2">Log Production Stoppage</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="text-neutral-500 text-[10px] uppercase font-bold border-b border-neutral-800">
                <th className="p-4 w-1/4">Downtime Category</th>
                <th className="p-4 w-32 text-center text-orange-400">Hours</th>
                <th className="p-4">Reason / Remarks (Req)</th>
                <th className="p-4 w-48">Acknowledged By</th>
                <th className="p-4 w-24 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {DOWNTIME_CATEGORIES.map((category) => {
                const rowData = inputs[category] || { hours: '', reason: '', ack: '' };
                return (
                  <tr key={category} className="hover:bg-neutral-800/20 transition-colors">
                    <td className="p-4"><span className="font-bold text-sm text-neutral-300">{category}</span></td>
                    <td className="p-4">
                      <input 
                        type="number" 
                        placeholder="0.0" 
                        value={rowData.hours} 
                        onChange={(e) => handleInputChange(category, 'hours', e.target.value)} 
                        className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-center text-white focus:border-orange-500 outline-none font-mono" 
                      />
                    </td>
                    <td className="p-4">
                      <input 
                        type="text" 
                        placeholder="Required..." 
                        value={rowData.reason} 
                        onChange={(e) => handleInputChange(category, 'reason', e.target.value)} 
                        className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-white focus:border-blue-500 outline-none placeholder:text-neutral-600" 
                      />
                    </td>
                    <td className="p-4">
                      <input 
                        type="text" 
                        placeholder={userRole === 'admin' ? "Sign off name" : "Admin Only"}
                        value={rowData.ack}
                        disabled={userRole !== 'admin'}
                        onChange={(e) => handleInputChange(category, 'ack', e.target.value)} 
                        className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-white focus:border-blue-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed" 
                      />
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => handleAddRow(category)} className="bg-neutral-800 hover:bg-white hover:text-black text-white p-2 rounded-lg transition-all shadow-lg" title="Add to Log">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SUMMARY TABLE */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="p-4 bg-neutral-900 border-b border-neutral-800 flex justify-between items-center">
          <h3 className="text-sm font-bold text-white">Downtime Summary</h3>
          <span className="text-xs text-neutral-500">Total Records: {records.length}</span>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="bg-neutral-900/50 text-neutral-500 text-[10px] uppercase font-bold border-b border-neutral-800">
              <th className="p-4">Date</th>
              <th className="p-4">Category</th>
              <th className="p-4 text-center">Hours Lost</th>
              <th className="p-4">Reason</th>
              <th className="p-4 text-right">Acknowledged By</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/50">
            {records.length === 0 ? (
               <tr><td colSpan={6} className="p-8 text-center text-neutral-500">No downtime recorded today.</td></tr>
            ) : (
              records.map(record => {
                const isEditing = editingId === record.id;
                const isLocked = record.acknowledgedBy !== 'Pending Ack'; // Lock if Admin approved

                return (
                  <tr key={record.id} className="hover:bg-white/[0.02]">
                    <td className="p-4 text-xs text-neutral-400 font-mono">{record.date}</td>
                    
                    {/* Category (Read Only) */}
                    <td className="p-4 text-sm font-bold text-white">{record.category}</td>
                    
                    {/* Hours (Editable) */}
                    <td className="p-4 text-center">
                      {isEditing ? (
                         <input 
                           type="number" 
                           value={editFormData.hours}
                           onChange={(e) => setEditFormData({...editFormData, hours: e.target.value})}
                           className="w-20 bg-neutral-800 border border-blue-500 rounded px-2 py-1 text-sm text-center text-white outline-none"
                         />
                      ) : (
                         <span className="px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded font-mono font-bold text-xs">{record.hours} hrs</span>
                      )}
                    </td>

                    {/* Reason (Editable) */}
                    <td className="p-4 text-sm text-neutral-300">
                      {isEditing ? (
                         <input 
                           type="text" 
                           value={editFormData.reason}
                           onChange={(e) => setEditFormData({...editFormData, reason: e.target.value})}
                           className="w-full bg-neutral-800 border border-blue-500 rounded px-2 py-1 text-sm text-white outline-none"
                         />
                      ) : (
                        record.reason
                      )}
                    </td>

                    {/* Status (Read Only) */}
                    <td className="p-4 text-right text-xs uppercase font-medium">
                      {record.acknowledgedBy === 'Pending Ack' ? (
                         <span className="text-orange-400 font-bold bg-orange-500/10 px-2 py-1 rounded">Pending</span>
                      ) : (
                         <span className="text-green-400">{record.acknowledgedBy}</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-3">
                        
                        {/* EDIT MODE ACTIONS */}
                        {isEditing ? (
                          <>
                            <button onClick={() => saveEdit(record.id)} className="text-green-500 hover:bg-green-500/10 p-1 rounded" title="Save">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            </button>
                            <button onClick={cancelEdit} className="text-neutral-500 hover:bg-neutral-800 p-1 rounded" title="Cancel">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                          </>
                        ) : (
                          <>
                            {/* ADMIN ACKNOWLEDGE BUTTON */}
                            {userRole === 'admin' && !isLocked && (
                              <button onClick={() => handleAcknowledge(record.id)} className="text-[10px] font-bold text-blue-400 border border-blue-400/30 hover:bg-blue-600 hover:text-white px-2 py-1 rounded transition-all">
                                ACK
                              </button>
                            )}

                            {/* WORKER UPDATE/DELETE (Only if not locked) */}
                            {!isLocked && (
                              <>
                                <button onClick={() => startEdit(record)} className="text-neutral-500 hover:text-blue-400 transition-colors pt-0.5" title="Edit">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                                </button>
                                <button onClick={() => handleDelete(record.id)} className="text-neutral-600 hover:text-red-500 transition-colors pt-0.5" title="Delete">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                </button>
                              </>
                            )}
                            
                            {/* LOCKED INDICATOR */}
                            {isLocked && <span className="text-neutral-600">🔒</span>}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}