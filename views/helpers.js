export function durationToLargestUnit(duration) {
	for (const [unit, value] of Object.entries({
		'year': Math.floor(duration / 31536000),
		'month': Math.floor((duration % 31536000) / 2628000),
		'day': Math.floor((duration % 2628000) / 86400),
		'hour': Math.floor((duration % 86400) / 3600),
		'minute': Math.floor((duration % 3600) / 60),
		'second': Math.floor(duration % 60),
	})) {
		if (value) return [-value, unit];
	}
	return [0, 'second'];
}

export function applyQueryToItems(items, query, htmlGenerated){
	const regex = new RegExp(query, 'ig');
	return items.map(item => {
		item.display = !query || htmlGenerated || regex.test(item.name)
		return item;
	});
}