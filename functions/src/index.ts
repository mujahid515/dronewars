import * as functions from 'firebase-functions';
import * as SimplePeer from 'simple-peer';
import * as firebase from 'firebase';
import 'firebase/firestore';
const cors = require('cors')({origin: true});
const wrtc = require('wrtc');

const firebaseConfig = {
    apiKey: "AIzaSyBgw85WWFbIXwl2-vjrYepxlb_5t9jjW0A",
    authDomain: "dronemazewars.firebaseapp.com",
    databaseURL: "https://dronemazewars.firebaseio.com",
    projectId: "dronemazewars",
    storageBucket: "dronemazewars.appspot.com",
    messagingSenderId: "294525620504",
    appId: "1:294525620504:web:9f0020c8ab21874dba8e6d",
    measurementId: "G-DJ006ZE2JR"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let peer: SimplePeer.Instance;
const guestPeers: Array<any> = [];

//data: { gid: string, uid: string }
exports.createHostPeer = functions.https.onRequest((req, res) => {
    cors(req, res, async() => {
        const body = JSON.parse(req.body);
        const docRef = db.doc(`games/${body.gid}`);
        await docRef.update({ gid: body.gid });
        const prom = new Promise((resolve, reject) => {
            peer = new SimplePeer({
                initiator: true,
                trickle: false,
                wrtc: wrtc
            });
            peer.on('error', err => console.log('error', err));
            peer.on('connect', () => {
                console.log(JSON.stringify("Host Connect"));
            })
            peer.on('data', d => {
                console.log(JSON.stringify('data: ' + d));
            })
            peer.on('signal', async(d) => {
                console.log('SIGNAL', JSON.stringify(d));
                //this needs to be sent to firestore
                const docRef2 = db.doc(`games/${body.gid}`);
                await docRef2.set({ peer1: { uid: body.uid, signal: JSON.stringify(d) } }, { merge: true });
                //maybe when peer1.signal is populated trigger a cloud function?
                //res.send(JSON.stringify("document successfully written on signal!"));
            });
            resolve("document successfully updated!");
        });
        prom.then((resolveData) => {
            res.send(JSON.stringify('resolved: ' + resolveData));
        }).catch((error) => {
            res.send(JSON.stringify('error: ' + error));
        });
    });
});

//data: { signalData: string }
exports.hostSignalGuest = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        const body = JSON.parse(req.body);
        peer.signal(body.signalData);
        res.send(JSON.stringify("host signaled guest!"));
    });
});

//data: { stuff: object }
exports.hostSendData = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        const body = JSON.parse(req.body);
        for (const i of guestPeers) {
            console.log('[i]: ', i);
            i.send(JSON.stringify(body.stuff));
        }
        res.send(JSON.stringify("host sent data!"));
    });
});

//data: { stuff: object }
exports.guestSendData = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        const body = JSON.parse(req.body);
        peer.send(JSON.stringify(body.stuff));
        res.send(JSON.stringify("guest sent data!"));
    });
});

//data: { signalData: string, gid: string, peerNum: string, uid: string }
exports.createGuestPeer = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        const body = JSON.parse(req.body);
        const prom = new Promise((resolve, reject) => {
            const guestPeer = new SimplePeer({
                initiator: false,
                trickle: false,
                wrtc: wrtc
            });
            guestPeer.on('error', err => console.log('error', err));
            guestPeer.on('connect', () => {
                console.log('GUEST CONNECT')
            })
            guestPeer.on('data', d => {
                console.log('data: ' + d)
            })
            guestPeer.on('signal', (d) => {
                console.log('SIGNAL', JSON.stringify(d));
                //this needs to be sent to firestore
                const docRef = db.doc(`games/${body.gid}`);
                if(body.peerNum === 'peer2') {
                    docRef.set({ peer2: { uid: body.uid, signal: JSON.stringify(d) } }, { merge: true }).then((data) => {
                        console.log('peer 2 signal added: ', data);
                    }).catch((error) => {
                        console.log('peer 2 not added: ', error);
                    });
                } else if(body.peerNum === 'peer3') {
                    docRef.set({ peer3: { uid: body.uid, signal: JSON.stringify(d) } }, { merge: true }).then((data) => {
                        console.log('peer 3 signal added: ', data);
                    }).catch((error) => {
                        console.log('peer 3 not added: ', error);
                    });
                } else if(body.peerNum === 'peer4') {
                    docRef.set({ peer4: { uid: body.uid, signal: JSON.stringify(d) } }, { merge: true }).then((data) => {
                        console.log('peer 4 signal added: ', data);
                    }).catch((error) => {
                        console.log('peer 4 not added: ', error);
                    });
                } 
                peer.signal(JSON.stringify(d));
                //res.send(JSON.stringify("guest signal: " + d));
            });
            guestPeers.push(guestPeer);
            resolve('host signaled guest!');
        });
        prom.then((resolveData) => {
            res.send(JSON.stringify('resolved: ' + resolveData));
        }).catch((error) => {
            res.send(JSON.stringify('error: ' + error));
        })
    });
});



