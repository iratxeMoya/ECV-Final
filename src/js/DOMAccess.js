var cvs = document.getElementById("wb_canvas");
var ctx = cvs.getContext("2d");
var moduleType_1 = document.querySelector("#module1");
var moduleType_2 = document.querySelector("#module2");
var workbench = document.getElementsByClassName("user_screen")[0];
var run_button = document.getElementsByClassName("run_code")[0];

export {
    cvs,
    ctx,
    moduleType_1,
    moduleType_2,
    workbench,
    run_button
}