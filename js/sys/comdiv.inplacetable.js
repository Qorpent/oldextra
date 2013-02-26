zeta = Object.isUndefined(zeta) ?  {} : zeta;
zeta.components = zeta.components || {};
zeta.tableutils = zeta.tableutils || {};
Object.extend(zeta.tableutils,{
	extendcell : function(td){
		td = $(td);
		td.row = this.getrow(td);
		td.table = this.gettable(td);
		td.column = this.getcolumn(td);
		td.evalAttr = function(attr){
			return zeta.tableutils.evalAttr(td,attr);
		};
		return td;
	},
	gettable : function(td){
		td = $(td);
		if(td.table) {
			return td.table;
		}
		var table = this.getrow(td).up('table');
		td.table = table;
		return table;
	},
	getrow : function(td){
		td = $(td);
		if(td.row) {
			return td.row;
		}
		var tr = td.up('tr');
		td.row = tr;
		return tr;
	},
	getcolumn : function(td){
		td = $(td);
		if(td.column){
			return td.column;
		}
		var tr = this.getrow(td);
		var table = this.gettable(td);
		var cols = table.select('col');
		var idx = 0;
		var found = false;
		tr.select('td').each(function(c){
			if(found)return;
			if(c==td){
				found = true;
				return;
			}
			idx += c.readAttribute('colspan') || 1;
		});
		col = cols[idx];
		td.column = col;
		return col;
	},
	evalAttr : function(td, attr) {
		td = this.extendcell(td);
		var val = $$A(td, attr);
		if(!val){
			val = $$A(td.row,attr);
		}
		if(!val){
			val = $$A(td.column,attr);
		}
		if(!val){
			val = $$A(td.table,attr);
		}
		return val;
	},
});
zeta.components.inplacetable = Class.create({
	options : {
		oncheckcell : function(cell){return true;},
	},
	initialize : function(element, options){
		this.element = element;
		Object.extend(this.options, options || {});
		Event.observe(this.element,'click',function(event){
			var td = Event.findElement(event,'td');
			if(td && this.options.oncheckcell(td) && !td.hasClassName('inchangemode')){
				this.makechangeable(td);
			}
		}.bind(this));
	},
	
	makechangeable : function(td){
		if(!td.div){
			var inner = td.innerHTML;
			if(!td.oldvalue){
				td.oldvalue = inner;
			}
			td.update("");
			var div = new Element("div");
			div.update(inner);
			td.appendChild(div);
			td.div = div;
		}
		var editor = new Ajax.InPlaceEditor(td.div,function(form,value){
			if(this.options.onapply){
				this.options.onapply(form,value);
			}
		}.bind(this),{
				okButton : false,
				cancelLink : false,
				onLeaveEditMode : function(e){
					e.unregisterListeners();
					e.leaveHover();
					td.removeClassName('inchangemode');
					td.removeClassName('changed');
					td.update(td.div.innerHTML);
					td.div = null;
					if(td.oldvalue != td.innerHTML){
						td.addClassName('changed');
					}
					delete e;
				},
			});
		td.editor = editor;
		editor.enterEditMode();
		td.addClassName('inchangemode');
	},
});