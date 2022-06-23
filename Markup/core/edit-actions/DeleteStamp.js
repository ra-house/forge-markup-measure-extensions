"use strict";

import { EditAction } from './EditAction'
import { CreateStamp } from './CreateStamp'

    export var DeleteStamp = function(editor, stamp) {

        EditAction.call(this, editor, 'DELETE-STAMP', stamp.id);

        this.createStamp = new CreateStamp(
            editor,
            stamp.id,
            stamp.position,
            stamp.size,
            stamp.rotation,
            stamp.getStyle());

    };

    DeleteStamp.prototype = Object.create(EditAction.prototype);
    DeleteStamp.prototype.constructor = DeleteStamp;

    var proto = DeleteStamp.prototype;

    proto.redo = function() {
        this.createStamp.undo();
    };

    proto.undo = function() {
        this.createStamp.redo();
    };
