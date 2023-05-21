const { extensionUtils: ExtensionUtils } = imports.misc;
const { Meta, Shell } = imports.gi;
const { main: Main } = imports.ui;
const { format: Format, gettext: Gettext } = imports;

const Me = ExtensionUtils.getCurrentExtension();
const Domain = Gettext.domain(Me.metadata.uuid);
const _ = Domain.gettext;

const DO_LOGGING = true;
const MY_VERSION = "1.1.0";


function init() {
    _log(`initializing ${Me.metadata.name} ${MY_VERSION}`);

    return new Extension();
}


const _log = function(msg) {
	if (DO_LOGGING) {
		console.log(`[QuarTileKeys] ${msg}`);
	}
}


class Extension {
    constructor() {
        
    }

    enable() {
        _log(`Enabling ${Me.metadata.name} ${MY_VERSION}`);

        const myExtensionSettings = ExtensionUtils.getSettings('org.gnome.shell.extensions.quarter-tiling-hotkeys');

        _log('Adding key bindings');
        this._addKeyBinding('tile-left-hotkey',  myExtensionSettings, this._hotkeyCallback.bind(this, 'LEFT'));
        this._addKeyBinding('tile-right-hotkey', myExtensionSettings, this._hotkeyCallback.bind(this, 'RIGHT'));
        this._addKeyBinding('tile-up-hotkey',    myExtensionSettings, this._hotkeyCallback.bind(this, 'UP'));
        this._addKeyBinding('tile-down-hotkey',  myExtensionSettings, this._hotkeyCallback.bind(this, 'DOWN'));
        _log('Key bindings added');

        _log('Connecting to window-created signal');
        global.display.connect('window-created', this._windowCreatedCallback.bind(this));

        const allWindows = global.display.list_all_windows();
        if (allWindows) {
            _log(`Connecting to move/resize signals for ${allWindows.length} existing windows`);
            allWindows.forEach(window => {
                _log(`Connecting to move/resize signals for window ${window}`);
                this._windowCreatedCallback(global.display, window);
            });
        }
    }
    
    disable() {
        _log(`Disabling ${Me.metadata.name} ${MY_VERSION}`);

        _log(`Removing key bindings`);
        Main.wm.removeKeybinding('tile-left-hotkey');
        Main.wm.removeKeybinding('tile-right-hotkey');
        Main.wm.removeKeybinding('tile-up-hotkey');
        Main.wm.removeKeybinding('tile-down-hotkey');
        _log(`Key bindings removed`);
    }

    _addWindowQTileInfo(window) {
        if (!window.qtileInfo) {
            window.qtileInfo = { 
                action: 'init', 
                x: 0, 
                y: 0, 
                width: 0, 
                height: 0, 
                maximizeFlags: 0,
                expectMove: false,
                expectResize: false
            };
        }

        return window.qtileInfo;
    }

    _addKeyBinding(acceleratorSettingName, settings, callbackFunc) {
        const keyCombo = settings.get_strv(acceleratorSettingName);
        _log(`Adding key binding '${acceleratorSettingName}'='${keyCombo}'`);
        
        const bindingResult = Main.wm.addKeybinding(acceleratorSettingName, settings, Meta.KeyBindingFlags.NONE, Shell.ActionMode.NORMAL, callbackFunc);
        if (bindingResult == Meta.KeyBindingAction.NONE) {
            _log(`Could not bind ${acceleratorSettingName}`)
        }
        else {
            _log(`Bound ${acceleratorSettingName}: bindingResult=${bindingResult}`)
        }
    }

    _windowCreatedCallback(_display, window) {
        const windowFrameRect = window.get_frame_rect();
        _log(`WindowCreated Callback: windowFrameRect=${JSON.stringify(windowFrameRect)}`);

        this._addWindowQTileInfo(window);

        _log('WindowCreated Callback: Adding position-changed callback');
        window.connect('position-changed', this._windowPositionChangedCallback.bind(this));
        
        _log('WindowCreated Callback: Adding size-changed callback');
        window.connect('size-changed', this._windowSizeChangedCallback.bind(this));
    };

