/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview The class representing one block.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Block');

goog.require('Blockly.Blocks');
goog.require('Blockly.Comment');
goog.require('Blockly.Connection');
goog.require('Blockly.Input');
goog.require('Blockly.Mutator');
goog.require('Blockly.Warning');
goog.require('Blockly.Workspace');
goog.require('Blockly.Xml');
goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.math.Coordinate');
goog.require('goog.string');

/**
 * Class for one block.
 * Not normally called directly, workspace.newBlock() is preferred.
 * @param {!Blockly.Workspace} workspace The block's workspace.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @param {=string} opt_id Optional ID.  Use this ID if provided, otherwise
 *     create a new id.
 * @constructor
 */
Blockly.Block = function(workspace, prototypeName, opt_id) {
  /** @type {string} */
  this.id = (opt_id && !workspace.getBlockById(opt_id)) ?
      opt_id : Blockly.genUid();
  workspace.blockDB_[this.id] = this;
  /** @type {Blockly.Connection} */
  this.outputConnection = null;
  /** @type {Blockly.Connection} */
  this.nextConnection = null;
  /** @type {Blockly.Connection} */
  this.previousConnection = null;
  /** @type {!Array.<!Blockly.Input>} */
  this.inputList = [];
  /** @type {boolean|undefined} */
  this.inputsInline = undefined;
  /** @type {boolean} */
  this.disabled = false;
  /** @type {string|!Function} */
  this.tooltip = '';
  /** @type {boolean} */
  this.contextMenu = true;

  /** @type {Blockly.Block} */
  this.parentBlock_ = null;
  /** @type {!Array.<!Blockly.Block>} */
  this.childBlocks_ = [];
  /** @type {boolean} */
  this.deletable_ = true;
  /** @type {boolean} */
  this.movable_ = true;
  /** @type {boolean} */
  this.editable_ = true;
  /** @type {boolean} */
  this.isShadow_ = false;
  /** @type {boolean} */
  this.collapsed_ = false;

  /** @type {string|Blockly.Comment} */
  this.comment = null;

  /** @type {!goog.math.Coordinate} */
  this.xy_ = new goog.math.Coordinate(0, 0);

  /** @type {!Blockly.Workspace} */
  this.workspace = workspace;
  /** @type {boolean} */
  this.isInFlyout = workspace.isFlyout;
  /** @type {boolean} */
  this.RTL = workspace.RTL;

  /** @type {boolean} */
  this.isSignIcon = false;

  this.isSignIconRect = false;

  this.focusId = null;

  this.returnValue = false;

  this.returnBoolean = false;

  this.isAppendStatement = false;

  this.blockIconPath = undefined;

  this.repeatIcon = false;

  // Copy the type-specific functions and data from the prototype.
  if (prototypeName) {
    /** @type {string} */
    this.type = prototypeName;
    var prototype = Blockly.Blocks[prototypeName];
    goog.asserts.assertObject(prototype,
        'Error: "%s" is an unknown language block.', prototypeName);
    goog.mixin(this, prototype);
  }

  workspace.addTopBlock(this);

  // Call an initialization function, if it exists.
  if (goog.isFunction(this.init)) {
    this.init();
  }
  // Record initial inline state.
  /** @type {boolean|undefined} */
  this.inputsInlineDefault = this.inputsInline;

  if (Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.Create(this));
  }
  // Bind an onchange function, if it exists.
  if (goog.isFunction(this.onchange)) {
    this.onchangeWrapper_ = this.onchange.bind(this);
    this.workspace.addChangeListener(this.onchangeWrapper_);
  }
};

/**
 * Obtain a newly created block.
 * @param {!Blockly.Workspace} workspace The block's workspace.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @return {!Blockly.Block} The created block.
 * @deprecated December 2015
 */
Blockly.Block.obtain = function(workspace, prototypeName) {
  console.warn('Deprecated call to Blockly.Block.obtain, ' +
               'use workspace.newBlock instead.');
  return workspace.newBlock(prototypeName);
};

/**
 * Optional text data that round-trips beween blocks and XML.
 * Has no effect. May be used by 3rd parties for meta information.
 * @type {?string}
 */
Blockly.Block.prototype.data = null;

/**
 * Colour of the block in '#RRGGBB' format.
 * @type {string}
 * @private
 */
Blockly.Block.prototype.colour_ = '#000000';

/**
 * Dispose of this block.
 * @param {boolean} healStack If true, then try to heal any gap by connecting
 *     the next statement with the previous statement.  Otherwise, dispose of
 *     all children of this block.
 */
Blockly.Block.prototype.dispose = function(healStack) {
  // Terminate onchange event calls.
  if (this.onchangeWrapper_) {
    this.workspace.removeChangeListener(this.onchangeWrapper_);
  }
  this.unplug(healStack);
  if (Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.Delete(this));
  }
  Blockly.Events.disable();

  // This block is now at the top of the workspace.
  // Remove this block from the workspace's list of top-most blocks.
  if (this.workspace) {
    this.workspace.removeTopBlock(this);
    // Remove from block database.
    delete this.workspace.blockDB_[this.id];
    this.workspace = null;
  }

  // Just deleting this block from the DOM would result in a memory leak as
  // well as corruption of the connection database.  Therefore we must
  // methodically step through the blocks and carefully disassemble them.

  // First, dispose of all my children.
  for (var i = this.childBlocks_.length - 1; i >= 0; i--) {
    this.childBlocks_[i].dispose(false);
  }
  // Then dispose of myself.
  // Dispose of all inputs and their fields.
  for (var i = 0, input; input = this.inputList[i]; i++) {
    input.dispose();
  }
  this.inputList.length = 0;
  // Dispose of any remaining connections (next/previous/output).
  var connections = this.getConnections_(true);
  for (var i = 0; i < connections.length; i++) {
    var connection = connections[i];
    if (connection.isConnected()) {
      connection.disconnect();
    }
    connections[i].dispose();
  }
  Blockly.Events.enable();
};

/**
 * Unplug this block from its superior block.  If this block is a statement,
 * optionally reconnect the block underneath with the block on top.
 * @param {boolean} opt_healStack Disconnect child statement and reconnect
 *   stack.  Defaults to false.
 */
Blockly.Block.prototype.unplug = function(opt_healStack) {
  if (this.outputConnection) {
    if (this.outputConnection.isConnected()) {
      // Disconnect from any superior block.
      this.outputConnection.disconnect();
    }
  } else if (this.previousConnection) {
    var previousTarget = null;
    if (this.previousConnection.isConnected()) {
      // Remember the connection that any next statements need to connect to.
      previousTarget = this.previousConnection.targetConnection;
      // Detach this block from the parent's tree.
      this.previousConnection.disconnect();
    }
    var nextBlock = this.getNextBlock();
    if (opt_healStack && nextBlock) {
      // Disconnect the next statement.
      var nextTarget = this.nextConnection.targetConnection;
      nextTarget.disconnect();
      if (previousTarget && previousTarget.checkType_(nextTarget)) {
        // Attach the next statement to the previous statement.
        previousTarget.connect(nextTarget);
      }
    }
  }
};

/**
 * Returns all connections originating from this block.
 * @return {!Array.<!Blockly.Connection>} Array of connections.
 * @private
 */
Blockly.Block.prototype.getConnections_ = function() {
  var myConnections = [];
  if (this.outputConnection) {
    myConnections.push(this.outputConnection);
  }
  if (this.previousConnection) {
    myConnections.push(this.previousConnection);
  }
  if (this.nextConnection) {
    myConnections.push(this.nextConnection);
  }
  for (var i = 0, input; input = this.inputList[i]; i++) {
    if (input.connection) {
      myConnections.push(input.connection);
    }
  }
  return myConnections;
};

