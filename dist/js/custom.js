var _checkMgr;
var _loggedInEmail = _spPageContextInfo.userLoginName.toLowerCase();
var _loggedInName;
var _cpr_date =  new Date().getFullYear();


//Load these functions on page load - loads when document is ready
$(function () {
    _loggedInName = $("#mectrl_currentAccount_primary").html();

    loadOrgChart();
    removeTail();
});




//Function that Loads orgchart of loggin user on page load
function loadOrgChart() {

    var org_nodes = [];

    function unflatten(items) {
        var tree = [],
            mappedArr = {}

        // Build a hash table and map items to objects
        items.forEach(function (item) {
            var _id = item.id;
            if (!mappedArr.hasOwnProperty(_id)) { // in case of duplicates
                mappedArr[_id] = item; // the extracted id as key, and the item as value
                mappedArr[_id].children = [];  // under each item, add a key "children" with an empty array as value
            }
        })

        // Loop over hash table
        for (var id in mappedArr) {
            if (mappedArr.hasOwnProperty(id)) {
                mappedElem = mappedArr[id];

                // If the element is not at the root level, add it to its parent array of children. Note this will continue till we have only root level elements left
                if (mappedElem.managerId) {
                    var _managerId = mappedElem.managerId;
                    mappedArr[_managerId].children.push(mappedElem);
                }

                // If the element is at the root level, directly push to the tree
                else {
                    tree.push(mappedElem);
                }
            }
        }

        return tree;

    }


    OrgTree.setOptions({
        baseClass: "org-tree",
        baseLevel: 12,
        minWidth: 2,
        collapsable: true,
        renderNode: function (node) {
            return `<div class="node d-block mx-auto ${node.email == _loggedInEmail ? 'highlight_node' : ''} ${!node.children || node.children.length == 0 ? 'removeParentPipe' : ''}" nid="${node.id}"
    eid="${node.email}">


    <div class="d-flex flex-row m-0 node-header">

        <div class="flex-fill text-left m-0">
            <h6 class="mb-2 small font-weight-bold card-name">${node.displayName ? node.displayName : ''}</h6>
            <p class="label-weight text-secondary card-label" style="line-height: 10px;">${node.jobTitle ? node.jobTitle : ''}</p>
        </div>

        <div class="rounded-circle w30 h30 profile-bg profile-text card-profile" id="profile-${node.id}">
            <h6 class="text-center small-size font-weight-bold py-2 px-1 card-profile-text"
                id="profile-text-${node.id}">${node.givenName[0] + node.surname[0]}</h6>
        </div>
    </div>


    <div class="text-secondary card-links border-top mt-2 py-2">
        <a style="font-size:10px" href="mailto:${node.email}" title="${node.email}" class="${node.email ? '' : 'd-none'}">
                <div class="d-flex flex-row">
                    
                    <p> <i class="fa fa-envelope card-icon" aria-hidden="true"></i></p>

                    <p class="flex-fill align-self-center" style="overflow-wrap: anywhere;line-height: 10px;"> ${node.email ? node.email : ''} </p>
                </div>
        </a>


        <a style="font-size:10px" href="mailto:${node.mobilePhone}" title="${node.mobilePhone}" class="${node.mobilePhone ? '' : 'd-none'}">
            <div class="d-flex flex-row">
                
                <p> <i class="fa fa-phone card-icon" aria-hidden="true"></i></p>

                <p class="flex-fill"> ${node.mobilePhone ? node.mobilePhone : ''} </p>
            </div>
        </a>



    </div>

    <div class="d-block text-center mx-auto mb-n3">
        ${this.renderCollapseIcon(node)}
    </div>


</div>`;
        },
        renderCollapseIcon: function (node) {
            if (this.collapsable && node.children && node.children.length > 0) {
                return `
          <a href="#" class="collapse_node">
         <i class="fa fa-minus-circle"></i>  
          </a>`;
            }

            else if (!this.collapsable && !node.children && node.children.length == 0) {
                $('.parent').addClass('removePipe');
            }
            else {
                return '';
            }
        },
        toggleCollapseIcon: function (icon) {
            $(icon).toggleClass('fa-minus-circle fa-plus-circle');
        }
    });

    $.ajax({
        dataType: "json",
        beforeSend: function () {
            $('#loading-orgchart').css("visibility", "visible");
        },
        url: `${c._endpointDomain}/api/employees/${_loggedInEmail}/orgchart`,
        cache: false
    }).done(function (data) {
        $('#loading-orgchart').css({ "visibility": "hidden", "transition": ".2s" });
        org_nodes = data.data;
       
        var _orgnodes = unflatten(org_nodes);


        OrgTree.makeOrgTree($('#tree'), _orgnodes);
    });
}


