/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2016 Google Inc.
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
 * @fileoverview Methods for graphically rendering a block as SVG.
 * @author fenichel@google.com (Rachel Fenichel)
 */

'use strict';

goog.provide('Blockly.BlockSvg.render');

goog.require('Blockly.BlockSvg');


// UI constants for rendering blocks.
/**
 * Horizontal space between elements.
 * @const
 */
Blockly.BlockSvg.SEP_SPACE_X = 10;

Blockly.BlockSvg.ICON_SPACE_X = 15;
/**
 * Vertical space between elements.
 * @const
 */
Blockly.BlockSvg.SEP_SPACE_Y = 10;
/**
 * Vertical padding around inline elements.
 * @const
 */
//Blockly.BlockSvg.INLINE_PADDING_Y = 5;
Blockly.BlockSvg.INLINE_PADDING_Y = 3;
/**
 * Minimum height of a block.
 * @const
 */
Blockly.BlockSvg.MIN_BLOCK_Y = 25;
/**
 * Height of horizontal puzzle tab.
 * @const
 */
Blockly.BlockSvg.TAB_HEIGHT = 20;
/**
 * Width of horizontal puzzle tab.
 * @const
 */
//Blockly.BlockSvg.TAB_WIDTH = 8;
Blockly.BlockSvg.TAB_WIDTH = 12;
/**
 * Width of vertical tab (inc left margin).
 * @const
 */
//Blockly.BlockSvg.NOTCH_WIDTH = 30;
Blockly.BlockSvg.NOTCH_WIDTH = 34.86499;
/**
 * 바뀐 디자인 연결꼭지 시작 위치
 * @const
 * @By James
 */
//Blockly.BlockSvg.LARGE_NOTCH_WIDTH = 34.865;

/**
 * Rounded corner radius.
 * @const
 */
Blockly.BlockSvg.CORNER_RADIUS = 16;


/**
 * Large Rounded corner radius
 * @const
 */
Blockly.BlockSvg.START_BLOCK_WIDTH = 16;

/**
 * Icon padding (circle).
 * @const
 */
Blockly.BlockSvg.PADDING_ICON_CIRCLE = 25;

/**
 * Icon padding (rect).
 * @const
 */
Blockly.BlockSvg.PADDING_ICON_RECT= 
  Blockly.BlockSvg.PADDING_ICON_CIRCLE + 15;


/**
 * Do blocks with no previous or output connections have a 'hat' on top?
 * @const
 */
Blockly.BlockSvg.START_HAT = false;
/**
 * Path of the top hat's curve.
 * @const
 */
Blockly.BlockSvg.START_HAT_PATH = 'c 30,-15 70,-15 100,0';
/**
 * Path of the top hat's curve's highlight in LTR.
 * @const
 */
Blockly.BlockSvg.START_HAT_HIGHLIGHT_LTR =
    'c 17.8,-9.2 45.3,-14.9 75,-8.7 M 100.5,0.5';
/**
 * Path of the top hat's curve's highlight in RTL.
 * @const
 */
Blockly.BlockSvg.START_HAT_HIGHLIGHT_RTL =
    'm 25,-8.7 c 29.7,-6.2 57.2,-0.5 75,8.7';
/**
 * Distance from shape edge to intersect with a curved corner at 45 degrees.
 * Applies to highlighting on around the inside of a curve.
 * @const
 */
Blockly.BlockSvg.DISTANCE_45_INSIDE = (1 - Math.SQRT1_2) *
      (Blockly.BlockSvg.CORNER_RADIUS - 0.5) + 0.5;
/**
 * Distance from shape edge to intersect with a curved corner at 45 degrees.
 * Applies to highlighting on around the outside of a curve.
 * @const
 */
Blockly.BlockSvg.DISTANCE_45_OUTSIDE = (1 - Math.SQRT1_2) *
      (Blockly.BlockSvg.CORNER_RADIUS + 0.5) - 0.5;
/**
 * SVG path for drawing next/previous notch from left to right.
 * @const
 */
//Blockly.BlockSvg.NOTCH_PATH_LEFT = 'l 6,4 3,0 6,-4';
//'a5,5 0 0 0 9.15997,0';
Blockly.BlockSvg.NOTCH_PATH_LEFT = 'a5,5 0 0 0 8.5,0';
/**
 * SVG path for drawing next/previous notch from left to right with
 * highlighting.
 * @const
 */
//Blockly.BlockSvg.NOTCH_PATH_LEFT_HIGHLIGHT = 'l 6,4 3,0 6,-4';
Blockly.BlockSvg.NOTCH_PATH_LEFT_HIGHLIGHT = 'a5,5 0 0 0 8.5,0';
/**
 * SVG path for drawing next/previous notch from right to left.
 * @const
 */
//Blockly.BlockSvg.NOTCH_PATH_RIGHT = 'l -6,4 -3,0 -6,-4';
Blockly.BlockSvg.NOTCH_PATH_RIGHT = 'a3.988,3.988 0 0 1 -7.72299,0';
/**
 * SVG path for drawing jagged teeth at the end of collapsed blocks.
 * @const
 */
Blockly.BlockSvg.JAGGED_TEETH = 'l 8,0 0,4 8,4 -16,8 8,4';
/**
 * Height of SVG path for jagged teeth at the end of collapsed blocks.
 * @const
 */
Blockly.BlockSvg.JAGGED_TEETH_HEIGHT = 20;
/**
 * Width of SVG path for jagged teeth at the end of collapsed blocks.
 * @const
 */
Blockly.BlockSvg.JAGGED_TEETH_WIDTH = 15;
/**
 * SVG path for drawing a horizontal puzzle tab from top to bottom.
 * @const
 */
Blockly.BlockSvg.TAB_PATH_DOWN = 'v 5 c 0,10 -' + Blockly.BlockSvg.TAB_WIDTH +
    ',-8 -' + Blockly.BlockSvg.TAB_WIDTH + ',7.5 s ' +
    Blockly.BlockSvg.TAB_WIDTH + ',-2.5 ' + Blockly.BlockSvg.TAB_WIDTH + ',7.5';
/**
 * SVG path for drawing a horizontal puzzle tab from top to bottom with
 * highlighting from the upper-right.
 * @const
 */
Blockly.BlockSvg.TAB_PATH_DOWN_HIGHLIGHT_RTL = 'v 6.5 m -' +
    (Blockly.BlockSvg.TAB_WIDTH * 0.97) + ',3 q -' +
    (Blockly.BlockSvg.TAB_WIDTH * 0.05) + ',10 ' +
    (Blockly.BlockSvg.TAB_WIDTH * 0.3) + ',9.5 m ' +
    (Blockly.BlockSvg.TAB_WIDTH * 0.67) + ',-1.9 v 1.4';

