const fetch = require('node-fetch');  
const API_KEY = process.env.VEHICLE_DATA_API_KEY;

const BASE_URL = 'https://uk1.ukvehicledata.co.uk/api/datapackage';

module.exports = {
  async motCheck(reg) {
    const url = `${BASE_URL}/MotHistoryAndTaxStatusData?v=2&api_nullitems=1&auth_apikey=${API_KEY}&key_VRM=${encodeURIComponent(reg)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('MOT API call failed');
    const data = await res.json();
    return data.Response;
  },

  async vdiCheck(reg) {
    const url = `${BASE_URL}/VdiCheckFull?v=2&api_nullitems=1&auth_apikey=${API_KEY}&key_VRM=${encodeURIComponent(reg)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('VDI API call failed');
    const data = await res.json();
    return data.Response;
  },

  async valuationCheck(reg) {
    const url = `${BASE_URL}/ValuationData?v=2&api_nullitems=1&auth_apikey=${API_KEY}&key_VRM=${encodeURIComponent(reg)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Valuation API call failed');
    const data = await res.json();
    // Return the entire "Response" object
    return data.Response;
  },
  // backend/src/services/vehicleDataService.js
// (Excerpt showing new function)

async imageCheck(reg) {
  // Example endpoint for VehicleImageData:
  const url = `${BASE_URL}/VehicleImageData?v=2&api_nullitems=1&auth_apikey=${API_KEY}&key_VRM=${encodeURIComponent(reg)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Vehicle Image API call failed');
  }
  const data = await res.json();
  // Return data.Response to match your style
  return data.Response;
},

};

