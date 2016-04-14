'use strict';

goog.provide('Blockly.Category_toolbox');

goog.require('Blockly.Flyout');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.BrowserFeature');
goog.require('goog.html.SafeHtml');
goog.require('goog.math.Rect');
goog.require('goog.style');
goog.require('goog.ui.tree.TreeControl');
goog.require('goog.ui.tree.TreeNode');

/**
 * Class for a Toolbox_category.
 * Creates the toolbox's DOM.
 * @param {!Blockly.Workspace} workspace The workspace in which to create new
 *     blocks.
 * @constructor
 */
Blockly.Category_toolbox = function(workspace) {
  /**
   * @type {!Blockly.Workspace}
   * @private
   */
  this.workspace_ = workspace;
  this.categoryLists_ = [];
};


Blockly.Category_toolbox.prototype.cate_img= {
	catEvent : "assets/images/start.png",
	catControl: "assets/images/start.png"
};

Blockly.Category_toolbox.prototype.cate_msg = {
	catEvent : "시작",
	catControl: "동작"
};


/**
 * Width of the toolbox.
 * @type {number}
 */
Blockly.Category_toolbox.prototype.width = 0;

Blockly.Category_toolbox.prototype.init = function() {
	var workspace = this.workspace_;
	this.populate_(workspace.options.languageTree);

}

/**
 * Fill the toolbox with categories and blocks.
 * @param {Node} newTree DOM tree of blocks, or null.
 * @private
 */
Blockly.Category_toolbox.prototype.populate_ = function(tree) {
	var category = document.getElementById("grepp_category");
	//console.log(tree);
	var rootOut = [];
	//var rootOut = this.tree_;
	var txt;
	var ul_element = Blockly.createElement('ul', "categoryUl");
	category.appendChild(ul_element);
	txt = tree.getElementsByTagName("category");
	for(var i = 0; i < txt.length; i++) {
		//console.log(this.cate_img[txt[i].id]);
		this.createCategoryElement(ul_element ,txt[i].id);
		//console.log(txt[i].getElementsByTagName("block"));
	}

	Blockly.fireUiEvent(window, 'resize');
}

/**
 * Create Category List.
 */
Blockly.Category_toolbox.prototype.createCategoryElement = function(categoryGroup, name) {
	var element = Blockly.createElement('li', name);
	element.setAttribute("class", "category_lists");
	element.style.backgroundImage = 'url("' + this.cate_img[name] + '")';
	element.innerHTML = this.cate_msg[name];
	Blockly.bindEvent_(element, 'mousedown', this, this.onMouseDown_);
	categoryGroup.appendChild(element);
	this.categoryLists_.push(element);
}

Blockly.Category_toolbox.prototype.onMouseDown_ = function(e) {
	for (var i = 0; i < this.categoryLists_.length; i++) {
		if(this.categoryLists_[i] === e.target) {
			Blockly.addClass_(this.categoryLists_[i], 'greppCateSeleted');
		} else {
			Blockly.removeClass_(this.categoryLists_[i], 'greppCateSeleted');
		}
	}
}
