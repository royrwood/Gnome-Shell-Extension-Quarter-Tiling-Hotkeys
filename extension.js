const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Meta = imports.gi.Meta;
const Shell = imports.gi.Shell;
const Main = imports.ui.main;


var doLogging = true;
var version = "0.1.6";

var _log = function(msg) {
	if (doLogging) {
		console.log(`[QuarTileKeys] ${msg}`);
	}
}


class Extension {
    constructor() {
        this._settings = null;
    }

    enable() {
        _log(`Enabling ${Me.metadata.name} ${version}`);

        this._settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.quarter-tiling-hotkeys');

        _log(`Adding key bindings`);
        this._addKeyBinding('tile-left-hotkey', this._onTileLeft.bind(this));
        this._addKeyBinding('tile-right-hotkey', this._onTileRight.bind(this));
        this._addKeyBinding('tile-up-hotkey', this._onTileUp.bind(this));
        this._addKeyBinding('tile-down-hotkey', this._onTileDown.bind(this));
        _log(`Key bindings added`);
    }
    
    disable() {
        _log(`Disabling ${Me.metadata.name} ${version}`);

        _log(`Removing key bindings`);
        Main.wm.removeKeybinding('tile-left-hotkey');
        Main.wm.removeKeybinding('tile-right-hotkey');
        Main.wm.removeKeybinding('tile-up-hotkey');
        Main.wm.removeKeybinding('tile-down-hotkey');
        _log(`Key bindings removed`);
    }

    _addKeyBinding(acceleratorSettingName, callbackFunc) {
        let keyCombo = this._settings.get_strv(accpaddingeleratorSettingName);
        _log(`Adding key binding '${acceleratorSettingName}'='${keyCombo}'`);
        
        // Meta.KeyBindingFlags.NONE
        // Meta.KeyBindingFlags.PER_WINDOW
        // Meta.KeyBindingFlags.BUILTIN
        // Meta.KeyBindingFlags.IGNORE_AUTOREPEAT
        let flag = Meta.KeyBindingFlags.NONE;

        // Shell.ActionMode.NORMAL
        // Shell.ActionMode.OVERVIEW
        // Shell.ActionMode.LOCK_SCREEN
        // Shell.ActionMode.ALL
        let mode = Shell.ActionMode.ALL;

        let bindingResult = Main.wm.addKeybinding(acceleratorSettingName, this._settings, flag, mode, callbackFunc);
        if (bindingResult == Meta.KeyBindingAction.NONE) {
            _log(`Could not bind ${acceleratorSettingName}`)
        }
        else {
            _log(`Bound ${acceleratorSettingName}: bindingResult=${bindingResult}`)
        }
    }


    // Main.notify("You pressed the key!")

    _onTileLeft() {
        _log(`Callback _onTileLeft`);
        this._doWindowMoveResize('LEFT');
    }

    _onTileRight() {
        _log("Callback _onTileRight");
        this._doWindowMoveResize('RIGHT');
    }

    _onTileUp() {
        _log("Callback _onTileUp");
        this._doWindowMoveResize('TOP');
    }

    _onTileDown() {
        _log("Callback _onTileDown");
        this._doWindowMoveResize('BOTTOM');
    }

