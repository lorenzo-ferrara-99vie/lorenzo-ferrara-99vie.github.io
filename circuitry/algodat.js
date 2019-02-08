/*
A circuit consists of pieces.
An example class of pieces is `Node'. It represents a piece of metal that holds a certain electric pressure.
Other pieces can bind to a Node and interact with it (i.e. change its electric pressure).

The electric pressure is standardized to be 0 at rest.
Positive pressure is graphically represented by red/orange colors,
while negative pressure is represented by blue/cyan colors.
(More details in the respective code files.)

*/

export
class Circuit {
	// .pieces   :: Map<String, Node|Resistor>

	constructor () {
		this.pieces = { };
	}
	addPiece (name, type, args, extra = { }) {
		this.pieces[name] = new ({Node, Resistor}[type])(args);
		this.pieces[name].extra = extra;
	}
	get (name) {
		return this.pieces[name];
	}
	tick (t) {
		Object.values(this.pieces).forEach(piece => {
			(typeof piece.tick == 'function') && piece.tick(t);
		});
	}
}

class Node {
	// .type      = "Node"
	// .pressure :: float

	constructor (p = 0) {
		this.type = "Node";
		this.pressure = p;
	}
}

class Resistor {
	// .type        = "Resistor"
	// .resistance :: float
	// .nodes      :: [Node]    // note that .nodes.length = 2

	constructor ({nodes, resistance = 1}) {
		this.type = "Resistor";
		this.resistance = resistance;
		this.nodes = nodes;
	}
	tick (t) {
		let mean_p = this.nodes.map(node => node.pressure).reduce((a, b) => (a+b)) / this.nodes.length;
		let conductance = 1 / this.resistance;
		let retain_factor = 1 / Math.exp(conductance * t);
		this.nodes.forEach(node => {
			node.pressure = mean_p + ((node.pressure - mean_p) * retain_factor);
		})
	}
}





