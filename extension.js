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


// function doWindowMoveResize(directionStr) {
//     _log("Callback _onTileDown");
//     let appWindow = global.display.focus_window;
//     let appFrameRect = appWindow.get_frame_rect()
//     let curMonitor = appWindow.get_monitor();
//     let workspace = appWindow.get_workspace()
//     let workspaceArea = workspace.get_work_area_for_monitor(curMonitor)

//     let centerX = workspaceArea.x + Math.round(workspaceArea.width / 2);
//     let leftX = appFrameRect.x;
//     let rightX = appFrameRect.x + appFrameRect.width;
//     let windowMostlyLeft = (centerX - leftX) > (rightX - centerX);

//     let centerY = workspaceArea.y + Math.round(workspaceArea.height / 2);
//     let topY = appFrameRect.y;
//     let bottomY = appFrameRect.y + appFrameRect.height;
//     let windowMostlyTop = (centerY - topY) > (bottomY - centerY);

//     let x, y, width, height;

//     if (directionStr == 'DOWN') {
//         x = (windowMostlyLeft) ? workspaceArea.x : workspaceArea.x + Math.round(workspaceArea.width / 2);
//         y = workspaceArea.y + Math.round(workspaceArea.height / 2);
//         width = Math.round(workspaceArea.width / 2);
//         height = Math.round(workspaceArea.height / 2);
//     }

//     _log("move_resize_frame before")
//     appWindow.unmaximize(Meta.MaximizeFlags.BOTH)
//     appWindow.move_resize_frame(true, x, y, width, height);
//     _log("move_resize_frame after")
// }


class Extension {
    constructor() {
        // Nothing to do, for now...
    }

    enable() {
        _log(`Enabling ${Me.metadata.name} ${version}`);

        _log(`Getting settings`);
        this._settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.quarter-tiling-hotkeys');
        // let tileLeftKeyCombo = this._settings.get_string('tile-left-hotkey');
        // _log(`Got setting tileLeftKeyCombo='${tileLeftKeyCombo}'`);
        // let tileRightKeyCombo = this._settings.get_string('tile-right-hotkey');
        // _log(`Got setting tileRightKeyCombo='${tileRightKeyCombo}'`);

        _log(`Adding key bindings`);
        this._addKeyBinding('tile-left-hotkey', this._onTileLeft.bind(this));
        this._addKeyBinding('tile-right-hotkey', this._onTileRight.bind(this));
        this._addKeyBinding('tile-up-hotkey', this._onTileUp.bind(this));
        this._addKeyBinding('tile-down-hotkey', this._onTileDown.bind(this));
        _log(`Key bindings added`);
    }

    disable() {
        _log(`disabling ${Me.metadata.name} ${version}`);

        _log(`Removing key bindings`);
        Main.wm.removeKeybinding('tile-left-hotkey');
        Main.wm.removeKeybinding('tile-right-hotkey');
        Main.wm.removeKeybinding('tile-up-hotkey');
        Main.wm.removeKeybinding('tile-down-hotkey');
        _log(`Key bindings removed`);
    }

    _addKeyBinding(acceleratorSettingName, callbackFunc) {
        _log(`Adding key binding accelerator ${acceleratorSettingName}`);
        
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
    
        let x, y, width, height;
    
        if (directionStr == 'TOP') {
            x = (windowMostlyLeft) ? workspaceArea.x : workspaceArea.x + Math.round(workspaceArea.width / 2);
            y = workspaceArea.y;
            width = Math.round(workspaceArea.width / 2);
            height = Math.round(workspaceArea.height / 2);
        }
        else if (directionStr == 'BOTTOM') {
            x = (windowMostlyLeft) ? workspaceArea.x : workspaceArea.x + Math.round(workspaceArea.width / 2);
            y = workspaceArea.y + Math.round(workspaceArea.height / 2);
            width = Math.round(workspaceArea.width / 2);
            height = Math.round(workspaceArea.height / 2);
        }
        else if (directionStr == 'LEFT') {
            x = workspaceArea.x;
            y = workspaceArea.y;
            width = Math.round(workspaceArea.width / 2);
            height = workspaceArea.height;
        }
        else if (directionStr == 'RIGHT') {
            x = workspaceArea.x + Math.round(workspaceArea.width / 2);
            y = workspaceArea.y;
            width = Math.round(workspaceArea.width / 2);
            height = workspaceArea.height;
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
