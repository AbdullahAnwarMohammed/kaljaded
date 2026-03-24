import Swal from 'sweetalert2';
import { requestForToken } from '../firebase-config';

/**
 * Shows an elegant popup to ask for notification permission.
 * If the user agrees, it triggers the native browser permission request.
 */
export const showNotificationPermissionPopup = async () => {
    // Check if notifications are supported
    if (!('Notification' in window)) {
        console.warn('This browser does not support desktop notification');
        return;
    }

    console.log("Current Notification Permission:", Notification.permission);

    // If already granted, just request the token
    if (Notification.permission === 'granted') {
        console.log("Permission already granted. Requesting token directly.");
        await requestForToken();
        return;
    }

    // If denied, don't show anything (or we could show instructions on how to re-enable)
    if (Notification.permission === 'denied') {
        console.log('Notification permission is denied by the user.');
        // Optional: Show a different popup explaining how to enable notifications manually
        return;
    }

    // Show SweetAlert2 Soft Prompt
    const result = await Swal.fire({
        title: 'تفعيل الإشعارات',
        text: 'هل ترغب في استقبال إشعارات حول أحدث العروض والطلبات الخاصة بك؟',
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#1a5d1a', // Matching user's brand colors (Deep Green)
        cancelButtonColor: '#d33',
        confirmButtonText: 'نعم، قم بالتفعيل',
        cancelButtonText: 'ليس الآن',
        reverseButtons: true,
        customClass: {
            popup: 'animated fadeInDown'
        }
    });

    if (result.isConfirmed) {
        // Trigger the native browser prompt
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
            await requestForToken();
            Swal.fire({
                title: 'تم التفعيل!',
                text: 'سوف نصلك بأحدث المستجدات.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        }
    } else {
        console.log("User dismissed the notification permission popup.");
    }
};
