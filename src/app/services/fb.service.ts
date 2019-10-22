import { Injectable } from '@angular/core';
import { Game } from '../classes/game/game';
import { PlayerInterface } from '../classes/player/player';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class FbService {

  private gameObj: Game;

  constructor(private router: Router) {}

  newGameObj(p1: PlayerInterface, p2: PlayerInterface, p3: PlayerInterface, p4: PlayerInterface, droneColor: string, difficultyNumber: number, location: string): void {
    this.gameObj = new Game(p1, p2, p3, p4, droneColor, difficultyNumber, location);
  }
  startGameObj(): void {
    this.gameObj.startGame();
  }
  goToPage(val: string): void {
    this.router.navigate([val]);
  }
}
