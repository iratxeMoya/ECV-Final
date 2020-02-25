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