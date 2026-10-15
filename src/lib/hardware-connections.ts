export type HardwareDevice = { id: string; name: string; type: string; serial: string };
export type HardwareConnections = { readerId: string | null; drawerId: string | null; addedDrawers: HardwareDevice[] };

export const defaultHardwareConnections: HardwareConnections = { readerId: null, drawerId: "epson-usb", addedDrawers: [] };

export const referenceReaders: HardwareDevice[] = [
  { id: "sf12-7136", name: "EOC-SF12-7136", type: "ADYEN", serial: "6a7f59d56f7b69f3763b884c" },
  { id: "warrens-3784", name: "AMS1_Warrens_3784", type: "ADYEN", serial: "6aa3ce9dcdfa0b73161792b6" },
  { id: "sf12-1665", name: "EOC-SF12-1665", type: "ADYEN", serial: "6ab175dfea6a04763ff2586c" },
  { id: "demo-0447", name: "LA Demo S1F2-0447", type: "ADYEN", serial: "6ab3ef97d26f26e315f997dd" },
  { id: "vinit-1665", name: "AMS1_Vinit_1665", type: "ADYEN", serial: "6ab4073bd26f26e315f9ab82" },
  { id: "dheeraj-8151", name: "Dheeraj_S1F2-8151", type: "ADYEN", serial: "6ab40804d26f26e315f9afe0" },
];

export const referenceDrawers: HardwareDevice[] = [
  { id: "cd", name: "cd", type: "PAX REGISTER", serial: "5c991483f37713ee31371dcb" },
  { id: "cdhp4", name: "CDHP4", type: "PAX REGISTER", serial: "013759da0663a8721028af33" },
  { id: "epson-usb", name: "EpsonUSB", type: "STAR CASH DRAWER - ETHERNET", serial: "33f94594179187de41898448" },
  { id: "star-usb", name: "StarUSBCashDrawer", type: "STAR CASH DRAWER - USB", serial: "521cd47019220951b0917901" },
  { id: "usb-cd", name: "usb printer cd", type: "PAX REGISTER", serial: "3791256949961878a77ba101" },
];