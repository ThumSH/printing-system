import React, { useState, useMemo } from 'react';
import { Supplier, Order } from '../types';

interface SupplierRegisterProps {
  orders: Order[]; // To populate the Style No dropdown
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
}

export default function SupplierRegister({ orders, suppliers, setSuppliers }: SupplierRegisterProps) {
  // --- Form State ---
  const [formData, setFormData] = useState({
    styleNo: '',
    name: '',
    telephone: '',
    address: '',
    email: ''
  });

  // Derived: Unique styles for dropdown
  const uniqueStyles = useMemo(() => 
    [...new Set(orders.map(o => o.style))], 
  [orders]);

  // --- Handlers ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleClear = () => {
    setFormData({
      styleNo: '',
      name: '',
      telephone: '',
      address: '',
      email: ''
    });
  };

  const handleSave = () => {
    // Basic Validation
    if (!formData.styleNo || !formData.name) {
      alert("Style No and Supplier Name are required.");
      return;
    }

    const newSupplier: Supplier = {
      id: Date.now(),
      ...formData
    };

    setSuppliers([newSupplier, ...suppliers]);
    handleClear();
  };

  const handleDelete = (id: number) => {
    if (confirm("Remove this supplier?")) {
      setSuppliers(prev => prev.filter(s => s.id !== id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 mt-8">
      
      {/* --- FORM SECTION --- */}
      <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-8 shadow-xl mb-10">
        <h2 className="text-sm font-bold text-white mb-6 uppercase tracking-wider border-b border-neutral-800 pb-2">
          Register New Supplier
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Style No (Dropdown) */}
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

          {/* Supplier Name */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-blue-400 ml-1">Supplier Name</label>
            <input 
              name="name" 
              type="text" 
              placeholder="e.g. Acme Textiles" 
              value={formData.name} 
              onChange={handleChange} 
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-600 outline-none" 
            />
          </div>

          {/* Telephone */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-neutral-500 ml-1">Telephone</label>
            <input 
              name="telephone" 
              type="tel" 
              placeholder="+94 77 ..." 
              value={formData.telephone} 
              onChange={handleChange} 
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-600 outline-none font-mono" 
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-neutral-500 ml-1">Email Address</label>
            <input 
              name="email" 
              type="email" 
              placeholder="contact@supplier.com" 
              value={formData.email} 
              onChange={handleChange} 
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-600 outline-none" 
            />
          </div>

          {/* Address (Full Width) */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[10px] uppercase font-bold text-neutral-500 ml-1">Address</label>
            <input 
              name="address" 
              type="text" 
              placeholder="Full physical address..." 
              value={formData.address} 
              onChange={handleChange} 
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-600 outline-none" 
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
            SAVE SUPPLIER
          </button>
        </div>
      </div>

      {/* --- DIRECTORY TABLE --- */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="p-4 bg-neutral-900 border-b border-neutral-800 flex justify-between items-center">
          <h3 className="text-sm font-bold text-white">Registered Suppliers</h3>
          <span className="text-xs text-neutral-500">{suppliers.length} records</span>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="bg-neutral-900/50 text-neutral-500 text-[10px] uppercase font-bold border-b border-neutral-800">
              <th className="p-4">Supplier Name</th>
              <th className="p-4">Style Link</th>
              <th className="p-4">Contact Info</th>
              <th className="p-4">Address</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/50">
            {suppliers.length === 0 ? (
               <tr><td colSpan={5} className="p-8 text-center text-neutral-500">No suppliers registered yet.</td></tr>
            ) : (
              suppliers.map(supplier => (
                <tr key={supplier.id} className="hover:bg-white/[0.02]">
                  <td className="p-4">
                    <div className="font-bold text-white text-sm">{supplier.name}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-xs font-bold">
                      {supplier.styleNo}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-neutral-300">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-mono text-xs">{supplier.telephone}</span>
                      <span className="text-xs text-neutral-500">{supplier.email}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-neutral-400 max-w-xs truncate">
                    {supplier.address}
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => handleDelete(supplier.id)}
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