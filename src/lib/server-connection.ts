export type ServerConnectionPreferences = {
  cloudEnabled: boolean;
  deviceName: string;
  cloudAddress: string;
  offlineNumbers: boolean;
  numberRangeStart: string;
  edgeEnabled: boolean;
  edgeAddress: string;
};

export const defaultServerConnection: ServerConnectionPreferences = {
  cloudEnabled: true,
  deviceName: "eatOS-ee3a",
  cloudAddress: "ws.eatos.pro",
  offlineNumbers: false,
  numberRangeStart: "",
  edgeEnabled: false,
  edgeAddress: "",
};

/**
 * Saved values from before the eatOS rename still carried the old device name
 * and host, so swap those legacy defaults for the current ones on read.
 */
export const migrateServerConnection = (
  saved: Partial<ServerConnectionPreferences> = {},
): ServerConnectionPreferences => {
  const next = { ...defaultServerConnection, ...saved };
  if (next.deviceName.toUpperCase().includes("LCROS")) next.deviceName = defaultServerConnection.deviceName;
  if (next.cloudAddress.toLowerCase().includes("lcros")) next.cloudAddress = defaultServerConnection.cloudAddress;
  return next;
};
