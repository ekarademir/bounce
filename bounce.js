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

	// console.log(intervalTime);

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

	var screen = newGame();

	/**
	 * Event handling
	 */

	window.focus();
	window.addEventListener("mousemove", function(e) {
		// console.log(e);
		screen.bouncers[0].setX(e.screenX, originX, width, pix);
	}, false);

	window.addEventListener("touchmove", function(e) {
		// console.log(e);
		screen.bouncers[0].setX(e.touches[0].pageX, originX, width, pix);
	}, false);

	window.addEventListener("mousedown", function(e) {
		// console.log(e);
		for (let i = 0; i < screen.balls.length; i++) {
			// console.log("Ball" + i);
			screen.balls[i].vel.x = 1;
			screen.balls[i].vel.y = -1;
			screen.balls[i].follow = null;
			screen.balls[i].stuck = false;
		}
		// console.log(screen.balls[0]);

	}, false);

	/**
	 * MAIN ANIMATION LOOP
	 */
	window.setInterval(function() {
		let drawStart = timer.now();
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);

		for (let i = 0; i < screen.bouncers.length; i++) {
			screen.bouncers[i].draw(ctx, originX, originY, pix);
		}

		for (let i = 0; i < screen.balls.length; i++) {
			screen.balls[i].move(screen);
			screen.balls[i].draw(ctx, originX, originY, pix);
		}


		dmsg.push(screen.bouncers[0].x);

		if(debug) {
			let drawTime = Math.floor(1000*(timer.now() - drawStart))/1000;
			dmsg.push("Render time [ms]: " + drawTime);
			dmsg.push("Frame rate [fps]: " + frameRate);
			debugMessage();
		}
	}, intervalTime);

	function newGame() {
		let screenTree = {
		bouncers: [],
		balls: []
		}

		let bouncer = new bbox(0, 360, 50, 10);
		screenTree.bouncers.push(bouncer);
		
		let bouncee = new bbox(100, 250, 10, 10);
		bouncee.vel = new vect(0,0);
		bouncee.follow = bouncer;
		bouncee.stuck = true;
		screenTree.balls.push(bouncee);

		screenTree.bouncers.push(new bbox(-5, -5, 5, 410));
		screenTree.bouncers.push(new bbox(200, -5, 5, 410));
		screenTree.bouncers.push(new bbox(-5, -5, 210, 5));
		// screenTree.bouncers.push(new bbox(0, 400, 200, 5));

		return screenTree;

	}

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
		this.follow = null;
		this.stuck = false;
		this.r = null;
		this.vel = null;
	}
	
	isin1(bb,x,y) {
		let x11 = x;
		let y11 = y;
		let x12 = x+this.w;
		let y12 = y+this.h;
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
	
	collides(bb) {
		let x11 = this.x;// + this.vel.x;
		let y11 = this.y;// + this.vel.y;
		let x12 = this.x+this.w;// + this.vel.x;
		let y12 = this.y+this.h;// + this.vel.y;
		let x21 = bb.x;
		let y21 = bb.y;
		let x22 = bb.x+bb.w;
		let y22 = bb.y+bb.h;


		//Detect collision and return impact direction.
		// Check Right
		// They should touch either from right or left
		// AND they should be at the same y so that they can touch.
		if(Math.max(x11, x12) > Math.min(x21, x22)
		 && Math.min(x11, x12) < Math.min(x21, x22))
		{
			if (Math.max(y11, y12) <  Math.min(y21, y22)) return false;
			if (Math.min(y11, y12) >  Math.max(y21, y22)) return false;

			// console.log("right collision");
			this.vel.x *= -1;
			return true;
		}

		// Check left
		if(Math.min(x11, x12) < Math.max(x21, x22)
		 && Math.max(x11, x12) > Math.max(x21, x22))
		{
			if (Math.max(y11, y12) <  Math.min(y21, y22)) return false;
			if (Math.min(y11, y12) >  Math.max(y21, y22)) return false;

			// console.log("left collision");
			this.vel.x *= -1;
			return true;
		}

		// Check bottom
		if(Math.max(y11, y12) > Math.min(y21, y22)
		 && Math.min(y11, y12) < Math.min(y21, y22))
		{
			if(Math.max(x11, x12) < Math.min(x21, x22)) return false;
			if(Math.min(x11, x12) > Math.max(x21, x22)) return false;

			// console.log("bottom collision");
			this.vel.y *= -1;
			return true;
		}

		// Check top
		if(Math.min(y11, y12) < Math.max(y21, y22)
		 && Math.max(y11, y12) > Math.max(y21, y22))
		{
			if(Math.max(x11, x12) < Math.min(x21, x22)) return false;
			if(Math.min(x11, x12) > Math.max(x21, x22)) return false;

			// console.log("top collision");
			this.vel.y *= -1;
			return true;
		}


		return false;
		
	}

	translate(v) {
		this.x += v.x;
		this.y += v.y;
	}

	move(screenTree) {
		if(this.stuck) {
			// r is the relative coordinate
			if(this.r == null) {
				this.r = new vect(20,-10);
			}

			this.x = this.r.x + this.follow.x;
			this.y = this.r.y + this.follow.y;
		} else {
			for(let i = 0; i < screenTree.bouncers.length; i++) {
				let b = screenTree.bouncers[i];
				if(this.collides(b)){
					// console.log("collision " + i);
				}
			}
			// console.log(this.x);
			// console.log(this.vel.x);
			this.x += this.vel.x;
			this.y += this.vel.y;
		}
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