/**
 * Walks down a stack of blocks and finds the last next connection on the stack.
 * @return {Blockly.Connection} The last next connection on the stack, or null.
 * @private
 */
Blockly.Block.prototype.lastConnectionInStack_ = function() {
  var nextConnection = this.nextConnection;
  while (nextConnection) {
    var nextBlock = nextConnection.targetBlock();
    if (!nextBlock) {
      // Found a next connection with nothing on the other side.
      return nextConnection;
    }
    nextConnection = nextBlock.nextConnection;
  }
  // Ran out of next connections.
  return null;
};

/**
 * Bump unconnected blocks out of alignment.  Two blocks which aren't actually
 * connected should not coincidentally line up on screen.
 * @private
 */
Blockly.Block.prototype.bumpNeighbours_ = function() {
  if (!this.workspace) {
    return;  // Deleted block.
  }
  if (Blockly.dragMode_ != Blockly.DRAG_NONE) {
    return;  // Don't bump blocks during a drag.
  }
  var rootBlock = this.getRootBlock();
  if (rootBlock.isInFlyout) {
    return;  // Don't move blocks around in a flyout.
  }
  // Loop though every connection on this block.
  var myConnections = this.getConnections_(false);
  for (var i = 0, connection; connection = myConnections[i]; i++) {
    // Spider down from this block bumping all sub-blocks.
    if (connection.isConnected() && connection.isSuperior()) {
      connection.targetBlock().bumpNeighbours_();
    }

    var neighbours = connection.neighbours_(Blockly.SNAP_RADIUS);
    for (var j = 0, otherConnection; otherConnection = neighbours[j]; j++) {
      // If both connections are connected, that's probably fine.  But if
      // either one of them is unconnected, then there could be confusion.
      if (!connection.isConnected() || !otherConnection.isConnected()) {
        // Only bump blocks if they are from different tree structures.
        if (otherConnection.getSourceBlock().getRootBlock() != rootBlock) {
          // Always bump the inferior block.
          if (connection.isSuperior()) {
            otherConnection.bumpAwayFrom_(connection);
          } else {
            connection.bumpAwayFrom_(otherConnection);
          }
        }
      }
    }
  }
};

/**
 * Return the parent block or null if this block is at the top level.
 * @return {Blockly.Block} The block that holds the current block.
 */
Blockly.Block.prototype.getParent = function() {
  // Look at the DOM to see if we are nested in another block.
  return this.parentBlock_;
};

/**
 * Return the input that connects to the specified block.
 * @param {!Blockly.Block} block A block connected to an input on this block.
 * @return {Blockly.Input} The input that connects to the specified block.
 */
Blockly.Block.prototype.getInputWithBlock = function(block) {
  for (var i = 0, input; input = this.inputList[i]; i++) {
    if (input.connection && input.connection.targetBlock() == block) {
      return input;
    }
  }
  return null;
};

/**
 * Return the parent block that surrounds the current block, or null if this
 * block has no surrounding block.  A parent block might just be the previous
 * statement, whereas the surrounding block is an if statement, while loop, etc.
 * @return {Blockly.Block} The block that surrounds the current block.
 */
Blockly.Block.prototype.getSurroundParent = function() {
  var block = this;
  do {
    var prevBlock = block;
    block = block.getParent();
    if (!block) {
      // Ran off the top.
      return null;
    }
  } while (block.getNextBlock() == prevBlock);
  // This block is an enclosing parent, not just a statement in a stack.
  return block;
};

/**
 * Return the next statement block directly connected to this block.
 * @return {Blockly.Block} The next statement block or null.
 */
Blockly.Block.prototype.getNextBlock = function() {
  return this.nextConnection && this.nextConnection.targetBlock();
};

/**
 * Return the top-most block in this block's tree.
 * This will return itself if this block is at the top level.
 * @return {!Blockly.Block} The root block.
 */
Blockly.Block.prototype.getRootBlock = function() {
  var rootBlock;
  var block = this;
  do {
    rootBlock = block;
    block = rootBlock.parentBlock_;
  } while (block);
  return rootBlock;
};

/**
 * Find all the blocks that are directly nested inside this one.
 * Includes value and block inputs, as well as any following statement.
 * Excludes any connection on an output tab or any preceding statement.
 * @return {!Array.<!Blockly.Block>} Array of blocks.
 */
Blockly.Block.prototype.getChildren = function() {
  return this.childBlocks_;
};

/**
 * Set parent of this block to be a new block or null.
 * @param {Blockly.Block} newParent New parent block.
 */
Blockly.Block.prototype.setParent = function(newParent) {
  if (newParent == this.parentBlock_) {
    return;
  }
  if (this.parentBlock_) {
    // Remove this block from the old parent's child list.
    var children = this.parentBlock_.childBlocks_;
    for (var child, x = 0; child = children[x]; x++) {
      if (child == this) {
        children.splice(x, 1);
        break;
      }
    }

    // Disconnect from superior blocks.
    if (this.previousConnection && this.previousConnection.isConnected()) {
      throw 'Still connected to previous block.';
    }
    if (this.outputConnection && this.outputConnection.isConnected()) {
      throw 'Still connected to parent block.';
    }
    this.parentBlock_ = null;
    // This block hasn't actually moved on-screen, so there's no need to update
    // its connection locations.
  } else {
    // Remove this block from the workspace's list of top-most blocks.
    this.workspace.removeTopBlock(this);
  }

  this.parentBlock_ = newParent;
  if (newParent) {
    // Add this block to the new parent's child list.
    newParent.childBlocks_.push(this);
  } else {
    this.workspace.addTopBlock(this);
  }
};

/**
 * Find all the blocks that are directly or indirectly nested inside this one.
 * Includes this block in the list.
 * Includes value and block inputs, as well as any following statements.
 * Excludes any connection on an output tab or any preceding statements.
 * @return {!Array.<!Blockly.Block>} Flattened array of blocks.
 */
Blockly.Block.prototype.getDescendants = function() {
  var blocks = [this];
  for (var child, x = 0; child = this.childBlocks_[x]; x++) {
    blocks.push.apply(blocks, child.getDescendants());
  }
  return blocks;
};

/**
 * Get whether this block is deletable or not.
 * @return {boolean} True if deletable.
 */
Blockly.Block.prototype.isDeletable = function() {
  return this.deletable_ && !this.isShadow_ &&
      !(this.workspace && this.workspace.options.readOnly);
};

/**
 * Set whether this block is deletable or not.
 * @param {boolean} deletable True if deletable.
 */
Blockly.Block.prototype.setDeletable = function(deletable) {
  this.deletable_ = deletable;
};

/**
 * Get whether this block is movable or not.
 * @return {boolean} True if movable.
 */
Blockly.Block.prototype.isMovable = function() {
  return this.movable_ && !this.isShadow_ &&
      !(this.workspace && this.workspace.options.readOnly);
};

/**
 * Set whether this block is movable or not.
 * @param {boolean} movable True if movable.
 */
Blockly.Block.prototype.setMovable = function(movable) {
  this.movable_ = movable;
};

/**
 * Get whether this block is a shadow block or not.
 * @return {boolean} True if a shadow.
 */
Blockly.Block.prototype.isShadow = function() {
  return this.isShadow_;
};

/**
 * Set whether this block is a shadow block or not.
 * @param {boolean} shadow True if a shadow.
 */
Blockly.Block.prototype.setShadow = function(shadow) {
  this.isShadow_ = shadow;
};

/**
 * Get whether this block is editable or not.
 * @return {boolean} True if editable.
 */
Blockly.Block.prototype.isEditable = function() {
  return this.editable_ && !(this.workspace && this.workspace.options.readOnly);
};

