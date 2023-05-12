imports.gi.versions.Gtk = '4.0';

const { Adw, Gtk, Gdk } = imports.gi;
const { extensionUtils: ExtensionUtils } = imports.misc;
const { format: Format, gettext: Gettext } = imports;

const Me = ExtensionUtils.getCurrentExtension();
const Domain = Gettext.domain(Me.metadata.uuid);
const _ = Domain.gettext;


var DO_LOGGING = false;

var _log = function(msg) {
	if (DO_LOGGING) {
		console.log(`[QuarTileKeys] ${msg}`);
	}
}


function init () {
    ExtensionUtils.initTranslations(Me.metadata.uuid);
}


function fillPreferencesWindow(adwPreferencesWindow) {
    const extensionGIOSettings = ExtensionUtils.getSettings('org.gnome.shell.extensions.quarter-tiling-hotkeys');

    // Add a preferences page + group + row for each accelerator key

    const acceleratorKeysPrefPage = new Adw.PreferencesPage();
    adwPreferencesWindow.add(acceleratorKeysPrefPage);

    const acceleratorKeysPrefGroup = new Adw.PreferencesGroup();
    acceleratorKeysPrefPage.add(acceleratorKeysPrefGroup);

    _addAcceleratorKeyPrefRow(_('Tile Left'), 'tile-left-hotkey', extensionGIOSettings, acceleratorKeysPrefGroup, adwPreferencesWindow);
    _addAcceleratorKeyPrefRow(_('Tile Right'), 'tile-right-hotkey', extensionGIOSettings, acceleratorKeysPrefGroup, adwPreferencesWindow);
    _addAcceleratorKeyPrefRow(_('Tile Up'), 'tile-up-hotkey', extensionGIOSettings, acceleratorKeysPrefGroup, adwPreferencesWindow);
    _addAcceleratorKeyPrefRow(_('Tile Down'), 'tile-down-hotkey', extensionGIOSettings, acceleratorKeysPrefGroup, adwPreferencesWindow);
}


function _addAcceleratorKeyPrefRow(acceleratorDescription, acceleratorSettingName, extensionGIOSettings, adwPreferencesGroup, adwPreferencesWindow) {
    const currentAcceleratorKeySetting = extensionGIOSettings.get_strv(acceleratorSettingName)[0];
    _log(`currentAcceleratorKeySetting=${currentAcceleratorKeySetting}`);

    // Add a preferences row with a label and a button showing the current setting
    const preferencesActionRow = new Adw.ActionRow({ title: acceleratorDescription });
    adwPreferencesGroup.add(preferencesActionRow);

    const currentAcceleratorGtkButton = new Gtk.Button({ 'label': currentAcceleratorKeySetting, 'halign': Gtk.Align.CENTER, 'valign': Gtk.Align.CENTER });
    preferencesActionRow.add_suffix(currentAcceleratorGtkButton);

    // When the user clicks the button, allow them to choose a new accelerator key
    currentAcceleratorGtkButton.connect('clicked', _chooseNewAcceleratorKey.bind(null, adwPreferencesWindow, currentAcceleratorGtkButton, acceleratorDescription, extensionGIOSettings, acceleratorSettingName));
}


function _chooseNewAcceleratorKey(adwPreferencesWindow, currentAcceleratorGtkButton, acceleratorDescription, extensionGIOSettings, acceleratorSettingName) {
    _log(`The ${acceleratorSettingName} button was clicked`);

    // Show a dialog to allow the user to pick a new accelerator key, or disable the action

    const gtkMessageDialog = new Gtk.MessageDialog({'modal': true});

    gtkMessageDialog.set_transient_for(adwPreferencesWindow);
    gtkMessageDialog.add_button(_('Accept'), Gtk.ResponseType.OK);
    gtkMessageDialog.add_button(_('Disable'), 1234);  // We can use any return code greater than zero, so I choose 1234
    gtkMessageDialog.add_button(_('Cancel'), Gtk.ResponseType.CANCEL);
    gtkMessageDialog.text = Format.vprintf(_('Choose "%s" keyboard accelerator'), [acceleratorDescription]);
    gtkMessageDialog.secondary_text = currentAcceleratorGtkButton.label;

    // When the dialog completes, do the right thing wrt the button the user clicked
    gtkMessageDialog.connect('response', (dialog, response) => {
        _log(`Got 'response' signal: response=${response}`);

        if (response === 1234) {
            _log(`Got response DISABLE`);
            const newAcceleratorKeySetting = 'disabled';
            currentAcceleratorGtkButton.set_label(newAcceleratorKeySetting);
            extensionGIOSettings.set_strv(acceleratorSettingName, [newAcceleratorKeySetting]);
        }
        else if (response === Gtk.ResponseType.OK) {
            _log(`Got response Gtk.ResponseType.OK`);
            const newAcceleratorKeySetting = gtkMessageDialog.secondary_text;  // The EventControllerKey stored the new binding in the secondary_text (see below)
            currentAcceleratorGtkButton.set_label(newAcceleratorKeySetting);
            extensionGIOSettings.set_strv(acceleratorSettingName, [newAcceleratorKeySetting]);
        }

        gtkMessageDialog.destroy();
    });

    // Add an EventControllerKey so we can get keypress events in the dialog
    const eventControllerKey = new Gtk.EventControllerKey();
    gtkMessageDialog.add_controller(eventControllerKey);

    eventControllerKey.connect('key-pressed', (_widget, keyval, keycode, state) => {
        _log(`Key pressed: keyval=${keyval}, keycode=${keycode}, state=${state}`);

        const modifierKeys = state & Gtk.accelerator_get_default_mod_mask();

        if (Gtk.accelerator_valid(keyval, modifierKeys)) {
            const binding = Gtk.accelerator_name_with_keycode(null, keyval, keycode, modifierKeys);
            _log(`Got binding=${binding}`);
            gtkMessageDialog.secondary_text = binding; // The outer code will grab the new binding from here when the dialog closes (see above)
        }
    });

    gtkMessageDialog.present();
}
