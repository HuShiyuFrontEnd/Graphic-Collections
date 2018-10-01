// https://en.wikipedia.org/wiki/Lissajous_curve

class Vector2 {
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}
	
	add(v) {
		this.x += v.x;
		this.y += v.y;
		return this;
	}
	
	addScalar(s) {
		this.x += s;
		this.y += s;
		return this;
	}
	
	multiplyScalar(s) {
		this.x *= s;
		this.y *= s;
		return this;
	}
	
	clone() {
		return new Vector2(this.x, this.y);
	}
}

class LissajousTable {
	static get AXIS_HORIZONTAL() { return 0; }
	static get AXIS_VERTICAL() { return 1; }
	static get GRID_SIZE() { return 64; }
	static get GRID_SIZE_HALF() { return LissajousTable.GRID_SIZE * .5; }
	static get PADDING() { return 32; }
	static get SPACING() { return 32; }
	static get TIME_MULTIPLIER() { return .25; }
	
	static get COLOR_SUBTLE() { return 'rgba(0, 0, 0, .25)'; }
	
	static getCoordinateOnGrid(coord) {
		const size = (
			LissajousTable.GRID_SIZE +
			LissajousTable.SPACING
		);
		
		return coord.clone()
			.multiplyScalar(size)
			.addScalar(LissajousTable.GRID_SIZE_HALF)
			.addScalar(LissajousTable.PADDING);
	}
	
	static getLissajousCoord(a, b, time) {
		const t = (time % 1) * Math.PI * 2;
		
		return new Vector2(
			Math.cos(a * t),
			Math.sin(b * t)
		);
	}
	
	constructor(dimensions = 2) {
		this.dimensions = dimensions;
	}
	
	getCanvasSize() {
		const size = (LissajousTable.PADDING * 2)
			+ (this.dimensions + 1) * LissajousTable.GRID_SIZE
			+ this.dimensions * LissajousTable.SPACING;
		
		return {
			height: size,
			width: size,
		};
	}
	
	renderAxis(context, orientation, time) {
		const isHorizontal = orientation === LissajousTable.AXIS_HORIZONTAL;
		const isVertical = orientation === LissajousTable.AXIS_VERTICAL;
		const radius = LissajousTable.GRID_SIZE_HALF;
		
		for (let n = 1; n <= this.dimensions; n++) {
			const angle = ((time * n) % 1) * Math.PI * 2;
			const coord = isHorizontal
				? LissajousTable.getCoordinateOnGrid(new Vector2(n, 0))
				: LissajousTable.getCoordinateOnGrid(new Vector2(0, n));
			
			const positionCoord = coord.clone()
				.add(new Vector2(Math.cos(angle) * radius, Math.sin(angle) * radius));
			
			context.beginPath();
			context.arc(coord.x, coord.y, radius, 0, Math.PI * 2);
			context.strokeStyle = '#000';
			context.stroke();
			
			context.fillStyle = '#000';
			context.fillText(n, coord.x, coord.y);
			
			context.beginPath();
			context.arc(positionCoord.x, positionCoord.y, radius * .25, 0, Math.PI * 2);
			context.fillStyle = LissajousTable.COLOR_SUBTLE;
			context.fill();
			
			context.beginPath();
			context.moveTo(positionCoord.x, positionCoord.y);
			
			if (isHorizontal) {
				context.lineTo(positionCoord.x, context.canvas.height);
			} else {
				context.lineTo(context.canvas.width, positionCoord.y);
			}
			
			context.strokeStyle = LissajousTable.COLOR_SUBTLE;
			context.stroke();
		}
	}
	
	renderResults(context, time) {
		const radius = LissajousTable.GRID_SIZE_HALF;
		const timeSteps = 64;
		
		for (let n = 0; n < Math.pow(this.dimensions, 2); n++) {
			const a = n % this.dimensions + 1;
			const b = Math.floor(n / this.dimensions) + 1;
			const coord = LissajousTable.getCoordinateOnGrid(new Vector2(a, b));
			
			for (let i = 0; i < timeSteps; i++) {
				const timeDelta = i / timeSteps;
				const timeDeltaNext = (i + 1) / timeSteps;
				
				const coordCurrent = coord.clone()
					.add(LissajousTable.getLissajousCoord(a, b, time - timeDelta).multiplyScalar(radius));
				const coordNext = coord.clone()
					.add(LissajousTable.getLissajousCoord(a, b, time - timeDeltaNext).multiplyScalar(radius));
				
				context.globalAlpha = 1 - timeDelta;
				context.beginPath();
				context.moveTo(coordCurrent.x, coordCurrent.y);
				context.lineTo(coordNext.x, coordNext.y);
				context.strokeStyle = '#000';
				context.stroke();
			}
		}
	}
	
	render(context) {
		const now = performance.now() / 1000 * LissajousTable.TIME_MULTIPLIER;
		
		context.save();
		context.clearRect(0, 0, context.canvas.width, context.canvas.height);
		
		context.font = '18px sans-serif';
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		
		this.renderAxis(context, LissajousTable.AXIS_HORIZONTAL, now);
		this.renderAxis(context, LissajousTable.AXIS_VERTICAL, now);
		this.renderResults(context, now);
		
		context.restore();
	}
}

const canvas = document.createElement('canvas');
canvas.style.width = 'auto';
const context = canvas.getContext('2d');
const lt = new LissajousTable(8);

Object.assign(canvas, lt.getCanvasSize());
document.getElementById('container').appendChild(canvas);

const animate = () => {
	requestAnimationFrame(animate);
	lt.render(context);
};

animate();