/**
 * Set whether this block is editable or not.
 * @param {boolean} editable True if editable.
 */
Blockly.Block.prototype.setEditable = function(editable) {
  this.editable_ = editable;
  for (var i = 0, input; input = this.inputList[i]; i++) {
    for (var j = 0, field; field = input.fieldRow[j]; j++) {
      field.updateEditable();
    }
  }
};

/**
 * Set whether the connections are hidden (not tracked in a database) or not.
 * Recursively walk down all child blocks (except collapsed blocks).
 * @param {boolean} hidden True if connections are hidden.
 */
Blockly.Block.prototype.setConnectionsHidden = function(hidden) {
  if (!hidden && this.isCollapsed()) {
    if (this.outputConnection) {
      this.outputConnection.setHidden(hidden);
    }
    if (this.previousConnection) {
      this.previousConnection.setHidden(hidden);
    }
    if (this.nextConnection) {
      this.nextConnection.setHidden(hidden);
      var child = this.nextConnection.targetBlock();
      if (child) {
        child.setConnectionsHidden(hidden);
      }
    }
  } else {
    var myConnections = this.getConnections_(true);
    for (var i = 0, connection; connection = myConnections[i]; i++) {
      connection.setHidden(hidden);
      if (connection.isSuperior()) {
        var child = connection.targetBlock();
        if (child) {
          child.setConnectionsHidden(hidden);
        }
      }
    }
  }
};

/**
 * Set the URL of this block's help page.
 * @param {string|Function} url URL string for block help, or function that
 *     returns a URL.  Null for no help.
 */
Blockly.Block.prototype.setHelpUrl = function(url) {
  this.helpUrl = url;
};

/**
 * Change the tooltip text for a block.
 * @param {string|!Function} newTip Text for tooltip or a parent element to
 *     link to for its tooltip.  May be a function that returns a string.
 */
Blockly.Block.prototype.setTooltip = function(newTip) {
  this.tooltip = newTip;
};

/**
 * Get the colour of a block.
 * @return {string} #RRGGBB string.
 */
Blockly.Block.prototype.getColour = function() {
  return this.colour_;
};

/**
 * Change the colour of a block.
 * @param {number|string} colour HSV hue value, or #RRGGBB string.
 */
