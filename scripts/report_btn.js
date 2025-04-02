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

        firebase.auth().onAuthStateChanged((user) => {
                let params = new URL(window.location.href);
                let docID = params.searchParams.get("docID");
                if (user != docID) {

                        let illegal_pfp = document.getElementById("illegal_pfp").checked; 
                        let illegal_content = document.getElementById("illegal_content").checked; 
                        let liar_btn = document.getElementById("liar_btn").checked; 
                        let abusive_communcation = document.getElementById("abusive_communcation").checked;

                        console.log(illegal_pfp);
                        console.log(illegal_content);
                        console.log(liar_btn);
                        console.log(abusive_communcation);

                        db.collection('reports').doc(docID).set({
                                illegal_pfp: illegal_pfp,
                                illegal_content: illegal_content,
                                liar_btn: liar_btn,
                                abusive_communcation: abusive_communcation,
                                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        })
                }
        })
}
                function reportbtn_confirmation_close() {
                        document.getElementById("confirm_page").style.display = "none";
                }

                function reportbtn_final_close() {
                        var T = document.getElementById("final_page");
                        T.style.display = "none";
                }
