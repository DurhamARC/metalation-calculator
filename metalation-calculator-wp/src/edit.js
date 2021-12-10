/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/packages/packages-block-editor/#useBlockProps
 */
import ReactDOM from 'react-dom';
import { useBlockProps } from '@wordpress/block-editor';
import { Disabled } from '@wordpress/components';
import ServerSideRender from '@wordpress/server-side-render';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './editor.scss';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/developers/block-api/block-edit-save/#edit
 *
 * @param {Object} props Block properties
 * @return {WPElement} Element to render.
 */
export default function Edit(props) {
	const blockProps = useBlockProps();
	const div = (
		<div {...blockProps}>
			<Disabled>
				<ServerSideRender
					block="create-block/metalation-calculator-wp"
					attributes={props.attributes}
				/>
			</Disabled>
		</div>
	);

	// Listen for the calculator element being added to the DOM so we can add in placeholder rows
	const subscribe = wp.data.subscribe;
	const closeListener = subscribe(() => {
		if (!document.getElementById('calculator_wrapper')) {
			// Editor not ready.
			return;
		}
		// Close the listener as soon as we know we are ready to avoid an infinite loop.
		closeListener();

		// Add placeholder rows to the table, with no calculated values
		// TODO: when issue #34 is addressed, some of these values will come from block properties
		const metalValues = [
			['Magnesium', 'Mg', 1e3, 2.7e-3],
			['Manganese', 'Mn', 1e3, 2.6e-6],
			['Iron', 'Fe', 1e-6, 4.8e-8],
			['Cobalt', 'Co', 3e-11, 2.5e-9],
			['Nickel', 'Ni', 9.8e-10, 1.8e-13],
			['Copper', 'Cu', 2.4e-16, 1.2e-18],
			['Zinc', 'Zn', 1.9e-13, 1.19e-12],
		];

		const tableRows = metalValues.map((val) => (
			<tr key={val[1]}>
				<th>{val[1]}</th>
				<td>{val[2]}</td>
				<td>-</td>
				<td>{val[3]}</td>
				<td>-</td>
				<td>-</td>
			</tr>
		));
		const tbody = document
			.getElementById('metalation-table')
			.getElementsByTagName('tbody')[0];
		ReactDOM.render(tableRows, tbody);
	});
	return div;
}
