export interface wingInterface {
    width: number;
    height: number;
}

export class Blade {
    constructor(private spin: boolean, private slant: string, private wing1: wingInterface, private wing2: wingInterface) {}

    startSpin() {
        this.spin = true;
    }
    stopSpin() {
        this.spin = false;
    }
}