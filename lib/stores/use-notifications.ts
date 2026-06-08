"use client";

import { useSyncExternalStore } from "react";
import {
  subscribe,
  getSnapshot,
  getServerSnapshot,
  markRead,
  markAllRead,
  type Notification,
} from "./notification-store";

export function useNotifications(): {
  notifications: Notification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
} {
  const notifications = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const unreadCount = notifications.filter((n) => !n.read).length;
  return { notifications, unreadCount, markRead, markAllRead };
}
