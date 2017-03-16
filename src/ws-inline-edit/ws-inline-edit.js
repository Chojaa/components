import { React, Component } from '../imports';
require('./ws-inline-edit.scss');

//  props: {
//    text: 'Something'
//  }

/**
 * This class describes a Preact component which renders a inline-edit element.
 * The inline-edit component can be used everywhere in block where you want to have ability to change value.
 * As an example you can use it in div blocks, rows, tables.
 */
export class WSInlineEdit extends Component {
  /**
   * @param {Object} props Peact props
   * @constructor
   */
  constructor(props) {
    super(props);
    /**
     * @type {Object}
     */
    this.state = {
      isEditing: false,
      text: props.text
    };
  }
  /**
   * Function that show input when you click on div and focus it
   * @returns {void}
   */
  editElement() {
    if (!this.state.isEditing) {
      this.setState({isEditing: true}, () => {
        this.editEl.focus();
      });
    }
  }
  /**
   * Function that save text when click 'Enter' or cancel when click 'Escape' button
   * @param {Object} e - click event
   * @returns {Object}
   */
  keyAction(e) {
    if (e.keyCode === 13) {
      // Enter to save
      this.setState({text: e.target.value, isEditing: false});
    } else if (e.keyCode === 27) {
      // ESC to cancel
      this.setState({isEditing: false});
    }
  }
  /**
   * Function that save text when input on blur and send text value to updating function
   * @param {Object} e - click event
   * @returns {Object}
   */
  blurAction(e) {
    this.setState({text: e.target.value, isEditing: false});
    this.updating(e.target.value);
  }
  /**
   * Function that return value for outside use
   * @param {Object} text - text to show
   * @returns {Object}
   */
  updating(text) {
    this.props.onUpdate(text);
  }
  /**
   * Render the complete inline-edit component
   * @returns {Object}
   */
  render() {
    return (
      <div className="ws-inline-edit" onClick={() => this.editElement()}>
        <input
          type="text"
          className="inlineInput"
          disabled={(!this.state.isEditing) ? 'disabled' : ''}
          onBlur={e => this.blurAction(e)}
          onKeyDown={e => this.keyAction(e)}
          defaultValue={this.state.text}
          ref={(el) => this.editEl = el}
        />
      </div>
    );
  }
}