    _windowPositionChangedCallback(window) {
        _log('PositionChanged Callback');

        this._addWindowQTileInfo(window);

        const windowQTileInfo = window.qtileInfo;
        _log(`PositionChanged Callback: windowQTileInfo=${JSON.stringify(windowQTileInfo)}`)

        const windowFrameRect = window.get_frame_rect();
        _log(`PositionChanged Callback: windowFrameRect.x=${windowFrameRect.x}, windowFrameRect.y=${windowFrameRect.y}, windowFrameRect.width=${windowFrameRect.width}, windowFrameRect.height=${windowFrameRect.height}`);

        if (window.qtileInfo.expectMove) {
            _log('PositionChanged Callback: Processing expected move')
            window.qtileInfo.expectMove = false;
        }
        else {
            _log('PositionChanged Callback: Processing unexpected move')
            window.qtileInfo.action = 'position-changed';
        }
    }

    _windowSizeChangedCallback(window) {
        _log('SizeChanged Callback');

        this._addWindowQTileInfo(window);

        const windowQTileInfo = window.qtileInfo;
        _log(`SizeChanged Callback: windowQTileInfo=${JSON.stringify(windowQTileInfo)}`)

        const windowFrameRect = window.get_frame_rect();
        _log(`SizeChanged Callback: windowFrameRect.x=${windowFrameRect.x}, windowFrameRect.y=${windowFrameRect.y}, windowFrameRect.width=${windowFrameRect.width}, windowFrameRect.height=${windowFrameRect.height}`);

        if (window.qtileInfo.expectResize) {
            _log('SizeChanged Callback: Processing expected resize')
            window.qtileInfo.expectResize = false;
        }
        else {
            _log('SizeChanged Callback: Processing unexpected resize')
            window.qtileInfo.action = 'size-changed';
        }
    }

