import { useState, useMemo } from 'react';
import { Order } from '../types';

interface OrderSearchProps {
  orders: Order[];
}

export default function OrderSearch({ orders }: OrderSearchProps) {
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [searchResults, setSearchResults] = useState<Order[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // 1. Get unique customers from the orders list
  const customers = useMemo(() => {
    return [...new Set(orders.map(o => o.customer))];
  }, [orders]);

  // 2. Get styles ONLY for the selected customer
  const availableStyles = useMemo(() => {
    if (!selectedCustomer) return [];
    return [...new Set(orders
      .filter(o => o.customer === selectedCustomer)
      .map(o => o.style)
    )];
  }, [orders, selectedCustomer]);

  const handleSearch = () => {
    const results = orders.filter(o => 
      o.customer === selectedCustomer && 
      o.style === selectedStyle
    );
    setSearchResults(results);
    setHasSearched(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 mt-8">
      {/* Search Controls */}
      <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-8 shadow-xl mb-10 text-center">
        <h2 className="text-lg font-bold text-white mb-6">Check Order Status</h2>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          
          {/* Customer Dropdown */}
          <select 
            value={selectedCustomer}
            onChange={(e) => {
              setSelectedCustomer(e.target.value);
              setSelectedStyle(''); // Reset style when customer changes
              setHasSearched(false);
            }}
            className="bg-neutral-950 border border-neutral-800 text-white text-sm rounded-lg p-3 w-64 focus:ring-2 focus:ring-blue-600 outline-none"
          >
            <option value="">Select Customer</option>
            {customers.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Style Dropdown (Disabled until customer selected) */}
          <select 
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value)}
            disabled={!selectedCustomer}
            className="bg-neutral-950 border border-neutral-800 text-white text-sm rounded-lg p-3 w-64 focus:ring-2 focus:ring-blue-600 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Select Style</option>
            {availableStyles.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <button 
            onClick={handleSearch}
            disabled={!selectedCustomer || !selectedStyle}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white px-8 py-3 rounded-lg font-bold text-sm transition-all"
          >
            SEARCH
          </button>
        </div>
      </div>

      {/* Results Area */}
      {hasSearched && (
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-4 bg-neutral-900 border-b border-neutral-800 flex justify-between items-center">
            <h3 className="text-sm font-bold text-white">Search Results</h3>
            <span className="text-xs text-neutral-500">{searchResults.length} matches found</span>
          </div>

          <table className="w-full text-left">
            <thead className="bg-neutral-900/50 text-neutral-500 text-[10px] uppercase font-bold border-b border-neutral-800">
              <tr>
                <th className="p-4">PO Number</th>
                <th className="p-4">Color</th>
                <th className="p-4">Dates</th>
                <th className="p-4 text-right">Quantity</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {searchResults.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-neutral-500">
                    No active orders found for this Style/Customer combination.
                  </td>
                </tr>
              ) : (
                searchResults.map(order => (
                  <tr key={order.id} className="hover:bg-white/[0.02]">
                    <td className="p-4 text-white font-mono text-sm">{order.poNo}</td>
                    <td className="p-4 text-neutral-300">{order.color}</td>
                    <td className="p-4 text-xs text-neutral-400">
                      <div>Start: {order.psd}</div>
                      <div>Del: {order.deliveryDate}</div>
                    </td>
                    <td className="p-4 text-right text-white font-mono">{order.qty}</td>
                    <td className="p-4 text-right">
                       <span className="px-2 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded text-[10px] font-bold">
                         ACTIVE
                       </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}