/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
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
 * @fileoverview Object representing a workspace.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Workspace');

goog.require('goog.math');


/**
 * Class for a workspace.  This is a data structure that contains blocks.
 * There is no UI, and can be created headlessly.
 * @param {Blockly.Options} opt_options Dictionary of options.
 * @constructor
 */
Blockly.Workspace = function(opt_options) {
  /** @type {string} */
  this.id = Blockly.genUid();
  Blockly.Workspace.WorkspaceDB_[this.id] = this;
  /** @type {!Blockly.Options} */
  this.options = opt_options || {};
  /** @type {boolean} */
  this.RTL = !!this.options.RTL;
  /** @type {!Array.<!Blockly.Block>} */
  this.topBlocks_ = [];
  /** @type {!Array.<!Function>} */
  this.listeners_ = [];
  //James's stack
  this.undostack = [];
  this.redostack = [];
  /** @type {!Array.<!Blockly.Events.Abstract>} */
  this.undoStack_ = [];
  /** @type {!Array.<!Blockly.Events.Abstract>} */
  this.redoStack_ = [];
  /** @type {!Object} */
  this.blockDB_ = Object.create(null);
};

/**
 * Workspaces may be headless.
 * @type {boolean} True if visible.  False if headless.
 */
Blockly.Workspace.prototype.rendered = false;

/**
 * Maximum number of undo events in stack.
 * @type {number} 0 to turn off undo, Infinity for unlimited.
 */
Blockly.Workspace.prototype.MAX_UNDO = 1024;

/**
 * Dispose of this workspace.
 * Unlink from all DOM elements to prevent memory leaks.
 */
Blockly.Workspace.prototype.dispose = function() {
  this.listeners_.length = 0;
  this.clear();
  // Remove from workspace database.
  delete Blockly.Workspace.WorkspaceDB_[this.id];
};

Blockly.Workspace.prototype.undostack = null;

Blockly.Workspace.prototype.redostack = null;

Blockly.Workspace.prototype.changestate = Blockly.Workspace.STATE_INIT;

Blockly.Workspace.prototype.callBackConnectionBlock_ = null;

Blockly.Workspace.prototype.updateUI = null;

Blockly.Workspace.prototype.category_toolbox_ = null;

Blockly.Workspace.prototype.callbackUpdateBlock_ = null;

Blockly.Workspace.prototype.callbackClickBlock_ = null;

/**
 * Angle away from the horizontal to sweep for blocks.  Order of execution is
 * generally top to bottom, but a small angle changes the scan to give a bit of
 * a left to right bias (reversed in RTL).  Units are in degrees.
 * See: http://tvtropes.org/pmwiki/pmwiki.php/Main/DiagonalBilling.
 */
Blockly.Workspace.SCAN_ANGLE = 3;

Blockly.Workspace.STATE_INIT = 0;
Blockly.Workspace.STATE_CREATE = 1;
Blockly.Workspace.STATE_DISCONNECT = 2;
Blockly.Workspace.STATE_CREATEINTOOLBOX = 3;

Blockly.Workspace.prototype.resetReUndo = function() {
  this.changestate = Blockly.Workspace.STATE_INIT;
  this.undostack = [];
  this.redostack = [];
};

Blockly.Workspace.prototype.setChangestate = function(state) {
  this.changestate = state;
};

Blockly.Workspace.prototype.getChangestate = function() {
  return this.changestate;
};

Blockly.Workspace.prototype.saveWorkspace = function() {
  this.undostack.push(Blockly.Xml.workspaceToDom(this));
  if (this.updateUI)
    this.updateUI();
};

Blockly.Workspace.prototype.rollbackUndostack = function() {
  this.undostack.pop();
  if (this.updateUI)
    this.updateUI();
};

Blockly.Workspace.prototype.callBackConnectionBlock = function() {
  if (this.callBackConnectionBlock_) {
    this.callBackConnectionBlock_();
  } 
};

Blockly.Workspace.prototype.callbackUpdateBlock = function() {
  if (this.callbackUpdateBlock_)
    this.callbackUpdateBlock_();
};

Blockly.Workspace.prototype.callbackClickBlock = function() {
  if (this.callbackClickBlock_)
    this.callbackClickBlock_();
};


Blockly.Workspace.prototype.setCallBackConnectionBlock = function(call) {
  this.callBackConnectionBlock_ = call;
};

Blockly.Workspace.prototype.setCallBlocksUpdate = function(call) {
  this.callbackUpdateBlock_ = call;
};

Blockly.Workspace.prototype.setCallClickBlock = function(call) {
  this.callbackClickBlock_ = call;
};

