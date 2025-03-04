function reportbtn_open() {
        var T = document.getElementById("report_page");
        T.style.display = "block";
}

function reportbtn_close() {
        var T = document.getElementById("report_page");
        T.style.display = "none";
}

function reportbtn_confirm() {
        var T = document.getElementById("report_page");
        T.style.display = "none";
        var T = document.getElementById("confirm_page");
        T.style.display = "block";
}

function reportbtn_confirm_close() {
        var T = document.getElementById("confirm_page");
        T.style.display = "none";
        var T = document.getElementById("final_page");
        T.style.display = "block";
}

function reportbtn_final_close() {
        var T = document.getElementById("final_page");
        T.style.display = "none";
}
