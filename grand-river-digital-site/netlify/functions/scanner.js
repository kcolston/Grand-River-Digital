// Grand River Digital — Google Places Scanner
// Netlify serverless function — API key stays server-side, never exposed to browser

exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const params = event.queryStringParameters || {};
  const city     = params.city     || 'Sterling Heights, MI';
  const type     = params.type     || 'restaurant';
  const radius   = parseInt(params.radius || '10000'); // meters
  const maxRes   = parseInt(params.limit  || '20');

  const API_KEY = process.env.GOOGLE_PLACES_KEY;
  if (!API_KEY) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'API key not configured' })
    };
  }

  try {
    // Step 1: Geocode the city to get lat/lng
    const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city)}&key=${API_KEY}`;
    const geoRes  = await fetch(geoUrl);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Could not find location: ' + city })
      };
    }

    const loc = geoData.results[0].geometry.location;
    const lat = loc.lat;
    const lng = loc.lng;

    // Step 2: Search Google Places Nearby
    // Map business type selector to Google place types
    const typeMap = {
      'All businesses':          'establishment',
      'Restaurants & Food':      'restaurant',
      'Auto Repair Shops':       'car_repair',
      'Plumbers & HVAC':         'plumber',
      'Hair & Beauty Salons':    'beauty_salon',
      'Retail Stores':           'store',
      'Contractors':             'general_contractor',
      'Medical & Dental':        'dentist',
      'Pet Services':            'veterinary_care',
      'Law Firms':               'lawyer',
      'Gym & Fitness':           'gym',
    };
    const placeType = typeMap[type] || 'establishment';

    const searchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${placeType}&key=${API_KEY}`;
    const searchRes  = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (!searchData.results) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Places API error: ' + (searchData.status || 'unknown') })
      };
    }

    // Step 3: For each place, get details to check if they have a website
    // We batch-process up to maxRes places
    const places = searchData.results.slice(0, Math.min(maxRes * 2, 40)); // fetch extra since we filter
    const results = [];

    for (const place of places) {
      if (results.length >= maxRes) break;

      try {
        const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,business_status,types&key=${API_KEY}`;
        const detailRes  = await fetch(detailUrl);
        const detailData = await detailRes.json();
        const d = detailData.result;

        if (!d) continue;
        if (d.business_status === 'CLOSED_PERMANENTLY') continue;

        // Only include businesses WITHOUT a website — that's our target market
        const hasWebsite = !!(d.website && d.website.trim());

        // Get a readable business type
        const typeLabels = {
          restaurant: 'Restaurant', car_repair: 'Auto Services', plumber: 'Plumbing',
          beauty_salon: 'Beauty & Salon', store: 'Retail', general_contractor: 'Contractor',
          dentist: 'Medical / Dental', veterinary_care: 'Pet Services', lawyer: 'Law Firm',
          gym: 'Gym & Fitness', establishment: 'Local Business'
        };
        const bizType = typeLabels[placeType] || 'Local Business';

        results.push({
          name:       d.name || place.name,
          type:       bizType,
          address:    d.formatted_address || place.vicinity || city,
          phone:      d.formatted_phone_number || 'Not listed',
          rating:     d.rating ? d.rating.toFixed(1) : 'N/A',
          reviews:    d.user_ratings_total || 0,
          hasWebsite: hasWebsite,
          website:    d.website || null,
          place_id:   place.place_id,
        });
      } catch (detailErr) {
        // Skip this place if details fail
        continue;
      }
    }

    // Split into no-website and has-website
    const noWebsite   = results.filter(r => !r.hasWebsite);
    const hasWebsites = results.filter(r => r.hasWebsite);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        city,
        type,
        total_scanned: results.length,
        no_website_count: noWebsite.length,
        has_website_count: hasWebsites.length,
        leads: noWebsite,       // primary — businesses without sites
        has_website: hasWebsites // secondary — for reference
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || 'Server error' })
    };
  }
};
