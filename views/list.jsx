import React from 'react';
import Main from './Main';
import Title from './components/Title';
import RenameForm from './components/RenameForm';
import SortedList from './components/SortedList';
import UnsortedList from './components/UnsortedList';
import ComparisonsList from './components/ComparisonsList';

export default function Index({ list, order, isOwner, listProgress, denormalizedComparisons, ...mainProps }) {
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

		{isOwner
			? <>
				<details>
					<summary>Rename</summary>
					<RenameForm list={list} title="List" defaultValue={list.name} />
				</details>

				<form action={`/list/${list._id}`} method="POST">
					<label htmlFor="name" className="form-label">New Item(s)</label>
					<textarea className="form-control" id="names" name="names" placeholder="One item per line" required></textarea>
					<button className="btn btn-primary">Add Item(s)</button>
				</form>
			</>
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

		<SortedList list={list} order={order} />
		<UnsortedList list={list} isOwner={isOwner} />
		<ComparisonsList list={list} isOwner={isOwner} denormalizedComparisons={denormalizedComparisons} />

		<script src="/list.js"></script>
	</Main>;
}