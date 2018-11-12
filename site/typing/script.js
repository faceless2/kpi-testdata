"use strict";
newapp = (function() {
    var id = "typing";
    var user;
    var data;
    var base;

    var textarea;
    var updater;
    var textareaValue;

    function keyHandler() {
        if (textarea.value != user.data.text) {
            user.data.text = textarea.value;
            user.touch();
        }
    }

    var app = {
        id: id,
        description: "Story",
        uri: null,
        loaded: function() {
            console.log("# app.load("+this.id+")");
            textarea = document.getElementById("app-typing-text");
            textarea.addEventListener("input", keyHandler);
        },
        open: function(newuser) {
            console.log("# app.open("+this.id+", "+newuser.name+")");
            user = newuser;
            textarea.value = user.data.text || "";
        },
        close: function() {
            console.log("# app.close("+this.id+", "+user.name+")");
        }
    };
    return app;
})();
