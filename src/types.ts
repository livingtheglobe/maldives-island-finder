export enum TransferType {
  SpeedboatUnder1H = 'Speedboat (Up to 1 hr)',
  Speedboat1To2H = 'Speedboat (Up to 2 hrs)',
  Speedboat2To3H = 'Speedboat (Up to 3 hrs)',
  DomesticFlight = 'Direct domestic flight only',
  DomesticFlightSpeedboat = 'Domestic flight + speedboat',
}

export enum FerryAccess {
  Direct = 'Direct Ferry',
  Transfer = 'Requires Transfer',
  None = 'No Ferry Available',
}

export enum Atoll {
  SouthMale = 'South Malé Atoll',
  NorthMale = 'North Malé Atoll',
  Vaavu = 'Vaavu Atoll',
  NorthAri = 'North Ari Atoll',
  SouthAri = 'South Ari Atoll',
  Baa = 'Baa Atoll',
}

export enum IslandSize {
  Small = 'Small (< 500m)',
  Medium = 'Medium (500m – 1.5km)',
  Large = 'Large (> 1.5km)',
}

export enum Atmosphere {
  Quiet = 'Quiet & Peaceful',
  Local = 'Local & Authentic',
  Lively = 'Lively & Social',
}

export enum Accommodation {
  AffordableLuxury = 'Affordable Luxury',
  Pool = 'Hotel with Pool',
  Spa = 'On-island Spa/Wellness',
}

export enum BikiniBeach {
  Small = 'Small',
  Medium = 'Medium',
  Large = 'Large',
}

export enum Watersports {
  Minimal = 'Minimal',
  Moderate = 'Moderate',
  Extensive = 'Extensive',
}

export enum MarineActivity {
  NurseSharks = 'Snorkeling with Nurse Sharks',
  MantaRays = 'Manta Ray Snorkeling',
  WhaleSharks = 'Whale Shark Snorkeling',
  Turtles = 'Turtle Snorkeling',
  Dolphins = 'Dolphin Watching',
  HouseReef = 'House Reef Access',
  SandbankTours = 'Sandbank Tours',
}

export enum JungleVegetation {
  Minimal = 'Minimal Greenery',
  Medium = 'Medium Greenery',
  Large = 'Lush Tropical Forest',
}

export enum Nightlife {
  Minimal = 'Minimal (Quiet)',
  Moderate = 'Moderate (BBQs/Events)',
  Lively = 'Lively (DJ/Bars)',
}

export interface Island {
  id: string;
  name: string;
  atoll: Atoll;
  description: string;
  imageUrl: string;
  videoUrl?: string;
  travelGuideUrl?: string;
  
  // Detailed Data for AI
  dimensions: string;
  guestHouseCount: number;

  // Filterable Attributes
  transferTypes: TransferType[];
  ferryAccess: FerryAccess;
  size: IslandSize;
  atmosphere: Atmosphere[];
  accommodations: Accommodation[];
  bikiniBeach: BikiniBeach;
  watersports: Watersports;
  marineActivities: MarineActivity[];
  jungle: JungleVegetation;
  nightlife: Nightlife;
  
  // Special Features
  hasSandbankAttached: boolean;
  hasFloatingBar: boolean;

  // Seasonal Metadata
  seasonalActivities: MarineActivity[]; // List of activities that are seasonal for this specific island
  isSandbankSeasonal: boolean; // If the attached sandbank is seasonal
}

export interface FilterState {
  atolls: Atoll[];
  transferTypes: TransferType[];
  ferryAccess: FerryAccess[];
  islandSize: IslandSize[];
  atmosphere: Atmosphere[];
  accommodations: Accommodation[];
  bikiniBeach: BikiniBeach[];
  watersports: Watersports[];
  marineActivities: MarineActivity[];
  jungle: JungleVegetation[];
  nightlife: Nightlife[];
  // Booleans
  hasSandbankAttached: boolean;
  hasFloatingBar: boolean;
}

export interface AIRecommendation {
  islandId: string;
  reason: string;
}