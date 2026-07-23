"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { useCart } from "@/components/cart/cart-context";
import { WaitlistForm } from "@/components/waitlist-form";
import { WAITLIST_OFFER } from "@/lib/pricing";

// Site-wide "join the waitlist" popup. A visitor can open it from anywhere
// (a page CTA, the shop buy box, the floating button, the nav) instead of
// being scrolled to the homepage form. Mounted once from the root layout so
// every page shares one instance. In live mode it never opens; the CTAs that
// call it already switch to "Shop now" links, so open() is a no-op there.
//
// `placement` is threaded through to the WaitlistForm and recorded on the
// load-bearing waitlist_signup event, so opens from different surfaces stay
// distinguishable without a new event name.

type WaitlistPopupValue = {
  open: (placement: string) => void;
  close: () => void;
  isOpen: boolean;
};

const WaitlistPopupContext = createContext<WaitlistPopupValue | null>(null);

export function useWaitlistPopup(): WaitlistPopupValue {
  const value = useContext(WaitlistPopupContext);
  if (!value) {
    throw new Error("useWaitlistPopup must be used within WaitlistPopupProvider");
  }
  return value;
}

export function WaitlistPopupProvider({ children }: { children: React.ReactNode }) {
  const { mode } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [placement, setPlacement] = useState("popup");
  // Kept at provider level so reopening after a successful signup still shows
  // the confirmation rather than an empty form.
  const [joined, setJoined] = useState(false);

  const open = useCallback(
    (nextPlacement: string) => {
      if (mode === "live") return;
      setPlacement(nextPlacement);
      setIsOpen(true);
    },
    [mode]
  );

  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(() => ({ open, close, isOpen }), [open, close, isOpen]);

  return (
    <WaitlistPopupContext.Provider value={value}>
      {children}
      {isOpen && mode !== "live" ? (
        <WaitlistPopupPanel
          placement={placement}
          joined={joined}
          onJoin={() => setJoined(true)}
          onClose={close}
        />
      ) : null}
    </WaitlistPopupContext.Provider>
  );
}

function WaitlistPopupPanel({
  placement,
  joined,
  onJoin,
  onClose
}: {
  placement: string;
  joined: boolean;
  onJoin: () => void;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Land focus on the email field so the visitor can type straight away,
    // falling back to the panel if the form is showing its success state.
    const panel = panelRef.current;
    (panel?.querySelector<HTMLElement>('input[type="email"]') ?? panel)?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not(:disabled), input:not([disabled]):not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="waitlist-pop-overlay" onClick={onClose}>
      <div
        className="waitlist-pop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="waitlist-pop-title"
        ref={panelRef}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="waitlist-pop__close"
          type="button"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="waitlist-pop__title" id="waitlist-pop-title">
          Be first to stir it in.
        </h2>
        <p className="waitlist-pop__lede">
          One email the day we launch, with {WAITLIST_OFFER.percent}% off your
          first order inside. The waitlist eats first.
        </p>
        <WaitlistForm
          joined={joined}
          onJoin={onJoin}
          id="popup-email"
          placement={placement}
          buttonStyle="pill"
          startExpanded
        />
      </div>
    </div>
  );
}
