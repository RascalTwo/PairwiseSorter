import React from 'react';
import Main from './Main';
import Title from './components/Title';
import ItemContent from './components/ItemContent';

export default function Comparisons({ list, progress, comparison, ...mainProps}) {
	return <Main {...mainProps}>
		<Title list={list} progress={progress} />
		<p className="text-center">Choose which item should be sorted higher</p>
		<p className="text-center">You can additionally keyboard controls <kbd title="Left Arrow or A">&lt;-</kbd>, <kbd title="Up Arrow or W">^</kbd>, and <kbd title="Right Arrow or D">-&gt;</kbd> to choose the options</p>
		<div id="comparisons-container" className="container text-center" data-html-generating-code={list.htmlGeneratingCode ? Buffer.from(list.htmlGeneratingCode).toString('base64') : undefined}>
			<div className="row">
				<div className="col">
					<ItemContent name={comparison.a.name} htmlGenerated={!!list.htmlGeneratingCode} />
					<br />
					<a className="btn btn-primary compare-item" href={`/list/${list._id}/${comparison.a._id}/${comparison.b._id}?result=-1&_method=POST`}>Left</a>
					<br/>
					<br/>
					<a className="btn btn-primary" href={`/list/${list._id}/${comparison.a._id}?redirectTo=${encodeURIComponent(`/list/${list._id}/comparisons`)}`}>Rename</a>
					&nbsp;
					<a className="btn btn-danger" href={`/list/${list._id}/${comparison.a._id}?_method=DELETE&redirectTo=${encodeURIComponent(`/list/${list._id}/comparisons`)}`} data-confirm={`delete ${comparison.a.name}`}>Delete</a>
				</div>
				<div className="col">
					<a className="btn btn-primary compare-item" href={`/list/${list._id}/${comparison.a._id}/${comparison.b._id}?result=0&_method=POST`}>Neither</a>
				</div>
				<div className="col">
					<ItemContent name={comparison.b.name} htmlGenerated={!!list.htmlGeneratingCode} />
					<br />
					<a className="btn btn-primary compare-item" href={`/list/${list._id}/${comparison.a._id}/${comparison.b._id}?result=1&_method=POST`}>Right</a>
					<br/>
					<br/>
					<a className="btn btn-primary" href={`/list/${list._id}/${comparison.b._id}?redirectTo=${encodeURIComponent(`/list/${list._id}/comparisons`)}`}>Rename</a>
					&nbsp;
					<a className="btn btn-danger" href={`/list/${list._id}/${comparison.b._id}?_method=DELETE&redirectTo=${encodeURIComponent(`/list/${list._id}/comparisons`)}`} data-confirm={`delete ${comparison.b.name}`}>Delete</a>
				</div>
			</div>
		</div>
		<script src="/comparisons.js"></script>
	</Main>;
}