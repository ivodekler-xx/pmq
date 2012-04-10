$.fn.pmq = function(){
	var lib = [];
	this.children('a').each(function(i, a){lib.push($(a).attr('href')); });
	variablePatchwork(function(a){multiSlide(a,{items: lib});});
}

//  supply an array of sources or place anchors in target. Give delay, order and set crop
$.fn.slideShow = function(/*{items, delay, order, crop}*/){
	var defaults = {
			delay: 2000,
			crop: true
		},
		slideOptions = $.extend({},defaults, arguments[0])
	
	this.each(function(index, item){		
		var	$this = $(item),
				// works with a two image method
				myImg = $('<img/>'),
				mySecondImg = $('<img>'),
				both = $(myImg).add(mySecondImg),
				delayPassed = false,
				loaded = false,
				timeout,
				origZ = $this.css('z-index'),
				baseZ = origZ == 'auto' ? 10 : origZ,
				images = [myImg, mySecondImg],
				offset = 0;
		
		both.appendTo($this).css('opacity', 0).on('load', function(){
			images[1].css('z-index', baseZ + 1);
			images[0].css('z-index', baseZ + 2).specialFit({crop: slideOptions.crop}).animate({opacity: 1}, slideOptions.delay, function(){
				images[1].animate({opacity: 0}, slideOptions.delay, function(){
					if(delayPassed)
						$this.slideItem();
					else loaded = true;
				});
			});
		}).on('error', function(){
			//switch two images around
			images.splice(0, 0, images.splice(1,1)[0] );
			$this.slideItem();
		});
		
		$this.slideItem = function(){
			if(! $this.closest('html').length) return; //stop slideshow if parent is detached
			//switch two images around
			images.splice(0, 0, images.splice(1,1)[0] );
			//make shortcuts
			var currentImg = images[0],
					otherImg = images[1];
					
			if(!slideOptions.order) currentImg.attr('src', slideOptions.items[Math.floor(random() * slideOptions.items.length)] );
			//else currentImg.attr('src', );
			
			loaded = false,
			delayPassed = false;
			
			timeout = setTimeout(function(){
				if(loaded){
					$this.slideItem(slideOptions.items, slideOptions.delay, slideOptions.order);
				}
				else delayPassed = true;
			}, slideOptions.delay);
		};
		
		$this.slideItem(slideOptions.items, slideOptions.delay, slideOptions.order);
	});
	
	return this;
};

// 	Divides a div in two subdivs.
// 	options: {
//		[direction: 'h'/'v',]
//		[sizeRatio: > 0 > 1,]
//		[tag: 'div'/'p',]
//		[properties: {css: { padding: 5} },]
//	}
$.fn.divide = function(opts){
	var options = $.extend({
		direction: Math.random() - .5 > 0 ? 'h' : 'v',
		sizeRatio: Math.random() * .5 + .25,
		tag: '<div>',
		properties: {}
	}, opts);
	this.css('position', 'relative');
	
	var child1 = $(
		options.tag,
		options.properties
	).css({
		float: 'left',
		position: 'relative',
		width: (options.direction == 'h' ? options.sizeRatio : 1) * 100 + '%',
		height: (options.direction == 'v' ? options.sizeRatio : 1) * 100 + '%'
	});
	var child2 = $(
		options.tag,
		options.properties
	).css({
		float: 'left',
		position: 'relative',
		width:(options.direction == 'h' ? 1 - options.sizeRatio : 1) * 100 + '%',
		height:(options.direction == 'v' ? 1 - options.sizeRatio : 1) * 100 + '%'
	});
	child1.appendTo(this);
	child2.appendTo(this);
	
	if(options.callback) {
		options.callback(child1, 0);
		options.callback(child2, 1);
	}
	return this;
};


