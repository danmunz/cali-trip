export const lodgingData = {
  yountville: {
    id: 'estate-yountville',
    name: 'The Estate Yountville',
    dates: 'April 3–6, 2026',
    nights: '3 nights',
    address: '6481 Washington St, Yountville, CA 94599',
    phone: '(707) 944-2452',
    email: 'reservations@theestateyountville.com',
    confirmation: '#OB25123113564304',
    description:
      'Nestled in the heart of Napa Valley, The Estate Yountville offers sophisticated wine country elegance. This boutique property features vineyard views, a heated pool, and walking distance to world-class restaurants including The French Laundry and Bouchon.',
    roomDescription:
      'Your vineyard-view Vintage Estate King Guestroom features premium linens, a gas fireplace, and a private patio overlooking the estate gardens. The marble bathroom includes a deep soaking tub and walk-in rain shower.',
    amenities: [
      'Heated Pool',
      'Spa Services',
      'Wine Tasting',
      'Farm-to-Table Breakfast',
      'Vineyard Views',
      'Walking to Restaurants',
    ],
    propertyImage:
      '/cali-trip/images/lodging/the-estate-yountville/hero.jpg',
    roomImages: [
      '/cali-trip/images/lodging/the-estate-yountville/01.jpg',
      '/cali-trip/images/lodging/the-estate-yountville/02.jpg',
      '/cali-trip/images/lodging/the-estate-yountville/03.jpg'
    ],
    color: '#b8956d',
    geo: { lat: 38.399828, lng: -122.360126 },
    official_url: 'https://www.theestateyountville.com/',
    google_maps_url:
      'https://www.google.com/maps/search/?api=1&query=38.3998275,-122.3601258',
    review_url:
      'https://www.tripadvisor.com/Hotel_Review-g33300-d125028-Reviews-The_Estate_Yountville-Yountville_Napa_Valley_California.html',
  },
  yosemite: {
    id: 'rush-creek-lodge',
    name: 'Rush Creek Lodge',
    dates: 'April 6–8, 2026',
    nights: '2 nights',
    address: '34001 CA-120, Groveland, CA 95321',
    phone: '(209) 379-2373',
    email: 'info@rushcreeklodge.com',
    confirmation: '#30251B0386853',
    description:
      "Your gateway to Yosemite National Park. This contemporary mountain lodge combines rustic charm with modern luxury, featuring stunning Sierra Nevada views, a full-service spa, and easy access to the park's iconic landscapes.",
    roomDescription:
      'Your 400-square-foot Lodge King Room offers vaulted ceilings with exposed timber beams, a private balcony with forest views, and a cozy sitting area. The bathroom features a stone-tiled shower and complimentary artisan toiletries.',
    amenities: [
      'Full-Service Spa',
      'Heated Saltwater Pool',
      'Hot Tubs',
      'Tavern Restaurant',
      'General Store',
      'Fire Pits',
    ],
    propertyImage:
      '/cali-trip/images/lodging/rush-creek-lodge/hero.jpg',
    roomImages: [
      '/cali-trip/images/lodging/rush-creek-lodge/01.jpg',
      '/cali-trip/images/lodging/rush-creek-lodge/02.jpg',
      '/cali-trip/images/lodging/rush-creek-lodge/03.jpg'
    ],
    color: '#5a8a6f',
    geo: { lat: 37.812447, lng: -119.880978 },
    official_url: 'https://www.rushcreeklodge.com/',
    google_maps_url:
      'https://www.google.com/maps/search/?api=1&query=37.8124471,-119.8809784',
    review_url:
      'https://www.tripadvisor.com/Hotel_Review-g32460-d8547692-Reviews-Rush_Creek_Lodge_At_Yosemite-Groveland_California.html',
  },
  carmel: {
    id: 'hyatt-carmel',
    name: 'Hyatt Carmel Highlands',
    dates: 'April 8–11, 2026',
    nights: '3 nights',
    address: '120 Highlands Dr, Carmel Highlands, CA 93923',
    phone: '(831) 620-1234',
    email: 'carmel.highlands@hyatt.com',
    confirmation: '#62046930 (Dan, Jen, Ava) • #40702652 (Susan & Ted)',
    description:
      "Perched on the dramatic cliffs of Big Sur, this iconic coastal retreat offers breathtaking Pacific Ocean views. Experience California's legendary coastline with luxurious accommodations, cliff-top hot tubs, and proximity to Point Lobos and the Carmel art scene.",
    roomDescription:
      "Your 380-square-foot Ocean View King Room offers breathtaking balcony views of Carmel's Big Sur coastline and Point Lobos State Park.",
    amenities: [
      'Ocean View Rooms',
      'Cliff-Top Hot Tubs',
      'California Market Restaurant',
      'Full Spa',
      'Coastal Trails',
      'Fire Pits',
    ],
    propertyImage:
      '/cali-trip/images/lodging/hyatt-carmel-highlands/hero.jpg',
    roomImages: [
      '/cali-trip/images/lodging/hyatt-carmel-highlands/01.jpg',
      '/cali-trip/images/lodging/hyatt-carmel-highlands/02.jpg',
      '/cali-trip/images/lodging/hyatt-carmel-highlands/03.jpg'
    ],
    color: '#4a7c8e',
    geo: { lat: 36.501859, lng: -121.9376 },
    official_url: 'https://highlandsinn.hyatt.com/',
    google_maps_url:
      'https://www.google.com/maps/search/?api=1&query=36.5018591,-121.9375999',
    review_url:
      'https://www.tripadvisor.com/Hotel_Review-g32172-d32696831-Reviews-Hyatt_Carmel_Highlands-Carmel_Monterey_County_California.html',
  },
} as const;

export type LodgingKey = keyof typeof lodgingData;
