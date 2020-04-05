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
                    switch (Math.floor(Math.random() * 8)) {
                        case(0):
                            model.loadPuzzle("310000010203010203041222052122");
                            break;
                        case(1):
                            model.loadPuzzle("310000010202010304044210422532");
                            break;
                        case(2):
                            model.loadPuzzle("3100010200030204030310430513C1");
                            break;
                        case(3):
                            model.loadPuzzle("32000101000201020203431002120601");
                            break;
                        case(4):
                            model.loadPuzzle("3100010100000203020232103162");
                            break;
                        case(5):
                            model.loadPuzzle("310000010203010203041111053343");
                            break;
                        case(6):
                            model.loadPuzzle("310001010201030204040120217112");
                            break;
                        default:
                            model.loadPuzzle("310000010203010203043434032623");
                    }
                    view.init();
                    break;
                case("4"):
                    view.clean();
                    switch (Math.floor(Math.random() * 6)) {
                        case(0):
                            model.loadPuzzle("41000001020303010204030505040606072121121015183163");
                            break;
                        case(1):
                            model.loadPuzzle("4100010202000302040003030405050504101111647797");
                            break;
                        case(2):
                            model.loadPuzzle("41000001020304010205040606050707062120211223112771");
                            break;
                        case(3):
                            model.loadPuzzle("410001020200010303000405050404050633433308C266C4");
                            break;
                        case(4):
                            model.loadPuzzle("4200000102030301020304040506060405422314402010224080202");
                            break;
                        default:
                            model.loadPuzzle("41000102020001030304040506070705062422321112316245");
                    }
                    view.init();
                    break;
                case("5"):
                    view.clean();
                    switch (Math.floor(Math.random() * 5)) {
                        case(0):
                            model.loadPuzzle("510000010102030304040203030506060707050809071010080922113321332235CAC37652");
                            break;
                        case(1):
                            model.loadPuzzle("510001010101000203040506020304040607080904060708090911111011116D39C19859");
                            break;
                        case(2):
                            model.loadPuzzle("51000102020300010204030506060407050808070709090910102111122111124C6342A796");
                            break;
                        case(3):
                            model.loadPuzzle("520000010101000203040405020304060505070606080808090933343330340C0A0A020F083C030F02");
                            break;
                        default:
                            model.loadPuzzle("5200000101010203030404050506070708060609090810100911430122121120023C030703020701050D0102");
                    }
                    view.init();
                    break;
                case("6"):
                    view.clean();
                    model.loadPuzzle("");
                    switch (Math.floor(Math.random() * 4)) {
                        case(0):
                            model.loadPuzzle("6100000102020200010103040405060303070705060808080910061112120913131111120911111111110111BBAA78F56B4AF3");
                            break;
                        case(1):
                            model.loadPuzzle("610000000101020304040502020306070508091006071108091012071113141212151513141212222111221222F1B12246A712E325");
                            break;
                        case(2):
                            model.loadPuzzle("6300000101020203040101010504040606050507080806090907101011110910101011111133403334333300F02800300606000F02400200F0180F0168");
                            break;
                        default:
                            model.loadPuzzle("63000001010102030405050102030406060707030806090910110812121313141412151513432112321200112200216800100F00500502D00200B00100600300A00B001005");
                    }
                    view.init();
                    break;
                case("7"):
                    view.clean();
                    switch (Math.floor(Math.random() * 3)) {
                        case(0):
                            model.loadPuzzle("72000000010203030400050102060604070508080910110712081309101114121313151516141717181819162020202121193334112414112134223232D8140E02080B01020C02070703101E03010107010E01");
                            break;
                        case(1):
                            model.loadPuzzle("72000001020304050606020203040507080802090405071010100911111212131314151516161717141819202020171418192032314221322412411410505E0012A0C020103030F0103020C01021205020C");
                            break;
                        default:
                            model.loadPuzzle("72000101020303040001050506040407010806060909071008061112130710101411121315161614111717181819202021211102111121112210222022080E06061105100F01050A0601020B01010301030505");
                    }
                    view.init();
                    break;
                case("8"):
                    view.clean();
                    model.loadPuzzle("");
                    switch (Math.floor(Math.random() * 2)) {
                        case(0):
                            model.loadPuzzle("8200010102020303040005050606070804091010100707081109121210131414111515161613131717181818192021171722222319202124252626232727212425243221412234231241332341221101022307010B020A03028004011C0701031560180769020B01010909");
                            break;
                        default:
                            model.loadPuzzle("8200010102020303040005050607070704080806060709090408101112130914141516111213131717151618191913202122161823242520212218182324252121132412331304232232122142220A2A030210077E180BA00704027E01033C071204051403070101");
                    }
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
        controller.cleaner();
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

    this.cleaner = function () {
        $(document).click(function () {
            //view.removeTempHighlights();
        });
    };
}

controller = new Controller();
window.addEventListener("load", controller.init);