Blockly.Block.prototype.setColour = function(colour) {
  var hue = parseFloat(colour);
  if (!isNaN(hue)) {
    this.colour_ = Blockly.hueToRgb(hue);
  } else if (goog.isString(colour) && colour.match(/^#[0-9a-fA-F]{6}$/)) {
    this.colour_ = colour;
  } else {
    throw 'Invalid colour: ' + colour;
  }
};

/**
 * Returns the named field from a block.
 * @param {string} name The name of the field.
 * @return {Blockly.Field} Named field, or null if field does not exist.
 */
Blockly.Block.prototype.getField = function(name) {
  for (var i = 0, input; input = this.inputList[i]; i++) {
    for (var j = 0, field; field = input.fieldRow[j]; j++) {
      if (field.name === name) {
        return field;
      }
    }
  }
  return null;
};

/**
 * Return all variables referenced by this block.
 * @return {!Array.<string>} List of variable names.
 */
Blockly.Block.prototype.getVars = function() {
  var vars = [];
  for (var i = 0, input; input = this.inputList[i]; i++) {
    for (var j = 0, field; field = input.fieldRow[j]; j++) {
      if (field instanceof Blockly.FieldVariable) {
        vars.push(field.getValue());
      }
    }
  }
  return vars;
};

/**
 * Notification that a variable is renaming.
 * If the name matches one of this block's variables, rename it.
 * @param {string} oldName Previous name of variable.
 * @param {string} newName Renamed variable.
 */
Blockly.Block.prototype.renameVar = function(oldName, newName) {
  for (var i = 0, input; input = this.inputList[i]; i++) {
    for (var j = 0, field; field = input.fieldRow[j]; j++) {
      if (field instanceof Blockly.FieldVariable &&
          Blockly.Names.equals(oldName, field.getValue())) {
        field.setValue(newName);
      }
    }
  }
};

/**
 * Returns the language-neutral value from the field of a block.
 * @param {string} name The name of the field.
 * @return {?string} Value from the field or null if field does not exist.
 */
Blockly.Block.prototype.getFieldValue = function(name) {
  var field = this.getField(name);
  if (field) {
    return field.getValue();
  }
  return null;
};

/**
 * Returns the language-neutral value from the field of a block.
 * @param {string} name The name of the field.
 * @return {?string} Value from the field or null if field does not exist.
 * @deprecated December 2013
 */
Blockly.Block.prototype.getTitleValue = function(name) {
  console.warn('Deprecated call to getTitleValue, use getFieldValue instead.');
  return this.getFieldValue(name);
};

/**
 * Change the field value for a block (e.g. 'CHOOSE' or 'REMOVE').
 * @param {string} newValue Value to be the new field.
 * @param {string} name The name of the field.
 */
Blockly.Block.prototype.setFieldValue = function(newValue, name) {
  var field = this.getField(name);
  goog.asserts.assertObject(field, 'Field "%s" not found.', name);
  field.setValue(newValue);
};

/**
 * Change the field value for a block (e.g. 'CHOOSE' or 'REMOVE').
 * @param {string} newValue Value to be the new field.
 * @param {string} name The name of the field.
 * @deprecated December 2013
 */
Blockly.Block.prototype.setTitleValue = function(newValue, name) {
  console.warn('Deprecated call to setTitleValue, use setFieldValue instead.');
  this.setFieldValue(newValue, name);
};

Blockly.Block.prototype.setFocusId = function(focusId) {
  this.focusId = focusId;
}

/**
 * Set whether this block can chain onto the bottom of another block.
 * @param {boolean} newBoolean True if there can be a previous statement.
 * @param {string|Array.<string>|null|undefined} opt_check Statement type or
 *     list of statement types.  Null/undefined if any type could be connected.
 */
Blockly.Block.prototype.setPreviousStatement = function(newBoolean, opt_check) {
  if (newBoolean) {
    if (opt_check === undefined) {
      opt_check = null;
    }
    if (!this.previousConnection) {
      goog.asserts.assert(!this.outputConnection,
          'Remove output connection prior to adding previous connection.');
      this.previousConnection =
          new Blockly.Connection(this, Blockly.PREVIOUS_STATEMENT);
    }
    this.previousConnection.setCheck(opt_check);
  } else {
    if (this.previousConnection) {
      goog.asserts.assert(!this.previousConnection.isConnected(),
          'Must disconnect previous statement before removing connection.');
      this.previousConnection.dispose();
      this.previousConnection = null;
    }
  }
};

/**
 * Set whether another block can chain onto the bottom of this block.
 * @param {boolean} newBoolean True if there can be a next statement.
 * @param {string|Array.<string>|null|undefined} opt_check Statement type or
 *     list of statement types.  Null/undefined if any type could be connected.
 */
Blockly.Block.prototype.setNextStatement = function(newBoolean, opt_check) {
  if (newBoolean) {
    if (opt_check === undefined) {
      opt_check = null;
    }
    if (!this.nextConnection) {
      this.nextConnection =
          new Blockly.Connection(this, Blockly.NEXT_STATEMENT);
    }
    this.nextConnection.setCheck(opt_check);
  } else {
    if (this.nextConnection) {
      goog.asserts.assert(!this.nextConnection.isConnected(),
          'Must disconnect next statement before removing connection.');
      this.nextConnection.dispose();
      this.nextConnection = null;
    }
  }
};

/**
 * Set whether this block returns a value.
 * @param {boolean} newBoolean True if there is an output.
 * @param {string|Array.<string>|null|undefined} opt_check Returned type or list
 *     of returned types.  Null or undefined if any type could be returned
 *     (e.g. variable get).
 */
Blockly.Block.prototype.setOutput = function(newBoolean, opt_check) {
  if (newBoolean) {
    if (opt_check === undefined) {
      opt_check = null;
    }
    if (!this.outputConnection) {
      goog.asserts.assert(!this.previousConnection,
          'Remove previous connection prior to adding output connection.');
      this.outputConnection =
          new Blockly.Connection(this, Blockly.OUTPUT_VALUE);
    }
    this.outputConnection.setCheck(opt_check);
  } else {
    if (this.outputConnection) {
      goog.asserts.assert(!this.outputConnection.isConnected(),
          'Must disconnect output value before removing connection.');
      this.outputConnection.dispose();
      this.outputConnection = null;
    }
  }
};

/**
 * Set whether value inputs are arranged horizontally or vertically.
 * @param {boolean} newBoolean True if inputs are horizontal.
 */
Blockly.Block.prototype.setInputsInline = function(newBoolean) {
  if (this.inputsInline != newBoolean) {
    Blockly.Events.fire(new Blockly.Events.Change(
        this, 'inline', null, this.inputsInline, newBoolean));
    this.inputsInline = newBoolean;
  }
};

/**
 * Get whether value inputs are arranged horizontally or vertically.
 * @return {boolean} True if inputs are horizontal.
 */
Blockly.Block.prototype.getInputsInline = function() {
  if (this.inputsInline != undefined) {
    // Set explicitly.
    return this.inputsInline;
  }
  // Not defined explicitly.  Figure out what would look best.
  for (var i = 1; i < this.inputList.length; i++) {
    if (this.inputList[i - 1].type == Blockly.DUMMY_INPUT &&
        this.inputList[i].type == Blockly.DUMMY_INPUT) {
      // Two dummy inputs in a row.  Don't inline them.
      return false;
    }
  }
  for (var i = 1; i < this.inputList.length; i++) {
    if (this.inputList[i - 1].type == Blockly.INPUT_VALUE &&
        this.inputList[i].type == Blockly.DUMMY_INPUT) {
      // Dummy input after a value input.  Inline them.
      return true;
    }
  }
  return false;
};

/**
 * Set whether the block is disabled or not.
 * @param {boolean} disabled True if disabled.
 */
Blockly.Block.prototype.setDisabled = function(disabled) {
  if (this.disabled != disabled) {
    Blockly.Events.fire(new Blockly.Events.Change(
        this, 'disabled', null, this.disabled, disabled));
    this.disabled = disabled;
  }
};

/**
 * Get whether the block is disabled or not due to parents.
 * The block's own disabled property is not considered.
 * @return {boolean} True if disabled.
 */
Blockly.Block.prototype.getInheritedDisabled = function() {
  var block = this;
  while (true) {
    block = block.getSurroundParent();
    if (!block) {
      // Ran off the top.
      return false;
    } else if (block.disabled) {
      return true;
    }
  }
};

/**
 * Get whether the block is collapsed or not.
 * @return {boolean} True if collapsed.
 */
Blockly.Block.prototype.isCollapsed = function() {
  return this.collapsed_;
};

/**
 * Set whether the block is collapsed or not.
 * @param {boolean} collapsed True if collapsed.
 */
Blockly.Block.prototype.setCollapsed = function(collapsed) {
  if (this.collapsed_ != collapsed) {
    Blockly.Events.fire(new Blockly.Events.Change(
        this, 'collapsed', null, this.collapsed_, collapsed));
    this.collapsed_ = collapsed;
  }
};

/**
 * Create a human-readable text representation of this block and any children.
 * @param {number=} opt_maxLength Truncate the string to this length.
 * @return {string} Text of block.
 */
Blockly.Block.prototype.toString = function(opt_maxLength) {
  var text = [];
  if (this.collapsed_) {
    text.push(this.getInput('_TEMP_COLLAPSED_INPUT').fieldRow[0].text_);
  } else {
    for (var i = 0, input; input = this.inputList[i]; i++) {
      for (var j = 0, field; field = input.fieldRow[j]; j++) {
        text.push(field.getText());
      }
      if (input.connection) {
        var child = input.connection.targetBlock();
        if (child) {
          text.push(child.toString());
        } else {
          text.push('?');
        }
      }
    }
  }
  text = goog.string.trim(text.join(' ')) || '???';
  if (opt_maxLength) {
    // TODO: Improve truncation so that text from this block is given priority.
    // E.g. "1+2+3+4+5+6+7+8+9=0" should be "...6+7+8+9=0", not "1+2+3+4+5...".
    // E.g. "1+2+3+4+5=6+7+8+9+0" should be "...4+5=6+7...".
    text = goog.string.truncate(text, opt_maxLength);
  }
  return text;
};

/**
 * Shortcut for appending a value input row.
 * @param {string} name Language-neutral identifier which may used to find this
 *     input again.  Should be unique to this block.
 * @return {!Blockly.Input} The input object created.
 */
Blockly.Block.prototype.appendValueInput = function(name) {
  return this.appendInput_(Blockly.INPUT_VALUE, name);
};

/**
 * Shortcut for appending a statement input row.
 * @param {string} name Language-neutral identifier which may used to find this
 *     input again.  Should be unique to this block.
 * @return {!Blockly.Input} The input object created.
 */
Blockly.Block.prototype.appendStatementInput = function(name) {
  this.isAppendStatement = true;
  return this.appendInput_(Blockly.NEXT_STATEMENT, name);
};

/**
 * Shortcut for appending a dummy input row.
 * @param {string=} opt_name Language-neutral identifier which may used to find
 *     this input again.  Should be unique to this block.
 * @return {!Blockly.Input} The input object created.
 */
Blockly.Block.prototype.appendDummyInput = function(opt_name) {
  return this.appendInput_(Blockly.DUMMY_INPUT, opt_name || '');
};

/**
 * Initialize this block using a cross-platform, internationalization-friendly
 * JSON description.
 * @param {!Object} json Structured data describing the block.
 */
Blockly.Block.prototype.jsonInit = function(json) {
  // Validate inputs.
  goog.asserts.assert(json['output'] == undefined ||
      json['previousStatement'] == undefined,
      'Must not have both an output and a previousStatement.');

  // Set basic properties of block.
  if (json['colour'] !== undefined) {
    this.setColour(json['colour']);
  }
  // Interpolate the message blocks.
  var i = 0;
  while (json['message' + i] !== undefined) {
    this.interpolate_(json['message' + i], json['args' + i] || [],
        json['lastDummyAlign' + i]);
    i++;
  }

  if (json['inputsInline'] !== undefined) {
    this.setInputsInline(json['inputsInline']);
  }
  // Set output and previous/next connections.
  if (json['output'] !== undefined) {
    this.setOutput(true, json['output']);
  }
  if (json['previousStatement'] !== undefined) {
    this.setPreviousStatement(true, json['previousStatement']);
  }
  if (json['nextStatement'] !== undefined) {
    this.setNextStatement(true, json['nextStatement']);
  }
  if (json['tooltip'] !== undefined) {
    this.setTooltip(json['tooltip']);
  }
  if (json['helpUrl'] !== undefined) {
    this.setHelpUrl(json['helpUrl']);
  }
  if (json['signicon'] !== undefined) {
    this.setSignIcon(json['signicon']);
  }
};

/**
 * Interpolate a message description onto the block.
 * @param {string} message Text contains interpolation tokens (%1, %2, ...)
 *     that match with fields or inputs defined in the args array.
 * @param {!Array} args Array of arguments to be interpolated.
 * @param {=string} lastDummyAlign If a dummy input is added at the end,
 *     how should it be aligned?
 * @private
 */
Blockly.Block.prototype.interpolate_ = function(message, args, lastDummyAlign) {
  var tokens = Blockly.tokenizeInterpolation(message);
  // Interpolate the arguments.  Build a list of elements.
  var indexDup = [];
  var indexCount = 0;
  var elements = [];
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i];
    if (typeof token == 'number') {
      goog.asserts.assert(token > 0 && token <= args.length,
          'Message index "%s" out of range.', token);
      goog.asserts.assert(!indexDup[token],
          'Message index "%s" duplicated.', token);
      indexDup[token] = true;
      indexCount++;
      elements.push(args[token - 1]);
    } else {
      token = token.trim();
      if (token) {
        elements.push(token);
      }
    }
  }
  goog.asserts.assert(indexCount == args.length,
      'Message does not reference all %s arg(s).', args.length);
  // Add last dummy input if needed.
  if (elements.length && (typeof elements[elements.length - 1] == 'string' ||
      elements[elements.length - 1]['type'].indexOf('field_') == 0)) {
    var input = {type: 'input_dummy'};
    if (lastDummyAlign) {
      input['align'] = lastDummyAlign;
    }
    elements.push(input);
  }
  // Lookup of alignment constants.
  var alignmentLookup = {
    'LEFT': Blockly.ALIGN_LEFT,
    'RIGHT': Blockly.ALIGN_RIGHT,
    'CENTRE': Blockly.ALIGN_CENTRE
  };
  // Populate block with inputs and fields.
  var fieldStack = [];
  for (var i = 0; i < elements.length; i++) {
    var element = elements[i];
    if (typeof element == 'string') {
      fieldStack.push([element, undefined]);
    } else {
      var field = null;
      var input = null;
      do {
        var altRepeat = false;
        switch (element['type']) {
          case 'input_value':
            input = this.appendValueInput(element['name']);
            break;
          case 'input_statement':
            input = this.appendStatementInput(element['name']);
            break;
          case 'input_dummy':
            input = this.appendDummyInput(element['name']);
            break;
          case 'field_label':
            field = new Blockly.FieldLabel(element['text'], element['class']);
            break;
          case 'field_input':
            field = new Blockly.FieldTextInput(element['text']);
            if (typeof element['spellcheck'] == 'boolean') {
              field.setSpellcheck(element['spellcheck']);
            }
            break;
          case 'field_angle':
            field = new Blockly.FieldAngle(element['angle']);
            break;
          case 'field_checkbox':
            field = new Blockly.FieldCheckbox(
                element['checked'] ? 'TRUE' : 'FALSE');
            break;
          case 'field_colour':
            field = new Blockly.FieldColour(element['colour']);
            break;
          case 'field_variable':
            field = new Blockly.FieldVariable(element['variable']);
            break;
          case 'field_dropdown':
            field = new Blockly.FieldDropdown(element['options']);
            break;
          case 'field_image':
            field = new Blockly.FieldImage(element['src'],
                element['width'], element['height'], element['alt']);
            break;
          case 'field_date':
            if (Blockly.FieldDate) {
              field = new Blockly.FieldDate(element['date']);
              break;
            }
            // Fall through if FieldDate is not compiled in.
          default:
            // Unknown field.
            if (element['alt']) {
              element = element['alt'];
              altRepeat = true;
            }
        }
      } while (altRepeat);
      if (field) {
        fieldStack.push([field, element['name']]);
      } else if (input) {
        if (element['check']) {
          input.setCheck(element['check']);
        }
        if (element['align']) {
          input.setAlign(alignmentLookup[element['align']]);
        }
        for (var j = 0; j < fieldStack.length; j++) {
          input.appendField(fieldStack[j][0], fieldStack[j][1]);
        }
        fieldStack.length = 0;
      }
    }
  }
};

