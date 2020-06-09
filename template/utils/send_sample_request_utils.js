
if (typeof Object.assign !== 'function') {
    // Must be writable: true, enumerable: false, configurable: true
    Object.defineProperty(Object, "assign", {
        value: function assign(target, varArgs) { // .length of function is 2
            'use strict';
            if (target === null || target === undefined) {
                throw new TypeError('Cannot convert undefined or null to object');
            }

            var to = Object(target);

            for (var index = 1; index < arguments.length; index++) {
                var nextSource = arguments[index];

                if (nextSource !== null && nextSource !== undefined) {
                    for (var nextKey in nextSource) {
                        // Avoid bugs when hasOwnProperty is shadowed
                        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        },
        writable: true,
        configurable: true
    });
}

if (!String.prototype.endsWith) {
    String.prototype.endsWith = function(search, this_len) {
        if (this_len === undefined || this_len > this.length) {
            this_len = this.length;
        }
        return this.substring(this_len - search.length, this_len) === search;
    };
}
//this block is used to make this module works with Node (CommonJS module format)
if (typeof define !== 'function') {
    var define = require('amdefine')(module)
}

define([], function () {

    function handleNestedFields(object, key, params, paramType) {
        var attributes = key.split('.');
        var field = attributes[0];
        params.push(field);
        if (attributes.length > 1 && paramType[params.join('.')] == 'Object') {
            var nestedField = attributes.slice(1).join('.');
            if (!object[field])
                object[field] = {};
            if (typeof object[field] == 'object') {
                object[field][nestedField] = object[key];
                delete object[key];
                handleNestedFields(object[field], nestedField, params, paramType);
            }
        }
    }

    function handleNestedFieldsForAllParams(param, paramType) {
        var result = Object.assign({}, param);
        for (var i = 0; i < Object.keys(result); i++) {
            var key = Object.keys(result)[i];
            handleNestedFields(result, key, [], paramType);
        }
        return result
    }

    function handleArraysAndObjectFields(param, paramType) {
        var result = Object.assign({}, param);
        for (var i = 0; i < Object.keys(paramType); i++) {
            var key = Object.keys(paramType)[i];
            if (result[key] && (paramType[key].endsWith('[]') || paramType[key] === 'Object')) {
                try {
                    result[key] = JSON.parse(result[key]);
                } catch (e) {;}
            }
        }
        return result
    }

    function handleNestedAndParsingFields(param, paramType) {
        var result = handleArraysAndObjectFields(param, paramType);
        result = handleNestedFieldsForAllParams(result, paramType);
        return result;
    }

    return {handleNestedAndParsingFields: handleNestedAndParsingFields};
});