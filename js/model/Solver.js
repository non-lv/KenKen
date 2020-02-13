function Solver() {
// Steps format [numberStep, [x, y, number]]
//              [numberStep, [x, y, [notes]]]
    var steps = [];
    var currentStep = 0;

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
        var groups = model.getGroups();
        for (var i = 0; i < groups.length; i++) {
            if (groups[i][0] === 0) {
                var cell = this.findCellsInGroup(i)[0];
                steps.push([true, [cell[0], cell[1], groups[i][1]]]);
                this.nextStep();

                // Update rest of the rows (up for improvement)
                var updates = [];
                updates = updates.concat(this.updateRowNums(cell[1], groups[i][1], [cell[0]]));
                updates = updates.concat(this.updateColNums(cell[0], groups[i][1], [cell[1]]));
                if (updates.length > 0) {
                    steps.push([false, updates]);
                    this.nextStep();
                    for (var upd = 0; upd < updates.length; upd++)
                        this.singleNote([updates[upd][0], updates[upd][1]]);
                }
            }
        }

        this.solveLoop();

        for (; currentStep > 0; this.previousStep()) ;
    };

// Finding cell notes (core loop? for now)
    this.solveLoop = function () {
        // Initialization of cells
        for (var x = 0; x < model.getSize(); x++)
            for (var y = 0; y < model.getSize(); y++)
                cells[x + y * model.getSize()] = [x, y];

        var cycles = 0,
            progress = 0,
            note_limit = 2,
            pair_limit = 2;

        // Removes cells with numbers in them and updates their details
        for (var i = cells.length - 1; i >= 0; i--)
            if (this.isCellNumber(cells[i]))
                cells.splice(i, 1);
            else cells[i][2] = model.getDetails(cells[i][0], cells[i][1]);

        while (!this.isSolved()) {
            cycles++;

            // Single note to Number
            for (var c = 0; c < cells.length; c++)
                this.singleNote(cells[c]);

            // Tries to add notes to the next empty cellGroup or updates one if necessary
            for (var i = 0; i < model.getGroups().length; i++) {
                // Retrieves notes in the group
                var cellGroup = this.findCellsInGroup(i, cells);
                if (cellGroup.length === 0) continue;

                // Adding notes
                var step = this.notesPopulate(cellGroup, model.getCellGroups()[cellGroup[0][0]][cellGroup[0][1]]);
                if (step === undefined || step[1][0][2].length > note_limit)
                    continue;
                steps.push(step);
                this.nextStep();
            }

            // Note pairs
            for (var i = 2; i <= pair_limit; i++) {
                for (var index_ = 0; index_ < model.getSize(); index_++) {
                    // Note pairs in rows
                    var c = this.notedCellsInRow(cells, index_);
                    if (c.length >= i) {
                        c = this.pickXcells(c, i);
                        for (var index_I = 0; index_I < c.length; index_I++)
                            this.notePair(c[index_I]);
                    }

                    // Note pairs in columns
                    c = this.notedCellsInColumn(cells, index_);
                    if (c.length >= i) {
                        c = this.pickXcells(c, i);
                        for (var index_I = 0; index_I < c.length; index_I++)
                            this.notePair(c[index_I]);
                    }
                }
            }

            // Test if limits need to be raised
            if (progress === steps.length)
                if (pair_limit <= model.getSize() - 1 && pair_limit <= note_limit) {
                    pair_limit++;
                    if (note_limit !== pair_limit)
                        console.log(note_limit, " ", pair_limit);
                    note_limit = pair_limit;
                } else if (note_limit <= model.getSize())
                    note_limit++;
                else break;
            progress = steps.length;
        }
    };

