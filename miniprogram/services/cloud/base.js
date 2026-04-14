const CLOUD_ENV_ID = "cloud1-4gz47r16105c3363";

let cloudReady = false;

function ensureCloudReady() {
  if (cloudReady) {
    return;
  }

  if (!wx.cloud) {
    throw new Error("当前基础库不支持云开发，请在微信开发者工具中启用云开发能力");
  }

  wx.cloud.init({
    env: CLOUD_ENV_ID,
    traceUser: true,
  });

  cloudReady = true;
}

function normalizeCloudResponse(response) {
  const result = response && response.result ? response.result : response;

  if (result && typeof result.code === "number") {
    return result;
  }

  return {
    code: 0,
    message: "ok",
    data: result || {},
  };
}

async function callCloudFunction(name, data) {
  ensureCloudReady();

  const response = await wx.cloud.callFunction({
    name,
    data: data || {},
  });
  const normalizedResponse = normalizeCloudResponse(response);

  if (normalizedResponse.code !== 0) {
    const error = new Error(normalizedResponse.message || "云函数调用失败");
    error.response = normalizedResponse;
    throw error;
  }

  return normalizedResponse.data;
}

module.exports = {
  CLOUD_ENV_ID,
  callCloudFunction,
  ensureCloudReady,
  normalizeCloudResponse,
};
