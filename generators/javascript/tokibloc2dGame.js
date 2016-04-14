'use strict';

goog.provide('Blockly.JavaScript.gameblock');

goog.require('Blockly.JavaScript');


Blockly.JavaScript['moveUp_Static'] = function(block) {
  return "move('up');\n";
};

Blockly.JavaScript['moveRight_Static'] = function(block) {
  return "move('right');\n";
};

Blockly.JavaScript['moveLeft_Static'] = function(block) {
  return "move('left');\n";
};

Blockly.JavaScript['moveDown_Static'] = function(block) {
  return "move('down');\n";
};


Blockly.JavaScript['moveUp'] = function(block) {
  var value_a = Blockly.JavaScript.valueToCode(block, 'COUNT', Blockly.JavaScript.ORDER_NONE);
  var bundle = [];
  var hightlightCount = 0;
  if( value_a > 1 ){
    hightlightCount = value_a-1;
  }
  for(var i = 0; i < value_a; i++) {
    bundle.push("move('up');\n");
    if(hightlightCount-- >0)
      bundle.push("highlightBlock("+ block.id +");\n");
  }
  return bundle.join("");
};

Blockly.JavaScript['moveRight'] = function(block) {
  var value_a = Blockly.JavaScript.valueToCode(block, 'COUNT', Blockly.JavaScript.ORDER_NONE);
  var bundle = [];
  var hightlightCount = 0;
  if( value_a > 1 ){
    hightlightCount = value_a-1;
  }
  for(var i = 0; i < value_a; i++) {
    bundle.push("move('right');\n");
    if(hightlightCount-- >0)
      bundle.push("highlightBlock("+ block.id +");\n");
  }
  return bundle.join("");
};

Blockly.JavaScript['moveLeft'] = function(block) {
  var value_a = Blockly.JavaScript.valueToCode(block, 'COUNT', Blockly.JavaScript.ORDER_NONE);
  var bundle = [];
  var hightlightCount = 0;
  if( value_a > 1 ){
    hightlightCount = value_a-1;
  }
  for(var i = 0; i < value_a; i++) {
    bundle.push("move('left');\n");
    if(hightlightCount-- >0)
      bundle.push("highlightBlock("+ block.id +");\n");
  }
  return bundle.join("");
};

Blockly.JavaScript['moveDown'] = function(block) {
  var value_a = Blockly.JavaScript.valueToCode(block, 'COUNT', Blockly.JavaScript.ORDER_NONE);
  var bundle = [];
  var hightlightCount = 0;
  if( value_a > 1 ){
    hightlightCount = value_a-1;
  }
  for(var i = 0; i < value_a; i++) {
    bundle.push("move('down');\n");
    if(hightlightCount-- >0)
      bundle.push("highlightBlock("+ block.id +");\n");
  }
  return bundle.join("");
};

Blockly.JavaScript['jumpUp_Static'] = function(block) {
  return "jump('up');\n";
};

Blockly.JavaScript['jumpDown_Static'] = function(block) {
  return "jump('down');\n";
};
Blockly.JavaScript['jumpLeft_Static'] = function(block) {
  return "jump('left');\n";
};
Blockly.JavaScript['jumpRight_Static'] = function(block) {
  return "jump('right');\n";
};


Blockly.JavaScript['jumpUp'] = function(block) {
  var value_a = Blockly.JavaScript.valueToCode(block, 'COUNT', Blockly.JavaScript.ORDER_NONE);
  var bundle = [];
  var hightlightCount = 0;
  if( value_a > 1 ){
    hightlightCount = value_a-1;
  }
  for(var i = 0; i < value_a; i++) {
    bundle.push("jump('up');\n");
    if(hightlightCount-- >0)
      bundle.push("highlightBlock("+ block.id +");\n");
  }
  return bundle.join("");
};

