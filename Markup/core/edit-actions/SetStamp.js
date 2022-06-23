"use strict";

import { EditAction } from './EditAction'

    export function SetStamp(editor, stamp, position, size) {
    
        EditAction.call(this, editor, 'SET-STAMP', stamp.id);

        this.newPosition = { x: position.x, y: position.y };
        this.newSize = { x: size.x, y: size.y };
        this.oldPosition = { x: stamp.position.x, y: stamp.position.y };
        this.oldSize = { x: stamp.size.x, y: stamp.size.y };
    };

    SetStamp.prototype = Object.create(EditAction.prototype);
    SetStamp.prototype.constructor = SetStamp;

    var proto = SetStamp.prototype;

    proto.redo = function() {
        this.applyState(this.targetId, this.newPosition, this.newSize);
    };

    proto.undo = function() {
        this.applyState(this.targetId, this.oldPosition, this.oldSize);
    };

    proto.merge = function(action) {
        if (this.targetId === action.targetId && this.type === action.type) {
        this.newPosition = action.newPosition;
        this.newSize = action.newSize;
        return true;
        }

        return false;
    };

    proto.applyState = function(targetId, position, size) {
        const stamp = this.editor.getMarkup(targetId);
        if (!stamp) {
        return;
        }

        // Different stroke widths make positions differ at sub-pixel level.
        const epsilon = 0.0001;
        if (
        Math.abs(stamp.position.x - position.x) > epsilon ||
        Math.abs(stamp.position.y - position.y) > epsilon ||
        Math.abs(stamp.size.x - size.x) > epsilon ||
        Math.abs(stamp.size.y - size.y) > epsilon)
        {
        stamp.set(position, size);
        }
    };

    proto.isIdentity = function() {
        return (
        this.newPosition.x === this.oldPosition.x &&
        this.newPosition.y === this.oldPosition.y &&
        this.newSize.x === this.oldSize.x &&
        this.newSize.y === this.newSize.y);

    };
