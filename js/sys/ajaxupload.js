Object.extend(Ajax, {
	Upload : {
		createFrame : function(formElement, completeCallback) {
			var frameName = 'f' + Math.floor(Math.random() * 99999);
			var divElement = new Element('DIV');
			divElement.update( 
			'<iframe style="display:none" src="about:blank" id="'+frameName+'" name="'+frameName+'" onload="Ajax.Upload.documentLoaded(\''+frameName+'\')"></iframe>'
			);
			document.body.appendChild(divElement);
			var frameElement = $(frameName);
			if (completeCallback && typeof(completeCallback) == 'function') {

				frameElement.completeCallback = completeCallback;
			}
			formElement.setAttribute('target', frameName);
		},
	 
		documentLoaded : function(elementID) {
			var frameElement = $(elementID);
			if (frameElement.contentDocument) {
				var documentElement = frameElement.contentDocument;
			} else if (frameElement.contentWindow) {
				var documentElement = frameElement.contentWindow.document;
			} else {
				var documentElement = window.frames[elementID].document;
			}

			if (documentElement.location.href == "about:blank") {
				return;
			}
			if (typeof(frameElement.completeCallback) == 'function') {
				frameElement.completeCallback(documentElement.body.innerHTML);
			}
		},
	 
		submitForm : function(formElement, startCallback, completeCallback) {
			formElement.setAttribute("enctype","multipart/form-data");
			formElement.setAttribute("method","post");
			Ajax.Upload.createFrame(formElement, completeCallback);
			if (startCallback && typeof(startCallback) == 'function') {
				return startCallback();
			} else {

				return true;
			}
		}
	},
	submitForm : function(formElement, startCallback, completeCallback){
		Ajax.Upload.submitForm(formElement, startCallback, completeCallback);
	},
	
} );