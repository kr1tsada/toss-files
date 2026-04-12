import { Usb, AlertTriangle } from "lucide-react";

interface DeviceGuideProps {
  reason?: "no_device" | "unauthorized";
}

export function DeviceGuide({ reason = "no_device" }: DeviceGuideProps) {
  if (reason === "unauthorized") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-fg-3">
        <AlertTriangle size={48} className="text-yellow-500" />
        <p className="text-lg font-medium text-fg-2">Device unauthorized</p>
        <p className="max-w-sm text-center text-sm leading-relaxed">
          Check your phone screen and tap{" "}
          <span className="text-fg-2">"Allow USB debugging"</span>. If the prompt
          didn't appear, unplug and reconnect your cable, then try again.
        </p>
        <p className="text-xs text-fg-5">
          Enable "Always allow from this computer" to skip this next time
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-fg-3">
      <Usb size={48} className="text-fg-5" />
      <p className="text-lg font-medium text-fg-2">Connect your Android device</p>
      <ol className="list-decimal space-y-2 pl-6 text-sm leading-relaxed">
        <li>
          Open <span className="text-fg-2">Settings &gt; Developer Options</span> on your phone
        </li>
        <li>
          Enable <span className="text-fg-2">USB Debugging</span>
        </li>
        <li>Connect via USB cable</li>
        <li>
          Accept the <span className="text-fg-2">"Allow USB debugging?"</span> prompt on your phone
        </li>
      </ol>
      <p className="mt-2 text-xs text-fg-5">
        If Developer Options is not visible, tap Build Number 7 times in Settings &gt; About Phone
      </p>
    </div>
  );
}
