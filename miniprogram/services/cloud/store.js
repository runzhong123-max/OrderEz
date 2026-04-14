const { callCloudFunction } = require("./base");
const { adaptStoreToRestaurant } = require("./adapters");

async function fetchStore(params) {
  const data = await callCloudFunction("getStore", params);
  return data.store || null;
}

async function fetchStoreForClient(params) {
  const store = await fetchStore(params);
  return adaptStoreToRestaurant(store);
}

module.exports = {
  fetchStore,
  fetchStoreForClient,
};