/**
 * Add a value input, statement input or local variable to this block.
 * @param {number} type Either Blockly.INPUT_VALUE or Blockly.NEXT_STATEMENT or
 *     Blockly.DUMMY_INPUT.
 * @param {string} name Language-neutral identifier which may used to find this
 *     input again.  Should be unique to this block.
 * @return {!Blockly.Input} The input object created.
 * @private
 */
Blockly.Block.prototype.appendInput_ = function(type, name) {
  var connection = null;
  if (type == Blockly.INPUT_VALUE || type == Blockly.NEXT_STATEMENT) {
    connection = new Blockly.Connection(this, type);
  }
  var input = new Blockly.Input(type, name, this, connection);
  // Append input to list.
  this.inputList.push(input);
  return input;
};

/**
 * Move a named input to a different location on this block.
 * @param {string} name The name of the input to move.
 * @param {?string} refName Name of input that should be after the moved input,
 *   or null to be the input at the end.
 */
Blockly.Block.prototype.moveInputBefore = function(name, refName) {
  if (name == refName) {
    return;
  }
  // Find both inputs.
  var inputIndex = -1;
  var refIndex = refName ? -1 : this.inputList.length;
  for (var i = 0, input; input = this.inputList[i]; i++) {
    if (input.name == name) {
      inputIndex = i;
      if (refIndex != -1) {
        break;
      }
    } else if (refName && input.name == refName) {
      refIndex = i;
      if (inputIndex != -1) {
        break;
      }
    }
  }
  goog.asserts.assert(inputIndex != -1, 'Named input "%s" not found.', name);
  goog.asserts.assert(refIndex != -1, 'Reference input "%s" not found.',
                      refName);
  this.moveNumberedInputBefore(inputIndex, refIndex);
};

/**
 * Move a numbered input to a different location on this block.
 * @param {number} inputIndex Index of the input to move.
 * @param {number} refIndex Index of input that should be after the moved input.
 */
Blockly.Block.prototype.moveNumberedInputBefore = function(
    inputIndex, refIndex) {
  // Validate arguments.
  goog.asserts.assert(inputIndex != refIndex, 'Can\'t move input to itself.');
  goog.asserts.assert(inputIndex < this.inputList.length,
                      'Input index ' + inputIndex + ' out of bounds.');
  goog.asserts.assert(refIndex <= this.inputList.length,
                      'Reference input ' + refIndex + ' out of bounds.');
  // Remove input.
  var input = this.inputList[inputIndex];
  this.inputList.splice(inputIndex, 1);
  if (inputIndex < refIndex) {
    refIndex--;
  }
  // Reinsert input.
  this.inputList.splice(refIndex, 0, input);
};

/**
 * Remove an input from this block.
 * @param {string} name The name of the input.
 * @param {boolean=} opt_quiet True to prevent error if input is not present.
 * @throws {goog.asserts.AssertionError} if the input is not present and
 *     opt_quiet is not true.
 */
Blockly.Block.prototype.removeInput = function(name, opt_quiet) {
  for (var i = 0, input; input = this.inputList[i]; i++) {
    if (input.name == name) {
      if (input.connection && input.connection.isConnected()) {
        input.connection.setShadowDom(null);
        var block = input.connection.targetBlock();
        if (block.isShadow()) {
          // Destroy any attached shadow block.
          block.dispose();
        } else {
          // Disconnect any attached normal block.
          block.unplug();
        }
      }
      input.dispose();
      this.inputList.splice(i, 1);
      return;
    }
  }
  if (!opt_quiet) {
    goog.asserts.fail('Input "%s" not found.', name);
  }
};

/**
 * Fetches the named input object.
 * @param {string} name The name of the input.
 * @return {Blockly.Input} The input object, or null if input does not exist.
 */
Blockly.Block.prototype.getInput = function(name) {
  for (var i = 0, input; input = this.inputList[i]; i++) {
    if (input.name == name) {
      return input;
    }
  }
  // This input does not exist.
  return null;
};