//Function to load orgchart by selected email of a user
function loadOrgChartByEmail(clickedEmail) {
    $("#tree").html("");
    var org_nodes = [];

    function unflatten(items) {
        var tree = [],
            mappedArr = {}

        // Build a hash table and map items to objects
        items.forEach(function (item) {
            var _id = item.id;
            if (!mappedArr.hasOwnProperty(_id)) { // in case of duplicates
                mappedArr[_id] = item; // the extracted id as key, and the item as value
                mappedArr[_id].children = [];  // under each item, add a key "children" with an empty array as value
            }
        })

        // Loop over hash table
        for (var id in mappedArr) {
            if (mappedArr.hasOwnProperty(id)) {
                mappedElem = mappedArr[id];

                // If the element is not at the root level, add it to its parent array of children. Note this will continue till we have only root level elements left
                if (mappedElem.managerId) {
                    var _managerId = mappedElem.managerId;
                    mappedArr[_managerId].children.push(mappedElem);
                }

                // If the element is at the root level, directly push to the tree
                else {
                    tree.push(mappedElem);
                }
            }
        }

        return tree;

    }
   
    OrgTree.setOptions({
        baseClass: "org-tree",
        baseLevel: 12,
        minWidth: 2,
        collapsable: true,
        renderNode: function (node) {
            return `<div class="node d-block mx-auto ${node.email == clickedEmail ? 'highlight_node' : ''} ${!node.children || node.children.length == 0 ? 'removeParentPipe' : ''}" nid="${node.id}"
    eid="${node.email}">


    <div class="d-flex flex-row m-0 node-header">

        <div class="flex-fill text-left m-0">
            <h6 class="mb-2 small font-weight-bold card-name">${node.displayName ? node.displayName : ''}</h6>
            <p class="label-weight text-secondary card-label" style="line-height: 10px;">${node.jobTitle ? node.jobTitle : ''}</p>
        </div>

        <div class="rounded-circle w30 h30 profile-bg profile-text card-profile" id="profile-${node.id}">
            <h6 class="text-center small-size font-weight-bold py-2 px-1 card-profile-text"
                id="profile-text-${node.id}">${node.givenName[0] + node.surname[0]}</h6>
        </div>
    </div>


    <div class="text-secondary card-links border-top mt-2 py-2">
        <a style="font-size:10px" href="mailto:${node.email}" title="${node.email}" class="${node.email ? '' : 'd-none'}">
                <div class="d-flex flex-row">
                    
                    <p> <i class="fa fa-envelope card-icon" aria-hidden="true"></i></p>

                    <p class="flex-fill align-self-center" style="overflow-wrap: anywhere;line-height: 10px;"> ${node.email ? node.email : ''} </p>
                </div>
        </a>


        <a style="font-size:10px" href="mailto:${node.mobilePhone}" title="${node.mobilePhone}" class="${node.mobilePhone ? '' : 'd-none'}">
            <div class="d-flex flex-row">
                
                <p> <i class="fa fa-phone card-icon" aria-hidden="true"></i></p>

                <p class="flex-fill"> ${node.mobilePhone ? node.mobilePhone : ''} </p>
            </div>
        </a>



    </div>

    <div class="d-block text-center mx-auto mb-n3">
        ${this.renderCollapseIcon(node)}
    </div>


</div>`;
        },
        renderCollapseIcon: function (node) {
            if (this.collapsable && node.children && node.children.length > 0) {
                return `
          <a href="#" class="collapse_node">
         <i class="fa fa-minus-circle"></i>
            
          </a>`;
            } else {
                return '';
            }
        },
        toggleCollapseIcon: function (icon) {
            $(icon).toggleClass('fa-minus-circle fa-plus-circle');
        }
    });

    $.ajax({
        dataType: "json",
        beforeSend: function () {
            $('#loading-orgchart').css("visibility", "visible");
        },
        url: `${c._endpointDomain}/api/employees/${clickedEmail}/orgchart`,
        cache: false
       
    }).done(function (data) {
        $('#loading-orgchart').css({ "visibility": "hidden", "transition": ".2s" });
        org_nodes = data.data;
        var _orgnodes = unflatten(org_nodes);
        OrgTree.makeOrgTree($('#tree'), _orgnodes);
    });
}

//Fix Tail issue on Orgchart Nodes

        function removeTail() {
             var checkPipe = setInterval(()=> {
             if ($(".removeParentPipe").length > 0) {

            $(".removeParentPipe").parent().addClass('removePipe');
        clearTimeout(checkPipe);
             } 
         }, 500);
        }

