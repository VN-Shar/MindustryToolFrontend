import './Schematic.css';

import { useState, useEffect, ChangeEvent, ReactElement, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { capitalize } from '../shared/Util';
import { API } from '../../AxiosConfig';

import SchematicInfo from './SchematicInfo';
import LazyLoadImage from '../shared/LazyLoadImage';
import SearchBar from '../shared/SearchBar';
import TagQuery from '../shared/TagQuery';
import Dropbox from '../shared/Dropbox';
import React from 'react';
import Tag, { CustomTag, SCHEMATIC_SORT_CHOICE, SCHEMATIC_TAG, TagChoice } from '../shared/Tag';

const MAX_ITEM_PER_PAGE = 10;

const Schematic = () => {
	const [hasMoreContent, setHasMoreContent] = useState(true);
	const [isLoading, setLoading] = useState(false);

	const [schematicList, setSchematicList] = useState<SchematicInfo[][]>([[]]);
	const [currentSchematic, setCurrentSchematic] = useState<SchematicInfo>();

	const [tag, setTag] = useState(SCHEMATIC_TAG[0]);
	const [sortQuery, setSortQuery] = useState<TagChoice>(SCHEMATIC_SORT_CHOICE[0]);
	const [content, setContent] = useState('');
	const [tagQuery, setTagQuery] = useState<TagQuery[]>([]);

	const [showSchematicModel, setShowSchematicModel] = useState(false);

	const currentQuery = useRef<{ tag: TagQuery[]; sort: TagChoice }>({ tag: [], sort: SCHEMATIC_SORT_CHOICE[0] });

	const navigate = useNavigate();

	useEffect(() => loadPage(), [tagQuery, sortQuery]);

	function loadPage() {
		setLoading(true);

		if (tagQuery !== currentQuery.current.tag || sortQuery !== currentQuery.current.sort) {
			setSchematicList([[]]);
			currentQuery.current = { tag: tagQuery, sort: sortQuery };
		}

		const lastIndex = schematicList.length - 1;
		const newPage = schematicList[lastIndex].length === MAX_ITEM_PER_PAGE;
		API.get(`schematics/page/${schematicList.length + (newPage ? 0 : -1)}`, {
			params: {
				tags: `${tagQuery.map((q) => `${q.toString()}`).join()}`, //
				sort: sortQuery.value
			}
		})
			.then((result) => {
				if (result.status === 200 && result.data) {
					let schematics: SchematicInfo[] = result.data;
					if (newPage) schematicList.push(schematics);
					else schematicList[lastIndex] = schematics;
					if (schematics.length < 10) setHasMoreContent(false);
					setSchematicList([...schematicList]);
				} else setHasMoreContent(false);
			})
			.catch((error) => console.log(error))
			.finally(() => setLoading(false));
	}

	function handleContentInput(event: ChangeEvent<HTMLInputElement>) {
		if (event) {
			const input = event.target.value;
			setContent(input.trim());
		}
	}

	function handleRemoveTag(index: number) {
		setTagQuery([...tagQuery.filter((_, i) => i !== index)]);
	}

	function handleAddTag() {
		const q = tagQuery.filter((q) => q.category !== tag.category);
		const v = tag.getValues();

		if (v === null || (v !== null && v.find((c: TagChoice) => c.value === content) !== undefined)) {
			setTagQuery([...q, new TagQuery(tag.category, tag.color, content)]);
		} else alert('Invalid tag ' + tag.category + ': ' + content);
	}

	function buildSchematicInfo(schematic: SchematicInfo | null) {
		if (schematic == null) return <></>;

		const blob = new Blob([schematic.data], { type: 'text/plain' });
		const tagArray: TagQuery[] = [];
		for (let t of schematic.tags) {
			const v = t.split(':');
			if (v.length !== 2) continue;
			const r = SCHEMATIC_TAG.find((st: CustomTag) => st.category === v[0]);
			if (r) {
				tagArray.push(new TagQuery(v[0], r.color, v[1]));
			}
		}
		const url = window.URL.createObjectURL(blob);

		return (
			<div className='schematic-info-modal' onClick={() => setShowSchematicModel(false)}>
				<div className='schematic-info-pane'>
					<div className='schematic-info-container' onClick={(event) => event.stopPropagation()}>
						<LazyLoadImage className='schematic-info-image' path={`schematics/${schematic.id}/image`}></LazyLoadImage>
						<div className='schematic-info-desc-container'>
							<span>Name: {capitalize(schematic.name)}</span>
							<a onClick={() => navigate(`/user/${schematic.authorId}`)}>Author: {schematic.authorId}</a>
							<span>Like: {schematic.like}</span>
							<span>Dislike: {schematic.dislike}</span>
							<section>
								Tags:
								{tagArray.map((t: TagQuery, index: number) => (
									<Tag key={index} index={index} name={t.category} value={t.value} color={t.color} onRemove={handleRemoveTag} />
								))}
							</section>
							<section className='schematic-info-button-container'>
								<button
									className='schematic-info-button'
									onClick={() => {
										if (currentSchematic) currentSchematic.like += 1;
									}}>
									<img src='/assets/icons/play-2.png' className='model-icon' style={{ rotate: '-90deg' }} alt='check' />
								</button>
								<button
									className='schematic-info-button'
									onClick={() => {
										if (currentSchematic) currentSchematic.dislike += 1;
									}}>
									<img src='/assets/icons/play-2.png' className='model-icon' style={{ rotate: '90deg' }} alt='check' />
								</button>
								<a className='schematic-info-button' href={url} download={`${schematic.name.trim().replaceAll(' ', '_')}.msch`}>
									<img src='/assets/icons/upload.png' className='model-icon' alt='check' />
								</a>
								<button
									className='schematic-info-button'
									onClick={() => {
										navigator.clipboard.writeText(schematic.data).then(() => alert('Copied'));
									}}>
									<img src='/assets/icons/copy.png' className='model-icon' alt='check' />
								</button>
								<button className='schematic-info-button'>
									<img src='/assets/icons/trash-16.png' className='model-icon' alt='check' />
								</button>
							</section>
						</div>
					</div>
				</div>
			</div>
		);
	}
	const tagSubmitButton = (
		<button
			className='submit-button'
			title='Add'
			onClick={(event) => {
				handleAddTag();
				event.stopPropagation();
			}}>
			<img src='/assets/icons/check.png' alt='check' />
		</button>
	);

	const schematicArray: ReactElement[] = [];
	for (let p = 0; p < schematicList.length; p++) {
		for (let i = 0; i < schematicList[p].length; i++) {
			let schematic = schematicList[p][i];
			schematicArray.push(
				<div
					key={p * MAX_ITEM_PER_PAGE + i}
					className='schematic-preview'
					onClick={() => {
						setCurrentSchematic(schematic);
						setShowSchematicModel(true);
					}}>
					<LazyLoadImage className='schematic-image' path={`schematics/${schematic.id}/image`}></LazyLoadImage>
					<div className='schematic-preview-description'>{capitalize(schematic.name)}</div>
				</div>
			);
		}
	}

	return (
		<div className='schematic'>
			<section className='search-container'>
				<Dropbox
					value={'Tag: ' + tag.category}
					submitButton={
						<button className='submit-button' title='Search' type='button' onClick={(e) => loadPage()}>
							<img src='/assets/icons/search.png' alt='search'></img>
						</button>
					}>
					{SCHEMATIC_TAG.filter((t) => !tagQuery.find((q) => q.category === t.category)).map((t, index) => (
						<div
							key={index}
							onClick={() => {
								setTag(t);
								setContent('');
							}}>
							{t.category}
						</div>
					))}
				</Dropbox>

				{tag.hasOption() ? (
					<Dropbox value={'Value: ' + content} submitButton={tagSubmitButton}>
						{tag.getValues().map((content: { name: string; value: string }, index: number) => (
							<div key={index} onClick={() => setContent(content.value)}>
								{capitalize(content.name)}
							</div>
						))}
					</Dropbox>
				) : (
					<SearchBar placeholder='Search' value={content} onChange={handleContentInput} submitButton={tagSubmitButton} />
				)}
				<div className='tag-container'>
					{tagQuery.map((t: TagQuery, index: number) => (
						<Tag key={index} index={index} name={t.category} value={t.value} color={t.color} onRemove={handleRemoveTag} />
					))}
				</div>
			</section>
			<section className='sort-container'>
				{SCHEMATIC_SORT_CHOICE.map((c: TagChoice, index) => (
					<button className={c == sortQuery ? 'sort-choice selected' : 'sort-choice'} type='button' key={index} onClick={() => setSortQuery(c)}>
						{capitalize(c.name)}
					</button>
				))}
			</section>
			<section className='schematic-container'>{schematicArray}</section>
			<div className='schematic-container-footer'>
				{isLoading ? (
					<div className='loading-spinner'></div>
				) : (
					<button className='load-more-button' onClick={() => loadPage()}>
						{hasMoreContent ? 'Load more' : 'No schematic left'}
					</button>
				)}
			</div>
			{showSchematicModel === true && currentSchematic !== undefined && buildSchematicInfo(currentSchematic)}
		</div>
	);
};

export default Schematic;
