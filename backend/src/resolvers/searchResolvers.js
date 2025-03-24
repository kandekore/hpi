// backend/src/resolvers/searchResolvers.js
import User from '../models/User.js';
import SearchRecord from '../models/SearchRecord.js';
import vehicleDataService from '../services/vehicleDataService.js';

const FREE_MOT_CHECKS = 3;

async function fetchValuationBundle(reg) {
  // 1) First batch: fetchValuationData
  const valuationData = await vehicleDataService.fetchValuationData(reg);

  // 2) Sleep 600ms
  await new Promise((resolve) => setTimeout(resolve, 600));

  // 3) Second batch in parallel
  const [vehicleAndMotHistory, vehicleImageData] = await Promise.all([
    vehicleDataService.fetchVehicleAndMotHistory(reg),
    vehicleDataService.fetchVehicleImageData(reg),
  ]);

  // 4) Combine
  return {
    valuation: valuationData,
    vehicleAndMotHistory,
    images: vehicleImageData,
  };
}

export default {
  Query: {
    // 1) MOT Check
    async motCheck(_, { reg }, { user }) {
      if (!user) throw new Error('Not authenticated');
      const currentUser = await User.findById(user.userId);
      if (!currentUser) throw new Error('User not found');

      // usage logic
      if (currentUser.freeMotChecksUsed < 3) {
        currentUser.freeMotChecksUsed++;
      } else if (currentUser.motCredits > 0) {
        currentUser.motCredits--;
      } else {
        throw new Error('No free checks or paid credits left.');
      }

      const fullData = await vehicleDataService.motCheck(reg);

      // log search
      const record = await SearchRecord.create({
        userId: currentUser._id,
        vehicleReg: reg,
        searchType: 'MOT',
        responseData: fullData,
      });
      currentUser.searchHistory.push(record._id);
      await currentUser.save();
// console.log('Server: motCheck =>', fullData);
      return fullData;
    },

    // 2) VDI Check
    async vdiCheck(_, { reg }, { user }) {
      if (!user) throw new Error('Not authenticated');

      const currentUser = await User.findById(user.userId);
      if (!currentUser) throw new Error('User not found');
      if (currentUser.valuationCredits < 1) {
        throw new Error('No VDI credits available');
      }
      // deduct
      currentUser.valuationCredits -= 1;

      // get normal VDI data
      const vdiResponse = await vehicleDataService.vdiCheck(reg);

      // also get image data
      const imageResponse = await vehicleDataService.imageCheck(reg);

      // merge DataItems
      const mergedResponse = {
        ...vdiResponse,
        DataItems: {
          ...vdiResponse.DataItems,
          ...imageResponse.DataItems,
        },
      };

      // log search
      const record = await SearchRecord.create({
        userId: currentUser._id,
        vehicleReg: reg,
        searchType: 'FULL_HISTORY',
        responseData: mergedResponse,
      });
      currentUser.searchHistory.push(record._id);
      await currentUser.save();

      return mergedResponse;
    },

    // 3) Valuation
    // New single "valuation" that calls fetchValuationBundle
    async valuation(_, { reg }, { user }) {
      if (!user) throw new Error('Not authenticated');
      const currentUser = await User.findById(user.userId);
      if (!currentUser) throw new Error('User not found');

      if (currentUser.valuationCredits < 1) {
        throw new Error('No Valuation credits available');
      }
      currentUser.valuationCredits--;

      // 1) Call fetchValuationBundle
      const fullResponse = await fetchValuationBundle(reg);
// console.log('Server: fetchValuationBundle =>', fullResponse);
      // 2) Save
      const record = await SearchRecord.create({
        userId: currentUser._id,
        vehicleReg: reg,
        searchType: 'VALUATION',
        responseData: fullResponse,
      });
      currentUser.searchHistory.push(record._id);
      await currentUser.save();

      // 3) Return
      return fullResponse;
    },

    // 4) Get search history
    async getSearchHistory(_, __, { user }) {
      if (!user) throw new Error('Not authenticated');
      const currentUser = await User.findById(user.userId).populate('searchHistory');
      return currentUser.searchHistory;
    },

    // 5) Get single search by ID
    async getSearchById(_, { id }, { user }) {
      if (!user) throw new Error('Not authenticated');
      const record = await SearchRecord.findById(id);
      if (!record) throw new Error('No search record found for that ID');
      if (record.userId.toString() !== user.userId) {
        throw new Error('Not authorized to view this record');
      }
      return record;
    },
    async getSampleSearchById(_, { id }, ) {
      const record = await SearchRecord.findById(id);
      if (!record) throw new Error('No search record found for that ID');
      return record;
    },
    // 6) Full HPI Check with 4 batches
    async hpiCheck(_, { reg }, { user }) {
      if (!user) throw new Error('Not authenticated');
      const currentUser = await User.findById(user.userId);
      if (!currentUser) throw new Error('User not found');
      if (currentUser.hpiCredits < 1) throw new Error('No Full History credits available');

      // deduct 1 credit
      currentUser.hpiCredits -= 1;

      // BATCH 1
      const [vdiFull, images] = await Promise.all([
        vehicleDataService.fetchVdiCheckFull(reg),
        vehicleDataService.fetchVehicleImageData(reg),
      ]);
      await new Promise((r) => setTimeout(r, 600));

      // BATCH 2
      const [vehicleAndMot, valuation] = await Promise.all([
        vehicleDataService.fetchVehicleAndMotHistory(reg),
        vehicleDataService.fetchValuationData(reg),
      ]);
      await new Promise((r) => setTimeout(r, 600));

      // BATCH 3
      const [motTaxStatus] = await Promise.all([
        
        vehicleDataService.fetchMotHistoryAndTaxStatusData(reg),
      ]);
      await new Promise((r) => setTimeout(r, 600));


      // build
      const combinedResponse = {
        reg,
        timestamp: new Date().toISOString(),
        vdiCheckFull: vdiFull,
        vehicleAndMotHistory: vehicleAndMot,
        valuation,
        motTaxStatus,
        images,
      };
      // console.log('Server: final HPI =>', JSON.stringify(combinedResponse, null, 2));

      // log search
      const record = await SearchRecord.create({
        userId: currentUser._id,
        vehicleReg: reg,
        searchType: 'FULL_HISTORY',
        responseData: combinedResponse,
      });
      currentUser.searchHistory.push(record._id);
      await currentUser.save();

      // console.log('Server: hpiCheck =>', combinedResponse);

      return combinedResponse;
    },
    
  },

  Mutation: {
    // Pay an MOT credit (example)
    async payMOTCredit(_, __, { user }) {
      console.log('Server: payMOTCredit invoked with user =>', user);
      if (!user) throw new Error('Not authenticated');

      const currentUser = await User.findById(user.userId);
      console.log('Server: found DB user =>', currentUser);

      if (!currentUser) {
        console.log('Server: returning null because user not found');
        return null;
      }

      console.log('Server: currentUser.motCredits before =>', currentUser.motCredits);
      if (currentUser.motCredits < 1) {
        console.log('Server: returning null because motCredits < 1');
        return null;
      }

      currentUser.motCredits -= 1;
      await currentUser.save();
      console.log('Server: after save =>', currentUser.motCredits);

      console.log('Server: returning user =>', currentUser);
      return currentUser;
    },
  },
};
