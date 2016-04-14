'use strict';

goog.provide('Blockly.Blocks.gameblock');

goog.require('Blockly.Blocks');


Blockly.Blocks['moveUp_Static'] = {
  init: function() {
    this.setBlockIcon("moveUp");
    this.setSignIcon(Blockly.SIGN_CIRCLE);
    this.appendDummyInput()
        .appendField("이동하기");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(210);
    this.setTooltip('위쪽 방향으로 움직이게 합니다.');
    /*this.setHelpUrl('http://www.example.com/');*/
  }
};

Blockly.Blocks['moveRight_Static'] = {
  init: function() {
    this.setBlockIcon("moveRight");
    this.setSignIcon(Blockly.SIGN_CIRCLE);
    this.appendDummyInput()
        .appendField("이동하기");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(210);
    this.setTooltip('오른쪽 방향으로 움직이게 합니다.');
    /*this.setHelpUrl('http://www.example.com/');*/
  }
};

Blockly.Blocks['moveLeft_Static'] = {
  init: function() {
    this.setBlockIcon("moveLeft");
    this.setSignIcon(Blockly.SIGN_CIRCLE);
    this.appendDummyInput()
        .appendField("이동하기");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(210);
    this.setTooltip('왼쪽 방향으로 움직이게 합니다.');
    /*this.setHelpUrl('http://www.example.com/');*/
  }
};


Blockly.Blocks['moveDown_Static'] = {
  init: function() {
    this.setBlockIcon("moveDown");
    this.setSignIcon(Blockly.SIGN_CIRCLE);
    this.appendDummyInput()
        .appendField("이동하기");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(210);
    this.setTooltip('아래쪽 방향으로 움직이게 합니다.');
    /*this.setHelpUrl('http://www.example.com/');*/
  }
};




Blockly.Blocks['moveUp'] = {
  init: function() {
    this.setBlockIcon("moveUp");
    this.setSignIcon(Blockly.SIGN_CIRCLE);
    this.appendValueInput('COUNT')
        .setCheck('Number');
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(210);
    this.setTooltip('');
    /*this.setHelpUrl('http://www.example.com/');*/
  }
};

Blockly.Blocks['moveRight'] = {
  init: function() {
    this.setBlockIcon("moveRight");
    this.setSignIcon(Blockly.SIGN_CIRCLE);
    this.appendValueInput('COUNT')
        .setCheck('Number');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setColour(210);
    this.setTooltip('');
    /*this.setHelpUrl('http://www.example.com/');*/
  }
};

Blockly.Blocks['moveLeft'] = {
  init: function() {
    this.setBlockIcon("moveLeft");
    this.setSignIcon(Blockly.SIGN_CIRCLE);
    this.appendValueInput('COUNT')
        .setCheck('Number');
    this.setPreviousStatement(true);
    this.setInputsInline(true);
    this.setNextStatement(true);
    this.setColour(210);
    this.setTooltip('');
    /*this.setHelpUrl('http://www.example.com/');*/
  }
};


Blockly.Blocks['moveDown'] = {
  init: function() {
    this.setBlockIcon("moveDown");
    this.setSignIcon(Blockly.SIGN_CIRCLE);
    this.appendValueInput('COUNT')
        .setCheck('Number');
    this.setPreviousStatement(true);
    this.setInputsInline(true);
    this.setNextStatement(true);
    this.setColour(210);
    this.setTooltip('');
    /*this.setHelpUrl('http://www.example.com/');*/
  }
};


Blockly.Blocks['jumpUp_Static'] = {
  init: function() {
    this.setBlockIcon("jump");
    this.setSignIcon(Blockly.SIGN_CIRCLE);
    this.appendDummyInput()
        .appendField("점프하기");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(210);
    this.setTooltip('');
    /*this.setHelpUrl('http://www.example.com/');*/
  }
};

Blockly.Blocks['jumpDown_Static'] = {
  init: function() {
    this.setBlockIcon("jump");
    this.setSignIcon(Blockly.SIGN_CIRCLE);
    this.appendDummyInput()
        .appendField("점프하기");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(210);
    this.setTooltip('');
    /*this.setHelpUrl('http://www.example.com/');*/
  }
};

