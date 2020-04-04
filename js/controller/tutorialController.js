"use strict";

var view = new View(),
    model = new Model(),
    controller;

function Controller() {
    this.init = function () {
        model.loadPuzzle("3100000100020103030113045633");
        view.init();

        controller.buttonListener();

        model.initSolver();
        view.solve();
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
            if(solver.solved())
                window.location.replace("example.html");
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