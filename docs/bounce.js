/**
 * Main function
 */

function bounce(debug=false) {

	// Settings
	var frameRate = 120;
	var lives = 3;



	// Setting up the scene
	var b = document.getElementsByClassName("bounce")[0];

	// Create canvas
	var canvas = document.createElement("canvas");
	var ctx = canvas.getContext("2d");

	b.appendChild(canvas);

	// Internal variables
	var intervalTime = 1000 / frameRate;

	// console.log(intervalTime);

	var screenW = parent.innerWidth;
	var screenH = parent.innerHeight;
	var gr = 2;

	if(canvasHeight/gr > canvasWidth) {
		var pix = Math.floor(screenW/200);
		
	} else {
		var pix = Math.floor(screenH/400);
	}

	if(pix<1) {
		pix = 1;
	}

	var canvasWidth = 210*pix;//
	var canvasHeight = 420*pix;//parent.innerHeight;

	if(debug) {
		canvasHeight = 600*pix;
		canvasWidth = 300*pix;
	}

	var dmsg = ["Debug Info"];

	canvas.setAttribute("width", canvasWidth);
	canvas.setAttribute("height", canvasHeight);


	var width = 200*pix;
	var height = 400*pix;

	var originX = 5*pix;//(canvasWidth - width) / 2;
	var originY = 10*pix;

	if(debug) {
		originX = 50*pix;
		originY = 10*pix;
	}

	var timer = window.performance;


	/**
	 * SETUP
	 */

	var screen = newGame();
	var mouseX = 0;
	var mouseY = 0;
	var score = 0;


	/**
	 * Event handling
	 */

	console.log();
	var canvasCoords = canvas.getClientRects();
	var canvasX = canvasCoords[0].left;
	var canvasY = canvasCoords[0].top;

	window.focus();
	canvas.addEventListener("mousemove", function(e) {
		// console.log(e);
		mouseX = e.pageX - canvasX;
		mouseY = e.pageY - canvasY;
		screen.bouncers[0].setX(mouseX, originX, width, pix);
		// console.log(e);
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
		// clear screen
		let drawStart = timer.now();
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);

		// draw game box
		ctx.strokeStyle = "black";
		ctx.lineWidth = 1;
		ctx.strokeRect(originX-1, originY-1, width+1, height+1);

		for (let i = 0; i < screen.bouncers.length; i++) {
			screen.bouncers[i].draw(ctx, originX, originY, pix);
		}
		let dscore = 0;
		for (let i = 0; i < screen.balls.length; i++) {
			dscore += screen.balls[i].move(screen);
			screen.balls[i].draw(ctx, originX, originY, pix);

			if(screen.balls[i].y > originY + height) {
				screen.balls.splice(i, 1);
				lives--;
			}

			if(screen.balls.length == 0) {
				if (lives > 0) {
					newBall(screen);
				} else {
					screen = newGame();
				}
			}
		}

		if(screen.bouncers.length < 5) {
			newBlocks(screen);
		}

		if (dscore > 0) {
			score += dscore;
		}

		if (dscore >0 && score>0 && score%5==0) {
			lives++;
		}



		// Update HUD

		// Update Score
		ctx.font ="10px monospace";
		ctx.fillStyle = "black";
		ctx.fillText(score, originX + 4, originY + 13);

		// Update Lives
		ctx.fillStyle = "hsla("+247+",100%,50%,1)";
		ctx.beginPath();
		let r = 10*pix/2;
		ctx.ellipse(originX+170*pix + r, originY + 4*pix + r, r, r, 0, 0, 2*Math.PI);
		ctx.fill();
		ctx.fillStyle = "black";
		ctx.fillText("x" + lives, originX+170*pix + r +5, originY + 13);


		dmsg.push(screen.bouncers[0].x);

		if(debug) {
			let drawTime = Math.floor(1000*(timer.now() - drawStart))/1000;
			dmsg.push("Render time [ms]: " + drawTime);
			dmsg.push("Frame rate [fps]: " + frameRate);
			dmsg.push("Mouse x: " + mouseX + " y: " + mouseY);
			debugMessage();
		}
	}, intervalTime);

	/**
	 * Creates a new game. Called automatically at start. Also called when
	 * a game ends and user selects to play again.
	 */
	function newGame() {
		let screenTree = {
			bouncers: [],
			balls: []
		}

		score = 0;
		lives = 3;

		// Paddling box
		let bouncer = new bbox(0, 360, 50, 4, "paddle");
		screenTree.bouncers.push(bouncer);

		newBlocks(screenTree);
		
		newBall(screenTree);

		screenTree.bouncers.push(new bbox(-2, -2, 2, 404, "wall"));
		screenTree.bouncers.push(new bbox(200, -2, 2, 404, "wall"));
		screenTree.bouncers.push(new bbox(-2, -2, 204, 2, "wall"));
		// screenTree.bouncers.push(new bbox(0, 400, 200, 5));

		return screenTree;

	}

	function newBall(screenTree) {
		// The ball
		let bouncee = new bbox(100, 250, 10, 10, "ball");
		bouncee.color = 247;
		bouncee.vel = new vect(0,0);
		bouncee.follow = screenTree.bouncers[0];
		bouncee.stuck = true;
		screenTree.balls.push(bouncee);
	}

	function newBlocks(screenTree) {
		// Blocks
		let bw = 20;
		let bh = 15;
		for (let i = 0; i < 10; i++) {
			for (let j = 0; j < 5; j++) {
				let b = new bbox(i*bw, 3*bh + j*bh, bw, bh)
				b.color = 50*j;
				screenTree.bouncers.push(b);
			}
		}

	}

	function debugMessage() {

		ctx.font ="8px monospace";
		ctx.fillStyle = "black";

		for(let i  = 0; i < dmsg.length; i++) {
			ctx.fillText(dmsg[i], originX, originY + height + 13*(i+1));
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
	constructor(x, y, w, h, t="block") {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.follow = null;
		this.stuck = false;
		this.r = null;
		this.vel = null;
		this.type = t;
		this.color = 156;
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
		// Check Left
		// They should touch either from right or left
		// AND they should be at the same y so that they can touch.
		if(Math.max(x11, x12) > Math.min(x21, x22)
		 && Math.min(x11, x12) < Math.min(x21, x22))
		{
			if (Math.max(y11, y12) <  Math.min(y21, y22)) return false;
			if (Math.min(y11, y12) >  Math.max(y21, y22)) return false;

			// console.log("left collision");

			// this.x = bb.x-this.w;
			this.vel.x *= -1;
			return true;
		}

		// Check right
		if(Math.min(x11, x12) < Math.max(x21, x22)
		 && Math.max(x11, x12) > Math.max(x21, x22))
		{
			if (Math.max(y11, y12) <  Math.min(y21, y22)) return false;
			if (Math.min(y11, y12) >  Math.max(y21, y22)) return false;

			// console.log("right collision");
			// this.x = bb.x+bb.w;
			this.vel.x *= -1;
			return true;
		}

		// Check bottom
		if(Math.max(y11, y12) > Math.min(y21, y22)
		 && Math.min(y11, y12) < Math.min(y21, y22))
		{
			if(Math.max(x11, x12) < Math.min(x21, x22)) return false;
			if(Math.min(x11, x12) > Math.max(x21, x22)) return false;

			// console.log("top collision");
			this.vel.y *= -1;
			return true;
		}

		// Check top
		if(Math.min(y11, y12) < Math.max(y21, y22)
		 && Math.max(y11, y12) > Math.max(y21, y22))
		{
			if(Math.max(x11, x12) < Math.min(x21, x22)) return false;
			if(Math.min(x11, x12) > Math.max(x21, x22)) return false;

			// console.log("bottom collision");
			this.vel.y *= -1;
			return true;
		}


		return false;
		
	}


	move(screenTree) {
		let score = 0;
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
					if(b.type == "block") {
						screenTree.bouncers.splice(i, 1);
						score++;
					}
					
				}

			}
			// console.log(this.x);
			// console.log(this.vel.x);
			this.x += this.vel.x;
			this.y += this.vel.y;
		}

		return score;
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
		ctx.fillStyle = "hsla("+this.color+",100%,50%,1)";

		if(this.type == "ball") {
			ctx.beginPath();
			let r = this.w*pix/2;
			ctx.ellipse(oX+this.x*pix + r, oY + this.y*pix + r, r, r, 0, 0, 2*Math.PI);
			ctx.fill();
		}else{
			ctx.fillRect(oX+this.x*pix+1, oY + this.y*pix+1, this.w*pix-1, this.h*pix-1);
		}
	}
}