/**
 * Fetches the block attached to the named input.
 * @param {string} name The name of the input.
 * @return {Blockly.Block} The attached value block, or null if the input is
 *     either disconnected or if the input does not exist.
 */
Blockly.Block.prototype.getInputTargetBlock = function(name) {
  var input = this.getInput(name);
  return input && input.connection && input.connection.targetBlock();
};

/**
 * Returns the comment on this block (or '' if none).
 * @return {string} Block's comment.
 */
Blockly.Block.prototype.getCommentText = function() {
  return this.comment || '';
};

/**
 * Set this block's comment text.
 * @param {?string} text The text, or null to delete.
 */
Blockly.Block.prototype.setCommentText = function(text) {
  if (this.comment != text) {
    Blockly.Events.fire(new Blockly.Events.Change(
        this, 'comment', null, this.comment, text || ''));
    this.comment = text;
  }
};

/**
 * Set this block's warning text.
 * @param {?string} text The text, or null to delete.
 */
Blockly.Block.prototype.setWarningText = function(text) {
  // NOP.
};

/**
 * Give this block a mutator dialog.
 * @param {Blockly.Mutator} mutator A mutator dialog instance or null to remove.
 */
Blockly.Block.prototype.setMutator = function(mutator) {
  // NOP.
};

/**
 * Return the coordinates of the top-left corner of this block relative to the
 * drawing surface's origin (0,0).
 * @return {!goog.math.Coordinate} Object with .x and .y properties.
 */
Blockly.Block.prototype.getRelativeToSurfaceXY = function() {
  return this.xy_;
};

/**
 * Move a block by a relative offset.
 * @param {number} dx Horizontal offset.
 * @param {number} dy Vertical offset.
 */
Blockly.Block.prototype.moveBy = function(dx, dy) {
  goog.asserts.assert(!this.parentBlock_, 'Block has parent.');
  var event = new Blockly.Events.Move(this);
  this.xy_.translate(dx, dy);
  event.recordNew();
  Blockly.Events.fire(event);
};

Blockly.Block.prototype.setSignIcon = function(type) {
  if(type == Blockly.SIGN_CIRCLE) {
    this.signicon_circle = true;
  }
  else if(type == Blockly.SIGN_RECT) {
    this.signicon_rect = true;
  }
}

Blockly.Block.BT_BASIC = 1;
Blockly.Block.BT_EVENT = 2;
Blockly.Block.BT_CONTROL = 3;
Blockly.Block.BT_NUMBER = 4;
Blockly.Block.BT_BOOLEAN= 5;


Blockly.Block.prototype.setBlockIcon = function(type) {
  var cssType = 0;

  switch (type) {
    case "moveUp" :
    case "moveRight" :
    case "moveDown" : 
    case "moveLeft" :
    case "move_to_point" :
    case "move_look_point" :
    case "move_look_dir" :
    case "move_turnLeft" :
    case "move_turnRight" :
    case "jump" :
      cssType = "move";
      this.blockPathType = Blockly.Block.BT_BASIC;
      break;
    case "start_block" :
    case "event_click" :
    case "event_background_change" :
    case "event_onclick_key" : 
    case "event_onclick_object" : 
    case "event_number_lt" :
    case "event_message" :
      cssType = "event";
      this.blockPathType = Blockly.Block.BT_EVENT;
      break;
    case "repeat" :
    case "ifControl" :
      cssType = "control";
      this.blockPathType = Blockly.Block.BT_CONTROL;
      break;
    case "math_number" :
      cssType = "inputNumber";
    case "math_wrapper" : 
      this.blockPathType = Blockly.Block.BT_NUMBER;
      break;
    case "logic_boolean" :
    case "logic_dump" :
      cssType = "logic_boolean";
    case "logic_wrapper" : 
      this.blockPathType = Blockly.Block.BT_BOOLEAN;
      break;
  }


  this.blockIconPath_back = null;
  this.blockIconPath = Blockly.Block.blockSvgData_[type];

  if (type == "repeat") {
    this.repeatIcon = true;
    this.blockIconBottomPath = Blockly.Block.blockSvgData_bottom_[type];
    this.blockIconBottomCss = Blockly.Block.blockIconCss_Bottom_[type];
  }

  this.blockIconCss = Blockly.Block.blockIconCss_[cssType];
  this.blockPathCss = Blockly.Block.blockPathCss_[cssType];
  
  this.blockIconCss_back = null;  

  if (type == "event_background_change" ||
    type == "logic_dump" ||
    type == "event_message") {
    this.blockIconPath_back = Blockly.Block.blockSvgData_back_[type];
    this.blockIconCss_back = Blockly.Block.blockIconCss_back_[type];
  }

  this.blockIconSub = null;

  if (type == "event_onclick_object") {
    this.blockIconSub = Blockly.Block.blockIconSub_[type];
  }

  this.icon_filter = null;

  if (type == "event_background_change" || type == "event_onclick_key") {
    this.icon_filter = "icon_filter_red";
  }

  if (type == "logic_dump") {
    this.icon_filter = "icon_filter"
  }  

  this.iconCircleData = null;
  if (cssType == "move" || cssType == "event") {
    this.iconCircleData = Blockly.Block.iconCircleData_["basic"];
  } else if (cssType == "control") {
    this.iconCircleData = Blockly.Block.iconCircleData_["control"];    
  }

  if (type == "ifControl") {
    this.iconRectData = Blockly.Block.iconRectData_[cssType];
  }
  if (type == "logic_dump") {
    this.rectBasicIcon = true;
    this.iconRectData = Blockly.Block.iconRectData_["rect_basic"];
  }

};

