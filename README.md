Gnome Shell Extension to Support Quarter Tiling of Windows



Notes:

gnome-extensions enable roytest@example.com

journalctl /usr/bin/gnome-shell -f

MUTTER_DEBUG_DUMMY_MODE_SPECS=1920x1080 dbus-run-session -- gnome-shell --nested --wayland 2>&1 | grep ROYTEST

gnome-extensions install --force ${EXTENSION_ID}.zip



URLs:

DConf, Gnome Settings, etc:
https://www.makeuseof.com/access-hidden-gnome-desktop-settings-dconf-editor/


Sample Gnome Shell Extension that uses "global.stage.connect":
https://github.com/GNOME/gnome-shell-extensions/blob/9f88e98d1bfbd5f1b20c574c2c761765ebf1d939/extensions/windowsNavigator/extension.js
    global.stage.connect('key-press-event', this._onKeyPress.bind(this));

Gnome Discussion:
https://wiki.gnome.org/GettingInTouch/Matrix


Gnome Shell Mailing List:
https://mail.gnome.org/archives/gnome-shell-extensions-list/

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


PaperWM Notes:
https://github.com/paperwm/PaperWM/blob/develop/notes.org


Awesome Tiles:
https://github.com/velitasali/gnome-shell-extension-awesome-tiles/tree/main/src

WinTile:
https://github.com/Captn138/wintile-reloaded

Gnome Magic Window Keybinding:
https://github.com/adrienverge/gnome-magic-window

More Keyboard Shortcuts:
https://github.com/matthijskooijman/gnome-shell-more-keyboard-shortcuts

Some sample extension with key bindings and window monkey business:
https://gist.github.com/reusee/c8dbba4d2172352870a8e0349fd1b2f1


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

Extensions How-To:
https://gjs.guide/extensions/development/creating.html

"Getting started with GNOME Shell extension development":
https://twiddlingbits.net/gnome-shell-extension-development


PaperWM (scrollable tiling of windows and per monitor workspaces):
https://github.com/paperwm/PaperWM

