export type DeviceState = "connected" | "unauthorized" | "offline";

export interface Device {
  id: string;
  model: string | null;
  state: DeviceState;
}