    _hotkeyCallback(directionStr) {
        const window = global.display.focus_window;

        if (window === null) {
            _log(`Hotkey Callback: window === null`)
            return;
        }

        const windowQTileInfo = this._addWindowQTileInfo(window);
        const previousAction = windowQTileInfo.action;

        const windowFrameRect = window.get_frame_rect();
        const curMonitor = window.get_monitor();
        const workspace = window.get_workspace();
        const workspaceArea = workspace.get_work_area_for_monitor(curMonitor);

        const frameWidth = windowFrameRect.width;
        const frameHeight = windowFrameRect.height;
        const frameLeftX = windowFrameRect.x;
        const frameRightX = frameLeftX + frameWidth;
        const frameTopY = windowFrameRect.y;
        const frameBottomY = frameTopY + frameHeight;

        const workspaceWidth = workspaceArea.width;
        const workspaceHeight = workspaceArea.height;
        const workspaceHalfWidth = Math.floor(workspaceWidth / 2);
        const workspaceHalfHeight = Math.floor(workspaceHeight / 2);
        const workspaceLeftX = workspaceArea.x;
        const workspaceRightX = workspaceLeftX + workspaceWidth;
        const workspaceCenterX = workspaceRightX - workspaceHalfWidth;
        const workspaceTopY = workspaceArea.y;
        const workspaceBottomY = workspaceTopY + workspaceHeight;
        const workspaceCenterY = workspaceBottomY - workspaceHalfHeight;

        // The "<= 1" handles odd dimensions (e.g. workspaceArea.height=1053 on a 1080p display)
        // TODO: Maybe not needed, now that I'm aligning to the bottom/right edges?
        const isXAlignedLeft = frameLeftX == workspaceLeftX;
        const isXAlignedCenter = Math.abs(frameLeftX - workspaceCenterX) <= 1;
        const isXAlignedRight = frameRightX == workspaceRightX;
        const isYAlignedTop = frameTopY == workspaceTopY;
        const isYAlignedCenter = Math.abs(frameTopY - workspaceCenterY) <= 1;
        const isYAlignedBottom = frameBottomY == workspaceBottomY;
        const currentMaximizeFlags = window.get_maximized();

        _log(`Hotkey Callback: windowQTileInfo=${JSON.stringify(windowQTileInfo)}`)
        _log(`Hotkey Callback: windowFrameRect.x=${windowFrameRect.x}, windowFrameRect.y=${windowFrameRect.y}, windowFrameRect.width=${windowFrameRect.width}, windowFrameRect.height=${windowFrameRect.height}`);
        _log(`Hotkey Callback: workspaceArea.x=${workspaceArea.x}, workspaceArea.y=${workspaceArea.y}, workspaceArea.width=${workspaceArea.width}, workspaceArea.height=${workspaceArea.height}`);
        _log(`Hotkey Callback: currentMaximizeFlags=${currentMaximizeFlags}, isYAlignedTop=${isYAlignedTop}, isYAlignedCenter=${isYAlignedCenter}, isYAlignedBottom=${isYAlignedBottom}, isXAlignedLeft=${isXAlignedLeft}, isXAlignedCenter=${isXAlignedCenter}`);

        let x, y, width, height;
        let maximizeFlags = 0;
        let action = directionStr;

        if (directionStr == 'UP') {
            // If y is not aligned to the top edge, move it to top without resizing
            if (!isYAlignedTop) {
                _log('UP: move');
                x = frameLeftX;
                y = workspaceTopY;
                width = frameWidth;
                height = frameHeight;
                maximizeFlags = 0;
                action = 'UP MOVE';
            }
            // If height is not half-height, resize it to half-height
            // Make sure the last action was not "UP RESIZE" in order to avoid repeated resizing of terminal windows that don't fully resize
            else if (previousAction !== 'UP RESIZE' && frameHeight !== workspaceHalfHeight) {
                _log('UP: resize');
                x = frameLeftX;
                y = frameTopY;
                width = frameWidth;
                height = workspaceHalfHeight;
                maximizeFlags = 0;
                action = 'UP RESIZE';
            }
            // Default is to fill the top half of the monitor
            else {
                _log('UP: resize horizontal');
                x = workspaceLeftX;
                y = workspaceTopY;
                width = workspaceWidth;
                height = workspaceHalfHeight;
                maximizeFlags = Meta.MaximizeFlags.HORIZONTAL;
                action = 'UP HALF';
            }
        }
        else if (directionStr == 'DOWN') {
            // If y is not aligned to the bottom, move it to bottom without resizing
            // Make sure the last action was not "DOWN" in order to avoid toggling up and down for terminal windows that don't fully resize
            if (previousAction !== 'DOWN RESIZE' && !isYAlignedBottom) {
                _log('DOWN: move');
                x = frameLeftX;
                y = workspaceBottomY - frameHeight;
                width = frameWidth;
                height = frameHeight;
                maximizeFlags = 0;
                action = 'DOWN MOVE';
            }
            // If y is not aligned to the center, move it and resize it
            else if (!isYAlignedCenter) {
                _log('DOWN: move resize');
                x = frameLeftX;
                y = workspaceCenterY;
                width = frameWidth;
                height = workspaceHalfHeight;
                maximizeFlags = 0;
                action = 'DOWN RESIZE';
            }
            // Default is to fill the bottom half of the monitor
            else {
                _log('DOWN: resize horizontal');
                x = workspaceLeftX;
                y = workspaceCenterY;
                width = workspaceWidth;
                height = workspaceHalfHeight;
                maximizeFlags = Meta.MaximizeFlags.HORIZONTAL;
                action = 'DOWN HALF';
            }
        }
        else if (directionStr == 'LEFT') {
            // If x is not aligned to the left edge, move it to left and resize to half-width
            if (!isXAlignedLeft) {
                _log('LEFT: resize');
                x = workspaceLeftX;
                y = frameTopY;
                width = workspaceHalfWidth;height
                height = frameHeight
                maximizeFlags = 0;
            }
            // Default is to fill the left half of the monitor
            else {
                _log('LEFT: half');
                x = workspaceLeftX;
                y = workspaceTopY;
                width = workspaceHalfWidth;
                height = workspaceHeight;
                maximizeFlags = Meta.MaximizeFlags.VERTICAL;
            }
        }
        else if (directionStr == 'RIGHT') {
            // If x is not aligned to the center, move it to right and resize to half-width
            if (!isXAlignedCenter) {
                _log('RIGHT: resize');
                x = workspaceCenterX;
                y = frameTopY;
                width = workspaceHalfWidth;
                height = frameHeight;
                maximizeFlags = 0;
            }
            // Default is to fill the bottom half of the monitor
            else {
                _log('RIGHT: half');
                x = workspaceCenterX;
                y = workspaceTopY;
                width = workspaceHalfWidth;
                height = workspaceHeight;
                maximizeFlags = Meta.MaximizeFlags.VERTICAL;
            }
        }
    
        if (maximizeFlags) {
            if (currentMaximizeFlags != 0 && currentMaximizeFlags != maximizeFlags) {
                const clearMaximizeFlag = Meta.MaximizeFlags.BOTH & ~maximizeFlags;
                _log(`Hotkey Callback: Calling unmaximize(${clearMaximizeFlag}); currentMaximizeFlags=${currentMaximizeFlags}, maximizeFlags=${maximizeFlags}`);
                window.unmaximize(clearMaximizeFlag);
            }

            _log(`Hotkey Callback: Calling appWindow.maximize(${maximizeFlags})`);
            window.maximize(maximizeFlags);
        }

        // window.qtileInfo.expectMove = (x !== frameLeftX || y !== frameTopY || maximizeFlags !== 0);
        // window.qtileInfo.expectResize = (width !== frameWidth || height !== frameHeight || maximizeFlags !== 0);
        const expectMove = (x !== frameLeftX || y !== frameTopY);
        const expectResize = (width !== frameWidth || height !== frameHeight);

        window.qtileInfo.action = action;
        window.qtileInfo.x = x;
        window.qtileInfo.y = y;
        window.qtileInfo.width = width;
        window.qtileInfo.height = height;
        window.qtileInfo.maximizeFlags = maximizeFlags;
        window.qtileInfo.expectMove = expectMove;
        window.qtileInfo.expectResize = expectResize;
        _log(`Hotkey Callback: Set window.qtileInfo=${JSON.stringify(window.qtileInfo)}`)

        if (expectMove || expectResize) {
            _log(`Hotkey Callback: Calling move_resize_frame(${x}, ${y}, ${width}, ${height})`);
            window.move_resize_frame(false, x, y, width, height);
            _log(`Hotkey Callback: Called move_resize_frame(${x}, ${y}, ${width}, ${height})`);
        }
        else {
            _log(`Hotkey Callback: No move/resize needed`);
        }
    }
}




