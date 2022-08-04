import React from 'react';
import Main from './Main';
import Title from './components/Title';
import RenameForm from './components/RenameForm';

export default function RenameItem({ list, item, ...mainProps}) {
	return <Main {...mainProps}>
		<Title list={list} />
		<RenameForm list={list} title="Item" defaultValue={item.name} returnTab="unsorted-tab" />
	</Main>;
}
