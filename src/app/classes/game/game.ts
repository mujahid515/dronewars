import { Drone } from '../drone/drone';
import { Player, PlayerInterface } from '../player/player';
import { Grid } from '../maze/grid';

export class Game {

    private player1: Player;
    private player2: Player;
    private player3: Player;
    private player4: Player;
    private drone: Drone;
    private maze: Grid;

    constructor(
        private p1: PlayerInterface,
        private p2: PlayerInterface,
        private p3: PlayerInterface,
        private p4: PlayerInterface,
        private droneColor: string,
        private difficulty: number,
        private location: string
    ) {
        this.player1 = new Player(p1);
        this.player2 = new Player(p2);
        this.player3 = new Player(p3);
        this.player4 = new Player(p4);
        this.drone = new Drone(p1, p2, p3, p4, droneColor);
        this.maze = new Grid(this.difficulty, this.location);
    }

    startGame() {
        console.log('game start: ', this.drone);
        console.log('maze: ', this.maze);
    }
    stopGame() {
        console.log('end start: ', this.drone);
    }
    openExit() {
        // set G2 bottom true
        this.maze.openExit();
    }
    closeExit() {
        // set G2 bottom false
        this.maze.closeExit();
        // explode bombs
        this.maze.explodeBombs();
    }
}