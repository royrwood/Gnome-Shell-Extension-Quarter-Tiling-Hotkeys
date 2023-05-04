const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;

function init () {
    // pass
}

function buildPrefsWidget () {
    let mainGtkBox = new Gtk.Box({ "height-request": 50, "width-request": 70, "orientation": Gtk.Orientation.VERTICAL });

    let mainGtkFrame = new Gtk.Frame({ "halign": Gtk.Align.CENTER, "margin-start": 25, "margin-end": 25, "margin-top": 25, "margin-bottom": 25 });
    mainGtkBox.append(mainGtkFrame, true, false, 10);

    let mainGtkListBox = new Gtk.ListBox({ "selection-mode": Gtk.SelectionMode.NONE });
    mainGtkFrame.set_child(mainGtkListBox);

    for (let i = 0; i < 5; i++) {
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


// function buildPrefsWidget () {
//   let widget = new MyPrefsWidget();
//   return widget;
// }

// const MyPrefsWidget = new GObject.Class({

//   Name : "My.Prefs.Widget",
//   GTypeName : "MyPrefsWidget",
//   Extends : Gtk.Box,
  
//   _init : function (params) {
  
//     this.parent(params);
//     this.margin = 20;
//     this.set_spacing(15);
//     this.set_orientation(Gtk.Orientation.VERTICAL);
    
//     // On GNOME SHELL +3.36 you don't need to quit on destroy
//     //this.connect('destroy', Gtk.main_quit);
    
//     let myLabel = new Gtk.Label({
//       label : "Translated Text"    
//     });
    
//     let spinButton = new Gtk.SpinButton();
//     spinButton.set_sensitive(true);
//     spinButton.set_range(-60, 60);
//     spinButton.set_value(0);
//     spinButton.set_increments(1, 2);
    
//     spinButton.connect("value-changed", function (w) {
//       log( w.get_value_as_int() );
//     });
    
//     let hBox = new Gtk.Box();
//     hBox.set_orientation(Gtk.Orientation.HORIZONTAL);
    
//     hBox.append(myLabel, false, false, 0);
//     hBox.append(spinButton, false, false, 0);
    
//     this.append(hBox);
//   }

// });


