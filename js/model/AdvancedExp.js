const onlyOption = "Only Possible Options",
    onlyOptionCol = "#2ECC66",
    restrictedNum = "Number Restricted",
    restrictedNumCol = "#F02B2B",
    _restrictedNum = "Number Eliminated due to above Restrictions",
    _restrictedNumCol = "#EC952E";

function AdvancedExp(stepInfo, steps, rFlow) {
    let info = stepInfo,
        flow = rFlow,
        resRow = [],
        resCol = [];

    let step;

    this.initRes = function () {
        for (let i = 0; i < model.getSize(); i++) {
            resRow[i] = [];
            resCol[i] = [];
        }
    };

    this.advance = function () {
        this.initRes();

        for (step = 0; step < info.length; step++) {
            switch (info[step][0]) {
                case(addedNotes):
                    this.addedNotes(steps[step][1]);
                    break;
                case(updatedOptions):
                    this.updatedNotes(steps[step][1]);
                    break;
            }
            this.flowNext(step);
            solver.nextStep();

            console.log(step);
            console.log(JSON.parse(JSON.stringify(resRow)));
        }
        solver.resetSteps();
        console.log(stepInfo);
    };

    this.addedNotes = function (notes) {
        let group = model.findCellsInGroup(model.getCellGroups()[notes[0][0]][notes[0][1]]);
        // Convert notes to proper format
        for (let i = 0; i < group.length; i++)
            // if (!Array.isArray(group[i][2])) {
            //     let num = group[i][2];
            //     group[i][2] = [];
            //     for (let t = 1; t <= model.getSize(); t++)
            //         group[i][2][t] = num === t ? 0 : false;
            // }
            // else
            for (let t = 1; t <= model.getSize(); t++)
                group[i][2][t] = 0;

        let base = this.basicNotes(group);
        // Convert to notes format [[x, y, [1, 3...]]]
        let note = [];
        for (let i = 0; i < base.length; i++) {
            note = [];
            for (let t = 1; t <= model.getSize(); t++)
                if (base[i][2][t] === 2) note.push(t);
            base[i][2] = note.slice();
        }
        let difference = this.noteDifference(notes, base);

        if (difference.length > 0) {
            stepInfo[step][0] = [];
            for (let i = 0; i < notes.length; i++) {
                stepInfo[step][0].push([onlyOption + (notes[i][2].length > 1 ? "s" : ""), onlyOptionCol, notes[i].slice()]);
            }
            // console.log(step);
            // console.log(difference);
            // console.log(JSON.parse(JSON.stringify(resCol)));
            this.restrictionSplit(difference);
        }
        // Get cells in the note range
        // Calc note diff
        // Show restrictions for difference
        // Explain rest of difference as a result of the other restrictions / math sign
    };

    this.updatedNotes = function () {
        // Get cells in the note range
        // Calc note diff
        // diff diff?
        // profit lol
    };

// Calc difference between 2 note versions
    this.noteDifference = function (notes_I, notes_II) {
        // Both notes have to be aligned
        for (let i = 0; i < notes_I.length; i++) {
            for (let t = 0; t < notes_I[i][2].length; t++) {
                let num = notes_I[i][2][t];
                if (notes_II[i][2].includes(num))
                    notes_II[i][2].splice(notes_II[i][2].indexOf(num), 1);
                else
                    notes_II[i][2].push(num);
            }
        }
        for (let i = notes_II.length - 1; i >= 0; i--)
            if (notes_II[i][2].length === 0) notes_II.splice(i, 1);

        return notes_II;
    };

// Split notes into restricted and rest
    this.restrictionSplit = function (notes) {
        for (let i = 0; i < notes.length; i++) {
            let x = notes[i][0], y = notes[i][1];
            for (let c = 0; c < notes[i][2].length; c++) {
                let number = notes[i][2][c];
                if (!this.isAvailable(number, x, y)) {
                    // console.log(step + ": " + x + " " + y + " " + number);
                    let restrictors = [];
                    if (resRow[y][number] !== undefined && !resRow[y][number].includes(x))
                        for (let t = 0; t < resRow[y][number].length; t++)
                            restrictors.push([resRow[y][number][t], y]);
                    else
                        for (let t = 0; t < resCol[x][number].length; t++)
                            restrictors.push([x, resCol[x][number][t]]);
                    stepInfo[step][0].push([restrictedNum, restrictedNumCol, [x, y, number], restrictors]);
                } else {
                    stepInfo[step][0].push([_restrictedNum, _restrictedNumCol, [x, y, number]]);
                    // console.log(step + " r: " + x + " " + y + " " + number);
                }
            }
        }
    };

// Checks if the number is not taken in that row / column
    this.isAvailable = function (number, x, y) {
        return (resRow[y][number] === undefined || resRow[y][number].includes(x)) && (resCol[x][number] === undefined || resCol[x][number].includes(y));
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

    this.flowNext = function (i) {
        if (flow[i] !== undefined) {
            // Update Row Restrictions
            for (let t = 0; t < flow[i][0].length; t++) {
                let data = flow[i][0][t];
                if (resRow[data[0]] === undefined)
                    resRow[data[0]] = [];
                resRow[data[0]][data[1]] = data[2];
            }
            // Update Col Restrictions
            for (let t = 0; t < flow[i][1].length; t++) {
                let data = flow[i][1][t];
                if (resCol[data[0]] === undefined)
                    resCol[data[0]] = [];
                resCol[data[0]][data[1]] = data[2];
            }
        }
    }
}