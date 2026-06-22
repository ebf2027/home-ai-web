interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface Navigator {
  standalone?: boolean;
}

interface Window {
  __deferredInstallPrompt?: BeforeInstallPromptEvent | null;
  pintrk?: (
    track: string,
    event: string,
    options: {
      event_id: string;
      value: number;
      order_quantity: number;
      currency: string;
    }
  ) => void;
}
