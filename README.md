# webRTC basics

[WebRTC](https://webrtc.org/) (Web Real-Time Communication) is an API that can be used by video-chat, voice-calling, and P2P-file-sharing Web apps.
We can use STUN(Session Traversal Utilities for NAT) or TURN(Traversal Using Relays Around NATs) servers for relaying the traffic between peers.

## ICE(Interactive Connectivity Establishment) Configuration
- We can use public STUN/TURN servers or [setup](https://dev.to/kevin_odongo35/how-to-configure-a-turn-server-3opd) own using COTURN server.
```
iceConfig: {
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
```
