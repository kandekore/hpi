// backend/src/resolvers/searchResolvers.js
const User = require('../models/User');
const SearchRecord = require('../models/SearchRecord');
const vehicleDataService = require('../services/vehicleDataService');

const FREE_MOT_CHECKS = 3;

module.exports = {
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

      return fullData;
    },

    // 2) VDI Check
    async vdiCheck(_, { reg }, { user }) {
      if (!user) throw new Error('Not authenticated');

      const currentUser = await User.findById(user.userId);
      if (!currentUser) throw new Error('User not found');
      if (currentUser.vdiCredits < 1) {
        throw new Error('No VDI credits available');
      }
      // deduct
      currentUser.vdiCredits -= 1;

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
        searchType: 'VDI',
        responseData: mergedResponse,
      });
      currentUser.searchHistory.push(record._id);
      await currentUser.save();

      return mergedResponse;
    },

    // 3) Valuation
    async valuation(_, { reg }) {
      const data = await vehicleDataService.valuationCheck(reg);
      return data;
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

    // 6) Full HPI Check with 4 batches
    async hpiCheck(_, { reg }, { user }) {
      if (!user) throw new Error('Not authenticated');
      const currentUser = await User.findById(user.userId);
      if (!currentUser) throw new Error('User not found');
      if (currentUser.hpiCredits < 1) throw new Error('No HPI credits available');

      // deduct 1 credit
      currentUser.hpiCredits -= 1;

      // BATCH 1
      const [vdiFull, vedData] = await Promise.all([
        vehicleDataService.fetchVdiCheckFull(reg),
        vehicleDataService.fetchVedData(reg),
      ]);
      await new Promise((r) => setTimeout(r, 600));

      // BATCH 2
      const [vehicleAndMot, vehicleData] = await Promise.all([
        vehicleDataService.fetchVehicleAndMotHistory(reg),
        vehicleDataService.fetchVehicleData(reg),
      ]);
      await new Promise((r) => setTimeout(r, 600));

      // BATCH 3
      const [valuation, motTaxStatus] = await Promise.all([
        vehicleDataService.fetchValuationData(reg),
        vehicleDataService.fetchMotHistoryAndTaxStatusData(reg),
      ]);
      await new Promise((r) => setTimeout(r, 600));

      // BATCH 4
      const [images, specAndOptions] = await Promise.all([
        vehicleDataService.fetchVehicleImageData(reg),
        vehicleDataService.fetchSpecAndOptions(reg),
      ]);
      // no final delay needed unless you want it

      // build
      const combinedResponse = {
        reg,
        timestamp: new Date().toISOString(),
        vdiCheckFull: vdiFull,
        vedData,
        vehicleAndMotHistory: vehicleAndMot,
        vehicleData,
        valuation,
        motTaxStatus,
        images,
        specAndOptions,
      };

      // log search
      const record = await SearchRecord.create({
        userId: currentUser._id,
        vehicleReg: reg,
        searchType: 'HPI',
        responseData: combinedResponse,
      });
      currentUser.searchHistory.push(record._id);
      await currentUser.save();

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