/**
 * SVG start point for drawing the top-left corner.
 * @const
 */
Blockly.BlockSvg.TOP_LEFT_CORNER_START =
    'm 0,' + Blockly.BlockSvg.CORNER_RADIUS;
/**
 * SVG start point for drawing the top-left corner's highlight in RTL.
 * @const
 */
Blockly.BlockSvg.TOP_LEFT_CORNER_START_HIGHLIGHT_RTL =
    'm ' + Blockly.BlockSvg.DISTANCE_45_INSIDE + ',' +
    Blockly.BlockSvg.DISTANCE_45_INSIDE;
/**
 * SVG start point for drawing the top-left corner's highlight in LTR.
 * @const
 */
Blockly.BlockSvg.TOP_LEFT_CORNER_START_HIGHLIGHT_LTR =
    'm 0.5,' + (Blockly.BlockSvg.CORNER_RADIUS - 0.5);
/**
 * SVG path for drawing the rounded top-left corner.
 * @const
 */
Blockly.BlockSvg.TOP_LEFT_CORNER =
    'A ' + Blockly.BlockSvg.CORNER_RADIUS + ',' +
    Blockly.BlockSvg.CORNER_RADIUS + ' 0 0,1 ' +
    Blockly.BlockSvg.CORNER_RADIUS + ',0';
/**
 * SVG path for drawing the highlight on the rounded top-left corner.
 * @const
 */
Blockly.BlockSvg.TOP_LEFT_CORNER_HIGHLIGHT =
    'A ' + (Blockly.BlockSvg.CORNER_RADIUS - 0.5) + ',' +
    (Blockly.BlockSvg.CORNER_RADIUS - 0.5) + ' 0 0,1 ' +
    Blockly.BlockSvg.CORNER_RADIUS + ',0.5';
/**
 * SVG path for drawing the top-left corner of a statement input.
 * Includes the top notch, a horizontal space, and the rounded inside corner.
 * @const
 */
 Blockly.BlockSvg.INNER_TOP_LEFT_CORNER =
    Blockly.BlockSvg.NOTCH_PATH_RIGHT + ' h -' +
    (11.14197) +
    ' a ' + (Blockly.BlockSvg.CORNER_RADIUS+1) + ',' +
    (Blockly.BlockSvg.CORNER_RADIUS+1) + ' 0 0,0 -' +
    (Blockly.BlockSvg.CORNER_RADIUS+1) + ',' +
    (Blockly.BlockSvg.CORNER_RADIUS+1);
 /*
Blockly.BlockSvg.INNER_TOP_LEFT_CORNER =
    Blockly.BlockSvg.NOTCH_PATH_RIGHT + ' h -' +
    (Blockly.BlockSvg.NOTCH_WIDTH - 8.5 - Blockly.BlockSvg.CORNER_RADIUS) +
    ' h -0.5 a ' + Blockly.BlockSvg.CORNER_RADIUS + ',' +
    Blockly.BlockSvg.CORNER_RADIUS + ' 0 0,0 -' +
    Blockly.BlockSvg.CORNER_RADIUS + ',' +
    Blockly.BlockSvg.CORNER_RADIUS;
    */
/**
 * SVG path for drawing the bottom-left corner of a statement input.
 * Includes the rounded inside corner.
 * @const
 */
 Blockly.BlockSvg.INNER_BOTTOM_LEFT_CORNER =
    'a ' + (Blockly.BlockSvg.CORNER_RADIUS+1) + ',' +
    (Blockly.BlockSvg.CORNER_RADIUS+1) + ' 0 0,0 ' +
    (Blockly.BlockSvg.CORNER_RADIUS+1) + ',' +
    (Blockly.BlockSvg.CORNER_RADIUS+1);
 /*
Blockly.BlockSvg.INNER_BOTTOM_LEFT_CORNER =
    'a ' + Blockly.BlockSvg.CORNER_RADIUS + ',' +
    Blockly.BlockSvg.CORNER_RADIUS + ' 0 0,0 ' +
    Blockly.BlockSvg.CORNER_RADIUS + ',' +
    Blockly.BlockSvg.CORNER_RADIUS;
    */
/**
 * SVG path for drawing highlight on the top-left corner of a statement
 * input in RTL.
 * @const
 */
Blockly.BlockSvg.INNER_TOP_LEFT_CORNER_HIGHLIGHT_RTL =
    'a ' + Blockly.BlockSvg.CORNER_RADIUS + ',' +
    Blockly.BlockSvg.CORNER_RADIUS + ' 0 0,0 ' +
    (-Blockly.BlockSvg.DISTANCE_45_OUTSIDE - 0.5) + ',' +
    (Blockly.BlockSvg.CORNER_RADIUS -
    Blockly.BlockSvg.DISTANCE_45_OUTSIDE);
/**
 * SVG path for drawing highlight on the bottom-left corner of a statement
 * input in RTL.
 * @const
 */
Blockly.BlockSvg.INNER_BOTTOM_LEFT_CORNER_HIGHLIGHT_RTL =
    'a ' + (Blockly.BlockSvg.CORNER_RADIUS + 0.5) + ',' +
    (Blockly.BlockSvg.CORNER_RADIUS + 0.5) + ' 0 0,0 ' +
    (Blockly.BlockSvg.CORNER_RADIUS + 0.5) + ',' +
    (Blockly.BlockSvg.CORNER_RADIUS + 0.5);
/**
 * SVG path for drawing highlight on the bottom-left corner of a statement
 * input in LTR.
 * @const
 */
Blockly.BlockSvg.INNER_BOTTOM_LEFT_CORNER_HIGHLIGHT_LTR =
    'a ' + (Blockly.BlockSvg.CORNER_RADIUS + 0.5) + ',' +
    (Blockly.BlockSvg.CORNER_RADIUS + 0.5) + ' 0 0,0 ' +
    (Blockly.BlockSvg.CORNER_RADIUS -
    Blockly.BlockSvg.DISTANCE_45_OUTSIDE) + ',' +
    (Blockly.BlockSvg.DISTANCE_45_OUTSIDE + 0.5);


/**
 * Render the block.
 * Lays out and reflows a block based on its contents and settings.
 * @param {boolean=} opt_bubble If false, just render this block.
 *   If true, also render block's parent, grandparent, etc.  Defaults to true.
 */
