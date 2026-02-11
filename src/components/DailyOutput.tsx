import React, { useState, useMemo } from 'react';
import { LoadingPlanItem, DailyOutputRecord, HourlyProduction } from '../types';

interface DailyOutputProps {
  plans: LoadingPlanItem[];
  outputs: DailyOutputRecord[];
  setOutputs: React.Dispatch<React.SetStateAction<DailyOutputRecord[]>>;
}

const TIME_SLOTS = [
  "08:30 - 09:30", "09:30 - 10:30", "10:30 - 11:30", 
  "11:30 - 12:30", "12:30 - 01:30", "01:30 - 02:30",
  "02:30 - 03:30", "03:30 - 04:30", "04:30 - 05:30", "05:30 - 06:30"
];

// Initialize with rejects = 0
const createEmptyHourlyData = (): HourlyProduction[] => 
  TIME_SLOTS.map(slot => ({
    timeSlot: slot,
    seating: 0, printing: 0, curing: 0, checking: 0, packing: 0, dispatch: 0, rejects: 0
  }));

export default function DailyOutput({ plans, outputs, setOutputs }: DailyOutputProps) {
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  
  const [dailyTarget, setDailyTarget] = useState('');
  const [hourlyData, setHourlyData] = useState<HourlyProduction[]>(createEmptyHourlyData());

  const customers = useMemo(() => [...new Set(plans.map(p => p.customer))], [plans]);
  
  const availablePlans = useMemo(() => {
    if (!selectedCustomer) return [];
    return plans.filter(p => p.customer === selectedCustomer);
  }, [plans, selectedCustomer]);

  const selectedPlan = useMemo(() => 
    plans.find(p => p.id.toString() === selectedPlanId), 
  [plans, selectedPlanId]);

  const handleGridChange = (index: number, field: keyof HourlyProduction, value: string) => {
    const numValue = parseInt(value) || 0;
    setHourlyData(prev => {
      const newData = [...prev];
      newData[index] = { ...newData[index], [field]: numValue };
      return newData;
    });
  };

  const handleSubmit = () => {
    if (!selectedPlan || !dailyTarget) {
      alert("Please select a Style and enter a Daily Target.");
      return;
    }

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
      dailyTarget: parseInt(dailyTarget) || 0,
      hourlyData: hourlyData,
      totalPrinting,
      totalPacking,
      totalDispatch, // <--- NEW
      totalRejects   // <--- NEW
    };

    setOutputs([newRecord, ...outputs]);
    setHourlyData(createEmptyHourlyData());
    setDailyTarget('');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 mt-8">
      
      {/* Input Section */}
      <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6 shadow-xl mb-10">
        
        <h2 className="text-sm font-bold text-white mb-6 uppercase tracking-wider border-b border-neutral-800 pb-2">
          1. Job Selection
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-neutral-500 ml-1">Customer</label>
            <select 
              value={selectedCustomer} 
              onChange={(e) => { setSelectedCustomer(e.target.value); setSelectedPlanId(''); }}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-blue-600 outline-none"
            >
              <option value="">Select Customer</option>
              {customers.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-neutral-500 ml-1">Style No</label>
            <select 
              value={selectedPlanId} 
              onChange={(e) => setSelectedPlanId(e.target.value)}
              disabled={!selectedCustomer}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-blue-600 outline-none disabled:opacity-50"
            >
              <option value="">Select Style</option>
              {availablePlans.map(p => <option key={p.id} value={p.id}>{p.style}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
             <label className="text-[10px] uppercase font-bold text-neutral-500 ml-1">PO Qty</label>
             <input disabled value={selectedPlan?.poQty || ''} className="w-full bg-neutral-800/50 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-neutral-400 font-mono" />
          </div>

          <div className="space-y-1.5">
             <label className="text-[10px] uppercase font-bold text-blue-400 ml-1">Daily Target (Manual)</label>
             <input 
               type="number" 
               value={dailyTarget} 
               onChange={(e) => setDailyTarget(e.target.value)}
               placeholder="Enter Target"
               className="w-full bg-neutral-950 border border-blue-900/50 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-blue-600 outline-none" 
             />
          </div>
        </div>

        <h2 className="text-sm font-bold text-white mb-6 uppercase tracking-wider border-b border-neutral-800 pb-2">
          2. Hourly Production Entry
        </h2>

        {/* HOURLY GRID */}
        <div className="overflow-x-auto border border-neutral-800 rounded-xl mb-6">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-neutral-950 text-neutral-500 text-[10px] uppercase font-bold">
                <th className="p-3 border-b border-r border-neutral-800 w-32 sticky left-0 bg-neutral-950 z-10">Time Slot</th>
                <th className="p-3 border-b border-neutral-800 text-center text-blue-400">Seating</th>
                <th className="p-3 border-b border-neutral-800 text-center text-green-400">Printing</th>
                <th className="p-3 border-b border-neutral-800 text-center text-orange-400">Curing</th>
                <th className="p-3 border-b border-neutral-800 text-center">Checking</th>
                <th className="p-3 border-b border-neutral-800 text-center">Packing</th>
                <th className="p-3 border-b border-neutral-800 text-center">Dispatch</th>
                <th className="p-3 border-b border-neutral-800 text-center text-red-500">Rejects</th> {/* NEW COLUMN */}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {hourlyData.map((row, index) => (
                <tr key={row.timeSlot} className="hover:bg-white/[0.01]">
                  <td className="p-2 border-r border-neutral-800 text-xs font-medium text-neutral-400 sticky left-0 bg-neutral-900">
                    {row.timeSlot}
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

      {/* Summary Table */}
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
              <th className="p-4 text-right text-red-400">Rejects</th> {/* NEW COLUMN */}
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
                    <td className="p-4 text-right font-mono text-sm text-red-400 font-bold">{record.totalRejects}</td> {/* NEW DATA */}
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