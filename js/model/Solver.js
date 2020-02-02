function Solver() {
    // Steps format [numberStep, [x, y, number]]
    //              [numberStep, [x, y, [notes]]]
    var steps = [];
    var currentStep = 0;

    this.solve = function () {
        // Checking for given numbers
        var groups = model.getGroups();
        for (var i = 0; i < groups.length; i++) {
            if (groups[i][0] === 0) {
                var cell = this.findCellsInGroup(i)[0];
                steps.push([true, [cell[0], cell[1], groups[i][1]]]);
                this.nextStep();
            }
        }

        this.cellPairs();
    };

    // Finding cell pairs
    this.cellPairs = function () {
        for (var i = 0; i < model.getGroups().length; i++) {
            var cells = this.findCellsInGroup(i);
            if (this.emptyCellsInGroup(cells) === 2) {
                // Removes cells with numbers in them
                for (var t = cells.length - 1; t >= 0; t--)
                    if (!this.isCellEmpty(cells[t]))
                        cells.splice(t, 1);

                // Adds the notes to the cell structure
                for (var t = 0; t < cells.length; t++)
                    cells[t][2] = model.getDetails(cells[t][0], cells[t][1]);

                var step = this.pairsPopulate(cells, model.getCellGroups()[cells[0][0]][cells[0][1]]);
                steps.push(step);
            }
        }
    };

    // Populate cell pairs with notes
    this.pairsPopulate = function (cells, g) {
        var group = model.getGroups()[g];
        switch (group[0]) {
            case(1):
                cells = this.pairsAddition(cells, group[1], 0);
                break;
            case(2):
                cells = this.pairsSubtraction(cells, group[1]);
                break;
            case(3):
                cells = this.pairsMultiplication(cells, group[1], 0);
                break;
            case(4):
                cells = this.pairsDivision(cells, group[1]);
                break;
        }

        // Translate this step format to the main one
        // This step format - [[x, y, [, num_1_bool, num_2_bool...]]
        var step = [false, []];
        for (var i = 0; i < cells.length; i++) {
            step[1].push([cells[i][0], cells[i][1], []]);
            for (var n = 1; n <= model.getSize(); n++)
                if (cells[i][2][n])
                    step[1][i][2].push(n);
        }

        return step;
    };

    // Initializes addition notes for groups of cells
    this.pairsAddition = function (cells, sum, i) {
        // Check if last cell in group has a number that fits
        if (cells.length - 1 === i) {
            if (sum > model.getSize())
                return;
            for (var c = 0; c < i; c++)
                if ((cells[c][0] === cells[i][0] || cells[c][1] === cells[i][0]) && cells[c][2][sum] === 0)
                    return;
            cells[i][2][sum] = true;
            return cells;
        }

        var option = false,
            invalid = false;

        // Go through all possible numbers in the cell
        for (var n = 1; n <= model.getSize(); n++) {
            // Check if number if valid
            if (sum - n > 0) {
                // Checks if the number is already considered for usage
                for (var c = 0; c < i; c++)
                    if ((cells[c][0] === cells[i][0] || cells[c][1] === cells[i][1]) && cells[c][2][n] === 0) {
                        invalid = true;
                        break;
                    }
                if (invalid) {
                    invalid = false;
                    continue;
                }

                // Setups the number as the option
                var t = cells[i][2][n];
                cells[i][2][n] = 0;
                var result = this.pairsAddition(cells, sum - n, i + 1);

                // Process the return value
                if (result !== undefined) {
                    option = true;
                    cells = result;
                    cells[i][2][n] = true;
                } else
                    cells[i][2][n] = t;
            }
        }

        return option ? cells : undefined;
    };

    // Initializes subtraction notes for groups of cells
    this.pairsSubtraction = function (cells, res) {
        var option = false;

        // Pick a cell as the starting cell
        for (var start = 0; start < cells.length; start++) {
            // Go through all possible numbers in the cell
            for (var n = 1; n <= model.getSize(); n++) {
                if (n > res) {
                    // Setup for the fiasco
                    var t = cells[start][2][n];
                    cells[start][2][n] = 0;
                    cells[start][2][0] = 0;

                    var result = this.pairsSubtractionLoop(cells, res, n, start === 0 ? 1 : 0);

                    // Process the return value
                    if (result !== undefined) {
                        option = true;
                        cells = result;
                        cells[start][2][n] = true;
                    } else
                        cells[start][2][n] = t;
                    cells[start][2][0] = '';
                }
            }
        }

        return option ? cells : undefined;
    };

    this.pairsSubtractionLoop = function (cells, res, start, i) {
        // Check if last cell in group has a number that fits
        if (cells.length - 1 === i || (cells.length - 2 === i && cells[cells.length - 1][2][0] === 0)) {
            if (start - res > model.getSize())
                return;
            // Checks if the number is already considered for usage
            for (var c = 0; c < cells.length; c++) {
                if (i === c) continue;
                if ((cells[c][0] === cells[i][0] || cells[c][1] === cells[i][1]) && cells[c][2][start - res] === 0)
                    return;
            }

            cells[i][2][start - res] = true;
            return cells;
        }

        // Not a loop, supports only 2 cells at the time
    };

// Initializes multiplication notes for groups of cells
    this.pairsMultiplication = function (cells, res, i) {
        // Check if the last cell in group has a number that fits
        if (cells.length - 1 === i) {
            if (res > model.getSize())
                return;
            // Checks if the number us already considered for usage
            for (var c = 0; c < cells.length - 1; c++) {
                if ((cells[c][0] === cells[i][0] || cells[c][1] === cells[i][1]) && cells[c][2][res] === 0)
                    return;
            }

            cells[i][2][res] = true;
            return cells;
        }

        var option = false,
            invalid = false;

        // Go through all possible numbers in the cell
        for (var n = 1; n <= model.getSize(); n++) {
            // Check if number if valid
            if (res % n === 0) {
                // Checks if the number is already considered for usage
                for (var c = 0; c < i; c++)
                    if ((cells[c][0] === cells[i][0] || cells[c][1] === cells[i][1]) && cells[c][2][n] === 0) {
                        invalid = true;
                        break;
                    }
                if (invalid) {
                    invalid = false;
                    continue;
                }

                // Setups the number as the option
                var t = cells[i][2][n];
                cells[i][2][n] = 0;
                var result = this.pairsAddition(cells, res / n, i + 1);

                // Process the return value
                if (result !== undefined) {
                    option = true;
                    cells = result;
                    cells[i][2][n] = true;
                } else
                    cells[i][2][n] = t;
            }
        }

        return option ? cells : undefined;
    };

// Initializes division notes for groups of cells
    this.pairsDivision = function (cells, res) {
        var option = false;

        // Pick a cell as the starting cell
        for (var start = 0; start < cells.length; start++) {
            // Go through all possible numbers in the cell
            for (var n = 1; n <= model.getSize(); n++) {
                if (n % res === 0) {
                    // Setup for the fiasco
                    var t = cells[start][2][n];
                    cells[start][2][n] = 0;
                    cells[start][2][0] = 0;

                    var result = this.pairsDivisionLoop(cells, res, n, start === 0 ? 1 : 0);

                    // Process the return value
                    if (result !== undefined) {
                        option = true;
                        cells = result;
                        cells[start][2][n] = true;
                    } else
                        cells[start][2][n] = t;
                    cells[start][2][0] = '';
                }
            }
        }

        return option ? cells : undefined;
    };

    this.pairsDivisionLoop = function (cells, res, start, i) {
        // Check if last cell in group has a number that fits
        if (cells.length - 1 === i || (cells.length - 2 === i && cells[cells.length - 1][2][0] === 0)) {
            if (start / res > model.getSize())
                return;
            // Checks if the number is already considered for usage
            for (var c = 0; c < cells.length; c++) {
                if (i === c) continue;
                if ((cells[c][0] === cells[i][0] || cells[c][1] === cells[i][1]) && cells[c][2][start - res] === 0)
                    return;
            }

            cells[i][2][start / res] = true;
            return cells;
        }

        // Not a loop, supports only 2 cells at the time
    };

// array[cellNumber][x / y]
    this.findCellsInGroup = function (i) {
        var cells = [],
            cellGroups = model.getCellGroups();

        for (var x = 0; x < cellGroups.length; x++)
            for (var y = 0; y < cellGroups.length; y++)
                if (cellGroups[x][y] === i) cells.push([x, y]);

        return cells;
    };

    this.emptyCellsInGroup = function (cells) {
        var count = 0;
        for (var i = 0; i < cells.length; i++)
            if (Array.isArray(model.getDetails(cells[i][0], cells[i][1])))
                count++;
        return count;
    };

// Check if cell has number in it
    this.isCellEmpty = function (cell) {
        return Array.isArray(model.getDetails(cell[0], cell[1]));
    };

// Check if cell has notes
    this.isCellNoted = function (cell) {
        var details = model.getDetails(cell[0], cell[1]);
        for (var i = 1; i <= model.getSize(); i++)
            if (details[i])
                return false;
        return true;

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