Blockly.BlockSvg.prototype.render = function(opt_bubble) {
  Blockly.Field.startCache();
  this.rendered = true;

  var cursorX = Blockly.BlockSvg.SEP_SPACE_X;
  if (this.RTL) {
    cursorX = -cursorX;
  }
  // Move the icons into position.
  var icons = this.getIcons();

  for (var i = 0; i < icons.length; i++) {
    cursorX = icons[i].renderIcon(cursorX);
  }

  if(this.signicon_circle) {
    cursorX += Blockly.BlockSvg.PADDING_ICON_CIRCLE;
  } else if(this.signicon_rect) {    
    cursorX += Blockly.BlockSvg.PADDING_ICON_RECT;
  }
  cursorX += this.RTL ?
      Blockly.BlockSvg.SEP_SPACE_X : -Blockly.BlockSvg.SEP_SPACE_X;
  // If there are no icons, cursorX will be 0, otherwise it will be the
  // width that the first label needs to move over by.
  var inputRows = this.renderCompute_(cursorX);
  //console.log(inputRows);
  this.renderDraw_(cursorX, inputRows);

  if (opt_bubble !== false) {
    // Render all blocks above this one (propagate a reflow).
    var parentBlock = this.getParent();
    if (parentBlock) {
      parentBlock.render(true);
    } else {
      // Top-most block.  Fire an event to allow scrollbars to resize.
      Blockly.fireUiEvent(window, 'resize');
    }
  }
  Blockly.Field.stopCache();
};

/**
 * Render a list of fields starting at the specified location.
 * @param {!Array.<!Blockly.Field>} fieldList List of fields.
 * @param {number} cursorX X-coordinate to start the fields.
 * @param {number} cursorY Y-coordinate to start the fields.
 * @return {number} X-coordinate of the end of the field row (plus a gap).
 * @private
 */
Blockly.BlockSvg.prototype.renderFields_ =
    function(fieldList, cursorX, cursorY) {
  cursorY += Blockly.BlockSvg.INLINE_PADDING_Y+5;
  if (this.RTL) {
    cursorX = -cursorX;
  }
  for (var t = 0, field; field = fieldList[t]; t++) {
    var root = field.getSvgRoot();
    if (!root) {
      continue;
    }
    if (this.RTL) {
      cursorX -= field.renderSep + field.renderWidth;
      root.setAttribute('transform',
          'translate(' + cursorX + ',' + cursorY + ')');
      if (field.renderWidth) {
        cursorX -= Blockly.BlockSvg.SEP_SPACE_X;
      }
    } else {
      root.setAttribute('transform',
          'translate(' + (cursorX + field.renderSep) + ',' + cursorY + ')');
      if (field.renderWidth) {
        cursorX += field.renderSep + field.renderWidth +
            Blockly.BlockSvg.SEP_SPACE_X;
      }
    }
  }
  return this.RTL ? -cursorX : cursorX;
};

/**
 * Computes the height and widths for each row and field.
 * @param {number} iconWidth Offset of first row due to icons.
 * @return {!Array.<!Array.<!Object>>} 2D array of objects, each containing
 *     position information.
 * @private
 */
Blockly.BlockSvg.prototype.renderCompute_ = function(iconWidth) {
  var inputList = this.inputList;
  var inputRows = [];
  inputRows.rightEdge = iconWidth + Blockly.BlockSvg.SEP_SPACE_X * 2;
  if(this.signicon_circle) {
    iconWidth += Blockly.BlockSvg.PADDING_ICON_CIRCLE;
  } else if(this.signicon_rect) {    
    iconWidth += Blockly.BlockSvg.PADDING_ICON_RECT;
  }
  if (this.previousConnection || this.nextConnection) {
    inputRows.rightEdge = Math.max(inputRows.rightEdge,
        Blockly.BlockSvg.NOTCH_WIDTH + Blockly.BlockSvg.SEP_SPACE_X);
  }
  var fieldValueWidth = 0;  // Width of longest external value field.
  var fieldStatementWidth = 0;  // Width of longest statement field.
  var hasValue = false;
  var hasStatement = false;
  var hasDummy = false;
  var lastType = undefined;
  var isInline = this.getInputsInline() && !this.isCollapsed();
  //console.log(inputList);
  for (var i = 0, input; input = inputList[i]; i++) {
    if (!input.isVisible()) {
      continue;
    }
    var row;
    if (!isInline || !lastType ||
        lastType == Blockly.NEXT_STATEMENT ||
        input.type == Blockly.NEXT_STATEMENT) {
      // Create new row.
      lastType = input.type;
      //console.log(lastType);
      row = [];
      if (isInline && input.type != Blockly.NEXT_STATEMENT) {
        row.type = Blockly.BlockSvg.INLINE;
      } else {
        row.type = input.type;
      }
      row.height = 0;
      inputRows.push(row);
    } else {
      row = inputRows[inputRows.length - 1];
    }
    row.push(input);
    // Compute minimum input size.
    input.renderHeight = Blockly.BlockSvg.MIN_BLOCK_Y;
    // The width is currently only needed for inline value inputs.
    if (isInline && input.type == Blockly.INPUT_VALUE) {
      input.renderWidth = Blockly.BlockSvg.TAB_WIDTH +
          Blockly.BlockSvg.SEP_SPACE_X * 1.25;
    } else {
      input.renderWidth = 0;
    }
    // Expand input size if there is a connection.
    if (input.connection && input.connection.targetConnection) {
      var linkedBlock = input.connection.targetBlock();
      var bBox = linkedBlock.getHeightWidth();
      input.renderHeight = Math.max(input.renderHeight, bBox.height);
      input.renderWidth = Math.max(input.renderWidth, bBox.width);  
    }
    // Blocks have a one pixel shadow that should sometimes overhang.
    if (!isInline && i == inputList.length - 1) {
      // Last value input should overhang.
      input.renderHeight--;
    } else if (!isInline && input.type == Blockly.INPUT_VALUE &&
        inputList[i + 1] && inputList[i + 1].type == Blockly.NEXT_STATEMENT) {
      // Value input above statement input should overhang.
      input.renderHeight--;
    }

    row.height = Math.max(row.height, input.renderHeight);
    input.fieldWidth = 0;
    if (inputRows.length == 1) {
      // The first row gets shifted to accommodate any icons.
      input.fieldWidth += this.RTL ? -iconWidth : iconWidth;
    }
    var previousFieldEditable = false;
    for (var j = 0, field; field = input.fieldRow[j]; j++) {
      if (j != 0) {
        input.fieldWidth += Blockly.BlockSvg.SEP_SPACE_X;
      }
      // Get the dimensions of the field.
      var fieldSize = field.getSize();
      field.renderWidth = fieldSize.width;
      field.renderSep = (previousFieldEditable && field.EDITABLE) ?
          (Blockly.BlockSvg.SEP_SPACE_X) : 0;
      input.fieldWidth += field.renderWidth + field.renderSep;
      row.height = Math.max(row.height, fieldSize.height);
      previousFieldEditable = field.EDITABLE;
    }

    if (row.type != Blockly.BlockSvg.INLINE) {
      if (row.type == Blockly.NEXT_STATEMENT) {
        hasStatement = true;
        fieldStatementWidth = Math.max(fieldStatementWidth, input.fieldWidth);
      } else {
        if (row.type == Blockly.INPUT_VALUE) {
          hasValue = true;
        } else if (row.type == Blockly.DUMMY_INPUT) {
          hasDummy = true;
        }
        fieldValueWidth = Math.max(fieldValueWidth, input.fieldWidth);
      }
    }
  }

  // Make inline rows a bit thicker in order to enclose the values.
  for (var y = 0, row; row = inputRows[y]; y++) {
    row.thicker = false;
    if (row.type == Blockly.BlockSvg.INLINE) {
      for (var z = 0, input; input = row[z]; z++) {
        if (input.type == Blockly.INPUT_VALUE) {
          row.height += (2 * Blockly.BlockSvg.INLINE_PADDING_Y);
          row.thicker = true;
          break;
        }
      }
    }
  }
  // Compute the statement edge.
  // This is the width of a block where statements are nested.
  inputRows.statementEdge = 2 * Blockly.BlockSvg.SEP_SPACE_X +
      fieldStatementWidth; 
  // Compute the preferred right edge.  Inline blocks may extend beyond.
  // This is the width of the block where external inputs connect.
  if (hasStatement) {
    inputRows.rightEdge = Math.max(inputRows.rightEdge,
        inputRows.statementEdge + Blockly.BlockSvg.NOTCH_WIDTH);
  }
  if (hasValue) {
    inputRows.rightEdge = Math.max(inputRows.rightEdge, fieldValueWidth +
        Blockly.BlockSvg.SEP_SPACE_X * 2 + Blockly.BlockSvg.TAB_WIDTH);
  } else if (hasDummy) {
    inputRows.rightEdge = Math.max(inputRows.rightEdge, fieldValueWidth +
        Blockly.BlockSvg.SEP_SPACE_X * 2);
  }

  inputRows.hasValue = hasValue;
  inputRows.hasStatement = hasStatement;
  inputRows.hasDummy = hasDummy;
  return inputRows;
};


