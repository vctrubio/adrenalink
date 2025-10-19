# School Geolocation Enhancement Proposal

## Overview
Add minimal geolocation functionality to schools for map-based discovery and filtering, similar to Airbnb's search experience.

## Schema Changes

### School Table Additions
```typescript
// Geographic coordinates
latitude: decimal("latitude", { precision: 10, scale: 8 }) // Optional
longitude: decimal("longitude", { precision: 10, scale: 8 }) // Optional

// Google integration (optional)
googlePlaceId: varchar("google_place_id", { length: 255 }).unique() // Optional

// Location info
city: varchar("city", { length: 100 }) // Optional, can be derived from coordinates

// Equipment offerings - JSON array of activities the school offers
equipmentCategories: text("equipment_categories") // JSON: ["kite", "surf", "windsurf"]
```

### Existing Fields (Keep)
- `country` (required) - Manual fallback for location
- `name`, `username`, `phone` - Core school info

## Google APIs Required
1. **Google Places API** - Business search & autocomplete
2. **Google Maps JavaScript API** - Map display
3. **Reverse Geocoding** - Get city from coordinates

### Environment Variables
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_api_key
```

## Components to Build

### 1. Enhanced WelcomeSchoolForm
- Google Places Autocomplete input
- Auto-populate: name, phone, coordinates, googlePlaceId
- Equipment categories checkboxes (kite, wing, windsurf, surf, snowboard)
- Fallback to manual entry if Google Places fails

### 2. SchoolMapDashboard (`src/components/maps/`)
```
├── SchoolMapDashboard.tsx      # Main component with map + filters
├── SchoolMap.tsx               # Google Maps integration
├── SchoolFilters.tsx           # Equipment & location filters
└── SchoolListView.tsx          # Toggle between map/list view
```

### 3. SchoolModel Enhancements
Add lambda functions for derived data:
```typescript
lambda?: {
  timezone?: string;           // getTimezone(lat, lng)
  city?: string;              // getCityFromCoordinates(lat, lng) 
  studentCount?: number;       // Existing
  equipmentList?: string[];    // Parse equipmentCategories JSON
}
```

## Features

### Search & Filter Capabilities
- **Name search** - Search school names
- **Location filter** - By country, city, or proximity (if coordinates)
- **Equipment filter** - Filter by activities offered (kite, surf, etc.)
- **Map view** - Interactive markers with school info
- **List view** - Card-based listing with same filters

### Data Sources for Location
1. **Primary**: Google Places (coordinates + googlePlaceId)
2. **Secondary**: Manual country field (required)
3. **Derived**: City from reverse geocoding coordinates
4. **Fallback**: Manual city entry

## Implementation Strategy

### Phase 1: Schema & Basic Integration
1. Update school schema with new fields
2. Add Google Places API integration to WelcomeSchoolForm
3. Add equipment categories selection

### Phase 2: Map Dashboard
1. Create SchoolMapDashboard component
2. Implement Google Maps with school markers
3. Add basic filtering (equipment, location)

### Phase 3: Advanced Features
1. Add timezone calculation
2. Implement proximity search
3. Enhanced filtering and search

## Benefits
- **Discoverability**: Schools can be found by location and activity type
- **User Experience**: Visual map interface for browsing schools
- **Data Quality**: Google Places integration ensures accurate business info
- **Flexibility**: Works with or without Google Places data
- **Scalability**: Foundation for future location-based features

## Data Flow
1. **School Registration**: Use Google Places → get coordinates → derive city
2. **Search**: Filter by equipment + location → show on map/list
3. **Discovery**: Browse map → click markers → view school details