Gnome Shell Extension to Support Quarter Tiling of Windows
==========================================================

A Gnome Shell Extension to move and resize the focused application to the four quarters or halves of the current monitor using hotkeys.

There are lots of other great extensions out there that do all of this and more, but this is a simple option, if that's all you're looking for.



Notes to Myself:
================

Some notes that were useful during development...


Useful commands:
================

glib-compile-schemas schemas/

cp -v *.{js,json,css} ~/.local/share/gnome-shell/extensions/quarter-tiling-hotkeys\@royrwood-on-github/ && cp -v ./schemas/* ~/.local/share/gnome-shell/extensions/quarter-tiling-hotkeys\@royrwood-on-github/schemas/

glib-compile-schemas schemas/ && cp -v *.{js,json,css} ~/.local/share/gnome-shell/extensions/quarter-tiling-hotkeys\@royrwood-on-github/ && cp -rv ./schemas ~/.local/share/gnome-shell/extensions/quarter-tiling-hotkeys\@royrwood-on-github/ && cp -rv po ~/.local/share/gnome-shell/extensions/quarter-tiling-hotkeys\@royrwood-on-github/

MUTTER_DEBUG_DUMMY_MODE_SPECS=1500x1000 dbus-run-session -- gnome-shell --nested --wayland 2>&1 | grep QuarTileKeys

gnome-extensions enable quarter-tiling-hotkeys@royrwood-on-github

ls -l ~/.local/share/gnome-shell/extensions/

journalctl /usr/bin/gnome-shell -f



Sample Extensions:
==================

Awesome Tiles:
https://github.com/velitasali/gnome-shell-extension-awesome-tiles/tree/main/src


WinTile:
https://github.com/Captn138/wintile-reloaded


ShellTile:
https://github.com/emasab/shelltile


Tiling Gnome:
https://github.com/rliang/gnome-shell-extension-tilingnome


Tiling Assistant
https://github.com/Leleat/Tiling-Assistant


Simple Tile:
https://github.com/ledbettj/simple-tile


Useless Gaps:
https://github.com/mipmip/gnome-shell-extensions-useless-gaps


More Keyboard Shortcuts:
https://github.com/matthijskooijman/gnome-shell-more-keyboard-shortcuts





URLs:
=====

These need to be better organized...

Gnome Discussion:
https://wiki.gnome.org/GettingInTouch/Matrix


Gnome gjs docs:
https://gjs-docs.gnome.org


Gnome Shell Extension How-To:
https://gjs.guide/extensions/development/creating.html


Gjs Guide:
https://gjs.guide/guides/


Gtk4 Widget Reference:
https://docs.gtk.org/gtk4/class.Box.html


Gjs/Gtk4 Example:
https://gitlab.gnome.org/GNOME/gjs/-/blob/master/examples/gtk4.js


Gnome gjs Core Overrides:
https://gitlab.gnome.org/GNOME/gjs/-/tree/master/modules/core/overrides


Gnome gi.Gobject Overrides/Bindings:
https://gitlab.gnome.org/GNOME/gjs/-/blob/master/gi/object.cpp#L2550-2556


Meta Docs:
https://gnome.pages.gitlab.gnome.org/mutter/meta/index.html


Gnome gjs "Meta" API:
https://gjs-docs.gnome.org/meta12~12/meta.window#method-move_resize_frame
https://gjs-docs.gnome.org/meta12~12/meta.display


Source for "ui" import:
https://gitlab.gnome.org/GNOME/gnome-shell/-/tree/main/js/ui


DConf, Gnome Settings, etc:
https://www.makeuseof.com/access-hidden-gnome-desktop-settings-dconf-editor/


Gnome Shell Extension Reference:
https://github.com/julio641742/gnome-shell-extension-reference


Sample Dialog in an extension:
https://stackoverflow.com/questions/52551694/display-aboutdialog-from-gnome-shell-extension


Reddit User Looking for docs:
https://www.reddit.com/r/gnome/comments/133jb7u/developer_resources_for_libadwaita_adw1_for/


Mutter:
https://gitlab.gnome.org/GNOME/mutter/


How To:
https://medium.com/@justperfection.channel/how-to-create-a-gnome-extension-eb31b12e78d5


Gnome Shell Window Manager:
https://gitlab.gnome.org/GNOME/gnome-shell/-/blob/main/js/ui/windowManager.js

    setCustomKeybindingHandler(name, modes, handler) {
        if (Meta.keybindings_set_custom_handler(name, handler))
            this.allowKeybinding(name, modes);
    }

    addKeybinding(name, settings, flags, modes, handler) {
        let action = global.display.add_keybinding(name, settings, flags, handler);
        if (action != Meta.KeyBindingAction.NONE)
            this.allowKeybinding(name, modes);
        return action;
    }

    removeKeybinding(name) {
        if (global.display.remove_keybinding(name))
            this.allowKeybinding(name, Shell.ActionMode.NONE);
    }

    allowKeybinding(name, modes) {
        this._allowedKeybindings[name] = modes;
    }


Mutter keybindings.c:
https://gitlab.gnome.org/GNOME/mutter/-/blob/main/src/core/keybindings.c


Why you can't access Gnome Shell internals from a stand-alone app:
https://mail.gnome.org/archives/javascript-list/2012-January/msg00001.html


Gnome Shell Extensions Source / Examples:
https://github.com/GNOME/gnome-shell-extensions
https://github.com/GNOME/gnome-shell-extensions/tree/main/extensions


Install extension via dbus:
https://discourse.gnome.org/t/enable-gnome-extensions-without-session-restart/7936/4


Key binding:
https://stackoverflow.com/a/66517334
https://superuser.com/questions/471606/gnome-shell-extension-key-binding/1182899#1182899


Gnome JS READMEs:
https://gitlab.gnome.org/GNOME/gjs/-/tree/master/doc


"Getting started with GNOME Shell extension development":
https://twiddlingbits.net/gnome-shell-extension-development


PaperWM (scrollable tiling of windows and per monitor workspaces):
https://github.com/paperwm/PaperWM





Code Snippets:
==============

this._settings.connect('changed::tile-left-hotkey', () => {
    _log('"tile-left-hotkey" setting changed');
});


----

Main.notify("You pressed the key!")


----

Sample Gtk4 App:

#!/usr/bin/env gjs

imports.gi.versions.Gtk = "4.0";
const { GLib, Gtk, Gdk } = imports.gi;


function buildPrefsWidget () {
    let mainGtkBox = new Gtk.Box({ "height-request": 50, "width-request": 70, "orientation": Gtk.Orientation.VERTICAL });

    let mainGtkFrame = new Gtk.Frame({ "halign": Gtk.Align.CENTER, "margin-start": 25, "margin-end": 25, "margin-top": 25, "margin-bottom": 25 });
    mainGtkBox.append(mainGtkFrame);

    let mainGtkListBox = new Gtk.ListBox({ "selection-mode": Gtk.SelectionMode.NONE });
    mainGtkFrame.set_child(mainGtkListBox);

    for (let i = 0; i < 1; i++) {
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

            let dialogBox = new Gtk.Box({ "orientation": Gtk.Orientation.VERTICAL, "margin-start": 15, "margin-end": 15, "margin-top": 15, "margin-bottom": 15, "spacing": 25 });
            dialogGtkWindow.set_child(dialogBox);

            let dialogLabel = new Gtk.Label({ "label": "Press a key", "vexpand": true });
            dialogBox.append(dialogLabel);

            let eventControllerKey = new Gtk.EventControllerKey();
            dialogGtkWindow.add_controller(eventControllerKey);

            eventControllerKey.connect('key-pressed', (_widget, keyval, keycode, state) => {
                log(`You pressed a key: keyval=${keyval}, keycode=${keycode}, state=${state}`);
                let mask = state & Gtk.accelerator_get_default_mod_mask();

                if (mask === 0 && keyval === Gdk.KEY_Escape) {
                    let binding = Gtk.accelerator_name_with_keycode(null, keyval, keycode, mask);
                    log(`Got binding=${binding}`);
                    dialogGtkWindow.close();
                    return Gdk.EVENT_STOP;
                }
            });

            dialogGtkWindow.present();
        });
    }

    return mainGtkBox;
}


Gtk.init();

prefsWidget = buildPrefsWidget()

let win = new Gtk.Window({ title: 'Hello World', default_width: 300, default_height: 250, });
win.connect('close-request', () => { log('close-request emitted'); loop.quit() });
win.set_child(prefsWidget);
win.present();


let loop = GLib.MainLoop.new(null, false);

loop.run();

log('The main loop has completed.');
