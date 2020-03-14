"use strict";

var solver;

function Model() {
    var size,
        cellGroups = [],
        groups = [],
        numbers = [],
        notes = [];

    this.loadPuzzle = function (puzzle) {
        //3000001020301020304122200502010202
        this.reset();

        let groupCount = 0,
            numberSize;

        size = puzzle.slice(0, 1) * 1;
        puzzle = puzzle.slice(1);

        numberSize = puzzle.slice(0, 1) * 1;
        puzzle = puzzle.slice(1);

        for (let i = 0; i < size; i++)
            cellGroups[i] = [];
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                cellGroups[x][y] = puzzle.slice(0, 2) * 1;
                groupCount = groupCount > cellGroups[x][y] ? groupCount : cellGroups[x][y];
                puzzle = puzzle.slice(2);
            }
        }

        for (let i = 0; i <= groupCount; i++) {
            groups[i] = [];
            groups[i][0] = puzzle.slice(0, 1) * 1;
            puzzle = puzzle.slice(1);
        }

        for (let i = 0; i <= groupCount; i++) {
            groups[i][1] = this.hexToDec(puzzle.slice(0, numberSize)) * 1;
            puzzle = puzzle.slice(numberSize);
        }

        this.initCells();
    };

    this.initCells = function () {
        for (let x = 0; x < size; x++) {
            numbers[x] = [];
            notes[x] = [];
            for (let y = 0; y < size; y++) {
                numbers[x][y] = 0;
                notes[x][y] = [];
                for (let i = 1; i <= size; i++) {
                    notes[x][y][i] = false;
                }
            }
        }
    };

    this.hexToDec = function (hex) {
        let n = 0;
        switch (hex.slice(0, 1)) {
            case("F"):
                n += 15 * Math.pow(16, hex.length - 1);
                break;
            case("E"):
                n += 14 * Math.pow(16, hex.length - 1);
                break;
            case("D"):
                n += 13 * Math.pow(16, hex.length - 1);
                break;
            case("C"):
                n += 12 * Math.pow(16, hex.length - 1);
                break;
            case("B"):
                n += 11 * Math.pow(16, hex.length - 1);
                break;
            case("A"):
                n += 10 * Math.pow(16, hex.length - 1);
                break;
            default:
                n += hex.slice(0, 1) * Math.pow(16, hex.length - 1);
        }
        return hex.length > 1 ? n + this.hexToDec(hex.slice(1)) : n;
    };

    this.getSize = function () {
        return size;
    };

    this.getCellGroups = function () {
        return cellGroups.slice();
    };

    this.getGroups = function () {
        return groups.slice();
    };

    this.getGroupSize = function (i) {
        let count = 0;
        if (i < groups.length)
            for (let a = 0; a < size; a++)
                for (let b = 0; b < size; b++)
                    if (cellGroups[a][b] === i) count++;

        return count;
    };

    this.setNumber = function (x, y, n) {
        numbers[x][y] = numbers[x][y] === n ? 0 : n;
        view.setNumber(x, y, n);
    };

    this.setNote = function (x, y, n) {
        notes[x][y][n] = !notes[x][y][n];
        view.setNote(x, y, n);
    };

    this.getDetails = function (x, y) {
        return numbers[x][y] === 0 ? notes[x][y].slice() : numbers[x][y];
    };

    this.reset = function () {
        size = undefined;
        cellGroups = [];
        groups = [];
        numbers = [];
        notes = [];
    };

    this.initSolver = function () {
        solver = new Solver();
        solver.solve();
    };

// Checks if all cells are filled with numbers
    this.isFilled = function () {
        let cellGroups = this.getCellGroups();

        for (let x = 0; x < cellGroups.length; x++)
            for (let y = 0; y < cellGroups.length; y++)
                if (Array.isArray(this.getDetails(x, y))) return false;
        return true;
    };

// Checks if the puzzle is solved
    this.isSolved = function () {
        if (this.isFilled()) {
            // Checks rows and columns
            for (let x = 0; x < this.getSize(); x++) {
                let row = [], col = [];
                for (let y = 0; y < this.getSize(); y++) {
                    let r = this.getDetails(x, y), c = this.getDetails(y, x);
                    if (row[r] || col[c])
                        return false;
                    row[r] = true;
                    col[c] = true;
                }
            }

            // Checks groups
            for (let i = 0; i < groups.length; i++) {
                let group = this.findCellsInGroup(i);
                let groupID = groups[i];

                let num = 0;
                switch (groupID[0]) {
                    case(0):
                        num = group[0][2];
                        break;
                    case(1):
                        let sum = 0;
                        for (let s = 0; s < group.length; s++)
                            sum += group[s][2];
                        num = sum;
                        break;
                    case(2):
                        let max = 0, maxID = 0;
                        for (let m = 0; m < group.length; m++)
                            if (max < group[m][2]) {
                                max = group[m][2];
                                maxID = m;
                            }
                        group.splice(maxID, 1);

                        for (let t = 0; t < group.length; t++)
                            max -= group[t][2];

                        num = max;
                        break;
                    case(3):
                        let prod = 1;
                        for (let p = 0; p < group.length; p++)
                            prod *= group[p][2];
                        num = prod;
                        break;
                    case(4):
                        let max_ = 0, maxID_ = 0;
                        for (let m = 0; m < group.length; m++)
                            if (max_ < group[m][2]) {
                                max_ = group[m][2];
                                maxID_ = m;
                            }
                        group.splice(maxID_, 1);

                        for (let t = 0; t < group.length; t++)
                            max_ /= group[t][2];

                        num = max_;
                }
                if (num !== groupID[1])
                    return false;
            }
            return true;
        }
        return false;
    };

// array[cellNumber][x / y]
    this.findCellsInGroup = function (i, allCells) {
        let cells = [],
            cellGroups = this.getCellGroups();

        if (allCells === undefined) {
            for (let x = 0; x < cellGroups.length; x++)
                for (let y = 0; y < cellGroups.length; y++)
                    if (cellGroups[x][y] === i) cells.push([x, y, this.getDetails(x, y)]);
        } else
            for (let index = 0; index < allCells.length; index++)
                if (cellGroups[allCells[index][0]][allCells[index][1]] === i) cells.push(allCells[index].slice());
        return cells;
    };
}
