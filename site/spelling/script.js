"use strict";
newapp = (function() {
    var list = [
        { "word": "cat", "image": "images/cat-pet-animal-domestic-104827.jpeg" },
        { "word": "dog", "image": "images/pexels-photo-1345191.jpeg" }
    ];
    var id = "spelling";
    var user;
    var data;
    var image, input;
    var ix;

    function chooseEntry() {
        ix = Math.floor(Math.random() * list.length);
        input.value = "";
        input.classList.remove("valid");
        input.classList.remove("invalid");
        image.src = app.uri + "/" + list[ix].image;
    }

    function keyHandler() {
        var w = list[ix].word;
        var i;
        input.classList.add("valid");
        input.classList.remove("invalid");
        for (i=0;i<input.value.length;i++) {
            if (w[i] != input.value[i]) {
                input.value = input.value.substring(0, i) + input.value[input.value.length - 1];
                input.classList.toggle("valid", w[i] == input.value[i]);
                input.classList.toggle("invalid", w[i] != input.value[i]);
                break;
            }
        }
        if (input.value == w) {
            user.addPoint(1);
            setTimeout(chooseEntry, 1000);
        }
    }

    var app = {
        id: id,
        description: "Spelling",
        uri: null,
        loaded: function() {
            console.log("# app.load("+this.id+")");
            input = document.getElementById("app-spelling-text");
            image = document.getElementById("app-spelling-image");
            input.addEventListener("input", keyHandler);
        },
        open: function(newuser) {
            console.log("# app.open("+this.id+", "+newuser.name+")");
            user = newuser;
            chooseEntry();
        },
        close: function() {
            console.log("# app.close("+this.id+", "+user.name+")");
        }
    };
    return app;
})();
