import {Circuit}                         from './algodat.js';
import {canvas, draw, getMouseSelection} from './graphics.js';
import * as storage                      from './storage.js';
import * as ui                           from './ui.js';

document.body.appendChild(canvas);
document.body.appendChild(ui.container);
window.onresize = function () {
	canvas.width = window.innerWidth - 360/*ui.container.width*/;
	canvas.height = window.innerHeight;
}
window.onresize();

window.onload = main;


async function main () {
	const data = await storage.p_data;
	let net = new Circuit();
	for (let id in data.nodes) {
		let extra = Object.assign(data.nodes[id], {x_src: data.nodes[id].x, y_src: data.nodes[id].y});
		net.addPiece(id, 'Node', 0, extra);
	}
	for (let id in data.edges) {
		let edge = data.edges[id];
		net.addPiece(id, 'Resistor', {resistance: 1 / edge.weight, nodes: [net.get(edge.from), net.get(edge.to)]}, edge);
	}

	let selected = null;
	function select (piece) {
		selected = piece;
		ui.print(net, selected, select);
	}
	canvas.onclick = function (evt) {
		let piece = getMouseSelection(net, evt.x, evt.y);
		select(piece);
	}
	select(null);

	while (true) {
		let tick_speed = 0.1;
		if (selected) {
			if (selected.type == 'Node')                          selected.pressure += tick_speed*0.2;
			if (selected.type == 'Resistor') selected.nodes.forEach(n => n.pressure += tick_speed*0.2);
		}
		net.tick(tick_speed);
		// shuffle objects around and let them decay  (looks really cool)
		Object.values(net.pieces).filter(piece => piece.type == 'Node').forEach(n => {
			n.extra.x        *= Math.exp(-tick_speed * smooth_max(n.pressure));
			n.extra.y        *= Math.exp(-tick_speed * smooth_max(n.pressure));
			let decay_speed = 0.1;
			n.pressure *= Math.exp(-tick_speed * decay_speed);
			n.extra.x   = Math.exp(-tick_speed * decay_speed) * n.extra.x  +  tick_speed * decay_speed * n.extra.x_src;
			n.extra.y   = Math.exp(-tick_speed * decay_speed) * n.extra.y  +  tick_speed * decay_speed * n.extra.y_src;
		})
		draw(net);
		await new Promise(requestAnimationFrame);
	}
}



function smooth_max (x, limit = 1) {
	return limit * Math.max(0, 1 - Math.exp(-x / limit));
}
