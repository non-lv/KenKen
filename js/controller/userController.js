"use strict";

var view = new View(),
    model = new Model(),
    controller;

function Controller() {
    this.init = function () {
        model.loadPuzzle("41000102020003030204040506070705061032242242811223");
        view.init();

        controller.keyPressListener();
        controller.buttonListener();
    };

    this.keyPressListener = function () {
        $("#KenKenGrid").keyup(function (e) {
            let number = RegExp("^[1-9]$");
            if (number.test(e.key)) {
                view.keyboardNumber(e.key);
                if (model.isFilled() && model.isSolved()) {
                    alert("Puzzle Solved!!!");
                }
            } else if (e.key === "Backspace" || e.key === "Delete") {
                view.keyboardDelete();
            } else if (e.key === "Z" || e.key === "z") {
                view.setActiveMode(0);
            } else if (e.key === "X" || e.key === "x") {
                view.setActiveMode(1);
            }
        });
    };

    this.buttonListener = function () {
        let buttons = $(".mButton");
        buttons[0].addEventListener("click", function () {
            view.setActiveMode(0);
        });

        buttons[1].addEventListener("click", function () {
            view.setActiveMode(1);
        });
    };
}

controller = new Controller();
window.addEventListener("load", controller.init);