    _doWindowMoveResize(directionStr) {
        let appWindow = global.display.focus_window;
        let appFrameRect = appWindow.get_frame_rect()
        let curMonitor = appWindow.get_monitor();
        let workspace = appWindow.get_workspace()
        let workspaceArea = workspace.get_work_area_for_monitor(curMonitor)
    
        let centerX = workspaceArea.x + Math.round(workspaceArea.width / 2);
        let leftX = appFrameRect.x;
        let rightX = appFrameRect.x + appFrameRect.width;
        let windowMostlyLeft = (centerX - leftX) > (rightX - centerX);
    
        let centerY = workspaceArea.y + Math.round(workspaceArea.height / 2);
        let topY = appFrameRect.y;
        let bottomY = appFrameRect.y + appFrameRect.height;
        let windowMostlyTop = (centerY - topY) > (bottomY - centerY);

        let isAlignedLeft = appFrameRect.x == workspaceArea.x;
        let isAlignedTop = appFrameRect.y == workspaceArea.y;
        let isAlignedRight = Math.abs((appFrameRect.x + appFrameRect.width) - (workspaceArea.x + workspaceArea.width)) <= 1;
        let isAlignedBottom = Math.abs((appFrameRect.y + appFrameRect.height) - (workspaceArea.y + workspaceArea.height)) <= 1;
        let isFullWidth = Math.abs(appFrameRect.width - workspaceArea.width) <= 1;
        let isFullHeight = Math.abs(appFrameRect.height - workspaceArea.height) <= 1;
        let isHalfWidth = Math.abs(appFrameRect.width - Math.round(workspaceArea.width / 2)) <= 1;
        let isHalfHeight = Math.abs(appFrameRect.height - Math.round(workspaceArea.height / 2)) <= 1;
    
        _log(`Flags: appFrameRect.x=${appFrameRect.x}, appFrameRect.y=${appFrameRect.y}, appFrameRect.width=${appFrameRect.width}, appFrameRect.height=${appFrameRect.height}`)
        _log(`Flags: workspaceArea.x=${workspaceArea.x}, workspaceArea.y=${workspaceArea.y}, workspaceArea.width=${workspaceArea.width}, workspaceArea.height=${workspaceArea.height}`)
        _log(`Flags: isAlignedTop=${isAlignedTop}, isAlignedBottom=${isAlignedBottom}, isAlignedLeft=${isAlignedLeft}, isAlignedRight=${isAlignedRight} isHalfWidth=${isHalfWidth} isHalfHeight=${isHalfHeight}`)

        let x, y, width, height;
    
        if (directionStr == 'TOP') {
            // Default is to fill the top half of the monitor
            x = workspaceArea.x;
            y = workspaceArea.y;
            width = workspaceArea.width;
            height = Math.round(workspaceArea.height / 2);

            // If it is half-width, is touching left or right, and is not touching the top side, move it top without resizing
            if (isHalfWidth && (isAlignedLeft || isAlignedRight) && !isAlignedTop) {
                x = isAlignedLeft ? workspaceArea.x : workspaceArea.x + Math.round(workspaceArea.width / 2);
                y = workspaceArea.y;
                width = Math.round(workspaceArea.width / 2);
                height = appFrameRect.height;
            }
            // If it is half-width, is touching left or right, is touching the top side, and is not half-height, resize it to half-height
            else if (isHalfWidth && (isAlignedLeft || isAlignedRight) && isAlignedTop && !isHalfHeight) {
                x = isAlignedLeft ? workspaceArea.x : workspaceArea.x + Math.round(workspaceArea.width / 2);
                y = workspaceArea.y;
                width = Math.round(workspaceArea.width / 2);
                height = Math.round(workspaceArea.height / 2);
            }
        }
        else if (directionStr == 'BOTTOM') {
            // Default is to fill the bottom half of the monitor
            x = workspaceArea.x;
            y = workspaceArea.y + Math.round(workspaceArea.height / 2);
            width = workspaceArea.width;
            height = Math.round(workspaceArea.height / 2);

            // If it is half-width, is touching left or right, and is not touching the bottom side, move it bottom without resizing
            if (isHalfWidth && (isAlignedLeft || isAlignedRight) && !isAlignedBottom) {
                x = isAlignedLeft ? workspaceArea.x : workspaceArea.x + Math.round(workspaceArea.width / 2);
                y = workspaceArea.y + workspaceArea.height - appFrameRect.height;
                width = Math.round(workspaceArea.width / 2);
                height = appFrameRect.height;
            }
            // If it is half-width, is touching left or right, is touching the bottom side, and is not half-height, resize it to half-height
            else if (isHalfWidth && (isAlignedLeft || isAlignedRight) && isAlignedBottom && !isHalfHeight) {
                x = isAlignedLeft ? workspaceArea.x : workspaceArea.x + Math.round(workspaceArea.width / 2);
                y = workspaceArea.y + Math.round(workspaceArea.height / 2);
                width = Math.round(workspaceArea.width / 2);
                height = Math.round(workspaceArea.height / 2);
            }
        }
        else if (directionStr == 'LEFT') {
            // Default is to fill the left half of the monitor
            x = workspaceArea.x;
            y = workspaceArea.y;
            width = Math.round(workspaceArea.width / 2);
            height = workspaceArea.height;

            // If it is half-height, is touching top or bottom, and is not touching the left side, move it left without resizing
            if (isHalfHeight && (isAlignedTop || isAlignedBottom) && !isAlignedLeft) {
                x = workspaceArea.x;
                y = isAlignedTop ? workspaceArea.y : workspaceArea.y + Math.round(workspaceArea.height / 2);
                width = appFrameRect.width;
                height = Math.round(workspaceArea.height / 2);
            }
            // If it is half-height, is touching top or bottom, is touching the left side, and is not half-width, resize it to half-width
            else if (isHalfHeight && (isAlignedTop || isAlignedBottom) && isAlignedLeft && !isHalfWidth) {
                x = workspaceArea.x;
                y = isAlignedTop ? workspaceArea.y : workspaceArea.y + Math.round(workspaceArea.height / 2);
                width = Math.round(workspaceArea.width / 2);
                height = Math.round(workspaceArea.height / 2)
            }
        }
        else if (directionStr == 'RIGHT') {
            // Default is to fill the right half of the monitor
            x = workspaceArea.x + Math.round(workspaceArea.width / 2);
            y = workspaceArea.y;
            width = Math.round(workspaceArea.width / 2);
            height = workspaceArea.height;

            // If it is half-height, is touching top or bottom, and is not touching the right side, move it right without resizing
            if (isHalfHeight && (isAlignedTop || isAlignedBottom) && !isAlignedRight) {
                x = workspaceArea.x + workspaceArea.width - appFrameRect.width;
                y = isAlignedTop ? workspaceArea.y : workspaceArea.y + Math.round(workspaceArea.height / 2);
                width = appFrameRect.width;
                height = Math.round(workspaceArea.height / 2)
            }
            // If it is half-height, is touching top or bottom, is touching the right side, and is not half-width, resize it to half-width
            else if (isHalfHeight && (isAlignedTop || isAlignedBottom) && isAlignedRight && !isHalfWidth) {
                x = workspaceArea.x + Math.round(workspaceArea.width / 2);
                y = isAlignedTop ? workspaceArea.y : workspaceArea.y + Math.round(workspaceArea.height / 2);
                width = Math.round(workspaceArea.width / 2);
                height = Math.round(workspaceArea.height / 2)
            }
        }
    
        _log(`Calling move_resize_frame(${x}, ${y}, ${width}, ${height})`)
        appWindow.unmaximize(Meta.MaximizeFlags.BOTH)
        appWindow.move_resize_frame(true, x, y, width, height);
        _log("move_resize_frame after")
    }
}


function init() {
    _log(`initializing ${Me.metadata.name} ${version}`);

    return new Extension();
}
