const givenNo = "Given Number",
    singleNo = "Single Number in Note",
    updatedNotes = "Updated Notes",
    noteGroup = "Note Group",
    addedNotes = "Added Notes",
    hiddenGroup = "Hidden Number(s) in a ";

function Solver() {
// Steps format [numberStep, [x, y, number]]
//              [numberStep, [[x, y, [notes]]]]
// New format [[[x, y, number], ...], [[x, y, [notes]], ...]]
    var steps = [],
        stepInfo = [],
        currentStep = 0;

    var rowNums = [],
        colNums = [];

    var cells = [];

    this.initNums = function () {
        for (var i = 0; i < model.getSize(); i++) {
            rowNums[i] = [];
            colNums[i] = [];
        }
    };

    this.solve = function () {
        this.initNums();

        // Checking for given numbers
        let groups = model.getGroups();
        for (let i = 0; i < groups.length; i++) {
            if (groups[i][0] === 0) {
                let cell = model.findCellsInGroup(i)[0];
                steps.push([[[cell[0], cell[1], groups[i][1]]]]);
                stepInfo.push([givenNo, [[cell[0], cell[1]]]]);
                this.nextStep();
            }
        }

        this.solveLoop();

        for (; currentStep > 0; this.previousStep()) ;

        this.reduceSteps();
    };

// Finding cell notes (core loop? for now)
    this.solveLoop = function () {
        // Initialization of cells
        for (let x = 0; x < model.getSize(); x++)
            for (let y = 0; y < model.getSize(); y++)
                cells[x + y * model.getSize()] = [x, y];

        let cycles = 0,
            progress = 0,
            note_limit = 2,
            pair_limit = 2;

        // Removes cells with numbers in them and updates their details
        for (let i = cells.length - 1; i >= 0; i--)
            if (this.isCellNumber(cells[i]))
                cells.splice(i, 1);
            else cells[i][2] = model.getDetails(cells[i][0], cells[i][1]);

        while (!model.isSolved()) {
            progress = steps.length;
            cycles++;

            // Single note to Number
            if (this._singleNote()) continue;

            // Note pairs
            if (this._notePairs(pair_limit)) continue;

            // Hidden pairs
            if (this._hiddenPairs(pair_limit)) continue;


            // Tries to add notes to the next empty cellGroup or updates one if necessary
            if (this._notes(note_limit)) continue;

            // Test if limits need to be raised
            if (progress === steps.length) {
                if (pair_limit <= model.getSize() - 1 && pair_limit <= note_limit) {
                    pair_limit++;
                    note_limit = pair_limit;
                } else if (note_limit <= model.getSize())
                    note_limit++;
                else break;
            } else {
                pair_limit--;
                note_limit = pair_limit;
            }
        }
    };

// _functions of solving methods
    this._singleNote = function () {
        for (let c = 0; c < cells.length; c++)
            if (this.singleNote(cells[c])) return true;
        return false;
    };

    this._notePairs = function (pair_limit) {
        for (let i = 2; i <= pair_limit; i++) {
            for (let index_ = 0; index_ < model.getSize(); index_++) {
                // Note pairs in rows
                let c = this.notedCellsInRow(cells, index_);
                if (c.length >= i) {
                    c = this.pickXcells(c, i);
                    for (let index_I = 0; index_I < c.length; index_I++)
                        if (this.notePair(c[index_I])) return true;
                }

                // Note pairs in columns
                c = this.notedCellsInColumn(cells, index_);
                if (c.length >= i) {
                    c = this.pickXcells(c, i);
                    for (let index_I = 0; index_I < c.length; index_I++)
                        if (this.notePair(c[index_I])) return true;
                }
            }
        }

        return false;
    };

    this._hiddenPairs = function (pair_limit) {
        for (let i = 1; i <= pair_limit; i++) {
            for (let index_ = 0; index_ < model.getSize(); index_++) {
                let numbers = [],
                    c;
                // Hidden pairs in rows
                if (this.isRowNotEmpty(cells, index_)) {
                    // Initialize numbers
                    for (let n = 1; n <= model.getSize(); n++)
                        numbers[n] = [n, 0];

                    c = this.notedCellsInRow(cells, index_);
                    // Count each number
                    for (let t = 0; t < c.length; t++)
                        for (let f = 1; f <= c[t][2].length; f++)
                            if (c[t][2][f]) numbers[f][1]++;

                    // Remove unnecessary numbers
                    for (let n = model.getSize(); n >= 1; n--)
                        if (numbers[n][1] === 0 || numbers[n][1] > i) numbers.splice(n, 1);
                    numbers.splice(0, 1);

                    if (numbers.length >= i && c.length > i) {
                        // Cleans up the array
                        for (let x = 0; x < numbers.length; x++)
                            numbers[x] = numbers[x][0];

                        numbers = this.pickXcells(numbers, i);
                        for (let index_I = 0; index_I < numbers.length; index_I++)
                            if (this.hiddenPair(c, numbers[index_I], true)) return true;
                    }
                }

                numbers = [];
                // Hidden pairs in columns
                if (this.isColumnNotEmpty(cells, index_)) {
                    // Initialize numbers
                    for (let n = 1; n <= model.getSize(); n++)
                        numbers[n] = [n, 0];

                    c = this.notedCellsInColumn(cells, index_);
                    // Count each number
                    for (let t = 0; t < c.length; t++)
                        for (let f = 1; f <= c[t][2].length; f++)
                            if (c[t][2][f]) numbers[f][1]++;

                    // Remove unnecessary numbers
                    for (let n = model.getSize(); n >= 1; n--)
                        if (numbers[n][1] === 0 || numbers[n][1] > i) numbers.splice(n, 1);
                    numbers.splice(0, 1);

                    if (numbers.length >= i && c.length > i) {
                        // Cleans up the array
                        for (let x = 0; x < numbers.length; x++)
                            numbers[x] = numbers[x][0];

                        numbers = this.pickXcells(numbers, i);
                        for (let index_I = 0; index_I < numbers.length; index_I++)
                            if (this.hiddenPair(c, numbers[index_I], false)) return true;
                    }
                }
            }
        }
    };

    this._notes = function (note_limit) {
        for (let i = 0; i < model.getGroups().length; i++) {
            // Retrieves notes in the group
            let cellGroup = model.findCellsInGroup(i, cells);
            if (cellGroup.length === 0) continue;

            // Adding notes
            let step = this.notesPopulate(cellGroup, model.getCellGroups()[cellGroup[0][0]][cellGroup[0][1]]);
            if (step !== undefined && this.stepNoteLength(step) <= note_limit) {
                steps.push(step);
                this.stepToInfo(addedNotes, step);
                this.nextStep();
                return true;
            }
        }
        return false;
    };

// Populate cells with notes
    this.notesPopulate = function (cells_, g) {
        let cells = JSON.parse(JSON.stringify(cells_));
        let cells__ = JSON.parse(JSON.stringify(cells_));
        // for (var i = 0; i < cells.length; i++) cells[i][2] = cells_[i][2].slice();

        // 0 = available | 1 = testing | 2 = true
        // Convert empty cells to enabled ones
        if (this.isCellEmpty(cells[0]))
            for (let i = 0; i < cells.length; i++)
                for (let t = 1; t <= model.getSize(); t++)
                    cells[i][2][t] = 0;
        // Convert to new format marked cells
        else
            for (let i = 0; i < cells.length; i++)
                for (let t = 1; t <= model.getSize(); t++)
                    if (cells[i][2][t] === true) cells[i][2][t] = 0;

        // Add static numbers as the option
        let gIndex = model.getCellGroups()[cells[0][0]][cells[0][1]];
        if (model.getGroupSize(gIndex) !== cells.length) {
            let temp = model.findCellsInGroup(gIndex);
            let a = 0, b = 0;
            while (b < temp.length) {
                if (a >= cells.length || cells[a][0] + cells[a][1] * model.getSize() > temp[b][0] + temp[b][1] * model.getSize()) {
                    temp[b][2] = [];
                    temp[b][2][model.getDetails(temp[b][0], temp[b][1])] = 0;
                    for (let i = 1; i <= model.getSize(); i++)
                        temp[b][2][i] = temp[b][2][i] === 0 ? 0 : false;
                    cells.unshift(temp[b].slice());
                    cells__.unshift(temp[b].slice());
                }
                a++;
                b++;
            }
        }

        let group = model.getGroups()[g];
        switch (group[0]) {
            case(1):
                cells = this.notesAddition(cells, group[1], 0);
                break;
            case(2):
                cells = this.notesSubtraction(cells, group[1]);
                break;
            case(3):
                cells = this.notesMultiplication(cells, group[1], 0);
                break;
            case(4):
                cells = this.notesDivision(cells, group[1]);
                break;
        }

        if (cells === undefined)
            return;
        // Translates number format to this mid one
        for (let i = 0; i < cells.length; i++)
            for (let n = 1; n <= model.getSize(); n++)
                cells[i][2][n] = cells[i][2][n] === 2;

        // Calculates new changes to the notes
        for (let i = 0; i < cells.length; i++)
            for (let n = 1; n <= model.getSize(); n++)
                cells[i][2][n] = cells__[i][2][n] ? !cells[i][2][n] : cells[i][2][n];

        // Translate this step format to the main one
        // This step format - [[x, y, [, num_1_bool, num_2_bool...]]
        let step = [, []];
        for (let i = 0; i < cells.length; i++) {
            let preStep = [cells[i][0], cells[i][1], []];
            for (let n = 1; n <= model.getSize(); n++)
                if (cells[i][2][n])
                    preStep[2].push(n);
            if (preStep[2].length > 0)
                step[1].push(preStep);
        }

        return step[1].length === 0 ? undefined : step;
    };

// Initializes addition notes for groups of cells
    this.notesAddition = function (cells, sum, i) {
        // Check if last cell in group has a number that fits
        if (cells.length - 1 === i) {
            if (sum > model.getSize() || cells[i][2][sum] === false || !this.isAvailable(sum, cells[i][0], cells[i][1]))
                return;
            for (let c = 0; c < i; c++)
                if ((cells[c][0] === cells[i][0] || cells[c][1] === cells[i][1]) && cells[c][2][sum] === 1)
                    return;
            cells[i][2][sum] = 2;
            return cells;
        }

        let option = false,
            invalid = false;

        // Go through all possible numbers in the cell
        for (let n = 1; n <= model.getSize(); n++) {

            // Check if number if valid
            if (sum - n > 0 && (cells[i][2][n] === 0 || cells[i][2][n] === 2) && this.isAvailable(n, cells[i][0], cells[i][1])) {
                // Checks if the number is already considered for usage
                for (let c = 0; c < i; c++)
                    if ((cells[c][0] === cells[i][0] || cells[c][1] === cells[i][1]) && cells[c][2][n] === 1) {
                        invalid = true;
                        break;
                    }
                if (invalid) {
                    invalid = false;
                    continue;
                }

                // Setups the number as the option
                let t = cells[i][2][n];
                cells[i][2][n] = 1;
                let result = this.notesAddition(cells, sum - n, i + 1);

                // Process the return value
                if (result !== undefined) {
                    option = true;
                    cells = result;
                    cells[i][2][n] = 2;
                } else
                    cells[i][2][n] = t;
            }
        }

        return option ? cells : undefined;
    };

// Initializes subtraction notes for groups of cells
    this.notesSubtraction = function (cells, res) {
        let option = false;

        // Pick a cell as the starting cell
        for (let start = 0; start < cells.length; start++) {
            // Go through all possible numbers in the cell
            for (let n = 1; n <= model.getSize(); n++) {
                if (n > res && (cells[start][2][n] === 0 || cells[start][2][n] === 2) && this.isAvailable(n, cells[start][0], cells[start][1])) {
                    // Setup for the fiasco
                    let t = cells[start][2][n];
                    cells[start][2][n] = 1;
                    cells[start][2][0] = 0;

                    let result = this.notesSubtractionLoop(cells, res, n, start === 0 ? 1 : 0);

                    // Process the return value
                    if (result !== undefined) {
                        option = true;
                        cells = result;
                        cells[start][2][n] = 2;
                    } else
                        cells[start][2][n] = t;
                    cells[start][2][0] = '';
                }
            }
        }

        return option ? cells : undefined;
    };

    this.notesSubtractionLoop = function (cells, res, start, i) {
        // Check if last cell in group has a number that fits
        if (cells.length - 1 === i || (cells.length - 2 === i && cells[cells.length - 1][2][0] === 0)) {
            if (start - res > model.getSize() || !this.isAvailable(start - res, cells[i][0], cells[i][1]) || cells[i][2][start - res] === false)
                return;
            // Checks if the number is already considered for usage
            for (let c = 0; c < cells.length; c++) {
                if (i === c) continue;
                if ((cells[c][0] === cells[i][0] || cells[c][1] === cells[i][1]) && cells[c][2][start - res] === 1)
                    return;
            }

            cells[i][2][start - res] = 2;
            return cells;
        }

        // Not a loop, supports only 2 cells at the time
    };

// Initializes multiplication notes for groups of cells
    this.notesMultiplication = function (cells, res, i) {
        // Check if the last cell in group has a number that fits
        if (cells.length - 1 === i) {
            if (res > model.getSize() || !this.isAvailable(res, cells[i][0], cells[i][1]) || cells[i][2][res] === false)
                return;
            // Checks if the number us already considered for usage
            for (let c = 0; c < cells.length; c++) {
                if ((cells[c][0] === cells[i][0] || cells[c][1] === cells[i][1]) && cells[c][2][res] === 1)
                    return;
            }

            cells[i][2][res] = 2;
            return cells;
        }

        let option = false,
            invalid = false;

        // Go through all possible numbers in the cell
        for (let n = 1; n <= model.getSize(); n++) {
            // Check if number if valid
            if (res % n === 0 && this.isAvailable(n, cells[i][0], cells[i][1]) && (cells[i][2][n] === 0 || cells[i][2][n] === 2)) {
                // Checks if the number is already considered for usage
                for (let c = 0; c < i; c++)
                    if ((cells[c][0] === cells[i][0] || cells[c][1] === cells[i][1]) && cells[c][2][n] === 1) {
                        invalid = true;
                        break;
                    }
                if (invalid) {
                    invalid = false;
                    continue;
                }

                // Setups the number as the option
                let t = cells[i][2][n];
                cells[i][2][n] = 1;
                let result = this.notesMultiplication(cells, res / n, i + 1);

                // Process the return value
                if (result !== undefined) {
                    option = true;
                    cells = result;
                    cells[i][2][n] = 2;
                } else
                    cells[i][2][n] = t;
            }
        }

        return option ? cells : undefined;
    };

// Initializes division notes for groups of cells
    this.notesDivision = function (cells, res) {
        let option = false;

        // Pick a cell as the starting cell
        for (let start = 0; start < cells.length; start++) {
            // Go through all possible numbers in the cell
            for (let n = 1; n <= model.getSize(); n++) {
                if (n % res === 0 && this.isAvailable(n, cells[start][0], cells[start][1]) && (cells[start][2][n] === 0 || cells[start][2][n] === 2)) {
                    // Setup for the fiasco
                    let t = cells[start][2][n];
                    cells[start][2][n] = 1;
                    cells[start][2][0] = 0;

                    let result = this.notesDivisionLoop(cells, res, n, start === 0 ? 1 : 0);

                    // Process the return value
                    if (result !== undefined) {
                        option = true;
                        cells = result;
                        cells[start][2][n] = 2;
                    } else
                        cells[start][2][n] = t;
                    cells[start][2][0] = '';
                }
            }
        }

        return option ? cells : undefined;
    };

    this.notesDivisionLoop = function (cells, res, start, i) {
        // Check if last cell in group has a number that fits
        if (cells.length - 1 === i || (cells.length - 2 === i && cells[cells.length - 1][2][0] === 0)) {
            if (start / res > model.getSize() || !this.isAvailable(start / res, cells[i][0], cells[i][1]) || cells[i][2][start / res] === false)
                return;
            // Checks if the number is already considered for usage
            for (let c = 0; c < cells.length; c++) {
                if (i === c) continue;
                if ((cells[c][0] === cells[i][0] || cells[c][1] === cells[i][1]) && cells[c][2][start / res] === 1)
                    return;
            }

            cells[i][2][start / res] = 2;
            return cells;
        }

        // Not a loop, supports only 2 cells at the time
    };

// Tests if the cell has only 1 option
    this.singleNote = function (cell) {
        let details = model.getDetails(cell[0], cell[1]);
        let num;
        for (let i = 1; i <= model.getSize(); i++)
            if (details[i])
                if (num === undefined)
                    num = i;
                else
                    return false;
        if (num !== undefined) {
            steps.push([[[cell[0], cell[1], num]]]);
            stepInfo.push([singleNo, [], [[cell[0], cell[1]]]]);
            this.nextStep();

            // Update rest of the rows
            let updates = [];
            updates = updates.concat(this.updateRowNums(cell[1], num, [cell[0]]));
            updates = updates.concat(this.updateColNums(cell[0], num, [cell[1]]));
            if (updates.length > 0) {
                steps.push([, updates]);
                this.stepToInfo(updatedNotes, ["", updates]);
                this.nextStep();
            }
            return true;
        }
        return false;
    };

// Test for note pairs in group
    this.notePair = function (cells) {
        let col = cells[0][0],
            row = cells[0][1],
            isRow = false;

        // Check if the cell pairs are in the same row/column
        for (let i = 1; i < cells.length; i++)
            if (row === cells[i][1]) {
                if (i > 1 && isRow === false)
                    return false;
                isRow = true;
            } else if (col === cells[i][0]) {
                if (isRow === true)
                    return false;
            } else return false;

        // Get the number of unique numbers in those cells
        let nums = [];
        for (let c = 0; c < cells.length; c++)
            for (let i = 1; i <= model.getSize(); i++)
                if (cells[c][2][i] && !nums.includes(i))
                    nums.push(i);
        nums.sort();

        if (nums.length === cells.length) {
            let updates = [],
                owners = [];

            for (let i = 0; i < cells.length; i++)
                owners.push(isRow ? cells[i][0] : cells[i][1]);

            for (let i = 0; i < nums.length; i++)
                updates = isRow ? updates.concat(this.updateRowNums(cells[0][1], nums[i], owners))
                    : updates.concat(this.updateColNums(cells[0][0], nums[i], owners));

            if (updates.length > 0) {
                steps.push([, updates]);
                this.stepToInfo(noteGroup, ["", updates], ["", cells]);
                this.nextStep();
                return true;
            }
        }
        return false;
    };

// Tests for hidden pairs / numbers
    this.hiddenPair = function (cells, numbers, isRow) {
        // Get the number of unique cells with those numbers
        let cells_ = [];
        cellLoop:
            for (let c = 0; c < cells.length; c++)
                for (let i = 0; i < numbers.length; i++)
                    if (cells[c][2][numbers[i]]) {
                        cells_.push(cells[c]);
                        continue cellLoop;
                    }

        if (cells_.length === numbers.length) {
            let updates = [];

            for (let i = 0; i < cells_.length; i++)
                updates = updates.concat(this.cleanCell(cells_[i], numbers));

            if (updates.length > 0) {
                steps.push([, updates]);
                this.stepToInfo(hiddenGroup + (isRow ? "Row" : "Column"), ["", updates]);
                this.nextStep();
                return true;
            }
        }
        return false;
    };

// Update rowNums
    this.updateRowNums = function (row, num, owners) {
        if (rowNums[row][num] === undefined || owners.length < rowNums[row][num].length)
            rowNums[row][num] = owners;

        let details,
            updates = [];
        for (let i = 0; i < model.getSize(); i++) {
            if (!owners.includes(i) && this.isCellNoted([i, row])) {
                details = model.getDetails(i, row);
                if (details[num] === true) {
                    updates.push([i, row, [num]]);
                }
            }
        }
        return updates;
    };

// Update colNums
    this.updateColNums = function (col, num, owners) {
        if (colNums[col][num] === undefined || owners.length < colNums[col][num].length)
            colNums[col][num] = owners;

        let details,
            updates = [];
        for (let i = 0; i < model.getSize(); i++) {
            if (!owners.includes(i) && this.isCellNoted([col, i])) {
                details = model.getDetails(col, i);
                if (details[num] === true) {
                    updates.push([col, i, [num]]);
                }
            }
        }
        return updates;
    };

// Cleans the cell of other numbers
    this.cleanCell = function (cell, numbers) {
        let updates = [[cell[0], cell[1], []]];
        for (let i = 0; i < model.getSize(); i++) {
            if (!numbers.includes(i) && cell[2][i]) {
                updates[0][2].push(i);
            }
        }
        return updates[0][2].length > 0 ? updates : [];
    };

// Merges steps
    this.reduceSteps = function () {
        let chain = false,
            coverage = [];
        for (let i = 0; i < steps.length; i++) {
            if (chain && (stepInfo[i][0] === singleNo || stepInfo[i][0] === updatedNotes)) {
                coverage = this.updateCoverage(coverage, steps[i]);
                if (!coverage) {
                    chain = false;
                    i--;
                    continue;
                }
                // Merges step in to previous one
                if (steps[i][0] !== undefined) {
                    if (steps[i - 1][0] === undefined)
                        steps[i - 1][0] = [];
                    steps[i - 1][0] = steps[i - 1][0].concat(steps[i][0]);
                }

                if (steps[i][1] !== undefined) {
                    if (steps[i - 1][1] === undefined)
                        steps[i - 1][1] = [];
                    steps[i - 1][1] = steps[i - 1][1].concat(steps[i][1]);
                }

                stepInfo[i - 1][1] = stepInfo[i - 1][1].concat(stepInfo[i][1]);
                if (stepInfo[i][2] !== undefined) {
                    if (stepInfo[i - 1][2] === undefined)
                        stepInfo[i - 1][2] = [];
                    stepInfo[i - 1][2] = stepInfo[i - 1][2].concat(stepInfo[i][2]);
                }

                steps.splice(i, 1);
                stepInfo.splice(i, 1);
                i--;
            } else {
                chain = false;
            }
            if (stepInfo[i][0] === singleNo) {
                // Creates the coverage map for the potential merge
                chain = true;
                coverage = [];
                for (let x = 0; x < model.getSize(); x++) {
                    coverage[x] = [];
                    for (let y = 0; y < model.getSize(); y++) {
                        coverage[x][y] = false;
                    }
                }

                coverage = this.updateCoverage(coverage, steps[i]);
            }
        }
    };

// Updates the step merge map, so no steps get skipped
    this.updateCoverage = function (coverage, step) {
        if (step[0] !== undefined)
            for (let c = 0; c < step[0].length; c++) {
                if (coverage[step[0][c][0]][step[0][c][1]])
                    return false;
                coverage[step[0][c][0]][step[0][c][1]] = true;
            }
        if (step[1] !== undefined)
            for (let c = 0; c < step[1].length; c++) {
                if (coverage[step[1][c][0]][step[1][c][1]])
                    return false;
                coverage[step[1][c][0]][step[1][c][1]] = true;
            }
        return coverage;
    };

// Checks if the number is not taken in that row / column
    this.isAvailable = function (number, x, y) {
        return (rowNums[y][number] === undefined || rowNums[y][number].includes(x)) && (colNums[x][number] === undefined || colNums[x][number].includes(y));
    };

// Returns all noted cells in a row
    this.notedCellsInRow = function (cells, row) {
        let c = [];
        for (let i = 0; i < cells.length; i++)
            if (cells[i][1] === row && this.isCellNoted([cells[i][0], cells[i][1]]))
                c.push(cells[i].slice());
        return c;
    };

// Returns all noted cells in a column
    this.notedCellsInColumn = function (cells, col) {
        let c = [];
        for (let i = 0; i < cells.length; i++)
            if (cells[i][0] === col && this.isCellNoted([cells[i][0], cells[i][1]]))
                c.push(cells[i].slice());
        return c;
    };

    this.stepNoteLength = function (step) {
        let length;
        for (let i = 0; i < step[1].length; i++)
            if (length === undefined || step[1][i][2].length > length) length = step[1][i][2].length;
        return length;
    };

// Check if cell has number in it
    this.isCellEmpty = function (cell) {
        let details = model.getDetails(cell[0], cell[1]);
        if (Array.isArray(details)) {
            for (let i = 1; i <= model.getSize(); i++)
                if (details[i])
                    return false;
        } else return false;
        return true;
    };

    this.isRowNotEmpty = function (cells, row) {
        for (let i = 0; i < cells.length; i++)
            if (cells[i][1] === row && this.isCellEmpty([cells[i][0], cells[i][1]]))
                return false;
        return true;
    };

    this.isColumnNotEmpty = function (cells, col) {
        for (let i = 0; i < cells.length; i++)
            if (cells[i][0] === col && this.isCellEmpty([cells[i][0], cells[i][1]]))
                return false;
        return true;
    };

// Check if cell has notes and is a note cell
    this.isCellNoted = function (cell) {
        if (this.isCellEmpty(cell))
            return false;
        let details = model.getDetails(cell[0], cell[1]);
        for (let i = 1; i <= model.getSize(); i++)
            if (details[i])
                return true;
        return false;
    };

// Check if cell has a number in it
    this.isCellNumber = function (cell) {
        return !Array.isArray(model.getDetails(cell[0], cell[1]))
    };

    this.pickXcells = function (cells, count) {
        if (count === 1) {
            for (let i = 0; i < cells.length; i++)
                cells[i] = [cells[i]];
            return cells;
        }

        let c = [],
            c_;
        for (let i = 0; i < cells.length - (count - 1); i++) {
            c_ = [cells[i]];
            let c__ = this.pickXcells(cells.slice().splice(i + 1), count - 1);
            for (let i_ = 0; i_ < c__.length; i_++)
                c.push(c_.slice().concat(c__[i_]));
        }
        return c;
    };

// Advances solution by a Step
    this.nextStep = function () {
        if (steps.length > currentStep) {
            let numberSteps = steps[currentStep][0],
                noteSteps = steps[currentStep][1];

            if (numberSteps !== undefined)
                for (let i = 0; i < numberSteps.length; i++)
                    model.setNumber(numberSteps[i][0], numberSteps[i][1], numberSteps[i][2]);
            if (noteSteps !== undefined) {
                for (let i = 0; i < noteSteps.length; i++)
                    for (let n = 0; n < noteSteps[i][2].length; n++)
                        model.setNote(noteSteps[i][0], noteSteps[i][1], noteSteps[i][2][n]);
            }

            currentStep++;
            this.updateStep();
        }

        // Removes cells with numbers in them and updates their details
        for (let i = cells.length - 1; i >= 0; i--)
            if (this.isCellNumber(cells[i]))
                cells.splice(i, 1);
            else cells[i][2] = model.getDetails(cells[i][0], cells[i][1]);
    };

// Reverts the last Step
    this.previousStep = function () {
        if (currentStep !== 0) {
            currentStep--;
            this.updateStep();
            let numberSteps = steps[currentStep][0],
                noteSteps = steps[currentStep][1];

            if (numberSteps !== undefined)
                for (let i = 0; i < numberSteps.length; i++)
                    model.setNumber(numberSteps[i][0], numberSteps[i][1], numberSteps[i][2]);
            if (noteSteps !== undefined) {
                for (let i = 0; i < noteSteps.length; i++)
                    for (let n = 0; n < noteSteps[i][2].length; n++)
                        model.setNote(noteSteps[i][0], noteSteps[i][1], noteSteps[i][2][n]);
            }
        }
    };

    this.stepToInfo = function (text, step, stepA) {
        let s = [text];
        s[1] = [];

        for (let i = 0; i < step[1].length; i++)
            s[1].push([step[1][i][0], step[1][i][1]]);

        if (stepA !== undefined) {
            s[2] = [];
            for (let i = 0; i < stepA[1].length; i++)
                s[2].push([stepA[1][i][0], stepA[1][i][1]]);
        }
        stepInfo.push(s);
    };

    this.getStepCount = function () {
        return steps.length;
    };

    this.updateStep = function () {
        view.setCurrentStep(currentStep);
        view.removeHighlights();
        if (currentStep === 0)
            view.setStepExplanation("");
        else if (currentStep === steps.length)
            view.setStepExplanation("Solved!");
        else {
            let si = stepInfo[currentStep - 1];
            view.setStepExplanation(si[0]);
            for (let i = 0; i < si[1].length; i++) view.highlightCell(si[1][i][0], si[1][i][1]);
            if (si[2] !== undefined)
                for (let i = 0; i < si[2].length; i++) view.highlightCell(si[2][i][0], si[2][i][1], "#89c9ff");
        }
    };
}