import { useState } from "react";
import type { Device } from "../types/device";

export function useDevice() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  return { devices, setDevices, selectedDevice, setSelectedDevice };
}