Blockly.Block.blockSvgData_ = {
  "moveUp" : "m21.686,15.71997 a1,1 0 0 1 -1.423,0l-3.263,-3.271v10.56702a0.985,0.985 0 0 1 -0.98401,0.98401h-0.03198a0.985,0.985 0 0 1 -0.98401,-0.98401v-10.60004l-3.29401,3.29999a1.008,1.008 0 0 1 -1.42398,-1.427l4.98199,-4.99396a1.03,1.03 0 0 1 1.44098,0l4.98102,4.99396a1.009,1.009 0 0 1 0,1.43103z",
  "moveRight" :"m23.70001, 16.70502 l-4.99399,4.98102a1.008,1.008 0 0 1 -1.427,-1.42303l3.27197,-3.263h-10.55099a1,1 0 0 1 -1,-1v0a1,1 0 0 1 1,-1h10.586l-3.29999,-3.29401a1.008,1.008 0 0 1 1.427,-1.42401l4.99399,4.98199a1.03,1.03 0 0 1 -0.00699,1.44104z",
  "moveDown" : "m21.686,17.28003 a1.012,1.012 0 0 0 -1.423,0l-3.263,3.26996v-10.56598a0.985,0.985 0 0 0 -0.98401,-0.98401h-0.03198a0.985,0.985 0 0 0 -0.98401,0.98401v10.59998l-3.29401,-3.29999a1.009,1.009 0 0 0 -1.42398,1.42999l4.98199,4.98999a1.04,1.04 0 0 0 1.44098,0l4.98102,-4.98999a1.013,1.013 0 0 0 0,-1.43396z",
  "moveLeft" : "m8.29999, 16.70502 l4.99399,4.98102a1.008,1.008 0 1 0 1.427,-1.42303l-3.27197,-3.263h10.55099a1,1 0 0 0 1,-1v0a1,1 0 0 0 -1,-1h-10.58301l3.29999,-3.29401a1.008,1.008 0 0 0 -1.427,-1.42401l-4.99399,4.98199a1.03,1.03 0 0 0 0.004,1.44104z",
  "move_to_point" : "m21.15701,16.02002 l0.02399,0.01001l-4.259,7.37h-0.008a1,1 0 0 1 -1.828,0h-0.008l-4.259,-7.37l0.02402,-0.01001a5.935,5.935 0 0 1 -0.84302,-3.02002a6,6 0 0 1 12,0a5.935,5.935 0 0 1 -0.84299,3.02002zm-5.15701,-5.02002a2,2 0 1 0 2,2a2,2 0 0 0 -2,-2z",
  "move_look_point" : "m24.724,16.71997 c-1.33099,1.56006 -4.72,5.28003 -8.742,5.28003s-7.43399,-3.65002 -8.72998,-5.26001a1.146,1.146 0 0 1 -0.039,-1.43005c1.16599,-1.66992 4.71799,-5.30994 8.76898,-5.30994c4.03,0 7.418,3.73999 8.74899,5.28992a1.126,1.126 0 0 1 -0.00699,1.43005zm-8.724,-4.71997a4,4 0 1 0 4,4a4,4 0 0 0 -4,-4zm0,6a2,2 0 1 1 2,-2a2,2 0 0 1 -2,2z", 
  "move_look_dir" : "m24.724,16.71997 c-1.33099,1.56006 -4.72,5.28003 -8.742,5.28003s-7.43399,-3.65002 -8.72998,-5.26001a1.146,1.146 0 0 1 -0.039,-1.43005c1.16599,-1.66992 4.71799,-5.30994 8.76898,-5.30994c4.03,0 7.418,3.73999 8.74899,5.28992a1.126,1.126 0 0 1 -0.00699,1.43005zm-8.724,-4.71997a4,4 0 1 0 4,4a4,4 0 0 0 -4,-4zm0,6a2,2 0 1 1 2,-2a2,2 0 0 1 -2,2z",
  "move_turnLeft" : "m16,23 a1,1 0 0 1 0,-2a5,5 0 1 0 -4.89999,-6.01001h1.57001a0.327,0.327 0 0 1 0.28699,0.5c-0.116,0.19995 -2.46399,3.01001 -2.664,3.34998a0.341,0.341 0 0 1 -0.57901,0c-0.147,-0.25 -2.50699,-3.06995 -2.67099,-3.35999a0.324,0.324 0 0 1 0.28601,-0.48999h1.771a6.987,6.987 0 1 1 6.89999,8.01001z",
  "move_turnRight" : "m24.95599,15.479989 c-0.164,0.29004 -2.52402,3.10999 -2.67099,3.35999a0.341,0.341 0 0 1 -0.57901,0c-0.20001,-0.33997 -2.548,-3.15002 -2.664,-3.34998a0.327,0.327 0 0 1 0.28699,-0.5h1.57001a5,5 0 1 0 -4.89899,6.01001a1,1 0 0 1 0,2a7,7 0 1 1 6.89999,-8.01001h1.771a0.324,0.324 0 0 1 0.285,0.48999z",
  "jump" : "M23.686,19.738 l-2.981,2.994a1.03,1.03,0,0,1-1.441,0l-2.981-2.994a1.008,1.008,0,1,1,1.423-1.427L19,19.611V14a3,3,0,0,0-6,0,1,1,0,0,1-2,0,5,5,0,0,1,10,0v5.58l1.263-1.269A1.008,1.008,0,1,1,23.686,19.738ZM12,17a1,1,0,1,1-1,1A1,1,0,0,1,12,17Zm0,4a1,1,0,1,1-1,1A1,1,0,0,1,12,21Z",
  "start_block" : "M20.642,16.846L14.96,21.624a1.109,1.109,0,0,1-1.624,0,1.225,1.225,0,0,1-.318-0.95V11.289a1.225,1.225,0,0,1,.318-0.95,1.109,1.109,0,0,1,1.624,0l5.682,4.778A1.285,1.285,0,0,1,20.642,16.846Z",
  "event_click" : "M20.642,16.846L14.96,21.624a1.109,1.109,0,0,1-1.624,0,1.225,1.225,0,0,1-.318-0.95V11.289a1.225,1.225,0,0,1,.318-0.95,1.109,1.109,0,0,1,1.624,0l5.682,4.778A1.285,1.285,0,0,1,20.642,16.846Z",
  "event_background_change" : "m17,13a2,2 0 1 1 2,-2a2,2 0 0 1 -2,2zm-9.01,9.01099l5.5,-8l5.5,8h-11l0,0z",
  "event_onclick_key" : "m23,22h-14a2,2 0 0 1 -2,-2v-8a2,2 0 0 1 2,-2h14a2,2 0 0 1 2,2v8a2,2 0 0 1 -2,2zm-12,-10h-2v2h2v-2l0,0zm0,3h-2v2h2v-2l0,0zm0,5h10v-2h-10v2l0,0zm3,-8h-2v2h2v-2l0,0zm0,3h-2v2h2v-2l0,0zm3,-3h-2v2h2v-2l0,0zm0,3h-2v2h2v-2l0,0zm3,-3h-2v2h2v-2l0,0zm0,3h-2v2h2v-2l0,0zm3,-3h-2v2h2v-2l0,0zm0,3h-2v2h2v-2l0,0z",
  "event_onclick_object" : "m16,26h-1a4.846,4.846 0 0 0 -1.362,-0.12l-3.823,-3.25c-0.008,0 0,-0.01001 -0.012,-0.02002a2.5,2.5 0 0 1 -0.8,-1.82996v-3.78003a1,1 0 0 1 2,0v1.5h0a0.5,0.5 0 0 0 1,0v-7.5a1,1 0 0 1 2,0v4.5a0.5,0.5 0 0 0 1,0v-0.5a1,1 0 1 1 2,0h1a1,1 0 0 1 1,1h1a1,1 0 0 1 1,1v4a5,5 0 0 1 -5.003,5z",
  "event_number_lt" : "m23.062,14.22998 l-1.171,0.68005a5.49,5.49 0 0 1 0,2.17993l1.171,0.68005a0.993,0.993 0 0 1 0.366,1.35999l-1,1.73999a1,1 0 0 1 -1.366,0.35999l-1.195,-0.68994a5.811,5.811 0 0 1 -1.867,1.08997v1.37a1,1 0 0 1 -1,1h-2a1,1 0 0 1 -1,-1v-1.37a5.812,5.812 0 0 1 -1.867,-1.08997l-1.195,0.68994a1,1 0 0 1 -1.366,-0.35999l-1,-1.73999a0.994,0.994 0 0 1 0.366,-1.35999l1.172,-0.68005a5.49,5.49 0 0 1 0,-2.17993l-1.172,-0.68005a0.994,0.994 0 0 1 -0.366,-1.35999l1,-1.73999a1,1 0 0 1 1.366,-0.35999l1.195,0.68994a5.812,5.812 0 0 1 1.867,-1.08997v-1.37a1,1 0 0 1 1,-1h2a1,1 0 0 1 1,1v1.37a5.811,5.811 0 0 1 1.867,1.08997l1.195,-0.68994a1,1 0 0 1 1.366,0.35999l1,1.73999a0.993,0.993 0 0 1 -0.366,1.35999zm-7.062,-0.22998a2,2 0 1 0 2,2a2,2 0 0 0 -2,-2z",
  "event_message" : "m24.678,14.72998l-2.971,2.95996a1.01,1.01 0 0 1 -1.427,-1.42993l1.269,-1.26001h-7.549a1,1 0 0 1 -1,-1h0a1,1 0 0 1 1,-1h7.58l-1.3,-1.29004a1.01,1.01 0 1 1 1.427,-1.42993l2.994,2.97998a1.016,1.016 0 0 1 0.3,0.71997a0.058,0.058 0 0 1 0,0.02002h0a0.991,0.991 0 0 1 -0.323,0.72998z",
  "repeat" : "m26.24298, 25 l-1.57898,-1.263a5.969,5.969 0 0 0 -4.664,-9.737"+
      "v1.64697a0.326,0.326 0 0 1 -0.5,0.28705"+
      "c-0.20001,-0.11603 -3.01599,-2.45599 -3.35602,-2.65601"+
      "a0.334,0.334 0 0 1 0,-0.57703c0.24402,-0.14697 3.07703,-2.5 3.36603,-2.66199"+
      "a0.324,0.324 0 0 1 0.48999,0.28497v1.67603a8,8 0 0 1 6.24298,13zm-6.24298,1"+
      "v-1.64697a0.326,0.326 0 0 1 0.5,-0.28705"+
      "c0.20001,0.11603 3.01599,2.45599 3.35602,2.65601a0.334,0.334 0 0 1 0,0.57703"+
      "c-0.24402,0.14697 -3.07703,2.5 -3.36603,2.66199"+
      "a0.324,0.324 0 0 1 -0.48999,-0.28497v-1.67603a8,8 0 0 1 -6.24298,-13"+
      "l1.57996,1.26398a5.938,5.938 0 0 0 -1.33698,3.73602a6,6 0 0 0 6,6z",
  "logic_dump" :  "m20,24h-2a4.287,4.287 0 0 1 -1.05103,-0.16003a3.773,3.773 0 0 1"+
      " -1.45099,-0.73999a4.122,4.122 0 0 1 -0.59998,-0.59998l-4.80499,"+
      "-4.23999a0.363,0.363 0 0 1 0,-0.55005l0.29999,-0.27002"+
      "a1.832,1.832 0 0 1 2.422,0l1.17798,1.03003v-8.58997"+
      "a0.875,0.875 0 0 1 0.875,-0.88h0.25a0.875,0.875 0 0 1 0.875,0.88"+
      "v4.62a0.5,0.5 0 0 0 1,0v-5.63a0.873,0.873 0 0 1 0.875,-0.87h0.25"+
      "a0.873,0.873 0 0 1 0.875,0.87v5.63a0.5,0.5 0 0 0 1,0v-5.63"+
      "a0.873,0.873 0 0 1 0.875,-0.87h0.25a0.873,0.873 0 0 1 0.875,0.87"+
      "v5.63a0.5,0.5 0 0 0 1,0v-3.62a0.875,0.875 0 0 1 0.875,-0.88h0.25"+
      "a0.875,0.875 0 0 1 0.875,0.88v8.12a5,5 0 0 1 -4.99298,5z",
};

