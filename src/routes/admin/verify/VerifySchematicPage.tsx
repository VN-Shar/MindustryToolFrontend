import 'src/styles.css';
import './VerifySchematicPage.css';

import React, { useEffect, useState } from 'react';
import { TagChoiceLocal, Tags } from 'src/components/tag/Tag';
import { API } from 'src/API';
import { API_BASE_URL } from 'src/config/Config';
import Schematic from 'src/data/Schematic';
import Dropbox from 'src/components/dropbox/Dropbox';
import LoadingSpinner from 'src/components/loader/LoadingSpinner';
import ScrollToTopButton from 'src/components/button/ScrollToTopButton';
import { Utils } from 'src/util/Utils';
import IconButton from 'src/components/button/IconButton';
import i18n from 'src/util/I18N';
import TagPick from 'src/components/tag/TagPick';
import useClipboard from 'src/hooks/UseClipboard';
import usePage from 'src/hooks/UsePage';
import SchematicPreviewImage from 'src/components/schematic/SchematicPreviewImage';
import ColorText from 'src/components/common/ColorText';
import DownloadButton from 'src/components/button/DownloadButton';
import useModel from 'src/hooks/UseModel';
import SchematicContainer from 'src/components/schematic/SchematicContainer';
import TagEditContainer from 'src/components/tag/TagEditContainer';
import LoadUserName from 'src/components/user/LoadUserName';
import { Trans } from 'react-i18next';
import SchematicDescription from 'src/components/schematic/SchematicDescription';
import SchematicRequirement from 'src/components/schematic/SchematicRequirement';
import SchematicInfoImage from 'src/components/schematic/SchematicInfoImage';
import IfTrueElse from 'src/components/common/IfTrueElse';
import IfTrue from 'src/components/common/IfTrue';
import Button from 'src/components/button/Button';
import SchematicPreviewCard from 'src/components/schematic/SchematicPreviewCard';
import usePopup from 'src/hooks/UsePopup';
import useDialog from 'src/hooks/UseDialog';
import ConfirmDialog from 'src/components/dialog/ConfirmDialog';
import ClearIconButton from 'src/components/button/ClearIconButton';

export default function VerifySchematicPage() {
	const [currentSchematic, setCurrentSchematic] = useState<Schematic>();

	const { addPopup } = usePopup();

	const { pages, loadPage, reloadPage, isLoading, hasMore } = usePage<Schematic>('schematic-upload', 20);
	const { model, setVisibility } = useModel();

	const [totalSchematic, setTotalSchematic] = useState(0);

	useEffect(() => {
		API.getTotalSchematicUpload()
			.then((result) => setTotalSchematic(result.data))
			.catch(() => console.log('Error fletching total schematic'));
	}, []);

	function handleOpenSchematicInfo(schematic: Schematic) {
		setCurrentSchematic(schematic);
		setVisibility(true);
	}

	function rejectSchematic(schematic: Schematic, reason: string) {
		API.rejectSchematic(schematic, reason) //
			.then(() => addPopup(i18n.t('delete-success'), 5, 'info')) //
			.then(() => setTotalSchematic((prev) => prev - 1)) //
			.catch(() => addPopup(i18n.t('delete-fail'), 5, 'error'))
			.finally(() => {
				reloadPage();
				setVisibility(false);
			});
	}

	function verifySchematic(schematic: Schematic, tags: TagChoiceLocal[]) {
		const tagString = Tags.toString(tags);
		API.verifySchematic(schematic, tagString) //
			.then(() => API.postNotification(schematic.authorId, 'Your schematic submission has be accept', 'Post schematic success'))
			.then(() => addPopup(i18n.t('verify-success'), 5, 'info'))
			.then(() => setTotalSchematic((prev) => prev - 1))
			.catch(() => addPopup(i18n.t('verify-fail'), 5, 'error'))
			.finally(() => {
				reloadPage();
				setVisibility(false);
			});
	}

	function buildLoadAndScrollButton() {
		return (
			<section className='grid-row small-gap'>
				<Button onClick={() => loadPage()}>
					<IfTrueElse
						condition={hasMore} //
						whenTrue={<Trans i18nKey='load-more' />}
						whenFalse={<Trans i18nKey='no-more-schematic' />}
					/>
				</Button>
				<ScrollToTopButton containerId='verify-schematic' />
			</section>
		);
	}

	return (
		<main id='verify-schematic' className='flex-column h100p w100p scroll-y'>
			<section className='flex-row center medium-padding'>
				<Trans i18nKey='total-schematic' />:{totalSchematic > 0 ? totalSchematic : 0}
			</section>
			<SchematicContainer
				children={pages.map((schematic) => (
					<SchematicPreview
						key={schematic.id} //
						schematic={schematic}
						handleOpenModel={(schematic) => handleOpenSchematicInfo(schematic)}
					/>
				))}
			/>
			<footer className='flex-center'>
				<IfTrueElse
					condition={isLoading}
					whenTrue={<LoadingSpinner />} //
					whenFalse={buildLoadAndScrollButton()}
				/>
			</footer>
			<IfTrue
				condition={currentSchematic}
				whenTrue={
					currentSchematic &&
					model(
						<SchematicInfo
							schematic={currentSchematic} //
							handleCloseModel={() => setVisibility(false)}
							handleVerifySchematic={verifySchematic}
							handleRejectSchematic={rejectSchematic}
						/>,
					)
				}
			/>
		</main>
	);
}

