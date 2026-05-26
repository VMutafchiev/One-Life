import * as Notifications from 'expo-notifications';

/** Requests permission to send push notifications; returns true if granted. */
export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/** Cancels all existing scheduled notifications then schedules a daily 8am reminder with the user's live day count. */
export async function scheduleDailyNotification(daysRemaining: number): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'One Life',
      body: `You have ${daysRemaining} days left. What will you do with today?`,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 8,
      minute: 0,
    },
  });
}