Blockly.Blocks['jumpLeft_Static'] = {
  init: function() {
    this.setBlockIcon("jump");
    this.setSignIcon(Blockly.SIGN_CIRCLE);
    this.appendDummyInput()
        .appendField("점프하기");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(210);
    this.setTooltip('');
    /*this.setHelpUrl('http://www.example.com/');*/
  }
};

Blockly.Blocks['jumpRight_Static'] = {
  init: function() {
    this.setBlockIcon("jump");
    this.setSignIcon(Blockly.SIGN_CIRCLE);
    this.appendDummyInput()
        .appendField("점프하기");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(210);
    this.setTooltip('');
    /*this.setHelpUrl('http://www.example.com/');*/
  }
};

Blockly.Blocks['jumpUp'] = {
  init: function() {
    this.setBlockIcon("jump");
    this.setSignIcon(Blockly.SIGN_CIRCLE);
    this.appendValueInput('COUNT')
        .setCheck('Number');
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(210);
    this.setTooltip('');
    //this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.Blocks['jumpRight'] = {
  init: function() {
    this.setBlockIcon("jump");
    this.setSignIcon(Blockly.SIGN_CIRCLE);
    this.appendValueInput('COUNT')
        .setCheck('Number');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setColour(210);
    this.setTooltip('');
    //this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.Blocks['jumpLeft'] = {
  init: function() {
    this.setBlockIcon("jump");
    this.setSignIcon(Blockly.SIGN_CIRCLE);
    this.appendValueInput('COUNT')
        .setCheck('Number');
    this.setPreviousStatement(true);
    this.setInputsInline(true);
    this.setNextStatement(true);
    this.setColour(210);
    this.setTooltip('');
  }
};


Blockly.Blocks['jumpDown'] = {
  init: function() {
    this.setBlockIcon("jump");
    this.setSignIcon(Blockly.SIGN_CIRCLE);
    this.appendValueInput('COUNT')
        .setCheck('Number');
    this.setPreviousStatement(true);
    this.setInputsInline(true);
    this.setNextStatement(true);
    this.setColour(210);
    this.setTooltip('');
  }
};

Blockly.Blocks['start_block'] = {
  init: function() {
    this.setBlockIcon("start_block");
    this.setSignIcon(Blockly.SIGN_CIRCLE);
    this.appendDummyInput()
        .appendField("시작하기");
    this.setNextStatement(true);
    this.setTooltip('');
    this.setColour(160);
  }
};


Blockly.Blocks['logic_condition'] = {
  init: function() {
    this.setBlockIcon("logic_dump");
    this.setSignIcon(Blockly.SIGN_CIRCLE);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
            ["왼쪽이 막혀있으면", "deadEndLeft"], 
            ["오른쪽이 막혀있으면", "deadEndRight"], 
            ["위쪽이 막혀있으면", "deadEndUp"], 
            ["아래쪽이 막혀있으면", "deadEndDown"], 
            ["왼쪽 장애물", "obstacleWallLeft"], 
            ["오른쪽 장애물", "obstacleWallRight"], 
            ["위쪽 장애물", "obstacleWallUp"], 
            ["아래쪽 장애물", "obstacleWallDown"], 
            ["아이템", "item"]]), "OBJECT");
    this.setInputsInline(true);
    this.setOutput(true, "Boolean");
    this.setColour(65);
    this.setTooltip('');
  }
};

Blockly.Blocks['event_click'] = {
  init: function() {
    this.setBlockIcon("event_click");
    this.setSignIcon(Blockly.SIGN_CIRCLE);
    this.appendDummyInput()
        .appendField("클릭했을 때");
    this.setNextStatement(true);
    this.setTooltip('클릭했을 때 실행');
    this.setColour(160);
  }
};

Blockly.Blocks['event_background_change'] = {
  init: function() {
    this.setBlockIcon("event_background_change");
    this.setSignIcon(Blockly.SIGN_CIRCLE);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["기본 배경1", "background1"]]), "OBJECT")
        .appendField("(으)로 바뀌었을 때");
    this.setNextStatement(true);
    this.setTooltip('배경화면 변환시 실행');
    this.setColour(160);
  }
};
Blockly.Blocks['event_onclick_key'] = {
  init: function() {
    this.setBlockIcon("event_onclick_key");
    this.setSignIcon(Blockly.SIGN_CIRCLE);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["스페이스", "spacekey"]]), "OBJECT")
        .appendField("(을)를 눌렀을 때");
    this.setNextStatement(true);
    this.setTooltip('키보드 눌렀을 때 실행');
    this.setColour(160);
  }
};
Blockly.Blocks['event_onclick_object'] = {
  init: function() {
    this.setBlockIcon("event_onclick_object");
    this.setSignIcon(Blockly.SIGN_CIRCLE);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["캐릭터", "object1"]]), "OBJECT");
    this.setNextStatement(true);
    this.setTooltip('캐릭터를 눌렀을 때 실행');
    this.setColour(160);
  }
};

