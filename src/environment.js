export const environment = {
    firebaseConfig: {
        apiKey: "AIzaSyAjk_FyxxM-W2gzjYtWm56qqsmcYEY797E",
        authDomain: "webrtc-basics.firebaseapp.com",
        projectId: "webrtc-basics",
        storageBucket: "webrtc-basics.appspot.com",
        messagingSenderId: "8067180156",
        appId: "1:8067180156:web:2409350ccd703fa0460bf9"
    },
    rtcConfig: {
        iceServers: [
          {
            urls: [
              'stun:stun1.l.google.com:19302',
              'stun:stun2.l.google.com:19302',
            ],
          },
        ],
        iceCandidatePoolSize: 10,
    }
}