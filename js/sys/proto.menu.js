/** 
 * @description		prototype.js based context menu
 * @author        Juriy Zaytsev; kangax [at] gmail [dot] com; http://thinkweb2.com/projects/prototype/
 * @version       0.6
 * @date          12/03/07
 * @requires      prototype.js 1.6
*/

/*
	2009-12-04, COMDIV,  
		1. CHANGE  : 
			a) after creation <ul> element became property as Proto.Menu#list
			b) Proto.Menu#list.addItem(e,item) - encapsulation of old inline menuItem applying code and it counts menu items added this way and stores this value
				in Proto.Menu#list.itemCount
			c) Proto.Menu#list.clearItems() - clears content and sets itemCount to zero
			
		2. UPGRADE : Dynamic menu population
			a) menu options now may contains onPopulate that is function with func(e , menu ) where e - event that cause menu to show, menu - reference to Proto.Menu object
			b) Proto.Menu#isDynamic - bool function() - determines if options.onPopulate supplied
			c) Proto.Menu#populate(e) - populates menu with items - in usual mode it calls from Proto.Menu#initialize with null event, if isDynamic it is called from
			   Proto.Menu#show with event that caused menu popuping
			   
		NOTES:
			if both dynamic (by onPopulate) and static (by options.menuItems) provided, it renders in following order:
			     1. dynamics
				 2. separator if dynamics was created and options.menuItems  is not null and menuItems length != 0
				 3. statics
*/

if (Object.isUndefined(Proto)) { var Proto = { } }

Proto.Menu = Class.create({
	initialize: function() {
		var e = Prototype.emptyFunction;
		this.ie = Prototype.Browser.IE;
		this.options = Object.extend({
			selector: '.contextmenu',
			className: 'protoMenu',
			pageOffset: 25,
			fade: false,
			zIndex: 100,
			beforeShow: e,
			beforeHide: e,
			beforeSelect: e,
			onPopulate : null
		}, arguments[0] || { });
		
		this.shim = new Element('iframe', {
			style: 'position:absolute;filter:progid:DXImageTransform.Microsoft.Alpha(opacity=0);display:none',
			src: 'javascript:false;',
			frameborder: 0
		});
		
		this.options.fade = this.options.fade && !Object.isUndefined(Effect);
		this.container = new Element('div', {className: this.options.className, style: 'display:none'});
		
		var list = new Element('ul');
		//initialy set menu item count to zero
		list.itemCount=0;
		
		// list is important for future using, so make it property of menu
		this.list = list;
		
		// supress overhead of "this" word in JS
		var menu = this;
		// set utility method to clear menu
		this.list.clearItems = (function(){
			this.itemCount = 0;
			this.update("");
		}).bind(this.list);
		// set utility method to add items to menu
		this.list.addItem = (function(item){
			this.insert(
					new Element('li', {className: item.separator ? 'separator' : ''}).insert(
						item.separator 
							? '' 
							: Object.extend(new Element('a', {
								href: '#',
								title: item.name,
								className: (item.className || '') + (item.disabled ? ' disabled' : ' enabled')
							}), { _callback: item.callback })
							.observe('click', menu.onClick.bind(menu))
							.observe('contextmenu', Event.stop)
							.update(item.name)
					)
				)
			this.itemCount++;
		}).bind(this.list);
		
		//we can populate menu in initialize phase only if it is static (no dynamic content)
		if(!this.isDynamic()){
			this.populate();
		}
		
		$(document.body).insert(this.container.insert(list).observe('contextmenu', Event.stop));
		if (this.ie) { $(document.body).insert(this.shim) }
		
		document.observe('click', function(e) {
			if (this.container.visible() && !e.isRightClick()) {
				this.options.beforeHide(e);
				if (this.ie) this.shim.hide();
				this.container.hide();
			}
		}.bind(this));
		
		$$(this.options.selector).invoke('observe', Prototype.Browser.Opera ? 'click' : 'contextmenu', function(e){
			if (Prototype.Browser.Opera && !e.ctrlKey) {
				return;
			}
			this.show(e);
		}.bind(this));
	},
	
	//populates menu with items
	populate : function(e){
		
		// clears current items
		this.list.clearItems();
		
		// if onPopulate func exists in options call it
		if(this.options.onPopulate){
			this.options.onPopulate(e,this);
			
			//if we have really created dynamic and menuItems is configured too we place separator between them 
			if(this.list.itemCount > 0 && this.options.menuItems && this.options.menuItems.length != 0){
				this.list.addItem({separator:true});
			}
		}
		
		// static configuration from options.menuItems
		if(this.options.menuItems){
			this.options.menuItems.each(function(item) {
				this.list.addItem(item);
			}.bind(this));
		}
		
	},
	// returns true if menu s dynamic and must be populated before every showing
	isDynamic : function(){
		if(this.options.onPopulate){
			return true;
		}
		return false;
	},
	
	show: function(e) {
		e.stop();
		this.options.beforeShow(e);
		var x = Event.pointer(e).x,
			y = Event.pointer(e).y,
			vpDim = document.viewport.getDimensions(),
			vpOff = document.viewport.getScrollOffsets(),
			elDim = this.container.getDimensions(),
			elOff = {
				left: ((x + elDim.width + this.options.pageOffset) > vpDim.width 
					? (vpDim.width - elDim.width - this.options.pageOffset) : x) + 'px',
				top: ((y - vpOff.top + elDim.height) > vpDim.height && (y - vpOff.top) > elDim.height 
					? (y - elDim.height) : y) + 'px'
			};
		this.container.setStyle(elOff).setStyle({zIndex: this.options.zIndex});
		
		// if it is dynamic menu we must repopulate it before show
		if(this.isDynamic()){
			this.populate(e);
		}
		
		if (this.ie) { 
			this.shim.setStyle(Object.extend(Object.extend(elDim, elOff), {zIndex: this.options.zIndex - 1})).show();
		}
		
		this.options.fade ? Effect.Appear(this.container, {duration: 0.25}) : this.container.show();
		this.event = e;
	},
	onClick: function(e) {
		e.stop();
		if (e.target._callback && !e.target.hasClassName('disabled')) {
			this.options.beforeSelect(e);
			if (this.ie) this.shim.hide();
			this.container.hide();
			e.target._callback(this.event);
		}
	}
})