// Each column has 1 box
interface Box {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
    crossUp: boolean;
    crossDown: boolean;
    star: boolean;
    bomb: boolean;
}

// Each row has 6 columns
interface Row {
    col1: Box;
    col2: Box;
    col3: Box;
    col4: Box;
    col5: Box;
    col6: Box;
}

// Each grid has 7 rows
interface MazeGrid {
    rowA: Row;
    rowB: Row;
    rowC: Row;
    rowD: Row;
    rowE: Row;
    rowF: Row;
    rowG: Row;
    image: string;
}

/*
      1 - 2 - 3 - 4 - 5 - 6
    A A1  A2  A3  A4  A5  A6
    B B1  B2  B3  B4  B5  B6
    C C1  C2  C3  C4  C5  C6
    D D1  D2  D3  D4  D5  D6
    E E1  E2  E3  E4  E5  E6
    F F1  F2  F3  F4  F5  F6
    G G1  G2  G3  G4  G5  G6
*/

export class Grid {

    private newMazeGrid: MazeGrid;

    constructor(private difficulty: string, private location: string) {
        this.createMaze(this.difficulty, this.location);
    }

    private getLocationImage(location: string) {
        //use location string to find an image from the database
        let image = 'http://www.cartooning.org.uk/CartoonStudio/images/CartoonMaps/aMaizin-cartoon-map.jpg';
        return image;
    }

    openExit() {
        // set G2 bottom true
        this.newMazeGrid.rowG.col2.bottom = true;
    }

    closeExit() {
        // set G2 bottom false
        this.newMazeGrid.rowG.col2.bottom = false;
    }
    explodeBombs() {
        // explode bombs
    }

    private createMaze(difficulty: string, location: string) {
        this.newMazeGrid = {
            rowA: {
                col1: { top: true, right: false, bottom: false, left: true, crossUp: false, crossDown: false, star: false, bomb: false },
                col2: { top: true, right: false, bottom: false, left: false, crossUp: false, crossDown: false, star: false, bomb: false },
                col3: { top: true, right: false, bottom: false, left: false, crossUp: false, crossDown: false, star: false, bomb: false },
                col4: { top: true, right: false, bottom: false, left: false, crossUp: false, crossDown: false, star: false, bomb: false },
                col5: { top: true, right: false, bottom: false, left: false, crossUp: false, crossDown: false, star: false, bomb: false },
                col6: { top: true, right: true, bottom: false, left: false, crossUp: false, crossDown: false, star: false, bomb: false }
            },
            rowB: {
                col1: { top: false, right: false, bottom: false, left: true, crossUp: false, crossDown: false, star: false, bomb: false },
                col2: { top: false, right: false, bottom: false, left: false, crossUp: false, crossDown: false, star: false, bomb: false },
                col3: { top: false, right: false, bottom: false, left: false, crossUp: false, crossDown: false, star: false, bomb: false },
                col4: { top: false, right: false, bottom: false, left: false, crossUp: false, crossDown: false, star: false, bomb: false },
                col5: { top: false, right: false, bottom: false, left: false, crossUp: false, crossDown: false, star: false, bomb: false },
                col6: { top: false, right: true, bottom: false, left: false, crossUp: false, crossDown: false, star: false, bomb: false },
            },
            rowC: {
                col1: { top: false, right: false, bottom: false, left: true, crossUp: false, crossDown: false, star: false, bomb: false },
                col2: { top: false, right: false, bottom: false, left: false, crossUp: false, crossDown: false, star: false, bomb: false },
                col3: { top: false, right: false, bottom: false, left: false, crossUp: false, crossDown: false, star: false, bomb: false },
                col4: { top: false, right: false, bottom: false, left: false, crossUp: false, crossDown: false, star: false, bomb: false },
                col5: { top: false, right: false, bottom: false, left: false, crossUp: false, crossDown: false, star: false, bomb: false },
                col6: { top: false, right: true, bottom: false, left: false, crossUp: false, crossDown: false, star: false, bomb: false },
            },
            rowD: {
                col1: { top: false, right: false, bottom: false, left: true, crossUp: false, crossDown: false, star: false, bomb: false },
                col2: { top: false, right: false, bottom: false, left: false, crossUp: false, crossDown: false, star: false, bomb: false },
                col3: { top: false, right: false, bottom: false, left: false, crossUp: false, crossDown: false, star: false, bomb: false },
                col4: { top: false, right: false, bottom: false, left: false, crossUp: false, crossDown: false, star: false, bomb: false },
                col5: { top: false, right: false, bottom: false, left: false, crossUp: false, crossDown: false, star: false, bomb: false },
                col6: { top: false, right: true, bottom: false, left: false, crossUp: false, crossDown: false, star: false, bomb: false },
            },
            rowE: {
                col1: { top: false, right: false, bottom: false, left: true, crossUp: false, crossDown: false, star: false, bomb: false },
                col2: { top: false, right: false, bottom: false, left: false, crossUp: false, crossDown: false, star: false, bomb: false },
                col3: { top: false, right: false, bottom: false, left: false, crossUp: false, crossDown: false, star: false, bomb: false },
                col4: { top: false, right: false, bottom: false, left: false, crossUp: false, crossDown: false, star: false, bomb: false },
                col5: { top: false, right: false, bottom: false, left: false, crossUp: false, crossDown: false, star: false, bomb: false },
                col6: { top: false, right: true, bottom: false, left: false, crossUp: false, crossDown: false, star: false, bomb: false },
            },
            rowF: {
                col1: { top: false, right: false, bottom: false, left: true, crossUp: false, crossDown: false, star: false, bomb: false },
                col2: { top: false, right: false, bottom: false, left: false, crossUp: false, crossDown: false, star: false, bomb: false },
                col3: { top: false, right: false, bottom: false, left: false, crossUp: false, crossDown: false, star: false, bomb: false },
                col4: { top: false, right: false, bottom: false, left: false, crossUp: false, crossDown: false, star: false, bomb: false },
                col5: { top: false, right: false, bottom: false, left: false, crossUp: false, crossDown: false, star: false, bomb: false },
                col6: { top: false, right: true, bottom: false, left: false, crossUp: false, crossDown: false, star: false, bomb: false },
            },
            rowG: {
                col1: { top: false, right: true, bottom: false, left: true, crossUp: false, crossDown: false, star: false, bomb: false },
                col2: { top: false, right: false, bottom: true, left: true, crossUp: false, crossDown: false, star: false, bomb: false },
                col3: { top: false, right: false, bottom: true, left: false, crossUp: false, crossDown: false, star: false, bomb: false },
                col4: { top: false, right: false, bottom: true, left: false, crossUp: false, crossDown: false, star: false, bomb: false },
                col5: { top: false, right: false, bottom: true, left: false, crossUp: false, crossDown: false, star: false, bomb: false },
                col6: { top: false, right: true, bottom: true, left: false, crossUp: false, crossDown: false, star: false, bomb: false },
            },
            image: this.getLocationImage(this.location)
        }
    }

}
