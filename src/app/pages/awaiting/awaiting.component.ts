import { Component, OnInit } from '@angular/core';
import { Game, GameDB } from '../../classes/game/game';
import { PlayerInterface, User } from '../../classes/player/player';
import { FbService } from '../../services/fb.service';
import { take } from 'rxjs/operators';
import { Lists } from '../../lists/lists';

@Component({
  selector: 'app-awaiting',
  templateUrl: './awaiting.component.html',
  styleUrls: ['./awaiting.component.css']
})
export class AwaitingComponent implements OnInit {

  currentUser: User;
  atLeastFour = false;

  private p1: PlayerInterface;
  private p2: PlayerInterface;
  private p3: PlayerInterface;
  private p4: PlayerInterface;
  private droneColor: string;
  private mazeDifficulty: string;
  private mazeLocation: string;

  listsObj = new Lists();
  droneColorList = this.listsObj.droneColorList;
  mazeDifficultyList = this.listsObj.mazeDifficultyList;
  mazeLocationList = this.listsObj.mazeLocationList;
  bladeIdList = this.listsObj.bladeIdList;

  messageToPlayers: string;

  constructor(public fb: FbService) { }

  ngOnInit() {
    if(!this.fb.game) {
      this.fb.goToPage('/');
    } else {
      this.fb.isUserLoggedIn().then((resp) => {
        if(resp) {
          this.fb.getUser(resp);
          this.fb.user.pipe(take(1)).subscribe((userData) => {
            this.currentUser = userData;
          });
        }
      });
    }
  }

  updateHash(gid) {
    //update location.hash to game id
    location.hash = '#'+gid;
  }

  initGame(gameObj) {
      this.droneColor = gameObj.droneColor;
      this.mazeDifficulty = gameObj.mazeDifficulty;
      this.mazeLocation = gameObj.mazeLocation;
      this.fb.newGameObj(this.p1, this.p2, this.p3, this.p4, this.droneColor, this.mazeDifficulty, this.mazeLocation);
      this.fb.startGameObj();
  }

  startGame(gameObj) {
    console.log('gameObj: ', gameObj);
    //minimum of 2 players required
    if(gameObj.players.length > 1 && this.atLeastFour) {
      gameObj.active = true;
      this.initGame(gameObj);
      this.fb.setDoc('games', gameObj.gid, gameObj);
      this.fb.goToPage('game');
    }
  }

  startGameForGuest(gameObj) {
    if(this.currentUser.uid != gameObj.host) {
      console.log('emitVal: ', gameObj);
      // send accepted player this.fb.gameObj via webRTC when the game starts
      this.fb.goToPage('game');
    }
  }

  cancelGame(gameObj: GameDB) {
    //host user
    if(gameObj.host == this.currentUser.uid) {
      //if there is another player in gameObj.players[1] make them the host
      if(gameObj.players.length > 1) {
        for(let i = 0; i < gameObj.players.length; i++) {
          if(gameObj.players[i].uid != gameObj.host) {
            gameObj.players[i].active = true;
            break;
          }
        }
        //remove old host from gameObj.players list
        gameObj.players = gameObj.players.filter(item => item.uid !== gameObj.host);
        console.log('gameObj.players: ', gameObj.players);
        this.fb.setDoc('games', gameObj.gid, gameObj);
      } else {
      //else delete the game document
      this.fb.deleteDoc('games', gameObj.gid);
      this.fb.fireSwal('Success!', 'Your game has been deleted.', 'success');
      }
    } else { //guest user
      //remove from gameObj.players list
      gameObj.players = gameObj.players.filter(e => e.uid !== this.currentUser.uid);
      this.fb.setDoc('games', gameObj.gid, gameObj);
    }
    //navigate to home
    this.fb.goToPage('/');
  }

  acceptPlayer(gameObj: GameDB, uid) {
    this.acceptOrReject(gameObj, uid, true);
    // establish webRTC connection between host and the accepted player
    // this.fb.createPeer(gameObj.gid); // when you accept player signal the players signal data
    let signalData = '';
    if(gameObj.peer2.uid == uid) {
      signalData = gameObj.peer2.signal;
    } else if(gameObj.peer3.uid == uid) {
      signalData = gameObj.peer3.signal;
    } else if(gameObj.peer4.uid == uid) {
      signalData = gameObj.peer4.signal;
    }
    this.fb.cfHostSignalGuest(signalData).then((resp: any) => {
      if(resp.ok) {
        // disconnect accepted player from database connection
      } else {
        this.fb.fireSwal('Error!', resp.message, 'error');
        console.error('Host could not signal guest: ', resp);
      }
    });
  }

  rejectPlayer(gameObj, uid) {
    this.acceptOrReject(gameObj, uid, false);
  }

  sendMessageToPlayers(msg) {
    this.fb.cfHostSendData(msg).then((resp: any) => {
      if(resp.ok) {
        // message successfuly sent...
      } else {
        this.fb.fireSwal('Error!', resp.message, 'error');
        console.error('Could not message players: ', resp);
      }
    });
  }

  getPlayer(playerItem, i) {
      let player: PlayerInterface = { uid: playerItem.uid, firstName: playerItem.firstName, lastName: playerItem.lastName, bladeID: playerItem.bladeID }
      this['p'+i] = player;
  }

  removePlayer(i) {
    let player: PlayerInterface = { uid: '', firstName: '', lastName: '', bladeID: '' }
    this['p'+i] = player;
  }

  acceptOrReject(gameObj, uid, val) {
    for(let i = 0; i < gameObj.players.length; i++) {
      if(gameObj.players[i].uid == uid) {
        gameObj.players[i].active = val;
        if(val) {
          this.getPlayer(gameObj.players[i], i+1);
        } else if(!val) {
          this.removePlayer(i+1);
        }
      }
    }
    this.fb.setDoc('games', gameObj.gid, gameObj);
    this.atLeastFour = this.atLeastFourAccepted(gameObj.players);
  }

  atLeastFourAccepted(list) {
    //i is 1 because host [0] is always active
    var count = 1;
    for(let i = 1; i < list.length; i++) {
      if(list[i].active) {
        count++
      }
    }
    if(count == 4) {
      return true;
    } else {
      return false;
    }
  }

  doesItMatch(val1, val2) {
    if(val1 == val2) {
      return true;
    } else {
      return false;
    }
  }

  changeItem(key, e, id, playerData?) {
    if(key == 'bladeID') {
      let oldObj = {
        uid: playerData.uid,
        firstName: playerData.firstName,
        lastName: playerData.lastName,
        bladeID: playerData.bladeID,
        active: playerData.active
      }
      let newObj = {
        uid: playerData.uid,
        firstName: playerData.firstName,
        lastName: playerData.lastName,
        bladeID: playerData.bladeID,
        active: playerData.active
      }
      newObj.bladeID = e.target.value;
      this.fb.arrayUpdate('games', id, 'players', oldObj, newObj);
    } else {
      this.fb.setDocMerge('games', id, { [key]: e.target.value });
    }
  }

}
