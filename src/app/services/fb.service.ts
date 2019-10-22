import { Injectable } from '@angular/core';
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

  peer;

  constructor(private db: AngularFirestore, private afAuth: AngularFireAuth, private router: Router) {}

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

  // peer management

  createPeer(gameId) {
    location.hash = '#'+gameId;
    this.peer = new SimplePeer({
      initiator: location.hash === '#'+gameId,
      trickle: false
    });
    this.peer.on('error', err => console.log('error', err));
    this.peer.on('signal', data => {
      console.log('SIGNAL', JSON.stringify(data));
      //this needs to be sent to firestore
    });
    this.peer.on('connect', () => {
      console.log('CONNECT')
      this.peer.send('whatever' + Math.random())
    })
    this.peer.on('data', data => {
      console.log('data: ' + data)
    })
  }

  peerSignal(val) {
    this.peer.signal(JSON.parse(val));
  }

}
