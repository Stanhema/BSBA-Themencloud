$.widget("nsp.spriteControl", {
	options: {
		allsteps: 10,
		step: 110,
		loop: false,
		reverse: true,
		horizontalImg:true

	},
	_setOption: function (key, value) {
		this.options[key] = value;
		this._update();
	},

	_create: function () {
		this._update();
	},

	_update: function () {
		var plgn = this;
		var element = plgn.element;
		
		var timer = 0;
		var x = y = attr = 0;

		var allsteps = plgn.options.allsteps
		var step = plgn.options.step;
		var loop = plgn.options.loop;
		var reverse = plgn.options.reverse;
		var ceil = allsteps * (step) - 2 * step;

		var horizontalImg = plgn.options.horizontalImg;

		element.on('mouseover', function () {
			clearInterval(timer);
			
			timer = setInterval(function () {

				plgn._setBgPos(x, y);

				if (attr < -ceil) {
					if (loop) {
						attr = 0;
					} else {
						clearInterval(timer);
					}
				} else {
					attr -= step;
				}

				if (horizontalImg) {
					x = attr;
				} else {
					y = attr;
				}

				
			}, 30);
	  	});

		element.on('mouseout', function () {
			clearInterval(timer);
			
			if (reverse) {
				timer = setInterval(function () {

					plgn._setBgPos(x, y);

					if (attr > -step) {
						clearInterval(timer);
					} else {
						attr += step;
					}

					if (horizontalImg) {
						x = attr;
					} else {
						y = attr;
					}

				}, 30);
			}			
	  	});
	},

	_setBgPos: function (x, y) {
		var plgn = this;
		var element = plgn.element;
		
		var horizontalImg = plgn.options.horizontalImg;

		if (horizontalImg) {
			element.css('background-position', x + 'px' + ' 0');
		} else {
			element.css('background-position', '0 ' + y + 'px');
		}
	}

});