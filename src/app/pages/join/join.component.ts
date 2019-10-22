import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs/operators';
import { GameDB, PlayersObj } from '../../classes/game/game';
import { User } from '../../classes/player/player';
import { FbService } from '../../services/fb.service';

@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.css']
})
export class JoinComponent implements OnInit {

  privateGameSwitch: boolean = false;
  publicGameSwitch: boolean = false;
  privateGameCode: string = '';
  currentUser: User;
  games;

  constructor(public fb: FbService) { }

  ngOnInit() {
    this.getPublicGames();
    this.fb.isUserLoggedIn().then((resp) => {
      if(resp) {
        this.fb.getUser(resp);
        this.fb.user.pipe(take(1)).subscribe((userData) => {
          this.currentUser = userData;
        });
      }
    });
  }

  getPublicGames() {
    this.fb.getColQ2('games', 'active', false, 'openTo', 'Public').then((gamesData) => {
      this.games = gamesData;
    });
  }

  joinPrivateGame() {
    this.privateGameSwitch = true;
    this.publicGameSwitch = false;
  }

  joinPublicGame() {
    this.publicGameSwitch = true;
    this.privateGameSwitch = false;
    if(this.games.length < 1) {
      this.getPublicGames();
    }
  }

  goToGame(gameCode: string) {
    this.fb.getGame(gameCode, 'gameBS').then((gameData: GameDB) => {
      var playerAlreadyExist = gameData.players.filter(x => (x.uid === this.currentUser.uid));
      if(gameData.players[0].uid != this.currentUser.uid && playerAlreadyExist.length == 0) {
        //add player to game players list
        var bladeID = 'B';
        if(gameData.players.length == 2) {
          bladeID = 'C';
        } else if(gameData.players.length == 3) {
          bladeID = 'D';
        }
        var newPlayer: PlayersObj = {
          active: false,
          firstName: this.currentUser.firstName,
          lastName: this.currentUser.lastName,
          uid: this.currentUser.uid,
          bladeID: bladeID
        }
        gameData.players.push(newPlayer);
        this.fb.setDocMerge('games', gameData.gid, gameData);
        //navigate to awaiting page
        this.fb.goToPage('awaiting');
      } else if(gameData.players.length == 4) {
        // too many players in this game!
        this.fb.fireSwal('Error', 'There are already 4 players in this game!', 'error');
      } else {
        this.fb.goToPage('awaiting');
      }
    })
  }

}
