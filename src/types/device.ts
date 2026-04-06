export type DeviceState = "Connected" | "Unauthorized" | "Offline";

export interface Device {
  id: string;
  model: string;
  product: string;
  state: DeviceState;
}