Blockly.BlockSvg.prototype.removeElementNode_ = function(node) {
  if(node) {
    goog.dom.removeNode(node);
    node = null;
  } 
};

/**
 * Draw the path of the block.
 * Move the fields to the correct locations.
 * @param {number} iconWidth Offset of first row due to icons.
 * @param {!Array.<!Array.<!Object>>} inputRows 2D array of objects, each
 *     containing position information.
 * @private
 */
Blockly.BlockSvg.prototype.renderDraw_ = function(iconWidth, inputRows) {
//  console.log(inputRows);
  this.startHat_ = false;
//  console.log(this.type);
  //console.log(this.childBlocks_);
  //console.log(this);
  // Should the top and bottom left corners be rounded or square?
  if (this.outputConnection) {
    this.squareTopLeftCorner_ = true;
    this.squareBottomLeftCorner_ = true;
  } else {
    this.squareTopLeftCorner_ = false;
    this.squareBottomLeftCorner_ = false;
    // If this block is in the middle of a stack, square the corners.
    if (this.previousConnection) {
      var prevBlock = this.previousConnection.targetBlock();
      if (prevBlock && prevBlock.getNextBlock() == this) {
        this.squareTopLeftCorner_ = true;
       }
    } else if (Blockly.BlockSvg.START_HAT) {
      // No output or previous connection.
      this.squareTopLeftCorner_ = true;
      this.startHat_ = true;
      inputRows.rightEdge = Math.max(inputRows.rightEdge, 100);
    }
    var nextBlock = this.getNextBlock();
    if (nextBlock) {
      this.squareBottomLeftCorner_ = true;
    }
  }
  // Not Use this varible;
  this.squareTopLeftCorner_ = false;
  this.squareBottomLeftCorner_ = false;
//  console.log(this.squareTopLeftCorner_);
  // Fetch the block's coordinates on the surface for use in anchoring
  // the connections.
  var connectionsXY = this.getRelativeToSurfaceXY();

  // Assemble the block's path.
  // steps : 겉 테두리
  // inlineSteps 안으로 삽입되는 블록의 테두리
  var steps = [];
  var inlineSteps = [];
  // The highlighting applies to edges facing the upper-left corner.
  // Since highlighting is a two-pixel wide border, it would normally overhang
  // the edge of the block by a pixel. So undersize all measurements by a pixel.
  var highlightSteps = [];
  var highlightInlineSteps = [];

  this.renderDrawTop_(steps, highlightSteps, connectionsXY,
      inputRows.rightEdge, inputRows);
  
  
  var cursorY = this.renderDrawRight_(steps, highlightSteps, inlineSteps,
      highlightInlineSteps, connectionsXY, inputRows, iconWidth);
  
  this.renderDrawBottom_(steps, highlightSteps, connectionsXY, cursorY);
  this.renderDrawLeft_(steps, highlightSteps, connectionsXY, cursorY);
 
  var pathString = steps.join(' ') + '\n' + inlineSteps.join(' ');
  this.svgPath_.setAttribute('d', pathString);


  Blockly.addClass_(this.svgPath_, this.blockPathCss);

  if (this.signicon_circle && !this.rectBasicIcon) {
    Blockly.setAttributes(this._icon_circle, this.iconCircleData);
    this._icon.setAttribute('class', this.blockIconCss);
    this._icon.setAttribute('d', this.blockIconPath);
    this.removeElementNode_(this._icon_rect);
    this.removeElementNode_(this._icon_text);
  } else if (this.rectBasicIcon) {
    Blockly.setAttributes(this._icon_rect, this.iconRectData);
    this._icon_group.setAttribute('class', this.icon_filter);
    this._icon.setAttribute('class', this.blockIconCss);
    this._icon.setAttribute('d', this.blockIconPath);
    this.removeElementNode_(this._icon_circle);
    this.removeElementNode_(this._icon_text);
  } else if (this.signicon_rect) {
    Blockly.setAttributes(this._icon_rect, this.iconRectData);
    this._icon_text.setAttribute('x', 15.99);
    this._icon_text.setAttribute('y', 24.433);
    this._icon_text.textContent = Blockly.Msg.CONTROLS_IF_MSG_IF;
    this.removeElementNode_(this._icon_circle);
    this.removeElementNode_(this._icon);
  } else {
    this.removeElementNode_(this._icon_circle);
    this.removeElementNode_(this._icon);
    this.removeElementNode_(this._icon_rect);
    this.removeElementNode_(this._icon_text);
  }

  if (this.inputsInline && !this.rectBasicIcon) {
    if (!this.isAppendStatement) {
      this.offset_additional_padding += 4;
    } 
    // 만약 아이콘인 경우 padding 을 4 올려야함.
    if (!this.repeatIcon && this.isAppendStatement) {
      this.offset_additional_padding += 4;
    }
    if (this.signicon_circle) {
      this._icon_circle.setAttribute('transform', 'translate(0,'+ this.offset_additional_padding +')');
      this._icon.setAttribute('transform', 'translate(0,' + this.offset_additional_padding + ')');
    } else if (this.signicon_rect) {
      this._icon_rect.setAttribute('transform', 'translate(0,' + this.offset_additional_padding +')');
      this._icon_text.setAttribute('transform', 'translate(0,' + this.offset_additional_padding +')');
    }
  }

  if (this.blockIconPath_back) {
      this._icon_back.setAttribute('d', this.blockIconPath_back);
      this._icon_back.setAttribute('class', this.blockIconCss_back);  
  } else {
    this.removeElementNode_(this._icon_back);
  }

  if (this.icon_filter) {
    this._icon_group.setAttribute('class', this.icon_filter);
  }

  if (this.blockIconSub) {
    Blockly.setAttributes(this._icon_circle_image, this.blockIconSub);
  } else {
    this.removeElementNode_(this._icon_circle_image);
  }

  if (this.repeatIcon) {
    this._icon_bottom.setAttribute('class', this.blockIconBottomCss);
    this._icon_bottom.setAttribute('d', this.blockIconBottomPath)
    this._icon_bottom.setAttribute('transform', 'translate('+this.rightWidth+', '+this.rightHeight+')');
  } else {
    this.removeElementNode_(this._icon_bottom);
  }

   


  if (this.RTL) {
    // Mirror the block's path.
    this.svgPath_.setAttribute('transform', 'scale(-1 1)');
    this.svgPathLight_.setAttribute('transform', 'scale(-1 1)');
    this.svgPathDark_.setAttribute('transform', 'translate(1,1) scale(-1 1)');
  }
};