// GNOME Shell-Message: 13:33:26.758: [QuarTileKeys] Got window-created callback
// GNOME Shell-Message: 13:33:26.759: [QuarTileKeys] windowFrameRect={}
// GNOME Shell-Message: 13:33:26.760: [QuarTileKeys] Got position-changed callback
// GNOME Shell-Message: 13:33:26.760: [QuarTileKeys] Got position-changed callback: windowQTileInfo={"action":"window-created","x":0,"y":0,"width":0,"height":0,"maximizeFlags":0}
// GNOME Shell-Message: 13:33:26.760: [QuarTileKeys] Got position-changed callback: windowFrameRect={}
// GNOME Shell-Message: 13:33:26.760: [QuarTileKeys] Got position-changed callback: windowFrameRect.x=70, windowFrameRect.y=27, windowFrameRect.width=0, windowFrameRect.height=0
// GNOME Shell-Message: 13:33:26.796: [QuarTileKeys] Got window-created callback
// GNOME Shell-Message: 13:33:26.797: [QuarTileKeys] windowFrameRect={}
// GNOME Shell-Message: 13:33:26.804: [QuarTileKeys] Got position-changed callback
// GNOME Shell-Message: 13:33:26.804: [QuarTileKeys] Got position-changed callback: windowQTileInfo={"action":"window-created","x":0,"y":0,"width":0,"height":0,"maximizeFlags":0}
// GNOME Shell-Message: 13:33:26.804: [QuarTileKeys] Got position-changed callback: windowFrameRect={}
// GNOME Shell-Message: 13:33:26.804: [QuarTileKeys] Got position-changed callback: windowFrameRect.x=0, windowFrameRect.y=0, windowFrameRect.width=1500, windowFrameRect.height=900
// GNOME Shell-Message: 13:33:26.874: [QuarTileKeys] Got position-changed callback
// GNOME Shell-Message: 13:33:26.874: [QuarTileKeys] Got position-changed callback: windowQTileInfo={"action":"window-created","x":0,"y":0,"width":0,"height":0,"maximizeFlags":0}
// GNOME Shell-Message: 13:33:26.874: [QuarTileKeys] Got position-changed callback: windowFrameRect={}
// GNOME Shell-Message: 13:33:26.874: [QuarTileKeys] Got position-changed callback: windowFrameRect.x=0, windowFrameRect.y=0, windowFrameRect.width=800, windowFrameRect.height=600
// GNOME Shell-Message: 13:33:26.874: [QuarTileKeys] Got position-changed callback
// GNOME Shell-Message: 13:33:26.874: [QuarTileKeys] Got position-changed callback: windowQTileInfo={"action":"window-created","x":0,"y":0,"width":0,"height":0,"maximizeFlags":0}
// GNOME Shell-Message: 13:33:26.874: [QuarTileKeys] Got position-changed callback: windowFrameRect={}
// GNOME Shell-Message: 13:33:26.875: [QuarTileKeys] Got position-changed callback: windowFrameRect.x=70, windowFrameRect.y=27, windowFrameRect.width=800, windowFrameRect.height=600

