

export
const container = document.createElement('div');
container.id = 'navbar';

export
function print (net, selected, callback_search_hit) {
	if (!selected) return print_search(net, callback_search_hit);
	if (selected.type == 'Node') return print_node_info(net, selected, callback_search_hit);
	if (selected.type == 'Resistor') return print_edge_info(net, selected, callback_search_hit);
}

function print_search (net, callback) {
	$(container)
	.removeClass() // all of 'em
	.addClass('print-search')
	.empty()

	.append('Search:<br>')
	.append($('<input>')
		.on('keypress', evt => {
			if (evt.which == 13) {
				let query = evt.target.value.toLowerCase();
				let pieces = Object.values(net.pieces)
					.filter(n => (n.extra.name||'').toLowerCase().includes(query) || (n.extra.description||'').toLowerCase().includes(query))
				;
				html_results.empty();
				for (let n of pieces) {
					html_results
					.append($('<div>')
						.text(n.extra.name)
						.on('click', _ => callback(n))
					)
				}
			}
		})
	).append('<br><br>')
	.find('input').focus();

	var html_results = $('<div>')
		.addClass('results')
		.appendTo(container)
	;
}

function print_node_info (net, selected, callback_select) {
	$(container)
	.removeClass() // all of 'em
	.addClass('print-node-info')
	.empty()

	.append('Name:<br>')
	.append($('<input>')
		.val(selected.extra.name)
		.on('change', evt => selected.extra.name = evt.target.value)
	).append('<br><br>')
	.append('Description:<br>')
	.append($('<textarea>')
		.val(selected.extra.description)
		.on('change', evt => selected.extra.description = evt.target.value)
	).append('<br><br>')

	.append('<hr>')
	.append('x: ')
	.append($('<input>')
		.val(selected.extra.x_src * 100)
		.attr('type', 'number')
		.on('change', evt => selected.extra.x_src = evt.target.value / 100)
	).append('<br><br>')
	.append('y: ')
	.append($('<input>')
		.val(selected.extra.y_src * 100)
		.attr('type', 'number')
		.on('change', evt => selected.extra.y_src = evt.target.value / 100)
	).append('<br><br>')

	.append('<hr>');
	let edges = Object.values(net.pieces)
		.filter(n =>  n.type == 'Resistor')
		.filter(n => (n.nodes[0] == selected) || (n.nodes[1] == selected));
	let html_remotes = $('<div>').addClass('remotes').appendTo(container);
	for (let e of edges) {
		let remote = e.nodes[0] == selected ? e.nodes[1] : e.nodes[0];
		$(html_remotes)
		.append($('<div>')
			.append('Connection to<br>' + remote.extra.name + '<br>Weight: ' + e.extra.weight)
			.on('click', _ => callback_select(remote))
		)
	}
}

function print_edge_info (net, selected) {
	$(container)
	.removeClass() // all of 'em
	.addClass('print-edge-info')
	.empty()

	.append('Connected Nodes:<br>')
	.append(selected.nodes[0].extra.name)
	.append(' - ')
	.append(selected.nodes[1].extra.name)
	.append('<br><br>')

	.append('Weight:<br>')
	.append($('<input>')
		.val(selected.extra.weight * 100)
		.attr('type', 'number')
		.on('change', evt => {
			selected.extra.weight = evt.target.value / 100;
			selected.resistance   = 1 / selected.extra.weight;
		})
	).append(' / 100<br><br>')
}