/**
 * Render the top edge of the block.
 * @param {!Array.<string>} steps Path of block outline.
 * @param {!Array.<string>} highlightSteps Path of block highlights.
 * @param {!Object} connectionsXY Location of block.
 * @param {number} rightEdge Minimum width of block.
 * @private
 */
Blockly.BlockSvg.prototype.renderDrawTop_ =
    function(steps, highlightSteps, connectionsXY, rightEdge, inputRows) {
  // Position the cursor at the top-left starting point.
  if (this.squareTopLeftCorner_) {
    steps.push('m 0,0');
    if (this.startHat_) {
      steps.push(Blockly.BlockSvg.START_HAT_PATH);
    }
  } else {
    if (this.blockPathType == Blockly.Block.BT_NUMBER) {
      steps.push('m 0, 12');
      steps.push("a12,12,0,0,1,12,-12");
    } 
    else if (this.blockPathType == Blockly.Block.BT_BOOLEAN) {
      steps.push('m 0, 10');
      steps.push("a10,10,0,0,1,10,-10");
    } else {
      steps.push('m 0, 16');
      steps.push('a16,16 0 0 1 16,-16');
    }
  } 
  // Top edge.
  if (this.previousConnection) {
    steps.push('H', Blockly.BlockSvg.NOTCH_WIDTH - 8.5);    
    steps.push(Blockly.BlockSvg.NOTCH_PATH_LEFT);
    // Create previous block connection.
    var connectionX = connectionsXY.x + (Blockly.BlockSvg.NOTCH_WIDTH);
    var connectionY = connectionsXY.y;
    this.previousConnection.moveTo(connectionX, connectionY);
    // This connection will be tightened when the parent renders.
  }

  // For reduce length.
  if (this.blockPathType == Blockly.Block.BT_BASIC || 
    this.blockPathType == Blockly.Block.BT_EVENT) 
  {  
    if(inputRows[0].type == Blockly.BlockSvg.INLINE) {
      steps.push('H', rightEdge);
      this.width = rightEdge;
    } else {
      steps.push('H', rightEdge - 40);
      this.width = rightEdge - 40;
    }
  } else if (this.blockPathType == Blockly.Block.BT_BOOLEAN) {
    steps.push('H', rightEdge - 10);
    this.width = rightEdge - 10;
  } else {
    // 둥근걸 추가하기 때문에 미리 빼
    steps.push('H', rightEdge - 12);
    this.width = rightEdge - 12;
  }
};

/**
 * Render the right edge of the block.
 * @param {!Array.<string>} steps Path of block outline.
 * @param {!Array.<string>} highlightSteps Path of block highlights.
 * @param {!Array.<string>} inlineSteps Inline block outlines.
 * @param {!Array.<string>} highlightInlineSteps Inline block highlights.
 * @param {!Object} connectionsXY Location of block.
 * @param {!Array.<!Array.<!Object>>} inputRows 2D array of objects, each
 *     containing position information.
 * @param {number} iconWidth Offset of first row due to icons.
 * @return {number} Height of block.
 * @private
 */
