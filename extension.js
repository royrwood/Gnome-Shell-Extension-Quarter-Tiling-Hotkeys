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
        this._addKeyBinding('tile-up-hotkey', this._onTileUp);
        this._addKeyBinding('tile-down-hotkey', this._onTileDown);
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

        // GNOME Shell-Message: 17:58:10.709: [QuarTileKeys] appFrameRect.x: 70 appFrameRect.y: 27 appFrameRect.width: 900 appFrameRect.height: 900
        // GNOME Shell-Message: 17:58:10.710: [QuarTileKeys] appBufferRect.x: 9 appBufferRect.y: -28 appBufferRect.width: 1022 appBufferRect.height: 1022
        // GNOME Shell-Message: 17:58:10.711: [QuarTileKeys] maximized_horizontally: false maximizedVertically:false
        // GNOME Shell-Message: 17:58:10.712: [QuarTileKeys] monitorWorkArea.x: 70 monitorWorkArea.y: 27 monitorWorkArea.width: 1850 monitorWorkArea.height: 1053
        // GNOME Shell-Message: 17:58:10.712: [QuarTileKeys] curMonitor: 0
        // GNOME Shell-Message: 17:58:10.713: [QuarTileKeys] workspace: [object instance wrapper GIName:Meta.Workspace jsobj@0x1ac8dddc0e20 native@0x556e065d2d60]
        // GNOME Shell-Message: 17:58:10.713: [QuarTileKeys] workspaceArea: [boxed instance wrapper GIName:Meta.Rectangle jsobj@0x1b29f269a970 native@0x556e09feaab0]
        // GNOME Shell-Message: 17:58:10.714: [QuarTileKeys] workspaceArea.x: 70 workspaceArea.y: 27 workspaceArea.width: 1850 workspaceArea.height: 1053


        let x = workspaceArea.x;
        let y = workspaceArea.y;
        let width = Math.round(workspaceArea.width / 2);
        let height = Math.round(workspaceArea.height);
        
        _log("move_resize_frame before")
        appWindow.unmaximize(Meta.MaximizeFlags.BOTH)
        appWindow.move_resize_frame(true, x, y, width, height);
        _log("move_resize_frame after")
    }

    _onTileRight() {
        _log("Callback _onTileRight");
        let appWindow = global.display.focus_window;
        let curMonitor = appWindow.get_monitor();
        let workspace = appWindow.get_workspace()
        let workspaceArea = workspace.get_work_area_for_monitor(curMonitor)

        let x = workspaceArea.x + Math.round(workspaceArea.width / 2);
        let y = workspaceArea.y;
        let width = Math.round(workspaceArea.width / 2);
        let height = Math.round(workspaceArea.height);
        
        _log("move_resize_frame before")
        appWindow.unmaximize(Meta.MaximizeFlags.BOTH)
        appWindow.move_resize_frame(true, x, y, width, height);
        _log("move_resize_frame after")
    }

    _onTileUp() {
        _log("Callback _onTileUp");
        let appWindow = global.display.focus_window;
        let appFrameRect = appWindow.get_frame_rect()
        let curMonitor = appWindow.get_monitor();
        let workspace = appWindow.get_workspace()
        let workspaceArea = workspace.get_work_area_for_monitor(curMonitor)

        let centerX = workspaceArea.x + Math.round(workspaceArea.width / 2);
        let leftX = appFrameRect.x;
        let rightX = appFrameRect.x + appFrameRect.width;
        let leftWidth = (leftX < centerX) ? centerX - leftX : 0;
        let rightWidth = (rightX > centerX) ? rightX - centerX : 0;

        let x = (leftWidth >= rightWidth) ? workspaceArea.x : workspaceArea.x + Math.round(workspaceArea.width / 2);
        let y = workspaceArea.y;
        let width = Math.round(workspaceArea.width / 2);
        let height = Math.round(workspaceArea.height / 2);
        
        _log("move_resize_frame before")
        appWindow.unmaximize(Meta.MaximizeFlags.BOTH)
        appWindow.move_resize_frame(true, x, y, width, height);
        _log("move_resize_frame after")
    }

    _onTileDown() {
        _log("Callback _onTileDown");
        let appWindow = global.display.focus_window;
        let appFrameRect = appWindow.get_frame_rect()
        let curMonitor = appWindow.get_monitor();
        let workspace = appWindow.get_workspace()
        let workspaceArea = workspace.get_work_area_for_monitor(curMonitor)

        let centerX = workspaceArea.x + Math.round(workspaceArea.width / 2);
        let leftX = appFrameRect.x;
        let rightX = appFrameRect.x + appFrameRect.width;
        let leftWidth = (leftX < centerX) ? centerX - leftX : 0;
        let rightWidth = (rightX > centerX) ? rightX - centerX : 0;

        let x = (leftWidth >= rightWidth) ? workspaceArea.x : workspaceArea.x + Math.round(workspaceArea.width / 2);
        let y = workspaceArea.y + Math.round(workspaceArea.height / 2);
        let width = Math.round(workspaceArea.width / 2);
        let height = Math.round(workspaceArea.height / 2);
        
        _log("move_resize_frame before")
        appWindow.unmaximize(Meta.MaximizeFlags.BOTH)
        appWindow.move_resize_frame(true, x, y, width, height);
        _log("move_resize_frame after")
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