/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/packages/packages-block-editor/#useBlockProps
 */
import { useBlockProps } from '@wordpress/block-editor';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './editor.scss';
import '../include/main.css';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/developers/block-api/block-edit-save/#edit
 *
 * @return {WPElement} Element to render.
 */
export default function Edit() {
	const metals = require('../include/metals');
	const metalDataSet = new metals.MetalDataSet();

	const tableRows = Object.keys(metalDataSet.metals).map((key) => (
		<tr key={key}>
			<th>{metalDataSet.metals[key].symbol}</th>
			<td>{metalDataSet.metals[key].affinity}</td>
			<td>-</td>
			<td>{metalDataSet.metals[key].bufferedMetalConcentration}</td>
			<td>-</td>
			<td>-</td>
		</tr>
	));

	return (
		<div {...useBlockProps()}>
			<div className="metalation-calculator">
				<p>
					To predict the metalation state of a protein or molecule,
					fill in values in the table for as many determined metal
					affinities (and availabilities if known) as possible.
				</p>
				<table id="metalation-table">
					<thead>
						<tr>
							<td></td>
							<th>Metal Affinity (M)</th>
							<th>
								∆G (kJ mol<sup>-1</sup>)
							</th>
							<th>Metal Availability (M)</th>
							<th>
								Available ∆G (kJ&nbsp;mol<sup>-1</sup>)
							</th>
							<th>Occupancy</th>
						</tr>
					</thead>
					<tbody>{tableRows}</tbody>
					<tfoot>
						<tr>
							<th>Total Metalation</th>
							<td></td>
							<td></td>
							<td></td>
							<td></td>
							<th className="result">-</th>
						</tr>
					</tfoot>
				</table>
			</div>
		</div>
	);
}
