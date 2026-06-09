import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationServiceClass {
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch {
      return false;
    }
  }

  async scheduleReminder(
    id: string,
    title: string,
    body: string,
    triggerDate: Date,
  ): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
      await Notifications.scheduleNotificationAsync({
        identifier: id,
        content: { title, body, sound: true },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
      });
    } catch {
      // ignore
    }
  }

  async cancelReminder(id: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch {
      // ignore
    }
  }

  async cancelAll(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch {
      // ignore
    }
  }
}

export const NotificationService = new NotificationServiceClass();
