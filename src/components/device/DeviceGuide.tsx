export function DeviceGuide() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-neutral-400">
      <p className="text-lg font-medium">Connect your Android device</p>
      <ol className="list-decimal space-y-1 text-sm">
        <li>Enable USB Debugging on your device</li>
        <li>Connect via USB cable</li>
        <li>Accept the USB debugging prompt</li>
      </ol>
    </div>
  );
}
