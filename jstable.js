/*
  JavaScript group list jQuery plugin

	Author:  László Vadász
	Version: 1.0
	Update:  2013.01.11.
*/
var log = console.log;
(function (win, $) {
	var BasicDataSource = function(data){
		this.items = data || [];
		this.visibleColumns = [];
		this.columnType = {};
		this.clumnHeader = {};
		this.listeners = {};
		this.sortedCollumns = [];
		this.columnGenerator = {};
		this.filteredRows = [];
		this.filteredColumns = [];
		this.searchWord = null;

		this.searchMethod = function (itemId, prop, value, key) {
			return value.toString().toLowerCase().indexOf(key.toLowerCase()) == -1;
		}
		this.itemSorter = function(){
			for (idx in this.sortedCollumns){
				var col = this.sortedCollumns[idx];
			}
		}

		if (this.items.length){
			for (i in this.items[0]){
				this.visibleColumns.push(i);
			}
		}
		this.filteredColumns = this.visibleColumns;
	}

	BasicDataSource.prototype.addItem = function(item) {
		this.trigger('additem', item);
	};

	BasicDataSource.prototype.on = function (event, fn) {
		(this.listeners[event] = (this.listeners[event] || [])).push(fn);

	}
	BasicDataSource.prototype.off = function (event, fn) {
		if (event && this.listeners[event]){
			if (fn && this.listeners[event][fn]){
				delete this.listeners[event][fn];
			} else {
				delete this.listeners[event];
			}
		} else {
			this.listeners = {};
		}
	}
	BasicDataSource.prototype.trigger = function(event) {
		if (event && this.listeners && this.listeners[event]){
			var list = this.listeners[event];
			for (var fn in list){
				list[fn].apply(this, Array.prototype.slice.call(arguments, 1));
			}
		}
	};
	BasicDataSource.prototype.setSortProperty = function(prop) {
		var idx = this.sortedCollumns.indexOf(prop);
		if(idx != -1){
			var oldProp=this.sortedCollumns.splice(idx, 1)[0];
			if (oldProp == "-"+prop){
				return;
			} else {
				prop = "-"+oldProp;
			}
		}
		this.sortedCollumns.unshift(prop);
		this.__sort();
	};
	BasicDataSource.prototype.__sort = function() {
		if (this.sortedCollumns.length){
			var self = this;
			this.items.sort(function (a, b) {
				var sortProp = self.sortedCollumns[0];
					desc = sortProp.charAt(0) != "-"
				if (desc){
					return a[sortProp] - b[sortProp];
				} else {
					sortProp = sortProp.substr(1);
					return b[sortProp] - a[sortProp];
				}
			})
		}
		this.search(this.searchWord);
		this.trigger('redraw');
	};
	BasicDataSource.prototype.search = function(key) {
		this.searchWord = key;
		this.filteredRows = {};
		if (key && this.filteredColumns.length){
			for (i in this.items){
				var hide = true;
				for (j in this.filteredColumns){
					var prop = this.filteredColumns[j];
					if (!this.searchMethod(i, prop, this.items[i][prop], key)){
						hide = false;
						break;
					}
				}
				if (hide) this.filteredRows[i]=true;
			}
		}
		this.trigger('redraw');
	};
	BasicDataSource.defaultColumngenerator = function (item, type, value) {

	}



	$.fn.jstable = function (options) {
		var O = $.extend({}, {
				dataSource : new BasicDataSource(),			// List item class
				groupClass : 'item-group',	// List group item class
				searchInput : null,
				// Default function to grouping
				grouperFunction : function (item) { return $(item).text().charAt(0); }
			}, options),
			table;

		this.each(function () {
			O.dataSource.on('redraw', function(){
				table.find('tr').each(function(){
					var rows = $(this),
						item = parseInt(rows.data('item'));
					if (!O.dataSource.filteredRows[item]){
						rows.show().find('td').each(function () {
							var cell = $(this),
								prop = cell.data('prop');
							cell.html(searchHighlight(O.dataSource.items[item][prop]));
						});
					} else {
						rows.hide();
					}
				});
			});
			render($(this));
		});

		if (O.searchInput){
			$(O.searchInput).keyup(function () {
				O.dataSource.search($(this).val());
			});
		}

		function searchHighlight(text){
			return text.toString().replace(new RegExp("("+O.dataSource.searchWord+")", "gi"), '<span class="highlight">$1</span>');
		}

		function render (root) {
			var html = ['<table>'],
				ds = O.dataSource,
				header = ds.clumnHeader,
				colOrder = ds.visibleColumns,
				items = ds.items;
			html.push('<thead>');
			for (var o in colOrder){
				html.push('<th data-prop="'+colOrder[o]+'">', header[colOrder[o]] || colOrder[o] || o, '<span class="order"></span></th>');
			}
			html.push('</thead>');
			html.push('<tbody>');
			for (item in items){
				html.push('<tr data-item="'+item+'">');
				for (var o in colOrder){
					html.push('<td data-prop="'+colOrder[o]+'" data>', items[item][colOrder[o]], '</td>');
				}
				html.push('</tr>');
			}
			html.push('</tbody>');
			html.push('</table>');
			table = $(html.join('')).appendTo(root);

			table.find('th').click(function(){
				var _this = $(this),
					prop = _this.data('prop');
				O.dataSource.setSortProperty(prop);
			});
		}

	}

	win.BasicDataSource = BasicDataSource;
})(window, jQuery)
