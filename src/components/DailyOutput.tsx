import React, { useState, useMemo, useEffect } from 'react';
import { LoadingPlanItem, DailyOutputRecord, HourlyProduction } from '../types';

interface DailyOutputProps {
  plans: LoadingPlanItem[];
  outputs: DailyOutputRecord[];
  setOutputs: React.Dispatch<React.SetStateAction<DailyOutputRecord[]>>;
  userRole: 'admin' | 'development' | 'worker'; // <--- NEW PROP
}

// Default slots (fallback)
const DEFAULT_SLOTS = [
  "08:30 - 09:30", "09:30 - 10:30", "10:30 - 11:30", 
  "11:30 - 12:30", "12:30 - 01:30", "01:30 - 02:30",
  "02:30 - 03:30", "03:30 - 04:30", "04:30 - 05:30", "05:30 - 06:30"
];

interface OutputErrors {
  customer?: string;
  style?: string;
  dailyTarget?: string;
}

export default function DailyOutput({ plans, outputs, setOutputs, userRole }: DailyOutputProps) {
  // --- 1. SELECTION STATE ---
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [dailyTarget, setDailyTarget] = useState('');
  const [errors, setErrors] = useState<OutputErrors>({});

  // --- 2. TIME SLOT STATE ---
  // We initialize hourlyData based on the default slots initially
  const [hourlyData, setHourlyData] = useState<HourlyProduction[]>(
    DEFAULT_SLOTS.map(slot => ({
      timeSlot: slot,
      seating: 0, printing: 0, curing: 0, checking: 0, packing: 0, dispatch: 0, rejects: 0
    }))
  );

  // State to toggle editing mode for time slots
  const [isEditingSlots, setIsEditingSlots] = useState(false);

  // --- MEMOIZED DATA ---
  const customers = useMemo(() => [...new Set(plans.map(p => p.customer))], [plans]);
  
  const availablePlans = useMemo(() => {
    if (!selectedCustomer) return [];
    return plans.filter(p => p.customer === selectedCustomer);
  }, [plans, selectedCustomer]);

  const selectedPlan = useMemo(() => 
    plans.find(p => p.id.toString() === selectedPlanId), 
  [plans, selectedPlanId]);

  // --- HANDLERS ---

  // Handle data entry in the grid (Production Numbers)
  const handleGridChange = (index: number, field: keyof HourlyProduction, value: string) => {
    // Prevent negative numbers
    if (parseInt(value) < 0) return;

    const numValue = value === '' ? 0 : parseInt(value);
    
    setHourlyData(prev => {
      const newData = [...prev];
      newData[index] = { ...newData[index], [field]: numValue };
      return newData;
    });
  };

  // Handle editing the Time Slot Labels (Admin Only)
  const handleSlotLabelChange = (index: number, newLabel: string) => {
    setHourlyData(prev => {
      const newData = [...prev];
      newData[index] = { ...newData[index], timeSlot: newLabel };
      return newData;
    });
  };

  // --- VALIDATION ---
  const validate = (): boolean => {
    const newErrors: OutputErrors = {};
    let isValid = true;

    if (!selectedCustomer) {
      newErrors.customer = "Customer is required";
      isValid = false;
    }
    if (!selectedPlanId) {
      newErrors.style = "Style is required";
      isValid = false;
    }
    // Check if target is empty or 0
    if (!dailyTarget || parseInt(dailyTarget) <= 0) {
      newErrors.dailyTarget = "Target must be > 0";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    if (!selectedPlan) return;

    const totalPrinting = hourlyData.reduce((sum, row) => sum + row.printing, 0);
    const totalPacking = hourlyData.reduce((sum, row) => sum + row.packing, 0);
    const totalDispatch = hourlyData.reduce((sum, row) => sum + row.dispatch, 0);
    const totalRejects = hourlyData.reduce((sum, row) => sum + row.rejects, 0);

    const newRecord: DailyOutputRecord = {
      id: Date.now(),
      planId: selectedPlan.id,
      date: new Date().toISOString().split('T')[0],
      customer: selectedPlan.customer,
      style: selectedPlan.style,
      dailyTarget: parseInt(dailyTarget),
      hourlyData: JSON.parse(JSON.stringify(hourlyData)), // Deep copy to prevent ref issues
      totalPrinting,
      totalPacking,
      totalDispatch,
      totalRejects
    };

    setOutputs([newRecord, ...outputs]);
    
    // Reset Data but KEEP the modified time slots for the next entry
    setHourlyData(prev => prev.map(row => ({
      ...row,
      seating: 0, printing: 0, curing: 0, checking: 0, packing: 0, dispatch: 0, rejects: 0
    })));
    setDailyTarget('');
    setErrors({});
    alert("Production Output Saved!");
  };

  return (
    <div className="max-w-7xl mx-auto px-6 mt-8">
      
      {/* Input Section */}
      <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6 shadow-xl mb-10">
        
        <h2 className="text-sm font-bold text-white mb-6 uppercase tracking-wider border-b border-neutral-800 pb-2">
          1. Job Selection
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Customer Select */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-neutral-500 ml-1">Customer</label>
            <select 
              value={selectedCustomer} 
              onChange={(e) => { 
                setSelectedCustomer(e.target.value); 
                setSelectedPlanId(''); 
                setErrors(prev => ({...prev, customer: undefined}));
              }}
              className={`w-full bg-neutral-950 border rounded-lg px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-blue-600 outline-none
                ${errors.customer ? 'border-red-500' : 'border-neutral-800'}`}
            >
              <option value="">Select Customer</option>
              {customers.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.customer && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.customer}</p>}
          </div>

          {/* Style Select */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-neutral-500 ml-1">Style No</label>
            <select 
              value={selectedPlanId} 
              onChange={(e) => {
                setSelectedPlanId(e.target.value);
                setErrors(prev => ({...prev, style: undefined}));
              }}
              disabled={!selectedCustomer}
              className={`w-full bg-neutral-950 border rounded-lg px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-blue-600 outline-none disabled:opacity-50
                ${errors.style ? 'border-red-500' : 'border-neutral-800'}`}
            >
              <option value="">Select Style</option>
              {availablePlans.map(p => <option key={p.id} value={p.id}>{p.style}</option>)}
            </select>
            {errors.style && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.style}</p>}
          </div>

          {/* PO Qty (Read Only) */}
          <div className="space-y-1.5">
             <label className="text-[10px] uppercase font-bold text-neutral-500 ml-1">PO Qty</label>
             <input disabled value={selectedPlan?.poQty || ''} className="w-full bg-neutral-800/50 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-neutral-400 font-mono" />
          </div>

          {/* Daily Target */}
          <div className="space-y-1.5">
             <label className="text-[10px] uppercase font-bold text-blue-400 ml-1">Daily Target (Manual)</label>
             <input 
               type="number" 
               value={dailyTarget} 
               onChange={(e) => {
                 setDailyTarget(e.target.value);
                 setErrors(prev => ({...prev, dailyTarget: undefined}));
               }}
               placeholder="Enter Target"
               className={`w-full bg-neutral-950 border rounded-lg px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-blue-600 outline-none
                ${errors.dailyTarget ? 'border-red-500' : 'border-blue-900/50'}`}
             />
             {errors.dailyTarget && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.dailyTarget}</p>}
          </div>
        </div>

        {/* --- SECTION 2 HEADER WITH ADMIN EDIT BUTTON --- */}
        <div className="flex justify-between items-end border-b border-neutral-800 pb-2 mb-6">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            2. Hourly Production Entry
          </h2>
          
          {userRole === 'admin' && (
            <button 
              onClick={() => setIsEditingSlots(!isEditingSlots)}
              className={`text-[10px] font-bold px-3 py-1 rounded border transition-colors
                ${isEditingSlots 
                  ? 'bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20' 
                  : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'}`}
            >
              {isEditingSlots ? '✓ SAVE SLOTS' : '✎ EDIT SLOTS'}
            </button>
          )}
        </div>

        {/* HOURLY GRID */}
        <div className="overflow-x-auto border border-neutral-800 rounded-xl mb-6">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-neutral-950 text-neutral-500 text-[10px] uppercase font-bold">
                <th className="p-3 border-b border-r border-neutral-800 w-40 sticky left-0 bg-neutral-950 z-10">
                   {isEditingSlots ? 'EDIT TIME SLOTS' : 'TIME SLOT'}
                </th>
                <th className="p-3 border-b border-neutral-800 text-center text-blue-400">Seating</th>
                <th className="p-3 border-b border-neutral-800 text-center text-green-400">Printing</th>
                <th className="p-3 border-b border-neutral-800 text-center text-orange-400">Curing</th>
                <th className="p-3 border-b border-neutral-800 text-center">Checking</th>
                <th className="p-3 border-b border-neutral-800 text-center">Packing</th>
                <th className="p-3 border-b border-neutral-800 text-center">Dispatch</th>
                <th className="p-3 border-b border-neutral-800 text-center text-red-500">Rejects</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {hourlyData.map((row, index) => (
                <tr key={index} className="hover:bg-white/[0.01]">
                  
                  {/* TIME SLOT COLUMN (Editable if Admin + Edit Mode) */}
                  <td className="p-2 border-r border-neutral-800 text-xs font-medium text-neutral-400 sticky left-0 bg-neutral-900">
                    {isEditingSlots ? (
                      <input 
                        type="text" 
                        value={row.timeSlot}
                        onChange={(e) => handleSlotLabelChange(index, e.target.value)}
                        className="w-full bg-neutral-800 text-white px-2 py-1 rounded border border-neutral-600 focus:border-blue-500 outline-none"
                      />
                    ) : (
                      row.timeSlot
                    )}
                  </td>

                  {['seating', 'printing', 'curing', 'checking', 'packing', 'dispatch'].map((field) => (
                    <td key={field} className="p-1">
                      <input 
                        type="number"
                        min="0"
                        value={row[field as keyof HourlyProduction] || ''}
                        onChange={(e) => handleGridChange(index, field as keyof HourlyProduction, e.target.value)}
                        className="w-full bg-transparent text-center text-sm text-white focus:bg-blue-900/20 focus:text-blue-400 outline-none rounded py-1 transition-colors font-mono"
                        placeholder="-"
                      />
                    </td>
                  ))}
                  
                  {/* Rejects Input */}
                  <td className="p-1">
                      <input 
                        type="number"
                        min="0"
                        value={row.rejects || ''}
                        onChange={(e) => handleGridChange(index, 'rejects', e.target.value)}
                        className="w-full bg-transparent text-center text-sm text-red-400 focus:bg-red-900/20 focus:text-red-400 outline-none rounded py-1 transition-colors font-mono"
                        placeholder="-"
                      />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <button 
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-full font-bold text-sm transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2"
          >
            ADD DAILY RECORD
          </button>
        </div>
      </div>

      {/* Summary Table (Unchanged visually, but uses updated data) */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="p-4 bg-neutral-900 border-b border-neutral-800 flex justify-between items-center">
          <h3 className="text-sm font-bold text-white">Submitted Output Logs</h3>
          <span className="text-xs text-neutral-500">{outputs.length} records</span>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-neutral-900/50 text-neutral-500 text-[10px] uppercase font-bold border-b border-neutral-800">
              <th className="p-4">Date</th>
              <th className="p-4">Customer / Style</th>
              <th className="p-4 text-right">Target</th>
              <th className="p-4 text-right text-green-400">Total Printed</th>
              <th className="p-4 text-right text-blue-400">Total Packed</th>
              <th className="p-4 text-right text-red-400">Rejects</th>
              <th className="p-4 text-right">Efficiency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/50">
            {outputs.length === 0 ? (
               <tr><td colSpan={7} className="p-8 text-center text-neutral-500">No output records added yet.</td></tr>
            ) : (
              outputs.map(record => {
                const efficiency = record.dailyTarget > 0 
                  ? Math.round((record.totalPrinting / record.dailyTarget) * 100) 
                  : 0;

                return (
                  <tr key={record.id} className="hover:bg-white/[0.02]">
                    <td className="p-4 text-xs text-neutral-400">{record.date}</td>
                    <td className="p-4">
                      <div className="text-white font-bold text-sm">{record.style}</div>
                      <div className="text-xs text-neutral-500">{record.customer}</div>
                    </td>
                    <td className="p-4 text-right font-mono text-sm text-neutral-300">{record.dailyTarget}</td>
                    <td className="p-4 text-right font-mono text-sm text-green-400 font-bold">{record.totalPrinting}</td>
                    <td className="p-4 text-right font-mono text-sm text-blue-400 font-bold">{record.totalPacking}</td>
                    <td className="p-4 text-right font-mono text-sm text-red-400 font-bold">{record.totalRejects}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs font-bold text-neutral-400">{efficiency}%</span>
                        <div className="w-16 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${efficiency >= 100 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${Math.min(efficiency, 100)}%` }}></div>
                        </div>
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