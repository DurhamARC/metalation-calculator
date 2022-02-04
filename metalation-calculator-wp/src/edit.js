/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/packages/packages-block-editor/#useBlockProps
 */
import { useBlockProps, RichText } from '@wordpress/block-editor';
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
	const validPartialNumber = /^\d+\.?\d*((e|E)-?\d*)?$/;

	const onChangeValue = function (value, key) {
		const errorMsgElement = document.getElementById('msg_' + key);
		let shouldUpdateValue = true;
		try {
			// Use the Metal object to determine whether value is valid
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
			// If value is invalid but looks like the start of a valid
			// expression, we save it to allow the user to continue typing
			// Otherwise we reset the value
			if (!validPartialNumber.test(value)) {
				shouldUpdateValue = false;
			}
		}
		if (shouldUpdateValue) {
			const newBmcVals = { ...attributes.bmcVals };
			newBmcVals[key] = value;
			setAttributes({ bmcVals: newBmcVals });
		}
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
				<RichText
					tagName="h3" // The tag here is the element output and editable in the admin
					value={attributes.title} // Any existing content, either from the database or an attribute default
					allowedFormats={['core/italic']} // Allow the content to be made italic, but do not allow other formatting options
					onChange={(val) => setAttributes({ title: val })} // Store updated content as a block attribute
					placeholder={'Enter title here, e.g. Idealised Salmonella'} // Display this text before any content has been added by the user
				/>
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
