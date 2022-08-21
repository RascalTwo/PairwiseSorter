import React from 'react';
import Main from './Main';
import Title from './components/Title';
import RenameForm from './components/RenameForm';
import SortedList from './components/SortedList';
import UnsortedList from './components/UnsortedList';
import ComparisonsList from './components/ComparisonsList';
import TimeAgo from './components/TimeAgo';
import Card from './components/Card';

export default function Index({ list, order, isOwner, listProgress, denormalizedComparisons, sortStates, ...mainProps }) {
	return <Main {...mainProps}>
		{isOwner
			? <div className="btn-group float-end" role="group" aria-label="List Actions">
				{listProgress < 1
					? <a className="btn btn-primary" href={`/list/${list._id}/comparisons`}>Sort</a>
					: null
				}
				<a className="btn btn-warning" href={`/list/${list._id}/comparisons?_method=PUT`}>Reset</a>
				<a className="btn btn-danger" href={`/list/${list._id}?_method=DELETE`}>Delete</a>
				<a className="btn btn-primary" href={`/list/${list._id}?public=${!list.public}&_method=PATCH`}>Make {list.public ? 'Private' : 'Public'}</a>
			</div>
			: null
		}
		<Title list={list} listProgress={listProgress} />

		<div className="float-end">
			Created At: <time datetime={list.updatedAt.toISOString()}>{list.createdAt.toLocaleString()}</time>
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

		<ul className="nav justify-content-center nav-tabs">
			<li className="nav-item">
				<a className="nav-link" href="#unsorted-tab">Unsorted</a>
			</li>
			<li className="nav-item">
				<a className="nav-link" href="#sorted-tab">Sorted</a>
			</li>
			<li className="nav-item">
				<a className="nav-link" href="#comparisons-tab">Comparisons</a>
			</li>
		</ul>

		<span data-html-generating-code={list.htmlGeneratingCode ? Buffer.from(list.htmlGeneratingCode).toString('base64') : undefined}>
			<SortedList list={list} order={order} />
			<UnsortedList list={list} isOwner={isOwner} />
			<ComparisonsList list={list} isOwner={isOwner} denormalizedComparisons={denormalizedComparisons} />
		</span>

		<div id="sorting-container">
			<Card
				header="Sorting Animation"
				body={<ul
					id="sorting-list"
					data-sort-states={JSON.stringify(sortStates)}
					data-list={JSON.stringify(list)}
					data-denormalized-comparisons={JSON.stringify([...denormalizedComparisons].reverse())}
				></ul>}
				footer={<button className="btn btn-primary" type="button">Play Animation</button>}
			/>
		</div>

		<script src="/list.js" type="module"></script>
	</Main>;
}