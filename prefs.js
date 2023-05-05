// const GObject = imports.gi.GObject;
// const Gtk = imports.gi.Gtk;

imports.gi.versions.Gtk = "4.0";
const { Gtk, Gdk } = imports.gi;


function init () {
    // pass
}

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
//            let dialogGtkWindow = new Gtk.Window({"modal": true, "default-width": 400, "default-height": 200, "resizable": false });
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

/*
  <template class="AwesomeTilesPrefsWidget" parent="GtkBox">
    <property name="height-request">500</property>
    <property name="width-request">700</property>
    <property name="orientation">vertical</property>
    <property name="baseline-position">top</property>
    <child>
      <object class="GtkFrame" id="general">
        <property name="halign">center</property>
        <property name="margin-start">36</property>
        <property name="margin-end">36</property>
        <property name="margin-top">18</property>
        <property name="margin-bottom">18</property>
        <property name="child">
          <object class="GtkListBox">
            <property name="selection-mode">none</property>

            <child>
              <object class="GtkListBoxRow">
                <property name="child">
                  <object class="GtkBox">
                    <property name="margin-start">16</property>
                    <property name="margin-end">16</property>
                    <property name="margin-top">16</property>
                    <property name="margin-bottom">16</property>
                    <property name="spacing">30</property>
                    <child>
                      <object class="GtkBox">
                        <property name="orientation">vertical</property>
                        <child>
                          <object class="GtkLabel">
                            <property name="halign">start</property>
                            <property name="label" translatable="yes">Align Window to Center</property>
                          </object>
                        </child>
                        <child>
                          <object class="GtkLabel">
                            <property name="valign">center</property>
                            <property name="halign">start</property>
                            <property name="label" translatable="yes">Shortcut to align the window in focus to center without resizing it.</property>
                            <property name="use-markup">1</property>
                            <property name="wrap">1</property>
                            <property name="max-width-chars">50</property>
                            <property name="xalign">0</property>
                            <style>
                              <class name="dim-label" />
                            </style>
                          </object>
                        </child>
                      </object>
                    </child>
                    <child>
                      <object class="GtkButton" id="align_window_to_center">
                        <property name="hexpand">1</property>
                        <property name="halign">end</property>
                        <property name="valign">center</property>
                        <property name="name">shortcut-align-window-to-center</property>
                        <signal name="clicked" handler="_onAssignShortcut" swapped="no" />
                      </object>
                    </child>
                  </object>
                </property>
              </object>
            </child>
*/
