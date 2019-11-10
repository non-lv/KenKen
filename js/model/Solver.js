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


    };

    this.findCellsInGroup = function (i) {
        var cells = [],
            cellGroups = model.getCellGroups();

        for (var x = 0; x < cellGroups.length; x++)
            for (var y = 0; y < cellGroups.length; y++)
                if (cellGroups[x][y] === i) cells.push([x, y]);

        return cells;
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