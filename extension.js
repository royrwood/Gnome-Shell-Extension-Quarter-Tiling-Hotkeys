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
        const workspaceLeftHalfWidth = Math.ceil(workspaceWidth / 2);  // Round up, in case of odd value for workspaceWidth
        const workspaceRightHalfWidth = Math.floor(workspaceWidth / 2);  // Round down, in case of odd value for workspaceWidth
        const workspaceTopHalfHeight = Math.ceil(workspaceHeight / 2);  // Round up, in case of odd value for workspaceHeight
        const workspaceBottomHalfHeight = Math.floor(workspaceHeight / 2);  // Round down, in case of odd value for workspaceHeight
        const workspaceLeftX = workspaceArea.x;
        const workspaceRightX = workspaceLeftX + workspaceWidth;
        const workspaceCenterX = workspaceLeftX + workspaceLeftHalfWidth;
        const workspaceTopY = workspaceArea.y;
        const workspaceBottomY = workspaceTopY + workspaceHeight;
        const workspaceCenterY = workspaceTopY + workspaceTopHalfHeight;

        const isXAlignedLeft = frameLeftX == workspaceLeftX;
        const isXAlignedCenter = frameLeftX == workspaceCenterX;
        const isXAlignedRight = frameRightX == workspaceRightX;
        const isYAlignedTop = frameTopY == workspaceTopY;
        const isYAlignedCenter = frameTopY == workspaceCenterY;
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
            // Make sure the last action was not "UP" in order to avoid repeated resizing of terminal windows that don't fully resize
            else if (frameHeight !== workspaceTopHalfHeight && !previousAction.startsWith('UP')) {
                _log('UP: resize');
                x = frameLeftX;
                y = frameTopY;
                width = frameWidth;
                height = workspaceTopHalfHeight;
                maximizeFlags = 0;
                action = 'UP RESIZE';
            }
            // Default is to fill the top half of the monitor
            else {
                _log('UP: resize horizontal');
                x = workspaceLeftX;
                y = workspaceTopY;
                width = workspaceWidth;
                height = workspaceTopHalfHeight;
                maximizeFlags = Meta.MaximizeFlags.HORIZONTAL;
                action = 'UP HALF';
            }
        }
        else if (directionStr == 'DOWN') {
            // If y is not aligned to the bottom, move it to bottom without resizing
            // Make sure the last action was not "DOWN" in order to avoid repeated resizing for terminal windows that don't fully resize
            if (!isYAlignedBottom && !previousAction.startsWith('DOWN')) {
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
                height = workspaceBottomHalfHeight;
                maximizeFlags = 0;
                action = 'DOWN RESIZE';
            }
            // Default is to fill the bottom half of the monitor
            else {
                _log('DOWN: resize horizontal');
                x = workspaceLeftX;
                y = workspaceCenterY;
                width = workspaceWidth;
                height = workspaceBottomHalfHeight;
                maximizeFlags = Meta.MaximizeFlags.HORIZONTAL;
                action = 'DOWN HALF';
            }
        }
        else if (directionStr == 'LEFT') {
            // If x is not aligned to the left edge, move it to left without resizing
            if (!isXAlignedLeft) {
                _log('LEFT: move');
                x = workspaceLeftX;
                y = frameTopY;
                width = frameWidth;
                height = frameHeight;
                maximizeFlags = 0;
                action = 'LEFT MOVE';
            }
            // If width is not half-width, resize it to half-width
            // Make sure the last action was not "LEFT RESIZE" in order to avoid repeated resizing of terminal windows that don't fully resize
            else if (frameWidth !== workspaceLeftHalfWidth && !previousAction.startsWith('LEFT')) {
                _log('LEFT: resize');
                x = frameLeftX;
                y = frameTopY;
                width = workspaceLeftHalfWidth;
                height = frameHeight;
                maximizeFlags = 0;
                action = 'LEFT RESIZE';
            }
            // Default is to fill the left half of the monitor
            else {
                _log('LEFT: resize vertical');
                x = workspaceLeftX;
                y = workspaceTopY;
                width = workspaceLeftHalfWidth;
                height = workspaceHeight;
                maximizeFlags = Meta.MaximizeFlags.VERTICAL;
                action = 'LEFT HALF';
            }
        }
        else if (directionStr == 'RIGHT') {
            // If x is not aligned to the right, move it to right without resizing
            // Make sure the last action was not "RIGHT" in order to avoid repeated resizing for terminal windows that don't fully resize
            if (!isXAlignedRight && !previousAction.startsWith('RIGHT')) {
                _log('RIGHT: move');
                x = workspaceRightX - frameWidth;
                y = frameTopY;
                width = frameWidth;
                height = frameHeight;
                maximizeFlags = 0;
                action = 'RIGHT MOVE';
            }
            // If x is not aligned to the center, move it and resize it
            else if (!isXAlignedCenter) {
                _log('RIGHT: move resize');
                x = workspaceCenterX;
                y = frameTopY;
                width = workspaceRightHalfWidth;
                height = frameHeight;
                maximizeFlags = 0;
                action = 'RIGHT RESIZE';
            }
            // Default is to fill the right half of the monitor
            else {
                _log('RIGHT: resize vertical');
                x = workspaceCenterX;
                y = workspaceTopY;
                width = workspaceRightHalfWidth;
                height = workspaceHeight;
                maximizeFlags = Meta.MaximizeFlags.VERTICAL;
                action = 'RIGHT HALF';
            }
        }
    
        // if (currentMaximizeFlags !== maximizeFlags) {
        //     const clearMaximizeFlag = currentMaximizeFlags & ~maximizeFlags;
        //     _log(`Hotkey Callback: currentMaximizeFlags=${currentMaximizeFlags}, maximizeFlags=${maximizeFlags}, clearMaximizeFlag=${clearMaximizeFlag})`);

        //     if (clearMaximizeFlag !== 0) {
        //         _log(`Hotkey Callback: Calling unmaximize(${clearMaximizeFlag}); currentMaximizeFlags=${currentMaximizeFlags}, maximizeFlags=${maximizeFlags}`);
        //         window.unmaximize(clearMaximizeFlag);
        //     }

        //     if (maximizeFlags !== 0) {
        //         _log(`Hotkey Callback: Calling appWindow.maximize(${maximizeFlags})`);
        //         window.maximize(maximizeFlags);
        //     }
        // }

        if (currentMaximizeFlags) {
            _log(`Hotkey Callback: Calling unmaximize(${currentMaximizeFlags})`);
            window.unmaximize(currentMaximizeFlags);
        }

        // window.qtileInfo.expectMove = (x !== frameLeftX || y !== frameTopY || maximizeFlags !== 0);
        // window.qtileInfo.expectResize = (width !== frameWidth || height !== frameHeight || maximizeFlags !== 0);
        const expectMove = (x != frameLeftX || y != frameTopY);
        const expectResize = (width != frameWidth || height != frameHeight);

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