// GNOME Shell-Message: 13:33:36.401: [QuarTileKeys] Callback: windowQTileInfo={"action":"window-created","x":0,"y":0,"width":0,"height":0,"maximizeFlags":0}
// GNOME Shell-Message: 13:33:36.402: [QuarTileKeys] Callback: windowFrameRect.x=70, windowFrameRect.y=27, windowFrameRect.width=800, windowFrameRect.height=600
// GNOME Shell-Message: 13:33:36.403: [QuarTileKeys] Callback: workspaceArea.x=70, workspaceArea.y=27, workspaceArea.width=1430, workspaceArea.height=873
// GNOME Shell-Message: 13:33:36.403: [QuarTileKeys] Callback: currentMaximizeFlags=0, isYAlignedTop=true, isYAlignedCenter=false, isYAlignedBottom=false, isXAlignedLeft=true, isXAlignedCenter=false
// GNOME Shell-Message: 13:33:36.404: [QuarTileKeys] RIGHT: resize
// GNOME Shell-Message: 13:33:36.405: [QuarTileKeys] Calling move_resize_frame(785, 27, 715, 600)
// GNOME Shell-Message: 13:33:36.405: [QuarTileKeys] move_resize_frame after
// GNOME Shell-Message: 13:33:36.417: [QuarTileKeys] Got position-changed callback
// GNOME Shell-Message: 13:33:36.418: [QuarTileKeys] Got position-changed callback: windowQTileInfo={"action":"RIGHT","x":785,"y":27,"width":715,"height":600,"maximizeFlags":0}
// GNOME Shell-Message: 13:33:36.418: [QuarTileKeys] Got position-changed callback: windowFrameRect={}
// GNOME Shell-Message: 13:33:36.418: [QuarTileKeys] Got position-changed callback: windowFrameRect.x=785, windowFrameRect.y=27, windowFrameRect.width=715, windowFrameRect.height=600

