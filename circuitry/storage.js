

export
const p_data = init('data/data-01.json');

async function init (url) {
	return fetch(url)
		.then(res => res.ok ? res : _throw(res))
		.then(res => res.json())
	;
}

function _throw (err) { throw err };
