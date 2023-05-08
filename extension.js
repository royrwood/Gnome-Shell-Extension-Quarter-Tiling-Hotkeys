const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Meta = imports.gi.Meta;
const Shell = imports.gi.Shell;
const Main = imports.ui.main;


const DO_LOGGING = true;
const MY_VERSION = "1.0.2";

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

        _log(`Adding key bindings`);
        this._addKeyBinding('tile-left-hotkey',  myExtensionSettings, this._doWindowMoveResize.bind(this, 'LEFT'));
        this._addKeyBinding('tile-right-hotkey', myExtensionSettings, this._doWindowMoveResize.bind(this, 'RIGHT'));
        this._addKeyBinding('tile-up-hotkey',    myExtensionSettings, this._doWindowMoveResize.bind(this, 'UP'));
        this._addKeyBinding('tile-down-hotkey',  myExtensionSettings, this._doWindowMoveResize.bind(this, 'DOWN'));
        _log(`Key bindings added`);
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

    _addKeyBinding(acceleratorSettingName, settings, callbackFunc) {
        const keyCombo = settings.get_strv(acceleratorSettingName);
        _log(`Adding key binding '${acceleratorSettingName}'='${keyCombo}'`);
        
        // Meta.KeyBindingFlags.NONE
        // Meta.KeyBindingFlags.PER_WINDOW
        // Meta.KeyBindingFlags.BUILTIN
        // Meta.KeyBindingFlags.IGNORE_AUTOREPEAT
        const flag = Meta.KeyBindingFlags.NONE;

        // Shell.ActionMode.NORMAL
        // Shell.ActionMode.OVERVIEW
        // Shell.ActionMode.LOCK_SCREEN
        // Shell.ActionMode.ALL
        const mode = Shell.ActionMode.NORMAL;

        const bindingResult = Main.wm.addKeybinding(acceleratorSettingName, settings, flag, mode, callbackFunc);
        if (bindingResult == Meta.KeyBindingAction.NONE) {
            _log(`Could not bind ${acceleratorSettingName}`)
        }
        else {
            _log(`Bound ${acceleratorSettingName}: bindingResult=${bindingResult}`)
        }
    }

    _doWindowMoveResize(directionStr) {
        const appWindow = global.display.focus_window;
        const appFrameRect = appWindow.get_frame_rect()
        const curMonitor = appWindow.get_monitor();
        const workspace = appWindow.get_workspace()
        const workspaceArea = workspace.get_work_area_for_monitor(curMonitor)
    
        const centerX = workspaceArea.x + Math.round(workspaceArea.width / 2);
        const leftX = appFrameRect.x;
        const rightX = appFrameRect.x + appFrameRect.width;
        const windowMostlyLeft = (centerX - leftX) > (rightX - centerX);
    
        const centerY = workspaceArea.y + Math.round(workspaceArea.height / 2);
        const topY = appFrameRect.y;
        const bottomY = appFrameRect.y + appFrameRect.height;
        const windowMostlyTop = (centerY - topY) > (bottomY - centerY);

        // The "<= 1" handles odd dimensions (e.g. workspaceArea.height=1053 on a 1080p display)
        const isAlignedLeft = appFrameRect.x == workspaceArea.x;
        const isAlignedTop = appFrameRect.y == workspaceArea.y;
        const isAlignedRight = Math.abs((appFrameRect.x + appFrameRect.width) - (workspaceArea.x + workspaceArea.width)) <= 1;
        const isAlignedBottom = Math.abs((appFrameRect.y + appFrameRect.height) - (workspaceArea.y + workspaceArea.height)) <= 1;
        const isFullWidth = Math.abs(appFrameRect.width - workspaceArea.width) <= 1;
        const isFullHeight = Math.abs(appFrameRect.height - workspaceArea.height) <= 1;
        const isHalfWidth = Math.abs(appFrameRect.width - Math.round(workspaceArea.width / 2)) <= 1;
        const isHalfHeight = Math.abs(appFrameRect.height - Math.round(workspaceArea.height / 2)) <= 1;
    
        _log(`Flags: appFrameRect.x=${appFrameRect.x}, appFrameRect.y=${appFrameRect.y}, appFrameRect.width=${appFrameRect.width}, appFrameRect.height=${appFrameRect.height}`)
        _log(`Flags: workspaceArea.x=${workspaceArea.x}, workspaceArea.y=${workspaceArea.y}, workspaceArea.width=${workspaceArea.width}, workspaceArea.height=${workspaceArea.height}`)
        _log(`Flags: isAlignedTop=${isAlignedTop}, isAlignedBottom=${isAlignedBottom}, isAlignedLeft=${isAlignedLeft}, isAlignedRight=${isAlignedRight} isHalfWidth=${isHalfWidth} isHalfHeight=${isHalfHeight}`)
        _log(`Flags: windowMostlyLeft=${windowMostlyLeft}, windowMostlyTop=${windowMostlyTop}, isFullWidth=${isFullWidth}, isFullHeight=${isFullHeight}`)

        let x, y, width, height;
    
        if (directionStr == 'UP') {
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
        else if (directionStr == 'DOWN') {
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
    _log(`initializing ${Me.metadata.name} ${MY_VERSION}`);

    return new Extension();
}
