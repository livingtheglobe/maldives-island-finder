import { 
  Island, 
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

// Recommended Image Dimension: 800x208 (Fixed Height Strip)
const MAAFUSHI_COVER_IMAGE = 'https://cdn.shopify.com/s/files/1/0942/5666/0784/files/Maafushi.webp?v=1763807763';

export const ISLANDS: Island[] = [
  // --- SOUTH MALÉ ATOLL ---
  {
    id: 'maafushi',
    name: 'Maafushi',
    atoll: Atoll.SouthMale,
    description: 'One of the most popular local islands just 30 minutes by speedboat from Malé or reachable by direct public ferry. Known for its lively atmosphere, tons of excursions, and wide range of accommodation, Maafushi has minimal greenery but offers endless activity. Watersports, boat tours, and beachfront cafes give it a social, energetic vibe. Most shark and manta tours still travel around 45 minutes to Vaavu Atoll, but you’ll find no shortage of options here. Ideal for people who want convenience, fun, and lots to do.',
    imageUrl: MAAFUSHI_COVER_IMAGE,
    videoUrl: 'https://youtu.be/yNbFQsAqBBI',
    travelGuideUrl: 'https://maldivesonabudget.net/products/maafushi-maldives-travel-guide',
    dimensions: '1.275 km x 0.26 km',
    guestHouseCount: 70,
    transferTypes: [TransferType.SpeedboatUnder1H],
    ferryAccess: FerryAccess.Direct,
    size: IslandSize.Medium,
    atmosphere: [Atmosphere.Lively],
    accommodations: [
      Accommodation.AffordableLuxury, 
      Accommodation.Pool, 
      Accommodation.Spa
    ],
    bikiniBeach: BikiniBeach.Medium,
    watersports: Watersports.Extensive,
    marineActivities: [
      MarineActivity.NurseSharks,
      MarineActivity.MantaRays,
      MarineActivity.WhaleSharks,
      MarineActivity.Turtles,
      MarineActivity.Dolphins,
      MarineActivity.SandbankTours
    ],
    seasonalActivities: [],
    jungle: JungleVegetation.Minimal,
    nightlife: Nightlife.Lively,
    hasSandbankAttached: false,
    isSandbankSeasonal: false,
    hasFloatingBar: true
  }
  // Add more islands below this line inside the array
];
