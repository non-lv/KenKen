"use strict";

function View() {
    var gridSize = 75,
        gameSize = 0,
        grid = $("#KenKenGrid"),
        gridCells = [];

    this.init = function () {
        this.grid(model.getSize());
        this.setHints();
    };

    this.setBorders = function () {
        var cellGroups = model.getCellGroups(),
            size = model.getSize();
        for (var y = 0; y < size; y++) {
            for (var x = 0; x < size; x++) {
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
                            hint += "*";
                            break;
                        case(4):
                            hint += "/";
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

    this.removeNumber = function (x, y) {
        var cell = gridCells[y * model.getSize() + x].getElementsByClassName("number")[0],
            note = gridCells[y * model.getSize() + x].getElementsByClassName("note")[0];

        if (cell !== undefined) {
            if (note !== undefined)
                note.style.display = "block";
            gridCells[y * model.getSize() + x].removeChild(cell);
        }
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

    this.highlightCell = function (x, y) {
        gridCells[y * model.getSize() + x].style.backgroundColor = "#ff6e68";
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
}