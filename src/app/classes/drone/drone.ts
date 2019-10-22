import { Blade } from './blade';
import { Body } from './body';
import { PlayerInterface } from '../player/player';

/*
    Each player controls one of the drone fans
    A ----- B
    '       '
    '       '
    C ----- D
*/

export class Drone {
    private bladeA: Blade;
    private bladeB: Blade;
    private bladeC: Blade;
    private bladeD: Blade;
    private droneBody: Body;

    constructor(p1: PlayerInterface, p2: PlayerInterface, p3: PlayerInterface, p4: PlayerInterface, droneColor: string) {
        this.bladeA = new Blade(false, 'UL', { width: 10, height: 30 }, { width: 10, height: 30 });
        this.bladeB = new Blade(false, 'UR', { width: 10, height: 30 }, { width: 10, height: 30 });
        this.bladeC = new Blade(false, 'DL', { width: 10, height: 30 }, { width: 10, height: 30 });
        this.bladeD = new Blade(false, 'DR', { width: 10, height: 30 }, { width: 10, height: 30 });
        this.droneBody = new Body(50, 50, droneColor, { 
            b1: { pid: p1.uid, bladeId: 'A' },
            b2: { pid: p2.uid, bladeId: 'B' },
            b3: { pid: p3.uid, bladeId: 'C' },
            b4: { pid: p4.uid, bladeId: 'D' }, 
        });
    }

    moveUp() {
        this.bladeA.startSpin();
        this.bladeB.startSpin();
        this.bladeC.stopSpin();
        this.bladeD.stopSpin();
    }
    moveUpRight() {
        this.bladeA.startSpin();
        this.bladeB.startSpin();
        this.bladeC.stopSpin();
        this.bladeD.startSpin();
    }
    moveRight() {
        this.bladeA.stopSpin();
        this.bladeB.startSpin();
        this.bladeC.stopSpin();
        this.bladeD.startSpin();
    }
    moveRightDown() {
        this.bladeA.stopSpin();
        this.bladeB.startSpin();
        this.bladeC.startSpin();
        this.bladeD.startSpin();
    }
    moveDown() {
        this.bladeA.stopSpin();
        this.bladeB.stopSpin();
        this.bladeC.startSpin();
        this.bladeD.startSpin();
    }
    moveLefDown() {
        this.bladeA.startSpin();
        this.bladeB.stopSpin();
        this.bladeC.startSpin();
        this.bladeD.startSpin();
    }
    moveLeft() {
        this.bladeA.startSpin();
        this.bladeB.stopSpin();
        this.bladeC.startSpin();
        this.bladeD.stopSpin();
    }
    moveUpLeft() {
        this.bladeA.startSpin();
        this.bladeB.startSpin();
        this.bladeC.startSpin();
        this.bladeD.stopSpin();
    }
    lift() {
        this.bladeA.startSpin();
        this.bladeB.startSpin();
        this.bladeC.startSpin();
        this.bladeD.startSpin();
    }
    drop() {
        this.bladeA.stopSpin();
        this.bladeB.stopSpin();
        this.bladeC.stopSpin();
        this.bladeD.stopSpin();
    }
}