//Expand Orgchart nodes to show extra properties
        $(document).on('click', '.node-header', function (e) {
            let _element = $(e.currentTarget).parents('.node');
        let _card_id = _element.attr('nid');
        _element.find('.card-links').slideToggle(700);
        });


//Load Orgchart node for selected user on double click
        $(document).on('dblclick', '.node-header', function (e) {
            let _element = $(e.currentTarget).parents('.node');
        let _email = _element.attr('eid');

        loadOrgChartByEmail(_email);
        removeTail();
        });


//load orgchartBy SearchEmail

function loadOrgChartBySearch(clickedEmail) {
    $("#tree").html("");
    var org_nodes = [];

    function unflatten(items) {
        var tree = [],
            mappedArr = {}

        // Build a hash table and map items to objects
        items.forEach(function (item) {
            var _id = item.id;
            if (!mappedArr.hasOwnProperty(_id)) { // in case of duplicates
                mappedArr[_id] = item; // the extracted id as key, and the item as value
                mappedArr[_id].children = [];  // under each item, add a key "children" with an empty array as value
            }
        })

        // Loop over hash table
        for (var id in mappedArr) {
            if (mappedArr.hasOwnProperty(id)) {
                mappedElem = mappedArr[id];

                // If the element is not at the root level, add it to its parent array of children. Note this will continue till we have only root level elements left
                if (mappedElem.managerId) {
                    var _managerId = mappedElem.managerId;
                    mappedArr[_managerId].children.push(mappedElem);
                }

                // If the element is at the root level, directly push to the tree
                else {
                    tree.push(mappedElem);
                }
            }
        }

        return tree;

    }
   
    OrgTree.setOptions({
        baseClass: "org-tree",
        baseLevel: 12,
        minWidth: 2,
        collapsable: true,
        renderNode: function (node) {
            return `<div class="node d-block mx-auto ${node.email == clickedEmail ? 'highlight_node' : ''} ${!node.children || node.children.length == 0 ? 'removeParentPipe' : ''}" nid="${node.id}"
    eid="${node.email}">


    <div class="d-flex flex-row m-0 node-header">

        <div class="flex-fill text-left m-0">
            <h6 class="mb-2 small font-weight-bold card-name">${node.displayName ? node.displayName : ''}</h6>
            <p class="label-weight text-secondary card-label" style="line-height: 10px;">${node.jobTitle ? node.jobTitle : ''}</p>
        </div>

        <div class="rounded-circle w30 h30 profile-bg profile-text card-profile" id="profile-${node.id}">
            <h6 class="text-center small-size font-weight-bold py-2 px-1 card-profile-text"
                id="profile-text-${node.id}">${node.givenName[0] + node.surname[0]}</h6>
        </div>
    </div>


    <div class="text-secondary card-links border-top mt-2 py-2">
        <a style="font-size:10px" href="mailto:${node.email}" title="${node.email}" class="${node.email ? '' : 'd-none'}">
                <div class="d-flex flex-row">
                    
                    <p> <i class="fa fa-envelope card-icon" aria-hidden="true"></i></p>

                    <p class="flex-fill align-self-center" style="overflow-wrap: anywhere;line-height: 10px;"> ${node.email ? node.email : ''} </p>
                </div>
        </a>


        <a style="font-size:10px" href="mailto:${node.mobilePhone}" title="${node.mobilePhone}" class="${node.mobilePhone ? '' : 'd-none'}">
            <div class="d-flex flex-row">
                
                <p> <i class="fa fa-phone card-icon" aria-hidden="true"></i></p>

                <p class="flex-fill"> ${node.mobilePhone ? node.mobilePhone : ''} </p>
            </div>
        </a>



    </div>

    <div class="d-block text-center mx-auto mb-n3">
        ${this.renderCollapseIcon(node)}
    </div>


</div>`;
        },
        renderCollapseIcon: function (node) {
            if (this.collapsable && node.children && node.children.length > 0) {
                return `
          <a href="#" class="collapse_node">
         <i class="fa fa-minus-circle"></i>
            
          </a>`;
            } else {
                return '';
            }
        },
        toggleCollapseIcon: function (icon) {
            $(icon).toggleClass('fa-minus-circle fa-plus-circle');
        }
    });

    $.ajax({
        dataType: "json",
        beforeSend: function () {
            $('#loading-orgchart').css("visibility", "visible");
        },
        url: `${c._endpointDomain}/api/employees/${clickedEmail}/orgchart`,
        cache: false
       
    }).done(function (data) {
        $('#loading-orgchart').css({ "visibility": "hidden", "transition": ".2s" });
        org_nodes = data.data;
        var _orgnodes = unflatten(org_nodes);
        OrgTree.makeOrgTree($('#tree'), _orgnodes);
    });
}