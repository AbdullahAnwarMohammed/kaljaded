importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js");

// TODO: Replace with your actual Firebase project config (same as in firebase-config.js)
const firebaseConfig = {
  apiKey: "AIzaSyBIFGg1RmiH5xLl__fbk2jaFnnXwqBghEc",
  authDomain: "kaljaded.firebaseapp.com",
  projectId: "kaljaded",
  storageBucket: "kaljaded.firebasestorage.app",
  messagingSenderId: "930867947710",
  appId: "1:930867947710:web:a298ddec05e61c4a7016ef",
  measurementId: "G-NKQVL9DFH2"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.image || "/logo.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
