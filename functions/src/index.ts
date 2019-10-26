import * as functions from 'firebase-functions';
import * as SimplePeer from 'simple-peer';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

let peer: SimplePeer.Instance;
const guestPeers: SimplePeer.Instance[] = [];

//data: { gid: string, uid: string }
exports.createHostPeer = functions.https.onRequest(async (req, res) => {
    res.header('Content-Type','application/json');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'POST');

    //respond to CORS preflight requests
    if (req.method === 'POST' || req.method === 'OPTIONS') {
        res.status(204).send('its cool');
    }

    let body = JSON.parse(req.body);
    console.log('body: ', body);

    await db.collection('games').doc(`${body.gid}`).set({ gid: body.gid }, { merge: true }).then(() => {
        console.log("Document successfully written!");
        peer = new SimplePeer({
            initiator: location.hash === '#host',
            trickle: false
        });
        peer.on('error', err => console.log('error', err));
        peer.on('connect', () => {
            console.log('HOST CONNECT');
        })
        peer.on('data', d => {
            console.log('data: ' + d)
        })
        peer.on('signal', d => {
            console.log('SIGNAL', JSON.stringify(d));
            //this needs to be sent to firestore
            db.doc(`games/${body.gid}`).set({ peer1: { uid: body.uid, signal: JSON.stringify(d) } }, { merge: true }).then(() => {
                console.log('document successfully written!');
            }).catch((error) => {
                console.error("Error writing document: ", error);
            })
        });
    })
    .catch((error) => {
        console.error("Error writing document: ", error);
    });
});

//data: { signalData: string }
exports.hostSignalGuest = functions.https.onRequest((req, res) => {
    res.header('Content-Type','application/json');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'POST');

    //respond to CORS preflight requests
    if (req.method === 'POST' || req.method === 'OPTIONS') {
        res.status(204).send('its cool');
    }

    peer.signal(JSON.parse(req.query.signalData));
});

//data: { stuff: object }
exports.hostSendData = functions.https.onRequest((req, res) => {
    res.header('Content-Type','application/json');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'POST');

    //respond to CORS preflight requests
    if (req.method === 'POST' || req.method === 'OPTIONS') {
        res.status(204).send('its cool');
    }

    for (const i of req.query.guestPeers) {
        console.log('[i]: ', i);
        i.send(JSON.stringify(req.query.stuff));
    }
});

//data: { stuff: object }
exports.guestSendData = functions.https.onRequest((req, res) => {
    res.header('Content-Type','application/json');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'POST');

    //respond to CORS preflight requests
    if (req.method === 'POST' || req.method === 'OPTIONS') {
        res.status(204).send('its cool');
    }

    peer.send(JSON.stringify(req.query.stuff));
});

//data: { signalData: string, gid: string, peerNum: string, uid: string }
exports.createGuestPeer = functions.https.onRequest((req, res) => {
    res.header('Content-Type','application/json');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'POST');

    //respond to CORS preflight requests
    if (req.method === 'POST' || req.method === 'OPTIONS') {
        res.status(204).send('its cool');
    }

    const guestPeer = new SimplePeer();
    guestPeer.on('error', err => console.log('error', err));
    guestPeer.on('connect', () => {
        console.log('GUEST CONNECT')
    })
    guestPeer.on('data', d => {
        console.log('data: ' + d)
    })
    guestPeer.signal(JSON.parse(req.query.signalData));
    guestPeer.on('signal', d => {
        console.log('SIGNAL', JSON.stringify(d));
        //this needs to be sent to firestore
        void db.doc(`games/${req.query.gid}`).set({ [req.query.peerNum]: { uid: req.query.uid, signal: JSON.stringify(d) } }, { merge: true });
    });
    guestPeers.push(guestPeer);
});



