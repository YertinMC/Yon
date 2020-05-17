/**
 * CA plugin for Yon
 */
Plugins.inject(function (o) {
    o.name = "Yon";
    o.author = "xtex";
    o.version = [0, 0, 1];
    o.uuid = "9693e6e0-57b9-4406-968d-1183a7af42a9";
    o.description = "MCBE模组解决方案";
    o.feature("mainMenuAppendable");
    if (!CA.settings.yon) CA.settings.yon = {
        plugins: []
    };
    o.init = function () {
        Plugins.addMenu({
            text: "Yon",
            descript: "Yon管理菜单",
            onclick: function () {
                Common.showOperateDialog([
                    {
                        text: "已安装的插件",
                        onclick: function () {
                            var l = [];
                            for (n in CA.settings.yon.plugins) l.push({
                                text: CA.settings.yon.plugins[n].name,
                                description: CA.settings.yon.plugins[n].description,
                                id: CA.settings.yon.plugins[n].id
                            });
                            Common.showListChooser(l, function (pos, l) {
                                var id = l[pos].id;
                                Common.showOperateDialog([
                                    {
                                        text: "移除",
                                        onclick: function () {
                                            delete CA.settings.yon.plugins[id];
                                            Yon.restartCA();
                                        }
                                    },
                                    {
                                        text: "详情",
                                        onclick: function () {
                                            var info = CA.settings.yon.plugins[id];
                                            Common.showTextDialog(`${info.name}\n` +
                                                `ID: ${id}\n` +
                                                `描述: ${info.description}\n` +
                                                `版本: ${info.version}\n` +
                                                `作者: ${info.author}\n` +
                                                `脚本源: ${info.scriptSource}`);
                                        }
                                    }
                                ]);
                            });
                        }
                    },
                    {//PlayerMessage ItemUsed
                        text: "安装新的插件",
                        onclick: function () {
                            Common.showInputDialog({
                                title: "Yon-安装新的插件",
                                description: "请输入插件ID(npm的name)",
                                callback: function (id) {
                                    Common.showProgressDialog(function (progress) {
                                        try {
                                            progress.setText("获取插件信息");
                                            var info = JSON.parse(NetworkUtils.queryPage(`https://registry.npmjs.com/${id}`));
                                            if (info.unpublished) throw new Error('插件已取消发布');
                                            var version = info['dist-tags'].latest;
                                            info = info.versions[version].yon;
                                            try {
                                                progress.setText("下载插件");
                                                info.script = NetworkUtils.queryPage(info.scriptSource);
                                                CA.settings.yon.plugins[id] = info;
                                            } catch (e) {
                                                if (e instanceof NetworkUtils.RequestError) {
                                                    Common.showTextDialog("插件代码服务器异常\n\n" + e);
                                                } else throw e;
                                            }
                                        } catch (err) {
                                            if (err instanceof NetworkUtils.RequestError && err.responseCode == 404) {
                                                Common.showTextDialog("找不到插件");
                                            } else Common.showTextDialog("安装失败!\n\n" + err);
                                        }
                                        Yon.restartCA();
                                    });
                                }
                            });
                        }
                    }
                ]);
            }
        });
        //Plugins.observe('WSServer', 'connectionOpenClose');
    }
    MapScript.loadModule("Yon", {
        restartCA: function () {
            G.ui(function () {
                CA.unload();
                CA.initialize();
                Common.toast("命令助手已重启");
            });
        }
    });
})