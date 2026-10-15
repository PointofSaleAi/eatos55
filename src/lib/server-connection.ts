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
  deviceName: "LCROS-ee3a",
  cloudAddress: "ws.lcros.pro",
  offlineNumbers: false,
  numberRangeStart: "",
  edgeEnabled: false,
  edgeAddress: "",
};