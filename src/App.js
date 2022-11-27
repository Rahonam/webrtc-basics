import './App.css';
import { environment } from "./environment";
import { initializeApp } from "firebase/app";
import { addDoc, collection, doc, getDoc, getFirestore, onSnapshot, query, setDoc, updateDoc } from "firebase/firestore"; 
import { useEffect } from 'react';

const app = initializeApp(environment.firebaseConfig);
const db = getFirestore(app);

// Global State
const pc = new RTCPeerConnection(environment.rtcConfig);
var localStream = null;
var remoteStream = null;

function App() {
  useEffect(()=>{
    // HTML elements
    const webcamButton = document.getElementById('webcamButton');
    const webcamVideo = document.getElementById('webcamVideo');
    const callButton = document.getElementById('callButton');
    const callInput = document.getElementById('callInput');
    const answerButton = document.getElementById('answerButton');
    const remoteVideo = document.getElementById('remoteVideo');
    const hangupButton = document.getElementById('hangupButton');
    // 1. Setup media sources

    webcamButton.onclick = async () => {
      localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      remoteStream = new MediaStream();

      // Push tracks from local stream to peer connection
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });

      // Pull tracks from remote stream, add to video stream
      pc.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.addTrack(track);
        });
      };

      webcamVideo.srcObject = localStream;
      remoteVideo.srcObject = remoteStream;

      callButton.disabled = false;
      answerButton.disabled = false;
      webcamButton.disabled = true;
    };

    // 2. Create an offer
    callButton.onclick = async () => {
      // Reference Firestore collections for signaling
      const callDoc = doc(collection(db, "calls"));
      const offerCandidates = collection(db,'calls',callDoc.id,'offerCandidates');
      const answerCandidates = collection(db,'calls',callDoc.id,'answerCandidates');

      callInput.value = callDoc.id;

      // Get candidates for caller, save to db
      pc.onicecandidate = (event) => {
        event.candidate && addDoc(offerCandidates,event.candidate.toJSON());
      };

      // Create offer
      const offerDescription = await pc.createOffer();
      await pc.setLocalDescription(offerDescription);

      const offer = {
        sdp: offerDescription.sdp,
        type: offerDescription.type,
      };

      await setDoc(callDoc,{offer});

      // Listen for remote answer
      onSnapshot(callDoc,(snapshot) => {
        const data = snapshot.data();
        if (!pc.currentRemoteDescription && data?.answer) {
          const answerDescription = new RTCSessionDescription(data.answer);
          pc.setRemoteDescription(answerDescription);
        }
      });

      // When answered, add candidate to peer connection
      onSnapshot(query(answerCandidates),(snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const candidate = new RTCIceCandidate(change.doc.data());
            pc.addIceCandidate(candidate);
          }
        });
      });

      hangupButton.disabled = false;
    };

    // 3. Answer the call with the unique ID
    answerButton.onclick = async () => {
      const callId = callInput.value;
      const callDoc = doc(db,'calls',callId);
      const offerCandidates = collection(db,'calls',callId,'offerCandidates');
      const answerCandidates = collection(db,'calls',callId,'answerCandidates');

      pc.onicecandidate = (event) => {
        event.candidate && addDoc(answerCandidates,event.candidate.toJSON());
      };

      const callData = (await getDoc(callDoc)).data();
      console.log(callData)

      const offerDescription = callData.offer;
      await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

      const answerDescription = await pc.createAnswer();
      await pc.setLocalDescription(answerDescription);

      const answer = {
        type: answerDescription.type,
        sdp: answerDescription.sdp,
      };

      await updateDoc(callDoc,{answer});

      onSnapshot(query(offerCandidates),(snapshot) => {
        snapshot.docChanges().forEach((change) => {
          console.log(change);
          if (change.type === 'added') {
            let data = change.doc.data();
            pc.addIceCandidate(new RTCIceCandidate(data));
          }
        });
      });
    };
  },[])

  return (
    <div className="App">
      <header className="App-header">
        <h2>webRTC basics</h2>
      </header>
      <div className="videos">
        <span>
          <video id="webcamVideo" autoPlay playsInline></video>
          <div>
            <button id="webcamButton">Start webcam</button>
            <button id="callButton" disabled>Start Call</button>
            <button id="hangupButton" disabled>Leave Call</button>
          </div>
        </span>
        <span>
          <video id="remoteVideo" autoPlay playsInline></video>
          <p>Join from a different browser window or device</p>
          <input id="callInput" />
          <button id="answerButton" disabled>Join Call</button>
        </span>
      </div>
    </div>
  );
}

export default App;
