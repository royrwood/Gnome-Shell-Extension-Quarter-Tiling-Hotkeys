imports.gi.versions.Gtk = "4.0";
const { Gtk, Gdk } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;

function init () {
    // pass
}

function buildPrefsWidget () {
    let mainGtkBox = new Gtk.Box({ "height-request": 50, "width-request": 70, "orientation": Gtk.Orientation.VERTICAL });

    let mainGtkFrame = new Gtk.Frame({ "halign": Gtk.Align.CENTER, "margin-start": 25, "margin-end": 25, "margin-top": 25, "margin-bottom": 25 });
    mainGtkBox.append(mainGtkFrame);

    let mainGtkListBox = new Gtk.ListBox({ "selection-mode": Gtk.SelectionMode.NONE });
    mainGtkFrame.set_child(mainGtkListBox);

    for (let i = 0; i < 4; i++) {
        let rowGtkListBoxRow = new Gtk.ListBoxRow();
        mainGtkListBox.append(rowGtkListBoxRow);

        let rowGtkBox = new Gtk.Box({ "orientation": Gtk.Orientation.HORIZONTAL, "margin-start": 15, "margin-end": 15, "margin-top": 15, "margin-bottom": 15, "spacing": 25 });
        rowGtkListBoxRow.set_child(rowGtkBox);

        let gtkLabel = new Gtk.Label({ "label": "This is some text" });
        rowGtkBox.append(gtkLabel);

        let gtkButton = new Gtk.Button({ "label": "A Button", "hexpand": true, "halign": Gtk.Align.END, "valign": Gtk.Align.CENTER });
        rowGtkBox.append(gtkButton);

        gtkButton.connect('clicked', () => {
            log('The button was clicked');

            log('Creating Gtk.Window');
            let dialogGtkWindow = new Gtk.Window({"modal": true, "resizable": false });

            let dialogBox = new Gtk.Box({ "orientation": Gtk.Orientation.VERTICAL, "margin-start": 50, "margin-end": 50, "margin-top": 50, "margin-bottom": 50, "spacing": 25 });
            dialogGtkWindow.set_child(dialogBox);

            let dialogTextLabel = new Gtk.Label({ "label": "Press a key", "vexpand": true });
            dialogBox.append(dialogTextLabel);

            let dialogAccelLabel = new Gtk.Label({ "label": "", "vexpand": true });
            dialogBox.append(dialogAccelLabel);

            let eventControllerKey = new Gtk.EventControllerKey();
            dialogGtkWindow.add_controller(eventControllerKey);

            eventControllerKey.connect('key-pressed', (_widget, keyval, keycode, state) => {
                log(`You pressed a key: keyval=${keyval}, keycode=${keycode}, state=${state}`);
                let mask = state & Gtk.accelerator_get_default_mod_mask();
                let binding = Gtk.accelerator_name_with_keycode(null, keyval, keycode, mask);
                log(`Got binding=${binding}`);
                dialogAccelLabel.set_label(binding);

                settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.quarter-tiling-hotkeys');
                settings.set_strv('tile-left-hotkey', [binding])

                if (mask === 0 && keyval === Gdk.KEY_Escape) {
                    dialogGtkWindow.close();
                    return Gdk.EVENT_STOP;
                }
            });

            dialogGtkWindow.present();
        });
    }

    return mainGtkBox;
}
