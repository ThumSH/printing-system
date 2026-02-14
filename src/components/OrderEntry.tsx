import React, { useState, useMemo } from 'react';
import { Order, DevelopmentItem } from '../types';

interface OrderEntryProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  devItems: DevelopmentItem[]; // Required to link with Development
}

// Define error shape
interface OrderErrors {
  customer?: string;
  style?: string;
  buyer?: string;
  poNo?: string;
  qty?: string;
  deliveryDate?: string;
  psd?: string;
}

export default function OrderEntry({ orders, setOrders, devItems }: OrderEntryProps) {
  // 1. Form State
  const [formData, setFormData] = useState({
    customer: '', 
    buyer: '', 
    style: '', 
    color: '', 
    poNo: '', 
    qty: '', 
    deliveryDate: '', 
    psd: ''
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [errors, setErrors] = useState<OrderErrors>({});

  // --- SMART FILTERING LOGIC ---
  // 1. Get only APPROVED development items
  const approvedDevs = useMemo(() => devItems.filter(d => d.status === 'Approved'), [devItems]);
  
  // 2. Extract unique approved customers
  const approvedCustomers = useMemo(() => {
    const customers = new Set(approvedDevs.map(d => d.customer));
    // If editing, make sure current customer is visible even if logic changes
    if (editingId && formData.customer) customers.add(formData.customer);
    return [...customers];
  }, [approvedDevs, editingId, formData.customer]);

  // 3. Extract styles specifically for the selected customer
  const availableStyles = useMemo(() => {
    if (!formData.customer) return [];
    const styles = new Set(approvedDevs.filter(d => d.customer === formData.customer).map(d => d.style));
    if (editingId && formData.style) styles.add(formData.style);
    return [...styles];
  }, [formData.customer, approvedDevs, editingId, formData.style]);

  // --- HANDLERS ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const updates = { ...prev, [name]: value };
      
      // Auto-reset style if customer changes
      if (name === 'customer') {
        updates.style = '';
        updates.color = '';
      } 
      // Auto-fill color if a specific style is selected
      else if (name === 'style') {
        const matchedDev = approvedDevs.find(d => d.customer === updates.customer && d.style === value);
        if (matchedDev) {
          updates.color = matchedDev.color;
        }
      }
      return updates;
    });

    // Clear error on type
    if (errors[name as keyof OrderErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: OrderErrors = {};
    let isValid = true;

    if (!formData.customer) { newErrors.customer = "Select a Customer"; isValid = false; }
    if (!formData.style) { newErrors.style = "Select a Style"; isValid = false; }
    if (!formData.poNo.trim()) { newErrors.poNo = "PO Number is required"; isValid = false; }
    if (!formData.psd) { newErrors.psd = "PSD required"; isValid = false; }
    if (!formData.deliveryDate) { newErrors.deliveryDate = "Delivery Date required"; isValid = false; }
    
    // Number check
    if (!formData.qty || parseInt(formData.qty) <= 0) {
      newErrors.qty = "Qty must be > 0";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    if (editingId) {
      setOrders(prev => prev.map(o => o.id === editingId ? { ...o, ...formData, qty: parseInt(formData.qty) || 0, id: o.id } : o));
      setEditingId(null);
    } else {
      const newOrder: Order = {
        id: Date.now(),
        customer: formData.customer,
        buyer: formData.buyer,
        style: formData.style,
        color: formData.color,
        poNo: formData.poNo,
        qty: parseInt(formData.qty) || 0,
        deliveryDate: formData.deliveryDate,
        psd: formData.psd
      };
      setOrders([newOrder, ...orders]);
    }
    handleClear();
  };

  const handleClear = () => {
    setFormData({ customer: '', buyer: '', style: '', color: '', poNo: '', qty: '', deliveryDate: '', psd: '' });
    setErrors({});
    setEditingId(null);
  };

  const handleEdit = (order: Order) => {
    setEditingId(order.id);
    setFormData({
      customer: order.customer, 
      buyer: order.buyer || '', 
      style: order.style, 
      color: order.color, 
      poNo: order.poNo,
      qty: order.qty.toString(), 
      deliveryDate: order.deliveryDate, 
      psd: order.psd
    });
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this order?")) {
      setOrders(prev => prev.filter(o => o.id !== id));
      if (editingId === id) handleClear();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 mt-8">
      
      {/* --- FORM SECTION --- */}
      <div className={`rounded-2xl border p-8 shadow-xl mb-10 transition-all ${editingId ? 'bg-blue-900/10 border-blue-500/30' : 'bg-neutral-900 border-neutral-800'}`}>
        <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-6 border-b border-neutral-800 pb-2">
          {editingId ? 'Edit Order Details' : 'New Order Entry'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          
          {/* Customer (DROPDOWN) */}
          <div className="space-y-1.5">
             <label className="text-[10px] uppercase font-bold text-blue-400 ml-1">Customer (Approved)</label>
             <select 
               name="customer" 
               value={formData.customer} 
               onChange={handleChange} 
               className={`w-full bg-neutral-950 border rounded-lg px-4 py-3 text-sm text-white outline-none transition-all
                 ${errors.customer ? 'border-red-500 focus:ring-2 focus:ring-red-500/50' : 'border-neutral-800 focus:ring-2 focus:ring-blue-600'}`}
             >
               <option value="">-- Select Customer --</option>
               {approvedCustomers.map(c => <option key={c} value={c}>{c}</option>)}
             </select>
             {errors.customer && <p className="text-red-500 text-[10px] ml-1 font-bold">{errors.customer}</p>}
          </div>
          
          {/* Style (DROPDOWN) */}
          <div className="space-y-1.5">
             <label className="text-[10px] uppercase font-bold text-blue-400 ml-1">Style No (Approved)</label>
             <select 
               name="style" 
               value={formData.style} 
               onChange={handleChange} 
               disabled={!formData.customer}
               className={`w-full bg-neutral-950 border rounded-lg px-4 py-3 text-sm text-white outline-none transition-all disabled:opacity-50
                 ${errors.style ? 'border-red-500 focus:ring-2 focus:ring-red-500/50' : 'border-neutral-800 focus:ring-2 focus:ring-blue-600'}`}
             >
               <option value="">-- Select Style --</option>
               {availableStyles.map(s => <option key={s} value={s}>{s}</option>)}
             </select>
             {errors.style && <p className="text-red-500 text-[10px] ml-1 font-bold">{errors.style}</p>}
          </div>

          {/* Buyer */}
          <div className="space-y-1.5">
             <label className="text-[10px] uppercase font-bold text-neutral-500 ml-1">Buyer</label>
             <input 
               name="buyer" 
               value={formData.buyer} 
               onChange={handleChange} 
               className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:border-blue-500 outline-none" 
               placeholder="e.g. Hugo Boss" 
             />
          </div>

          {/* Colour (Read Only / Auto-filled usually) */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-neutral-500 ml-1">Colour</label>
            <input 
              name="color" 
              value={formData.color} 
              onChange={handleChange} 
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:border-blue-500 outline-none" 
              placeholder="Auto-filled" 
            />
          </div>

          {/* PO No */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-neutral-500 ml-1">PO Number</label>
            <input 
              name="poNo" 
              value={formData.poNo} 
              onChange={handleChange} 
              className={`w-full bg-neutral-950 border rounded-lg px-4 py-3 text-sm text-white outline-none transition-all
                ${errors.poNo ? 'border-red-500 focus:ring-2 focus:ring-red-500/50' : 'border-neutral-800 focus:ring-2 focus:ring-blue-600'}`}
              placeholder="e.g. PO-9981" 
            />
            {errors.poNo && <p className="text-red-500 text-[10px] ml-1 font-bold">{errors.poNo}</p>}
          </div>
          
          {/* Qty */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-neutral-500 ml-1">PO Qty</label>
            <input 
              name="qty" 
              type="number" 
              value={formData.qty} 
              onChange={handleChange} 
              className={`w-full bg-neutral-950 border rounded-lg px-4 py-3 text-sm text-white outline-none transition-all font-mono
                ${errors.qty ? 'border-red-500 focus:ring-2 focus:ring-red-500/50' : 'border-neutral-800 focus:ring-2 focus:ring-blue-600'}`}
              placeholder="0" 
            />
            {errors.qty && <p className="text-red-500 text-[10px] ml-1 font-bold">{errors.qty}</p>}
          </div>
          
          {/* Dates */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-neutral-500 ml-1">PSD (Start)</label>
            <input 
              name="psd" 
              type="date" 
              value={formData.psd} 
              onChange={handleChange} 
              className={`w-full bg-neutral-950 border rounded-lg px-4 py-3 text-sm text-white outline-none transition-all [color-scheme:dark]
              ${errors.psd ? 'border-red-500 focus:ring-2 focus:ring-red-500/50' : 'border-neutral-800 focus:ring-2 focus:ring-blue-600'}`}
            />
            {errors.psd && <p className="text-red-500 text-[10px] ml-1 font-bold">{errors.psd}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-neutral-500 ml-1">Delivery Date</label>
            <input 
              name="deliveryDate" 
              type="date" 
              value={formData.deliveryDate} 
              onChange={handleChange} 
              className={`w-full bg-neutral-950 border rounded-lg px-4 py-3 text-sm text-white outline-none transition-all [color-scheme:dark]
                ${errors.deliveryDate ? 'border-red-500 focus:ring-2 focus:ring-red-500/50' : 'border-neutral-800 focus:ring-2 focus:ring-blue-600'}`}
            />
            {errors.deliveryDate && <p className="text-red-500 text-[10px] ml-1 font-bold">{errors.deliveryDate}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-neutral-800 pt-6">
            <button 
              onClick={handleClear} 
              className="px-6 py-2.5 rounded-full font-bold text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              CANCEL
            </button>
            <button 
              onClick={handleSubmit} 
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg shadow-blue-900/20"
            >
              {editingId ? 'UPDATE ORDER' : 'ADD NEW PO'}
            </button>
        </div>
      </div>

      {/* --- TABLE SECTION --- */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="p-4 bg-neutral-900 border-b border-neutral-800 flex justify-between items-center">
          <h3 className="text-sm font-bold text-white">Order Book Status</h3>
          <span className="text-xs text-neutral-500">{orders.length} orders</span>
        </div>

        <table className="w-full text-left">
          <thead className="bg-neutral-900/50 text-neutral-500 text-[10px] uppercase font-bold border-b border-neutral-800">
            <tr>
              <th className="p-4">Customer/Style</th>
              <th className="p-4">Buyer</th>
              <th className="p-4">PO Details</th>
              <th className="p-4">Dates</th>
              <th className="p-4 text-right">Qty</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/50">
            {orders.length === 0 ? (
               <tr><td colSpan={6} className="p-8 text-center text-neutral-500">No orders active in the book.</td></tr>
            ) : (
              orders.map(order => (
                <tr key={order.id} className="hover:bg-white/[0.02]">
                  <td className="p-4">
                    <div className="text-white font-bold">{order.style}</div>
                    <div className="text-xs text-neutral-500">{order.customer}</div>
                  </td>
                  <td className="p-4 text-xs text-neutral-400">{order.buyer || '-'}</td>
                  <td className="p-4">
                    <div className="text-sm text-blue-400 font-mono">{order.poNo || <span className="text-neutral-600 italic">Pending PO</span>}</div>
                    <div className="text-xs text-neutral-500">{order.color}</div>
                  </td>
                  <td className="p-4 text-xs text-neutral-400">
                    <div>PSD: {order.psd || '-'}</div>
                    <div>DEL: {order.deliveryDate || '-'}</div>
                  </td>
                  <td className="p-4 text-right text-white font-mono font-bold">{order.qty.toLocaleString()}</td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleEdit(order)} className="text-blue-400 hover:bg-blue-400/10 p-2 rounded transition-colors" title="Edit">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                      </button>
                      <button onClick={() => handleDelete(order.id)} className="text-red-500 hover:bg-red-500/10 p-2 rounded transition-colors" title="Delete">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
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