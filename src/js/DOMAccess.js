var wb_cvs = document.getElementById("wb_canvas");
var wb_ctx = wb_cvs.getContext("2d");
var gs_cvs = document.getElementById("gs_canvas");
var gs_ctx = gs_cvs.getContext("2d");
var workbench = document.getElementsByClassName("user_screen")[0];
var game_screen = document.getElementsByClassName("game_screen")[0];
var run_button = document.getElementsByClassName("run_code")[0];
var basicModule = document.querySelector("#basicModule");
var conditionModule = document.querySelector("#conditionModule");
var argModule = document.querySelector("#argModule");
var targetModule = document.querySelector("#targetModule");
var element = document.querySelector("#element");
var dropdownContainer = document.querySelector(".dropdown-content");

export {
    wb_cvs,
    wb_ctx,
	gs_cvs,
    gs_ctx,
    workbench,
	game_screen,
    run_button,
    basicModule,
	conditionModule,
    argModule,
    targetModule,
    element,
    dropdownContainer
}