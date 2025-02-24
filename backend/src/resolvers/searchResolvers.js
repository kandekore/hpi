const User = require('../models/User');
const SearchRecord = require('../models/SearchRecord');
const vehicleDataService = require('../services/vehicleDataService');

const FREE_MOT_CHECKS = 3;
const ipFreeCheckUsage = {}; // For tracking anonymous free checks if desired

module.exports = {
  Query: {
    // -----------------------
    // MOT CHECK
    // -----------------------
    async motCheck(_, { reg }, { user, req }) {
      let canCheck = false;

      if (user) {
        // Logged-in user logic
        const currentUser = await User.findById(user.userId);
        if (currentUser.freeMotChecksUsed < FREE_MOT_CHECKS) {
          canCheck = true;
          currentUser.freeMotChecksUsed += 1;
        } else if (currentUser.motCredits > 0) {
          canCheck = true;
          currentUser.motCredits -= 1;
        }

        if (!canCheck) {
          throw new Error('No free checks or MOT credits available. Please purchase credits.');
        }

        // Do the MOT check
        const data = await vehicleDataService.motCheck(reg);

        // Log in DB
        const record = await SearchRecord.create({
          userId: currentUser._id,
          vehicleReg: reg,
          searchType: 'MOT',
          responseData: data,
        });

        currentUser.searchHistory.push(record._id);
        await currentUser.save();
        return data;
      } else {
        // Anonymous user logic
        const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
        const usage = ipFreeCheckUsage[clientIp] || 0;

        if (usage < FREE_MOT_CHECKS) {
          ipFreeCheckUsage[clientIp] = usage + 1;
          canCheck = true;
        }

        if (!canCheck) {
          throw new Error(
            'You have used all your free MOT checks. Please register or purchase credits.'
          );
        }

        const data = await vehicleDataService.motCheck(reg);
        return data;
      }
    },

    // -----------------------
    // VDI CHECK
    // -----------------------
    async vdiCheck(_, { reg }, { user }) {
      if (!user) throw new Error('Not authenticated');

      const currentUser = await User.findById(user.userId);
      if (!currentUser) throw new Error('User not found');
      if (currentUser.vdiCredits < 1) {
        throw new Error('No VDI credits available');
      }

      // Deduct a VDI credit
      currentUser.vdiCredits -= 1;
      const data = await vehicleDataService.vdiCheck(reg);

      // Log in DB
      const record = await SearchRecord.create({
        userId: currentUser._id,
        vehicleReg: reg,
        searchType: 'VDI',
        responseData: data,
      });

      currentUser.searchHistory.push(record._id);
      await currentUser.save();
      return data;
    },

    // -----------------------
    // VALUATION
    // -----------------------
    async valuation(_, { reg }) {
      const data = await vehicleDataService.valuationCheck(reg);
      return data;
    },

    // -----------------------
    // GET SEARCH HISTORY
    // -----------------------
    async getSearchHistory(_, __, { user }) {
      if (!user) throw new Error('Not authenticated');
      const currentUser = await User.findById(user.userId).populate('searchHistory');
      return currentUser.searchHistory;
    },
  },
};
