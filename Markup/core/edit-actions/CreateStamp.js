"use strict";

import { EditAction } from './EditAction'
import { MarkupStamp } from '../MarkupStamp'
import { cloneStyle } from '../StyleUtils'

    /**
     * @constructor
     * 
     * @param editor 
     * @param id 
     * @param position 
     * @param size 
     * @param style 
     * @param {string} svg
     */
    export function CreateStamp(editor, id, position, size, rotation, style, svgData) {

        EditAction.call(this, editor, 'CREATE-STAMP', id);

        this.selectOnExecution = false;
        this.position = { x: position.x, y: position.y };
        this.size = { x: size.x, y: size.y };
        this.rotation = rotation;
        this.style = cloneStyle(style);
        this.svgData = svgData;
    }

    CreateStamp.prototype = Object.create(EditAction.prototype);
    CreateStamp.prototype.constructor = CreateStamp;

    var proto = CreateStamp.prototype;    

    proto.redo = function() {
        const stamp = new MarkupStamp(this.targetId, this.editor, this.svgData);

        this.editor.addMarkup(stamp);

        stamp.setSize(this.position, this.size.x, this.size.y);
        stamp.setRotation(this.rotation);
        stamp.setStyle(this.style);
    };

    proto.undo = function() {
        const markup = this.editor.getMarkup(this.targetId);
        this.editor.removeMarkup(markup);
    };
