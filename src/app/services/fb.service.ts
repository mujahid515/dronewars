import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Game, GameDB } from '../classes/game/game';
import { PlayerInterface, User } from '../classes/player/player';
import { Router } from '@angular/router';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable, BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import Swal from 'sweetalert2';
import * as firebase from 'firebase/app';
import * as SimplePeer from 'simple-peer';

@Injectable({
  providedIn: 'root'
})
export class FbService {

  gameBS: BehaviorSubject<any[]>; //used for live games
  private gameDoc: AngularFirestoreDocument<GameDB>;
  game: Observable<GameDB>;
  games: BehaviorSubject<any[]>;

  private userDoc: AngularFirestoreDocument<User>;
  user: Observable<User>;
  
  private gameObj: Game;

  peer: SimplePeer.Instance;
  guestPeers: SimplePeer.Instance[] = [];
  locationHash: string;

  endpoint = 'https://us-central1-dronemazewars.cloudfunctions.net/';

  constructor(private db: AngularFirestore, private afAuth: AngularFireAuth, private router: Router, private http: HttpClient) {}

  //Auth management

  createUser(email, password, firstName, lastName) {
    var prom = new Promise((resolve, reject) => {
      this.afAuth.auth.createUserWithEmailAndPassword(email, password).catch((error) => {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        if (errorCode == 'auth/weak-password') {
          alert('The password is too weak.');
        } else {
          alert(errorMessage);
        }
        console.log(error);
      }).then((data) => {
        if(data !== undefined) {
          var obj = {
            uid: data['user']['uid'],
            firstName: firstName,
            lastName: lastName,
            email: email
          }
          this.db.collection('users').doc(data['user']['uid']).set(obj)
          .then(() => {
            console.log("Document successfully written!");
            var resp = this.login(email, password);
            if(resp) {
              this.getUser(data['user']['uid']);
              resolve(true);
            } else {
              resolve(false);
            }
          })
          .catch((error) => {
              console.error("Error writing document: ", error);
              resolve(false);
          });
        } else {
          resolve(false);
        }
      })
    });
    return prom;
  }

  login(email, password) {
    var prom = new Promise((resolve, reject) => {
      //this.afAuth.auth.signInWithPopup(new auth.GoogleAuthProvider());
      this.afAuth.auth.signInWithEmailAndPassword(email, password).catch((error) => {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        if (errorCode === 'auth/wrong-password') {
          alert('Wrong password.');
        } else {
          alert(errorMessage);
        }
        console.log(error);
        resolve(false);
      }).then((data) => {
        if(data !== undefined) {
          this.getUser(data['user']['uid']);
          resolve(true);
        } else {
          resolve(false);
        }
      })
    });
    return prom;
  }

  logout() {
    this.afAuth.auth.signOut();
  }

  isUserLoggedIn() {
    var prom = new Promise((resolve, reject) => {
      this.afAuth.auth.onAuthStateChanged((user) => {
        if (user) {
          resolve(user.uid);
        } else {
          resolve(false);
        }
      });
    })
    return prom;
  }

  getUser(uid) {
    this.userDoc = this.db.doc<User>(`users/${uid}`);
    this.user = this.userDoc.valueChanges();
  }

  // game management

  newGameObj(p1: PlayerInterface, p2: PlayerInterface, p3: PlayerInterface, p4: PlayerInterface, droneColor: string, difficultyNumber: string, location: string): void {
    this.gameObj = new Game(p1, p2, p3, p4, droneColor, difficultyNumber, location);
  }
  startGameObj(): void {
    this.gameObj.startGame();
  }
  goToPage(val: string): void {
    this.router.navigate([val]);
  }
  getGameObj() {
    return this.gameObj;
  }

  // CRUD

  //add document and return promise with generated doc id
  addDoc(col, obj) {
    var prom = new Promise((resolve, reject) => {
      this.db.collection(col).add(obj)
      .then((docRef) => {
          resolve(docRef.id);
      })
      .catch((error) => {
          console.error("Error adding document: ", error);
          resolve(error);
      });
    });
    return prom;
  }
  
  //Set a document (destructive) 

  setDoc(col, id, obj) {
    this.db.collection(col).doc(id).set(obj)
    .then(() => {
        console.log("Document successfully written!");
    })
    .catch((error) => {
        console.error("Error writing document: ", error);
    });
  }

  //Set a document with merge (destructive)

  setDocMerge(col, id, obj) {
    this.db.collection(col).doc(id).set(obj, { merge: true })
    .then(() => {
        console.log("Document successfully written!");
    })
    .catch((error) => {
        console.error("Error writing document: ", error);
    });
  }

