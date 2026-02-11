import React, { useState } from 'react';

// --- Components ---
import LoginPage from './components/LoginPage';
import OrderEntry from './components/OrderEntry';
import OrderSearch from './components/OrderSearch';
import LoadingPlan from './components/LoadingPlan';
import LoadingPlanSearch from './components/LoadingPlanSearch';
import DailyOutput from './components/DailyOutput';
import DowntimeLog from './components/DownTimeLog'; // Ensure file name matches
import SupplierRegister from './components/SupplierRegister';
import IncomingGoods from './components/IncomingGoods';
import Reports from './components/Reports';

// --- Types ---
import { 
  Order, 
  LoadingPlanItem, 
  DailyOutputRecord, 
  DowntimeRecord, 
  Supplier, 
  IncomingGood 
} from './types';

// --- User State Interface ---
interface UserState {
  isLoggedIn: boolean;
  role: 'admin' | 'worker';
  name: string;
}

function App() {
  // 1. Authentication State
  const [user, setUser] = useState<UserState>({ isLoggedIn: false, role: 'admin', name: '' });

  // 2. Application Data States
  const [orders, setOrders] = useState<Order[]>([
    { 
      id: 1, customer: 'HIKH', buyer: 'Hugo Boss', style: 'GE 50511502', color: 'Midnight Blue', 
      poNo: 'PO-4451', qty: 400, deliveryDate: '2026-03-01', psd: '2026-01-28' 
    },
    { 
      id: 2, customer: 'HIKH', buyer: 'Hugo Boss', style: 'GE 9999', color: 'Black', 
      poNo: 'PO-4452', qty: 1200, deliveryDate: '2026-04-01', psd: '2026-02-15' 
    }
  ]);

  const [loadingPlans, setLoadingPlans] = useState<LoadingPlanItem[]>([]);
  const [dailyOutputs, setDailyOutputs] = useState<DailyOutputRecord[]>([]);
  const [downtimeRecords, setDowntimeRecords] = useState<DowntimeRecord[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [incomingGoods, setIncomingGoods] = useState<IncomingGood[]>([]);

  // 3. Navigation State
  const [currentTab, setCurrentTab] = useState<string>('entry');

  // --- Handlers ---
  const handleLogin = (role: 'admin' | 'worker', name: string) => {
    setUser({ isLoggedIn: true, role, name });
    setCurrentTab(role === 'admin' ? 'reports' : 'output');
  };

  const handleLogout = () => {
    setUser({ isLoggedIn: false, role: 'admin', name: '' });
    setCurrentTab('entry');
  };

  // --- Helper: Tab Button Component (Redesigned) ---
  const TabButton = ({ id, label, icon }: { id: string, label: string, icon?: React.ReactNode }) => {
    if (user.role === 'worker' && !['output', 'downtime'].includes(id)) return null;

    const isActive = currentTab === id;
    
    // Dynamic styles based on active state
    const baseClasses = "relative px-4 py-2 rounded-full text-[11px] font-bold transition-all duration-300 flex items-center gap-2 select-none";
    const activeClasses = "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] ring-1 ring-white/20 scale-105";
    const inactiveClasses = "text-neutral-400 hover:text-white hover:bg-white/5";

    return (
      <button onClick={() => setCurrentTab(id)} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
        {isActive && (
          <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 to-blue-400 opacity-20 blur-md"></span>
        )}
        <span className="relative z-10 flex items-center gap-1.5">
          {icon}
          {label}
        </span>
      </button>
    );
  };

  if (!user.isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-blue-500/30 pb-20">
      
      {/* --- ENHANCED HEADER --- */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-neutral-950/80 backdrop-blur-xl shadow-2xl">
        <div className="max-w-[1440px] mx-auto px-4 h-20 flex items-center justify-between gap-4">
          
          {/* Left: Brand & User Profile */}
          <div className="flex items-center gap-5 shrink-0">
             {/* Logo Box */}
             <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                <div className="relative w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center border border-white/10 shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
                </div>
             </div>

             {/* Text Info */}
             <div className="hidden md:block">
               <h1 className="text-sm font-black text-white tracking-widest leading-none mb-1">PRINTSYS<span className="text-blue-500">PRO</span></h1>
               <div className="flex items-center gap-1.5 px-2 py-0.5 bg-neutral-900/50 rounded-md border border-white/5">
                 <div className={`w-1.5 h-1.5 rounded-full ${user.role === 'admin' ? 'bg-indigo-500 shadow-[0_0_8px_#6366f1]' : 'bg-green-500 shadow-[0_0_8px_#22c55e]'}`}></div>
                 <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                   {user.role === 'admin' ? 'Admin' : user.name}
                 </span>
               </div>
             </div>
          </div>

          {/* Center: Navigation Dock */}
          <nav className="flex-1 flex justify-center overflow-x-auto no-scrollbar mx-4">
            <div className="flex items-center gap-1 p-1.5 rounded-full border border-white/5 bg-neutral-900/80 shadow-2xl backdrop-blur-md">
              <TabButton id="reports" label="REPORTS" />
              <div className="w-px h-4 bg-white/5 mx-1"></div>
              <TabButton id="entry" label="ORDERS" />
              <TabButton id="plan" label="PLANNING" />
              <TabButton id="plan-search" label="SEARCH" />
              <div className="w-px h-4 bg-white/5 mx-1"></div>
              <TabButton id="output" label="OUTPUT" />
              <TabButton id="downtime" label="DOWNTIME" />
              <div className="w-px h-4 bg-white/5 mx-1"></div>
              <TabButton id="supplier" label="SUPPLIERS" />
              <TabButton id="incoming" label="INCOMING" />
              <TabButton id="search" label="STATUS" />
            </div>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 shrink-0">
             <button 
               onClick={handleLogout} 
               className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 transition-all duration-300"
               title="Sign Out"
             >
               <span className="text-[10px] font-bold text-neutral-400 group-hover:text-red-400">LOGOUT</span>
               <svg className="text-neutral-500 group-hover:text-red-500 transition-colors" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
             </button>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="animate-in fade-in slide-in-from-bottom-2 duration-500 pt-6">
        {currentTab === 'reports' && <Reports orders={orders} plans={loadingPlans} outputs={dailyOutputs} downtimeRecords={downtimeRecords} />}
        {currentTab === 'entry' && <OrderEntry orders={orders} setOrders={setOrders} />}
        {currentTab === 'plan' && <LoadingPlan orders={orders} plans={loadingPlans} setPlans={setLoadingPlans} />}
        {currentTab === 'plan-search' && <LoadingPlanSearch plans={loadingPlans} setPlans={setLoadingPlans} />}
        {currentTab === 'output' && <DailyOutput plans={loadingPlans} outputs={dailyOutputs} setOutputs={setDailyOutputs} />}
        {currentTab === 'downtime' && <DowntimeLog records={downtimeRecords} setRecords={setDowntimeRecords} />}
        {currentTab === 'supplier' && <SupplierRegister orders={orders} suppliers={suppliers} setSuppliers={setSuppliers} />}
        {currentTab === 'incoming' && <IncomingGoods suppliers={suppliers} orders={orders} goods={incomingGoods} setGoods={setIncomingGoods} />}
        {currentTab === 'search' && <OrderSearch orders={orders} />}
      </main>

    </div>
  );
}

export default App;