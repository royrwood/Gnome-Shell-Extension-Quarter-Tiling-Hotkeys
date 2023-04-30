const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Meta = imports.gi.Meta;
const Shell = imports.gi.Shell;
const Main = imports.ui.main;


var doLogging = true;
var version = "0.4";

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

        _log(`Connecting to signal "accelerator-activated"`);
        this._acceleratorActivatedId = global.display.connect('accelerator-activated', this._onAcceleratorActivated.bind(this));

        _log(`Adding keybindings`);
        this._addKeyBinding(tileRightKeyCombo, null);
        this._addKeyBinding(tileLeftKeyCombo, null);
    }

    disable() {
        _log(`disabling ${Me.metadata.name} ${version}`);

        for (let bindingAction of this._keyBindings.keys()) {
            let keyBinding = this._keyBindings.get(bindingAction);
            let acceleratorString = keyBinding.acceleratorString;
            _log(`Removing keybinding for ${acceleratorString}`);
            this._removeKeyBinding(bindingAction, keyBinding);
            // this._keyBindings.delete(bindingAction);
        }

        if (this._acceleratorActivatedId) {
            _log(`Disconnecting from signal "accelerator-activated"`);
            global.display.disconnect(this._acceleratorActivatedId);
        }
    }

    _addKeyBinding(acceleratorString, callbackFunc) {
        _log(`Adding keybinding accelerator ${acceleratorString}`);

        let bindingAction = global.display.grab_accelerator(acceleratorString, 0);

        if (bindingAction == Meta.KeyBindingAction.NONE) {
            _log(`Failed to add keybinding ${acceleratorString}`);
            return null;
        }
        
        _log(`Adding keybinding name for action${acceleratorString}`);

        let bindingName = Meta.external_binding_name_for_action(bindingAction);
        Main.wm.allowKeybinding(bindingName, Shell.ActionMode.ALL);

        this._keyBindings.set(bindingAction, {name: bindingName, callback: callbackFunc, acceleratorString: acceleratorString});

        return bindingAction;
    }

    _removeKeyBinding(bindingAction, keyBinding) {
        let acceleratorString = keyBinding.acceleratorString;
        let bindingName = keyBinding.bindingName;

        _log(`Calling ungrab_accelerator() for ${acceleratorString}`);
        global.display.ungrab_accelerator(bindingAction);

        _log(`Calling allowKeybinding(Shell.ActionMode.NONE) for ${acceleratorString}`);
        Main.wm.allowKeybinding(bindingName, Shell.ActionMode.NONE);
    }


    _onAcceleratorActivated(display, action, deviceId, timestamp) {
        _log(`Got "accelerator-activated" callback signal`);

        try {
            let keyBinding = this._keyBindings.get(action);

            if (keyBinding) {
                let acceleratorString = keyBinding.acceleratorString;
                _log(`Got "accelerator-activated" callback signal for ${acceleratorString}`);
            }
            else {
                _log(`Got "accelerator-activated" callback signal for unknown acceleratorString`);
            }

        } catch (e) {
            _log(`Caught exception ${e}`);
            logError(e);
        }
    }

}


function init() {
    _log(`initializing ${Me.metadata.name} ${version}`);

    return new Extension();
}
