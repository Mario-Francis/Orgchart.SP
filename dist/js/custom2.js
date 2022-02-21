var _usersToUnclaim = [];
var _claimedTotal;
var _unclaimedTotal;
var _loggedInName;
var _loggedInEmail = _spPageContextInfo.userLoginName.toLowerCase();
toastr.options = {
    "closeButton": true,
    "newestOnTop": true,
    "positionClass": "toast-top-right"
};
$(function () {
    _loggedInName = $("#mectrl_currentAccount_primary").html();
    loadRecords();
});



function loadRecords() {


    if (DataTable.isDataTable("#claimed")) {
        $('#claimed').DataTable().destroy();
    }

    if (DataTable.isDataTable("#unclaimed")) {
        $('#unclaimed').DataTable().destroy();
    }
    //load claimed

    $.ajax({
        url: `${c._endpointDomain}/api/employees/${_loggedInEmail}/directreports`,
        contentType: "application/json",
        beforeSend: function () {
            $('#loading-claimed-records').css("display", "block");
        },
        dataType: 'json',
        success: function (result) {

            $("#loading-claimed-records").css("display", "none");
            _claimedTotal = result.data.length;
            $('#claimedTotal').html(_claimedTotal);

            $('#claimed').DataTable({
                data: result.data,

                "aoColumns": [
                    {
                        "mData": "displayName",
                        "render": function (data, type, row, meta) {
                            return data == null ? '' : data;
                        }
                    },
                    {
                        "mData": "email",
                        "render": function (data, type, row, meta) {
                            return data == null ? '' : data;
                        }
                    },
                    {
                        "mData": "jobTitle",
                        "render": function (data, type, row, meta) {
                            return data == null ? '' : data;
                        }
                    }

                ],
                buttons: [
                    {
                        extend: 'excel',
                        text: '<i class="fa fa-file-excel"></i> Export to excel'
                    },
                    {
                        extend: 'pdf',
                        text: '<i class="fa fa-file-pdf"></i> Export to pdf'
                    },
                ]
            }).buttons().container().appendTo('#claims_table_wrapper .col-md-6:eq(0)');
        }
    });

    //load unclaimed
    $.ajax({
        url: `${c._endpointDomain}/api/employees/withoutmanagers`,
        contentType: "application/json",
        beforeSend: function () {
            $('#loading-unclaimed-records').css("display", "block");
        },
        dataType: 'json',
        success: function (result) {
            $('#loading-unclaimed-records').css("display", "none");
            _unclaimedTotal = result.data.filter(_d => _d.email != _loggedInEmail).length
            $("#unclaimedTotal").html(_unclaimedTotal);
            _unclaimedTable = $('#unclaimed').DataTable({
                data: result.data.filter(_fd => _fd.email != _loggedInEmail),
                "aoColumns": [
                    {
                        "mData": "email",
                        "render": function (data, type, row, meta) {
                            return data == null ? '' : data;
                        }
                    },
                    {
                        "mData": "department",
                        "render": function (data, type, row, meta) {
                            return data == null ? '' : data;
                        }
                    },
                    {
                        "mData": "id",
                        "render": function (data, type, row, meta) {
                            return `<button unclaimed_id="${data}" class="btn btn-sm btn-info" type="button" onClick="claimEmployee(this)">Claim</button>`;
                        }
                    }

                ],
                buttons: [
                    {
                        extend: 'excel',
                        text: '<i class="fa fa-file-excel"></i> Export to excel'
                    },
                    {
                        extend: 'pdf',
                        text: '<i class="fa fa-file-pdf"></i> Export to pdf'
                    },
                ]
            }).buttons().container().appendTo('#claims_table_wrapper .col-md-6:eq(0)');
        }
    });


    // Handle click on "Select all" control
    $('#user-unclaim-all').on('click', function () {
        // Check/uncheck all checkboxes in the table
        var rows = $('#claimed').DataTable().rows({ 'search': 'applied' }).nodes();
        $('input[type="checkbox"]', rows).prop('checked', this.checked);
    });


    $(document).on('change', "input[id='claimed_checkbox']", function () {
        // If checkbox is not checked
        if (!this.checked) {
            var el = $('#user-unclaim-all').get(0);
            // If "Select all" control is checked and has 'indeterminate' property
            if (el && el.checked && ('indeterminate' in el)) {
                // Set visual state of "Select all" control
                // as 'indeterminate'
                el.indeterminate = true;
            }
        }
    });


}


//unclaim Employees

function unclaimEmployee(_element) {
    let _btn = $(_element);
    let _empID = _btn.attr('claimed_id');


    Swal.fire({
        title: 'Are you sure?',
        text: "This employee will no longer be your direct report!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Unclaim!'
    }).then((result) => {

        if (result.isConfirmed) {

            $.ajax({
                url: `${c._endpointDomain}/api/employees/${_empID}/unassignmanager`,
                contentType: "application/json",
                dataType: 'json',
                type: 'POST',
                success: function (result) {
                    toastr.success('Unclaimed successfully!').delay(500).fadeOut(5000);
                    location.reload();

                },
                error: function (e) { alert("error"); console.log(e) }
            })
        }

    });

}

function claimEmployee(_element) {
    let _btn = $(_element);
    let _empID = _btn.attr('unclaimed_id');
    let _unclaimedData = {
        "managerId": `${_loggedInEmail}`
    };


    Swal.fire({
        title: 'Are you sure?',
        text: "This employee will become your direct report!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Claim!'
    }).then((result) => {

        if (result.isConfirmed) {

            $.ajax({

                data: JSON.stringify(_unclaimedData),
                url: `${c._endpointDomain}/api/employees/${_empID}/assignmanager`,
                contentType: "application/json",
                dataType: 'json',
                type: 'POST',
                success: function (result) {
                    toastr.success('Claimed successfully!').delay(500).fadeOut(5000);
                    location.reload();
                    location.reload();
                }
            })
        }

    });

}