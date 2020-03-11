// Code editor Page
var codeEditorPage = document.querySelector("#codeEditorPage");
var wb_cvs = document.getElementById("wb_canvas");
var wb_ctx = wb_cvs.getContext("2d");
var gs_cvs = document.getElementById("gs_canvas");
var gs_ctx = gs_cvs.getContext("2d");
var workbench = document.getElementsByClassName("user_screen")[0];
var game_screen = document.getElementsByClassName("game_screen")[0];

var run_button = document.getElementsByClassName("run_code")[0];
var stop_button = document.getElementsByClassName("stop_code")[0];

var basicModule = document.querySelector("#basicModule");
var conditionModule = document.querySelector("#conditionModule");
var argModule = document.querySelector("#argModule");
var targetModule = document.querySelector("#targetModule");

var element = document.querySelector("#element");

var dropdownContainer = document.querySelector(".dropdown-content");
var dropdownMovement = document.querySelector(".dropdown-move");
var dropdownControl = document.querySelector(".dropdown-cont");
var dropdownCondition = document.querySelector(".dropdown-cond");


//Login Page
var loginPage = document.querySelector("#loginPage");
var goToReg = document.querySelector("#fromLogToReg");
var loginUser = document.querySelector("#loginUser");
var loginPass = document.querySelector("#loginPass");
var loginSend = document.querySelector("#loginSend"); 

//Register Page
var regPage = document.querySelector("#regPage");
var goToLog = document.querySelector("#fromRegToLog");
var regUser = document.querySelector("#regUser");
var regPass = document.querySelector("#regPass");
var regSend = document.querySelector("#regSend"); 

//project creation page
var projSelectPage = document.querySelector("#projSelectPage");
var projName = document.querySelector("#projName");
var createProj = document.querySelector("#createProj");
var projListContainer = document.querySelector("#projListContainer");
var projInfoContainer = document.querySelector("#projInfoContainer");
var enterProj = document.querySelector("#enterProj");
var newUser = document.querySelector("#newUser");
var addUser = document.querySelector("#addUser");
var projUserContainer = document.querySelector("#projUsers");

export {
    wb_cvs,
    wb_ctx,
	gs_cvs,
    gs_ctx,
    workbench,
	game_screen,
    run_button,
    stop_button,
    basicModule,
	conditionModule,
    argModule,
    targetModule,
    element,
    dropdownContainer,
	dropdownMovement,
	dropdownControl,
	dropdownCondition,
    codeEditorPage, 
    loginPage,
    loginPass,
    loginSend,
    loginUser,
    regPage,
    regPass,
    regSend,
    regUser,
    goToLog,
    goToReg,
    projSelectPage,
    projInfoContainer,
    projListContainer,
    projName,
    createProj,
    enterProj,
    newUser,
    addUser,
    projUserContainer
}