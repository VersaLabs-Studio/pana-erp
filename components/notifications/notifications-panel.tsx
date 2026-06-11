"use client";

// components/notifications/notifications-panel.tsx
// B9: Notification history panel — B1 surface, dual-theme, accessible.
// F7: Detail view — clicking an item with detail/actions shows explanation + steps.

import { useEffect, useRef, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/lib/stores/use-notifications";
import type { Notification, NotificationAction } from "@/lib/stores/notification-store";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  Bell,
  X,
  CheckCheck,
  ChevronLeft,
  ArrowRight,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function relativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function kindIcon(kind: string) {
  switch (kind) {
    case "success":
      return <CheckCircle2 className="h-4 w-4 text-primary" />;
    case "error":
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    case "guided":
      return <AlertTriangle className="h-4 w-4 text-warning" />;
    default:
      return <Info className="h-4 w-4 text-info" />;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationsPanel({
  open,
  onClose,
}: NotificationsPanelProps) {
  const { notifications, unreadCount, markRead, markAllRead } =
    useNotifications();
  const panelRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const router = useRouter();
  const [detailItem, setDetailItem] = useState<Notification | null>(null);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Reset detail view when panel closes
  useEffect(() => {
    if (!open) setDetailItem(null);
  }, [open]);

  // Focus trap — focus first focusable element on open
  useEffect(() => {
    if (!open || !panelRef.current) return;
    const first = panelRef.current.querySelector<HTMLElement>(
      "button, [tabindex]:not([tabindex='-1'])",
    );
    first?.focus();
  }, [open]);

  const handleItemClick = useCallback(
    (item: Notification) => {
      markRead(item.id);
      // F7: if item has detail or actions, show detail view
      if (item.detail || (item.actions && item.actions.length > 0)) {
        setDetailItem(item);
        return;
      }
      if (item.href) {
        router.push(item.href);
      }
    },
    [markRead, router],
  );

  const handleAction = useCallback(
    (action: NotificationAction) => {
      if (action.href) {
        router.push(action.href);
      } else if (action.run) {
        action.run();
      }
    },
    [router],
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            initial={prefersReducedMotion ? {} : { opacity: 0, y: -8, scale: 0.96 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? {} : { opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            role="dialog"
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
            className="absolute right-0 top-full mt-2 z-50 w-[380px] max-h-[480px] bg-card rounded-2xl shadow-sm shadow-black/5 border border-border/40 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
              <div className="flex items-center gap-2">
                {detailItem ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setDetailItem(null)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                ) : (
                  <Bell className="h-4 w-4 text-muted-foreground" />
                )}
                <h3 className="text-sm font-semibold text-foreground">
                  {detailItem ? "Notification Detail" : "Notifications"}
                </h3>
                {!detailItem && unreadCount > 0 && (
                  <span className="text-[10px] font-medium tabular-nums text-primary bg-primary/10 rounded-full px-1.5 py-0.5">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {!detailItem && unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 px-2"
                    onClick={markAllRead}
                  >
                    <CheckCheck className="h-3 w-3 mr-1" />
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={onClose}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {detailItem ? (
                /* F7: Detail View */
                <div className="p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">{kindIcon(detailItem.kind)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {detailItem.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                        {relativeTime(detailItem.timestamp)}
                      </p>
                    </div>
                  </div>

                  {detailItem.message && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {detailItem.message}
                    </p>
                  )}

                  {detailItem.detail && (
                    <div className="rounded-xl bg-muted/30 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                        Explanation
                      </p>
                      <p className="text-sm text-foreground leading-relaxed">
                        {detailItem.detail}
                      </p>
                    </div>
                  )}

                  {detailItem.actions && detailItem.actions.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Actions
                      </p>
                      {detailItem.actions.map((action, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          className="w-full justify-between rounded-xl h-auto py-3 px-4"
                          onClick={() => handleAction(action)}
                        >
                          <span className="text-sm">{action.label}</span>
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      ))}
                    </div>
                  )}

                  {detailItem.href && (
                    <Button
                      className="w-full rounded-xl"
                      onClick={() => {
                        router.push(detailItem.href!);
                      }}
                    >
                      Go to document
                    </Button>
                  )}
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No notifications yet
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Actions and errors will appear here
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => handleItemClick(n)}
                      className={cn(
                        "w-full flex items-start gap-3 px-5 py-3.5 text-left transition-colors hover:bg-muted/30",
                        !n.read && "bg-primary/5",
                      )}
                    >
                      <div className="mt-0.5 shrink-0">{kindIcon(n.kind)}</div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "text-sm truncate",
                            n.read
                              ? "text-muted-foreground"
                              : "font-medium text-foreground",
                          )}
                        >
                          {n.title}
                        </p>
                        {n.message && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                            {n.message}
                          </p>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground/60 shrink-0 mt-0.5">
                        {relativeTime(n.timestamp)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
