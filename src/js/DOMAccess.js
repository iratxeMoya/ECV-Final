var wb_cvs = document.getElementById("wb_canvas");
var wb_ctx = wb_cvs.getContext("2d");
var gs_cvs = document.getElementById("gs_canvas");
var gs_ctx = gs_cvs.getContext("2d");
var moduleType_1 = document.querySelector("#module1");
var moduleType_2 = document.querySelector("#module2");
var workbench = document.getElementsByClassName("user_screen")[0];
var game_screen = document.getElementsByClassName("game_screen")[0];
var run_button = document.getElementsByClassName("run_code")[0];

export {
    wb_cvs,
    wb_ctx,
	gs_cvs,
    gs_ctx,
    moduleType_1,
    moduleType_2,
    workbench,
	game_screen,
    run_button
}