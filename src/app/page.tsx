import { KioskApp } from "@/components/kiosk/kiosk-app";
import { listDestinationResponse } from "@/server/runtime";

export default function Home() {
  return <KioskApp initialDestinations={readInitialDestinations()} />;
}

function readInitialDestinations(): Array<{ id: string; name: string }> {
  try {
    return listDestinationResponse();
  } catch {
    return [];
  }
}
