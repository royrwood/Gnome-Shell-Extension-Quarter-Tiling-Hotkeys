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
        gtkMessageDialog.text = "Choose keyboard accelerator";
        gtkMessageDialog.secondary_text = currentAcceleratorKeySetting;

        gtkMessageDialog.connect("response", (dialog, response) => {
            // Gtk.ResponseType.DELETE_EVENT (escape -> gtkMessageDialog.close())
            // Gtk.ResponseType.OK (OK button)
            // Gtk.ResponseType.CANCEL (CANCEL button)
            log(`Got "response" signal: response=${response}`);
            gtkMessageDialog.destroy();

            if (response == Gtk.ResponseType.OK) {
                log(`Got response Gtk.ResponseType.OK`);
                currentAcceleratorKeySetting = newAcceleratorKeySetting;
                currentAcceleratorGtkButton.set_label(currentAcceleratorKeySetting);
            }
            // Only set if user clicks "OK"
            // currentAcceleratorGtkButton.set_label(currentAcceleratorKeySetting)
            // settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.quarter-tiling-hotkeys');
            // settings.set_strv('tile-left-hotkey', [binding])
        });

        let eventControllerKey = new Gtk.EventControllerKey();
        gtkMessageDialog.add_controller(eventControllerKey);

        eventControllerKey.connect('key-pressed', (_widget, keyval, keycode, state) => {
            log(`Key pressed: keyval=${keyval}, keycode=${keycode}, state=${state}`);

            let mask = state & Gtk.accelerator_get_default_mod_mask();

            if (mask === 0 && keyval === Gdk.KEY_Escape) {
                gtkMessageDialog.close();
                return Gdk.EVENT_STOP;
            }

            let binding = Gtk.accelerator_name_with_keycode(null, keyval, keycode, mask);
            log(`Got binding=${binding}`);
            newAcceleratorKeySetting = binding;
            gtkMessageDialog.secondary_text = newAcceleratorKeySetting;
        });

        gtkMessageDialog.present();
    });
}




// function buildPrefsWidget () {
//     settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.quarter-tiling-hotkeys');

//     let mainGtkBox = new Gtk.Box({ "height-request": 50, "width-request": 70, "orientation": Gtk.Orientation.VERTICAL });

//     let mainGtkFrame = new Gtk.Frame({ "halign": Gtk.Align.CENTER, "margin-start": 25, "margin-end": 25, "margin-top": 25, "margin-bottom": 25 });
//     mainGtkBox.append(mainGtkFrame);

//     let mainGtkListBox = new Gtk.ListBox({ "selection-mode": Gtk.SelectionMode.NONE });
//     mainGtkFrame.set_child(mainGtkListBox);

//     _addAcceleratorKeySettingRow("Tile Left", "tile-left-hotkey", mainGtkListBox, settings);
//     _addAcceleratorKeySettingRow("Tile Right", "tile-right-hotkey", mainGtkListBox, settings);
//     _addAcceleratorKeySettingRow("Tile Up", "tile-up-hotkey", mainGtkListBox, settings);
//     _addAcceleratorKeySettingRow("Tile Down", "tile-down-hotkey", mainGtkListBox, settings);

//     return mainGtkBox;
// }

// // TODO:
// // - Add "Cancel" button
// // - Add "Accept" button
// // - Update button after key combo changed
// // - Filter dumb combinations?

// function _addAcceleratorKeySettingRow(promptText, acceleratorSettingName, mainGtkListBox, settings) {
//     let currentAcceleratorKeySettingList = settings.get_strv(acceleratorSettingName);
//     log(`currentAcceleratorKeySettingList=${currentAcceleratorKeySettingList}`)
//     let currentAcceleratorKeySetting = currentAcceleratorKeySettingList[0];
//     log(`currentAcceleratorKeySetting=${currentAcceleratorKeySetting}`)

//     let rowGtkListBoxRow = new Gtk.ListBoxRow();
//     mainGtkListBox.append(rowGtkListBoxRow);

//     let rowGtkBox = new Gtk.Box({ "orientation": Gtk.Orientation.HORIZONTAL, "margin-start": 15, "margin-end": 15, "margin-top": 15, "margin-bottom": 15, "spacing": 25 });
//     rowGtkListBoxRow.set_child(rowGtkBox);

//     let userPromptGtkLabel = new Gtk.Label({ "label": promptText });
//     rowGtkBox.append(userPromptGtkLabel);

//     let currentAcceleratorGtkButton = new Gtk.Button({ "label": currentAcceleratorKeySetting, "hexpand": true, "halign": Gtk.Align.END, "valign": Gtk.Align.CENTER });
//     rowGtkBox.append(currentAcceleratorGtkButton);

//     currentAcceleratorGtkButton.connect('clicked', () => {
//         log(`The ${acceleratorSettingName} button was clicked`);

//         let dialogGtkWindow = new Gtk.AlertDialog({"modal": true, "buttons": ["OK", "Cancel"] });

//         // log('Creating Gtk.Window');
//         // let dialogGtkWindow = new Gtk.Window({"modal": true, "resizable": false });

//         let dialogBox = new Gtk.Box({ "orientation": Gtk.Orientation.VERTICAL, "margin-start": 50, "margin-end": 50, "margin-top": 50, "margin-bottom": 50, "spacing": 25 });
//         dialogGtkWindow.set_child(dialogBox);

//         dialogGtkWindow.set_message(`Choose new key accelerator for "${promptText}"`);

//         // let dialogTextLabel = new Gtk.Label({ "label": `Choose new key accelerator for "${promptText}"`, "vexpand": true });
//         // dialogBox.append(dialogTextLabel);

//         // let dialogAccelLabel = new Gtk.Label({ "label": currentAcceleratorKeySetting, "vexpand": true });
//         // dialogBox.append(dialogAccelLabel);

//         // let okayCancelBox = new Gtk.Box({ "orientation": Gtk.Orientation.HORIZONTAL, "spacing": 25, "halign": Gtk.Align.END });
//         // dialogBox.append(okayCancelBox);
//         // let okayGtkButton = new Gtk.Button({ "label": "OK", "halign": Gtk.Align.END, "valign": Gtk.Align.CENTER });
//         // okayCancelBox.append(okayGtkButton);
//         // let cancelGtkButton = new Gtk.Button({ "label": "Cancel", "halign": Gtk.Align.END, "valign": Gtk.Align.CENTER });
//         // okayCancelBox.append(cancelGtkButton);

//         // let eventControllerKey = new Gtk.EventControllerKey();
//         // dialogGtkWindow.add_controller(eventControllerKey);

//         // eventControllerKey.connect('key-pressed', (_widget, keyval, keycode, state) => {
//         //     log(`Key pressed for ${acceleratorSettingName}: keyval=${keyval}, keycode=${keycode}, state=${state}`);

//         //     let mask = state & Gtk.accelerator_get_default_mod_mask();

//         //     if (mask === 0 && keyval === Gdk.KEY_Escape) {
//         //         dialogGtkWindow.close();
//         //         return Gdk.EVENT_STOP;
//         //     }

//         //     let binding = Gtk.accelerator_name_with_keycode(null, keyval, keycode, mask);
//         //     log(`Got binding=${binding}`);
//         //     currentAcceleratorKeySetting = binding;
//         //     dialogAccelLabel.set_label(currentAcceleratorKeySetting);
//         //     currentAcceleratorGtkButton.set_label(currentAcceleratorKeySetting)

//         //     settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.quarter-tiling-hotkeys');
//         //     settings.set_strv('tile-left-hotkey', [binding])
//         // });

//         dialogGtkWindow.present();
//     });
// }