  // array update

  arrayUpdate(col, id, field, oldObj, newObj) {
    this.db.collection(col).doc(id).update({ [field]: firebase.firestore.FieldValue.arrayRemove(oldObj)})
    .then(() => {
        console.log("Old object in array removed!");
        this.db.collection(col).doc(id).update({ [field]: firebase.firestore.FieldValue.arrayUnion(newObj)})
        .then(() => {
            console.log("New object added to array!");
        })
        .catch((error) => {
            console.error("Error updating document: ", error);
        });
    })
    .catch((error) => {
        console.error("Error updating document: ", error);
    });
  }

  // get Game

  getGame(gid, gameBS) {
    var prom = new Promise((resolve, reject) => {
      this[gameBS] = this.db.collection('games', ref => ref.where('gid', '==', gid)).valueChanges();
      this.gameDoc = this.db.doc<GameDB>(`games/${gid}`);
      this.game = this.gameDoc.valueChanges();
      this.game.pipe(take(1)).subscribe((gameData) => {
        if(gameData) {
          resolve(gameData);
        } else {
          resolve(false);
        }
      });
    })
    return prom;
  }

  // Get query

  getColQ2(col, query1, value1, query2, value2) {
    this[col] = this.db.collection(col, ref => ref.where(query1, '==', value1).where(query2, '==', value2)).valueChanges();
    var prom = new Promise((resolve, reject) => {
      this[col].pipe(take(1)).subscribe((data) => {
        if(data) {
          resolve(data);
        } else {
          resolve(false);
        }
      })
    });
    return prom;
  }

  //Delete a document

  deleteDoc(col, docId) {
    this.db.collection(col).doc(docId).delete().then(() => {
        console.log("Document successfully deleted!");
    }).catch((error) => {
        console.error("Error removing document: ", error);
    });
  }

  // Swal
  fireSwal(title, text, type) {
    Swal.fire({
      title: title,
      text: text,
      type: type
    })
  }

  // peer management new

  cfCreateHostPeer(gid: string, uid: string) {
    var prom = new Promise((resolve, reject) => {
      let url = this.endpoint + 'createHostPeer';
      let body = { gid: gid, uid: uid };
      let newPost = this.http.post(url, JSON.stringify(body)).pipe(take(1)).subscribe((subData) => {
        //subData
        console.log('create host peer: ', subData);
      }, (error) => {
        resolve(error);
      }, () => {
        resolve({ ok: true });
      });
    });
    return prom;
  }
  
  cfHostSignalGuest(signalData: string) {
    var prom = new Promise((resolve, reject) => {
      let url = this.endpoint + 'hostSignalGuest';
      let body = { signalData: signalData };
      let newPost = this.http.post(url, JSON.stringify(body)).pipe(take(1)).subscribe((subData) => {
        //subData
        console.log('create host peer: ', subData);
      }, (error) => {
        resolve(error);
      }, () => {
        resolve({ ok: true });
      });
    });
    return prom;
  }

  cfHostSendData(data: object) {
    var prom = new Promise((resolve, reject) => {
      let url = this.endpoint + 'hostSendData';
      let body = { data: data };
      let newPost = this.http.post(url, JSON.stringify(body)).pipe(take(1)).subscribe((subData) => {
        //subData
        console.log('host send data: ', subData);
      }, (error) => {
        resolve(error);
      }, () => {
        resolve({ ok: true });
      });
    });
    return prom;
  }

  cfGuestSendData(data: object) {
    var prom = new Promise((resolve, reject) => {
      let url = this.endpoint + 'guestSendData';
      let body = { data: data };
      let newPost = this.http.post(url, JSON.stringify(body)).pipe(take(1)).subscribe((subData) => {
        //subData
        console.log('guest send data: ', subData);
      }, (error) => {
        resolve(error);
      }, () => {
        resolve({ ok: true });
      });
    });
    return prom;
  }
  
  cfCreateGuestPeer(signalData: string, gid: string, peerNum: string, uid: string) {
    var prom = new Promise((resolve, reject) => {
      let url = this.endpoint + 'createGuestPeer';
      let body = { signalData: signalData, gid: gid, peerNum: peerNum, uid: uid };
      let newPost = this.http.post(url, JSON.stringify(body)).pipe(take(1)).subscribe((subData) => {
        //subData
        console.log('create guest peer: ', subData);
      }, (error) => {
        resolve(error);
      }, () => {
        resolve({ ok: true });
      });
    });
    return prom;
  }
}
