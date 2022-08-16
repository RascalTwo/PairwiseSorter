import React from 'react';
import { durationToLargestUnit } from '../helpers';

export default function TimeAgo({ date }){
	const now = Date.now();
	return <time
		datetime={date.toISOString()}
		data-bs-toggle="tooltip"
		data-bs-title={date.toLocaleString()}
		title={date.toLocaleString()}
	>
		{new Intl.RelativeTimeFormat().format(...durationToLargestUnit(Math.floor(((now - date.getTime()) / 1000))))}
	</time>;
}