interface SchematicPreviewProps {
	schematic: Schematic;
	handleOpenModel: (schematic: Schematic) => void;
}

function SchematicPreview(props: SchematicPreviewProps) {
	const { copy } = useClipboard();

	return (
		<SchematicPreviewCard>
			<SchematicPreviewImage src={`${API_BASE_URL}schematic-upload/${props.schematic.id}/image`} onClick={() => props.handleOpenModel(props.schematic)} />
			<ColorText className='capitalize small-padding flex-center text-center' text={props.schematic.name} />
			<section className='grid-row small-gap small-padding'>
				<IconButton title='copy' icon='/assets/icons/copy.png' onClick={() => copy(props.schematic.data)} />
				<DownloadButton
					href={Utils.getDownloadUrl(props.schematic.data)} //
					download={`${('schematic_' + props.schematic.name).trim().replaceAll(' ', '_')}.msch`}
				/>
			</section>
		</SchematicPreviewCard>
	);
}

interface SchematicInfoProps {
	schematic: Schematic;
	handleVerifySchematic: (schematic: Schematic, tags: TagChoiceLocal[]) => void;
	handleRejectSchematic: (schematic: Schematic, reason: string) => void;
	handleCloseModel: () => void;
}

function SchematicInfo(props: SchematicInfoProps) {
	const [tags, setTags] = useState<TagChoiceLocal[]>(Tags.parseArray(props.schematic.tags, Tags.SCHEMATIC_UPLOAD_TAG));
	const [tag, setTag] = useState('');

	const verifyDialog = useDialog();
	const rejectDialog = useDialog();

	const { copy } = useClipboard();

	function handleAddTag(tag: TagChoiceLocal) {
		tags.filter((q) => q !== tag);
		setTags((prev) => [...prev, tag]);
		setTag('');
	}

	function handleRemoveTag(index: number) {
		setTags((prev) => [...prev.filter((_, i) => i !== index)]);
	}

	return (
		<main className='flex-column space-between w100p h100p small-gap massive-padding border-box scroll-y'>
			<section className='flex-row medium-gap flex-wrap'>
				<SchematicInfoImage src={`${API_BASE_URL}schematic/${props.schematic.id}/image`} />
				<section className='flex-column small-gap flex-wrap'>
					<h2 className='capitalize'>{props.schematic.name}</h2>
					<Trans i18nKey='author' /> <LoadUserName userId={props.schematic.authorId} />
					<SchematicDescription description={props.schematic.description} />
					<SchematicRequirement requirement={props.schematic.requirement} />
					<TagEditContainer tags={tags} onRemove={(index) => handleRemoveTag(index)} />
				</section>
			</section>
			<section className='flex-column small-gap w100p'>
				<Dropbox
					placeholder={i18n.t('add-tag').toString()}
					value={tag}
					items={Tags.SCHEMATIC_UPLOAD_TAG.filter((t) => t.toDisplayString().toLowerCase().includes(tag.toLowerCase()) && !tags.includes(t))}
					onChange={(event) => setTag(event.target.value)}
					onChoose={(item) => handleAddTag(item)}
					mapper={(t, index) => <TagPick key={index} tag={t} />}
				/>
			</section>
			<section className='grid-row small-gap'>
				<IconButton icon='/assets/icons/copy.png' onClick={() => copy(props.schematic.data)} />
				<DownloadButton
					href={Utils.getDownloadUrl(props.schematic.data)} //
					download={`${('schematic_' + props.schematic.name).trim().replaceAll(' ', '_')}.msch`}
				/>
				<Button children={<Trans i18nKey='reject' />} onClick={() => rejectDialog.setVisibility(true)} />
				<Button children={<Trans i18nKey='verify' />} onClick={() => verifyDialog.setVisibility(true)} />
				<Button onClick={() => props.handleCloseModel()} children={<Trans i18nKey='back' />} />
			</section>
			{verifyDialog.dialog(
				<ConfirmDialog
					onConfirm={() => props.handleVerifySchematic(props.schematic, tags)} //
					onClose={() => verifyDialog.setVisibility(false)}>
					<Trans i18nKey='verify' />
				</ConfirmDialog>,
			)}
			{rejectDialog.dialog(
				<section>
					<TypeDialog
						onSubmit={(reason) => props.handleRejectSchematic(props.schematic, reason)} //
						onClose={() => rejectDialog.setVisibility(false)}
					/>
				</section>,
			)}
		</main>
	);
}

interface TypeDialogProps {
	onSubmit: (content: string) => void;
	onClose: () => void;
}

function TypeDialog(props: TypeDialogProps) {
	const [content, setContent] = useState('');

	return (
		<section className='flex-column'>
			<header className='flex-row space-between small-padding'>
				<Trans i18nKey='reject-reason' />
				<ClearIconButton icon='/assets/icons/quit.png' onClick={() => props.onClose()} />
			</header>
			<textarea className='type-dialog' title='reason' onChange={(event) => setContent(event.target.value)} />
			<section className='flex-row justify-end w100p small-padding border-box'>
				<Button onClick={() => props.onSubmit(content)}>
					<Trans i18nKey='reject' />
				</Button>
			</section>
		</section>
	);
}
