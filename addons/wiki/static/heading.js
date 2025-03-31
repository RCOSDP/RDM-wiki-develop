'use strict';

export function customHeadingIdGenerator(node) {
    return node.textContent
        .toLowerCase()
        .replace(/\s+/g, '')
        .trim();
}

//        .replace(/[^\p{L}\p{N}._:;-]/gu, '')