// Populate cells with notes
    this.notesPopulate = function (cells_, g) {
        var cells = JSON.parse(JSON.stringify(cells_));
        var cells__ = JSON.parse(JSON.stringify(cells_));
        // for (var i = 0; i < cells.length; i++) cells[i][2] = cells_[i][2].slice();

        // 0 = available | 1 = testing | 2 = true
        // Convert empty cells to enabled ones
        if (this.isCellEmpty(cells[0]))
            for (var i = 0; i < cells.length; i++)
                for (var t = 1; t <= model.getSize(); t++)
                    cells[i][2][t] = 0;
        // Convert to new format marked cells
        else
            for (var i = 0; i < cells.length; i++)
                for (var t = 1; t <= model.getSize(); t++)
                    if (cells[i][2][t] === true) cells[i][2][t] = 0;

        // Add static numbers as the option
        var gIndex = model.getCellGroups()[cells[0][0]][cells[0][1]];
        if (model.getGroupSize(gIndex) !== cells.length) {
            var temp = this.findCellsInGroup(gIndex);
            var a = 0, b = 0;
            while (b < temp.length) {
                if (a >= cells.length || cells[a][0] + cells[a][1] * model.getSize() > temp[b][0] + temp[b][1] * model.getSize()) {
                    temp[b][2] = [];
                    temp[b][2][model.getDetails(temp[b][0], temp[b][1])] = 0;
                    for (var i = 1; i <= model.getSize(); i++)
                        temp[b][2][i] = temp[b][2][i] === 0 ? 0 : false;
                    cells.unshift(temp[b].slice());
                    cells__.unshift(temp[b].slice());
                }
                a++;
                b++;
            }
        }

        var group = model.getGroups()[g];
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
        for (var i = 0; i < cells.length; i++)
            for (var n = 1; n <= model.getSize(); n++)
                cells[i][2][n] = cells[i][2][n] === 2;

        // Calculates new changes to the notes
        for (var i = 0; i < cells.length; i++)
            for (var n = 1; n <= model.getSize(); n++)
                cells[i][2][n] = cells__[i][2][n] ? !cells[i][2][n] : cells[i][2][n];

        // Translate this step format to the main one
        // This step format - [[x, y, [, num_1_bool, num_2_bool...]]
        var step = [false, []];
        for (var i = 0; i < cells.length; i++) {
            var prestep = [cells[i][0], cells[i][1], []];
            for (var n = 1; n <= model.getSize(); n++)
                if (cells[i][2][n])
                    prestep[2].push(n);
            if (prestep[2].length > 0)
                step[1].push(prestep);
        }

        return step[1].length === 0 ? undefined : step;
    };

