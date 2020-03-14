"use strict";

function View() {
    // Grid
    var gridSize = 75,
        gameSize = 0,
        grid = $("#KenKenGrid"),
        gridCells = [],
        activeCell,
        activeMode = 0;
    // Buttons
    var solveButton = $(".mButton:contains('Solve')")[0],
        next = $("#next")[0],
        prev = $("#prev")[0],
        steps = $("#steps")[0],
        stepCount = $("#step_count")[0],
        currentStep = $("#current_step")[0],
        stepName = $("#stepName")[0];

    this.init = function () {
        this.grid(model.getSize());
        this.setHints();
    };

    this.setBorders = function () {
        let cellGroups = model.getCellGroups(),
            size = model.getSize();
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (x !== size - 1 && cellGroups[x][y] !== cellGroups[x + 1][y]) {
                    gridCells[y * size + x].style.borderRightWidth = "3px";
                    gridCells[y * size + x].style.width = gridSize - 4 + "px";
                }
                if (y !== size - 1 && cellGroups[x][y] !== cellGroups[x][y + 1]) {
                    gridCells[y * size + x].style.borderBottomWidth = "3px";
                    gridCells[y * size + x].style.height = gridSize - 4 + "px";
                }
            }
        }
    };

    this.setHints = function () {
        var cellGroups = model.getCellGroups(),
            groups = model.getGroups(),
            size = model.getSize();

        var groupIndex = 0;
        for (var y = 0; y < size; y++) {
            for (var x = 0; x < size; x++) {
                if (groupIndex === cellGroups[x][y]) {
                    var hint = groups[groupIndex][1];
                    switch (groups[groupIndex][0]) {
                        case(1):
                            hint += "+";
                            break;
                        case(2):
                            hint += "-";
                            break;
                        case(3):
                            hint += "x";
                            break;
                        case(4):
                            hint += "÷";
                            break;
                        default:
                    }
                    gridCells[y * size + x].innerHTML = "<div class='hint'>" + hint + "</div>";
                    if (groupIndex === groups.length)
                        return;
                    groupIndex++;
                }
            }
        }
    };

    this.clean = function () {
        grid.empty();
        solver = '';
        solveButton.hidden = false;
        next.hidden = true;
        prev.hidden = true;
        steps.hidden = true;
    };

    this.grid = function (size) {
        this.clean();

        gameSize = size;

        for (var i = 0; i < size; i++) {
            grid.append("<div class='gridRow'></div>");
        }

        $(".gridRow").each(function () {
            for (var i = 0; i < size; i++) {
                $(this).append("<div class='gridCell'></div>");
            }
        });

        gridCells = $(".gridCell");

        this.setGridSize(gridSize);
        this.setGridPress();
    };

    this.setGridSize = function (size) {
        gridSize = size;
        grid.width(gameSize * size).height(gameSize * size);
        $(".gridRow").height(size);
        $(".gridCell").width(size - 2).height(size - 2);

        this.setBorders();
    };

    this.setNumber = function (x, y, number) {
        var cell = gridCells[y * model.getSize() + x].getElementsByClassName("number")[0],
            note = gridCells[y * model.getSize() + x].getElementsByClassName("note")[0];
        if (note !== undefined)
            note.style.display = "none";

        if (cell === undefined) {
            gridCells[y * model.getSize() + x].innerHTML += "<div class='number'>" + number + "</div>";
            return;
        }
        if (cell.innerText * 1 === number)
            this.removeNumber(x, y);
        else
            cell.innerText = number;
    };

    this.hasNumber = function (x, y) {
        return gridCells[y * model.getSize() + x].getElementsByClassName("number")[0] !== undefined;
    };

    this.removeNumber = function (x, y) {
        var cell = gridCells[y * model.getSize() + x].getElementsByClassName("number")[0],
            note = gridCells[y * model.getSize() + x].getElementsByClassName("note")[0];

        if (cell !== undefined) {
            if (note !== undefined)
                note.style.display = "block";
            gridCells[y * model.getSize() + x].removeChild(cell);
        }
    };

    this.clearCell = function (x, y) {
        var cell = gridCells[y * model.getSize() + x].getElementsByClassName("number")[0],
            note = gridCells[y * model.getSize() + x].getElementsByClassName("note")[0];
        if (cell !== undefined)
            gridCells[y * model.getSize() + x].removeChild(cell);
        if (note !== undefined)
            gridCells[y * model.getSize() + x].removeChild(note);
    };

    this.setNote = function (x, y, number) {
        var cell = gridCells[y * model.getSize() + x].getElementsByClassName("note")[0];
        if (cell === undefined) {
            gridCells[y * model.getSize() + x].innerHTML += "<div class='note'>" + number + "</div>";
            return;
        }
        var note = cell.innerText;
        for (var i = 0; i < note.length; i++) {
            if (note.slice(i, i + 1) * 1 === number) {
                note = note.slice(0, i) + note.slice(i + 1);
                break;
            } else if (note.slice(i, i + 1) * 1 > number) {
                note = note.slice(0, i) + number + note.slice(i);
                break;
            } else if (i === note.length - 1) {
                note += number;
                break;
            }
        }
        if (note === "") {
            gridCells[y * model.getSize() + x].removeChild(cell);
            return;
        }
        cell.innerText = note;
    };

    this.highlightCell = function (x, y, color) {
        if (color === undefined)
            color = "#ff9490";
        gridCells[y * model.getSize() + x].style.backgroundColor = color;
    };

    this.highlightNumber = function (x, y, numbers) {
        var cell = gridCells[y * model.getSize() + x].getElementsByClassName("note")[0];

        if (cell !== undefined) {
            var note = cell.innerText;
            var i = 0, t = 0,
                final = "";
            while (i < note.length) {
                if (numbers[t] === note[i]) {
                    final += '<font color="#ff6e68">' + note[i] + '</font>';
                    i++;
                    t++;
                } else if (numbers[t] > note[i] || t >= numbers.length) {
                    final += note[i];
                    i++;
                } else
                    t++;
            }

            cell.innerHTML = final;
        }
    };

    this.highlightRow = function (y) {
        for (var i = 0; i < model.getSize(); i++)
            this.highlightCell(i, y);
    };

    this.highlightColumn = function (x) {
        for (var i = 0; i < model.getSize(); i++)
            this.highlightCell(x, i);
    };

    this.highlightCellGroup = function (cellGroup) {
        var groups = model.getCellGroups();
        for (var y = 0; y < model.getSize(); y++)
            for (var x = 0; x < model.getSize(); x++)
                if (groups[x][y] === cellGroup)
                    this.highlightCell(x, y);
    };

    this.removeHighlights = function () {
        for (var i = 0; i < gridCells.length; i++)
            gridCells[i].style.backgroundColor = "transparent";
    };

    this.onGridChange = function (f) {
        $("#selectGridSize")[0].addEventListener("change", f);
    };

    this.setGridPress = function () {
        var f = function (i) {
            activeCell = i;
            view.removeHighlights();
            view.highlightCell(i % view.getGameSize(), Math.floor(i / view.getGameSize()));
        };

        for (var i = 0; i < gridCells.length; i++) {
            gridCells[i].addEventListener("click", f.bind(this, i));
        }
    };

    this.setActiveMode = function (n) {
        if (activeMode !== n * 1)
            $(".mButton").toggleClass("mButtonActive");
        activeMode = n * 1 === 0 ? 0 : 1;
    };

    this.keyboardNumber = function (n) {
        if (activeCell !== undefined && n <= gameSize) {
            var x = activeCell % view.getGameSize(),
                y = Math.floor(activeCell / view.getGameSize());
            if (activeMode === 0)
                model.setNumber(x, y, n * 1);
            else if (!view.hasNumber(x, y))
                model.setNote(x, y, n * 1);
        }
    };

    this.keyboardDelete = function () {
        if (activeCell !== undefined) {
            view.clearCell(activeCell % view.getGameSize(), Math.floor(activeCell / view.getGameSize()));
        }
    };

    this.getGameSize = function () {
        return gameSize;
    };

    this.solve = function () {
        solveButton.hidden = true;
        next.hidden = false;
        prev.hidden = false;
        steps.hidden = false;
        stepCount.innerText = solver.getStepCount();
        currentStep.innerText = 0;
    };

    this.setCurrentStep = function (step) {
        currentStep.innerText = step;

        prev.disabled = step === 0;
        next.disabled = step === solver.getStepCount();
    };

    this.setStepExplanation = function (stepName_) {
        stepName.innerText = stepName_;
    };
}