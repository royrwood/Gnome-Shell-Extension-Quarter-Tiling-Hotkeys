const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Meta = imports.gi.Meta;
const Shell = imports.gi.Shell;
const Main = imports.ui.main;


var doLogging = true;
var version = "0.1.5";

var _log = function(msg) {
	if (doLogging) {
		console.log(`[QuarTileKeys] ${msg}`);
	}
}


class Extension {
    constructor() {
        this._acceleratorActivatedId = null;
        this._keyBindings = new Map();
    }

    enable() {
        _log(`Enabling ${Me.metadata.name} ${version}`);

        _log(`Getting settings`);
        this._settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.quarter-tiling-hotkeys');
        let tileLeftKeyCombo = this._settings.get_string('tile-left-hotkey');
        _log(`Got setting tileLeftKeyCombo='${tileLeftKeyCombo}'`);
        let tileRightKeyCombo = this._settings.get_string('tile-right-hotkey');
        _log(`Got setting tileRightKeyCombo='${tileRightKeyCombo}'`);

        _log(`Adding key bindings`);
        this._addKeyBinding('tile-left-hotkey', this._onTileLeft);
        this._addKeyBinding('tile-right-hotkey', this._onTileRight);
        _log(`Key bindings added`);
    }

    disable() {
        _log(`disabling ${Me.metadata.name} ${version}`);

        _log(`Removing key bindings`);
        Main.wm.removeKeybinding('tile-left-hotkey');
        Main.wm.removeKeybinding('tile-right-hotkey');
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

    _onTileLeft() {
        _log(`Callback _onTileLeft`);

        let appWindow = global.display.focus_window;
        _log("appWindow:"+appWindow)

        let appWindowID = appWindow.get_id();
        _log("appWindowID:"+appWindowID)

        let appFrameRect = appWindow.get_frame_rect()
        _log("appFrameRect.x: "+appFrameRect.x+" appFrameRect.y: "+appFrameRect.y+" appFrameRect.width: "+appFrameRect.width+" appFrameRect.height: "+appFrameRect.height)

        let appBufferRect = appWindow.get_buffer_rect()
        _log("appBufferRect.x: "+appBufferRect.x+" appBufferRect.y: "+appBufferRect.y+" appBufferRect.width: "+appBufferRect.width+" appBufferRect.height: "+appBufferRect.height)
        
        let maximized_horizontally = appWindow.maximized_horizontally
        let maximizedVertically = appWindow.maximizedVertically
        _log("maximized_horizontally: "+maximized_horizontally+" maximizedVertically:"+maximizedVertically)

        let monitorWorkArea = appWindow.get_work_area_current_monitor()
        _log("monitorWorkArea.x: "+monitorWorkArea.x+" monitorWorkArea.y: "+monitorWorkArea.y+" monitorWorkArea.width: "+monitorWorkArea.width+" monitorWorkArea.height: "+monitorWorkArea.height)

        let curMonitor = appWindow.get_monitor();
        _log("curMonitor: "+curMonitor)

        let workspace = appWindow.get_workspace()
        _log("workspace: "+workspace)
        let workspaceArea = workspace.get_work_area_for_monitor(curMonitor)
        _log("workspaceArea: "+workspaceArea)
        _log("workspaceArea.x: "+workspaceArea.x+" workspaceArea.y: "+workspaceArea.y+" workspaceArea.width: "+workspaceArea.width+" workspaceArea.height: "+workspaceArea.height)

        // app.maximize(Meta.MaximizeFlags.HORIZONTAL | Meta.MaximizeFlags.VERTICAL);
        // if (app.maximized_horizontally || app.maximized_vertically) {
        //     app.unmaximize(Meta.MaximizeFlags.BOTH);
        // }

        _log("move_resize_frame before")
        appWindow.unmaximize(Meta.MaximizeFlags.BOTH)
        appWindow.move_resize_frame(true, 100, 50, 900, 900);
        _log("move_resize_frame after")
    }

    _onTileRight() {
        _log(`Callback _onTileRight`);
    }

}


function init() {
    _log(`initializing ${Me.metadata.name} ${version}`);

    return new Extension();
}





// for (let bindingAction of this._keyBindings.keys()) {
//     let keyBinding = this._keyBindings.get(bindingAction);
//     let acceleratorString = keyBinding.acceleratorString;
//     _log(`Removing keybinding for ${acceleratorString}`);
//     this._removeKeyBinding(bindingAction, keyBinding);
//     // this._keyBindings.delete(bindingAction);
// }

// _shortcutsBindingIds.forEach((id) => Main.wm.removeKeybinding(id))