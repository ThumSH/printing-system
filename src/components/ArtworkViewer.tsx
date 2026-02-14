import React, { useState, useMemo } from 'react';
import { DevelopmentItem } from '../types';

interface ArtworkViewerProps {
  devItems: DevelopmentItem[];
}

export default function ArtworkViewer({ devItems }: ArtworkViewerProps) {
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');

  // 1. Get unique customers who have development records
  const customers = useMemo(() => {
    return [...new Set(devItems.map(item => item.customer))];
  }, [devItems]);

  // 2. Get styles ONLY for the selected customer
  const availableStyles = useMemo(() => {
    if (!selectedCustomer) return [];
    return devItems.filter(item => item.customer === selectedCustomer);
  }, [devItems, selectedCustomer]);

  // 3. Find the exact item selected to display its image
  const selectedItem = useMemo(() => {
    return devItems.find(item => item.customer === selectedCustomer && item.style === selectedStyle);
  }, [devItems, selectedCustomer, selectedStyle]);

  return (
    <div className="max-w-7xl mx-auto px-6 mt-8 pb-20">
      
      {/* --- SEARCH SECTION --- */}
      <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-8 shadow-xl mb-8">
        <h2 className="text-lg font-bold text-white mb-6 text-center">Artwork Search</h2>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          
          <select 
            value={selectedCustomer}
            onChange={(e) => {
              setSelectedCustomer(e.target.value);
              setSelectedStyle(''); // Reset style when customer changes
            }}
            className="bg-neutral-950 border border-neutral-800 text-white text-sm rounded-lg p-3 w-72 focus:ring-2 focus:ring-blue-600 outline-none"
          >
            <option value="">1. Select Customer</option>
            {customers.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select 
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value)}
            disabled={!selectedCustomer}
            className="bg-neutral-950 border border-neutral-800 text-white text-sm rounded-lg p-3 w-72 focus:ring-2 focus:ring-blue-600 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">2. Select Style No</option>
            {availableStyles.map(item => (
              <option key={item.id} value={item.style}>{item.style} ({item.color})</option>
            ))}
          </select>

        </div>
      </div>

      {/* --- IMAGE VIEWER SECTION --- */}
      {selectedStyle && selectedItem && (
        <div className="animate-in zoom-in-95 duration-500">
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl overflow-hidden backdrop-blur-sm p-6 shadow-2xl">
            
            {/* Header Info */}
            <div className="flex justify-between items-start mb-6 border-b border-neutral-800 pb-4">
              <div>
                <h3 className="text-3xl font-black text-white tracking-tight">{selectedItem.style}</h3>
                <p className="text-sm font-bold text-blue-400 uppercase tracking-widest mt-1">
                  {selectedItem.customer} &bull; {selectedItem.factory}
                </p>
              </div>
              <div className="text-right">
                <span className="block text-[10px] font-bold text-neutral-500 uppercase">Garment Color</span>
                <span className="block text-lg font-bold text-white">{selectedItem.color}</span>
              </div>
            </div>

            {/* Image Display */}
            <div className="bg-neutral-950 rounded-2xl border border-neutral-800 overflow-hidden flex items-center justify-center min-h-[400px]">
              {selectedItem.image ? (
                <img 
                  src={selectedItem.image} 
                  alt={`Artwork for ${selectedItem.style}`} 
                  className="max-w-full max-h-[70vh] object-contain drop-shadow-2xl"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-neutral-600 py-20">
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  <p className="text-lg font-bold">No Artwork Uploaded</p>
                  <p className="text-sm">An image was not provided during the development stage.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}