Blockly.Blocks['event_number_lt'] = {
  init: function() {
    this.setBlockIcon("event_number_lt");
    this.setSignIcon(Blockly.SIGN_CIRCLE);
  
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["음량", "object1"]]), "OBJECT")
        .appendField(new Blockly.FieldImage("/assets/editor/greater-than-th.png", 10, 15, "*"));    this.appendValueInput('A')
        .setCheck('Number');
    this.appendDummyInput()
        .appendField("일 때");
    this.setInputsInline(true)
    this.setNextStatement(true);
    this.setTooltip('캐릭터를 눌렀을 때 실행');
    this.setColour(160);
  }
};

Blockly.Blocks['event_message_receive'] = {
  init: function() {
    this.setBlockIcon("event_message");
    this.setSignIcon(Blockly.SIGN_CIRCLE);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["메세지1", "object1"]]), "OBJECT")
        .appendField("을(를) 받았을 때");
    this.setNextStatement(true);
    this.setTooltip('캐릭터를 눌렀을 때 실행');
    this.setColour(160);
  }
};

Blockly.Blocks['event_message_send'] = {
  init: function() {
    this.setBlockIcon("event_message");
    this.setSignIcon(Blockly.SIGN_CIRCLE);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["메세지1", "object1"]]), "OBJECT")
        .appendField("을(를) 보내기");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('캐릭터를 눌렀을 때 실행');
    this.setColour(160);
  }
};

Blockly.Blocks['event_message_send_wait'] = {
  init: function() {
    this.setBlockIcon("event_message");
    this.setSignIcon(Blockly.SIGN_CIRCLE);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["메세지1", "object1"]]), "OBJECT")
        .appendField("을(를) 보내고 기다리기");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('캐릭터를 눌렀을 때 실행');
    this.setColour(160);
  }
};

Blockly.Blocks['move_to_point'] = {
  init: function() {
    this.setBlockIcon("move_to_point");
    this.setSignIcon(Blockly.SIGN_CIRCLE);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["마우스 포인터", "mouse_point"]]), "POINT")
        .appendField("로 이동");
    this.setNextStatement(true);
    this.setPreviousStatement(true);
    this.setTooltip('배경화면 변환시 실행');
    this.setColour(160);
  }
};

Blockly.Blocks['move_look_point'] = {
  init: function() {
    this.setBlockIcon("move_look_point");
    this.setSignIcon(Blockly.SIGN_CIRCLE);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["마우스 포인터", "mouse_point"]]), "POINT");
    this.setNextStatement(true);
    this.setPreviousStatement(true);
    this.setTooltip('배경화면 변환시 실행');
    this.setColour(160);
  }
};

Blockly.Blocks['move_look_dir'] = {
  init: function() {
    this.setBlockIcon("move_look_dir");
    this.setSignIcon(Blockly.SIGN_CIRCLE);
    this.appendDummyInput()
        .appendField(new Blockly.FieldAngle(90), "degree")
        .appendField("도 방향");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('배경화면 변환시 실행');
    this.setColour(160);
  }
};

Blockly.Blocks['move_turnLeft'] = {
  init: function() {
    this.setBlockIcon("move_turnLeft");
    this.setSignIcon(Blockly.SIGN_CIRCLE);
    this.appendValueInput('DEGREE')
        .setCheck('Number');
    this.appendDummyInput()
        .appendField("도");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(210);
    this.setTooltip('');
  }
};

Blockly.Blocks['move_turnRight'] = {
  init: function() {
    this.setBlockIcon("move_turnRight");
    this.setSignIcon(Blockly.SIGN_CIRCLE);
    this.appendValueInput('DEGREE')
        .setCheck('Number');
    this.appendDummyInput()
        .appendField("도");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(210);
    this.setTooltip('');
  }
};