Blockly.Block.blockSvgData_back_ = {
  "event_background_change" : "m16,22.01202l3.993,-6l3.993,6h-7.986l0,0z",
  "event_message" : "m7.322,18.72998l2.971,2.95996a1.01,1.01 0 0 0 1.427,-1.42993l-1.268,-1.26001h7.548a1,1 0 0 0 1,-1h0a1,1 0 0 0 -1,-1h-7.58l1.3,-1.29004a1.01,1.01 0 1 0 -1.427,-1.42993l-2.994,2.97998a1.016,1.016 0 0 0 -0.3,0.71997a0.058,0.058 0 0 0 0,0.02002h0a0.991,0.991 0 0 0 0.323,0.72998z",
  "logic_dump" : "m20.79999,21.68005l-1.5,1.31995a3.955,3.955 0 0 1 -2.79999,0.98999"+
      "h-0.09998l-7.08002,-0.0199a0.3,0.3 0 0 1 -0.32098,-0.33008"+
      "l0.04199,-0.32996a1.594,1.594 0 0 1 1.61401,-1.29004h2.461"+
      "l-3.36902,-3.83997l-2.76501,-3.15002a0.881,0.881 0 0 1 0.08002,-1.23999"+
      "l0.18799,-0.16003a0.868,0.868 0 0 1 1.23505,0.08008l2.72095,3.09998h0"+
      "l0.33002,0.37a0.5,0.5 0 0 0 0.70001,0.05005a0.5,0.5 0 0 0 0.04602,-0.71008"+
      "l-0.03705,-0.03992l-3.67297,-4.18005a0.88,0.88 0 0 1 0.08099,-1.23999"+
      "l0.18701,-0.16003a0.868,0.868 0 0 1 1.23499,0.08008l3.05103,3.46997h0"+
      "l0.23596,0.27002l0.09399,0.10999h0l0.33002,0.37a0.5,0.5 0 0 0 0.70001,0.04993"+
      "a0.5,0.5 0 0 0 0.04602,-0.70996l-0.42303,-0.47998l-3.28699,-3.73999"+
      "a0.881,0.881 0 0 1 0.08002,-1.23999l0.18799,-0.16003a0.868,0.868 0 0 1 1.23499,0.07996"+
      "l3.38098,3.8501h0l0.32904,0.38a0.509,0.509 0 0 0 0.70599,0.03992"+
      "a0.493,0.493 0 0 0 0.04602,-0.69995l-0.33002,-0.38h0l-0.25702,-0.29004"+
      "l-0.073,-0.08997h0l-1.73102,-1.96997a0.869,0.869 0 0 1 0.08002,-1.22998"+
      "l0.18799,-0.17004a0.877,0.877 0 0 1 1.23505,0.07996l3.98596,4.54004"+
      "l1.37305,1.56995a4.992,4.992 0 0 1 -0.45807,7.05005z",
};

Blockly.Block.blockSvgData_bottom_ = {
  "repeat" : "m 8.02,-17 a8,8 0 1 1 -14.24298,-5l1.57898,1.26398" +
      "a5.977,5.977 0 1 0 4.664,-2.26398"+
      "v1.64697"+
      "a0.326,0.326 0 0 1 -0.5,0.28705"+
      "c-0.20001,-0.11603 -3.01599,-2.45599 -3.35602,-2.65601"+
      "a0.334,0.334 0 0 1 0,-0.57703"+
      "c0.24402,-0.14697 3.07703,-2.5 3.36603,-2.66199"+
      "a0.324,0.324 0 0 1 0.48999,0.28497"+
      "v1.67603"+
      "a8,8 0 0 1 8,8z",
};

Blockly.Block.blockIconCss_ = {
  "event" : "startArrow",
  "move" : "iconForward",
  "control" : "ic_loop-2_css",
  "logic_boolean" : "icon_dump",
};

Blockly.Block.blockIconCss_back_ = {
  "logic_dump" : "icon_dump_copy",
  "event_background_change" : "icon_dump_copy",
  "event_message" : "messageback",
};


Blockly.Block.blockPathCss_ = {
  "event" : "eventBlockPath",
  "move" : "motionBlockPath",
  "control" : "controlBlockPath",
  "inputNumber" : "inputbox_css",
  "logic_boolean" : "pathDump",
};

Blockly.Block.blockIconCss_Bottom_ = {
  "repeat" : "ic_replay_css",
};

Blockly.Block.blockIconSub_ = {
  "event_onclick_object" : {"class" : "icon_circle_image", "cx" : 13, "cy" : 11, "r" : 3},
};
Blockly.Block.blockIconSubCss_ = {
  "event_onclick_object" : "icon_circle_image",
};

Blockly.Block.iconRectData_ = {
  "control" : {"rx" : 12, "ry" : 12, "height" : 24, "width" : 38,
              "y" : 8, "x" : 8},
  "rect_basic" : {"rx" : 6, "ry" : 6, "height" : 24, "width" : 24,
                "y" : 4, "x" : 4},
};

Blockly.Block.iconCircleData_ = {
  "basic" : {"cx" : 16, "cy" : 16, "r" : 12},
  "control" : {"cx" : 20, "cy" : 20, "r" : 12},
};
