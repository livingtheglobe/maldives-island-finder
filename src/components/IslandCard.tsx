import React, { useState } from 'react';
import { Island, MarineActivity, TransferType, FerryAccess } from '../types';

interface IslandCardProps {
  island: Island;
  aiReason?: string;
}

export const IslandCard: React.FC<IslandCardProps> = ({ island, aiReason }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const text = island.description || "";
  const shouldShowReadMore = text.length > 150;

  const hasFerry = island.ferryAccess === FerryAccess.Direct; 

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full group">
      {/* 
         Fixed height strip (h-48 = 192px)
      */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img 
          src={island.imageUrl} 
          alt={island.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-teal-900 uppercase tracking-wider shadow-sm">
          {island.atoll}
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-serif font-bold text-gray-900">{island.name}</h3>
        </div>

        {aiReason && (
          <div className="mb-3 p-2.5 bg-teal-50 border border-teal-100 rounded-lg animate-fade-in">
            <p className="text-[10px] text-teal-600 font-bold uppercase mb-0.5 flex items-center gap-1">
               <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
               Recommended for you
            </p>
            <p className="text-sm text-teal-900 italic leading-tight">"{aiReason}"</p>
          </div>
        )}
        
        <div className="mb-4">
          <p className={`text-gray-600 text-xs leading-relaxed ${isExpanded ? '' : 'line-clamp-3'}`}>
            {text}
          </p>
          {shouldShowReadMore && (
             <button 
             onClick={(e) => {
               e.preventDefault();
               setIsExpanded(!isExpanded);
             }}
             className="text-[10px] font-bold text-gray-400 hover:text-gray-600 mt-1 flex items-center gap-0.5 transition-colors focus:outline-none uppercase tracking-wide"
           >
             {isExpanded ? (
               <>Show Less <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" /></svg></>
             ) : (
               <>Read More <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg></>
             )}
           </button>
          )}
        </div>

        {/* Labels: Transfers - Specific Timing */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {island.transferTypes.map(t => {
             const isFlight = t.includes('Flight');
             const isSpeedboat = t.includes('Speedboat');
             return (
                <span 
                  key={t} 
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                    isFlight 
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-100' 
                    : 'bg-blue-50 text-blue-700 border-blue-100'
                  }`}
                >
                  {t}
                </span>
             );
          })}
          
          {hasFerry && (
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-100">
              Direct Public Ferry
            </span>
          )}
        </div>

        {/* Labels: Marine Life & Features */}
        <div className="flex flex-wrap gap-1.5 mb-4">
            {[MarineActivity.NurseSharks, MarineActivity.MantaRays, MarineActivity.WhaleSharks, MarineActivity.Turtles, MarineActivity.Dolphins].map(act => {
                 if (!island.marineActivities.includes(act)) return null;
                 const isSeasonal = island.seasonalActivities.includes(act);
                 return (
                    <span 
                      key={act} 
                      className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                        isSeasonal 
                        ? 'bg-amber-50 text-amber-800 border-amber-200' 
                        : 'bg-cyan-50 text-cyan-800 border-cyan-200'
                      }`}
                    >
                       {act} {isSeasonal && <span className="italic text-[9px] opacity-75 ml-0.5">(Seasonal)</span>}
                    </span>
                 );
              })}
             
             {island.hasSandbankAttached && (
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                    island.isSandbankSeasonal
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-yellow-50 text-yellow-800 border-yellow-100'
                }`}>
                  Attached Sandbank {island.isSandbankSeasonal && <span className="italic text-[9px] opacity-75 ml-0.5">(Seasonal)</span>}
                </span>
             )}
        </div>

        <div className="mt-auto space-y-2 mb-4">
          {/* Primary Action: Travel Guide */}
          {island.travelGuideUrl && (
            <a 
              href={island.travelGuideUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold uppercase tracking-wide rounded-lg transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Get Travel Guide
            </a>
          )}

          {/* Secondary Action: Video */}
          {island.videoUrl && (
            <a 
              href={island.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2 bg-white hover:bg-gray-50 text-gray-600 text-xs font-bold uppercase tracking-wide rounded-lg transition-colors border border-gray-200 hover:border-gray-300"
            >
              <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
              </svg>
              Watch Walking Tour
            </a>
          )}
        </div>

        <div className="space-y-1.5 border-t border-gray-100 pt-3 text-xs text-gray-500">
          <div className="flex items-center justify-between">
            <span>Atmosphere:</span>
            <span className="font-medium text-gray-800 text-right">{island.atmosphere.map(a => a.split('&')[0]).join(', ')}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Size:</span>
            <span className="font-medium text-gray-800">{island.size.split('(')[0]}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
