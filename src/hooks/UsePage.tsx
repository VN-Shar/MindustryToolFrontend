import { AxiosRequestConfig } from 'axios';
import { useEffect, useRef, useState } from 'react';
import { API } from 'src/API';
import { LoaderState, MAX_ITEM_PER_PAGE } from 'src/config/Config';
import { Utils } from 'src/util/Utils';

export default function usePage<T>(url: string, searchConfig?: AxiosRequestConfig<any>) {
	const [pages, setPages] = useState<Array<Array<T>>>([[]]);
	const [loaderState, setLoaderState] = useState<LoaderState>();

	const ref = useRef({ url: url, searchConfig: searchConfig });

	useEffect(() => {
		setLoaderState('loading');
		API.REQUEST.get(`${ref.current.url}/0`, ref.current.searchConfig) //
			.then((result) => setPages(() => [result.data]))
			.catch(() => console.log('Error loading page')) //
			.finally(() => setLoaderState('more'));
	}, []);

	return {
		pages: Utils.array2dToArray1d(pages),
		loaderState: loaderState,

		loadToPage: function loadToPage(page: number) {
			setPages([[]]);
			setLoaderState('loading');

			for (let i = 0; i < page; i++) {
				API.REQUEST.get(`${url}/${i}`, searchConfig)
					.then((result) => {
						let data: T[] = result.data;
						if (data) {
							setPages((prev) => [...prev, data]);
							if (data.length < MAX_ITEM_PER_PAGE) {
								setLoaderState('out');
								i = page;
							} else setLoaderState('more');
						} else setLoaderState('out');
					})
					.catch(() => setLoaderState('more'));
			}
		},

		loadPage: function loadPage() {
			setLoaderState('loading');

			const lastIndex = pages.length - 1;
			const newPage = pages[lastIndex].length === MAX_ITEM_PER_PAGE;
			const requestPage = newPage ? lastIndex + 1 : lastIndex;

			API.REQUEST.get(`${url}/${requestPage}`, searchConfig)
				.then((result) => {
					let data: T[] = result.data;
					if (data) {
						if (newPage) setPages((prev) => [...prev, data]);
						else
							setPages((prev) => {
								prev[lastIndex] = data;
								return [...prev];
							});

						if (data.length < MAX_ITEM_PER_PAGE) setLoaderState('out');
						else setLoaderState('more');
					} else setLoaderState('out');
				})
				.catch(() => setLoaderState('more'));
		},
	};
}