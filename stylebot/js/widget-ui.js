/**
* Utility Methods to create various UI Controls for Basic Mode
*   in Stylebot Editor
**/

var WidgetUI = {
  // constants
  BUTTON_ACTIVE_CLASS: 'stylebot-button-active',
  BUTTON_SELECTED_CLASS: 'stylebot-button-selected',
  NEXT_TO_SELECTED_BUTTON_CLASS: 'stylebot-next-segmented-button',
  ACCORDION_SELECTED_CLASS: 'stylebot-accordion-active',
  VALID_SIZE_UNITS: ['px', 'em', '%', 'pt'],

  /**
    * Create option for control
    * @param {element} Control
    * @return {element} UI for option
    */
  createOption: function(control) {
    var container = $('<div>', {
      class: 'stylebot-widget-option'
    });
    return container.append(control);
  },

  /**
    * Create Accordion UI
    * @param {string} Name of accordion
    * @return {element} Accordion <a> element
    */
  createAccordionHeader: function(name) {
    return $('<a>', {
      class: 'stylebot-accordion-header',
      tabIndex: 0,
      html: name
    })
    .prepend($('<div>', {
      class: 'stylebot-accordion-icon'
    }))
    .bind('mousedown keydown', function(e) {
      if (e.type == 'keydown' && e.keyCode != 13)
        return true;
      e.preventDefault();

      var el = $(e.target);
      if (!el.hasClass('stylebot-accordion-header'))
        el = el.parent();
      Events.toggleAccordion(el);
    });
  },

  /**
    * Create a textfield
    * @param {string} property Property name for textfield
    * @param {number} size Size of textfield
    * @param {function} onKeyDownHandler Callback for 'keydown' event
    * @param {function} onKeyUpHandler Callback for 'keyup' event
    * @return {jQuery element} The textfield element
    */
  createTextField: function(property, size, onKeyDownHandler, onKeyUpHandler) {
    var $input = $('<input>', {
      type: 'text',
      id: 'stylebot-' + property,
      class: 'stylebot-control stylebot-textfield',
      size: size
    })

    .data('property', property)

    .click(function(e) {
      Utils.selectAllText(e.target);
    })
    .focus(Events.onTextFieldFocus)
    .blur(Events.onTextFieldBlur);

    if (onKeyDownHandler)
      $input.keydown(onKeyDownHandler);
    if (onKeyUpHandler)
      $input.keyup(onKeyUpHandler);

    return $input;
  },

  /**
    * Create a size <select> control
    * @param {string} property Property Name
    * @return {jQuery element} SPAN for size selection
    */
  createSizeControl: function(property) {
    var container = $('<span>');

    // Textfield for entering size
    this.createTextField(property, 2, Events.onSizeFieldKeyDown, Events.onSizeFieldKeyUp)
    .appendTo(container);

    // Select box for choosing unit
    var $select = $('<select>', {
      class: 'stylebot-control stylebot-select'
    })
    .change(function(e) {
      $(this).prev().keyup();
    })
    .data('default', 'px')
    .appendTo(container);

    var len = this.VALID_SIZE_UNITS.length;
    for (var i = 0; i < len; i++) {
      this.createSelectOption($select,
        this.VALID_SIZE_UNITS[i],
        this.VALID_SIZE_UNITS[i]);
    }

    $select.selectize();
    return container;
  },

  /**
    * Create size controls for top, right, bottom and all
    * @param {element} control Control to insert multisize control in
    * @return {jQuery element} SPAN containing select element
    */
  createMultiSizeControl: function(control) {
    var container = $('<span>', {
      class: 'stylebot-multisize'
    });

    var len = control.id.length;
    var classNames = ['all', 'top', 'right', 'bottom', 'left'];

    for (var i = 0; i < len; i++) {
      var property = control.id[i];
      this.createTextField(property, 1, Events.onSizeFieldKeyDown, Events.onSizeFieldKeyUp)
        .addClass('stylebot-multisize-' + classNames[i])
        .appendTo(container);
    }

    // Select box for choosing unit
    var $select = $("<select>", {
      class: 'stylebot-control stylebot-select'
    })
    .change(function(e) {
      $(this).parent().find('input').keyup();
    })
    .data('default', 'px')
    .appendTo(container);

    var len = this.VALID_SIZE_UNITS.length;
    for (var i = 0; i < len; i++) {
      this.createSelectOption($select,
        this.VALID_SIZE_UNITS[i],
        this.VALID_SIZE_UNITS[i]);
    }

    $select.selectize();
    return container;
  },

  /**
    * Create a font family <select>
    * @param {element} control Element that should contain this control
    * @return {jQuery element} SPAN element containing the control
    */
  createFontFamilyControl: function(control) {
    var container = $('<span>', {
      class: 'stylebot-font-family-control'
    });

    var $select = $('<select>', {
      class: 'stylebot-control stylebot-select'
    })
    .data('default', 'default')
    .appendTo(container);

    // default option
    this.createSelectOption($select, 'Default', 'default');

    var len = control.options.length;
    for (var i = 0; i < len; i++) {
      this.createSelectOption($select,
        control.options[i],
        control.options[i])
    }

    $select.selectize({
      persist: true,
      create: function(input) {
        return {
            value: input,
            text: input
        }
      },

      onChange: function(value) {
        // todo: instead of this hack, fix this in selectize.js
        if (value === 'default') {
          value = '';
        }

        Events.onSelectChange('font-family', value);
      }
    });

    return container;
  },

  createBorderStyleControl: function(control) {
    var container = $('<span>', {
      class: 'stylebot-border-style-control'
    });

    var $select = $('<select>', {
      class: 'stylebot-control stylebot-select'
    })
    .data('default', 'default')
    .appendTo(container);

    // default option
    this.createSelectOption($select, 'Default', 'default');

    var len = control.options.length;
    for (var i = 0; i < len; i++) {
      this.createSelectOption($select, control.options[i], control.options[i])
    }

    $select.selectize({
      persist: true,
      create: false,
      onChange: function(value) {
        // todo: instead of this hack, fix this in selectize.js
        if (value === 'default') {
          value = '';
        }
        Events.onSelectChange('border-style', value);
      }
    });

    return container;
  },

  /**
    *
    */
  createToggleButton: function(text, property, value) {
    return this.createButton(text)
    .addClass('stylebot-toggle stylebot-control')
    .attr('id', 'stylebot-' + property)
    .data({
      'value': value,
      'property': property
    })
    .click(Events.onToggle);
  },

  /**
    *
    */
  createRadio: function(text, name, property, value) {
    var span = $('<span>', {
      id: 'stylebot-' + property,
      class: 'stylebot-control'
    });

    var radio = $('<input>', {
      type: 'radio',
      name: name,
      class: 'stylebot-control stylebot-radio'
    });

    if (typeof(property) == 'string')
      radio.attr('value', value);
    else
      radio.attr('value', value.join(','));

    radio.data('property', property);
    radio.click(Events.onRadioClick);
    radio.appendTo(span);
    this.createInlineLabel(text).appendTo(span);
    return span;
  },

  /**
    *
    */
  createSelectOption: function($select, text, data, property) {
    var $option = $('<option>', {
      html: text,
      value: data
    });

    if (property) {
      $option.data('property', property);
    }

    $select.append($option);
    return $option;
  },

  /**
    * Create the color picker
    *
    */
  createColorPicker: function(input, el) {
    return $('<div>', {
      class: 'stylebot-colorselector stylebot-control',
      tabIndex: 0
    })

    .append($('<div>', {class: 'stylebot-colorselector-color'}))

    .ColorPicker({
      flat: false,
      appendToElement: el,
      onChange: function(hsb, hex, rgb) {
        var colorCode = '#' + hex;
        // set input value to reflect the newly picked color's code
        input.attr('value', colorCode);
        // update the color selector color
        WidgetUI.setColorSelectorColor(input);

        // if live preview is enabled, update DOM
        if (stylebot.options.livePreviewColorPicker)
          input.keyup().blur();
      },
      onBeforeShow: function() {
        var color = input.attr('value');
        if (color === '' || color === undefined)
          color = '#ffffff'; // default is white
        $(this).ColorPickerSetColor(color);
        stylebot.widget.basic.isColorPickerVisible = true;
        input.focus();
      },
      onHide: function() {
        input.keyup().blur();
        stylebot.widget.basic.isColorPickerVisible = false;
      }
    })

    .keyup(function(e) {
      // enter
      if (e.keyCode == 13 && !$(e.target).hasClass('disabled'))
        $(this).ColorPickerToggle();
    });
  },

  // Set color selector value by fetching value from connected input textfield
  setColorSelectorColor: function(input) {
    // get the color value
    var color = input.attr('value');
    if (color != undefined) {
      // get the color selector connected to the input field
      var colorSelector = input.prev().find('div');
      colorSelector.css('backgroundColor', color);
    }
  },

  createLabel: function(text) {
    return $('<label>', {
      class: 'stylebot-label',
      html: text + ':'
    });
  },

  createInlineLabel: function(text) {
    return $('<label>', {
      class: 'stylebot-inline-label',
      html: text
    });
  },

  createButton: function(text) {
    return $('<button>', {
      class: 'stylebot-button',
      html: text
    })
    .mouseup(function(e) { e.target.focus(); });
  },

  createButtonSet: function(buttons, className,  enabledButtonIndex, callback) {
    var container = $('<span>');
    var len = buttons.length;

    for (var i = 0; i < len; i++) {
      var bt = this.createButton(buttons[i])
      .addClass(className)
      .data('class', className)
      .appendTo(container)
      .click(callback);

      if (i === enabledButtonIndex)
        bt.addClass(this.BUTTON_SELECTED_CLASS);
    }

    return container;
  },

  createSegmentedControl: function(control) {
    var container = $('<span>', {
      class: 'stylebot-control stylebot-segmented-control',
      id: 'stylebot-' + control.id
    });

    var len = control.options.length;
    for (var i = 0; i < len; i++) {
      var bt = this.createButton(control.options[i])
      .data({
        value: control.values[i],
        property: control.id
      })
      .bind('mousedown keydown', Events.onSegmentedControlMouseDown)
      .appendTo(container);
      // explicitly having to add the 'stylebot-last-child' class as :last-child causes weird issue in Chrome
      if (i == (len - 1))
        bt.addClass('stylebot-last-segmented-button');
    }
    return container;
  },

  setFontFamily: function(control, value) {
    if (value === undefined)
      return false;

    control.el.find('select').get(0).selectize.setValue(value);
  },

  setBorderStyle: function(control, value) {
    if (value === undefined)
      return false;

    control.el.find('select').get(0).selectize.setValue(value);
  },

  setColor: function(control, value) {
    if (value === undefined)
      return false;
    control.el.attr('value', value);
    this.setColorSelectorColor(control.el);
  },

  setToggleButton: function(control, value) {
    if (value === control.el.data('value'))
      this.selectButton(control.el);
    else
      this.deselectButton(control.el);
  },

  setSegmentedControl: function(control, value) {
    var index = $.inArray($.trim(String(value)), control.values);
    if (index != -1)
      this.selectSegmentedButton($(control.el.find('button').get(index)));
  },

  setSize: function(control, value) {
    var self = WidgetUI;
    if (value === undefined)
      return false;

    var unit = $.trim(self.determineSizeUnit(value));

    control.el.find('.stylebot-textfield').attr('value', value.replace(unit, ''));
    control.el.find('select').get(0).selectize.setValue(unit);
  },

  determineSizeUnit: function(value) {
    var self = WidgetUI;
    var len = self.VALID_SIZE_UNITS.length;

    for (var i = 0; i < len; i++) {
      if (value.indexOf(self.VALID_SIZE_UNITS[i]) != -1)
      break;
    }

    if (i < len)
      return self.VALID_SIZE_UNITS[i];
    else
      return '';
  },

  setMultiSize: function(control, values) {
    var self = WidgetUI;
    var $input = control.el.find('.stylebot-textfield');
    var $select = control.el.find('select');

    if (values[0] != undefined) {
      var parts = values[0].split(' ');
      // parse value of the form margin: 2px 10px;
      if (parts.length === 2) {
        values[0] = '';
        values[1] = values[3] = $.trim(parts[0]); // top & bottom
        values[2] = values[4] = $.trim(parts[1]); // left & right
      }
      // parse value of the form margin: 2px 10px 8px 6px;
      else if (parts.length === 4) {
        values[0] = '';
        values[1] = $.trim(parts[0]);
        values[2] = $.trim(parts[1]);
        values[3] = $.trim(parts[2]);
        values[4] = $.trim(parts[3]);
      }
    }

    var len = values.length;
    var unit;

    for (var i = 0; i < len; i++) {
      var value = values[i];
      if (value != undefined) {
        if (unit == undefined) {
          unit = $.trim(self.determineSizeUnit(value));
        }
        $($input.get(i)).attr('value', value.replace(unit, ''));
      }
    }

    if (unit) {
      $select.get(0).selectize.setValue(unit);
    }

    $input.keyup();
  },

  selectButton: function($bt) {
    $bt.addClass(this.BUTTON_SELECTED_CLASS);
  },

  deselectButton: function($bt) {
    $bt.removeClass(this.BUTTON_SELECTED_CLASS);
  },

  selectSegmentedButton: function($bt) {
    $bt.addClass(this.BUTTON_SELECTED_CLASS)
    .next().addClass(this.NEXT_TO_SELECTED_BUTTON_CLASS);
  },

  deselectSegmentedButton: function($bt) {
    $bt.removeClass(this.BUTTON_SELECTED_CLASS)
    .next().removeClass(this.NEXT_TO_SELECTED_BUTTON_CLASS);
  },

  isButtonSelected: function($bt) {
    return $bt.hasClass(this.BUTTON_SELECTED_CLASS);
  },

  setButtonAsActive: function($bt) {
    $bt.addClass(this.BUTTON_ACTIVE_CLASS);
  },

  setButtonAsInactive: function($bt) {
    $bt.removeClass(WidgetUI.BUTTON_ACTIVE_CLASS);
  }
};
