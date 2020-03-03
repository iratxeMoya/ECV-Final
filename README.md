# ECV-Final - PYROS

## Clases:

### Module:

#### constructor (position, type, id, next, prev)

    position: {x, y}
    type: String
    next: Module
    prev: Module

#### update_offset()

#### enable_moving()

#### disable_moving()

#### draw(wb_ctx)

    wb_ctx: Canvas context

#### isNear(module)

    module: Module

#### relate (module, position)

    module: Module
    position: String

#### run()

### ArgModule extends Module

#### costructor(position, type, id, arg, next, prev)

    position: {x, y}
    type: String
    next: Module
    prev: Module
    arg: String

#### set_arg(arg)

    arg: String

#### run()

### TargetModule

#### constructor(position, target, id, next?, prev?)

    position: {x, y}
    target: Element
    id: int
    next: Module
    prev: Module

#### run()

### ModuleManager

#### constructor()

#### add_module(newModule)

    newModule: Module

#### delete_module()

#### click_modules(posx, posy) 

    posx: int
    posy: int

#### release_modules()

#### move_modules(posx, posy)

    posx: int
    posy: int

#### draw(wb_ctx)

    wb_ctx: canvas context

#### run_modules()

#### getElementById(id)

    id: int

### Element:

#### constructor(id, position, avatar?)

    id: int
    position: {x, y}

#### draw(gs_ctx):

    gs_gtx: canvas context

### ElementManager:

#### constructor()

#### add_element(element)

    element: Element

#### delete_element(element)

    element: Element

#### getElementById(id)

    id: int

#### drawElements(gs_ctx)

    gs_ctx: canvas context

## Server:

### Arrays:

    connectedUsers

### Tables (DB)

    NONE

### Message types:

    login (no implemented)
    register (no implemented)
    logout (no implemented)
    createModule
    moveModule
    clickModule
    releaseModule
    createElement

### Files:

#### modules.json

Data template:

    {
        id: int,
        prev_id: int / null,
        next_id: int / null,
        position: {
            x: int,
            y: int
        },
        target_id: int / null,
        type: String,
        arg: String

    }

#### elements.json

Data template:

    {
        id: int,
        position: {
            x: int,
            y: int
        }
    }