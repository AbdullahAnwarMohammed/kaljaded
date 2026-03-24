import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import Api from "./Services/Api";

// TODO: Replace with your actual Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyBIFGg1RmiH5xLl__fbk2jaFnnXwqBghEc",
  authDomain: "kaljaded.firebaseapp.com",
  projectId: "kaljaded",
  storageBucket: "kaljaded.firebasestorage.app",
  messagingSenderId: "930867947710",
  appId: "1:930867947710:web:a298ddec05e61c4a7016ef",
  measurementId: "G-NKQVL9DFH2"
};

const app = initializeApp(firebaseConfig);

// Initialize messaging lazily or check support
let messaging = null;
isSupported().then((supported) => {
  if (supported) {
    messaging = getMessaging(app);
  }
}).catch(() => {
    console.log("Firebase Messaging not supported in this environment");
});

export const requestForToken = async () => {
  try {
    if (!messaging) {
        const supported = await isSupported();
        if (!supported) {
            console.warn("Firebase Messaging not supported, skipping token request.");
            return;
        }
        messaging = getMessaging(app);
    }

    console.log("Requesting permission...");
    const currentToken = await getToken(messaging, {
      vapidKey: "BKf93EZXPmTVxfRxBIPwYAY5Qdu1b5yPV5BPpzMdXE4T48eOdHJrstThJU-4M1aGNpf7M4IGmVJU_5jS0Yh-z7w",
    });

    if (currentToken) {
      console.log("current token for client: ", currentToken);
      try {
          await Api.post("/fcm-token", { 
              token: currentToken,
              device_type: 'web',
              device_id: null
          });
          console.log("FCM Token saved to backend successfully.");
      } catch (apiError) {
          console.error("Error saving FCM token to backend:", apiError);
      }
    } else {
      console.log("No registration token available. Request permission to generate one.");
    }
  } catch (err) {
    console.error("An error occurred while retrieving token. ", err);
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) return;
    onMessage(messaging, (payload) => {
      console.log("payload", payload);
      resolve(payload);
    });
  });

export { messaging };