/**
* Obtain a newly created block.
* @param {?string} prototypeName Name of the language object containing
*     type-specific functions for this block.
* @param {=string} opt_id Optional ID.  Use this ID if provided, otherwise
*     create a new id.
* @return {!Blockly.Block} The created block.
*/
Blockly.Workspace.prototype.newBlock = function(prototypeName, opt_id) {
 return new Blockly.Block(this, prototypeName, opt_id);
};

Blockly.Workspace.prototype.undo_grepp = function() {
  if(this.undostack.length > 0) { 
    this.redostack.push(Blockly.Xml.workspaceToDom(this));
    this.clear();
    Blockly.Xml.domToWorkspace(this.undostack.pop(), this);
    this.render();
  }  
};

Blockly.Workspace.prototype.redo_grepp = function() {
  if(this.redostack.length > 0) {
    this.undostack.push(Blockly.Xml.workspaceToDom(this));
    this.clear();
    Blockly.Xml.domToWorkspace(this.redostack.pop(), this);
    this.render();
  }
};

Blockly.Workspace.prototype.setUpdateUI = function(fun) {
  this.updateUI = fun;
};

/**
 * Add a block to the list of top blocks.
 * @param {!Blockly.Block} block Block to remove.
 */
Blockly.Workspace.prototype.addTopBlock = function(block) {
  this.topBlocks_.push(block);
};

/**
 * Remove a block from the list of top blocks.
 * @param {!Blockly.Block} block Block to remove.
 */
Blockly.Workspace.prototype.removeTopBlock = function(block) {
  var found = false;
  for (var child, i = 0; child = this.topBlocks_[i]; i++) {
    if (child == block) {
      this.topBlocks_.splice(i, 1);
      found = true;
      break;
    }
  }
  if (!found) {
    throw 'Block not present in workspace\'s list of top-most blocks.';
  }
};

/**
 * Finds the top-level blocks and returns them.  Blocks are optionally sorted
 * by position; top to bottom (with slight LTR or RTL bias).
 * @param {boolean} ordered Sort the list if true.
 * @return {!Array.<!Blockly.Block>} The top-level block objects.
 */
Blockly.Workspace.prototype.getTopBlocks = function(ordered) {
  // Copy the topBlocks_ list.
  var blocks = [].concat(this.topBlocks_);
  if (ordered && blocks.length > 1) {
    var offset = Math.sin(goog.math.toRadians(Blockly.Workspace.SCAN_ANGLE));
    if (this.RTL) {
      offset *= -1;
    }
    blocks.sort(function(a, b) {
      var aXY = a.getRelativeToSurfaceXY();
      var bXY = b.getRelativeToSurfaceXY();
      return (aXY.y + offset * aXY.x) - (bXY.y + offset * bXY.x);
    });
  }
  return blocks;
};

/**
 * Return top blocks Id by block's id
 * @param  {[type]} block [Child block]
 * @return {[type]} id    [top block's id]
 */
Blockly.Workspace.prototype.getTopBlockId = function(id) {
  

  var topBlocks = this.getTopBlocks(false);
  

  for (var i = 0; i < topBlocks.length; i++) {
    if (topBlocks[i].type == "start_block" ||
      (topBlocks[i].type).indexOf("event") != -1) {

      if (topBlocks[i].id == id) {
        return id;
      }

      var childBlocks = topBlocks[i].getChildren();
      for (var j = 0; j < childBlocks.length; j++) {
        if (childBlocks[j].id == id) {
          return topBlocks[i].id;
        }
        childBlocks.push.apply(childBlocks, childBlocks[j].getChildren());
      }


    }
  }
  return -1;
};

/**
 * Find all blocks in workspace.  No particular order.
 * @return {!Array.<!Blockly.Block>} Array of blocks.
 */
Blockly.Workspace.prototype.getAllBlocks = function() {
  var blocks = this.getTopBlocks(false);
  for (var i = 0; i < blocks.length; i++) {
    blocks.push.apply(blocks, blocks[i].getChildren());
  }
  return blocks;
};

/**
 * Dispose of all blocks in workspace.
 */
Blockly.Workspace.prototype.clear = function() {
  var existingGroup = Blockly.Events.getGroup();
  if (!existingGroup) {
    Blockly.Events.setGroup(true);
  }
  while (this.topBlocks_.length) {
    this.topBlocks_[0].dispose();
  }
  if (!existingGroup) {
    Blockly.Events.setGroup(false);
  }
};

/**
 * Returns the horizontal offset of the workspace.
 * Intended for LTR/RTL compatibility in XML.
 * Not relevant for a headless workspace.
 * @return {number} Width.
 */
Blockly.Workspace.prototype.getWidth = function() {
  return 0;
};

