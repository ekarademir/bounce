/**
 * Main function
 */

function bounce(debug=false) {

	// Settings
	var frameRate = 120;


	// Setting up the scene
	var b = document.getElementsByClassName("bounce")[0];

	// Create canvas
	var canvas = document.createElement("canvas");
	var ctx = canvas.getContext("2d");

	b.appendChild(canvas);

	// Internal variables
	var intervalTime = 1000 / frameRate;

	console.log(intervalTime);

	var canvasWidth = parent.innerWidth;
	var canvasHeight = parent.innerHeight;

	var gr = 2;
	var dmsg = ["Debug Info"];

	canvas.setAttribute("width", canvasWidth);
	canvas.setAttribute("height", canvasHeight);

	if(canvasHeight/gr > canvasWidth) {
		var pix = canvasWidth/200;
		
	} else {
		var pix = canvasHeight/400;
	}

	var width = 200*pix;
	var height = 400*pix;

	var originX = (canvasWidth - width) / 2;
	var originY = 0;

	var timer = window.performance;


	/**
	 * SETUP
	 */


	var bouncer = new bbox(0, 360, 50, 10);


	/**
	 * Event handling
	 */

	window.focus();
	window.addEventListener("mousemove", function(e) {
		// console.log(e);
		bouncer.setX(e.screenX, originX, width, pix);
	}, false);

	window.addEventListener("touchmove", function(e) {
		// console.log(e);
		bouncer.setX(e.touches[0].pageX, originX, width, pix);
	}, false);

	/**
	 * MAIN ANIMATION LOOP
	 */
	window.setInterval(function() {
		let drawStart = timer.now();
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);


		bouncer.draw(ctx, originX, originY, pix);

		dmsg.push(bouncer.x);

		if(debug) {
			let drawTime = Math.floor(1000*(timer.now() - drawStart))/1000;
			dmsg.push("Render time [ms]: " + drawTime);
			dmsg.push("Frame rate [fps]: " + frameRate);
			debugMessage();
		}
	}, intervalTime);



	function debugMessage() {
		ctx.strokeStyle = "black";
		ctx.lineWidth = 1;
		ctx.strokeRect(originX-1, originY-1, width+1, height+1);

		ctx.font ="10px monospace";
		ctx.fillStyle = "black";

		for(let i  = 0; i < dmsg.length; i++) {
			ctx.fillText(dmsg[i], originX + width + 5, originY + 13*(i+1));
		}

		dmsg = ["Debug Info"];

	}
}

class vect {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	add(v) {
		this.x += v.x;
		this.y += v.y;
	}

	subtract(v) {
		this.x -= v.x;
		this.y -= v.y;
	}

	scale(s) {
		this.x *= s;
		this.y *= s;
	}

	static add(v1, v2) {
		return new vect(v1.x + v2.x, v1.y + v2.y);
	}

	static subtract(v1, v2) {
		return new vect(v1.x - v2.x, v1.y - v2.y);
	}

	static scale(v1, s) {
		return new vect(v1.x*s, v1.y*s);
	}

	static dot(v1, v2) {
		return v1.x*v2.x +  v1.y*v2.y;
	}
}

class bbox {
	constructor(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	}
	
	isin(bb) {
		let x11 = this.x;
		let y11 = this.y;
		let x12 = this.x+this.w;
		let y12 = this.y+this.h;
		let x21 = bb.x;
		let y21 = bb.y;
		let x22 = bb.x+bb.w;
		let y22 = bb.y+bb.h;
		if(Math.max(x11, x12) < Math.min(x21, x22)) return false;
		if(Math.min(x11, x12) > Math.max(x21, x22)) return false;
		if(Math.max(y11, y12) < Math.min(y21, y22)) return false;
		if(Math.min(y11, y12) > Math.max(y21, y22)) return false;

		return true;
	}

	translate(v) {
		this.x += v.x;
		this.y += v.y;
	}

	setX(x, oX, w, pix) {
		x = x/pix;
		oX = oX/pix;
		w = w/pix;

		if(x > oX + w - this.w/2) {
			this.x = w - this.w;
		} else if(x < oX+this.w/2) {
			this.x = 0;
		} else {
			this.x = x - oX - this.w/2;
		}
	}

	draw(ctx, oX, oY, pix) {
		ctx.fillStyle = "rgba(0,255,0,0.5)";
		ctx.fillRect(oX+this.x*pix, oY + this.y*pix, this.w*pix, this.h*pix);
	}
}

// class bouncer extends bbox {
// 	draw(ctx) {
// 		ctx.fillStyle = "green";
// 		ctx.fillRect(this.x, this.y, this.width, this.height);
// 	}
// }