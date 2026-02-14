import React, { useState } from 'react';
import { DevelopmentItem, Order } from '../types';

interface DevelopmentProps {
  devItems: DevelopmentItem[];
  setDevItems: React.Dispatch<React.SetStateAction<DevelopmentItem[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  userRole: 'admin' | 'development' | 'worker';
}

// 1. Form Errors Interface
interface FormErrors {
  customer?: string;
  style?: string;
  factory?: string;
  color?: string;
  requestDate?: string;
  orderDate?: string; // <--- NEW ERROR FIELD
  image?: string;
}

export default function Development({ devItems, setDevItems, orders, setOrders, userRole }: DevelopmentProps) {
  // 2. Form State
  const [formData, setFormData] = useState({
    customer: '',
    style: '',
    factory: '',
    color: '',
    requestDate: '', // Date of Request
    orderDate: ''    // Order Date
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // --- Handlers ---

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setErrors(prev => ({ ...prev, image: undefined }));
      };
      reader.readAsDataURL(file);
    }
  };

  // --- VALIDATION LOGIC ---
  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!formData.customer.trim()) { newErrors.customer = "Customer is required"; isValid = false; }
    if (!formData.style.trim()) { newErrors.style = "Style is required"; isValid = false; }
    if (!formData.factory.trim()) { newErrors.factory = "Factory is required"; isValid = false; }
    if (!formData.color.trim()) { newErrors.color = "Color is required"; isValid = false; }
    
    // Validate Both Dates
    if (!formData.requestDate) { newErrors.requestDate = "Req Date is required"; isValid = false; }
    if (!formData.orderDate) { newErrors.orderDate = "Order Date is required"; isValid = false; }

    if (!imagePreview) {
      newErrors.image = "Artwork image is mandatory";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = () => {
    if (!validate()) return;

    const newItem: DevelopmentItem = {
      id: Date.now(),
      customer: formData.customer,
      style: formData.style,
      factory: formData.factory,
      color: formData.color,
      requestDate: formData.requestDate,
      orderDate: formData.orderDate, // <--- SAVE NEW DATE
      image: imagePreview,
      status: 'Pending'
    };

    setDevItems([newItem, ...devItems]);
    handleClear();
  };

  const handleClear = () => {
    setFormData({ customer: '', style: '', factory: '', color: '', requestDate: '', orderDate: '' });
    setErrors({});
    setImagePreview(null);
  };

  // --- ADMIN ACTIONS ---
  const handleApprove = (item: DevelopmentItem) => {
    if (userRole !== 'admin') {
      alert("Only Admins can approve development requests.");
      return;
    }

    if (confirm(`Approve Style ${item.style} and move to Order Book?`)) {
      setDevItems(prev => prev.map(d => d.id === item.id ? { ...d, status: 'Approved' } : d));

      const newOrder: Order = {
        id: Date.now(),
        customer: item.customer,
        buyer: '', 
        style: item.style,
        color: item.color,
        poNo: '', 
        qty: 0, 
        deliveryDate: '', 
        psd: '' 
      };

      setOrders([newOrder, ...orders]);
      alert("Request Approved! Added to Order Book.");
    }
  };

  const handleReject = (id: number) => {
    if (userRole !== 'admin') return;
    if (confirm("Reject this request?")) {
      setDevItems(prev => prev.map(d => d.id === id ? { ...d, status: 'Rejected' } : d));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 mt-8">
      
      {/* FORM SECTION */}
      <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-8 shadow-xl mb-10">
        <h2 className="text-sm font-bold text-white mb-6 uppercase tracking-wider border-b border-neutral-800 pb-2">
          New Development Request
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          
          {/* Customer */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-blue-400 ml-1">Customer Name</label>
            <input 
              name="customer" 
              value={formData.customer} 
              onChange={handleChange} 
              className={`w-full bg-neutral-950 border rounded-lg px-4 py-3 text-sm text-white outline-none transition-all
                ${errors.customer ? 'border-red-500 focus:ring-2 focus:ring-red-500/50' : 'border-neutral-800 focus:ring-2 focus:ring-blue-600'}`}
              placeholder="e.g. HIKH" 
            />
            {errors.customer && <p className="text-red-500 text-[10px] ml-1 font-bold">{errors.customer}</p>}
          </div>

          {/* Style */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-blue-400 ml-1">Style No</label>
            <input 
              name="style" 
              value={formData.style} 
              onChange={handleChange} 
              className={`w-full bg-neutral-950 border rounded-lg px-4 py-3 text-sm text-white outline-none transition-all
                ${errors.style ? 'border-red-500 focus:ring-2 focus:ring-red-500/50' : 'border-neutral-800 focus:ring-2 focus:ring-blue-600'}`}
              placeholder="e.g. GE-2022" 
            />
            {errors.style && <p className="text-red-500 text-[10px] ml-1 font-bold">{errors.style}</p>}
          </div>

          {/* Factory */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-neutral-500 ml-1">Factory Name</label>
            <input 
              name="factory" 
              value={formData.factory} 
              onChange={handleChange} 
              className={`w-full bg-neutral-950 border rounded-lg px-4 py-3 text-sm text-white outline-none transition-all
                ${errors.factory ? 'border-red-500 focus:ring-2 focus:ring-red-500/50' : 'border-neutral-800 focus:ring-2 focus:ring-blue-600'}`}
              placeholder="e.g. Factory A" 
            />
            {errors.factory && <p className="text-red-500 text-[10px] ml-1 font-bold">{errors.factory}</p>}
          </div>

          {/* Colour */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-neutral-500 ml-1">Colour</label>
            <input 
              name="color" 
              value={formData.color} 
              onChange={handleChange} 
              className={`w-full bg-neutral-950 border rounded-lg px-4 py-3 text-sm text-white outline-none transition-all
                ${errors.color ? 'border-red-500 focus:ring-2 focus:ring-red-500/50' : 'border-neutral-800 focus:ring-2 focus:ring-blue-600'}`}
              placeholder="e.g. Navy" 
            />
            {errors.color && <p className="text-red-500 text-[10px] ml-1 font-bold">{errors.color}</p>}
          </div>

          {/* Date of Request */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-neutral-500 ml-1">Date of Request</label>
            <input 
              name="requestDate" 
              type="date" 
              value={formData.requestDate} 
              onChange={handleChange} 
              className={`w-full bg-neutral-950 border rounded-lg px-4 py-3 text-sm text-white outline-none transition-all [color-scheme:dark]
                ${errors.requestDate ? 'border-red-500 focus:ring-2 focus:ring-red-500/50' : 'border-neutral-800 focus:ring-2 focus:ring-blue-600'}`}
            />
            {errors.requestDate && <p className="text-red-500 text-[10px] ml-1 font-bold">{errors.requestDate}</p>}
          </div>

          {/* Order Date (NEW) */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-blue-400 ml-1">Order Date</label>
            <input 
              name="orderDate" 
              type="date" 
              value={formData.orderDate} 
              onChange={handleChange} 
              className={`w-full bg-neutral-950 border rounded-lg px-4 py-3 text-sm text-white outline-none transition-all [color-scheme:dark]
                ${errors.orderDate ? 'border-red-500 focus:ring-2 focus:ring-red-500/50' : 'border-neutral-800 focus:ring-2 focus:ring-blue-600'}`}
            />
            {errors.orderDate && <p className="text-red-500 text-[10px] ml-1 font-bold">{errors.orderDate}</p>}
          </div>

          {/* Image Upload */}
          <div className="space-y-1.5 md:col-span-3 mt-2">
            <label className="text-[10px] uppercase font-bold text-neutral-500 ml-1">Artwork / Image (Mandatory)</label>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                 <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  className={`block w-full text-sm text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:text-white hover:file:bg-neutral-700 cursor-pointer
                    ${errors.image ? 'file:bg-red-500/20 file:text-red-500' : 'file:bg-neutral-800'}`}
                />
                {errors.image && <p className="text-red-500 text-[10px] ml-4 mt-1 font-bold">{errors.image}</p>}
              </div>
              
              {imagePreview && (
                <div className="w-16 h-16 rounded-lg overflow-hidden border border-neutral-700 shrink-0">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-neutral-800 pt-6">
          <button onClick={handleClear} className="px-6 py-2.5 rounded-full font-bold text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">CLEAR</button>
          <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg shadow-blue-900/20">SAVE REQUEST</button>
        </div>
      </div>

      {/* LIST SECTION */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="p-4 bg-neutral-900 border-b border-neutral-800 flex justify-between items-center">
          <h3 className="text-sm font-bold text-white">Development Status</h3>
          <span className="text-xs text-neutral-500">{devItems.length} records</span>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="bg-neutral-900/50 text-neutral-500 text-[10px] uppercase font-bold border-b border-neutral-800">
              <th className="p-4">Artwork</th>
              <th className="p-4">Details</th>
              <th className="p-4">Factory</th>
              <th className="p-4 text-center">Dates</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/50">
            {devItems.length === 0 ? (
               <tr><td colSpan={6} className="p-8 text-center text-neutral-500">No development requests yet.</td></tr>
            ) : (
              devItems.map(item => (
                <tr key={item.id} className="hover:bg-white/[0.02]">
                  <td className="p-4">
                    {item.image ? (
                      <img src={item.image} alt="Art" className="w-10 h-10 rounded border border-neutral-700 object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded border border-neutral-800 bg-neutral-900 flex items-center justify-center text-[8px] text-neutral-600">NO IMG</div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-white text-sm">{item.style}</div>
                    <div className="text-xs text-neutral-500">{item.customer} • {item.color}</div>
                  </td>
                  <td className="p-4 text-sm text-neutral-400">{item.factory}</td>
                  
                  {/* NEW DATES COLUMN */}
                  <td className="p-4 text-center text-xs text-neutral-400">
                    <div><span className="text-neutral-600">REQ:</span> {item.requestDate}</div>
                    <div><span className="text-blue-500">ORD:</span> {item.orderDate}</div>
                  </td>

                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold border ${
                      item.status === 'Approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                      item.status === 'Rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                      'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                    }`}>
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {item.status === 'Pending' && userRole === 'admin' && (
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleApprove(item)} className="text-green-500 hover:bg-green-500/10 p-1.5 rounded" title="Approve">
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </button>
                        <button onClick={() => handleReject(item.id)} className="text-red-500 hover:bg-red-500/10 p-1.5 rounded" title="Reject">
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>
                    )}
                    {item.status === 'Approved' && <span className="text-[10px] text-green-600 font-bold">Synced</span>}
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