/**
 * Obtain a newly created block.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @param {=string} opt_id Optional ID.  Use this ID if provided, otherwise
 *     create a new id.
 * @return {!Blockly.Block} The created block.
 */
Blockly.Workspace.prototype.newBlock = function(prototypeName, opt_id) {
  return new Blockly.Block(this, prototypeName, opt_id);
};

/**
 * Finds the block with the specified ID in this workspace.
 * @param {string} id ID of block to find.
 * @return {Blockly.Block} The matching block, or null if not found.
 */
Blockly.Workspace.prototype.getBlockById = function(id) {
  // If this O(n) function fails to scale well, maintain a hash table of IDs.
  var blocks = this.getAllBlocks();
  for (var i = 0, block; block = blocks[i]; i++) {
    if (block.id == id) {
      return block;
    }
  }
  return null;
};

/**
 * The number of blocks that may be added to the workspace before reaching
 *     the maxBlocks.
 * @return {number} Number of blocks left.
 */
Blockly.Workspace.prototype.remainingCapacity = function() {
  if (isNaN(this.options.maxBlocks)) {
    return Infinity;
  }
  return this.options.maxBlocks - this.getAllBlocks().length;
};

/**
 * Undo or redo the previous action.
 * @param {boolean} redo False if undo, true if redo.
 */
Blockly.Workspace.prototype.undo = function(redo) {
  var inputStack = redo ? this.redoStack_ : this.undoStack_;
  var outputStack = redo ? this.undoStack_ : this.redoStack_;
  var event = inputStack.pop();
  if (!event) {
    return;
  }
  var events = [event];
  // Do another undo/redo if the next one is of the same group.
  while (inputStack.length && event.group &&
      event.group == inputStack[inputStack.length - 1].group) {
    events.push(inputStack.pop());
  }
  // Push these popped events on the opposite stack.
  for (var i = 0, event; event = events[i]; i++) {
    outputStack.push(event);
  }
  events = Blockly.Events.filter(events, redo);
  Blockly.Events.recordUndo = false;
  for (var i = 0, event; event = events[i]; i++) {
    event.run(redo);
  }
  Blockly.Events.recordUndo = true;
};

/**
 * Clear the undo/redo stacks.
 */
Blockly.Workspace.prototype.clearUndo = function() {
  this.undoStack_.length = 0;
  this.redoStack_.length = 0;
  // Stop any events already in the firing queue from being undoable.
  Blockly.Events.clearPendingUndo();
};

/**
 * When something in this workspace changes, call a function.
 * @param {!Function} func Function to call.
 * @return {!Function} Function that can be passed to
 *     removeChangeListener.
 */
Blockly.Workspace.prototype.addChangeListener = function(func) {
  this.listeners_.push(func);
  return func;
};

/**
 * Stop listening for this workspace's changes.
 * @param {Function} func Function to stop calling.
 */
Blockly.Workspace.prototype.removeChangeListener = function(func) {
  var i = this.listeners_.indexOf(func);
  if (i != -1) {
    this.listeners_.splice(i, 1);
  }
};

/**
 * Fire a change event.
 * @param {!Blockly.Events.Abstract} event Event to fire.
 */
Blockly.Workspace.prototype.fireChangeListener = function(event) {
  if (event.recordUndo) {
    this.undoStack_.push(event);
    this.redoStack_.length = 0;
    if (this.undoStack_.length > this.MAX_UNDO) {
      this.undoStack_.unshift();
    }
  }
  for (var i = 0, func; func = this.listeners_[i]; i++) {
    func(event);
  }
};


/**
 * Find the block on this workspace with the specified ID.
 * @param {string} id ID of block to find.
 * @return {Blockly.Block} The sought after block or null if not found.
 */
Blockly.Workspace.prototype.getBlockById = function(id) {
  return this.blockDB_[id] || null;
};

/**
 * Database of all workspaces.
 * @private
 */
Blockly.Workspace.WorkspaceDB_ = Object.create(null);

/**
 * Find the workspace with the specified ID.
 * @param {string} id ID of workspace to find.
 * @return {Blockly.Workspace} The sought after workspace or null if not found.
 */
Blockly.Workspace.getById = function(id) {
  return Blockly.Workspace.WorkspaceDB_[id] || null;
};

// Export symbols that would otherwise be renamed by Closure compiler.
Blockly.Workspace.prototype['clear'] = Blockly.Workspace.prototype.clear;
Blockly.Workspace.prototype['clearUndo'] =
    Blockly.Workspace.prototype.clearUndo;
Blockly.Workspace.prototype['addChangeListener'] =
    Blockly.Workspace.prototype.addChangeListener;
Blockly.Workspace.prototype['removeChangeListener'] =
    Blockly.Workspace.prototype.removeChangeListener;
