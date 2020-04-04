function Solver() {
// Steps format [numberStep, [x, y, number]]
//              [numberStep, [[x, y, [notes]]]]
// New format [[[x, y, number], ...], [[x, y, [notes]], ...]]
    var steps = [],
        stepInfo = [],
        currentStep = 0;

    var cells = [];

    this.solve = function () {
        steps.push([[[0, 0, 1], [1, 0, 2], [2, 0, 3]]]);
        steps.push([[[0, 0, 1], [1, 0, 2], [2, 0, 3]]]);
        steps.push([[[1, 1, 3]]]);
        steps.push([[[1, 1, 3]]]);
        steps.push([[]]);
        steps.push([[]]);
        steps.push([[]]);
        steps.push([[]]);

        stepInfo.push(["Each number has to be unique in its respective row / column.", [[0, 0], [2, 0]], [[1, 0]]]);
        stepInfo.push(["Cells are divided into cages, each with its respective mathematical function."]);
        stepInfo.push(["Single cell cages have the number given in the corner.", [], [[1, 1]]]);
        stepInfo.push(["For cages with addition, just add all the numbers to gain the one displayed in the corner.", [[0, 0], [1, 0], [0, 1]]]);
        stepInfo.push(["Multiplication - Multiply all numbers.", [[2, 0], [2, 1], [2, 2]]]);
        stepInfo.push(["Division - Divide the largest number by the rest.", [[0, 2], [1, 2]]]);
        stepInfo.push(["Now lets look at a solution of a bit more difficult puzzle!"]);
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

    this.resetSteps = function () {
        for (; currentStep > 0; this.previousStep()) ;
    };

    this.solved = function () {
        return currentStep === steps.length;
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
            view.setStepExplanation("");
        else {
            let si = stepInfo[currentStep - 1];
            view.setStepExplanation(si[0]);
            for (let i = 0; i < si[1].length; i++) view.highlightCell(si[1][i][0], si[1][i][1]);
            if (si[2] !== undefined)
                for (let i = 0; i < si[2].length; i++) view.highlightCell(si[2][i][0], si[2][i][1], "#89c9ff");
        }
    };
}