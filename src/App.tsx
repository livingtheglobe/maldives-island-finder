import React, { useState, useMemo } from 'react';
import { ISLANDS } from './constants';
import { FilterCheckbox } from './components/FilterCheckbox';
import { IslandCard } from './components/IslandCard';
import { AIConsultant } from './components/AIConsultant';
import { FilterSection } from './components/FilterSection';
import { getIslandRecommendations } from './services/geminiService';
import { 
  FilterState, 
  Island,
  AIRecommendation, 
  Atoll,
  TransferType, 
  FerryAccess,
  IslandSize, 
  Atmosphere, 
  Accommodation, 
  BikiniBeach, 
  Watersports, 
  MarineActivity, 
  JungleVegetation, 
  Nightlife 
} from './types';

// Helper to clear all filters
const INITIAL_FILTERS: FilterState = {
  atolls: [],
  transferTypes: [],
  ferryAccess: [],
  islandSize: [],
  atmosphere: [],
  accommodations: [],
  bikiniBeach: [],
  watersports: [],
  marineActivities: [],
  jungle: [],
  nightlife: [],
  hasSandbankAttached: false,
  hasFloatingBar: false
};

const App: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [resetSignal, setResetSignal] = useState(0);
  
  // State for Mobile Filter Toggle (Twist/Twirl)
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Generic Handler for Array-based filters
  const handleArrayFilterChange = <K extends keyof FilterState>(
    category: K,
    value: string,
    checked: boolean
  ) => {
    setFilters(prev => {
      const currentList = prev[category] as string[];
      const newList = checked
        ? [...currentList, value]
        : currentList.filter(item => item !== value);
      return { ...prev, [category]: newList };
    });
  };

  // Handler for Boolean toggles
  const handleBooleanFilterChange = (key: 'hasSandbankAttached' | 'hasFloatingBar', checked: boolean) => {
    setFilters(prev => ({ ...prev, [key]: checked }));
  };

  const handleAISearch = async (prompt: string) => {
    setAiLoading(true);
    setSearchError(null); // Clear previous errors
    
    try {
      const recommendations = await getIslandRecommendations(prompt);
      
      if (recommendations.length === 0) {
        setSearchError("We could not find an island. Repeat query.");
        setAiRecommendations([]);
      } else {
        setAiRecommendations(recommendations);
      }
    } catch (error) {
      setSearchError("An error occurred. Please try again.");
      setAiRecommendations([]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleClearAI = () => {
    setAiRecommendations([]);
    setSearchError(null);
  };

  const handleGlobalReset = () => {
    setFilters(INITIAL_FILTERS);
    handleClearAI();
    // Increment signal to notify children (AIConsultant) to clear local state
    setResetSignal(prev => prev + 1);
  };

  // --- Filtering Logic Core ---
  const isIslandMatch = (island: Island, currentFilters: FilterState, excludeCategory?: keyof FilterState) => {
    // 1. AI Match (if active) - AI results are always strict constraints
    if (aiRecommendations.length > 0) {
      const isRecommended = aiRecommendations.some(rec => rec.islandId === island.id);
      if (!isRecommended) return false;
    }

    // 2. Location
    if (excludeCategory !== 'atolls' && currentFilters.atolls.length > 0) {
      if (!currentFilters.atolls.includes(island.atoll)) return false;
    }

    // 3. Logistics
    if (excludeCategory !== 'transferTypes' && currentFilters.transferTypes.length > 0) {
      if (!currentFilters.transferTypes.some(t => island.transferTypes.includes(t))) return false;
    }

    if (excludeCategory !== 'ferryAccess' && currentFilters.ferryAccess.length > 0) {
       if (!currentFilters.ferryAccess.includes(island.ferryAccess)) return false;
    }

    // 4. Island Profile
    if (excludeCategory !== 'islandSize' && currentFilters.islandSize.length > 0) {
      if (!currentFilters.islandSize.includes(island.size)) return false;
    }
    
    if (excludeCategory !== 'atmosphere' && currentFilters.atmosphere.length > 0) {
      if (!currentFilters.atmosphere.some(a => island.atmosphere.includes(a))) return false;
    }
    
    if (excludeCategory !== 'jungle' && currentFilters.jungle.length > 0) {
      if (!currentFilters.jungle.includes(island.jungle)) return false;
    }

    // 5. Beach & Water
    if (excludeCategory !== 'bikiniBeach' && currentFilters.bikiniBeach.length > 0) {
      if (!currentFilters.bikiniBeach.includes(island.bikiniBeach)) return false;
    }

    if (excludeCategory !== 'watersports' && currentFilters.watersports.length > 0) {
      if (!currentFilters.watersports.includes(island.watersports)) return false;
    }
    
    if (excludeCategory !== 'marineActivities' && currentFilters.marineActivities.length > 0) {
      if (!currentFilters.marineActivities.some(act => island.marineActivities.includes(act))) return false;
    }

    // 6. Accommodations & Lifestyle
    if (excludeCategory !== 'accommodations' && currentFilters.accommodations.length > 0) {
      // AND logic: must have ALL selected amenities
      if (!currentFilters.accommodations.every(acc => island.accommodations.includes(acc))) return false;
    }

    if (excludeCategory !== 'nightlife' && currentFilters.nightlife.length > 0) {
      if (!currentFilters.nightlife.includes(island.nightlife)) return false;
    }

    if (excludeCategory !== 'hasSandbankAttached' && currentFilters.hasSandbankAttached) {
      if (!island.hasSandbankAttached) return false;
    }
    
    if (excludeCategory !== 'hasFloatingBar' && currentFilters.hasFloatingBar) {
      if (!island.hasFloatingBar) return false;
    }

    return true;
  };

  const filteredIslands = useMemo(() => {
    // STRICT: If search error exists, return empty list to ensure message visibility
    if (searchError) return [];

    // First get the matched islands
    const result = ISLANDS.filter(island => isIslandMatch(island, filters));

    // SORTING LOGIC:
    // If AI Recommendations are active, sort by order of relevance (index in aiRecommendations)
    // Otherwise, maintain the default order from constants.ts (which is grouped by Atoll)
    if (aiRecommendations.length > 0) {
       return result.sort((a, b) => {
         const indexA = aiRecommendations.findIndex(r => r.islandId === a.id);
         const indexB = aiRecommendations.findIndex(r => r.islandId === b.id);
         return indexA - indexB;
       });
    }

    return result;
  }, [filters, aiRecommendations, searchError]);

  // --- Dynamic Availability Logic ---
  const availableOptions = useMemo(() => {
    // Explicitly type the accumulator so TypeScript knows the keys are valid
    const result: Record<keyof FilterState, Set<string>> = {
      atolls: new Set(),
      transferTypes: new Set(),
      ferryAccess: new Set(),
      islandSize: new Set(),
      atmosphere: new Set(),
      accommodations: new Set(),
      bikiniBeach: new Set(),
      watersports: new Set(),
      marineActivities: new Set(),
      jungle: new Set(),
      nightlife: new Set(),
      hasSandbankAttached: new Set(), // Not used in loop but needed for type safety
      hasFloatingBar: new Set()       // Not used in loop but needed for type safety
    };

    // Helper to populate sets
    const checkAvailability = (category: keyof FilterState, set: Set<string>, extractor: (i: Island) => string | string[]) => {
       const potentialIslands = ISLANDS.filter(i => isIslandMatch(i, filters, category));
       potentialIslands.forEach(i => {
         const val = extractor(i);
         if (Array.isArray(val)) val.forEach(v => set.add(v));
         else set.add(val);
       });
    };

    checkAvailability('atolls', result.atolls, i => i.atoll);
    checkAvailability('transferTypes', result.transferTypes, i => i.transferTypes);
    checkAvailability('ferryAccess', result.ferryAccess, i => i.ferryAccess);
    checkAvailability('islandSize', result.islandSize, i => i.size);
    checkAvailability('atmosphere', result.atmosphere, i => i.atmosphere);
    checkAvailability('accommodations', result.accommodations, i => i.accommodations);
    checkAvailability('bikiniBeach', result.bikiniBeach, i => i.bikiniBeach);
    checkAvailability('watersports', result.watersports, i => i.watersports);
    checkAvailability('marineActivities', result.marineActivities, i => i.marineActivities);
    checkAvailability('jungle', result.jungle, i => i.jungle);
    checkAvailability('nightlife', result.nightlife, i => i.nightlife);

    return result;
  }, [filters, aiRecommendations]);


  const activeFilterCount = Object.values(filters).flat().filter(Boolean).length;
  // Calculate true active state including AI
  const hasActiveFiltersOrAI = activeFilterCount > 0 || aiRecommendations.length > 0;
  const totalActiveFilters = activeFilterCount - (filters.hasSandbankAttached ? 0 : 0) - (filters.hasFloatingBar ? 0 : 0) 
                             + (filters.hasSandbankAttached ? 1 : 0) + (filters.hasFloatingBar ? 1 : 0);

  // Helper to render checkboxes conditionally (Hide if not available)
  const renderFilterGroup = (
      options: string[], 
      category: keyof FilterState, 
      labelFn: (val: string) => string = (v) => v
  ) => {
      return options.map(opt => {
          // If option is not available AND not currently checked, hide it.
          // We keep it if it IS checked so the user can uncheck it.
          const isAvailable = availableOptions[category].has(opt);
          const categoryValues = filters[category] as string[]; // Type assertion for safety
          const isChecked = categoryValues.includes(opt);
          
          if (!isAvailable && !isChecked) return null;

          return (
            <FilterCheckbox 
                key={opt} 
                label={labelFn(opt)} 
                value={opt} 
                checked={isChecked} 
                onChange={(v, c) => handleArrayFilterChange(category, v, c)}
            />
          );
      });
  };

  return (
    <div className="min-h-screen font-sans text-gray-800 pb-20 bg-stone-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="relative">
          <AIConsultant 
            onSearch={handleAISearch} 
            isLoading={aiLoading}
            onClear={handleClearAI}
            hasResults={aiRecommendations.length > 0}
            resetSignal={resetSignal}
          />
          
          {/* Error Message Display */}
          {searchError && (
            <div className="absolute bottom-0 left-0 right-0 transform translate-y-4 text-center z-10 animate-fade-in">
              <div className="inline-block bg-red-50 text-red-600 px-6 py-3 rounded-full shadow-md border border-red-100 text-sm font-medium">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {searchError}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8 mt-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 sticky top-24 max-h-[85vh] overflow-y-auto scrollbar-thin flex flex-col">
              
              {/* Filter Header - Clickable Toggle on Mobile */}
              <div 
                className="p-4 border-b border-stone-100 flex items-center justify-between bg-white sticky top-0 z-10 flex-shrink-0 cursor-pointer lg:cursor-auto select-none lg:select-text"
                onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
              >
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <span>Filters</span>
                  {totalActiveFilters > 0 && (
                    <span className="bg-teal-100 text-teal-700 text-[10px] px-2 py-0.5 rounded-full">
                      {totalActiveFilters}
                    </span>
                  )}
                  {/* Mobile Twist/Twirl Icon */}
                  <svg 
                    className={`w-4 h-4 text-gray-400 transition-transform duration-300 lg:hidden ${isMobileFiltersOpen ? 'rotate-180' : ''}`} 
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </h2>
                
                {hasActiveFiltersOrAI && (
                  <button 
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent closing the toggle on mobile
                        handleGlobalReset();
                    }}
                    className="text-xs text-teal-600 hover:text-teal-700 font-medium px-2 py-1 bg-teal-50 rounded-md transition-colors"
                  >
                    Reset All
                  </button>
                )}
              </div>
              
              {/* Filter Body - Hidden on Mobile unless open, Always visible on Desktop */}
              <div className={`${isMobileFiltersOpen ? 'block' : 'hidden'} lg:block`}>
                {/* PROMO CARD */}
                <div className="p-5 bg-amber-50 border-b border-amber-100 flex-shrink-0">
                    <div className="flex items-start gap-3">
                    <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-amber-900 leading-tight mb-1">Plan the Perfect Trip</h3>
                        <p className="text-xs text-amber-800/80 mb-3 leading-snug">
                        Get the complete Maldives Budget Travel Guide.
                        </p>
                        <a 
                        href="https://maldivesonabudget.net/products/maldives-budget-travel-guide" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block w-full text-center py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold uppercase tracking-wide rounded transition-colors"
                        >
                        Download Guide
                        </a>
                    </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {/* 0. Atoll Filter */}
                    <FilterSection title="Atoll / Location">
                        <div className="space-y-2">
                            {renderFilterGroup(Object.values(Atoll), 'atolls')}
                        </div>
                    </FilterSection>

                    {/* 1. Logistics */}
                    <FilterSection title="Transfer & Access">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 mb-2">Speedboat from Malé</p>
                        <div className="space-y-2">
                            {renderFilterGroup(
                                [TransferType.SpeedboatUnder1H, TransferType.Speedboat1To2H, TransferType.Speedboat2To3H], 
                                'transferTypes'
                            )}
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-500 mb-2">Domestic Flight</p>
                        <div className="space-y-2">
                            {renderFilterGroup(
                                [TransferType.DomesticFlight, TransferType.DomesticFlightSpeedboat], 
                                'transferTypes'
                            )}
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-500 mb-2">Public Ferry Access from Malé</p>
                        <div className="space-y-2">
                            {renderFilterGroup(Object.values(FerryAccess), 'ferryAccess')}
                        </div>
                    </div>
                    </FilterSection>

                    {/* 2. Island Character */}
                    <FilterSection title="Island Character">
                    <div className="space-y-4">
                        <div>
                        <p className="text-xs font-semibold text-gray-500 mb-2">Atmosphere & Vibe</p>
                        <div className="space-y-1">
                            {renderFilterGroup(Object.values(Atmosphere), 'atmosphere')}
                        </div>
                        </div>
                        <div>
                        <p className="text-xs font-semibold text-gray-500 mb-2">Island Size</p>
                        <div className="space-y-1">
                            {renderFilterGroup(Object.values(IslandSize), 'islandSize')}
                        </div>
                        </div>
                        <div>
                        <p className="text-xs font-semibold text-gray-500 mb-2">Jungle Vegetation</p>
                        <div className="space-y-1">
                            {renderFilterGroup(Object.values(JungleVegetation), 'jungle')}
                        </div>
                        </div>
                    </div>
                    </FilterSection>

                    {/* 3. Beach & Activities */}
                    <FilterSection title="Beach & Activities">
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 mb-2">Excursions & Marine Activities</p>
                            <div className="space-y-1">
                            {renderFilterGroup(Object.values(MarineActivity), 'marineActivities')}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 mb-2">Bikini Beach Size</p>
                            <div className="space-y-1">
                            {renderFilterGroup(Object.values(BikiniBeach), 'bikiniBeach')}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 mb-2">Watersports Available</p>
                            <div className="space-y-1">
                            {renderFilterGroup(Object.values(Watersports), 'watersports')}
                            </div>
                        </div>
                    </div>
                    </FilterSection>

                    {/* 4. Accommodation & Lifestyle */}
                    <FilterSection title="Accommodation & Lifestyle">
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 mb-2">Accommodations</p>
                            <div className="space-y-1">
                                {renderFilterGroup(Object.values(Accommodation), 'accommodations')}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 mb-2">Nightlife & Entertainment</p>
                            <div className="space-y-1">
                                {renderFilterGroup(Object.values(Nightlife), 'nightlife')}
                            </div>
                        </div>
                    </div>
                    </FilterSection>

                    {/* 5. Special Features */}
                    <FilterSection title="Special Features">
                    <div className="space-y-2">
                        <FilterCheckbox label="Has Attached Sandbank" value="sandbank" checked={filters.hasSandbankAttached} onChange={(_, c) => handleBooleanFilterChange('hasSandbankAttached', c)} />
                        <FilterCheckbox label="Floating Bar Nearby" value="floating" checked={filters.hasFloatingBar} onChange={(_, c) => handleBooleanFilterChange('hasFloatingBar', c)} />
                    </div>
                    </FilterSection>

                </div>
              </div>
            </div>
          </aside>

          {/* Results Grid */}
          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
               <div>
                 <h2 className="text-lg font-bold text-gray-800">
                   {/* Custom Header Text Logic */}
                   {filteredIslands.length === ISLANDS.length && totalActiveFilters === 0 
                     ? `Choose from ${ISLANDS.length} local islands` 
                     : `${filteredIslands.length} ${filteredIslands.length === 1 ? 'Island' : 'Islands'} Found`}
                 </h2>
                 <p className="text-xs text-gray-500">
                   {totalActiveFilters === 0 ? 'Start filtering to find your match' : 'Matches your criteria'}
                 </p>
               </div>
            </div>

            {filteredIslands.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredIslands.map(island => {
                  const match = aiRecommendations.find(r => r.islandId === island.id);
                  return (
                    <IslandCard 
                      key={island.id} 
                      island={island} 
                      aiReason={match?.reason}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 text-center border border-dashed border-gray-300 flex flex-col items-center justify-center">
                <div className="inline-block p-4 bg-stone-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No islands match exact criteria</h3>
                <p className="text-gray-500 text-sm max-w-xs mx-auto mb-6">
                  You might have filtered too strictly. Try unchecking some options or asking the AI for suggestions.
                </p>
                <button 
                  onClick={handleGlobalReset}
                  className="px-6 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors shadow-sm text-sm"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
