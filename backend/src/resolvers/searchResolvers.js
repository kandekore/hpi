// backend/src/resolvers/searchResolvers.js
const User = require('../models/User');
const SearchRecord = require('../models/SearchRecord');
const vehicleDataService = require('../services/vehicleDataService');

const FREE_MOT_CHECKS = 3;

module.exports = {
  Query: {
// searchResolvers.js
async motCheck(_, { reg }, { user }) {
  if (!user) throw new Error('Not authenticated');
  const currentUser = await User.findById(user.userId);
  if (!currentUser) throw new Error('User not found');

  // If you still want to track usage:
  // If free checks remain, no credit used. Otherwise, deduct credit.
  // But either way, we do NOT remove advanced data from the response.
  if (currentUser.freeMotChecksUsed < 3) {
    currentUser.freeMotChecksUsed++;
  } else if (currentUser.motCredits > 0) {
    currentUser.motCredits--;
  } else {
    throw new Error('No free checks or paid credits left.');
  }

  const fullData = await vehicleDataService.motCheck(reg); 
  // Return the entire result with advanced info
  // No code to remove RecordList

  // Log search
  const record = await SearchRecord.create({
    userId: currentUser._id,
    vehicleReg: reg,
    searchType: 'MOT',
    responseData: fullData
  });
  currentUser.searchHistory.push(record._id);
  await currentUser.save();

  // Return the entire data
  return fullData;
},

async vdiCheck(_, { reg }, { user }) {
  if (!user) throw new Error('Not authenticated');

  const currentUser = await User.findById(user.userId);
  if (!currentUser) throw new Error('User not found');
  if (currentUser.vdiCredits < 1) {
    throw new Error('No VDI credits available');
  }

  // Deduct 1 credit
  currentUser.vdiCredits -= 1;

  // 1) Get the normal VDI data
  const vdiResponse = await vehicleDataService.vdiCheck(reg);

  // 2) Also get the image data
  const imageResponse = await vehicleDataService.imageCheck(reg);

  // 3) Merge the DataItems
  //    So that the final "DataItems" includes the normal VDI fields (like `Make`, `Model`, etc.)
  //    AND also has `VehicleImages` with `.ImageDetailsList`.
  const mergedResponse = {
    ...vdiResponse, // includes StatusCode, StatusMessage, DataItems, etc.
    DataItems: {
      // Start with the VDI DataItems
      ...vdiResponse.DataItems,
      // Then also merge in the image DataItems 
      // (which typically has "VehicleImages.ImageDetailsList" etc.)
      ...imageResponse.DataItems, 
    },
  };

  // Log the search
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

    async valuation(_, { reg }) {
      const data = await vehicleDataService.valuationCheck(reg);
      return data;
    },

    async getSearchHistory(_, __, { user }) {
      if (!user) throw new Error('Not authenticated');
      const currentUser = await User.findById(user.userId).populate('searchHistory');
      return currentUser.searchHistory;
    },

    // e.g. inside module.exports = { Query: {...}, Mutation: {...} }

async getSearchById(_, { id }, { user }) {
  if (!user) throw new Error("Not authenticated");

  // Attempt to find the record by its _id
  const record = await SearchRecord.findById(id);
  if (!record) {
    throw new Error("No search record found for that ID");
  }

  // Optionally check if record.userId matches user.userId
  // If you want to ensure the user can only see their own searches
  if (record.userId.toString() !== user.userId) {
    throw new Error("Not authorized to view this record");
  }

  return record;
},

  },
Mutation: {
 // in your Mutation block
async payMOTCredit(_, __, { user }) {
  console.log("Server: payMOTCredit invoked with user =>", user);
  if (!user) throw new Error('Not authenticated');

  const currentUser = await User.findById(user.userId);
  console.log("Server: found DB user =>", currentUser);

  if (!currentUser) {
    console.log("Server: returning null because user not found");
    return null; 
    // or throw new Error('User not found');
  }

  console.log("Server: currentUser.motCredits before =>", currentUser.motCredits);
  if (currentUser.motCredits < 1) {
    console.log("Server: returning null because motCredits < 1");
    return null;
    // or throw new Error('Not enough credits');
  }

  currentUser.motCredits -= 1;
  await currentUser.save();
  console.log("Server: after save =>", currentUser.motCredits);

  console.log("Server: returning user =>", currentUser);
  return currentUser;
}
}
};
