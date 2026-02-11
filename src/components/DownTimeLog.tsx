import React, { useState } from 'react';
import { DowntimeRecord } from '../types';

interface DowntimeLogProps {
  records: DowntimeRecord[];
  setRecords: React.Dispatch<React.SetStateAction<DowntimeRecord[]>>;
}

// The fixed list of downtime categories
const DOWNTIME_CATEGORIES = [
  "Input Delay",
  "Ink Delay",
  "Screen Printing", // Assuming 'Screen Breakdown' or similar context
  "Glass Cleaning",
  "Correction",
  "Style Change",
  "Trainee",
  "Absent"
];

export default function DowntimeLog({ records, setRecords }: DowntimeLogProps) {
  // State to hold input values for ALL rows simultaneously
  // Structure: { "Input Delay": { hours: "", reason: "", ack: "" }, ... }
  const [inputs, setInputs] = useState<{
    [key: string]: { hours: string; reason: string; ack: string };
  }>({});

  // Helper to update specific row data
  const handleInputChange = (category: string, field: string, value: string) => {
    setInputs(prev => ({
      ...prev,
      [category]: {
        ...(prev[category] || { hours: '', reason: '', ack: '' }),
        [field]: value
      }
    }));
  };

  // Helper to add a specific row to the history
  const handleAddRow = (category: string) => {
    const data = inputs[category];
    
    // Validation: Must have at least Hours
    if (!data || !data.hours) {
      alert(`Please enter Hours for ${category}`);
      return;
    }

    const newRecord: DowntimeRecord = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0], // Today's date
      category: category,
      hours: parseFloat(data.hours) || 0,
      reason: data.reason || 'N/A',
      acknowledgedBy: data.ack || 'N/A'
    };

    setRecords([newRecord, ...records]);

    // Clear just this row's inputs
    setInputs(prev => ({
      ...prev,
      [category]: { hours: '', reason: '', ack: '' }
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-6 mt-8">
      
      {/* --- INPUT SECTION (Fixed Rows) --- */}
      <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6 shadow-xl mb-10">
        <h2 className="text-sm font-bold text-white mb-6 uppercase tracking-wider border-b border-neutral-800 pb-2">
          Log Production Stoppage
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="text-neutral-500 text-[10px] uppercase font-bold border-b border-neutral-800">
                <th className="p-4 w-1/4">Downtime Category</th>
                <th className="p-4 w-32 text-center text-orange-400">Hours</th>
                <th className="p-4">Reason / Remarks</th>
                <th className="p-4 w-48">Acknowledged By</th>
                <th className="p-4 w-24 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {DOWNTIME_CATEGORIES.map((category) => {
                const rowData = inputs[category] || { hours: '', reason: '', ack: '' };
                
                return (
                  <tr key={category} className="hover:bg-neutral-800/20 transition-colors">
                    <td className="p-4">
                      <span className="font-bold text-sm text-neutral-300">{category}</span>
                    </td>
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
                        placeholder="Details..."
                        value={rowData.reason}
                        onChange={(e) => handleInputChange(category, 'reason', e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                      />
                    </td>
                    <td className="p-4">
                      <input 
                        type="text" 
                        placeholder="Name"
                        value={rowData.ack}
                        onChange={(e) => handleInputChange(category, 'ack', e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                      />
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleAddRow(category)}
                        className="bg-neutral-800 hover:bg-white hover:text-black text-white p-2 rounded-lg transition-all"
                        title="Add to Log"
                      >
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

      {/* --- SUMMARY TABLE --- */}
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
              records.map(record => (
                <tr key={record.id} className="hover:bg-white/[0.02]">
                  <td className="p-4 text-xs text-neutral-400 font-mono">{record.date}</td>
                  <td className="p-4 text-sm font-bold text-white">{record.category}</td>
                  <td className="p-4 text-center">
                    <span className="px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded font-mono font-bold text-xs">
                      {record.hours} hrs
                    </span>
                  </td>
                  <td className="p-4 text-sm text-neutral-300">{record.reason}</td>
                  <td className="p-4 text-right text-xs text-neutral-400 font-medium uppercase">{record.acknowledgedBy}</td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => setRecords(records.filter(r => r.id !== record.id))}
                      className="text-neutral-600 hover:text-red-500 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}