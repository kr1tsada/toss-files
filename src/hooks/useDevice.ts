import { useState, useEffect, useCallback, useRef } from "react";
import type { Device } from "../types/device";
import { listDevices } from "../lib/commands";

const POLL_INTERVAL = 3000;

export function useDevice() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listDevices();
      setDevices(result);
      setSelectedDevice((prev) => {
        if (!prev && result.length > 0) return result[0];
        if (prev && !result.find((d) => d.id === prev.id)) return result[0] ?? null;
        if (prev) return result.find((d) => d.id === prev.id) ?? null;
        return null;
      });
    } catch {
      setDevices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    intervalRef.current = setInterval(refresh, POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refresh]);

  return { devices, selectedDevice, setSelectedDevice, loading, refresh };
}
