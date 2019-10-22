export interface BladePlayerID {
    pid: string;
    bladeId: string;
}

export interface BladeHoldersInterface {
    b1: BladePlayerID;
    b2: BladePlayerID;
    b3: BladePlayerID;
    b4: BladePlayerID;
}

export class Body {
    constructor(private width: number, private height: number, private color: string, private bladeHolders: BladeHoldersInterface) {}
}