// GNOME Shell-Message: 13:33:43.133: [QuarTileKeys] Callback: windowQTileInfo={"action":"RIGHT","x":785,"y":27,"width":715,"height":600,"maximizeFlags":0}
// GNOME Shell-Message: 13:33:43.134: [QuarTileKeys] Callback: windowFrameRect.x=785, windowFrameRect.y=27, windowFrameRect.width=715, windowFrameRect.height=600
// GNOME Shell-Message: 13:33:43.135: [QuarTileKeys] Callback: workspaceArea.x=70, workspaceArea.y=27, workspaceArea.width=1430, workspaceArea.height=873
// GNOME Shell-Message: 13:33:43.135: [QuarTileKeys] Callback: currentMaximizeFlags=0, isYAlignedTop=true, isYAlignedCenter=false, isYAlignedBottom=false, isXAlignedLeft=false, isXAlignedCenter=true
// GNOME Shell-Message: 13:33:43.136: [QuarTileKeys] DOWN: resize
// GNOME Shell-Message: 13:33:43.136: [QuarTileKeys] Calling move_resize_frame(785, 463, 715, 436)
// GNOME Shell-Message: 13:33:43.137: [QuarTileKeys] move_resize_frame after
// GNOME Shell-Message: 13:33:43.148: [QuarTileKeys] Got position-changed callback
// GNOME Shell-Message: 13:33:43.148: [QuarTileKeys] Got position-changed callback: windowQTileInfo={"action":"DOWN","x":785,"y":463,"width":715,"height":436,"maximizeFlags":0}
// GNOME Shell-Message: 13:33:43.149: [QuarTileKeys] Got position-changed callback: windowFrameRect={}
// GNOME Shell-Message: 13:33:43.149: [QuarTileKeys] Got position-changed callback: windowFrameRect.x=785, windowFrameRect.y=463, windowFrameRect.width=715, windowFrameRect.height=436


// const { extensionUtils: ExtensionUtils } = imports.misc;
// const { Meta, Shell } = imports.gi;
// const { main: Main } = imports.ui;
// const { format: Format, gettext: Gettext } = imports;

// const Me = ExtensionUtils.getCurrentExtension();
// const Domain = Gettext.domain(Me.metadata.uuid);
// const _ = Domain.gettext;

// const DO_LOGGING = true;
// const MY_VERSION = "1";


// function init() {
//     _log(`initializing ${Me.metadata.name} ${MY_VERSION}`);

//     return new Extension();
// }


// const _log = function(msg) {
//     if (DO_LOGGING) {
//         console.log(`[QuarTileKeys] ${msg}`);
//     }
// }


// class Extension {
//     constructor() {
        
//     }

//     enable() {
//         _log(`Enabling ${Me.metadata.name} ${MY_VERSION}`);

//         const myExtensionSettings = ExtensionUtils.getSettings('org.gnome.shell.extensions.quarter-tiling-hotkeys');

//         _log('Adding key bindings');
//         this._addKeyBinding('tile-left-hotkey',  myExtensionSettings, this._doWindowMoveResize.bind(this, 'LEFT'));
//         this._addKeyBinding('tile-right-hotkey', myExtensionSettings, this._doWindowMoveResize.bind(this, 'RIGHT'));
//         this._addKeyBinding('tile-up-hotkey',    myExtensionSettings, this._doWindowMoveResize.bind(this, 'UP'));
//         this._addKeyBinding('tile-down-hotkey',  myExtensionSettings, this._doWindowMoveResize.bind(this, 'DOWN'));
//         _log('Key bindings added');

//         _log('Connecting to window-created signal');
//         global.display.connect('window-created', (display, window) => { _log('Got window-created callback')});

//     }
    
//     disable() {
//         _log(`Disabling ${Me.metadata.name} ${MY_VERSION}`);

//         _log(`Removing key bindings`);
//         Main.wm.removeKeybinding('tile-left-hotkey');
//         Main.wm.removeKeybinding('tile-right-hotkey');
//         Main.wm.removeKeybinding('tile-up-hotkey');
//         Main.wm.removeKeybinding('tile-down-hotkey');
//         _log(`Key bindings removed`);
//     }

//     _addKeyBinding(acceleratorSettingName, settings, callbackFunc) {
//         const keyCombo = settings.get_strv(acceleratorSettingName);
//         _log(`Adding key binding '${acceleratorSettingName}'='${keyCombo}'`);
        
//         // Meta.KeyBindingFlags.NONE
//         // Meta.KeyBindingFlags.PER_WINDOW
//         // Meta.KeyBindingFlags.BUILTIN
//         // Meta.KeyBindingFlags.IGNORE_AUTOREPEAT
//         const flag = Meta.KeyBindingFlags.NONE;

//         // Shell.ActionMode.NORMAL
//         // Shell.ActionMode.OVERVIEW
//         // Shell.ActionMode.LOCK_SCREEN
//         // Shell.ActionMode.ALL
//         const mode = Shell.ActionMode.NORMAL;

