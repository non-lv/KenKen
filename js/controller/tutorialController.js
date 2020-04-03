"use strict";

var view = new View(),
    model = new Model(),
    controller;

function Controller() {
    this.init = function () {
        model.loadPuzzle("3100000100020103030113045633");
        view.init();

        controller.keyPressListener();
        controller.buttonListener();

        model.initSolver();
        view.solve();
    };

    this.keyPressListener = function () {
        $("#KenKenGrid").keyup(function (e) {
            let number = RegExp("^[1-9]$");
            if (number.test(e.key)) {
                view.keyboardNumber(e.key);
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
            model.initSolver();
            view.solve();
        });

        buttons[1].addEventListener("click", function () {
            solver.previousStep();
        });

        buttons[2].addEventListener("click", function () {
            solver.nextStep();
        });

        buttons[3].addEventListener("click", function () {
            view.setActiveMode(0);
        });

        buttons[4].addEventListener("click", function () {
            view.setActiveMode(1);
        });
    };
}

controller = new Controller();
window.addEventListener("load", controller.init);