Blockly.BlockSvg.prototype.renderDrawRight_ = function(steps, highlightSteps,
    inlineSteps, highlightInlineSteps, connectionsXY, inputRows, iconWidth) {
  var cursorX;
  var cursorY = 0;
  var connectionX, connectionY;
  for (var y = 0, row; row = inputRows[y]; y++) {
    cursorX = Blockly.BlockSvg.SEP_SPACE_X;
    if (y == 0) {
      cursorX += this.RTL ? -iconWidth : iconWidth;
    }

    if (this.isCollapsed()) {
      console.log("Collapsed is occured!!!");
      //Todo Removed this line when after open
      // Jagged right edge.
      var input = row[0];
      var fieldX = cursorX;
      var fieldY = cursorY;
      this.renderFields_(input.fieldRow, fieldX, fieldY);
      steps.push(Blockly.BlockSvg.JAGGED_TEETH);
      var remainder = row.height - Blockly.BlockSvg.JAGGED_TEETH_HEIGHT;
      steps.push('v', remainder);
  
      this.width += Blockly.BlockSvg.JAGGED_TEETH_WIDTH;
    } else if (row.type == Blockly.BlockSvg.INLINE) {
      // Inline inputs.
      for (var x = 0, input; input = row[x]; x++) {
        // Loop 문의 "번" 자간 간격 조정
         
        if( this.blockPathType == Blockly.Block.BT_CONTROL &&
            input.type == Blockly.DUMMY_INPUT ) { 
            cursorX -= 5;
        }
        var fieldX = cursorX;
        var fieldY = cursorY - 2;
        if (row.thicker) {
          // Lower the field slightly.
          fieldY += Blockly.BlockSvg.INLINE_PADDING_Y + 3;
        }
        // Slightly down "ELSE" label.
        if (input.name == "else") {
          fieldY += 2;
        } else if ( this.blockPathType == Blockly.Block.BT_CONTROL ||
                    this.blockPathType == Blockly.Block.BT_BASIC ||
                    this.blockPathType == Blockly.Block.BT_EVENT) {
          fieldY += ((row.height - input.renderHeight)/2) - 7;
          this.offset_additional_padding = ((row.height - input.renderHeight)/2) - 7; 
        }

        // TODO: Align inline field rows (left/right/centre)
        cursorX = this.renderFields_(input.fieldRow, fieldX, fieldY);
        if (input.type != Blockly.DUMMY_INPUT) {
          // 아무것도 없을시에 기본 여백을 줘야하는 코드 추가해야함
          if(input.connection.targetConnection == null) {
            input.renderWidth = 50;
            input.renderHeight += 2;
          }
          cursorX += input.renderWidth;
        } 

        if (input.type == Blockly.INPUT_VALUE) {
          //console.log(input.renderWidth);
          // Inner block's border line do not need.
          /*
          if(input.connection.check_ == "Boolean") {
            inlineSteps.push('M', (cursorX - Blockly.BlockSvg.SEP_SPACE_X - 1 ) +
            ',' + (cursorY + Blockly.BlockSvg.INLINE_PADDING_Y + 10)); 
            inlineSteps.push('a10,10,0,0,0,-10,-10 ');
            inlineSteps.push('h', Blockly.BlockSvg.TAB_WIDTH -
                             input.renderWidth + 20);
            inlineSteps.push('a10,10,0,0,0,-10,10 ');
            inlineSteps.push('v', input.renderHeight - 20 - 1);
            inlineSteps.push('a10,10,0,0,0,10,10');
            inlineSteps.push('h', input.renderWidth -
                             Blockly.BlockSvg.TAB_WIDTH - 20);
            inlineSteps.push('a10,10,0,0,0,10,-10');
            inlineSteps.push('v', -((input.renderHeight - 20 - 8 - 2)/2));
            inlineSteps.push('a4.5,4.5 0 0 1 0, -9');
            inlineSteps.push('z');          
          } else {
            inlineSteps.push('M', (cursorX - Blockly.BlockSvg.SEP_SPACE_X - 1 ) +
            ',' + (cursorY + Blockly.BlockSvg.INLINE_PADDING_Y + 12)); 
            inlineSteps.push('a12,12,0,0,0,-12,-12 ');
            inlineSteps.push('h', Blockly.BlockSvg.TAB_WIDTH -
                             input.renderWidth + 24);
            inlineSteps.push('a12,12,0,0,0,-12,12 ');
            inlineSteps.push('v', input.renderHeight - 24 - 1);
            inlineSteps.push('a12,12,0,0,0,12,12 ');
            inlineSteps.push('h', input.renderWidth -
                             Blockly.BlockSvg.TAB_WIDTH - 24);
            inlineSteps.push('a12,12,0,0,0,12,-12');
            inlineSteps.push('z');     
          }
          */
  
          // Create inline input connection.
          if (this.RTL) {
            connectionX = connectionsXY.x - cursorX -
                Blockly.BlockSvg.TAB_WIDTH + Blockly.BlockSvg.SEP_SPACE_X +
                input.renderWidth + 1;
          } else {
            connectionX = connectionsXY.x + cursorX +
                Blockly.BlockSvg.TAB_WIDTH - Blockly.BlockSvg.SEP_SPACE_X -
                input.renderWidth - 1;
          }
          connectionY = connectionsXY.y + cursorY +
              Blockly.BlockSvg.INLINE_PADDING_Y + 1;
          input.connection.moveTo(connectionX, connectionY);
          if (input.connection.targetConnection) {
            input.connection.tighten_();
          }
        }
      }

      // 오른쪽 사이드를 좁히기
      var roundOffset = 0;

      if (this.blockPathType == Blockly.Block.BT_CONTROL) {
        roundOffset = 17;
      } else if (this.blockPathType == Blockly.Block.BT_NUMBER) {
        roundOffset = 12;
      } else if (this.blockPathType == Blockly.Block.BT_BOOLEAN) {
        roundOffset = 10;
      } else if (this.blockPathType == Blockly.Block.BT_EVENT) {
        roundOffset = 16;
      } else if (this.blockPathType == Blockly.Block.BT_BASIC) {
        roundOffset = 18;
      }

      cursorX -= roundOffset;
      cursorX = Math.max(cursorX, inputRows.rightEdge);
      this.width = Math.max(this.width, cursorX);
      // 인풋 블록으로 인한 추가 블록 // 꺽으면 
      steps.push('H', this.width);


      if (this.blockPathType == Blockly.Block.BT_NUMBER) {
        steps.push('a12,12 0 0 1 12,12');
        steps.push('v', row.height-24);
        steps.push('a12,12 0 0 1 -12,12');
        this.width += 12;
      } else if(this.blockPathType == Blockly.Block.BT_BOOLEAN) {
      //} else if(this.type.indexOf("logic_condition") != -1) { 
        row.height = row.height >= 32 ? row.height : 32;
        var offset = 20;
        steps.push("a10,10,0,0,1,10,10");
        steps.push("v", (row.height-offset-9)/2);
        steps.push("a4.5,4.5,0,1,0,0,9");
        steps.push("v", (row.height-offset-9)/2);
        steps.push("a10,10,0,0,1,-10,10");
        this.width += 10;
      } 
      /* // 뭔지 기억안나서 그냥 지움 
       else if(this.type.indexOf("logic") != -1) { 
        row.height = row.height >= 29 ? row.height : 29;
        steps.push('a10,10 0 0 1 10,10');
        steps.push("v", (row.height-20-9)/2);
        steps.push("a4.5,4.5,0,1,0,0,9");
        steps.push("v", (row.height-20-9)/2);
        steps.push('a10,10 0 0 1 -10,10');
        this.width += 10;
        }
      */
      else if(this.blockPathType == Blockly.Block.BT_EVENT) { 
        if(row.height < 32)
          row.height = 32;
        steps.push('a16,16 0 0 1 16,16');
        steps.push('v', row.height-32);
        steps.push('a16,16 0 0 1 -16,16');
      } else if(this.blockPathType == Blockly.Block.BT_BASIC) { 
        if(row.height < 32)
          row.height = 32;
        steps.push('a16,16 0 0 1 16,16');
        steps.push('v', row.height-32);
        steps.push('a16,16 0 0 1 -16,16');
        this.width += 10;
      }
       else {
        // Controls's block 
        // For else's height
        if(row.height < 32)
          row.height = 32;
        steps.push('a16,16 0 0 1 16,16');
        steps.push('v', row.height-32);
        steps.push('a16,16 0 0 1 -16,16');
      }
      this.rightHeight = row.height;
      if (this.RTL) {
        highlightSteps.push('v', row.height - 1);
      }
    } else if (row.type == Blockly.INPUT_VALUE) { //이건 안쓸거지롱 
      // External input.
      var input = row[0];
      var fieldX = cursorX;
      var fieldY = cursorY;
      if (input.align != Blockly.ALIGN_LEFT) {
        var fieldRightX = inputRows.rightEdge - input.fieldWidth -
            Blockly.BlockSvg.TAB_WIDTH - 2 * Blockly.BlockSvg.SEP_SPACE_X;
        if (input.align == Blockly.ALIGN_RIGHT) {
          fieldX += fieldRightX;
        } else if (input.align == Blockly.ALIGN_CENTRE) {
          fieldX += fieldRightX / 2;
        }
      }
      this.renderFields_(input.fieldRow, fieldX, fieldY);
      steps.push(Blockly.BlockSvg.TAB_PATH_DOWN);
      var v = row.height - Blockly.BlockSvg.TAB_HEIGHT;
      steps.push('v', v);

      // Create external input connection.
      connectionX = connectionsXY.x +
          (this.RTL ? -inputRows.rightEdge - 1 : inputRows.rightEdge + 1);
      connectionY = connectionsXY.y + cursorY;
      input.connection.moveTo(connectionX, connectionY);
      if (input.connection.targetConnection) {
        input.connection.tighten_();
        this.width = Math.max(this.width, inputRows.rightEdge +
            input.connection.targetBlock().getHeightWidth().width -
            Blockly.BlockSvg.TAB_WIDTH + 1);
      }
    } else if (row.type == Blockly.DUMMY_INPUT) {
      // External naked field.
      var input = row[0];
      var fieldX = cursorX;
      var fieldY = cursorY;
      //???모르겠음 무시하자 아직 안쓰임
      if (input.align != Blockly.ALIGN_LEFT) {
        var fieldRightX = inputRows.rightEdge - input.fieldWidth -
            2 * Blockly.BlockSvg.SEP_SPACE_X;
        if (inputRows.hasValue) {
          fieldRightX -= Blockly.BlockSvg.TAB_WIDTH;
        }
        if (input.align == Blockly.ALIGN_RIGHT) {
          fieldX += fieldRightX;
        } else if (input.align == Blockly.ALIGN_CENTRE) {
          fieldX += fieldRightX / 2;
        }
      }

      if (this.blockPathType == Blockly.Block.BT_BASIC ||
          this.blockPathType == Blockly.Block.BT_EVENT) {

        this.renderFields_(input.fieldRow, fieldX, fieldY);
        //steps.push('v 32');
        row.height = 32;
        this.width += 16;
        var minheight = 32;
        steps.push("a16,16,0,0,1,16,16");
        steps.push("v", row.height - minheight);
        steps.push("a16,16,0,0,1,-16,16");
        // 16 : Additional width of start block"
      } else if (this.blockPathType == Blockly.Block.BT_NUMBER) {
        // 인풋 숫자를 2.5 만큼 위로
        this.renderFields_(input.fieldRow, fieldX, fieldY-4);
        //Input variable
        row.height = 24;
        this.width += 12;
        var minheight = 24;
        steps.push("a12,12,0,0,1,12,12");
        //steps.push("v", row.height - minheight);
        steps.push("a12,12,0,0,1,-12,12");
        //steps.push('v', row.height);
      } 
      /*
      //이거 왜있는건지 모르겠음. 삭제.
      else if(this.type.indexOf("logic_condition") != -1) {
        //else if (this.blockPathType == Blockly.Block.BT_BOOLEAN) {
          console.log("????")
        this.renderFields_(input.fieldRow, fieldX, fieldY-3);
        row.height = row.height >= 32 ? row.height : 32;
        this.width += 10;
        var minheight = 20;
        steps.push("a10,10,0,0,1,10,10");
        steps.push("v", row.height - minheight);
        steps.push("a10,10,0,0,1,-10,10");
      } 
      */
      else if (this.blockPathType == Blockly.Block.BT_BOOLEAN) {      
        this.renderFields_(input.fieldRow, fieldX, fieldY-3);
        this.width += 10;
        row.height = row.height >= 29 ? row.height : 29;
        steps.push('a10,10 0 0 1 10,10');
        steps.push("v", (row.height-20-9)/2);
        steps.push("a4.5,4.5,0,1,0,0,9");
        steps.push("v", (row.height-20-9)/2);
        steps.push('a10,10 0 0 1 -10,10');
      }
      
      else { 
        this.renderFields_(input.fieldRow, fieldX, fieldY);
        steps.push('v', row.height);
      }
      if (this.RTL) {
        highlightSteps.push('v', row.height - 1);
      }
    } else if (row.type == Blockly.NEXT_STATEMENT) {
      // Nested statement.
      var input = row[0];

      if (y == 0) {
        console.log("????????????????????????");
        // If the first input is a statement stack, add a small row on top.
        steps.push('v', Blockly.BlockSvg.SEP_SPACE_Y);
        if (this.RTL) {
          highlightSteps.push('v', Blockly.BlockSvg.SEP_SPACE_Y - 1);
        }
        cursorY += Blockly.BlockSvg.SEP_SPACE_Y;
      }
      var fieldX = cursorX;
      var fieldY = cursorY;
      if (input.align != Blockly.ALIGN_LEFT) {
        var fieldRightX = inputRows.statementEdge - input.fieldWidth -
            2 * Blockly.BlockSvg.SEP_SPACE_X;
        if (input.align == Blockly.ALIGN_RIGHT) {
          fieldX += fieldRightX;
        } else if (input.align == Blockly.ALIGN_CENTRE) {
          fieldX += fieldRightX / 2;
        }
      }
      this.renderFields_(input.fieldRow, fieldX, fieldY);
      cursorX = inputRows.statementEdge + Blockly.BlockSvg.NOTCH_WIDTH;
      cursorX = 70.86499;  //DownSide Notch position
      steps.push('H', cursorX);
      steps.push(Blockly.BlockSvg.INNER_TOP_LEFT_CORNER);
      //console.log(Blockly.BlockSvg.INNER_TOP_LEFT_CORNER);
      row.height -= 3;
      row.height = Math.max(row.height, 34);
      steps.push('v', row.height - 2 * (Blockly.BlockSvg.CORNER_RADIUS +1 ));
      steps.push(Blockly.BlockSvg.INNER_BOTTOM_LEFT_CORNER);
      steps.push('h10.41998');
      steps.push('a5,5 0 0 0 9.16003,0');
      steps.push('H', this.width);
      this.rightWidth = this.width;
      cursorX -= 0.5; // 디자인에 맞춘 이동값
      // Create statement connection.
      connectionX = connectionsXY.x + (this.RTL ? -cursorX : cursorX + 1);
      connectionY = connectionsXY.y + cursorY + 1;
      input.connection.moveTo(connectionX, connectionY);
      if (input.connection.targetConnection) {
        input.connection.tighten_();
        this.width = Math.max(this.width, inputRows.statementEdge +
            input.connection.targetBlock().getHeightWidth().width);
      }
      if (y == inputRows.length - 1 ||
          inputRows[y + 1].type == Blockly.NEXT_STATEMENT) {
        // If the final input is a statement stack, add a small row underneath.
        // Consecutive statement stacks are also separated by a small divider.
        //steps.push('v', Blockly.BlockSvg.SEP_SPACE_Y);
        steps.push('a16,16 0 0 1 0,32');
        
        this.rightHeight += (row.height + 34);

        if (this.RTL) {
          highlightSteps.push('v', Blockly.BlockSvg.SEP_SPACE_Y - 1);
        }
       // cursorY += Blockly.BlockSvg.SEP_SPACE_Y;
        cursorY += 32;
      }
    }
    cursorY += row.height;
  }
  if (!inputRows.length) {
    console.log("nono");
    cursorY = Blockly.BlockSvg.MIN_BLOCK_Y;
    steps.push('V', cursorY);
    if (this.RTL) {
      highlightSteps.push('V', cursorY - 1);
    }
  }
  return cursorY;
};

