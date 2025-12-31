import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

/**
 * Register for push notifications and get the Expo push token
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
    // Only works on physical devices, not simulators
    if (!Device.isDevice) {
        console.log('Push notifications require a physical device');
        return null;
    }

    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permission if not already granted
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Push notification permission not granted');
        return null;
    }

    // Get the Expo push token
    try {
        const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId: 'ea9ab9eb-7252-44aa-84b8-6a3e19d91763', // Your EAS project ID
        });
        return tokenData.data;
    } catch (error) {
        console.error('Error getting push token:', error);
        return null;
    }
}

/**
 * Save push token to user's profile in Supabase
 */
export async function savePushToken(userId: string, token: string): Promise<void> {
    try {
        const { error } = await supabase
            .from('profiles')
            .update({
                push_token: token,
                last_active_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (error) {
            console.error('Error saving push token:', error);
        }
    } catch (error) {
        console.error('Exception saving push token:', error);
    }
}

/**
 * Update last_active_at timestamp for the user
 */
export async function updateLastActive(userId: string): Promise<void> {
    try {
        const { error } = await supabase
            .from('profiles')
            .update({ last_active_at: new Date().toISOString() })
            .eq('id', userId);

        if (error) {
            console.error('Error updating last active:', error);
        }
    } catch (error) {
        console.error('Exception updating last active:', error);
    }
}

/**
 * Setup notification listeners
 */
export function setupNotificationListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationResponse?: (response: Notifications.NotificationResponse) => void
) {
    // Handle notifications received while app is in foreground
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification received:', notification);
        onNotificationReceived?.(notification);
    });

    // Handle user tapping on a notification
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Notification response:', response);
        onNotificationResponse?.(response);
    });

    // Return cleanup function
    return () => {
        Notifications.removeNotificationSubscription(notificationListener);
        Notifications.removeNotificationSubscription(responseListener);
    };
}

/**
 * Configure Android notification channel
 */
export async function setupAndroidChannel(): Promise<void> {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'Varsayılan',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#ea2a33',
        });
    }
}
