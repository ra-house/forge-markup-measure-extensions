"use strict";

import { Markup } from './Markup'
import * as MarkupTypes from './MarkupTypes'
import { composeRGBAString,
    createSvgElement, addMarkupMetadata, stringToSvgNode } from './MarkupsCoreUtils'
import { cloneStyle, copyStyle, isStyleEqual } from './StyleUtils'
import { EditModeStamp } from './edit-modes/EditModeStamp'

  /** 
   * @param id 
   * @param editor
   * @constructor
   */
    export function MarkupStamp(id, editor, svgData) {
        const styleAttributes = [
        'text-data'];

        Markup.call(this, id, editor, styleAttributes);
        this.type = MarkupTypes.MARKUP_TYPE_STAMP;
        this.addMarkupMetadata = addMarkupMetadata.bind(this);

        this.createShapeGroup();

        this.scriptSvgData = svgData;
        this.loadSvgData();

        this.bindDomEvents();
    }

    MarkupStamp.prototype = Object.create(Markup.prototype);
    MarkupStamp.prototype.constructor = MarkupStamp;

    var proto = MarkupStamp.prototype;

    proto.createShapeGroup = function () {
        /* 
        * shape
        *    group
        *      customSvg
        *    hitarea (aka markup)
        */
        this.shape = createSvgElement('g');
        this.shape.group = createSvgElement('g');
        this.shape.appendChild(this.shape.group);

        let hitarea = createSvgElement('path');
        hitarea.setAttribute('id', "hitarea");
        hitarea.setAttribute('fill', "none");
        this.shape.appendChild(hitarea);

        this.shape.hitarea = hitarea;
        this.shape.markup = hitarea;
    };

    proto.loadSvgData = function () {
        let svgString = this.scriptSvgData || this.style['text-data'];
        let svgNode = stringToSvgNode(svgString);

        // null if parsing fails, so exit
        if (svgNode === null) {
        console.warn("SVG data " + svgString + " is invalid, skipping shape update");
        return;
        }

        let [width, height] = this.getDimensions(svgNode);

        // update the bounding box when the SVG is changed
        let path = "M 0 0 l ".concat(width, " 0 l 0 ").concat(height, " l ").concat(-width, " 0 z");
        this.shape.hitarea.setAttribute('d', path);

        this.shape.group.innerHTML = svgNode.innerHTML;

        // This is to standardize things:
        // width and height are 1 unit
        // position is in the centre
        // have to flip things because of y axis going upwards
        this.shape.group.setAttribute('transform', "translate( -0.5 , 0.5 ) scale( ".concat(1 / width, " , ").concat(-1 / height, " )"));
        // then copy to the hitarea because it's outside the SVG
        this.shape.hitarea.setAttribute('transform', this.shape.group.getAttribute('transform'));
    };

    proto.getEditMode = function () {
        return new EditModeStamp(this.editor);
    };

    proto.set = function (position, size) {
        this.setSize(position, size.x, size.y);
        this.updateStyle();
    };

    proto.updateStyle = function (styleChanged) {
        const strokeColor = this.highlighted ? this.highlightColor : composeRGBAString(this.style['stroke-color'], this.style['stroke-opacity']);
        this.shape.hitarea.setAttribute('stroke', strokeColor);

        // This only provides translation and rotation, not scale
        const transform = this.getTransform() + " scale( ".concat(this.size.x, " , ").concat(this.size.y, " )");
        this.shape.setAttribute('transform', transform);

        if (styleChanged) {
        this.loadSvgData();
        }
    };

    proto.getDimensions = function (customSvg) {
        let vb = customSvg.getAttribute('viewBox');
        if (!vb) {
        // if no viewbox is specified, check for width and height
        let width = customSvg.getAttribute('width') || 100;
        let height = customSvg.getAttribute('height') || 100;
        return [width, height];
        }
        let strings = vb.split(' ');
        let width = parseInt(strings[2]);
        let height = parseInt(strings[3]);

        return [width, height];
    };

    proto.setMetadata = function () {

        var metadata = cloneStyle(this.style);

        metadata.type = this.type;
        metadata.position = [this.position.x, this.position.y].join(" ");
        metadata.size = [this.size.x, this.size.y].join(" ");
        metadata.rotation = String(this.rotation);

        return this.addMarkupMetadata(this.shape, metadata);
    };

    proto.setStyle = function (style) {
        let stylesEqual = isStyleEqual(style, this.style);
        if (!stylesEqual) {
            copyStyle(style, this.style);
        }

        this.updateStyle(!stylesEqual);
    };