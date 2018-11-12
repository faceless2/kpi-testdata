"use strict";
var baseurl = "https://www.jsonstore.io/";
var users = [];
var newapp;
var apps = {};
var currentUser;
var currentApp;

function User(config) {

    const user = this;
    var updateTimer;

    this.load = function() {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    if (config.init) {
                        for (var d in config.init) {
                            user[d] = config.init[d];
                        }
                    }
                    let v = JSON.parse(xhr.responseText);
                    if (v.ok && v.result) {
                        v = v.result;
                        if (v) {
                            for (var d in v) {
                                user[d] = v[d];
                            }
                        }
                        user.id = config.id;
                        if (user.name) {
                            for (var i=0;i<users.length;i++) {
                                if (users[i].id == user.id) {
                                    users[i] = user;
                                    user = null;
                                    break;
                                }
                            }
                        }
                        if (user) {
                            if (!user.appData) {
                                user.appData = {};
                            }
                            user.appList = ["typing", "spelling"];
                            if (!user.currentApp) {
                                user.currentApp = user.appList[0];
                            }
                            users.push(user);
                            console.log("# Loaded user "+JSON.stringify(user));
                        }
                        reload();
                    }
                }
            }
        };
        xhr.open("GET", baseurl + config.id, true);
        xhr.send(null);
    };

    this.save = function(callback) {
        var x = this.data;
        delete this.data;
        let data = JSON.stringify(this);
        this.data = x;
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                console.log("# Saved user "+data);
            }
        };
        xhr.open("POST", baseurl + this.id, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(data);
    };

    this.touch = function() {
        if (updateTimer) {
            clearTimeout(updateTimer);
        }
        updateTimer = setTimeout(function() {
            user.save();
        }, 5000);
    };

    this.addPoint = function(v) {
        user.points += v;
        user.touch();
    };

}

function registerApp(app) {
    if (!apps[app.uri]) {
        apps[app.uri] = app;
    }
}

function loadApp(uri) {
    if (!apps[uri]) {
        const app = {};
        apps[uri] = app;
        var script = document.createElement("script");
        script.src = uri + "/script.js?";
        script.addEventListener("load", function() {
            const app = newapp;
            apps[uri] = app;
            app.uri = uri;
            app.base = document.createElement("div");
            app.base.app = app;
            app.base.id = "app-" + app.id;
            document.getElementById("contentPanel").appendChild(app.base);
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    app.base.innerHTML = this.responseText;
                    app.loaded.call(app);
                    var button = document.createElement("button");
                    button.app = app;
                    button.innerText = app.description;
                    button.addEventListener("click", function() {
                        switchApp(app);
                    });
                    document.getElementById("appPanel").appendChild(button);
                    if (currentUser.currentApp == uri) {
                        switchApp(app);
                    }
                }
            };
            xhr.open("GET", uri + "/content.html?", true);
            xhr.send(null);

            var link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = uri + "/style.css?";
            document.head.appendChild(link);
        });
        document.head.appendChild(script);
    }
}

/**
 * Recreate the user buttons with the current user list, load any apps
 * that apply to them but are not yet loaded.
 */
function reload() {
    var userpanel = document.getElementById("userPanel");
    for (let user of users) {
        let button;
        for (button = userpanel.firstChild;button;button=button.nextSibling) {
            if (button.user == user) {
                break;
            }
        }
        if (!button) {
            button = document.createElement("button");
            button.user = user;
            userpanel.appendChild(button);
            button.innerText = user.name;
            button.addEventListener("click", function() {
                 switchUser(user);
            });
            if (users.length == 1) {
                switchUser(users[0]);
            }
        }
        for (var appuri of user.appList) {
            loadApp(appuri);
        }
    }
}

function switchUser(user) {
    for (let b = document.getElementById("userPanel").firstChild;b;b=b.nextSibling) {
        b.classList.toggle("selected", b.user == user);
    }
    console.log("# switchUser("+user.name+")");
    currentUser = user;
    document.body.style.backgroundColor = currentUser.color;
    if (currentUser.currentApp) {
        currentUser.currentApp = currentUser.appList[0];
    }
    if (apps[currentUser.currentApp]) {
        switchApp(apps[currentUser.currentApp]);
    }
}

function switchApp(app) {
    console.log("# switchApp("+app.id+")");
    for (let b = document.getElementById("appPanel").firstChild;b;b=b.nextSibling) {
        b.classList.toggle("selected", b.app == app);
        b.app.base.classList.toggle("selected", b.app == app);
    }
    if (currentApp) {
        currentApp.close.call(currentApp);
    }
    currentApp = app;
    if (!currentUser.appData[app.id]) {
        currentUser.appData[app.id] = {};
    }
    currentUser.data = currentUser.appData[app.id];
    currentApp.open.call(currentApp, currentUser);
}
