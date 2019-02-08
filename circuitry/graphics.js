

export
let canvas = document.createElement('canvas');
let ctx    = canvas.getContext('2d');

export
function draw (net) {
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	let nodes = Object.values(net.pieces).filter(piece => piece.type == 'Node');
	let edges = Object.values(net.pieces).filter(piece => piece.type == 'Resistor');
	for (let n of nodes) {
		let color = getColor(n.pressure*3);
		let size  = 0.8 + smooth_max(n.pressure*3, 2.5);

		let [x, y] = getCanvasCoords(n.extra.x, n.extra.y);
		ctx.fillStyle = color;
		ctx.beginPath();
			ctx.arc(x, y, 10*size, 0, 2*Math.PI);
		ctx.fill();

		ctx.textAlign = 'center';
		ctx.font = `${10+10*size}px Arial`;
		ctx.fillText(n.extra.name, x, y-10*size);
	}
	for (let e of edges) {
		let [n0, n1] = e.nodes;
		let pressure = (e.nodes[0].pressure + e.nodes[1].pressure) / 2;
		let size  = 0.8 + smooth_max(pressure*3, 2.5);

		let [[x1, y1], [x2, y2]] = [getCanvasCoords(n0.extra.x, n0.extra.y), getCanvasCoords(n1.extra.x, n1.extra.y)];
		let color = ctx.createLinearGradient(x1, y1, x2, y2);
		color.addColorStop(0, getColor(e.nodes[0].pressure*3));
		color.addColorStop(1, getColor(e.nodes[1].pressure*3));
		ctx.strokeStyle = color;
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.lineWidth = size;
		ctx.stroke();

		ctx.textAlign = 'center';
		ctx.font = `${20*size}px Arial`;
		if (e.extra.name) ctx.fillText(e.extra.name, (x1+x2)/2, (y1+y2)/2);
	}
}


export
let scale_factor = 1.0;
function getCanvasCoords (virt_x, virt_y) {
	let canvas_size = Math.sqrt(canvas.width * canvas.height) / /*diameter to radius*/ 2 * /*avoid overflow-y*/ 0.7 / /*in case virtual coords >= 1*/ scale_factor;
	return [
		(canvas.width  / 2) + (virt_x * canvas_size),
		(canvas.height / 2) + (virt_y * canvas_size),
	]
}

function sigmoid (x, mean = 0, scale = 1) {
	x = (x - mean) / scale;
	return Math.exp(x) / (1 + Math.exp(x));
}
function smooth_max (x, limit = 1) {
	return limit * Math.max(0, 1 - Math.exp(-x / limit));
}
function getColor (x) {
	let [r,g,b] = [sigmoid(x), 0.5, sigmoid(-x)];
	return `rgb(${r*256},${g*256},${b*256})`;
}



export
function getMouseSelection (net, mouse_x, mouse_y) {
	let nodes = Object.values(net.pieces).filter(piece => piece.type == 'Node');
	let edges = Object.values(net.pieces).filter(piece => piece.type == 'Resistor');
	for (let n of nodes) {
		let size  = 0.8 + smooth_max(n.pressure*3, 2.5);

		let [x, y] = getCanvasCoords(n.extra.x, n.extra.y);
		if (isInRange(x - 10*size, mouse_x, x + 10*size) && isInRange(y - 10*size, mouse_y, y + 10*size)) return n;
	}
	for (let e of edges) {
		let [n0, n1] = e.nodes;
		let pressure = (e.nodes[0].pressure + e.nodes[1].pressure) / 2;
		let size  = 0.8 + smooth_max(pressure*3, 2.5);

		let [[x1, y1], [x2, y2]] = [getCanvasCoords(n0.extra.x, n0.extra.y), getCanvasCoords(n1.extra.x, n1.extra.y)];
		let edge_vec  = [x2      - x1, y2      - y1];
		let mouse_vec = [mouse_x - x1, mouse_y - y1];
		let mouse_vec_rotatedcounterclockwise90deg = [-mouse_vec[1], mouse_vec[0]];
		// now, dotP(edge_vec, mouse_vec_rotatedcounterclockwise90deg) = sin(angle) * length(edge_vec) * length(mouse_vec_rotated...);
		let dist_mouse_edge = Math.abs(dotP(edge_vec, mouse_vec_rotatedcounterclockwise90deg) / length(edge_vec));
			// ... / length(mouse_vec_rotated...) * length(mouse_vec_rotated...);
		// console.log('distance mouse edge', e, dist_mouse_edge);
		if (dist_mouse_edge < size*2+3) return e;
	}
}


function isInRange (low, x, high) {
	return (low <= x) && (x <= high);
}
function dotP (vec0, vec1) {
	let sum = 0;
	for (let i = 0; i < vec0.length; i++) {
		sum += vec0[i] * vec1[i];
	}
	return sum;
}
function length (vec) {
	return Math.sqrt(vec.map(x => x*x).reduce((a, b) => a+b));
}

