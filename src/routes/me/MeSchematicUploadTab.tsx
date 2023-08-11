import 'src/styles.css';

import { API } from 'src/API';
import Schematic from 'src/data/Schematic';
import React, { useRef } from 'react';

import i18n from 'src/util/I18N';
import IfTrue from 'src/components/common/IfTrue';
import useInfinitePage from 'src/hooks/UseInfinitePage';
import useModel from 'src/hooks/UseModel';
import usePopup from 'src/hooks/UsePopup';
import LoadingSpinner from 'src/components/loader/LoadingSpinner';
import ScrollToTopButton from 'src/components/button/ScrollToTopButton';
import SchematicContainer from 'src/components/schematic/SchematicContainer';
import useInfiniteScroll from 'src/hooks/UseInfiniteScroll';
import { SchematicUploadInfo, SchematicUploadPreview } from 'src/routes/admin/verify/schematic/VerifySchematicPage';

export default function UserSchematicUploadTab() {
	const currentSchematic = useRef<Schematic>();

	const { addPopup } = usePopup();

	const { model, setVisibility } = useModel();
	const usePage = useInfinitePage<Schematic>(`user/schematic-upload`, 20);
	const { pages, isLoading, reloadPage } = useInfiniteScroll(usePage, (v) => <SchematicUploadPreview  key={v.id} schematic={v} handleOpenModel={handleOpenSchematicInfo} />);

	function rejectSchematic(schematic: Schematic, reason: string) {
		setVisibility(false);
		API.rejectSchematic(schematic, reason) //
			.then(() => addPopup(i18n.t('delete-success'), 5, 'info')) //
			.catch(() => addPopup(i18n.t('delete-fail'), 5, 'error'))
			.finally(() => reloadPage());
	}

	function handleOpenSchematicInfo(schematic: Schematic) {
		currentSchematic.current = schematic;
		setVisibility(true);
	}

	return (
		<main id='schematic-tab' className='flex-column small-gap w100p h100p scroll-y'>
			<SchematicContainer children={pages} />
			<footer className='flex-center'>
				<IfTrue
					condition={isLoading}
					whenTrue={<LoadingSpinner />} //
				/>
				<ScrollToTopButton containerId='schematic-tab' />
			</footer>
			<IfTrue
				condition={currentSchematic}
				whenTrue={
					currentSchematic.current &&
					model(
						<SchematicUploadInfo
							schematic={currentSchematic.current} //
							handleCloseModel={() => setVisibility(false)}
							handleRejectSchematic={rejectSchematic}
							handleVerifySchematic={() => {}}
						/>,
					)
				}
			/>
		</main>
	);
}