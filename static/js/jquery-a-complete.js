/**
 * Created by rtee on 8/28/14.
 */
jQuery.fn.aComplete = function (defaults) {
    var element = this,
        timeOutId;  //will be global in any case

    var onChange = function () {
        var input = jQuery(this),
            q = input.val(),
            container = input.next('.a-c-holder'),
            inputHidden = input.prev('[name=' + input.data('input') + ']');

        if (!inputHidden.length) {
            inputHidden = jQuery('<input type="hidden" name="' + input.data('input') + '" />');
            input.before(inputHidden);
        }

        inputHidden.val('');
        input.data(input.data('id-key'), '');

        if (q.length > 1) {
            var itmTextKey = input.data('text-key'),
                reqData = {};

            var relItm = input.data('a-c-rel');
            if (relItm) {
                var others = jQuery(relItm).not(input),
                    othersL = others.length;

                for (var i = 0; i < othersL; i++) {
                    var other = jQuery(others[i]),
                        otherIdKey = other.data('id-key'),
                        otherIdValue = other.data(otherIdKey);

                    if (otherIdValue)
                        reqData[other.data('name')] = otherIdValue;
                }
                if (jQuery.isEmptyObject(reqData)) {
                    others.last().focus();
                    input.val('');
                    return;
                }
            }
            reqData['q'] = q;

            clearTimeout(timeOutId);
            timeOutId = setTimeout(
                function () {
                    jQuery.post(input.data('complete-url'), reqData).done(function (data) {
                        data = JSON.parse(data);
                        if ('content' in data) {
                            var content = data.content;
                            if (content.length) {

                                if (!container.length) {
                                    container = jQuery('<div>').addClass('a-c-holder');
                                    input.after(container);
                                } else {
                                    container.empty().show();
                                }

                                var contentL = content.length,
                                    listItems = '';

                                for (var i = 0; i < contentL; i++) {

                                    var attr = content[i],
                                        text = attr[itmTextKey] || '';
                                    delete attr[itmTextKey];

                                    listItems += '<div';

                                    for (var key in attr) {
                                        listItems += ' data-' + key + '=' + attr[key] + ' '
                                    }
                                    listItems += '>' + text + '</div>'
                                }
                                container.html(listItems);
                            }
                        }
                    })
                }
                ,
                300)
        } else {
            container.empty().hide();
        }
    };
    element.on('input', '.a-c-itm', onChange);

    var onChoiceItemClick = function () {
        var choice = jQuery(this),
            holder = choice.closest('.a-c-holder'),
            input = holder.prev('.a-c-itm'),
            inputHidden = input.prev('[name=' + input.data('input') + ']'),
            itmIdKey = input.data('id-key');

        input.val(choice.text()).data(itmIdKey, choice.data(itmIdKey));
        holder.hide();

        if (!inputHidden.length) {
            inputHidden = jQuery('<input type="hidden" name="' + input.data('input') + '" />');
            input.before(inputHidden);
        }
        inputHidden.val(choice.data(itmIdKey)).trigger('change');

    };
    element.on('click', '.a-c-holder>div', onChoiceItemClick);

    var onBlur = function () {
        var itm = jQuery(this);
        setTimeout(function () {
            itm.next('.a-c-holder').hide();
        }, 400);
    };
    element.on('blur', '.a-c-itm', onBlur);

    var onFocus = function () {
        jQuery(this).next('.a-c-holder:not(:empty)').show();
    };
    element.on('focus', '.a-c-itm', onFocus);

    var onKeypress = function (event) {
        var holder = jQuery(this).next('.a-c-holder:not(:empty)');
        if (holder.length) {
            var children = holder.children(),
                childrenL = children.length,
                selected = children.filter('.selected');

            switch (event.which) {
                case 38: // up
                    holder.show();
                    if (selected.length) {
                        var newSelIndex = selected.index() - 1;
                        if (newSelIndex == -1) {
                            newSelIndex = childrenL - newSelIndex;
                        }
                        selected = children.removeClass('selected').eq(newSelIndex)
                    } else {
                        selected = children.last();
                    }

                    break;
                case 40: // down
                    holder.show();
                    if (selected.length) {
                        var newSelIndex = selected.index() + 1;
                        if (!(childrenL - newSelIndex)) {
                            newSelIndex = 0;
                        }
                        selected = children.removeClass('selected').eq(newSelIndex)
                    } else {
                        selected = children.first();
                    }

                    break;
                case 13: // enter
                    if (selected.length) {
                        selected.trigger('click')
                    }
                    event.preventDefault();
                    event.stopPropagation();

                    break;
            }

            selected.addClass('selected');
        }
    };
    element.on('keypress keyup', '.a-c-itm', onKeypress);

    var onMouseEnter = function () {
        jQuery(this).addClass('selected');
    };
    element.on('mouseenter', '.a-c-holder>div', onMouseEnter);

    var onMouseEnterHolder = function () {
        jQuery(this).children('.selected').removeClass('selected');
    };
    element.on('mouseenter', '.a-c-holder', onMouseEnterHolder);

    var onMouseLeave = function () {
        jQuery(this).removeClass('selected');
    };
    element.on('mouseleave', '.a-c-holder>div', onMouseLeave);

    return element;
};

jQuery(function () {
    jQuery(document).aComplete({});
});