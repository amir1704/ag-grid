/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.3.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
import { Bean } from "./context/context";
import { BeanStub } from "./context/beanStub";
import { Qualifier } from "./context/context";
import { Events } from "./events";
import { Autowired } from "./context/context";
import { PostConstruct } from "./context/context";
import { ChangedPath } from "./utils/changedPath";
import { iterateObject } from "./utils/object";
import { exists } from "./utils/generic";
import { _ } from "./utils";
var SelectionService = /** @class */ (function (_super) {
    __extends(SelectionService, _super);
    function SelectionService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SelectionService.prototype.setBeans = function (loggerFactory) {
        this.logger = loggerFactory.create('selectionService');
        this.reset();
    };
    SelectionService.prototype.init = function () {
        var _this = this;
        this.groupSelectsChildren = this.gridOptionsService.is('groupSelectsChildren');
        this.addManagedPropertyListener('groupSelectsChildren', function (propChange) { return _this.groupSelectsChildren = propChange.currentValue; });
        this.rowSelection = this.gridOptionsService.get('rowSelection');
        this.addManagedPropertyListener('rowSelection', function (propChange) { return _this.rowSelection = propChange.currentValue; });
        this.addManagedListener(this.eventService, Events.EVENT_ROW_SELECTED, this.onRowSelected.bind(this));
    };
    SelectionService.prototype.isMultiselect = function () {
        return this.rowSelection === 'multiple';
    };
    SelectionService.prototype.setNodeSelected = function (params) {
        var _a;
        var newValue = params.newValue, clearSelection = params.clearSelection, suppressFinishActions = params.suppressFinishActions, rangeSelect = params.rangeSelect, event = params.event, node = params.node, _b = params.source, source = _b === void 0 ? 'api' : _b;
        // groupSelectsFiltered only makes sense when group selects children
        var groupSelectsFiltered = this.groupSelectsChildren && (params.groupSelectsFiltered === true);
        if (node.id === undefined) {
            console.warn('AG Grid: cannot select node until id for node is known');
            return 0;
        }
        if (node.rowPinned) {
            console.warn('AG Grid: cannot select pinned rows');
            return 0;
        }
        // if we are a footer, we don't do selection, just pass the info
        // to the sibling (the parent of the group)
        if (node.footer) {
            return this.setNodeSelected(__assign(__assign({}, params), { node: node.sibling }));
        }
        var lastSelectedNode = this.getLastSelectedNode();
        if (rangeSelect && lastSelectedNode) {
            var newRowClicked = lastSelectedNode !== node;
            if (newRowClicked && this.isMultiselect()) {
                var nodesChanged = this.selectRange(node, lastSelectedNode, params.newValue, source);
                this.setLastSelectedNode(node);
                return nodesChanged;
            }
        }
        // when groupSelectsFiltered, then this node may end up intermediate despite
        // trying to set it to true / false. this group will be calculated further on
        // down when we call calculatedSelectedForAllGroupNodes(). we need to skip it
        // here, otherwise the updatedCount would include it.
        var skipThisNode = groupSelectsFiltered && node.group;
        var updatedCount = 0;
        if (!skipThisNode) {
            var thisNodeWasSelected = node.selectThisNode(newValue, params.event, source);
            if (thisNodeWasSelected) {
                updatedCount++;
            }
        }
        if (this.groupSelectsChildren && ((_a = node.childrenAfterGroup) === null || _a === void 0 ? void 0 : _a.length)) {
            updatedCount += this.selectChildren(node, newValue, groupSelectsFiltered, source);
        }
        // clear other nodes if not doing multi select
        if (!suppressFinishActions) {
            var clearOtherNodes = newValue && (clearSelection || !this.isMultiselect());
            if (clearOtherNodes) {
                updatedCount += this.clearOtherNodes(node, source);
            }
            // only if we selected something, then update groups and fire events
            if (updatedCount > 0) {
                this.updateGroupsFromChildrenSelections(source);
                // this is the very end of the 'action node', so we are finished all the updates,
                // include any parent / child changes that this method caused
                var event_1 = {
                    type: Events.EVENT_SELECTION_CHANGED,
                    source: source
                };
                this.eventService.dispatchEvent(event_1);
            }
            // so if user next does shift-select, we know where to start the selection from
            if (newValue) {
                this.setLastSelectedNode(node);
            }
        }
        return updatedCount;
    };
    // selects all rows between this node and the last selected node (or the top if this is the first selection).
    // not to be mixed up with 'cell range selection' where you drag the mouse, this is row range selection, by
    // holding down 'shift'.
    SelectionService.prototype.selectRange = function (fromNode, toNode, value, source) {
        var _this = this;
        if (value === void 0) { value = true; }
        var nodesToSelect = this.rowModel.getNodesInRangeForSelection(fromNode, toNode);
        var updatedCount = 0;
        nodesToSelect.forEach(function (rowNode) {
            if (rowNode.group && _this.groupSelectsChildren || (value === false && fromNode === rowNode)) {
                return;
            }
            var nodeWasSelected = rowNode.selectThisNode(value, undefined, source);
            if (nodeWasSelected) {
                updatedCount++;
            }
        });
        this.updateGroupsFromChildrenSelections(source);
        var event = {
            type: Events.EVENT_SELECTION_CHANGED,
            source: source
        };
        this.eventService.dispatchEvent(event);
        return updatedCount;
    };
    SelectionService.prototype.selectChildren = function (node, newValue, groupSelectsFiltered, source) {
        var children = groupSelectsFiltered ? node.childrenAfterAggFilter : node.childrenAfterGroup;
        if (_.missing(children)) {
            return 0;
        }
        var updatedCount = 0;
        for (var i = 0; i < children.length; i++) {
            updatedCount += children[i].setSelectedParams({
                newValue: newValue,
                clearSelection: false,
                suppressFinishActions: true,
                groupSelectsFiltered: groupSelectsFiltered,
                source: source
            });
        }
        return updatedCount;
    };
    SelectionService.prototype.setLastSelectedNode = function (rowNode) {
        this.lastSelectedNode = rowNode;
    };
    SelectionService.prototype.getLastSelectedNode = function () {
        return this.lastSelectedNode;
    };
    SelectionService.prototype.getSelectedNodes = function () {
        var selectedNodes = [];
        iterateObject(this.selectedNodes, function (key, rowNode) {
            if (rowNode) {
                selectedNodes.push(rowNode);
            }
        });
        return selectedNodes;
    };
    SelectionService.prototype.getSelectedRows = function () {
        var selectedRows = [];
        iterateObject(this.selectedNodes, function (key, rowNode) {
            if (rowNode && rowNode.data) {
                selectedRows.push(rowNode.data);
            }
        });
        return selectedRows;
    };
    SelectionService.prototype.getSelectionCount = function () {
        return Object.values(this.selectedNodes).length;
    };
    /**
     * This method is used by the CSRM to remove groups which are being disposed of,
     * events do not need fired in this case
     */
    SelectionService.prototype.filterFromSelection = function (predicate) {
        var newSelectedNodes = {};
        Object.entries(this.selectedNodes).forEach(function (_a) {
            var _b = __read(_a, 2), key = _b[0], node = _b[1];
            var passesPredicate = node && predicate(node);
            if (passesPredicate) {
                newSelectedNodes[key] = node;
            }
        });
        this.selectedNodes = newSelectedNodes;
    };
    // should only be called if groupSelectsChildren=true
    SelectionService.prototype.updateGroupsFromChildrenSelections = function (source, changedPath) {
        // we only do this when group selection state depends on selected children
        if (!this.groupSelectsChildren) {
            return false;
        }
        // also only do it if CSRM (code should never allow this anyway)
        if (this.rowModel.getType() !== 'clientSide') {
            return false;
        }
        var clientSideRowModel = this.rowModel;
        var rootNode = clientSideRowModel.getRootNode();
        if (!changedPath) {
            changedPath = new ChangedPath(true, rootNode);
            changedPath.setInactive();
        }
        var selectionChanged = false;
        changedPath.forEachChangedNodeDepthFirst(function (rowNode) {
            if (rowNode !== rootNode) {
                var selected = rowNode.calculateSelectedFromChildren();
                selectionChanged = rowNode.selectThisNode(selected === null ? false : selected, undefined, source) || selectionChanged;
            }
        });
        return selectionChanged;
    };
    SelectionService.prototype.clearOtherNodes = function (rowNodeToKeepSelected, source) {
        var _this = this;
        var groupsToRefresh = {};
        var updatedCount = 0;
        iterateObject(this.selectedNodes, function (key, otherRowNode) {
            if (otherRowNode && otherRowNode.id !== rowNodeToKeepSelected.id) {
                var rowNode = _this.selectedNodes[otherRowNode.id];
                updatedCount += rowNode.setSelectedParams({
                    newValue: false,
                    clearSelection: false,
                    suppressFinishActions: true,
                    source: source
                });
                if (_this.groupSelectsChildren && otherRowNode.parent) {
                    groupsToRefresh[otherRowNode.parent.id] = otherRowNode.parent;
                }
            }
        });
        iterateObject(groupsToRefresh, function (key, group) {
            var selected = group.calculateSelectedFromChildren();
            group.selectThisNode(selected === null ? false : selected, undefined, source);
        });
        return updatedCount;
    };
    SelectionService.prototype.onRowSelected = function (event) {
        var rowNode = event.node;
        // we do not store the group rows when the groups select children
        if (this.groupSelectsChildren && rowNode.group) {
            return;
        }
        if (rowNode.isSelected()) {
            this.selectedNodes[rowNode.id] = rowNode;
        }
        else {
            delete this.selectedNodes[rowNode.id];
        }
    };
    SelectionService.prototype.syncInRowNode = function (rowNode, oldNode) {
        this.syncInOldRowNode(rowNode, oldNode);
        this.syncInNewRowNode(rowNode);
    };
    // if the id has changed for the node, then this means the rowNode
    // is getting used for a different data item, which breaks
    // our selectedNodes, as the node now is mapped by the old id
    // which is inconsistent. so to keep the old node as selected,
    // we swap in the clone (with the old id and old data). this means
    // the oldNode is effectively a daemon we keep a reference to,
    // so if client calls api.getSelectedNodes(), it gets the daemon
    // in the result. when the client un-selects, the reference to the
    // daemon is removed. the daemon, because it's an oldNode, is not
    // used by the grid for rendering, it's a copy of what the node used
    // to be like before the id was changed.
    SelectionService.prototype.syncInOldRowNode = function (rowNode, oldNode) {
        var oldNodeHasDifferentId = exists(oldNode) && (rowNode.id !== oldNode.id);
        if (oldNodeHasDifferentId && oldNode) {
            var id = oldNode.id;
            var oldNodeSelected = this.selectedNodes[id] == rowNode;
            if (oldNodeSelected) {
                this.selectedNodes[oldNode.id] = oldNode;
            }
        }
    };
    SelectionService.prototype.syncInNewRowNode = function (rowNode) {
        if (exists(this.selectedNodes[rowNode.id])) {
            rowNode.setSelectedInitialValue(true);
            this.selectedNodes[rowNode.id] = rowNode;
        }
        else {
            rowNode.setSelectedInitialValue(false);
        }
    };
    SelectionService.prototype.reset = function () {
        this.logger.log('reset');
        this.selectedNodes = {};
        this.lastSelectedNode = null;
    };
    // returns a list of all nodes at 'best cost' - a feature to be used
    // with groups / trees. if a group has all it's children selected,
    // then the group appears in the result, but not the children.
    // Designed for use with 'children' as the group selection type,
    // where groups don't actually appear in the selection normally.
    SelectionService.prototype.getBestCostNodeSelection = function () {
        if (this.rowModel.getType() !== 'clientSide') {
            // Error logged as part of gridApi as that is only call point for this method.
            return;
        }
        var clientSideRowModel = this.rowModel;
        var topLevelNodes = clientSideRowModel.getTopLevelNodes();
        if (topLevelNodes === null) {
            return;
        }
        var result = [];
        // recursive function, to find the selected nodes
        function traverse(nodes) {
            for (var i = 0, l = nodes.length; i < l; i++) {
                var node = nodes[i];
                if (node.isSelected()) {
                    result.push(node);
                }
                else {
                    // if not selected, then if it's a group, and the group
                    // has children, continue to search for selections
                    var maybeGroup = node;
                    if (maybeGroup.group && maybeGroup.children) {
                        traverse(maybeGroup.children);
                    }
                }
            }
        }
        traverse(topLevelNodes);
        return result;
    };
    SelectionService.prototype.isEmpty = function () {
        var count = 0;
        iterateObject(this.selectedNodes, function (nodeId, rowNode) {
            if (rowNode) {
                count++;
            }
        });
        return count === 0;
    };
    SelectionService.prototype.deselectAllRowNodes = function (params) {
        var callback = function (rowNode) { return rowNode.selectThisNode(false, undefined, source); };
        var rowModelClientSide = this.rowModel.getType() === 'clientSide';
        var source = params.source, justFiltered = params.justFiltered, justCurrentPage = params.justCurrentPage;
        if (justCurrentPage || justFiltered) {
            if (!rowModelClientSide) {
                console.error("AG Grid: selecting just filtered only works when gridOptions.rowModelType='clientSide'");
                return;
            }
            this.getNodesToSelect(justFiltered, justCurrentPage).forEach(callback);
        }
        else {
            iterateObject(this.selectedNodes, function (id, rowNode) {
                // remember the reference can be to null, as we never 'delete' from the map
                if (rowNode) {
                    callback(rowNode);
                }
            });
            // this clears down the map (whereas above only sets the items in map to 'undefined')
            this.reset();
        }
        // the above does not clean up the parent rows if they are selected
        if (rowModelClientSide && this.groupSelectsChildren) {
            this.updateGroupsFromChildrenSelections(source);
        }
        var event = {
            type: Events.EVENT_SELECTION_CHANGED,
            source: source
        };
        this.eventService.dispatchEvent(event);
    };
    SelectionService.prototype.getSelectAllState = function (justFiltered, justCurrentPage) {
        var _this = this;
        var selectedCount = 0;
        var notSelectedCount = 0;
        var callback = function (node) {
            if (_this.groupSelectsChildren && node.group) {
                return;
            }
            if (node.isSelected()) {
                selectedCount++;
            }
            else if (!node.selectable) {
                // don't count non-selectable nodes!
            }
            else {
                notSelectedCount++;
            }
        };
        this.getNodesToSelect(justFiltered, justCurrentPage).forEach(callback);
        // if no rows, always have it unselected
        if (selectedCount === 0 && notSelectedCount === 0) {
            return false;
        }
        // if mix of selected and unselected, this is indeterminate
        if (selectedCount > 0 && notSelectedCount > 0) {
            return null;
        }
        // only selected
        return selectedCount > 0;
    };
    /**
     * @param justFiltered whether to just include nodes which have passed the filter
     * @param justCurrentPage whether to just include nodes on the current page
     * @returns all nodes including unselectable nodes which are the target of this selection attempt
     */
    SelectionService.prototype.getNodesToSelect = function (justFiltered, justCurrentPage) {
        var _this = this;
        if (justFiltered === void 0) { justFiltered = false; }
        if (justCurrentPage === void 0) { justCurrentPage = false; }
        if (this.rowModel.getType() !== 'clientSide') {
            throw new Error("selectAll only available when rowModelType='clientSide', ie not " + this.rowModel.getType());
        }
        var nodes = [];
        if (justCurrentPage) {
            this.paginationProxy.forEachNodeOnPage(function (node) {
                if (!node.group) {
                    nodes.push(node);
                    return;
                }
                if (!node.expanded) {
                    // even with groupSelectsChildren, do this recursively as only the filtered children
                    // are considered as the current page
                    var recursivelyAddChildren_1 = function (child) {
                        var _a;
                        nodes.push(child);
                        if ((_a = child.childrenAfterFilter) === null || _a === void 0 ? void 0 : _a.length) {
                            child.childrenAfterFilter.forEach(recursivelyAddChildren_1);
                        }
                    };
                    recursivelyAddChildren_1(node);
                    return;
                }
                // if the group node is expanded, the pagination proxy will include the visible nodes to select
                if (!_this.groupSelectsChildren) {
                    nodes.push(node);
                }
            });
            return nodes;
        }
        var clientSideRowModel = this.rowModel;
        if (justFiltered) {
            clientSideRowModel.forEachNodeAfterFilter(function (node) {
                nodes.push(node);
            });
            return nodes;
        }
        clientSideRowModel.forEachNode(function (node) {
            nodes.push(node);
        });
        return nodes;
    };
    SelectionService.prototype.selectAllRowNodes = function (params) {
        if (this.rowModel.getType() !== 'clientSide') {
            throw new Error("selectAll only available when rowModelType='clientSide', ie not " + this.rowModel.getType());
        }
        var source = params.source, justFiltered = params.justFiltered, justCurrentPage = params.justCurrentPage;
        var callback = function (rowNode) { return rowNode.selectThisNode(true, undefined, source); };
        this.getNodesToSelect(justFiltered, justCurrentPage).forEach(callback);
        // the above does not clean up the parent rows if they are selected
        if (this.rowModel.getType() === 'clientSide' && this.groupSelectsChildren) {
            this.updateGroupsFromChildrenSelections(source);
        }
        var event = {
            type: Events.EVENT_SELECTION_CHANGED,
            source: source
        };
        this.eventService.dispatchEvent(event);
    };
    // Used by SSRM
    SelectionService.prototype.getServerSideSelectionState = function () {
        return null;
    };
    SelectionService.prototype.setServerSideSelectionState = function (state) { };
    __decorate([
        Autowired('rowModel')
    ], SelectionService.prototype, "rowModel", void 0);
    __decorate([
        Autowired('paginationProxy')
    ], SelectionService.prototype, "paginationProxy", void 0);
    __decorate([
        __param(0, Qualifier('loggerFactory'))
    ], SelectionService.prototype, "setBeans", null);
    __decorate([
        PostConstruct
    ], SelectionService.prototype, "init", null);
    SelectionService = __decorate([
        Bean('selectionService')
    ], SelectionService);
    return SelectionService;
}(BeanStub));
export { SelectionService };