//	creates random divisions to a certain limit and apply callback. Delay to slow it down if necessary
$.fn.mosaic = function(callback, limit, delay){
	var $me = $(this),
			height = $me.height(),
			width = $me.width(),
			aspect = width / height,
			preferredSlice = aspect < 1 ? 'v' : 'h'
			diagonal = Math.sqrt(Math.pow($me.width(),2) + Math.pow($me.height(),2));
	if(diagonal < (limit ? limit : 1000) ){
		callback($me);
		return this;
	}
	mosaicStack.splice(0,0, function(){
		$me.divide({direction: preferredSlice, callback: function(child){
				var $child = $(child);
				//if(Math.random() - .5 > 0)	{
					setTimeout(function(){
						$child.mosaic(callback, limit, delay);
					}, delay ? delay : 0);
				//}
				//else callback(child);
		}});
	});
};

// applies a mosaic with a slideshow.
function multiSlide(element, slideshowArgs){
	(element || $('#viewer')).mosaic(
		function(that){
			var args = $.extend({}, slideshowArgs),
					width = that.width(),
					height = that.height(),
					diagonal = Math.sqrt(Math.pow(width,2) + Math.pow(height,2));
			if(!args.delay) args.delay = Math.round(Math.pow(diagonal, 1.3));
			$(that).slideShow(args);
		},		//callback
		500,	//size limit
		0	//delay
	);
	if(callStackRunning) return;
	callStackRunning = true;
	callStack();
}


//	when making this I was not aware of css method background-size contain and cover, available in everything > IE8
$.fn.specialFit = function(opts){
	//	get rid of any lingering dimensions on this object
	this.css({
		position: 'absolute',
		width: 'auto',
		height: 'auto',
		top: 0,
		left: 0
	});
	
	var options = $.extend({}, {
		useX: true,
		useY: true,
		parent: document.body,
		crop: false
	}, opts )	,
			parent =
				this.parent().length ?
					this.parent() :
						options.parent instanceof $ ?
							options.parent :
								$(options.parent),
			width = this[0].width,
			height = this[0].height,
			aspect = width / height,
			spaceH = parent.innerWidth(),
			spaceV = parent.innerHeight(),
			spaceAspect = spaceH / spaceV,
			relativeAspect = spaceAspect / aspect;
			// if landscape, aspect will be bigger than 1
	
	if(!options.restrictions){
		//scale to fit container as good as possible
		if(options.crop ? relativeAspect > 1 : relativeAspect < 1) {
			var newImageHeight = ( spaceH / width ) * height;
			this.css({
				width: spaceH,
				top: (spaceV - newImageHeight) / 2 + 'px'
			});
		}
		else {
			var newImageWidth = ( spaceV / height ) * width;
			this.css({
				height: spaceV,
				left: (spaceH - newImageWidth) / 2 + 'px'
			});
		}
	}
	//else restrictions: todo
	return this;
}


		
var mosaicStack = [],
		callStackRunning = false;

//	makes sure instructions are processed sequentially. todo: time-limited batching
function callStack(){
	var stackLength = mosaicStack.length;
	if(stackLength < 100){
		(stackLength) && mosaicStack.splice(0,1)[0]();
		setTimeout(arguments.callee, 0);
	}
	else console.log('bail out or empty', mosaicStack);
}

//	creates a randomly updating mosaic. applies callback on children.
//	CURRENTLY WORKS ON ALL DIVS IN DOM!
function variablePatchwork(callback){
	setTimeout(
		function(index){
			var again = arguments.callee,
					$div = $('div').eq(index), // <-- culprit
					width = $div.width(),
					height = $div.height(),
					diagonal = Math.sqrt(Math.pow(width,2) + Math.pow(height,2)),
					speed = Math.round(Math.pow(diagonal, 1.3)/2)
			if(
				(
					($div.attr('data-lastSwitch') ? +$div.attr('data-lastSwitch') + 5000 < new Date().getTime() : true ) &&
					$div.children('div').length
				)||
				$('div').length == 1
			)
				$div.animate({opacity: 0}, speed, function(){
				$div.html('').attr('data-lastSwitch', new Date().getTime());
				callback($div);
				$div.animate({opacity: 1}, speed, function(){
					setTimeout(function(){
						again(Math.round(Math.random()*($('div').length - 1)));
					}, speed);
				});	
			});
			else again(Math.round(Math.random()*($('div').length - 1)))
		},
		5000,
		0
	);
}
// eof