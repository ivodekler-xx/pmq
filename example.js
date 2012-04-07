function randomcolouredDivs(element){
	(element || $('#viewer')).mosaic(function(that){
		$(that).css(
			'background-color',
			'rgb(' + Math.round(Math.random()*255) + ','
			+ Math.round(Math.random()*255) + ',' +
			Math.round(Math.random()*255) + ')'
		);
	}, 100, 10);
	if(callStackRunning) return;
	callStackRunning = true;
	callStack();
}


var images = [
			'http://dl.dropbox.com/u/3654254/DSC01862.JPG',
			'http://dl.dropbox.com/u/3654254/multilogo2d.png',
			'http://dl.dropbox.com/u/3654254/butwhy.png',
			'http://dl.dropbox.com/u/3654254/DSC_0047.JPG',
			'http://dl.dropbox.com/u/3654254/lginfo-shadowbuilding-1400.jpg',
			'http://dl.dropbox.com/u/3654254/cubesmooth.png',
			'http://dl.dropbox.com/u/3654254/greebox.png',
			'http://dl.dropbox.com/u/3654254/race.png',
			'http://dl.dropbox.com/u/3654254/blueheart.jpg',
			'http://dl.dropbox.com/u/3654254/Disobedience.jpg',
			'http://dl.dropbox.com/u/3654254/jelly0009.png',
			'http://dl.dropbox.com/u/3654254/inverted.jpg',
		]
;