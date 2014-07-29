// Use jQuery('.erlHider').erlHider(defaultSettings)
jQuery.fn.erlCustomList = function (options) {
    var curThis = this;

    var defaultOptions = {
        elements: {
            methodModels: '.customList__method',
            reqUrl: '.customList__reqUrl',
            nextAction: '.customList__next',
            contentContainer: '.customList__contentContainer',

            contentItem: '.customList__contentItem',
            displayToggle: '.customList__displayToggle',

            searchAction: '.customList__searchAction'
        },
        listEndedCls: 'listEnded',
        processNewCls: 'inNewSearch',
        processNextCls: 'inNext',

        filters: '.customList__filter',
        orders: '.customList__orderBy',

        defaultSettings: {       // it will be override by "data-settings" attribute and placed into instance.settings
            itemsPerPage: 20,
            offset: 0,
            quantity: 0
        }
    };
    options = jQuery.extend(defaultOptions, options); // in this plugin you might use instance.options

    var methods = {
        Init: function (element) {
            var instance = methods.BaseInit(element, options, methods, {});

            instance.settings.itemsPerPage = Number(instance.settings.itemsPerPage);
            instance.settings.offset = Number(instance.settings.offset);
        },

        InitInnerControls: function (instance) {

        },

        GetReqUrl: function (instance) {
            var url = null,
                settings = {};
            if (instance.elements.reqUrl.length == 1) {
                settings = self.erljs.GetAttributeObject(instance.elements.reqUrl, 'data-settings');
                url = settings.url;
            } else if (instance.elements.reqUrl.length == 0) {
                settings = self.erljs.GetAttributeObject(instance.element, 'data-settings');
                url = settings.url;
            }
            return url;
        },
        GetMethodModel: function (instance) {
            var method = self.erljs.GetAttributeObject(instance.elements.methodModels, 'data-settings').method;
            return method;
        },
        ResetListInfo: function (instance, data) {
            instance.settings.offset = 0;
        },

        RequestItems: function (instance, data) {
            data = data || {};
            var filters = methods.CreateFilters(instance),
                orderBy = methods.CreateOrders(instance),
                methodModel = methods.GetMethodModel(instance),
                url = methods.GetReqUrl(instance);

            var onSuccess = function (response) {
                var result = {};
                if (!response.error) {
                    result = response.result;
                    instance.element.trigger('onSuccess.erlCustomList', result);
                    instance.settings.quantity = result.quantity;
                    if ('list' in result) {
                        if (!instance.settings.offset) {
                            methods.FillList(instance, {list: result.list});
                        } else {
                            methods.AppendList(instance, {list: result.list});
                        }
                        instance.settings.offset = instance.settings.offset + instance.settings.itemsPerPage;

                        if (result.quantity <= instance.settings.offset) {
                            instance.element.addClass(instance.options.listEndedCls);
                        }
                        else {
                            instance.element.removeClass(instance.options.listEndedCls);
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
            var ajaxObj = {
                url: url,
                data: {
                    method: methodModel,
                    params: params
                },
                success: onSuccess
            };
            self.erljs.transport.AjaxPOST(ajaxObj, 'jsonrpc');
        },
        makeSearch: function (instance, data) {
            methods.ResetListInfo(instance, null);
            data = jQuery.extend(true, data, {
                addParams: {
                    offset: methods.GetOffset(instance, null),
                    limit: methods.GetItemsPerPage(instance, null)}
            });
            methods.RequestItems(instance, data);
        },
        InitEvents: function (instance) {
            var onClick = function (event, data) {
                event.stopPropagation();
                methods.makeSearch(instance, data);
            };
            instance.elements.searchAction.bind('click', onClick);

            instance.element.bind('makeOrder.erlCustomList', onClick);
            instance.element.bind('makeSearch.erlCustomList', onClick);

            var onNextClick = function (event, data) {
                event.stopPropagation();
                methods.GetNext(instance, {});
            };
            instance.elements.nextAction.bind('click', onNextClick);
            instance.element.bind('getNext.erlCustomList', onNextClick);

        },

        MakeFilter: function (instance, data) {
            var item = data.item,
                localFilter = {},
                filterName, val,
                settings = self.erljs.GetAttributeObject(item, 'data-settings'),
                type = settings.type;

            if (type == 'select') {
                if (item.prop('type') == 'select-one') {
                    val = item.find('option').filter(':selected').val();
                    filterName = item.attr('name');
                    if (val) {
                        localFilter[filterName] = val;
                    }
                }
            } else if (type == 'select-data') {
                if (item.prop('type') == 'select-one') {
                    val = item.find('option').filter(':selected').val();
                    filterName = settings.name;
                    if (val) {
                        localFilter[filterName] = val;
                    }
                }
            } else if (type == 'input') {
                filterName = item.attr('name');
                val = item.val();
                if (val) {
                    localFilter[filterName] = val;
                }
            } else if (type == 'data') {
                filterName = settings.name;
                val = settings.value;
                if (val) {
                    localFilter[filterName] = val;
                }
            } else if (type == 'data-text') {
                filterName = settings.name;
                val = item.text();
                if (val) {
                    localFilter[filterName] = val;
                }
            }
            return {filter: localFilter, name: filterName};
        },
        CreateFilters: function (instance) {
            var filter = {};
            var onEach = function (index, item) {
                jQuery.extend(true, filter, (methods.MakeFilter(instance, {item: jQuery(item)})).filter);
            };
            instance.element.find(instance.options.filters).filter('.activeEl').each(onEach);
            console.log(filter);
            return filter;
        },

        MakeOrder: function (instance, data) {
            var item = data.item,
                localOrder = '',
                settings = self.erljs.GetAttributeObject(item, 'data-settings'),
                type = settings.type,
                dir = '?';

            if (type == 'select') {
            } else if (type == 'select-data') {
            } else if (type == 'input') {
            } else if (type == 'data') {
                localOrder = settings.name;
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
        CreateOrders: function (instance) {
            var order = [];
            var onEach = function (index, item) {
                var localOrder = methods.MakeOrder(instance, {item: jQuery(item)});
                if (localOrder) {
                    order.push(localOrder);
                }
            };
            instance.element.find(instance.options.orders).filter('.activeEl').each(onEach);
            return order;
        },

        GetNext: function (instance, data) {
            var itemsPerPage = methods.GetItemsPerPage(instance, null),
                offset = instance.settings.offset;
            methods.RequestItems(instance, {addParams: {offset: offset, limit: offset + itemsPerPage}});
        },
        GetItemsPerPage: function (instance, data) {
            return instance.settings.itemsPerPage;
        },
        GetOffset: function (instance, data) {
            return instance.settings.offset;
        },

        FillList: function (instance, data) {
            var list = jQuery(data.list).hide();
            instance.elements.contentContainer.html(list);
            list.fadeIn();
        },
        AppendList: function (instance, data) {
            var list = jQuery(data.list).hide();
            instance.elements.contentContainer.append(list);
            list.fadeIn();
        }

    };
    //Inherit common plugin methods.
    methods = self.erljs.FullExtend(self.erljsClasses.commonPluginsMethods, methods);

    methods.InitAll(this, options, methods);

    return options;
};