// Initializes addition notes for groups of cells
    this.notesAddition = function (cells, sum, i) {
        // Check if last cell in group has a number that fits
        if (cells.length - 1 === i) {
            if (sum > model.getSize() || cells[i][2][sum] === false || !this.isAvailable(sum, cells[i][0], cells[i][1]))
                return;
            for (var c = 0; c < i; c++)
                if ((cells[c][0] === cells[i][0] || cells[c][1] === cells[i][1]) && cells[c][2][sum] === 1)
                    return;
            cells[i][2][sum] = 2;
            return cells;
        }

        var option = false,
            invalid = false;

        // Go through all possible numbers in the cell
        for (var n = 1; n <= model.getSize(); n++) {

            // Check if number if valid
            if (sum - n > 0 && (cells[i][2][n] === 0 || cells[i][2][n] === 2) && this.isAvailable(n, cells[i][0], cells[i][1])) {
                // Checks if the number is already considered for usage
                for (var c = 0; c < i; c++)
                    if ((cells[c][0] === cells[i][0] || cells[c][1] === cells[i][1]) && cells[c][2][n] === 1) {
                        invalid = true;
                        break;
                    }
                if (invalid) {
                    invalid = false;
                    continue;
                }

                // Setups the number as the option
                var t = cells[i][2][n];
                cells[i][2][n] = 1;
                var result = this.notesAddition(cells, sum - n, i + 1);

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
        var option = false;

        // Pick a cell as the starting cell
        for (var start = 0; start < cells.length; start++) {
            // Go through all possible numbers in the cell
            for (var n = 1; n <= model.getSize(); n++) {
                if (n > res && (cells[start][2][n] === 0 || cells[start][2][n] === 2) && this.isAvailable(n, cells[start][0], cells[start][1])) {
                    // Setup for the fiasco
                    var t = cells[start][2][n];
                    cells[start][2][n] = 1;
                    cells[start][2][0] = 0;

                    var result = this.notesSubtractionLoop(cells, res, n, start === 0 ? 1 : 0);

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
            for (var c = 0; c < cells.length; c++) {
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
            for (var c = 0; c < cells.length; c++) {
                if ((cells[c][0] === cells[i][0] || cells[c][1] === cells[i][1]) && cells[c][2][res] === 1)
                    return;
            }

            cells[i][2][res] = 2;
            return cells;
        }

        var option = false,
            invalid = false;

        // Go through all possible numbers in the cell
        for (var n = 1; n <= model.getSize(); n++) {
            // Check if number if valid
            if (res % n === 0 && this.isAvailable(n, cells[i][0], cells[i][1]) && (cells[i][2][n] === 0 || cells[i][2][n] === 2)) {
                // Checks if the number is already considered for usage
                for (var c = 0; c < i; c++)
                    if ((cells[c][0] === cells[i][0] || cells[c][1] === cells[i][1]) && cells[c][2][n] === 1) {
                        invalid = true;
                        break;
                    }
                if (invalid) {
                    invalid = false;
                    continue;
                }

                // Setups the number as the option
                var t = cells[i][2][n];
                cells[i][2][n] = 1;
                var result = this.notesMultiplication(cells, res / n, i + 1);

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
        var option = false;

        // Pick a cell as the starting cell
        for (var start = 0; start < cells.length; start++) {
            // Go through all possible numbers in the cell
            for (var n = 1; n <= model.getSize(); n++) {
                if (n % res === 0 && this.isAvailable(n, cells[start][0], cells[start][1]) && (cells[start][2][n] === 0 || cells[start][2][n] === 2)) {
                    // Setup for the fiasco
                    var t = cells[start][2][n];
                    cells[start][2][n] = 1;
                    cells[start][2][0] = 0;

                    var result = this.notesDivisionLoop(cells, res, n, start === 0 ? 1 : 0);

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
            for (var c = 0; c < cells.length; c++) {
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
        var details = model.getDetails(cell[0], cell[1]);
        var num;
        for (var i = 1; i <= model.getSize(); i++)
            if (details[i])
                if (num === undefined)
                    num = i;
                else
                    return false;
        if (num !== undefined) {
            steps.push([true, [cell[0], cell[1], num]]);
            this.nextStep();

            // Update rest of the rows
            var updates = [];
            updates = updates.concat(this.updateRowNums(cell[1], num, [cell[0]]));
            updates = updates.concat(this.updateColNums(cell[0], num, [cell[1]]));
            if (updates.length > 0) {
                steps.push([false, updates]);
                this.nextStep();
            }
            return true;
        }
        return false;
    };

// Test for note pairs in group
    this.notePair = function (cells) {
        var col = cells[0][0],
            row = cells[0][1];
        var isRow = false;

        // Check if the cell pairs are in the same row/column
        for (var i = 1; i < cells.length; i++)
            if (row === cells[i][1]) {
                if (i > 1 && isRow === false)
                    return;
                isRow = true;
            } else if (col === cells[i][0]) {
                if (isRow === true)
                    return;
            } else return;

        // Get the number of unique numbers in those cells
        var nums = [];
        for (var c = 0; c < cells.length; c++)
            for (var i = 1; i <= model.getSize(); i++)
                if (cells[c][2][i] && !nums.includes(i))
                    nums.push(i);
        nums.sort();

        if (nums.length === cells.length) {
            var updates = [],
                owners = [];

            for (var i = 0; i < cells.length; i++)
                owners.push(isRow ? cells[i][0] : cells[i][1]);

            for (var i = 0; i < nums.length; i++)
                updates = isRow ? updates.concat(this.updateRowNums(cells[0][1], nums[i], owners))
                    : updates.concat(this.updateColNums(cells[0][0], nums[i], owners));

            if (updates.length > 0) {
                steps.push([false, updates]);
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

        var details,
            updates = [];
        for (var i = 0; i < model.getSize(); i++) {
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

        var details,
            updates = [];
        for (var i = 0; i < model.getSize(); i++) {
            if (!owners.includes(i) && this.isCellNoted([col, i])) {
                details = model.getDetails(col, i);
                if (details[num] === true) {
                    updates.push([col, i, [num]]);
                }
            }
        }
        return updates;
    };

// Checks if the puzzle is solved (only checks if all cells are with some numbers in them)
    this.isSolved = function () {
        var cellGroups = model.getCellGroups();

        for (var x = 0; x < cellGroups.length; x++)
            for (var y = 0; y < cellGroups.length; y++)
                if (!this.isCellNumber([x, y])) return false;
        return true;
    };

// Checks if the number is not taken in that row / column
    this.isAvailable = function (number, x, y) {
        return (rowNums[y][number] === undefined || rowNums[y][number].includes(x)) && (colNums[x][number] === undefined || colNums[x][number].includes(y));
    };

// array[cellNumber][x / y]
    this.findCellsInGroup = function (i, allCells) {
        var cells = [],
            cellGroups = model.getCellGroups();

        if (allCells === undefined) {
            for (var x = 0; x < cellGroups.length; x++)
                for (var y = 0; y < cellGroups.length; y++)
                    if (cellGroups[x][y] === i) cells.push([x, y]);
        } else
            for (var index = 0; index < allCells.length; index++)
                if (cellGroups[allCells[index][0]][allCells[index][1]] === i) cells.push(allCells[index].slice());
        return cells;
    };

// Returns all noted cells in a row
    this.notedCellsInRow = function (cells, row) {
        var c = [];
        for (var i = 0; i < cells.length; i++)
            if (cells[i][1] === row && this.isCellNoted([cells[i][0], cells[i][1]]))
                c.push(cells[i].slice());
        return c;
    };

// Returns all noted cells in a column
    this.notedCellsInColumn = function (cells, col) {
        var c = [];
        for (var i = 0; i < cells.length; i++)
            if (cells[i][0] === col && this.isCellNoted([cells[i][0], cells[i][1]]))
                c.push(cells[i].slice());
        return c;
    };

// Check if cell has number in it
    this.isCellEmpty = function (cell) {
        var details = model.getDetails(cell[0], cell[1]);
        if (Array.isArray(details)) {
            for (var i = 1; i <= model.getSize(); i++)
                if (details[i])
                    return false;
        } else return false;
        return true;
    };

// Check if cell has notes and is a note cell
    this.isCellNoted = function (cell) {
        if (this.isCellEmpty(cell))
            return false;
        var details = model.getDetails(cell[0], cell[1]);
        for (var i = 1; i <= model.getSize(); i++)
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
            for (var i = 0; i < cells.length; i++)
                cells[i] = [cells[i]];
            return cells;
        }

        var c = [];
        var c_;
        for (var i = 0; i < cells.length - (count - 1); i++) {
            c_ = [cells[i]];
            var c__ = this.pickXcells(cells.slice().splice(i + 1), count - 1);
            for (var i_ = 0; i_ < c__.length; i_++)
                c.push(c_.slice().concat(c__[i_]));
        }
        return c;
    };

// Advances solution by a Step
    this.nextStep = function () {
        if (steps.length > currentStep) {
            var mSteps = steps[currentStep][1];
            if (steps[currentStep][0])
                for (var i = 0; i < mSteps.length; i++)
                    model.setNumber(mSteps[0], mSteps[1], mSteps[2]);
            else {
                for (var i = 0; i < mSteps.length; i++)
                    for (var n = 0; n < mSteps[i][2].length; n++)
                        model.setNote(mSteps[i][0], mSteps[i][1], mSteps[i][2][n]);
            }
            currentStep++;
        }

        // Removes cells with numbers in them and updates their details
        for (var i = cells.length - 1; i >= 0; i--)
            if (this.isCellNumber(cells[i]))
                cells.splice(i, 1);
            else cells[i][2] = model.getDetails(cells[i][0], cells[i][1]);
    };

// Reverts the last Step
    this.previousStep = function () {
        if (currentStep !== 0) {
            currentStep--;
            var mSteps = steps[currentStep][1];
            if (steps[currentStep][0])
                for (var i = 0; i < mSteps.length; i++)
                    model.setNumber(mSteps[0], mSteps[1], mSteps[2]);
            else
                for (var i = 0; i < mSteps.length; i++)
                    for (var n = 0; n < mSteps[i][2].length; n++)
                        model.setNote(mSteps[i][0], mSteps[i][1], mSteps[i][2][n]);
        }
    };
}