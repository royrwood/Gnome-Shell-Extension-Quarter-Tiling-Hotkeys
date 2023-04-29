const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Meta = imports.gi.Meta;
const Shell = imports.gi.Shell;
const Main = imports.ui.main;


class Extension {
    constructor() {
        this._version = '0.2';
        this._acceleratorActivatedId = null;
        this._bindingAction = null;
        this._bindingName = null;
    }

    enable() {
        console.log(`ROYTEST: Enabling ${Me.metadata.name} ${this._version}`);

        console.log(`ROYTEST: Connecting to signal "accelerator-activated"`);
        this._acceleratorActivatedId = global.display.connect('accelerator-activated', this._onAcceleratorActivated.bind(this));

        console.log(`ROYTEST: Adding keybinding`);
        this._bindingAction = global.display.grab_accelerator('<Control><Super><Alt>right', 0);
        if (this._bindingAction == Meta.KeyBindingAction.NONE) {
            console.log(`ROYTEST: Failed to add keybinding`);
        } else {
            console.log(`ROYTEST: Adding keybinding name for action`);

            this._bindingName = Meta.external_binding_name_for_action(this._bindingAction);
            Main.wm.allowKeybinding(this._bindingName, Shell.ActionMode.ALL);
        }
    }

    disable() {
        console.log(`ROYTEST: disabling ${Me.metadata.name} ${this._version}`);

        if (this._bindingAction) {
            console.log(`ROYTEST: Calling ungrab_accelerator()`);
            global.display.ungrab_accelerator(this._bindingAction);
        }
        if (this._bindingName) {
            console.log(`ROYTEST: Calling allowKeybinding() with Shell.ActionMode.NONE`);
            Main.wm.allowKeybinding(this._bindingName, Shell.ActionMode.NONE);
        }
        if (this._acceleratorActivatedId) {
            console.log(`ROYTEST: Disconnecting from signal "accelerator-activated"`);
            global.display.disconnect(this._acceleratorActivatedId);
        }
    }

    _onAcceleratorActivated(display, action, deviceId, timestamp) {
        console.log(`ROYTEST: Got "accelerator-activated" callback signal`);

        try {
            console.log(`ROYTEST: Got "accelerator-activated" callback signal: action=${action}`);
        } catch (e) {
            console.log(`ROYTEST: Caught exception while logging`);
            logError(e);
        }
    }

}


function init() {
    console.log(`ROYTEST: initializing ${Me.metadata.name} ${this._version}`);

    return new Extension();
}
