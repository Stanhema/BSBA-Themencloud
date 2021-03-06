var THREEx	= THREEx	|| {}

//////////////////////////////////////////////////////////////////////////////////
//		Constructor							//
//////////////////////////////////////////////////////////////////////////////////

/**
 * create a dynamic texture with a underlying canvas
 *
 * @param {Number} width  width of the canvas
 * @param {Number} height height of the canvas
 */
THREEx.DynamicTexture	= function(width, height, THREE){
	var canvas	= document.createElement( 'canvas' )
	canvas.width	= width
	canvas.height	= height
	this.canvas	= canvas

	var context	= canvas.getContext( '2d' )
	this.context	= context

	var texture	= new THREE.CanvasTexture(canvas)
	texture.minFilter = THREE.LinearMipmapLinearFilter;

	this.texture	= texture
}

//////////////////////////////////////////////////////////////////////////////////
//		methods								//
//////////////////////////////////////////////////////////////////////////////////

/**
 * clear the canvas
 *
 * @param  {String*} fillStyle 		the fillStyle to clear with, if not provided, fallback on .clearRect
 * @return {THREEx.DynamicTexture}      the object itself, for chained texture
 */
THREEx.DynamicTexture.prototype.clear = function(fillStyle){
	// depends on fillStyle
	if( fillStyle !== undefined ){
		this.context.fillStyle	= fillStyle
		this.context.fillRect(0,0,this.canvas.width, this.canvas.height)
	}else{
		this.context.clearRect(0,0,this.canvas.width, this.canvas.height)
	}
	// make the texture as .needsUpdate
	this.texture.needsUpdate	= true;
	// for chained API
	return this;
}

/**
 * draw text
 *
 * @param  {String}		text	- the text to display
 * @param  {Number|undefined}	x	- if provided, it is the x where to draw, if not, the text is centered
 * @param  {Number}		y	- the y where to draw the text
 * @param  {String*} 		fillStyle - the fillStyle to clear with, if not provided, fallback on .clearRect
 * @param  {String*} 		contextFont - the font to use
 * @return {THREEx.DynamicTexture}	- the object itself, for chained texture
 */
THREEx.DynamicTexture.prototype.drawText = function(text, x, y, fillStyle, contextFont){
	// set font if needed
	if( contextFont !== undefined )	this.context.font = contextFont;
	// if x isnt provided
	if( x === undefined || x === null ){
		var textSize	= this.context.measureText(text);
		x = (this.canvas.width - textSize.width) / 2;
	}
	// actually draw the text
	this.context.fillStyle = fillStyle;
	this.context.fillText(text, x, y);
	// make the texture as .needsUpdate
	this.texture.needsUpdate	= true;
	// for chained API
	return this;
};

THREEx.DynamicTexture.prototype.drawTextCooked = function(options){
	var context	= this.context
	var canvas	= this.canvas
	options		= options	|| {}
	var text	= options.text
	var params	= {
		margin		: options.margin !== undefined ? options.margin	: 0.2,
		lineHeight	: options.lineHeight !== undefined ? options.lineHeight : 0.1,
		align		: options.align !== undefined ? options.align : 'left',
		fillStyle	: options.fillStyle !== undefined ? options.fillStyle : 'black',
		font		: options.font !== undefined ? options.font : "bold "+(0.2*512)+"px Arial",
    emissive  : 'white',
    //emissive  :options.emissive !== undefined ? options.emissive : 'white',
    emissiveIntensity: 1,
	}
  
	// sanity check
	//console.assert(typeof(text) === 'string')

	// context.save()

  context.fillStyle = options.background;
  context.fillRect(0, 0, canvas.width, canvas.height);

	context.fillStyle	= params.fillStyle;
	context.font		= params.font;

  var y	= (params.lineHeight + options.marginTop)*canvas.height
  
	//var y	= (params.lineHeight + params.margin)*canvas.height
	while(text.length > 0 ){
		// compute the text for specifically this line
		var maxText	= computeMaxTextLength(text)
		// update the remaining text
		text	= text.substr(maxText.length)

		// compute x based on params.align
		var textSize	= context.measureText(maxText);
		if( params.align === 'left' ){
			var x	= params.margin*canvas.width
		}else if( params.align === 'right' ){
			var x	= (1-params.margin)*canvas.width - textSize.width
		}else if( params.align === 'center' ){
			var x = (canvas.width - textSize.width) / 2;
		}else	console.assert( false )

		// actually draw the text at the proper position
    
		this.context.fillText(maxText, x, y);

		// goto the next line
		y	+= params.lineHeight*canvas.height
	}
	context.restore()

	// make the texture as .needsUpdate
	
	this.texture.needsUpdate	= true;
	
	// for chained API
	return this;

	function computeMaxTextLength(text){
		let maxText	= ''
		let maxWidth	= (1-params.margin*2)*canvas.width
		while( maxText.length !== text.length ){
			let textSize	= context.measureText(maxText);
			if( textSize.width > maxWidth )	break;
			maxText	+= text.substr(maxText.length, 1)
		}

    // LINE BREAKS 

    let words = maxText.split(' ');
    // console.log("wordArrays: " + words.length);

    if(words.length > 1 && text[maxText.length] !== ' ' && text[maxText.length] !== undefined ){
      let lastWord = words[words.length-1]; 
      // console.log("last word: " + lastWord);
      let remainingLetters = maxText.length - lastWord.length;
      // console.log("remainingLetters " + remainingLetters);
      let maxTextReduced = maxText.substr(0, remainingLetters);
      // console.log("maxTextReduced " + maxTextReduced);

      return maxTextReduced;
    }

		return maxText;
	}

}

/**
 * execute the drawImage on the internal context
 * the arguments are the same the official context2d.drawImage
 */
THREEx.DynamicTexture.prototype.drawImage	= function(/* same params as context2d.drawImage */){
	// call the drawImage
	this.context.drawImage.apply(this.context, arguments)
	// make the texture as .needsUpdate
	this.texture.needsUpdate	= true;
	// for chained API
	return this;
}