Blockly.JavaScript['jumpRight'] = function(block) {
  var value_a = Blockly.JavaScript.valueToCode(block, 'COUNT', Blockly.JavaScript.ORDER_NONE);
  var bundle = [];
  var hightlightCount = 0;
  if( value_a > 1 ){
    hightlightCount = value_a-1;
  }
  for(var i = 0; i < value_a; i++) {
    bundle.push("jump('right');\n");
    if(hightlightCount-- >0)
      bundle.push("highlightBlock("+ block.id +");\n");
  }
  return bundle.join("");
};

Blockly.JavaScript['jumpLeft'] = function(block) {
  var value_a = Blockly.JavaScript.valueToCode(block, 'COUNT', Blockly.JavaScript.ORDER_NONE);
  var bundle = [];
  var hightlightCount = 0;
  if( value_a > 1 ){
    hightlightCount = value_a-1;
  }
  for(var i = 0; i < value_a; i++) {
    bundle.push("jump('left');\n");
    if(hightlightCount-- >0)
      bundle.push("highlightBlock("+ block.id +");\n");
  }
  return bundle.join("");
};

Blockly.JavaScript['jumpDown'] = function(block) {
  var value_a = Blockly.JavaScript.valueToCode(block, 'COUNT', Blockly.JavaScript.ORDER_NONE);
  var bundle = [];
  var hightlightCount = 0;
  if( value_a > 1 ){
    hightlightCount = value_a-1;
  }
  for(var i = 0; i < value_a; i++) {
    bundle.push("jump('down');\n");
    if(hightlightCount-- >0)
      bundle.push("highlightBlock("+ block.id +");\n");
  }
  return bundle.join("");
};


Blockly.JavaScript['start_block'] = function(block, b) {
  return "";
};

Blockly.JavaScript['logic_condition'] = function(block) {
  var dropdown_object = block.getFieldValue('OBJECT');
  var OBJECT = {
    'deadEndLeft': 'isLogicConditionTrue("deadEndLeft")',
    'deadEndRight': 'isLogicConditionTrue("deadEndRight")',
    'deadEndUp': 'isLogicConditionTrue("deadEndUp")',
    'deadEndDown': 'isLogicConditionTrue("deadEndDown")',

    'obstacleWallLeft': 'isLogicConditionTrue("obstacleWallLeft")',
    'obstacleWallRight': 'isLogicConditionTrue("obstacleWallRight")',
    'obstacleWallUp': 'isLogicConditionTrue("obstacleWallUp")',
    'obstacleWallDown': 'isLogicConditionTrue("obstacleWallDown")',

    'obstacle': 'isLogicConditionTrue("obstacle")',
    'item': 'isLogicConditionTrue("item")'
  };
  // TODO: Assemble JavaScript into code variable.
  var code = OBJECT[block.getFieldValue('OBJECT')];
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

Blockly.JavaScript['event_click'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = 'click\n';
  return code;
};

Blockly.JavaScript['event_background_change'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = 'event_background_change\n';
  return code;
};

Blockly.JavaScript['event_onclick_key'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = 'event_onclick\n';
  return code;
};

Blockly.JavaScript['event_onclick_object'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  return '';
};

Blockly.JavaScript['event_number_lt'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = 'event_number_lt\n';
  return code;
};

Blockly.JavaScript['event_message_receive'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = 'event_message_receive\n';
  return code;
};
Blockly.JavaScript['event_message_send'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = 'event_message_send\n';
  return code;
};
Blockly.JavaScript['event_message_send_wait'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = 'event_number_lt\n';
  return code;
};
Blockly.JavaScript['event_message_send_wait'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = 'event_message_send_wait\n';
  return code;
};
Blockly.JavaScript['move_to_point'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = 'move_to_point\n';
  return code;
};
Blockly.JavaScript['move_look_point'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = 'move_look_point\n';
  return code;
};
Blockly.JavaScript['move_look_dir'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = 'move_look_dir\n';
  return code;
};
Blockly.JavaScript['move_turnLeft'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = 'move_turnLeft\n';
  return code;
};

Blockly.JavaScript['move_turnRight'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = 'move_turnRight\n';
  return code;
};