//         const bindingResult = Main.wm.addKeybinding(acceleratorSettingName, settings, flag, mode, callbackFunc);
//         if (bindingResult == Meta.KeyBindingAction.NONE) {
//             _log(`Could not bind ${acceleratorSettingName}`)
//         }
//         else {
//             _log(`Bound ${acceleratorSettingName}: bindingResult=${bindingResult}`)
//         }
//     }

//     _doWindowMoveResize(directionStr) {
//         const appWindow = global.display.focus_window;
//         const appFrameRect = appWindow.get_frame_rect();
//         const curMonitor = appWindow.get_monitor();
//         const workspace = appWindow.get_workspace();
//         const workspaceArea = workspace.get_work_area_for_monitor(curMonitor);

//         const frameWidth = appFrameRect.width;
//         const frameHeight = appFrameRect.height;
//         const frameLeftX = appFrameRect.x;
//         const frameRightX = frameLeftX + frameWidth;
//         const frameTopY = appFrameRect.y;
//         const frameBottomY = frameTopY + frameHeight;

//         const workspaceWidth = workspaceArea.width;
//         const workspaceHeight = workspaceArea.height;
//         const workspaceHalfWidth = Math.floor(workspaceWidth / 2);
//         const workspaceHalfHeight = Math.floor(workspaceHeight / 2);
//         const workspaceLeftX = workspaceArea.x;
//         const workspaceCenterX = workspaceLeftX + workspaceHalfWidth;
//         const workspaceRightX = workspaceLeftX + workspaceWidth;
//         const workspaceTopY = workspaceArea.y;
//         const workspaceCenterY = workspaceTopY + workspaceHalfHeight;
//         const workspaceBottomY = workspaceTopY + workspaceHeight;

//         // The "<= 1" handles odd dimensions (e.g. workspaceArea.height=1053 on a 1080p display)
//         const isXAlignedLeft = frameLeftX == workspaceLeftX;
//         const isXAlignedCenter = Math.abs(frameLeftX - workspaceCenterX) <= 1;
//         const isXAlignedRight = frameRightX == workspaceRightX;
//         const isYAlignedTop = frameTopY == workspaceTopY;
//         const isYAlignedCenter = Math.abs(frameTopY - workspaceCenterY) <= 1;
//         const isYAlignedBottom = frameBottomY == workspaceBottomY;
    
//         _log(`Flags: appFrameRect.x=${appFrameRect.x}, appFrameRect.y=${appFrameRect.y}, appFrameRect.width=${appFrameRect.width}, appFrameRect.height=${appFrameRect.height}`);
//         _log(`Flags: workspaceArea.x=${workspaceArea.x}, workspaceArea.y=${workspaceArea.y}, workspaceArea.width=${workspaceArea.width}, workspaceArea.height=${workspaceArea.height}`);
//         _log(`Flags: isYAlignedTop=${isYAlignedTop}, isYAlignedCenter=${isYAlignedCenter}, isYAlignedBottom=${isYAlignedBottom}, isXAlignedLeft=${isXAlignedLeft}, isXAlignedCenter=${isXAlignedCenter}`);

//         let x, y, width, height;
//         let maximizeFlags = 0;
    
