import React from 'react';
import Main from './Main';
import Title from './components/Title';
import RenameForm from './components/RenameForm';
import SortedList from './components/SortedList';
import UnsortedList from './components/UnsortedList';
import ComparisonsList from './components/ComparisonsList';
import TimeAgo from './components/TimeAgo';
import Card from './components/Card';

export default function Index({ list, order, isOwner, progress, denormalizedComparisons, states, query, highlightQueryMatches, ...mainProps }) {
	const checkHighlightToggle = highlightQueryMatches !== undefined ? highlightQueryMatches : !list.htmlGeneratingCode;
	return <Main {...mainProps}>
		{isOwner
			? <div className="btn-group float-end" role="group" aria-label="List Actions">
				{progress < 1
					? <a className="btn btn-primary" href={`/list/${list._id}/comparisons`}>Sort</a>
					: null
				}
				<a className="btn btn-warning" href={`/list/${list._id}/comparisons?_method=PUT`} data-confirm={`reset all comparisons within ${list.name}`}>Reset</a>
				<a className="btn btn-danger" href={`/list/${list._id}?_method=DELETE`} data-confirm={`delete ${list.name}, containing ${list.items.length} items`}>Delete</a>
				<a className="btn btn-primary" href={`/list/${list._id}?public=${!list.public}&_method=PATCH`}>Make {list.public ? 'Private' : 'Public'}</a>
			</div>
			: null
		}
		<Title list={list} progress={progress} />

		<div className="float-end">
			Created At: <time dateTime={list.updatedAt.toISOString()}>{list.createdAt.toLocaleString()}</time>
			{list.createdAt.getTime() !== list.updatedAt.getTime()
				? <>
					<br/>
					Updated At: <TimeAgo date={list.updatedAt} />
				</>
				: null
			}
		</div>

		{isOwner
			? <>
				<details>
					<summary>Update</summary>

					<RenameForm list={list} title="List" defaultValue={list.name} />

					<form method="POST">
						<input type="hidden" name="_method" value="PATCH" />
						<label htmlFor="htmlGeneratingCode" className="form-label">HTML-Generating JavaScript</label>
						<textarea className="form-control" id="htmlGeneratingCode" name="htmlGeneratingCode" placeholder="Code that generates HTML representing item" defaultValue={list.htmlGeneratingCode || `
/**
 * Return the HTML content representing the current item, sandboxed in an <iframe>.
 *
 * @param {string} name Name of item
 * @returns {string} HTML of item
 */
async function generateHTML(name){
	return \`<span style="color: red;">\${name}</span>\`;
}`.trim()} rows={10}></textarea>
						<button className="btn btn-primary">Update</button>
					</form>

					<form method="POST">
						<input type="hidden" name="_method" value="PUT" />
						<label htmlFor="newNames" className="form-label">Bulk Edit</label>
						<textarea className="form-control" id="newNames" name="newNames" placeholder="Add and Delete items at once!" defaultValue={list.items.map(item => item.name).join('\n')} rows={10}></textarea>
						<button className="btn btn-primary">Edit</button>
					</form>
				</details>

				<form action={`/list/${list._id}`} method="POST">
					<label htmlFor="name" className="form-label">New Item(s)</label>
					<textarea className="form-control" id="names" name="names" placeholder="One item per line" required></textarea>
					<button className="btn btn-primary">Add Item(s)</button>
				</form>
			</>
			: list.htmlGeneratingCode
				? <details>
					<summary>View JavaScript Code</summary>

					<textarea className="form-control" defaultValue={list.htmlGeneratingCode} rows={10} readOnly></textarea>
				</details>
				: null
		}
		<details id="search-details" open={!!query}>
			<summary>Search</summary>

			<form action={`/list/${list._id}/search`} id="search-form" method="GET">
				<label htmlFor="query" className="form-label" hidden>Search</label>
				<input className="form-control" id="query" name="query" placeholder="Search for Text" defaultValue={query} autoComplete="off" />
				<div class="form-check form-switch">
					<input class="form-check-input" type="checkbox" role="switch" id="highlight" name="highlight" checked={checkHighlightToggle} defaultValue={checkHighlightToggle} />
					<label class="form-check-label" for="highlight">Highlight Matches</label>
				</div>
				<button className="btn btn-primary">Search</button>
			</form>
		</details>

		<ul className="nav justify-content-center nav-tabs">
			<li className="nav-item">
				<a className="nav-link" href="#unsorted-tab">Unsorted ({list.items.length.toLocaleString()})</a>
			</li>
			<li className="nav-item">
				<a className="nav-link" href="#sorted-tab">Sorted ({order.length.toLocaleString()})</a>
			</li>
			<li className="nav-item">
				<a className="nav-link" href="#comparisons-tab">Comparisons ({denormalizedComparisons.length.toLocaleString()})</a>
			</li>
		</ul>

		<span data-searchable={true} data-query={query} data-highlight-query-matches={highlightQueryMatches} data-html-generating-code={list.htmlGeneratingCode ? Buffer.from(list.htmlGeneratingCode).toString('base64') : undefined}>
			<SortedList list={list} order={order} query={query} highlightQueryMatches={highlightQueryMatches} />
			<UnsortedList list={list} isOwner={isOwner} query={query} highlightQueryMatches={highlightQueryMatches} />
			<ComparisonsList list={list} isOwner={isOwner} denormalizedComparisons={denormalizedComparisons} query={query} highlightQueryMatches={highlightQueryMatches} />
		</span>

		<div id="sorting-container">
			<Card
				header="Sorting Animation"
				body={<ul
					id="sorting-list"
					data-sort-states={JSON.stringify(states)}
					data-list={JSON.stringify(list)}
					data-denormalized-comparisons={JSON.stringify([...denormalizedComparisons].reverse())}
				></ul>}
				footer={<button className="btn btn-primary" type="button">Play Animation</button>}
			/>
		</div>

		<script src="/list.js" type="module"></script>
	</Main>;
}