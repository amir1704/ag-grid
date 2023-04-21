/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.3.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValueCache = void 0;
var context_1 = require("../context/context");
var beanStub_1 = require("../context/beanStub");
var ValueCache = /** @class */ (function (_super) {
    __extends(ValueCache, _super);
    function ValueCache() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.cacheVersion = 0;
        return _this;
    }
    ValueCache.prototype.init = function () {
        this.active = this.gridOptionsService.is('valueCache');
        this.neverExpires = this.gridOptionsService.is('valueCacheNeverExpires');
    };
    ValueCache.prototype.onDataChanged = function () {
        if (this.neverExpires) {
            return;
        }
        this.expire();
    };
    ValueCache.prototype.expire = function () {
        this.cacheVersion++;
    };
    ValueCache.prototype.setValue = function (rowNode, colId, value) {
        if (this.active) {
            if (rowNode.__cacheVersion !== this.cacheVersion) {
                rowNode.__cacheVersion = this.cacheVersion;
                rowNode.__cacheData = {};
            }
            rowNode.__cacheData[colId] = value;
        }
    };
    ValueCache.prototype.getValue = function (rowNode, colId) {
        if (!this.active || rowNode.__cacheVersion !== this.cacheVersion) {
            return undefined;
        }
        return rowNode.__cacheData[colId];
    };
    __decorate([
        context_1.PostConstruct
    ], ValueCache.prototype, "init", null);
    ValueCache = __decorate([
        context_1.Bean('valueCache')
    ], ValueCache);
    return ValueCache;
}(beanStub_1.BeanStub));
exports.ValueCache = ValueCache;
