import { Component, OnInit } from '@angular/core';
import { Game } from '../../classes/game/game';
import { PlayerInterface } from '../../classes/player/player';
import { FbService } from '../../services/fb.service';

@Component({
  selector: 'app-new',
  templateUrl: './new.component.html',
  styleUrls: ['./new.component.css']
})
export class NewComponent implements OnInit {

  constructor(private fb: FbService) {}

  ngOnInit() {
  }
  
  initGame() {
      let p1: PlayerInterface = this.getPlayer(1);
      let p2: PlayerInterface = this.getPlayer(2);
      let p3: PlayerInterface = this.getPlayer(3);
      let p4: PlayerInterface = this.getPlayer(4);
      let droneColor: string = this.getInputVal('droneColor');
      let difficultyString: string = this.getInputVal('mazeDifficulty');
      let difficultyNumber: number = +difficultyString;
      let location: string = this.getInputVal('mazeLocation');
      this.fb.newGameObj(p1, p2, p3, p4, droneColor, difficultyNumber, location);
      this.fb.startGameObj();
      this.fb.goToPage('game'); //should be awaiting page
  }
  
  getPlayer(val: number) {
      let uid = this.getInputVal('uid'+val);
      let firstName = this.getInputVal('firstName'+val);
      let lastName = this.getInputVal('lastName'+val);
      let pBlade = this.getInputVal('pBlade'+val);
      let player: PlayerInterface = { uid: uid, firstName: firstName, lastName: lastName, bladeID: pBlade }
      return player;
  }
  
  getInputVal(inputID) {
      let val = (<HTMLInputElement>document.getElementById(inputID)).value;
      return val;
  }

}
