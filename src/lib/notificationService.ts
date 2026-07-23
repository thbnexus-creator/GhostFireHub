/**
 * GhostFireHub 2.0 FCM Notification Engine & Topic Channel Manager
 * Production readiness module for web and native Android push notifications.
 */

import { firebaseApi } from './firebaseApi';

export type NotificationCategory = 
  | 'Security Alerts' 
  | 'Vendor Approvals' 
  | 'Giveaways' 
  | 'System Maintenance' 
  | 'Account Updates';

export type NotificationTopic = 
  | 'all_users' 
  | 'premium_users' 
  | 'vendors' 
  | 'security_alerts';

export interface FCMPushPayload {
  title: string;
  body: string;
  category: NotificationCategory;
  topic?: NotificationTopic;
  targetEmail?: string;
  dataPayload?: Record<string, string>;
  iconUrl?: string;
  clickActionUrl?: string;
  createdAt: string;
}

export interface UserNotificationPreferences {
  securityAlerts: boolean;
  vendorApprovals: boolean;
  giveaways: boolean;
  systemMaintenance: boolean;
  accountUpdates: boolean;
  fcmToken?: string;
  permissionGranted: boolean;
  updatedAt: string;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: UserNotificationPreferences = {
  securityAlerts: true,
  vendorApprovals: true,
  giveaways: true,
  systemMaintenance: true,
  accountUpdates: true,
  permissionGranted: false,
  updatedAt: new Date().toISOString(),
};

/**
 * Request notification permission from the browser/native web view
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('[FCM] Notification API not supported in current runtime environment.');
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    console.log(`[FCM] Notification permission status: ${permission}`);
    return permission;
  } catch (error) {
    console.error('[FCM] Error requesting notification permission:', error);
    return 'denied';
  }
}

/**
 * Register FCM device token for targeted user notifications
 */
export async function registerDeviceToken(userEmail: string, token: string): Promise<boolean> {
  if (!userEmail || !token) return false;

  try {
    const res = await firebaseApi.request('user/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userEmail,
        fcmToken: token,
        fcmTokenUpdatedAt: new Date().toISOString(),
      }),
    });
    return res.ok;
  } catch (error) {
    console.error('[FCM] Error registering device token:', error);
    return false;
  }
}

/**
 * Save user notification topic preferences to Firestore
 */
export async function saveUserNotificationPreferences(
  userEmail: string,
  preferences: UserNotificationPreferences
): Promise<boolean> {
  if (!userEmail) return false;

  try {
    const res = await firebaseApi.request('user/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userEmail,
        notificationPreferences: {
          ...preferences,
          updatedAt: new Date().toISOString(),
        },
      }),
    });
    return res.ok;
  } catch (error) {
    console.error('[FCM] Error saving notification preferences:', error);
    return false;
  }
}

/**
 * Dispatch FCM push notification or log to user notification inbox collection
 */
export async function sendSystemNotification(payload: FCMPushPayload): Promise<boolean> {
  try {
    const notificationDoc = {
      ...payload,
      createdAt: payload.createdAt || new Date().toISOString(),
      read: false,
    };

    const res = await firebaseApi.request('notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notificationDoc),
    });

    if (res.ok && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(payload.title, {
        body: payload.body,
        icon: payload.iconUrl || '/favicon.ico',
        data: payload.dataPayload,
      });
    }

    return res.ok;
  } catch (error) {
    console.error('[FCM] Error dispatching system notification:', error);
    return false;
  }
}
