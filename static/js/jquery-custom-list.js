jQuery.fn.customList = function (defaults) {
    var element = this;

    var options = {
        elements: {
            methodModels: '.c-list-method',
            reqUrl: '.c-list-url',
            nextAction: '.c-list-next',
            contentContainer: '.c-list-content',

            contentItem: '.c-list-c-item',
            displayToggle: '.c-list-display-tg',

            searchAction: '.c-list-sr-btn'
        },
        listEndedCls: 'c-list-ended',
        processNewCls: 'c-list-in-sr',
        processNextCls: 'c-list-in-next',

        filters: '.c-list-filter',
        orders: '.c-list-order'
    };

    var methods = {
        Init: function (element) {
            for (var k in options.defaults) {
                element.data(options.defaults[k], element.data(options.defaults[k]) || options.defaults[k]);
            }
            methods.InitEvents(element);
            if(methods.GetOffset(element) == element.data('quantity')){
                element.addClass(options.listEndedCls);
            }
        },

        GetReqUrl: function (element) {
            var url = null,
                urls = element.find(options.elements.reqUrl);
            if (urls.length == 1) {
                url = element.find(options.elements.reqUrl).data('url');
            } else if (urls.length == 0) {
                url = element.data('url');
            }
            return url;
        },
        ResetListInfo: function (element) {
            methods.SetOffset(element, 0);
            element.data('quantity', 0);
        },
        RequestItems: function (element, data) {
            data = data || {};
            var filters = methods.CreateFilters(element),
                orderBy = methods.CreateOrders(element),
                url = methods.GetReqUrl(element);
            var onSuccess = function (response) {
                var result = {};
                if (!response.error) {
                    result = response.result;
                    element.trigger('onSuccess.erlCustomList', result);
                    element.data('quantity', result.quantity);
                    if ('list' in result) {
                        var offset = methods.GetOffset(element);
                        if (!offset) {
                            methods.FillList(element, {list: result.list});
                        } else {
                            methods.AppendList(element, {list: result.list});
                        }
                        offset = methods.SetOffset(element, offset + methods.GetItemsPerPage(element));
                        if (result.quantity <= offset) {
                            element.addClass(options.listEndedCls);
                        }
                        else {
                            element.removeClass(options.listEndedCls);
                        }
                    }
                    if (result.count > 0) {
                    }
                }
            };
            var params = {
                filters: filters,
                order_by: orderBy
            };
            if (data.addParams) {
                jQuery.extend(true, params, data.addParams);
            }
            jQuery
                .post(url, {params: JSON.stringify(params)})
                .done(onSuccess);
        },
        makeSearch: function (element, data) {
            methods.ResetListInfo(element, null);
            data = jQuery.extend(true, data, {
                addParams: {
                    offset: methods.GetOffset(element, null),
                    per_page: methods.GetItemsPerPage(element, null)}
            });
            methods.RequestItems(element, data);
        },
        InitEvents: function (element) {
            var onClick = function (event, data) {
                methods.makeSearch(element, data);
            };
            element.on('click', options.elements.searchAction, onClick);
            element.bind('makeOrder.erlCustomList', onClick);
            element.bind('makeSearch.erlCustomList', onClick);
            var onNextClick = function (event, data) {
                if (!element.hasClass(options.listEndedCls)) {
                    methods.GetNext(element, {});
                }
            };
            element.on('click', options.elements.nextAction, onNextClick);
            element.bind('getNext.erlCustomList', onNextClick);
        },
        MakeFilter: function (data) {
            var item = data.item,
                localFilter = {},
                filterName, val,
                type = item.data('type');
            switch (type) {
                case 'select':
                    if (item.prop('type') == 'select-one') {
                        val = item.find('option').filter(':selected').val();
                        filterName = item.attr('name');
                        if (val) {
                            localFilter[filterName] = val;
                        }
                    }
                    break;
                case 'select-data':
                    if (item.prop('type') == 'select-one') {
                        val = item.find('option').filter(':selected').val();
                        filterName = item.data('name');
                        if (val) {
                            localFilter[filterName] = val;
                        }
                    }
                    break;
                case 'input':
                    filterName = item.attr('name');
                    val = item.val();
                    if (val) {
                        localFilter[filterName] = val;
                    }
                    break;
                case 'data':
                    filterName = item.data('name');
                    val = item.data('value');
                    if (val) {
                        localFilter[filterName] = val;
                    }
                    break;
                case 'data-text':
                    filterName = item.data('name');
                    val = item.text();
                    if (val) {
                        localFilter[filterName] = val;
                    }
                    break;
                case 'checkboxes':
                    filterName = item.data('name');
                    var arr = [];
                    item.find(':checkbox:checked').each(function(){
                        arr.push(this.value);
                    });
                    if (arr.length){
                        localFilter[filterName] = arr;
                    }
            }
            return {filter: localFilter, name: filterName};
        },
        CreateFilters: function (element) {
            var filter = {};
            var onEach = function (index, item) {
                jQuery.extend(true, filter, (methods.MakeFilter({item: jQuery(item)})).filter);
            };
            element.find(options.filters).filter('.activeEl').each(onEach);
            return filter;
        },
        MakeOrder: function (data) {
            var item = data.item,
                localOrder = '',
                type = item.data('type'),
                dir = '?';
            if (type == 'select') {
            } else if (type == 'select-data') {
            } else if (type == 'input') {
            } else if (type == 'data') {
                localOrder = item.data('name');
            }
            if (localOrder) {
                if (item.hasClass('sortAsc')) {
                    dir = ''
                } else if (item.hasClass('sortDesc')) {
                    dir = '-'
                }
                if (dir == '?') {
                    localOrder = dir;
                } else {
                    localOrder = dir + localOrder;
                }
            }
            return localOrder;
        },
        CreateOrders: function (element) {
            var order = [];
            var onEach = function (index, item) {
                var localOrder = methods.MakeOrder({item: jQuery(item)});
                if (localOrder) {
                    order.push(localOrder);
                }
            };
            element.find(options.orders).filter('.activeEl').each(onEach);
            return order;
        },
        GetNext: function (element, data) {
            var itemsPerPage = methods.GetItemsPerPage(element, null),
                offset = methods.GetOffset(element);
            methods.RequestItems(element, {addParams: {offset: offset, per_page: itemsPerPage}});  //limit - items per page
        },
        GetItemsPerPage: function (element) {
            return element.data('per-page');
        },
        GetOffset: function (element) {
            return element.data('offset');
        },
        SetOffset: function (element, offset) {
            element.data('offset', offset);
            return offset;
        },
        FillList: function (element, data) {
            var list = jQuery(data.list).hide();
            element.find(options.elements.contentContainer).html(list);
            list.fadeIn();
        },
        AppendList: function (element, data) {
            var list = jQuery(data.list).hide();
            element.find(options.elements.contentContainer).append(list);
            list.fadeIn();
        }
    };
    defaults = defaults || {};
    methods.Init(element);
    return element;
};