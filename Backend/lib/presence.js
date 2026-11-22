const { getValues, removeKeys, setValue } = require("./store");

const PRESENCE_TTL_MS = 70 * 1000;
const HEARTBEAT_MS = 25 * 1000;

const presenceKey = (userId) => `presence:${userId}`;

const markOnline = (userId) => setValue(presenceKey(userId), "1", PRESENCE_TTL_MS);

const markOffline = (userId) => removeKeys(presenceKey(userId));

const onlineMap = async (userIds) => {
  const values = await getValues(userIds.map(presenceKey));
  return new Map(userIds.map((id, index) => [id, Boolean(values[index])]));
};

module.exports = { markOnline, markOffline, onlineMap, HEARTBEAT_MS };
