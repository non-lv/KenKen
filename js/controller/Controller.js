"use strict";

var view = new View(),
    model = new Model(),
    controller;

function Controller() {
    this.init = function () {
        model.loadPuzzle("310000010203010203041222052122");
        view.init();

        view.onGridChange(function () {
            switch ($("#selectGridSize")[0].value) {
                case ("3"):
                    view.clean();
                    model.loadPuzzle("310000010203010203041222052122");
                    view.init();
                    break;
                case("4"):
                    view.clean();
                    switch (Math.floor(Math.random() * 2)) {
                        case(0):
                            model.loadPuzzle("41000001020303010204030505040606072121121015183163");
                            break;
                        default:
                            model.loadPuzzle("41000102020001030304040506070705062422321112316245");
                    }
                    view.init();
                    break;
                case("5"):
                    view.clean();
                    model.loadPuzzle("510000010102030304040203030506060707050809071010080922113321332235CAC37652");
                    view.init();
                    break;
                case("6"):
                    view.clean();
                    model.loadPuzzle("6200000102020203000104040503060607070503080809100511110809121311111414121332111132320324148010807060E06011E0302B4010207");
                    view.init();
                    break;
                case("7"):
                    view.clean();
                    model.loadPuzzle("72000000010203030400050102060604070508080910110712081309101114121313151516141717181819162020202121193334112414112134223232D8140E02080B01020C02070703101E03010107010E01");
                    view.init();
                    break;
                case("8"):
                    view.clean();
                    model.loadPuzzle("82000001020304050506060102030405070608080909101007110812121210130711141515161613171114181819191317202021221923232425252122222224244222433312331122341331141103070404028C5410110546F00B0607051402092A060812021106");
                    view.init();
                    break;
                case("9"):
                    view.clean();
                    model.loadPuzzle("9400010101020203030400050505060207080409091010060707081112120606061313111114141506061617171819201521221616231819202421222526232728282429292526302731313132323333302731343331143122341241242341412423220024000E005A00040014009076200009000A0002002A001300010001000F0003001A00050004000D000600030001002D000200050004000B000400040004007800030003");
                    view.init();
                    break;
                default:
            }
        });

        controller.keyPressListener();
        controller.buttonListener();
    };

    this.keyPressListener = function () {
        $("#KenKenGrid").keyup(function (e) {
            var number = RegExp("^[1-9]$");
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
        var buttons = $(".mButton");
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
        // $(".mButton").click(function () {
        //     if (this.innerHTML === "Solve") {
        //         model.initSolver();
        //         view.solve();
        //     } else if (this.id === "next") {
        //         solver.nextStep();
        //     } else if (this.id === "prev") {
        //         solver.previousStep();
        //     } else if (this.innerHTML === "Normal") {
        //         view.setActiveMode(0);
        //     } else
        //         view.setActiveMode(1);
        // });
    };
}

controller = new Controller();
window.addEventListener("load", controller.init);