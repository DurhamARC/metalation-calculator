/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/packages/packages-block-editor/#useBlockProps
 */
import { useBlockProps } from '@wordpress/block-editor';
import { TextControl } from '@wordpress/components';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './editor.scss';
import '../include/main.css';

/**
 * Displays a mockup of the calculator and allows the user to edit the
 * availability column.
 *
 * @param {Object}   props
 * @param {Object}   props.attributes    Block attributes
 * @param {Function} props.setAttributes Block attributes setter
 *
 * @return {WPElement} Element to render.
 */
export default function Edit({ attributes, setAttributes }) {
	const metals = require('../include/metals');
	const metalDataSet = new metals.MetalDataSet();

	const onChangeValue = function (value, key) {
		const errorMsgElement = document.getElementById('msg_' + key);

		try {
			metalDataSet.metals[key].bufferedMetalConcentration = value;
			errorMsgElement.style.display = 'none';
		} catch (e) {
			let msg;
			if (e instanceof RangeError) {
				msg = e.message;
			} else {
				msg = 'Invalid value ' + value;
			}
			errorMsgElement.innerHTML = msg;
			errorMsgElement.style.display = 'block';
		}
		const newBmcVals = { ...attributes.bmcVals };
		newBmcVals[key] = value;
		setAttributes({ bmcVals: newBmcVals });
	};

	const tableRows = Object.keys(metalDataSet.metals).map((key) => (
		<tr key={key}>
			<th>{metalDataSet.metals[key].symbol}</th>
			<td>{metalDataSet.metals[key].affinity}</td>
			<td>-</td>
			<td>
				<TextControl
					value={attributes.bmcVals[key]}
					onChange={(val) => onChangeValue(val, key)}
				/>
				<p
					className="error-msg"
					id={'msg_' + key}
					style={{ display: 'none' }}
				/>
			</td>
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
