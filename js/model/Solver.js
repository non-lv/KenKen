function Solver() {
    var steps = [];
    var currentStep = 0;

    this.solve = function () {
        // Checking for given numbers
        var groups = model.getGroups();
        for (var i = 0; i < groups.length; i++) {
            if (groups[i][0] === 0) {
                var cell = this.findCellsInGroup(i)[0];
                steps.push([true, cell[0], cell[1], groups[i][1]]);
                this.nextStep();
            }
        }

        // Finding cell pairs
        for (var i = 0; i < groups.length; i++) {
            var cells = this.findCellsInGroup(i);
            if (this.emptyCellsInGroup(cells) === 2) {
                // Removes cells with numbers in them
                for (var t = cells.length - 1; t >= 0; t--)
                    if (!this.isCellEmpty(cells[t]))
                        cells.splice(t, 1);

                for (var t = 0; t < cell.length; t++)
                    cells[t][2] = model.getDetails(cells[t][0], cells[t][1]);
                this.populate(cells, model.getCellGroups()[cells[0][0]][cells[0][1]]);
            }
        }
    };

    this.populate = function (cells, g) {
        var group = model.getGroups()[g];
        switch (group[0]) {
            case(1):
                cells = this.addition(cells, group[1], 0);
                break;
            case(2):
                break;
            case(3):
                break;
            case(4):
                break;
        }

        return cells;
    };

    // Initializes addition notes for groups of cells
    this.addition = function (cells, sum, i) {
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
                // Checks if there are any cells that restrict the usage of that number
                for (var c = 0; c < i; c++)
                    if ((cells[c][0] === cells[i][0] || cells[c][1] === cells[i][0]) && cells[c][2][n] === 0) {
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
                var result = this.addition(cells, sum - n, i + 1);

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
    this.subtraction = function (cells, sum, i) {

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
            if (steps[currentStep][0])
                model.setNumber(steps[currentStep][1], steps[currentStep][2], steps[currentStep][3]);
            else
                model.setNote(steps[currentStep][1], steps[currentStep][2], steps[currentStep][3]);
            currentStep++;
        }
    };

    // Reverts the last Step
    this.previousStep = function () {
        if (currentStep !== 0) {
            currentStep--;
            if (steps[currentStep][0])
                model.setNumber(steps[currentStep][1], steps[currentStep][2], steps[currentStep][3]);
            else
                model.setNote(steps[currentStep][1], steps[currentStep][2], steps[currentStep][3]);
        }
    };
}