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

        var groupCount = 0,
            numberSize;

        size = puzzle.slice(0, 1) * 1;
        puzzle = puzzle.slice(1);

        numberSize = puzzle.slice(0, 1) * 1;
        puzzle = puzzle.slice(1);

        for (var i = 0; i < size; i++)
            cellGroups[i] = [];
        for (var y = 0; y < size; y++) {
            for (var x = 0; x < size; x++) {
                cellGroups[x][y] = puzzle.slice(0, 2) * 1;
                groupCount = groupCount > cellGroups[x][y] ? groupCount : cellGroups[x][y];
                puzzle = puzzle.slice(2);
            }
        }

        for (var i = 0; i <= groupCount; i++) {
            groups[i] = [];
            groups[i][0] = puzzle.slice(0, 1) * 1;
            puzzle = puzzle.slice(1);
        }

        for (var i = 0; i <= groupCount; i++) {
            groups[i][1] = this.hexToDec(puzzle.slice(0, numberSize)) * 1;
            puzzle = puzzle.slice(numberSize);
        }

        this.initCells();
    };

    this.initCells = function () {
        for (var x = 0; x < size; x++) {
            numbers[x] = [];
            notes[x] = [];
            for (var y = 0; y < size; y++) {
                numbers[x][y] = 0;
                notes[x][y] = [];
                for (var i = 1; i <= size; i++) {
                    notes[x][y][i] = false;
                }
            }
        }
    };

    this.hexToDec = function (hex) {
        var n = 0;
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

    this.getCells = function () {
        var cells = [];
        for (var x = 0; x < this.getSize(); x++) {
            cells[x] = [];
            for (var y = 0; y < this.getSize(); y++)
                cells[x][y] = this.getDetails(x, y);
        }
        return cells;
    };

    this.getCellGroups = function () {
        return cellGroups.slice();
    };

    this.getGroups = function () {
        return groups.slice();
    };

    this.getGroupSize = function (i) {
        var count = 0;
        if (i < groups.length)
            for (var a = 0; a < size; a++)
                for (var b = 0; b < size; b++)
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
    }
}