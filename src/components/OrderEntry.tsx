import React, { useState } from 'react';
import { Order } from '../types';

interface OrderEntryProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}

export default function OrderEntry({ orders, setOrders }: OrderEntryProps) {
  const [formData, setFormData] = useState({
    customer: '', 
    buyer: '', // <--- NEW FIELD
    style: '', 
    color: '', 
    poNo: '', 
    qty: '', 
    deliveryDate: '', 
    psd: ''
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.customer || !formData.style || !formData.qty) {
      alert("Please fill in Customer, Style, and Quantity at minimum.");
      return;
    }

    if (editingId) {
      setOrders(prev => prev.map(o => o.id === editingId ? { ...o, ...formData, qty: parseInt(formData.qty) || 0, id: o.id } : o));
      setEditingId(null);
    } else {
      const newOrder: Order = {
        id: Date.now(),
        customer: formData.customer,
        buyer: formData.buyer, // <--- NEW FIELD
        style: formData.style,
        color: formData.color,
        poNo: formData.poNo,
        qty: parseInt(formData.qty) || 0,
        deliveryDate: formData.deliveryDate,
        psd: formData.psd
      };
      setOrders([newOrder, ...orders]);
    }
    setFormData({ customer: '', buyer: '', style: '', color: '', poNo: '', qty: '', deliveryDate: '', psd: '' });
  };

  const handleEdit = (order: Order) => {
    setEditingId(order.id);
    setFormData({
      customer: order.customer, 
      buyer: order.buyer || '', // <--- NEW FIELD
      style: order.style, 
      color: order.color, 
      poNo: order.poNo,
      qty: order.qty.toString(), 
      deliveryDate: order.deliveryDate, 
      psd: order.psd
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this order?")) {
      setOrders(prev => prev.filter(o => o.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setFormData({ customer: '', buyer: '', style: '', color: '', poNo: '', qty: '', deliveryDate: '', psd: '' });
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 mt-8">
      {/* Form Section */}
      <div className={`rounded-2xl border p-6 shadow-xl mb-10 transition-all ${editingId ? 'bg-blue-900/10 border-blue-500/30' : 'bg-neutral-900 border-neutral-800'}`}>
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-4">{editingId ? 'Editing Entry' : 'New Entry'}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
          {/* Customer */}
          <div className="space-y-1.5">
             <label className="text-[10px] uppercase font-bold text-neutral-500 ml-1">Customer</label>
             <input name="customer" value={formData.customer} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" placeholder="e.g. HIKH" />
          </div>
          
          {/* Buyer - NEW */}
          <div className="space-y-1.5">
             <label className="text-[10px] uppercase font-bold text-blue-400 ml-1">Buyer</label>
             <input name="buyer" value={formData.buyer} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" placeholder="e.g. Hugo Boss" />
          </div>

          {['style', 'color', 'poNo'].map(field => (
            <div key={field} className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-neutral-500 ml-1">{field}</label>
              <input name={field} value={formData[field as keyof typeof formData]} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" />
            </div>
          ))}
          
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-neutral-500 ml-1">Qty</label>
            <input name="qty" type="number" value={formData.qty} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none" />
          </div>
          
          {['deliveryDate', 'psd'].map(field => (
            <div key={field} className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-neutral-500 ml-1">{field === 'psd' ? 'Start Date' : 'Delivery'}</label>
              <input name={field} type="date" value={formData[field as keyof typeof formData]} onChange={handleChange} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 outline-none [color-scheme:dark]" />
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4 border-t border-neutral-800">
            <button onClick={handleSubmit} className="bg-white hover:bg-neutral-200 text-black px-6 py-2 rounded-full font-bold text-sm transition-colors">
                {editingId ? 'UPDATE' : 'ADD ENTRY'}
            </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-neutral-900 text-neutral-500 text-[10px] uppercase font-bold border-b border-neutral-800">
            <tr>
              <th className="p-4">Customer/Style</th>
              <th className="p-4">Buyer</th> {/* NEW HEADER */}
              <th className="p-4">PO</th>
              <th className="p-4">Dates</th>
              <th className="p-4 text-right">Qty</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/50">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-white/[0.02]">
                <td className="p-4">
                  <div className="text-white font-bold">{order.style}</div>
                  <div className="text-xs text-neutral-500">{order.customer}</div>
                </td>
                <td className="p-4 text-xs text-neutral-400">{order.buyer || '-'}</td> {/* NEW DATA */}
                <td className="p-4 text-sm text-neutral-400 font-mono">{order.poNo}</td>
                <td className="p-4 text-xs text-neutral-400">
                  <div>PSD: {order.psd}</div>
                  <div>DEL: {order.deliveryDate}</div>
                </td>
                <td className="p-4 text-right text-white font-mono font-bold">{order.qty}</td>
                <td className="p-4 flex justify-center gap-2">
                  <button onClick={() => handleEdit(order)} className="text-blue-400 hover:bg-blue-400/10 p-2 rounded">Edit</button>
                  <button onClick={() => handleDelete(order.id)} className="text-red-500 hover:bg-red-500/10 p-2 rounded">Del</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}