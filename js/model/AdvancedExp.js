function AdvancedExp(stepInfo) {
    let info = stepInfo;

    this.advance = function () {
        for (let i = 0; i < info.length; i++) {
            switch (info[i][0]) {
                case(addedNotes):
                    this.addedNotes(info[i][1]);
                    break;
                case(updatedNotes):
                    this.updatedNotes(info[i][1]);
                    break;
            }
        }
    };

    this.addedNotes = function (notes) {
        // Get cells in the note range
        // Calc note diff
        // Show restrictions for difference
        // Explain rest of difference as a result of the other restrictions / math sign
    };

    this.updatedNotes = function () {

    };

    this.noteDifference = function () {

    };

    this.basicNotes = function (cells) {
        let result, info = model.getGroups()[model.getCellGroups()[cells[0][0]][cells[0][1]]];
        switch (info[0]) {
            case(1):
                result = this.basicAddition(cells, info[1], 0);
                break;
            case(2):
                result = this.basicSubtraction(cells, info[1]);
                break;
            case(3):
                result = this.basicMultiplication(cells, info[1], 0);
                break;
            case(4):
                result = this.basicDivision(cells, info[1]);
                break;
        }
        return result;
    };

// Gets all Addition note options
    this.basicAddition = function (cells, sum, i) {
        // Check if last cell in group has a number that fits
        if (cells.length - 1 === i) {
            if (sum > model.getSize() || cells[i][2][sum] === false)
                return;
            for (let c = 0; c < i; c++)
                if ((cells[c][0] === cells[i][0] || cells[c][1] === cells[i][1]) && cells[c][2][sum] === 1)
                    return;
            cells[i][2][sum] = 2;
            return cells;
        }

        let option = false;

        // Go through all possible numbers in the cell
        number:
            for (let n = 1; n <= model.getSize(); n++) {

                // Check if number if valid
                if (sum - n > 0 && (cells[i][2][n] === 0 || cells[i][2][n] === 2)) {
                    // Checks if the number is already considered for usage
                    for (let c = 0; c < i; c++)
                        if ((cells[c][0] === cells[i][0] || cells[c][1] === cells[i][1]) && cells[c][2][n] === 1)
                            continue number;

                    // Setups the number as the option
                    let t = cells[i][2][n];
                    cells[i][2][n] = 1;
                    let result = this.basicAddition(cells, sum - n, i + 1);

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

// Gets all Subtraction note options
    this.basicSubtraction = function (cells, res) {
        let option = false;

        // Pick a cell as the starting cell
        for (let start = 0; start < cells.length; start++) {
            // Go through all possible numbers in the cell
            for (let n = 1; n <= model.getSize(); n++) {
                if (n > res && (cells[start][2][n] === 0 || cells[start][2][n] === 2)) {
                    // Setup for the fiasco
                    let t = cells[start][2][n];
                    cells[start][2][n] = 1;
                    cells[start][2][0] = 0;

                    let result = this.basicSubtractionLoop(cells, res, n, start === 0 ? 1 : 0);

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

    this.basicSubtractionLoop = function (cells, res, start, i) {
        // Check if last cell in group has a number that fits
        if (cells.length - 1 === i || (cells.length - 2 === i && cells[cells.length - 1][2][0] === 0)) {
            if (start - res > model.getSize() || cells[i][2][start - res] === false)
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

// Gets all Multiplication note options
    this.basicMultiplication = function (cells, res, i) {
        // Check if the last cell in group has a number that fits
        if (cells.length - 1 === i) {
            if (res > model.getSize() || cells[i][2][res] === false)
                return;
            // Checks if the number us already considered for usage
            for (let c = 0; c < cells.length; c++) {
                if ((cells[c][0] === cells[i][0] || cells[c][1] === cells[i][1]) && cells[c][2][res] === 1)
                    return;
            }

            cells[i][2][res] = 2;
            return cells;
        }

        let option = false;

        // Go through all possible numbers in the cell
        number:
            for (let n = 1; n <= model.getSize(); n++) {
                // Check if number if valid
                if (res % n === 0 && (cells[i][2][n] === 0 || cells[i][2][n] === 2)) {
                    // Checks if the number is already considered for usage
                    for (let c = 0; c < i; c++)
                        if ((cells[c][0] === cells[i][0] || cells[c][1] === cells[i][1]) && cells[c][2][n] === 1)
                            continue number;

                    // Setups the number as the option
                    let t = cells[i][2][n];
                    cells[i][2][n] = 1;
                    let result = this.basicMultiplication(cells, res / n, i + 1);

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

// Gets all Division note options
    this.basicDivision = function (cells, res) {
        let option = false;

        // Pick a cell as the starting cell
        for (let start = 0; start < cells.length; start++) {
            // Go through all possible numbers in the cell
            for (let n = 1; n <= model.getSize(); n++) {
                if (n % res === 0 && (cells[start][2][n] === 0 || cells[start][2][n] === 2)) {
                    // Setup for the fiasco
                    let t = cells[start][2][n];
                    cells[start][2][n] = 1;
                    cells[start][2][0] = 0;

                    let result = this.basicDivisionLoop(cells, res, n, start === 0 ? 1 : 0);

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

    this.basicDivisionLoop = function (cells, res, start, i) {
        // Check if last cell in group has a number that fits
        if (cells.length - 1 === i || (cells.length - 2 === i && cells[cells.length - 1][2][0] === 0)) {
            if (start / res > model.getSize() || cells[i][2][start / res] === false)
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
}