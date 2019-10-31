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

let peerSignal = '';

let peer = new SimplePeer({
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
    peerSignal = JSON.stringify(d);
    //await something to be added to peer2.signal then fire...
    exports.triggerPeerReply;
});

const guestPeers: Array<any> = [];

//data: { gid: string, uid: string }
exports.createHostPeer = functions.https.onRequest((req, res) => {
    cors(req, res, async() => {
        const body = JSON.parse(req.body);
        const docRef = db.doc(`games/${body.gid}`);
        await docRef.update({ gid: body.gid });
        const prom = new Promise(async(resolve, reject) => {
            const docRef2 = db.doc(`games/${body.gid}`);
            await docRef2.update({ peer1: { uid: body.uid, signal: peerSignal } });
            resolve("document successfully updated!");
        });
        prom.then((resolveData) => {
            res.send(JSON.stringify('resolved: ' + resolveData));
        }).catch((error) => {
            res.send(JSON.stringify('error: ' + error));
        });
    });
});

exports.triggerPeerReply = functions.firestore.document('games/{gid}').onUpdate((change, context) => {
    const previousValue = change.before.data();
    const newValue = change.after.data();
    if(previousValue && newValue) {
        if(!newValue.active && newValue.peer2.signal !== '' && previousValue.peer2.signal === '') {
            peer.signal(JSON.stringify(newValue.peer2.signal)); 
        } else if(!newValue.active && newValue.peer3.signal !== '' && previousValue.peer3.signal === '') {
            peer.signal(JSON.stringify(newValue.peer3.signal)); 
        } else if(!newValue.active && newValue.peer4.signal !== '' && previousValue.peer4.signal === '') {
            peer.signal(JSON.stringify(newValue.peer4.signal)); 
        }
    }
});

//data: { signalData: string, peerNum: string }
exports.hostSignalGuest = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        const body = JSON.parse(req.body);
        peer.signal(JSON.stringify(body.signalData));
        res.send(JSON.stringify("host signaled guest!"));
    });
});

//data: { stuff: object }
exports.hostSendData = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        const body = JSON.parse(req.body);
        for (const i of guestPeers) {
            console.log('[i]: ', i);
            if(i.peer2) {
                i.peer2.send(JSON.stringify(body.stuff));
            } else if(i.peer3) {
                i.peer3.send(JSON.stringify(body.stuff));
            } else if(i.peer4) {
                i.peer4.send(JSON.stringify(body.stuff));
            }
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
    cors(req, res, async() => {
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
            guestPeer.on('signal', async(d) => {
                console.log('SIGNAL', JSON.stringify(d));
                //this needs to be sent to firestore
                const docRef2 = db.doc(`games/${body.gid}`);
                await docRef2.update({ [body.peerNum]: { uid: body.uid, signal: JSON.stringify(d) } });
            });
            guestPeer.signal(body.signalData);
            guestPeers.push({ [body.peerNum]: guestPeer});
            resolve('host signaled guest!');
        });
        prom.then((resolveData) => {
            res.send(JSON.stringify('resolved: ' + resolveData));
        }).catch((error) => {
            res.send(JSON.stringify('error: ' + error));
        })
    });
});



