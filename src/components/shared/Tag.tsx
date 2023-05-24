import './Tag.css';

import { capitalize } from './Util';

import React from 'react';

export default class Tag extends React.Component<{ index: number; name: string; value: string; color: string; onRemove: (key: number) => void }> {
	render() {
		return (
			<div className='tag' style={{ backgroundColor: this.props.color }}>
				<div className='tag-text'>
					{capitalize(this.props.name)}: {capitalize(this.props.value)}
				</div>
				<div className='remove-tag-button' onClick={() => this.props.onRemove(this.props.index)}>
					<img src='/assets/icons/quit.png' alt='quit'></img>
				</div>
			</div>
		);
	}
}

export class CustomTag {
	category: string;
	getValues: () => TagChoice[];
	color: string;

	constructor(category: string, color: string, getValues: () => TagChoice[]) {
		this.category = category;
		this.getValues = getValues;
		this.color = color;
	}

	hasOption() {
		const v = this.getValues();
		if (v === null) return false;
		return v.length > 0;
	}
}

export class TagChoice {
	name: string;
	value: string;

	constructor(name: string, value: string) {
		this.name = name;
		this.value = value;
	}
}

export const SCHEMATIC_TAG = [
	new CustomTag('name', '#00ff00', () => []),
	new CustomTag('size', 'gray', () => [
		new TagChoice('micro (4 tiles)', 'micro'), //
		new TagChoice('small (16 tiles)', 'small'),
		new TagChoice('medium (64 tiles)', 'medium'),
		new TagChoice('big (255 tiles)', 'big'),
		new TagChoice('huge (900 tiles)', 'huge'),
		new TagChoice('holy shit (10000 tiles)', 'holy shit')
	]),
	new CustomTag('position', 'gray', () => [
		new TagChoice('core', 'core'), //
		new TagChoice('ore', 'ore'),
		new TagChoice('remote', 'remote'),
		new TagChoice('water', 'water'),
		new TagChoice('slag', 'slag'),
		new TagChoice('oil', 'oil')
	]),
	new CustomTag('unit-tier', 'blue', () => [
		new TagChoice('tier1', 't1'), //
		new TagChoice('tier2', 't2'),
		new TagChoice('tier3', 't3'),
		new TagChoice('tier4', 't4'),
		new TagChoice('tier5', 't5')
	])
];

export const SCHEMATIC_SORT_CHOICE = [
	new TagChoice('newest', 'time:1'), //
	new TagChoice('oldest', 'time:-1'), //
	new TagChoice('most-liked', 'like:1') //
];

export const UPLOAD_SCHEMATIC_TAG = SCHEMATIC_TAG.filter((t) => !['name', 'size'].includes(t.category));
