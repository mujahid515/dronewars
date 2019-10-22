export interface PlayerInterface {
    uid: string;
    firstName: string;
    lastName: string;
    bladeID: string;
}

export interface BladeState {
    bladeID: string;
    bladeState: boolean;
}

export interface User {
    uid: string;
    firstName: string;
    lastName: string;
    email: string;
}

export class Player {
    private bladeState: boolean;

    constructor(private player: PlayerInterface) {}

    startBlade() {
        this.bladeState = true;
        let resp: BladeState = { bladeID: this.player.bladeID, bladeState: this.bladeState }
        return resp;
    }
    stopBlade() {
        this.bladeState = false;
        let resp: BladeState = { bladeID: this.player.bladeID, bladeState: this.bladeState }
        return resp;
    }

    getPlayer() {
        return this.player;
    }
}