import React from 'react'

function App() {
  // We'll use this sample data to see how the UI looks
  const orders = [
    { id: 1, customer: 'HIKH', buyer: 'Hugo Boss', style: 'GE 50511502', qty: 400, psd: '2026-01-28', print: 150 },
    { id: 2, customer: 'HIKU', buyer: 'HIT-GANTAB', style: '4100304PF', qty: 1121, psd: '2026-01-24', print: 1121 },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 p-8 font-sans">
      {/* Top Header Section */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase">Order Book Status</h1>
          <p className="text-neutral-500 text-sm mt-1">Screen Printing Management System v1.0</p>
        </div>
        <button className="bg-white text-black px-5 py-2 rounded-full font-bold text-sm hover:scale-105 transition-transform">
          + ADD NEW ENTRY
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-neutral-900 p-5 rounded-2xl border border-neutral-800">
          <p className="text-xs font-bold text-neutral-500 uppercase">Active Orders</p>
          <p className="text-2xl font-mono text-white">{orders.length}</p>
        </div>
        <div className="bg-neutral-900 p-5 rounded-2xl border border-neutral-800">
          <p className="text-xs font-bold text-neutral-500 uppercase">Total Items Pending</p>
          <p className="text-2xl font-mono text-blue-500">1,521</p>
        </div>
      </div>

      {/* The Table - Direct Mapping from your Excel */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-800/50 text-neutral-400 text-[11px] uppercase tracking-widest font-bold">
              <th className="p-5">Style & Customer</th>
              <th className="p-5">PO Qty</th>
              <th className="p-5">PSD (Date)</th>
              <th className="p-5 text-center">Production Progress (Print)</th>
              <th className="p-5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-neutral-800/30 transition-colors group">
                <td className="p-5">
                  <div className="font-bold text-white group-hover:text-blue-400 transition-colors">{order.style}</div>
                  <div className="text-xs text-neutral-500 uppercase font-medium">{order.customer} | {order.buyer}</div>
                </td>
                <td className="p-5 font-mono text-lg">{order.qty}</td>
                <td className="p-5 text-sm text-neutral-400">{order.psd}</td>
                <td className="p-5">
                  <div className="max-w-[200px] mx-auto">
                    <div className="flex justify-between text-[10px] mb-1.5 font-bold">
                      <span className="text-neutral-500">PRINTED</span>
                      <span className="text-blue-500">{Math.round((order.print / order.qty) * 100)}%</span>
                    </div>
                    <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all duration-1000" 
                        style={{ width: `${(order.print / order.qty) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="p-5 text-right">
                  <span className="px-3 py-1 bg-neutral-800 text-[10px] font-black rounded-full border border-neutral-700">
                    ACTIVE
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default App