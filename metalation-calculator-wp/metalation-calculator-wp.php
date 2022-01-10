<?php
/**
 * Plugin Name:       Metalation Calculator
 * Description:       Calculator to predict metal occupancies in vivo.
 * Requires at least: 5.8
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            Alison Clarke
 * License:           MIT
 * License URI:       http://opensource.org/licenses/MIT
 * Text Domain:       metalation-calculator-wp
 *
 * @package           create-block
 */

function metalation_calculator_wp_render_callback( $block_attributes, $content ) {
  return file_get_contents( plugin_dir_path( __FILE__ ) . 'include/calculator.html' );
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
