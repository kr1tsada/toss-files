import { Usb } from "lucide-react";

export function DeviceGuide() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-neutral-400">
      <Usb size={48} className="text-neutral-600" />
      <p className="text-lg font-medium text-neutral-300">Connect your Android device</p>
      <ol className="list-decimal space-y-2 pl-6 text-sm leading-relaxed">
        <li>
          Open <span className="text-neutral-200">Settings &gt; Developer Options</span> on your phone
        </li>
        <li>
          Enable <span className="text-neutral-200">USB Debugging</span>
        </li>
        <li>Connect via USB cable</li>
        <li>
          Accept the <span className="text-neutral-200">"Allow USB debugging?"</span> prompt on your phone
        </li>
      </ol>
      <p className="mt-2 text-xs text-neutral-600">
        If Developer Options is not visible, tap Build Number 7 times in Settings &gt; About Phone
      </p>
    </div>
  );
}
