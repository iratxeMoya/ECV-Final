# ECV-Final - PYROS

## Modulos:

### User

#### User:

    costructor: username, password, enterType (login / register)
    logout
    sendMsg: msg, subject

#### Student extends User:

    constructor: username, password, enterType (login / register), requests(optional), appliedSeminars (optional)
    createRequest: subject, description
    applySeminar: subject, teacher

#### Teacher extends User:

    constructor: username, password, enterType (login / register), postedSeminars (optional), currentSeminars (optional)
    createSeminar: subject, description

## Server:

### Tables:

    dbSeminars
    dbUsers
    dbRequests
    dbMessages (SIN CREAR AUN)

### Actions:

#### LOGIN:

    login -> CHECK PASSWORD AND CHANGE TABLE 'CONNECTED' VALUE
    logout -> CHANGE TABLE 'CONNECTED' VALUE
    register -> CHECK USER IN TABLE AND ADD

#### CHAT:

    sendMsg [SIN HACER]

#### ENCUENTROS:

    createSeminar -> ADD TO TABLE
    createRequest -> ADD TO TABLE
    applySeminar [SIN HACER]
