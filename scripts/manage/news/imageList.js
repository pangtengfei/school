function ImageList(menuid) {
    this.menuid = menuid;
    this.id = "";
    //附件
    this.attachmentPath = "";
    this.attachmentID = "";
    this.attachmentName = "";

    //表单
    this.editor = null;
    this.title = null;
    this.uploadImage = null;
    this.viewImage = null;
    //搜索
    this.searchTitle = null;
    this.searchBegin = null;
    this.searchEnd = null;
    //弹框和列表
    this.list = null;
    this.dialog = null;
    this.init();

}
ImageList.prototype = {
    createTable: function () {
        var _this = this;
        this.list.datagrid({
            striped: true,
            idField: 'id',
            pagination: true,
            sortName: 'createtime',
            sortOrder: 'desc',
            fitColumns: true,
            height:'600',
            url: global._prefix + "/manage/news/initDataImageOrVideo",
            queryParams: {menuid: _this.menuid},
            columns: [
                [
                    {
                        field: "ck",
                        checkbox: true
                    },
                    {
                        field:'attachmentID',
                        formatter:function(value,rowData){
                            if(value!==null){
                                return "<img src='" + global._prefix + "/" + rowData.attachmentPath + "' alt='" + rowData.attachmentName + "' width='50' heigt='50'>";
                            }
                            else{
                                return "<img src='" + global._prefix + "/themes/images/default.jpg' alt='默认图' width='50' heigt='50' >";
                            }
                        }
                    },
                    {
                        field: 'title',
                        title: '标题',
                        width: 200,
                        sortable: true
                    },
                    {
                        field: 'readcount',
                        title: '阅读次数',
                        width: 100,
                        sortable: true
                    },
                    {
                        field: "createtime",
                        title: "创建时间",
                        width: 120,
                        sortable: true
                    }
                ]
            ],
            onSortColumn: function () {
                _this.reloadList();
            },
            onLoadSuccess: function () {
                $(this).datagrid("clearSelections");
            },
            onClickRow: function (rowIndex) {
                $(this).datagrid("unselectRow", rowIndex);
            },
            onDblClickRow: function (rowIndex, rowData) {
                _this.id = rowData.id;
                _this.title.val(rowData.title);
                _this.editor.setContent(rowData.content, false);
                if (rowData.attachmentID !== null) {
                    _this.attachmentPath = rowData.attachmentPath;
                    _this.attachmentID = rowData.attachmentID;
                    _this.attachmentName = rowData.attachmentName;
                    _this.viewImage.html("<img src='" + global._prefix + "/" + rowData.attachmentPath + "' alt='" + rowData.attachmentName + "'>");
                }
                _this.dialog.window("open");
            }
        });
    },
    reloadList: function () {
        this.list.datagrid("load", {
            title: $.trim(this.searchTitle.val()),
            begin: this.searchBegin.val(),
            end: this.searchEnd.val(),
            menuid: this.menuid
        });
    },
    createDialog: function () {
        var _this = this;
        this.dialog.dialog({
            title: "",
            width: 950,
            height: 650,
            modal: true,
            resizable: true,
            maximizable: true,
            inline: true,
            closed: true,
            buttons: [
                {
                    text: '确定',
                    handler: function () {
                        var title = $.trim(_this.title.val());
                        if (title === "") {
                            $.messager.alert("提示框", "标题不能为空", "", function () {
                                _this.title.focus();
                            });
                            return;
                        }
                        var postData = {
                            menuid: _this.menuid,
                            id: _this.id,
                            title: title,
                            attachmentID: _this.attachmentID,
                            content: _this.editor.getContent()
                        }
                        $.post(global._prefix + "/manage/news/addOrEditImageOrVideoList", postData, function (res) {
                            res = eval("(" + res + ")");
                            if (res.type === "1") {
                                _this.reloadList();
                                _this.dialog.window("close");
                            } else {
                                $.messager.alert("提示框", res.errorMessage);
                            }
                        })
                    }},
                {
                    text: '取消',
                    handler: function () {
                        _this.clear();
                        _this.dialog.window("close");
                    }
                }
            ]
        });
    },
    mDel: function () {
        var _this = this;
        var rows = this.list.datagrid("getSelections");
        var deleteIds = [];
        for (var i = 0; i < rows.length; i++) {
            deleteIds.push("'" + rows[i].id + "'");
        }
        if (deleteIds == false) {
            return;
        }
        $.messager.confirm("提示框", "确定删除吗", function (r) {
            if (r) {
                $.post(global._prefix + "/manage/news/deleteNews", {ids: deleteIds.toString()}, function (res) {
                    res = eval("(" + res + ")");
                    if (res.type === "1") {
                        _this.reloadList();
                    } else {
                        $.messager.alert("提示框", res.errorMessage);
                    }
                });
            }
        })
    },
    add: function () {
        this.clear();
        this.dialog.dialog("open");
    },
    edit: function () {
        this.clear();
        var _this = this;
        var selectedNode = this.list.datagrid("getSelected");
        if (selectedNode === null) {
            $.messager.alert("提示框", "请选择要编辑的项");
            return;
        }
        _this.id = selectedNode.id;
        _this.title.val(selectedNode.title);
        _this.editor.setContent(selectedNode.content, false);
        if (selectedNode.attachmentID !== null) {
            _this.attachmentPath = selectedNode.attachmentPath;
            _this.attachmentID = selectedNode.attachmentID;
            _this.attachmentName = selectedNode.attachmentName;
            _this.viewImage.html("<img src='" + global._prefix + "/" + selectedNode.attachmentPath + "' alt='" + selectedNode.attachmentName + "'>");
        }
//        $.post(global._prefix + "/manage/uploadify/getAttachment", {newsid: selectedNode.id}, function (res) {
//            res = eval("(" + res + ")");
//            if (res.type === "1") {
//                _this.attachmentPath = res.attachmentPath;
//                _this.attachmentID = res.attachmentID;
//                _this.attachmentName = res.attachmentName;
//                _this.viewImage.html("<img src=" + global._prefix + "/" + res.attachmentPath + " alt=" + res.attachmentName + ">");
//            }
//        });
        _this.dialog.window("open");
    },
    clear: function () {
        this.id = "";
        this.title.val("")
        this.viewImage.html("");
        this.editor.setContent("", false);
        this.attachmentPath = "";
        this.attachmentID = "";
        this.attachmentName = "";
    },
    upload: function () {
        var _this = this;
        this.uploadImage.uploadify({
            'swf': global._prefix + '/scripts/uploadify/uploadify.swf?val=' + Math.random(),
            'uploader': global._prefix + '/manage/Uploadify/upload',
            'folder': global._prefix + '/files/imageorvideo/',
            'cancelImg': global._prefix + '/scripts/uploadify/uploadify-cancel.png',
            'fileTypeExts': '*',
            'fileDesc': '*',
            'removeTimeout': 0.1,
            'buttonClass': 'browser',
            'fileSizeLimit': 1024 * 1024 * 2000, //2G
            'multi': false,
            'buttonText': '浏览文件',
            'onUploadSuccess': function (fileObj, data, response) {
                var msg = eval("(" + data + ")");
                if (msg.type === "1") {
                    _this.attachmentID = msg.attachmentID;
                    _this.attachmentName = msg.attachmentName;
                    _this.attachmentPath = msg.attachmentPath;
                    _this.viewImage.html("<img src='" + global._prefix + "/" + msg.attachmentPath + "' alt='" + msg.attachmentName + "'>");
                } else {
                    $.messager.alert("提示框", msg.errMessage);
                }
            },
            'auto': true,
            'onSelect': function (fileObj) {
                var maxSize = 1024 * 1024 * 2000;
                if (fileObj.size > maxSize) {
                    $.messager.alert("提示框", "上传文件不能超过2G");
                    $(this).uploadify('cancel');
                    return false;
                }
                if (fileObj.type.toUpperCase() === ".EXE") {
                    $.messager.alert("提示框", "为了安全，不能上传exe文件");
                    $(this).uploadify('cancel');
                    return false;
                }
            }
        });
    },
    init: function () {
        this.title = $("#imageListTitle" + this.menuid);


        this.uploadImage = $('#file_upload' + this.menuid);
        this.viewImage = $('#imagePath' + this.menuid);

        this.searchTitle = $("#title" + this.menuid);
        this.searchBegin = $("#begin" + this.menuid);
        this.searchEnd = $("#end" + this.menuid);
        this.list = $("#list" + this.menuid);
        this.dialog = $('#imageListWin' + this.menuid);

        this.createTable();
        this.createDialog();
        this.upload();
        this.editor = UE.getEditor('imageListContent' + this.menuid);
    }
}