//         if (directionStr == 'UP') {
//             // If y is not aligned to the top edge, move it to top without resizing
//             if (!isYAlignedTop) {
//                 _log('UP: no resize');
//                 x = frameLeftX;
//                 y = workspaceTopY;
//                 width = frameWidth;
//                 height = frameHeight;
//                 maximizeFlags = 0;
//             }
//             // If y is aligned to the top edge, and height is greater than half-height, resize it to half-height
//             else if (isYAlignedTop && frameHeight > workspaceHalfHeight) {
//                 _log('UP: resize height');
//                 x = frameLeftX;
//                 y = workspaceTopY;
//                 width = frameWidth;
//                 height = workspaceHalfHeight;
//                 maximizeFlags = 0;
//             }
//             // Default is to fill the top half of the monitor
//             else {
//                 _log('UP: top half');
//                 x = workspaceLeftX;
//                 y = workspaceTopY;
//                 width = workspaceWidth;
//                 height = workspaceHalfHeight;
//                 maximizeFlags = Meta.MaximizeFlags.HORIZONTAL;
//             }
//         }
//         else if (directionStr == 'DOWN') {
//             // If y is not aligned to the bottom and not aligned to the center, move it to bottom without resizing
//             if (!isYAlignedBottom && !isYAlignedCenter) {
//                 _log('DOWN: no resize');
//                 x = frameLeftX;
//                 y = workspaceBottomY - frameHeight;
//                 width = frameWidth;
//                 height = frameHeight;
//                 maximizeFlags = 0;
//             }
//             // If y is aligned to the bottom edge, and height is greater than half-height, resize it to half-height
//             else if (isYAlignedBottom && frameHeight > workspaceHalfHeight) {
//                 _log('DOWN: resize');
//                 x = frameLeftX;
//                 y = workspaceCenterY;
//                 width = frameWidth;
//                 height = workspaceHalfHeight;
//                 maximizeFlags = 0;
//             }
//             // Default is to fill the bottom half of the monitor
//             else {
//                 _log('DOWN: half');
//                 x = workspaceLeftX;
//                 y = workspaceCenterY;
//                 width = workspaceWidth;
//                 height = workspaceHalfHeight;
//                 maximizeFlags = Meta.MaximizeFlags.HORIZONTAL;
//             }
//         }
//         else if (directionStr == 'LEFT') {
//             // If x is not aligned to the left edge, move it to left without resizing
//             if (!isXAlignedLeft) {
//                 _log('LEFT: no resize');
//                 x = workspaceLeftX;
//                 y = frameTopY;
//                 width = frameWidth;
//                 height = frameHeight;
//                 maximizeFlags = 0;
//             }
//             // If x is aligned to the left edge, and width is greater than half-width, resize it to half-width
//             else if (isXAlignedLeft && frameWidth > workspaceHalfWidth) {
//                 _log('LEFT: resize width');
//                 x = workspaceLeftX;
//                 y = frameTopY;
//                 width = workspaceHalfWidth;
//                 height = frameHeight
//                 maximizeFlags = 0;
//             }
//             // Default is to fill the left half of the monitor
//             else {
//                 _log('LEFT: half');
//                 x = workspaceLeftX;
//                 y = workspaceTopY;
//                 width = workspaceHalfWidth;
//                 height = workspaceHeight;
//                 maximizeFlags = Meta.MaximizeFlags.VERTICAL;
//             }
//         }
//         else if (directionStr == 'RIGHT') {
//             // If x is not aligned to the right and not aligned to the center, move it to right without resizing
//             if (!isXAlignedRight && !isXAlignedCenter) {
//                 _log('RIGHT: no resize');
//                 x = workspaceRightX - frameWidth;
//                 y = frameTopY;
//                 width = frameWidth;
//                 height = frameHeight;
//                 maximizeFlags = 0;
//             }
//             // If x is aligned to the right edge, and width is greater than half-width, resize it to half-width
//             else if (isXAlignedRight && frameWidth > workspaceHalfWidth) {
//                 _log('RIGHT: resize');
//                 x = workspaceCenterX;
//                 y = frameTopY;
//                 width = workspaceHalfWidth;
//                 height = frameHeight;
//                 maximizeFlags = 0;
//             }
//             // Default is to fill the bottom half of the monitor
//             else {
//                 _log('RIGHT: half');
//                 x = workspaceCenterX;
//                 y = workspaceTopY;
//                 width = workspaceHalfWidth;
//                 height = workspaceHeight;
//                 maximizeFlags = Meta.MaximizeFlags.VERTICAL;
//             }
//         }
    
//         if (maximizeFlags) {
//             _log(`Calling appWindow.maximize(${maximizeFlags})`);
//             appWindow.maximize(maximizeFlags);
//         }
//         else {
//             _log(`Calling unmaximize(Meta.MaximizeFlags.BOTH)`);
//             appWindow.unmaximize(Meta.MaximizeFlags.BOTH);
//         }

//         _log(`Calling move_resize_frame(${x}, ${y}, ${width}, ${height})`);
//         appWindow.move_resize_frame(false, x, y, width, height);
//         _log("move_resize_frame after");
//     }
// }