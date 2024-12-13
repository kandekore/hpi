const User = require('../models/User');
const SearchRecord = require('../models/SearchRecord');
const vehicleDataService = require('../services/vehicleDataService');

const FREE_MOT_CHECKS = 3;

module.exports = {
  Query: {
    async motCheck(_, { reg }, { user }) {
      if (!user) throw new Error('Not authenticated');

      const currentUser = await User.findById(user.userId);
      let canCheck = false;

      if (currentUser.freeMotChecksUsed < FREE_MOT_CHECKS) {
        canCheck = true;
        currentUser.freeMotChecksUsed += 1;
      } else if (currentUser.motCredits > 0) {
        canCheck = true;
        currentUser.motCredits -= 1;
      }

      if (!canCheck) {
        throw new Error('No free checks or MOT credits available');
      }

      const data = await vehicleDataService.motCheck(reg);
      const record = await SearchRecord.create({
        userId: currentUser._id,
        vehicleReg: reg,
        searchType: 'MOT',
        responseData: data
      });

      currentUser.searchHistory.push(record._id);
      await currentUser.save();

      return data;
    },
    async vdiCheck(_, { reg }, { user }) {
      if (!user) throw new Error('Not authenticated');

      const currentUser = await User.findById(user.userId);
      if (currentUser.vdiCredits < 1) {
        throw new Error('No VDI credits available');
      }

      currentUser.vdiCredits -= 1;
      const data = await vehicleDataService.vdiCheck(reg);
      const record = await SearchRecord.create({
        userId: currentUser._id,
        vehicleReg: reg,
        searchType: 'VDI',
        responseData: data
      });

      currentUser.searchHistory.push(record._id);
      await currentUser.save();

      return data;
    },
    async getSearchHistory(_, __, { user }) {
      if (!user) throw new Error('Not authenticated');
      const currentUser = await User.findById(user.userId).populate('searchHistory');
      return currentUser.searchHistory;
    }
  }
};
