import { RefreshCw, Smartphone } from "lucide-react";
import type { Device } from "../../types/device";

interface DeviceStatusProps {
  devices: Device[];
  selectedDevice: Device | null;
  onSelect: (device: Device) => void;
  onRefresh: () => void;
  loading: boolean;
}

export function DeviceStatus({
  devices,
  selectedDevice,
  onSelect,
  onRefresh,
  loading,
}: DeviceStatusProps) {
  const stateColor = (state: string) => {
    if (state === "Connected") return "bg-green-500";
    if (state === "Unauthorized") return "bg-yellow-500";
    return "bg-neutral-600";
  };

  const stateLabel = (state: string) => {
    if (state === "Connected") return "connected";
    if (state === "Unauthorized") return "unauthorized";
    return "offline";
  };

  return (
    <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-2">
      <div className="flex items-center gap-3">
        <Smartphone size={16} className="text-neutral-400" />
        {devices.length === 0 ? (
          <span className="text-sm text-neutral-500">No device connected</span>
        ) : devices.length === 1 ? (
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${stateColor(selectedDevice?.state ?? "")}`} />
            <span className="text-sm text-neutral-200">
              {selectedDevice?.model || selectedDevice?.id}
            </span>
            <span className="text-xs text-neutral-500">
              ({stateLabel(selectedDevice?.state ?? "")})
            </span>
          </div>
        ) : (
          <select
            value={selectedDevice?.id ?? ""}
            onChange={(e) => {
              const d = devices.find((d) => d.id === e.target.value);
              if (d) onSelect(d);
            }}
            className="rounded bg-neutral-800 px-2 py-1 text-sm text-neutral-200 outline-none"
          >
            {devices.map((d) => (
              <option key={d.id} value={d.id}>
                {d.model || d.id} ({stateLabel(d.state)})
              </option>
            ))}
          </select>
        )}
      </div>
      <button
        onClick={onRefresh}
        disabled={loading}
        className="rounded p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white disabled:opacity-50"
        title="Refresh devices"
      >
        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
      </button>
    </div>
  );
}
