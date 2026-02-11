import React, { useState, useMemo } from 'react';
import { Order, LoadingPlanItem } from '../types';

interface LoadingPlanProps {
  orders: Order[]; // Needed for the dropdowns
  plans: LoadingPlanItem[];
  setPlans: React.Dispatch<React.SetStateAction<LoadingPlanItem[]>>;
}

export default function LoadingPlan({ orders, plans, setPlans }: LoadingPlanProps) {
  // 1. Selection State
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  
  // 2. Manual Input State
  const [formData, setFormData] = useState({
    cutInDate: '',
    receivedDate: '',
    dispatchedDate: '',
    tableNo: '',
    targetPocket: '',
    targetLogo: '',
    targetGraph: '',
    status: 'Pending' as const
  });

  // Derived: Find the full order object based on selection
  const selectedOrder = useMemo(() => 
    orders.find(o => o.id.toString() === selectedOrderId), 
  [selectedOrderId, orders]);

  // Unique Customers for the first dropdown
  const customers = useMemo(() => [...new Set(orders.map(o => o.customer))], [orders]);

  // Styles filtered by selected customer (if needed, or just show all unique styles)
  // For simplicity in this specific flow, we might just list all styles or filter if a customer is picked.
  // Let's stick to the user's request: Customer -> Style
  const [filterCustomer, setFilterCustomer] = useState('');
  
  const availableStyles = useMemo(() => {
    if (!filterCustomer) return [];
    return orders.filter(o => o.customer === filterCustomer);
  }, [filterCustomer, orders]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAdd = () => {
    if (!selectedOrder) {
      alert("Please select an Order first.");
      return;
    }
    if (!formData.tableNo || !formData.cutInDate) {
      alert("Please fill in key manual fields like Table No and Cut In Date.");
      return;
    }

    const newPlan: LoadingPlanItem = {
      id: Date.now(),
      orderId: selectedOrder.id,
      customer: selectedOrder.customer,
      style: selectedOrder.style,
      poQty: selectedOrder.qty,
      ...formData
    };

    setPlans([newPlan, ...plans]);
    
    // Reset manual form only (keep selection or reset it? usually reset is better)
    setFormData({
      cutInDate: '', receivedDate: '', dispatchedDate: '', tableNo: '',
      targetPocket: '', targetLogo: '', targetGraph: '', status: 'Pending'
    });
    setSelectedOrderId('');
    setFilterCustomer('');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 mt-8">
      
      {/* --- FORM SECTION --- */}
      <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6 shadow-xl mb-10">
        <h2 className="text-sm font-bold text-white mb-6 uppercase tracking-wider border-b border-neutral-800 pb-2">
          1. Select Order Details
        </h2>
        
        {/* Step 1: Selection & Auto-fill */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Filter: Customer */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-neutral-500 ml-1">Select Customer</label>
            <select 
              value={filterCustomer} 
              onChange={(e) => { setFilterCustomer(e.target.value); setSelectedOrderId(''); }}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-blue-600 outline-none"
            >
              <option value="">-- Customer --</option>
              {customers.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Filter: Style (Shows Styles for selected Customer) */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-neutral-500 ml-1">Select Style</label>
            <select 
              value={selectedOrderId} 
              onChange={(e) => setSelectedOrderId(e.target.value)}
              disabled={!filterCustomer}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-blue-600 outline-none disabled:opacity-50"
            >
              <option value="">-- Style No --</option>
              {availableStyles.map(o => <option key={o.id} value={o.id}>{o.style} (PO: {o.poNo})</option>)}
            </select>
          </div>

          {/* Auto-filled Read-only Fields */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-neutral-500 ml-1">PO Number</label>
            <input disabled value={selectedOrder?.poNo || ''} className="w-full bg-neutral-800/50 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-neutral-400 cursor-not-allowed" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-neutral-500 ml-1">PO Qty</label>
            <input disabled value={selectedOrder?.qty || ''} className="w-full bg-neutral-800/50 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-neutral-400 cursor-not-allowed font-mono" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-neutral-500 ml-1">Delivery Date</label>
            <input disabled value={selectedOrder?.deliveryDate || ''} className="w-full bg-neutral-800/50 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-neutral-400 cursor-not-allowed" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-neutral-500 ml-1">PSD</label>
            <input disabled value={selectedOrder?.psd || ''} className="w-full bg-neutral-800/50 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-neutral-400 cursor-not-allowed" />
          </div>
        </div>

        <h2 className="text-sm font-bold text-white mb-6 uppercase tracking-wider border-b border-neutral-800 pb-2">
          2. Manual Inputs & Planning
        </h2>

        {/* Step 2: Manual Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-blue-400 ml-1">Cut In Date</label>
            <input name="cutInDate" type="date" value={formData.cutInDate} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-blue-600 outline-none [color-scheme:dark]" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-neutral-500 ml-1">Received Date</label>
            <input name="receivedDate" type="date" value={formData.receivedDate} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-blue-600 outline-none [color-scheme:dark]" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-neutral-500 ml-1">Dispatched Date</label>
            <input name="dispatchedDate" type="date" value={formData.dispatchedDate} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-blue-600 outline-none [color-scheme:dark]" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-blue-400 ml-1">Table No</label>
            <input name="tableNo" type="text" placeholder="e.g. T-05" value={formData.tableNo} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-blue-600 outline-none" />
          </div>
        </div>

        {/* Step 3: Day Targets & Status */}
        <h2 className="text-sm font-bold text-white mb-6 uppercase tracking-wider border-b border-neutral-800 pb-2">
          3. Daily Targets & Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8 items-end">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-neutral-500 ml-1">Pocket (Target)</label>
            <input name="targetPocket" type="text" placeholder="0" value={formData.targetPocket} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-blue-600 outline-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-neutral-500 ml-1">Logo (Target)</label>
            <input name="targetLogo" type="text" placeholder="0" value={formData.targetLogo} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-blue-600 outline-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-neutral-500 ml-1">Graph (Target)</label>
            <input name="targetGraph" type="text" placeholder="0" value={formData.targetGraph} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-blue-600 outline-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-neutral-500 ml-1">Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-blue-600 outline-none">
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>
          <div>
            <button onClick={handleAdd} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg font-bold text-sm transition-all shadow-lg shadow-blue-900/20">
              + ADD PLAN
            </button>
          </div>
        </div>
      </div>

      {/* --- TABLE SECTION --- */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden backdrop-blur-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-800 bg-neutral-900 text-neutral-500 text-[10px] uppercase tracking-wider font-bold">
              <th className="p-4">Customer</th>
              <th className="p-4">Style No</th>
              <th className="p-4 text-right">PO Qty</th>
              <th className="p-4">Cut In Date</th>
              <th className="p-4">Dispatched</th>
              <th className="p-4">Table No</th>
              <th className="p-4 text-center">Pocket</th>
              <th className="p-4 text-center">Logo</th>
              <th className="p-4 text-center">Graphic</th>
              <th className="p-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/50">
            {plans.length === 0 ? (
              <tr><td colSpan={10} className="p-8 text-center text-neutral-600 text-sm">No loading plans created yet.</td></tr>
            ) : (
              plans.map(plan => (
                <tr key={plan.id} className="hover:bg-white/[0.02]">
                  <td className="p-4 text-sm font-medium text-white">{plan.customer}</td>
                  <td className="p-4 text-sm text-neutral-300">{plan.style}</td>
                  <td className="p-4 text-sm text-neutral-300 font-mono text-right">{plan.poQty}</td>
                  <td className="p-4 text-sm text-neutral-400">{plan.cutInDate}</td>
                  <td className="p-4 text-sm text-neutral-400">{plan.dispatchedDate || '-'}</td>
                  <td className="p-4 text-sm text-blue-400 font-bold">{plan.tableNo}</td>
                  <td className="p-4 text-sm text-neutral-300 text-center">{plan.targetPocket || '-'}</td>
                  <td className="p-4 text-sm text-neutral-300 text-center">{plan.targetLogo || '-'}</td>
                  <td className="p-4 text-sm text-neutral-300 text-center">{plan.targetGraph || '-'}</td>
                  <td className="p-4 text-right">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold border ${
                      plan.status === 'Done' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                      plan.status === 'In Progress' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                      'bg-neutral-800 text-neutral-400 border-neutral-700'
                    }`}>
                      {plan.status.toUpperCase()}
                    </span>
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