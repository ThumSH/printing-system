import React, { useState, useMemo } from 'react';
import { IncomingGood, Supplier, Order } from '../types';

interface IncomingGoodsProps {
  suppliers: Supplier[]; // For Supplier Dropdown
  orders: Order[];       // For Style/PO Dropdown
  goods: IncomingGood[];
  setGoods: React.Dispatch<React.SetStateAction<IncomingGood[]>>;
}

export default function IncomingGoods({ suppliers, orders, goods, setGoods }: IncomingGoodsProps) {
  // --- Form State ---
  const [formData, setFormData] = useState({
    supplierName: '',
    gatepassNo: '',
    styleNo: '',
    inHouseDate: '',
    orderedQty: '',
    poNo: ''
  });

  // Derived: Unique Suppliers and Styles for dropdowns
  const uniqueSuppliers = useMemo(() => [...new Set(suppliers.map(s => s.name))], [suppliers]);
  const uniqueStyles = useMemo(() => [...new Set(orders.map(o => o.style))], [orders]);

  // --- Handlers ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updates = { ...prev, [name]: value };
      
      // Auto-fill PO Number if Style is selected (Optional helper)
      if (name === 'styleNo') {
        const relatedOrder = orders.find(o => o.style === value);
        if (relatedOrder) updates.poNo = relatedOrder.poNo;
      }
      
      return updates;
    });
  };

  const handleClear = () => {
    setFormData({
      supplierName: '', gatepassNo: '', styleNo: '', inHouseDate: '', orderedQty: '', poNo: ''
    });
  };

  const handleSave = () => {
    // Basic Validation
    if (!formData.supplierName || !formData.gatepassNo || !formData.styleNo) {
      alert("Supplier, Gatepass No, and Style No are required.");
      return;
    }

    const newEntry: IncomingGood = {
      id: Date.now(),
      supplierName: formData.supplierName,
      gatepassNo: formData.gatepassNo,
      styleNo: formData.styleNo,
      inHouseDate: formData.inHouseDate,
      orderedQty: parseInt(formData.orderedQty) || 0,
      poNo: formData.poNo
    };

    setGoods([newEntry, ...goods]);
    handleClear();
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this entry?")) {
      setGoods(prev => prev.filter(g => g.id !== id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 mt-8">
      
      {/* --- FORM SECTION --- */}
      <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-8 shadow-xl mb-10">
        <h2 className="text-sm font-bold text-white mb-6 uppercase tracking-wider border-b border-neutral-800 pb-2">
          Receive Incoming Goods
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          
          {/* Supplier Name */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-blue-400 ml-1">Supplier Name</label>
            <div className="relative">
              <input 
                name="supplierName" 
                list="supplierOptions"
                type="text" 
                placeholder="Select or Type..." 
                value={formData.supplierName} 
                onChange={handleChange} 
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-600 outline-none" 
              />
              <datalist id="supplierOptions">
                {uniqueSuppliers.map(s => <option key={s} value={s} />)}
              </datalist>
            </div>
          </div>

          {/* Gatepass No */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-blue-400 ml-1">Gatepass No</label>
            <input 
              name="gatepassNo" 
              type="text" 
              placeholder="e.g. GP-2026-001" 
              value={formData.gatepassNo} 
              onChange={handleChange} 
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-600 outline-none font-mono" 
            />
          </div>

          {/* In-house Date */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-neutral-500 ml-1">In-house Date</label>
            <input 
              name="inHouseDate" 
              type="date" 
              value={formData.inHouseDate} 
              onChange={handleChange} 
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-600 outline-none [color-scheme:dark]" 
            />
          </div>

          {/* Style No */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-blue-400 ml-1">Style No</label>
            <select 
              name="styleNo"
              value={formData.styleNo} 
              onChange={handleChange}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-600 outline-none"
            >
              <option value="">-- Select Style --</option>
              {uniqueStyles.map(style => <option key={style} value={style}>{style}</option>)}
            </select>
          </div>

          {/* PO Number */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-neutral-500 ml-1">PO Number</label>
            <input 
              name="poNo" 
              type="text" 
              placeholder="e.g. PO-9981" 
              value={formData.poNo} 
              onChange={handleChange} 
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-600 outline-none" 
            />
          </div>

          {/* Ordered Qty */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-neutral-500 ml-1">Ordered Qty</label>
            <input 
              name="orderedQty" 
              type="number" 
              placeholder="0" 
              value={formData.orderedQty} 
              onChange={handleChange} 
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-600 outline-none font-mono" 
            />
          </div>

        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 border-t border-neutral-800 pt-6">
          <button 
            onClick={handleClear}
            className="px-6 py-2.5 rounded-full font-bold text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            CLEAR
          </button>
          <button 
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            SAVE ENTRY
          </button>
        </div>
      </div>

      {/* --- HISTORY TABLE --- */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="p-4 bg-neutral-900 border-b border-neutral-800 flex justify-between items-center">
          <h3 className="text-sm font-bold text-white">Goods Received History</h3>
          <span className="text-xs text-neutral-500">{goods.length} records</span>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="bg-neutral-900/50 text-neutral-500 text-[10px] uppercase font-bold border-b border-neutral-800">
              <th className="p-4">Gatepass Info</th>
              <th className="p-4">Supplier</th>
              <th className="p-4">Style & PO</th>
              <th className="p-4 text-right">Qty</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/50">
            {goods.length === 0 ? (
               <tr><td colSpan={5} className="p-8 text-center text-neutral-500">No goods received yet.</td></tr>
            ) : (
              goods.map(item => (
                <tr key={item.id} className="hover:bg-white/[0.02]">
                  <td className="p-4">
                    <div className="font-bold text-blue-400 text-sm font-mono">{item.gatepassNo}</div>
                    <div className="text-xs text-neutral-500">{item.inHouseDate}</div>
                  </td>
                  <td className="p-4 text-sm text-white font-medium">
                    {item.supplierName}
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-neutral-300">{item.styleNo}</div>
                    <div className="text-xs text-neutral-500 font-mono">{item.poNo}</div>
                  </td>
                  <td className="p-4 text-right font-mono text-sm text-white font-bold">
                    {item.orderedQty.toLocaleString()}
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="text-neutral-600 hover:text-red-500 transition-colors p-2"
                      title="Remove"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
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