(function(w, $) {
    'use strict';

    // register the main object
    w.SimpleBsDialog = function(options) {
        this.options = $.extend({}, {
            id: newGuid(),
            width: 500,
            autoWidth: false,
            height: 280,
            autoHeight: false,
            title: '',
            closable: true,
            spinner: false,
            spinnerIcon: '<span class="spinner-border" role="status"></span>',
            closeByBackdrop: true,
            closeByKeyboard: true,
            html: '',
            cssClass: '',
            buttons: [],
            onShow: function(dialogRef){},
            onShown: function(dialogRef){},
            onHide: function(dialogRef){},
            onHidden: function(dialogRef){},
        }, options);

    };

    // private methods
    function newGuid()
    {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = (c == 'x' ? r : r & 0x03 | 0x08);

            return v.toString(16);
        });
    }

    function setWidth(e, init)
    {
        var width = 0;

        // parse width
        if (e.data.options.width.toString().indexOf('px') >= 0) {
            width = parseInt(e.data.options.width.toString().substring(0, e.data.options.width.toString().indexOf('px')));
        } else if (e.data.options.width.toString().indexOf('%') >= 0) {
            width = parseInt((parseInt(e.data.options.width.toString().substring(0, e.data.options.width.toString().indexOf('%'))) / 100) * $(window).outerWidth(true), 10);
        } else {
            width = parseInt(e.data.options.width);
        }

        // set left
        $('#' + e.data.options.id).find('.modal-dialog').css({'margin-left': parseInt(($(window).outerWidth(true) - width) / 2, 10) + 'px'});

        // set width
        if (init === true || (e.data.options.autoWidth === true && e.data.options.width.toString().indexOf('%') >= 0)) {
            $('#' + e.data.options.id).find('.modal-content').css({'width': width + 'px'}).find('.modal-body').css({'min-width': (width - 120) + 'px'});
        }
    }

    function setHeight(e, init)
    {
        var height = 0;

        // parse height
        if (e.data.options.height.toString().indexOf('px') >= 0) {
            height = parseInt(e.data.options.height.toString().substring(0, e.data.options.height.toString().indexOf('px')));
        } else if (e.data.options.height.toString().indexOf('%') >= 0) {
            height = parseInt((parseInt(e.data.options.height.toString().substring(0, e.data.options.height.toString().indexOf('%'))) / 100) * ($(window).outerHeight(true) - parseInt($('#' + e.data.options.id).find('.modal-dialog').css('margin-top'), 10)), 10);
        } else {
            height = parseInt(e.data.options.height);
        }

        // set height
        if (init === true || (e.data.options.autoHeight === true && e.data.options.height.toString().indexOf('%') >= 0)) {
            $('#' + e.data.options.id).find('.modal-content').css({'min-height': height + 'px'}).find('.modal-body').css({'min-height': (height - 120) + 'px'});
        }
    }

    function setSize(e)
    {
        setWidth(e, false);
        setHeight(e, false);
    }

    function validOptions()
    {
        return [
            'width',
            'autoWidth',
            'height',
            'autoHeight',
            'title',
            'closable',
            'spinner',
            'spinnerIcon',
        ];
    }

    function parseCssClass(cssClass)
    {
        var cssClasses = cssClass.split(' ');

        if (cssClasses.length == 0) {
            return '';
        }

        return ' ' + cssClasses.join(' ');
    }

    // public methods
    SimpleBsDialog.prototype.open = function()
    {
        // store this
        var dialog = this;

        // bootstrap dialog
        $('body').append('<div class="simple-bs-dialog modal fade' + parseCssClass(dialog.options.cssClass) + '" id="' + dialog.options.id + '" tabindex="-1"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h5 class="modal-title">' + dialog.options.title + '</h5><button type="button" class="close' + (dialog.options.closable ? '' : ' d-none') + '" data-dismiss="modal">&times;</button></div><div class="modal-html"><div class="modal-body">' + dialog.options.html + '</div><div class="modal-spinner' + (dialog.options.spinner ? '' : ' d-none') + '">' + dialog.options.spinnerIcon + '</div></div>' + (dialog.options.buttons.length > 0 ? '<div class="modal-footer"></div>' : '') + '</div></div></div>');

        // add buttons
        $.each(dialog.options.buttons, function(index, options) {
            var opts = $.extend({}, {
                id: newGuid(),
                label: '',
                cssClass: '',
                action: function(dialogRef){},
            }, options);

            var button = $('<button type="button" class="btn btn-default' + (opts.cssClass.length > 0 ? ' ' : '') + opts.cssClass + '" id="' + opts.id + '">' + opts.label + '</button>');
            button.on('click', function(e) {
                opts.action(dialog);
            });

            $('#' + dialog.options.id).find('.modal-footer').append(button);
        });

        // destroy dom element
        $('#' + dialog.options.id).on('show.bs.modal', function() {
            // initial width
            setWidth({
                data: dialog,
            }, true);

            // initial height
            setHeight({
                data: dialog,
            }, true);

            // set dialog's auto size
            $(window).on('resize', dialog, setSize);

            // onShow event
            dialog.options.onShow(dialog);
        }).on('shown.bs.modal', function() {
            // onShown event
            dialog.options.onShown(dialog);
        }).on('hide.bs.modal', function(e) {
            // onHide event
            dialog.options.onHide(dialog);
        }).on('hidden.bs.modal', function(e) {
            // cancel dialog's auto size
            $(window).off('resize', setSize);

            // remove dialog's div
            $('#' + dialog.options.id).remove();

            // onHidden event
            dialog.options.onHidden(dialog);
        }).modal({
            'backdrop': dialog.options.closeByBackdrop,
            'keyboard': dialog.options.closeByKeyboard,
        });

        // return main object
        return this;
    }

    SimpleBsDialog.prototype.close = function()
    {
        $('#' + this.options.id).modal('hide');

        // return main object
        return this;
    }

    SimpleBsDialog.prototype.get = function(option)
    {
        if (validOptions().indexOf(option) > -1) {
            return this.options[option];
        }
    }

    SimpleBsDialog.prototype.set = function(options, value)
    {
        if (!$.isPlainObject(options) && validOptions().indexOf(options) > -1) {
            var option = options;

            options = {};
            options[option] = value;
        }

        if ($.isPlainObject(options)) {
            // store this
            var dialog = this;

            $.each(options, function(option, value) {
                switch (option) {
                case 'width': {
                    // new width
                    dialog.options.width = value;

                    // init new size
                    setWidth({
                        data: dialog,
                    }, true);

                    break;
                }
                case 'autoWidth': {
                    // new autoWidth
                    dialog.options.autoWidth = value;

                    // init new size
                    setWidth({
                        data: dialog,
                    }, true);

                    break;
                }
                case 'height': {
                    // new height
                    dialog.options.height = value;

                    // init new size
                    setHeight({
                        data: dialog,
                    }, true);

                    break;
                }
                case 'autoHeight': {
                    // new autoHeight
                    dialog.options.autoHeight = value;

                    // init new size
                    setHeight({
                        data: dialog,
                    }, true);

                    break;
                }
                case 'title': {
                    // update dialog's title
                    $('#' + dialog.options.id).find('.modal-title').html(dialog.options.title = value);

                    break;
                }
                case 'closable': {
                    // update dialog's closable
                    if (dialog.options.closable = value) {
                        $('#' + dialog.options.id).find('.modal-header button.close').removeClass('d-none');
                    } else {
                        $('#' + dialog.options.id).find('.modal-header button.close').addClass('d-none');
                    }

                    break;
                }
                case 'spinner': {
                    // update dialog's spinner
                    if (dialog.options.spinner = value) {
                        $('#' + dialog.options.id).find('.modal-spinner').removeClass('d-none');
                    } else {
                        $('#' + dialog.options.id).find('.modal-spinner').addClass('d-none');
                    }

                    break;
                }
                case 'spinnerIcon': {
                    // update dialog's spinnerIcon
                    $('#' + dialog.options.id).find('.modal-spinner').html(dialog.options.spinnerIcon = value);

                    break;
                }
                }
            });
        }

        // return main object
        return this;
    }
    
    SimpleBsDialog.prototype.getModalBody = function()
    {
        // get modal body
        return $('#' + this.options.id).find('.modal-body');
    }

    SimpleBsDialog.prototype.getButton = function(id)
    {
        // get button's object
        return $('#' + this.options.id).find('.modal-footer button#' + id);
    }

    SimpleBsDialog.prototype.getButtons = function()
    {
        // get all the buttons' object
        return $('#' + this.options.id).find('.modal-footer button');
    }

    // for lazy people
    SimpleBsDialog.show = function(options)
    {
        return (new SimpleBsDialog(options)).open();
    }

    // current version
    SimpleBsDialog.version = '1.0.1';
}(window, jQuery));