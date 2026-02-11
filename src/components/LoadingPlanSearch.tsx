import React, { useState, useMemo } from 'react';
import { LoadingPlanItem } from '../types';

interface LoadingPlanSearchProps {
  plans: LoadingPlanItem[];
  setPlans: React.Dispatch<React.SetStateAction<LoadingPlanItem[]>>;
}

export default function LoadingPlanSearch({ plans, setPlans }: LoadingPlanSearchProps) {
  // --- Search State ---
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [filteredPlans, setFilteredPlans] = useState<LoadingPlanItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // --- Edit State ---
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<LoadingPlanItem>>({});

  // --- Derived Data for Dropdowns (Based on existing PLANS) ---
  const customers = useMemo(() => [...new Set(plans.map(p => p.customer))], [plans]);
  
  const availableStyles = useMemo(() => {
    if (!selectedCustomer) return [];
    return [...new Set(plans.filter(p => p.customer === selectedCustomer).map(p => p.style))];
  }, [plans, selectedCustomer]);

  // --- Search Handler ---
  const handleSearch = () => {
    const results = plans.filter(p => 
      p.customer === selectedCustomer && 
      p.style === selectedStyle
    );
    setFilteredPlans(results);
    setHasSearched(true);
    setEditingPlanId(null); // Close edit form on new search
  };

  // --- Edit Handlers ---
  const startEdit = (plan: LoadingPlanItem) => {
    setEditingPlanId(plan.id);
    // Load data into edit form
    setEditForm({
      cutInDate: plan.cutInDate,
      receivedDate: plan.receivedDate,
      dispatchedDate: plan.dispatchedDate,
      tableNo: plan.tableNo,
      targetPocket: plan.targetPocket,
      targetLogo: plan.targetLogo,
      targetGraph: plan.targetGraph,
      status: plan.status
    });
    // Smooth scroll to bottom where form appears
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const saveEdit = () => {
    if (!editingPlanId) return;

    setPlans(prevPlans => prevPlans.map(p => 
      p.id === editingPlanId ? { ...p, ...editForm } as LoadingPlanItem : p
    ));

    // Also update the local filtered list to reflect changes immediately
    setFilteredPlans(prevFiltered => prevFiltered.map(p => 
      p.id === editingPlanId ? { ...p, ...editForm } as LoadingPlanItem : p
    ));

    setEditingPlanId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 mt-8">
      
      {/* SECTION 1: SEARCH FILTER */}
      <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-8 shadow-xl mb-10 text-center">
        <h2 className="text-lg font-bold text-white mb-6">Search Loading Plans</h2>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <select 
            value={selectedCustomer}
            onChange={(e) => { setSelectedCustomer(e.target.value); setSelectedStyle(''); setHasSearched(false); }}
            className="bg-neutral-950 border border-neutral-800 text-white text-sm rounded-lg p-3 w-64 focus:ring-2 focus:ring-blue-600 outline-none"
          >
            <option value="">Select Customer</option>
            {customers.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select 
            value={selectedStyle}
            onChange={(e) => { setSelectedStyle(e.target.value); setHasSearched(false); }}
            disabled={!selectedCustomer}
            className="bg-neutral-950 border border-neutral-800 text-white text-sm rounded-lg p-3 w-64 focus:ring-2 focus:ring-blue-600 outline-none disabled:opacity-50"
          >
            <option value="">Select Style</option>
            {availableStyles.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <button 
            onClick={handleSearch}
            disabled={!selectedCustomer || !selectedStyle}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white px-8 py-3 rounded-lg font-bold text-sm transition-all"
          >
            SEARCH PLANS
          </button>
        </div>
      </div>

      {/* SECTION 2: TABLE SUMMARY */}
      {hasSearched && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden backdrop-blur-sm">
            <div className="p-4 bg-neutral-900 border-b border-neutral-800 flex justify-between items-center">
              <h3 className="text-sm font-bold text-white">Plan Results</h3>
              <span className="text-xs text-neutral-500">{filteredPlans.length} records found</span>
            </div>

            <table className="w-full text-left">
              <thead>
                <tr className="bg-neutral-900/50 text-neutral-500 text-[10px] uppercase font-bold border-b border-neutral-800">
                  <th className="p-4">PO Info</th>
                  <th className="p-4">Table</th>
                  <th className="p-4">Dates</th>
                  <th className="p-4 text-center">Targets</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/50">
                {filteredPlans.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-neutral-500">No plans found.</td></tr>
                ) : (
                  filteredPlans.map(plan => (
                    <tr key={plan.id} className={`hover:bg-white/[0.02] transition-colors ${editingPlanId === plan.id ? 'bg-blue-900/20' : ''}`}>
                      <td className="p-4">
                        <div className="text-white font-bold text-sm">{plan.style}</div>
                        <div className="text-xs text-neutral-500">Qty: {plan.poQty}</div>
                      </td>
                      <td className="p-4 text-sm text-blue-400 font-bold">{plan.tableNo}</td>
                      <td className="p-4 text-xs text-neutral-400">
                        <div>In: {plan.cutInDate}</div>
                        <div>Out: {plan.dispatchedDate || '-'}</div>
                      </td>
                      <td className="p-4 text-xs text-neutral-300 text-center">
                        <div>P: {plan.targetPocket} | L: {plan.targetLogo}</div>
                        <div>G: {plan.targetGraph}</div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold border ${
                          plan.status === 'Done' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                          plan.status === 'In Progress' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                          'bg-neutral-800 text-neutral-400 border-neutral-700'
                        }`}>
                          {plan.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => startEdit(plan)}
                          className="text-xs font-bold text-blue-400 hover:text-white border border-blue-400/30 hover:bg-blue-600 hover:border-blue-600 px-3 py-1.5 rounded transition-all"
                        >
                          EDIT
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* SECTION 3: UPDATE FORM (Appears under table) */}
          {editingPlanId && (
            <div className="bg-neutral-900 border border-blue-900/50 rounded-2xl p-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
              
              <div className="flex justify-between items-center mb-6 pl-4">
                <h3 className="text-lg font-bold text-white">Update Status & Progress</h3>
                <button onClick={() => setEditingPlanId(null)} className="text-xs text-neutral-500 hover:text-white">Cancel</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pl-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-neutral-500">Status</label>
                  <select name="status" value={editForm.status} onChange={handleEditChange} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-sm text-white focus:ring-2 focus:ring-blue-600 outline-none">
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-neutral-500">Dispatched Date</label>
                  <input name="dispatchedDate" type="date" value={editForm.dispatchedDate} onChange={handleEditChange} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-sm text-white focus:ring-2 focus:ring-blue-600 outline-none [color-scheme:dark]" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-neutral-500">Table No</label>
                  <input name="tableNo" type="text" value={editForm.tableNo} onChange={handleEditChange} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-sm text-white focus:ring-2 focus:ring-blue-600 outline-none" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-neutral-500">Targets (P / L / G)</label>
                  <div className="flex gap-2">
                    <input name="targetPocket" placeholder="P" value={editForm.targetPocket} onChange={handleEditChange} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-2 text-sm text-white text-center focus:border-blue-600 outline-none" />
                    <input name="targetLogo" placeholder="L" value={editForm.targetLogo} onChange={handleEditChange} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-2 text-sm text-white text-center focus:border-blue-600 outline-none" />
                    <input name="targetGraph" placeholder="G" value={editForm.targetGraph} onChange={handleEditChange} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-2 text-sm text-white text-center focus:border-blue-600 outline-none" />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pl-4">
                 <button onClick={saveEdit} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold text-sm transition-all shadow-lg shadow-blue-900/20">
                   SAVE UPDATES
                 </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}