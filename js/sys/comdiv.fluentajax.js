// Copyright 2010-2011 Comdiv (F. Sadykov) - http://code.google.com/u/fagim.sadykov/
// Supported by Media Technology LTD 
//  
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//  
//      http://www.apache.org/licenses/LICENSE-2.0
//  
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// 
// MODIFICATIONS HAVE BEEN MADE TO THIS FILE

// Fluent Ajax v0.1 - fluent object to access Protype Ajax
(function(){
	if(undefined==Ajax)return; //check if prototype Ajax object exists
	Object.extend(Ajax,{
		loadCSS : function(url){
			this.from(url).loadCSS(url);
		},
		from : function(url/*or controller name*/, action /*if given first treats as controller*/, extension /* rails by default MonoRail */){
			
			// such behaviour is about fact that both "native URL" and "controller/action" notation are usefull
			var url = url;
			var controller=url;
			var ext = extension || "rails"
			var siteroot = Ajax.siteroot || "";
			if(action){
				url = siteroot+"/"+controller+"/"+action+"."+ext;
			}else{
				if(url.match(/^~\//)){
					url = url.replace(/^~/, siteroot);
				}
			}
			
			
			// result object is both fluent chain and meets requests of parameters to Ajax.Request and Ajax.Updater
			var result = {
			
				url : url,
				parameters : {ajax:1}, //we used it to determine if it's called through ajax for server
				method : "POST",
				asynchronous : true,
				postBody : "",
				onSuccess : function(){},
				onFailure : function(){},
				onUpdate : function(){},
				evalScripts : true,
				target : null,
				
				
				// extends current parameters with given (multiple call allowed)
				params : function(obj){
					Object.extend(this.parameters, obj|| {});
					return this;
				},
				
				// setups single parameter to parameters
				param : function(name, value){
					this.parameters[name] = value;
					return this;
				},
				
				// make request GET
				byget : function(){
					this.method = "GET";
					return this;
				},
				
				method : function(m){
					this.method = m;
					return this;
				},
				
				// make request POST and gives postData
				post :function(content){
					this.method = "POST";
					if(content){
						this.postBody = content;
					}
					return this;
				},
				
				// make request asynchronous
				async : function(){
					this.asynchronous = true;
					return this;
				},
				
				// make request synchronous
				sync : function(){
					this.asynchronous = false;
					return this;
				},
				
				errors : [], // collector of errors occured when onSuccess or onFailure worked
				
				// adds 'listener' to onSuccess 'event' compose it in safe to call chain
				after : function(func){
					var self = this;
					var current = this.onSuccess;
					this.onSuccess = function(req){
						current(req);
						try {
							func(req);
						}catch(e){
							self.errors.push(e);
						}
					};
					return this;
				},
				
				// adds 'listener' to onFailure 'event' compose it in safe to call chain
				error : function(func){
					var current = this.onFailure;
					this.onFailure = function(req){
						current(req);
						try {
							func(req);
						}catch(e){
							self.errors.push(e);
						}
					};
					return this;
				},
				
				// setups target for Updater
				into : function(idorelement){
					this.target = idorelement;
					return this;
				},
				
				//setup if needed target element and makes call
				update : function(idorelement){
					if(idorelement){
						this.into(idorelement);
					}
					this.call();
				},
				
				//make request with current options
				call : function(){
					var callctx ={
						method : this.method,
						asynchronous : this.asynchronous,
						onSuccess : this.target ? null : this.onSuccess ,
						onFailure : this.onFailure,
						postBody : this.postBody,
						parameters : this.parameters,
						onUpdate : this.target ? this.onSuccess : null,
						evalScripts : true,
					}
					if(this.target){
						new Ajax.Updater(this.target,this.url,callctx);
					}else{
						new Ajax.Request(this.url, callctx);
					}
				},
				
				
				// synchronously get content by Ajax
				get : function(){ 
					
					this.sync();
					var result = "";
					this.after(function(r){
						result = r.responseText;
					});
					this.call();
					return result;
				},
				
				loadCSS : function(url){
					if(url){
						this.url = url;
					}
					if(!this.url.match(/\.css$/)){
						this.url = this.url + '.css';
					}
					//грузим просто CSS по имени
					this._loadCSS();
					//теперь готовим и грузем CSS, адаптированный под размер экрана
					var scw = screen.width;
					var sct = 'w_tiny';
					if(scw == 1024){
						sct = 'w_small';
					}
					if(scw > 1024 && scw <= 1280){
						sct = 'w_medium'
					}
					if(scw > 1280) {
						sct = 'w_large';
					}
					this.url = this.url.replace(/\.css/, '_'+sct+'.css');
					this._loadCSS();
					
					
				},
				
				_loadCSS : function(){
					this.byget();
					elementid = this.url.replace(/[\/:\.]/g, '_')+'_style';
					if(!($(elementid))){
						$(document.body).insert(
							{bottom: new Element("style",{type:"text/css", id:elementid})}
						);
						this.__csserroroccured = false;
						if(!this.__csserrorhandler){
							this.error(function(r){
								this.__csserroroccured = true;
							}.bind(this));
							this.after(function(){
								if(this.__csserroroccured){
									$(this.target).update('/* css file could not be loaded*/');
								}
							}.bind(this));
							this.__csserrorhandler = true;
						}
						this.update(elementid);
					}
				},
				
				
				// synchronously evals ajax content as javascript code
				eval : function(){
					this.byget(); //javascript files are often stricted to GET method
					var script = this.get();
					if(script){
						var result = null;
						if(script.isJSON()){
							result = script.evalJSON()
						}else{
							result = eval(script);
						}
						
						return result;
					}else{
						result = {};
						return result;
					}
				}
				
			}
			return result;
		}
	});
})();
