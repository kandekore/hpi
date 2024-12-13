const API_KEY = process.env.VEHICLE_DATA_API_KEY;
const BASE_URL = 'https://uk1.ukvehicledata.co.uk/api/datapackage';

module.exports = {
  async motCheck(reg) {
    const url = `${BASE_URL}/MotHistoryAndTaxStatusData?v=2&api_nullitems=1&auth_apikey=${API_KEY}&key_VRM=${encodeURIComponent(reg)}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error('MOT API call failed');
    }
    const data = await res.json();
    return data.Response;
  },

  async vdiCheck(reg) {
    const url = `${BASE_URL}/VdiCheckFull?v=2&api_nullitems=1&auth_apikey=${API_KEY}&key_VRM=${encodeURIComponent(reg)}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error('VDI API call failed');
    }
    const data = await res.json();
    return data.Response;
  }
};
