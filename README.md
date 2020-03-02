# ECV-Final - PYROS

## Clases:

### Module:

#### constructor (position, type, target, id, next, prev)

    position: {x, y}
    type: String
    target: String
    next: Module
    prev: Module

#### update_offset()

#### enable_moving()

#### disable_moving()

#### draw(ctx) 

    ctx: Canvas context

#### isNear(module)

    module: Module

#### relate (module, position)

    module: Module
    position: String

#### run()

### ArgModule extends Module

#### costructor(position, type, target, id, arg, next, prev)

    position: {x, y}
    type: String
    target: String
    next: Module
    prev: Module
    arg: String

#### set_arg(arg)

    arg: String

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

#### draw(ctx)

    ctx: canvas context

#### run_modules()

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
    relateModules (no implemented)

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