import React, { useState, useMemo } from 'react';
import { Order, DailyOutputRecord, LoadingPlanItem, DowntimeRecord } from '../types';

interface ReportsProps {
  orders: Order[];
  plans: LoadingPlanItem[];
  outputs: DailyOutputRecord[];
  downtimeRecords?: DowntimeRecord[]; // Made optional to prevent breaking if not passed yet
}

export default function Reports({ orders, plans, outputs, downtimeRecords = [] }: ReportsProps) {
  const [activeReport, setActiveReport] = useState<'summary' | 'matrix' | 'daily'>('summary');
  
  // --- STATE FOR DAILY FLOOR SHEET ---
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');

  // --- REPORT 1: ORDER BOOK STATUS SUMMARY ---
  const summaryData = useMemo(() => {
    return orders.map(order => {
      const orderPlanIds = plans.filter(p => p.orderId === order.id).map(p => p.id);
      const relatedOutputs = outputs.filter(o => orderPlanIds.includes(o.planId));

      const totalPrint = relatedOutputs.reduce((sum, o) => sum + o.totalPrinting, 0);
      const totalPack = relatedOutputs.reduce((sum, o) => sum + o.totalPacking, 0);
      const totalDispatch = relatedOutputs.reduce((sum, o) => sum + o.totalDispatch, 0);
      const totalRejects = relatedOutputs.reduce((sum, o) => sum + o.totalRejects, 0);

      const rejectPercentage = totalPrint > 0 ? ((totalRejects / totalPrint) * 100).toFixed(1) : '0';

      return { ...order, totalPrint, totalPack, totalDispatch, totalRejects, rejectPercentage };
    });
  }, [orders, plans, outputs]);

  // --- REPORT 2: PRODUCTION MATRIX ---
  const matrixData = useMemo(() => {
    const allDates = [...new Set(outputs.map(o => o.date))].sort();
    const rows = orders.map(order => {
      const orderPlanIds = plans.filter(p => p.orderId === order.id).map(p => p.id);
      const relatedOutputs = outputs.filter(o => orderPlanIds.includes(o.planId));
      
      const dateMap: { [key: string]: { r: number, d: number } } = {};
      relatedOutputs.forEach(o => {
        if (!dateMap[o.date]) dateMap[o.date] = { r: 0, d: 0 };
        dateMap[o.date].r += o.totalPrinting;
        dateMap[o.date].d += o.totalDispatch;
      });
      return { order, dateMap };
    });
    return { dates: allDates, rows };
  }, [orders, plans, outputs]);

  // --- REPORT 3: DAILY FLOOR SHEET DATA ---
  const dailyReportData = useMemo(() => {
    if (!selectedPlanId) return null;

    // 1. Find the specific Output Record for this Date + Plan
    const outputRecord = outputs.find(o => o.date === selectedDate && o.planId.toString() === selectedPlanId);
    
    // 2. Find the Plan details (for Header info)
    const planDetails = plans.find(p => p.id.toString() === selectedPlanId);

    // 3. Find Downtime Records for this Date
    const daysDowntime = downtimeRecords.filter(d => d.date === selectedDate);

    return { outputRecord, planDetails, daysDowntime };
  }, [selectedDate, selectedPlanId, outputs, plans, downtimeRecords]);

  // Get unique plans that have data (for the dropdown)
  const availablePlansForDate = useMemo(() => {
    const planIdsOnDate = outputs.filter(o => o.date === selectedDate).map(o => o.planId);
    return plans.filter(p => planIdsOnDate.includes(p.id));
  }, [outputs, selectedDate, plans]);


  return (
    <div className="max-w-[95vw] mx-auto px-6 mt-8 pb-20">
      
      {/* Report Switcher */}
      <div className="flex justify-center mb-8">
        <div className="bg-neutral-900 p-1.5 rounded-xl border border-neutral-800 inline-flex gap-1">
          <button onClick={() => setActiveReport('summary')} className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all ${activeReport === 'summary' ? 'bg-blue-600 text-white shadow-lg' : 'text-neutral-500 hover:text-white'}`}>ORDER BOOK STATUS</button>
          <button onClick={() => setActiveReport('matrix')} className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all ${activeReport === 'matrix' ? 'bg-blue-600 text-white shadow-lg' : 'text-neutral-500 hover:text-white'}`}>WEEKLY LOADING PLAN</button>
          <button onClick={() => setActiveReport('daily')} className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all ${activeReport === 'daily' ? 'bg-blue-600 text-white shadow-lg' : 'text-neutral-500 hover:text-white'}`}>DAILY FLOOR SHEET</button>
        </div>
      </div>

      {/* --- VIEW 1: SUMMARY TABLE --- */}
      {activeReport === 'summary' && (
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden backdrop-blur-sm shadow-2xl animate-in fade-in duration-500">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-neutral-950 text-neutral-500 text-[10px] uppercase font-bold border-b border-neutral-800">
                  <th className="p-4 sticky left-0 bg-neutral-950 z-10 border-r border-neutral-800">Customer</th>
                  <th className="p-4">Buyer</th>
                  <th className="p-4">Style #</th>
                  <th className="p-4">PO #</th>
                  <th className="p-4 text-right">PO Qty</th>
                  <th className="p-4 text-right">Delivery</th>
                  <th className="p-4 text-center border-l border-neutral-800 text-green-400">Total Print</th>
                  <th className="p-4 text-center text-blue-400">Total Pack</th>
                  <th className="p-4 text-center text-purple-400">Dispatch</th>
                  <th className="p-4 text-center text-red-400">Rejects</th>
                  <th className="p-4 text-center text-red-400">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/50">
                {summaryData.map(row => (
                  <tr key={row.id} className="hover:bg-white/[0.02]">
                    <td className="p-4 text-sm font-bold text-white sticky left-0 bg-neutral-900 border-r border-neutral-800">{row.customer}</td>
                    <td className="p-4 text-xs text-neutral-400">{row.buyer || '-'}</td>
                    <td className="p-4 text-xs text-blue-300 font-medium">{row.style}</td>
                    <td className="p-4 text-xs text-neutral-400 font-mono">{row.poNo}</td>
                    <td className="p-4 text-right text-sm font-bold text-white">{row.qty.toLocaleString()}</td>
                    <td className="p-4 text-right text-xs text-neutral-400">{row.deliveryDate}</td>
                    <td className="p-4 text-center font-mono text-sm text-green-400 border-l border-neutral-800 bg-green-900/5">{row.totalPrint.toLocaleString()}</td>
                    <td className="p-4 text-center font-mono text-sm text-blue-400 bg-blue-900/5">{row.totalPack.toLocaleString()}</td>
                    <td className="p-4 text-center font-mono text-sm text-purple-400 bg-purple-900/5">{row.totalDispatch.toLocaleString()}</td>
                    <td className="p-4 text-center font-mono text-sm text-red-400 bg-red-900/5">{row.totalRejects.toLocaleString()}</td>
                    <td className="p-4 text-center font-mono text-xs text-red-400 font-bold">{row.rejectPercentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- VIEW 2: MATRIX TABLE --- */}
      {activeReport === 'matrix' && (
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden backdrop-blur-sm shadow-2xl animate-in fade-in duration-500">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-neutral-950 text-neutral-500 text-[10px] uppercase font-bold border-b border-neutral-800">
                  <th className="p-4 sticky left-0 bg-neutral-950 z-20 border-r border-neutral-800 min-w-[200px]">Order Details</th>
                  <th className="p-4 text-center bg-neutral-950 sticky left-[200px] z-20 border-r border-neutral-800">Type</th>
                  {matrixData.dates.map(date => (
                    <th key={date} className="p-4 text-center min-w-[80px] border-r border-neutral-800/50">
                      {date.slice(5)} <br/> <span className="text-[9px] opacity-50">Day</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/50">
                {matrixData.rows.map(({ order, dateMap }) => (
                  <React.Fragment key={order.id}>
                    <tr className="bg-neutral-900/20 hover:bg-white/[0.02]">
                      <td rowSpan={2} className="p-4 sticky left-0 bg-neutral-900 z-10 border-r border-neutral-800 align-top">
                        <div className="font-bold text-white text-xs">{order.customer}</div>
                        <div className="text-[10px] text-blue-400">{order.style}</div>
                        <div className="text-[9px] text-neutral-500 font-mono mt-1">{order.poNo}</div>
                      </td>
                      <td className="p-2 text-xs font-bold text-green-500 text-center sticky left-[200px] bg-neutral-900 border-r border-neutral-800">PROD</td>
                      {matrixData.dates.map(date => (
                        <td key={date} className="p-2 text-center border-r border-neutral-800/30 text-xs font-mono text-neutral-300">
                          {dateMap[date]?.r > 0 ? dateMap[date].r : '-'}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-white/[0.02] border-b border-neutral-800">
                      <td className="p-2 text-xs font-bold text-purple-500 text-center sticky left-[200px] bg-neutral-900 border-r border-neutral-800">DISP</td>
                      {matrixData.dates.map(date => (
                        <td key={date} className="p-2 text-center border-r border-neutral-800/30 text-xs font-mono text-neutral-500">
                          {dateMap[date]?.d > 0 ? dateMap[date].d : '-'}
                        </td>
                      ))}
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- VIEW 3: DAILY FLOOR SHEET (NEW) --- */}
      {activeReport === 'daily' && (
        <div className="animate-in fade-in duration-500">
          
          {/* Controls */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-8 flex flex-col md:flex-row gap-6 items-end">
             <div className="space-y-1.5 flex-1">
                <label className="text-[10px] uppercase font-bold text-neutral-500 ml-1">Report Date</label>
                <input 
                  type="date" 
                  value={selectedDate} 
                  onChange={(e) => { setSelectedDate(e.target.value); setSelectedPlanId(''); }}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-blue-600 outline-none [color-scheme:dark]" 
                />
             </div>
             <div className="space-y-1.5 flex-1">
                <label className="text-[10px] uppercase font-bold text-neutral-500 ml-1">Select Active Job (Style)</label>
                <select 
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-blue-600 outline-none"
                >
                  <option value="">-- Select Job Running on {selectedDate} --</option>
                  {availablePlansForDate.length === 0 ? (
                    <option disabled>No production records for this date</option>
                  ) : (
                    availablePlansForDate.map(p => (
                      <option key={p.id} value={p.id}>{p.customer} | {p.style}</option>
                    ))
                  )}
                </select>
             </div>
             <button onClick={() => window.print()} className="bg-white text-neutral-950 px-6 py-2.5 rounded-lg font-bold text-xs hover:bg-neutral-200 transition-colors">
               PRINT SHEET
             </button>
          </div>

          {dailyReportData ? (
             <div className="bg-white text-black p-8 rounded-xl max-w-5xl mx-auto shadow-2xl font-mono text-sm">
                
                {/* SHEET HEADER */}
                <div className="border-b-2 border-black pb-4 mb-6">
                  <div className="flex justify-between items-start mb-4">
                    <h1 className="text-2xl font-black uppercase tracking-tighter">Daily Production Floor Sheet</h1>
                    <div className="text-right">
                      <div className="text-xs font-bold text-neutral-500 uppercase">Date</div>
                      <div className="text-xl font-bold">{selectedDate}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="font-bold text-neutral-500 block">CUSTOMER</span>
                      <span className="font-bold text-lg">{dailyReportData.planDetails?.customer}</span>
                    </div>
                    <div>
                      <span className="font-bold text-neutral-500 block">STYLE NO</span>
                      <span className="font-bold text-lg">{dailyReportData.planDetails?.style}</span>
                    </div>
                    <div>
                      <span className="font-bold text-neutral-500 block">TABLE NO</span>
                      <span className="font-bold text-lg">{dailyReportData.planDetails?.tableNo}</span>
                    </div>
                    <div className="text-right">
                       <span className="font-bold text-neutral-500 block">DAY TARGET</span>
                       <span className="font-bold text-lg text-blue-600">{dailyReportData.outputRecord?.dailyTarget}</span>
                    </div>
                  </div>
                </div>

                {/* CONTENT GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* LEFT: HOURLY OUTPUT */}
                  <div className="lg:col-span-2">
                    <h3 className="font-bold uppercase mb-2 border-b border-black pb-1">Hourly Output</h3>
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-neutral-300">
                          <th className="py-2 w-24">Time</th>
                          <th className="py-2 text-center text-neutral-400">Seat</th>
                          <th className="py-2 text-center font-bold">Print</th>
                          <th className="py-2 text-center text-neutral-400">Cure</th>
                          <th className="py-2 text-center text-neutral-400">Check</th>
                          <th className="py-2 text-center font-bold">Pack</th>
                          <th className="py-2 text-center font-bold">Disp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200">
                        {dailyReportData.outputRecord?.hourlyData.map((row, idx) => (
                          <tr key={idx}>
                            <td className="py-2 font-bold text-neutral-500 whitespace-nowrap">{row.timeSlot}</td>
                            <td className="py-2 text-center text-neutral-400">{row.seating || '-'}</td>
                            <td className="py-2 text-center font-bold text-black bg-neutral-100">{row.printing || '-'}</td>
                            <td className="py-2 text-center text-neutral-400">{row.curing || '-'}</td>
                            <td className="py-2 text-center text-neutral-400">{row.checking || '-'}</td>
                            <td className="py-2 text-center font-bold">{row.packing || '-'}</td>
                            <td className="py-2 text-center font-bold">{row.dispatch || '-'}</td>
                          </tr>
                        ))}
                        <tr className="border-t-2 border-black bg-neutral-100">
                          <td className="py-3 font-black">TOTAL</td>
                          <td className="py-3 text-center">-</td>
                          <td className="py-3 text-center font-black text-lg">{dailyReportData.outputRecord?.totalPrinting}</td>
                          <td className="py-3 text-center">-</td>
                          <td className="py-3 text-center">-</td>
                          <td className="py-3 text-center font-black text-lg">{dailyReportData.outputRecord?.totalPacking}</td>
                          <td className="py-3 text-center font-black text-lg">{dailyReportData.outputRecord?.totalDispatch}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* RIGHT: DOWNTIME LOG */}
                  <div>
                    <h3 className="font-bold uppercase mb-2 border-b border-black pb-1 text-red-600">Downtime Log</h3>
                    {dailyReportData.daysDowntime.length === 0 ? (
                      <div className="text-neutral-400 italic text-xs py-4">No downtime recorded for this date.</div>
                    ) : (
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-neutral-300">
                             <th className="py-2">Category</th>
                             <th className="py-2 text-right">Hrs</th>
                             <th className="py-2 text-right">Ack</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200">
                           {dailyReportData.daysDowntime.map(d => (
                             <tr key={d.id}>
                               <td className="py-2">
                                 <div className="font-bold">{d.category}</div>
                                 <div className="text-[10px] text-neutral-500">{d.reason}</div>
                               </td>
                               <td className="py-2 text-right font-bold text-red-600">{d.hours}</td>
                               <td className="py-2 text-right text-[10px] uppercase">{d.acknowledgedBy}</td>
                             </tr>
                           ))}
                           <tr className="border-t-2 border-black bg-red-50">
                             <td className="py-2 font-black">TOTAL LOSS</td>
                             <td className="py-2 text-right font-black text-red-600 text-lg">
                               {dailyReportData.daysDowntime.reduce((acc, curr) => acc + curr.hours, 0)} hrs
                             </td>
                             <td></td>
                           </tr>
                        </tbody>
                      </table>
                    )}
                    
                    {/* Rejects Summary */}
                    <div className="mt-8">
                       <h3 className="font-bold uppercase mb-2 border-b border-black pb-1 text-orange-600">Quality Check</h3>
                       <div className="flex justify-between items-end">
                          <span className="text-xs font-bold text-neutral-500">TOTAL REJECTS</span>
                          <span className="text-xl font-black text-orange-600">{dailyReportData.outputRecord?.totalRejects}</span>
                       </div>
                    </div>
                  </div>

                </div>

                <div className="mt-12 pt-8 border-t border-dashed border-neutral-300 flex justify-between text-xs text-neutral-400">
                   <div>Printed by: System Admin</div>
                   <div>Authorized Signature: _______________________</div>
                </div>

             </div>
          ) : (
            <div className="text-center py-20 bg-neutral-900/50 rounded-xl border border-neutral-800 border-dashed">
              <p className="text-neutral-500 font-bold">Please select a Date and Job to generate the floor sheet.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}