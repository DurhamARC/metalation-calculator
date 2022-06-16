<?php
/**
 * Plugin Name:       Metalation Calculator
 * Description:       Calculator to predict metal occupancies in vivo.
 * Requires at least: 5.8
 * Requires PHP:      7.0
 * Version:           1.0.4
 * Author:            Alison Clarke
 * License:           MIT
 * License URI:       http://opensource.org/licenses/MIT
 * Text Domain:       metalation-calculator-wp
 *
 * @package           create-block
 */

function metalation_calculator_wp_render_callback( $block_attributes, $content ) {
  $id = esc_js($block_attributes['id']);
  $calculator_html = file_get_contents( plugin_dir_path( __FILE__ ) . 'include/calculator.html' );
  $json_bmc_vals = json_encode($block_attributes['bmcVals']);
  $title = apply_filters('js_escape', $block_attributes['title']);
  $imageDir = plugins_url('/include', __FILE__);
  $data = <<<EOD
<div id="$id">
  $calculator_html
</div>
<script type="text/javascript">
  window.addEventListener("DOMContentLoaded", () => {
    window.setupCalculator(
      "$id",
      "$title",
      $json_bmc_vals,
      "$imageDir"
    );
  });
</script>
EOD;
  return $data;
}

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/block-editor/tutorials/block-tutorial/writing-your-first-block-type/
 */
function create_block_metalation_calculator_wp_block_init() {
  $asset_file = include( plugin_dir_path( __FILE__ ) . 'build/index.asset.php');

  wp_register_script(
    'metalation_calculator_wp',
    plugins_url( 'build/block.js', __FILE__ ),
    $asset_file['dependencies'],
    $asset_file['version']
  );

	register_block_type( __DIR__, array(
    'render_callback' => 'metalation_calculator_wp_render_callback'
  ));
}
add_action( 'init', 'create_block_metalation_calculator_wp_block_init' );

function metalation_calculator_assets_load(){
    $metalation_css = plugins_url('/include/main.css', __FILE__);
    wp_enqueue_style('metalation_css', $metalation_css);
    $metalation_js = plugins_url('/include/bundle.js', __FILE__);
    wp_enqueue_script('metalation_js', $metalation_js);
}

add_action('enqueue_block_assets', 'metalation_calculator_assets_load');