/**
 * Render the bottom edge of the block.
 * @param {!Array.<string>} steps Path of block outline.
 * @param {!Array.<string>} highlightSteps Path of block highlights.
 * @param {!Object} connectionsXY Location of block.
 * @param {number} cursorY Height of block.
 * @private
 */
Blockly.BlockSvg.prototype.renderDrawBottom_ =
    function(steps, highlightSteps, connectionsXY, cursorY) {

    this.height = cursorY + 1;  // Add one for the shadow.

  if (this.nextConnection) {
      steps.push('H', (Blockly.BlockSvg.NOTCH_WIDTH + (this.RTL ? 0.5 : - 0.5)) +
          ' ' + Blockly.BlockSvg.NOTCH_PATH_RIGHT);
      // Create next block connection
    var connectionX;
    if (this.RTL) {
      connectionX = connectionsXY.x - Blockly.BlockSvg.NOTCH_WIDTH;
    } else {   
      connectionX = connectionsXY.x + Blockly.BlockSvg.NOTCH_WIDTH;     
    }
    var connectionY = connectionsXY.y + cursorY + 1;
    this.nextConnection.moveTo(connectionX, connectionY);
    if (this.nextConnection.targetConnection) {
      this.nextConnection.tighten_();
    }
    this.height += 4;  // Height of tab.
  }

  // Should the bottom-left corner be rounded or square?
  if (this.squareBottomLeftCorner_) {
    steps.push('H 0');
    if (!this.RTL) {
      highlightSteps.push('M', '0.5,' + (cursorY - 0.5));
    }
  } else {
    if (this.blockPathType == Blockly.Block.BT_NUMBER) {
      steps.push('H 12');
       var minheight = 24;
      steps.push("a12,12,0,0,1,-12,-12");
    } else if (this.blockPathType == Blockly.Block.BT_BOOLEAN) {
      steps.push('H 10');
      var minheight = 20;
      steps.push("a10,10,0,0,1,-10,-10"); 
    } else {
      steps.push('H', Blockly.BlockSvg.CORNER_RADIUS);
      steps.push('a', Blockly.BlockSvg.CORNER_RADIUS + ',' +
                 Blockly.BlockSvg.CORNER_RADIUS + ' 0 0,1 -' +
                 Blockly.BlockSvg.CORNER_RADIUS + ',-' +
                 Blockly.BlockSvg.CORNER_RADIUS);
    }
    if (!this.RTL) {
      highlightSteps.push('M', Blockly.BlockSvg.DISTANCE_45_INSIDE + ',' +
          (cursorY - Blockly.BlockSvg.DISTANCE_45_INSIDE));
      highlightSteps.push('A', (Blockly.BlockSvg.CORNER_RADIUS - 0.5) + ',' +
          (Blockly.BlockSvg.CORNER_RADIUS - 0.5) + ' 0 0,1 ' +
          '0.5,' + (cursorY - Blockly.BlockSvg.CORNER_RADIUS));
    }
  }
};

/**
 * Render the left edge of the block.
 * @param {!Array.<string>} steps Path of block outline.
 * @param {!Array.<string>} highlightSteps Path of block highlights.
 * @param {!Object} connectionsXY Location of block.
 * @param {number} cursorY Height of block.
 * @private
 */
Blockly.BlockSvg.prototype.renderDrawLeft_ =
    function(steps, highlightSteps, connectionsXY, cursorY) {
     // console.log(steps);
  if (this.outputConnection) {
    // Create output connection.
    this.outputConnection.moveTo(connectionsXY.x, connectionsXY.y);
    // This connection will be tightened when the parent renders.
    // TODO 숫자 변수 어딘가에서 빠졌음 
    this.width += Blockly.BlockSvg.TAB_WIDTH;
  } 
  steps.push('z');
};