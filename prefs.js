imports.gi.versions.Gtk = "4.0";
const { Adw, Gtk, Gdk } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;


function init () {
    // pass
}


function fillPreferencesWindow(adwPreferencesWindow) {
    let myExtensionSettings = ExtensionUtils.getSettings('org.gnome.shell.extensions.quarter-tiling-hotkeys');

    const acceleratorKeysPrefPage = new Adw.PreferencesPage();
    adwPreferencesWindow.add(acceleratorKeysPrefPage);

    const acceleratorKeysPrefGroup = new Adw.PreferencesGroup();
    acceleratorKeysPrefPage.add(acceleratorKeysPrefGroup);

    _addAcceleratorKeyPrefRow("Tile Left", "tile-left-hotkey", myExtensionSettings, acceleratorKeysPrefGroup, adwPreferencesWindow);
    _addAcceleratorKeyPrefRow("Tile Right", "tile-right-hotkey", myExtensionSettings, acceleratorKeysPrefGroup, adwPreferencesWindow);
    _addAcceleratorKeyPrefRow("Tile Up", "tile-up-hotkey", myExtensionSettings, acceleratorKeysPrefGroup, adwPreferencesWindow);
    _addAcceleratorKeyPrefRow("Tile Down", "tile-down-hotkey", myExtensionSettings, acceleratorKeysPrefGroup, adwPreferencesWindow);
}


function _addAcceleratorKeyPrefRow(promptText, acceleratorSettingName, myExtensionSettings, adwPreferencesGroup, adwPreferencesWindow) {
    let currentAcceleratorKeySettingList = myExtensionSettings.get_strv(acceleratorSettingName);
    log(`currentAcceleratorKeySettingList=${currentAcceleratorKeySettingList}`);
    let currentAcceleratorKeySetting = currentAcceleratorKeySettingList[0];
    log(`currentAcceleratorKeySetting=${currentAcceleratorKeySetting}`);

    let newAcceleratorKeySetting = currentAcceleratorKeySetting;

    const preferencesActionRow = new Adw.ActionRow({ title: promptText });
    adwPreferencesGroup.add(preferencesActionRow);

    let currentAcceleratorGtkButton = new Gtk.Button({ "label": currentAcceleratorKeySetting, "halign": Gtk.Align.CENTER, "valign": Gtk.Align.CENTER });
    preferencesActionRow.add_suffix(currentAcceleratorGtkButton);

    currentAcceleratorGtkButton.connect('clicked', () => {
        log(`The ${acceleratorSettingName} button was clicked`);

        let gtkMessageDialog = new Gtk.MessageDialog({"modal": true});

        gtkMessageDialog.set_transient_for(adwPreferencesWindow);
        gtkMessageDialog.add_button("OK", Gtk.ResponseType.OK);
        gtkMessageDialog.add_button("CANCEL", Gtk.ResponseType.CANCEL);
        gtkMessageDialog.text = `Choose "${promptText}" keyboard accelerator`;
        gtkMessageDialog.secondary_text = newAcceleratorKeySetting;

        gtkMessageDialog.connect("response", (dialog, response) => {
            log(`Got "response" signal: response=${response}`);
            gtkMessageDialog.destroy();

            if (response === Gtk.ResponseType.OK) {
                log(`Got response Gtk.ResponseType.OK`);
                currentAcceleratorKeySetting = newAcceleratorKeySetting;
                currentAcceleratorGtkButton.set_label(currentAcceleratorKeySetting);
                // myExtensionSettings.set_strv(acceleratorSettingName, [binding]);
            }
        });

        let eventControllerKey = new Gtk.EventControllerKey();
        gtkMessageDialog.add_controller(eventControllerKey);

        eventControllerKey.connect('key-pressed', (_widget, keyval, keycode, state) => {
            log(`Key pressed: keyval=${keyval}, keycode=${keycode}, state=${state}`);

            let modifierKeys = state & Gtk.accelerator_get_default_mod_mask();

            if (modifierKeys === 0 && keyval === Gdk.KEY_Escape) {
                gtkMessageDialog.close();
                return Gdk.EVENT_STOP;
            }

            if (Gtk.accelerator_valid(keyval, modifierKeys)) {
                let binding = Gtk.accelerator_name_with_keycode(null, keyval, keycode, modifierKeys);
                log(`Got binding=${binding}`);
                newAcceleratorKeySetting = binding;
                gtkMessageDialog.secondary_text = newAcceleratorKeySetting;
                gtkMessageDialog.secondary_text = newAcceleratorKeySetting;
            }
        });

        gtkMessageDialog.present();
    });
}
