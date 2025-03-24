// backend/src/services/vehicleDataService.js

// const fetch = require('node-fetch');
import fetch from 'node-fetch';
const API_KEY = process.env.VEHICLE_DATA_API_KEY;
const VDI_KEY = process.env.VEHICLE_DATA_VDI_KEY; // used for some calls

const BASE_URL = 'https://uk1.ukvehicledata.co.uk/api/datapackage';

export default {
  // ==========================
  // 1) Existing or older calls
  // ==========================

  // A) MOT Check
  async motCheck(reg) {
    const url = `${BASE_URL}/MotHistoryAndTaxStatusData?v=2&api_nullitems=1&auth_apikey=${API_KEY}&key_VRM=${encodeURIComponent(reg)}`;
   // console.log(`motCheck => Fetching URL: ${url}`);
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`motCheck => Fetch failed with status ${res.status}`);
      throw new Error('MOT API call failed');
    }
    const data = await res.json();
    return data.Response;
  },

  // B) VDI Check
  async vdiCheck(reg) {
    const url = `${BASE_URL}/VdiCheckFull?v=2&api_nullitems=1&auth_apikey=${VDI_KEY}&key_VRM=${encodeURIComponent(reg)}`;
   // console.log(`vdiCheck => Fetching URL: ${url}`);
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`vdiCheck => Fetch failed with status ${res.status}`);
      throw new Error('VDI API call failed');
    }
    const data = await res.json();
    return data.Response;
  },

  // C) Valuation Check
  async valuationCheck(reg) {
    const url = `${BASE_URL}/ValuationData?v=2&api_nullitems=1&auth_apikey=${API_KEY}&key_VRM=${encodeURIComponent(reg)}`;
   // console.log(`valuationCheck => Fetching URL: ${url}`);
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`valuationCheck => Fetch failed with status ${res.status}`);
      throw new Error('Valuation API call failed');
    }
    const data = await res.json();
    return data.Response;
  },

  // D) Image Check
  async imageCheck(reg) {
    const url = `${BASE_URL}/VehicleImageData?v=2&api_nullitems=1&auth_apikey=${API_KEY}&key_VRM=${encodeURIComponent(reg)}`;
   // console.log(`imageCheck => Fetching URL: ${url}`);
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`imageCheck => Fetch failed with status ${res.status}`);
      throw new Error('Vehicle Image API call failed');
    }
    const data = await res.json();
    return data.Response;
  },

  // ==========================
  // 2) New calls used by hpiCheck
  // ==========================

  // E) fetchValuationData
  async fetchValuationData(reg) {
    const url = `${BASE_URL}/ValuationData?v=2&api_nullitems=1&auth_apikey=${API_KEY}&key_VRM=${encodeURIComponent(reg)}`;
   // console.log(`fetchValuationData => Fetching URL: ${url}`);
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`fetchValuationData => Fetch failed with status ${res.status}`);
      throw new Error('ValuationData API call failed');
    }
    const data = await res.json();
    return data.Response;
  },

  // F) fetchMotHistoryAndTaxStatusData
  async fetchMotHistoryAndTaxStatusData(reg) {
    const url = `${BASE_URL}/MotHistoryAndTaxStatusData?v=2&api_nullitems=1&auth_apikey=${API_KEY}&key_VRM=${encodeURIComponent(reg)}`;
   // console.log(`fetchMotHistoryAndTaxStatusData => Fetching URL: ${url}`);
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`fetchMotHistoryAndTaxStatusData => Fetch failed with status ${res.status}`);
      throw new Error('MotHistoryAndTaxStatusData API call failed');
    }
    const data = await res.json();
    return data.Response;
  },

  // G) fetchVedData
  async fetchVedData(reg) {
    const url = `${BASE_URL}/VedData?v=2&api_nullitems=1&auth_apikey=${API_KEY}&key_VRM=${encodeURIComponent(reg)}`;
   // console.log(`fetchVedData => Fetching URL: ${url}`);
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`fetchVedData => Fetch failed with status ${res.status}`);
      throw new Error('VedData API call failed');
    }
    const data = await res.json();
    return data.Response;
  },

  // H) fetchVdiCheckFull
  async fetchVdiCheckFull(reg) {
    const url = `${BASE_URL}/VdiCheckFull?v=2&api_nullitems=1&auth_apikey=${VDI_KEY}&key_VRM=${encodeURIComponent(reg)}`;
   // console.log(`fetchVdiCheckFull => Fetching URL: ${url}`);
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`fetchVdiCheckFull => Fetch failed with status ${res.status}`);
      throw new Error('VDI Full API call failed');
    }
    const data = await res.json();
    return data.Response;
  },

  // I) fetchVehicleImageData
  async fetchVehicleImageData(reg) {
    const url = `${BASE_URL}/VehicleImageData?v=2&api_nullitems=1&auth_apikey=${API_KEY}&key_VRM=${encodeURIComponent(reg)}`;
   // console.log(`fetchVehicleImageData => Fetching URL: ${url}`);
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`fetchVehicleImageData => Fetch failed with status ${res.status}`);
      throw new Error('VehicleImageData API call failed');
    }
    const data = await res.json();
    return data.Response;
  },

  // J) fetchVehicleAndMotHistory
  async fetchVehicleAndMotHistory(reg) {
    const url = `${BASE_URL}/VehicleAndMotHistory?v=2&api_nullitems=1&auth_apikey=${API_KEY}&key_VRM=${encodeURIComponent(reg)}`;
   // console.log(`fetchVehicleAndMotHistory => Fetching URL: ${url}`);
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`fetchVehicleAndMotHistory => Fetch failed with status ${res.status}`);
      throw new Error('VehicleAndMotHistory API call failed');
    }
    const data = await res.json();
    return data.Response;
  },

  // ==========================
  // 3) Additional calls your code might use
  // ==========================

  // K) fetchVehicleData (used in batch 2 of hpiCheck)
  async fetchVehicleData(reg) {
    const url = `${BASE_URL}/VehicleData?v=2&api_nullitems=1&auth_apikey=${API_KEY}&key_VRM=${encodeURIComponent(reg)}`;
   // console.log(`fetchVehicleData => Fetching URL: ${url}`);
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`fetchVehicleData => Fetch failed with status ${res.status}`);
      throw new Error('VehicleData API call failed');
    }
    const data = await res.json();
    return data.Response;
  },

  // L) fetchSpecAndOptions (if used in batch 4)
  async fetchSpecAndOptions(reg) {
    const url = `${BASE_URL}/SpecAndOptions?v=2&api_nullitems=1&auth_apikey=${API_KEY}&key_VRM=${encodeURIComponent(reg)}`;
    console.log(`fetchSpecAndOptions => Fetching URL: ${url}`);
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`fetchSpecAndOptions => Fetch failed with status ${res.status}`);
      throw new Error('SpecAndOptions API call failed');
    }
    const data = await res.json();
    return data.Response;
  },
};
