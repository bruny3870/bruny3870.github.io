import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getDatabase, set, get, ref, remove } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyC58IrXKP-J4vMK4JR1BgkTq6Zhiy1x2uI",
    authDomain: "guestbook-8e5e5.firebaseapp.com",
    databaseURL: "https://guestbook-8e5e5-default-rtdb.firebaseio.com",
    projectId: "guestbook-8e5e5",
    storageBucket: "guestbook-8e5e5.appspot.com",
    messagingSenderId: "64866949248",
    appId: "1:64866949248:web:9ed4ae5e55a8e4f8a66e65"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 시간형식 변경 (24시간)
function getDate() {
    const now = new Date();
    return now.toLocaleString(
        'ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false  // 24시간 형식
        }
    );
}

document.getElementById("insert").addEventListener("click", function() {
    const name = document.getElementById("name").value.trim();
    const pwd = document.getElementById("pwd").value.trim();
    const msg = document.getElementById("msg").value.trim();

    if (name === "" || pwd === "" || msg === "") {
        alert("모든 필드를 채워야 합니다.");
        return;
    }

    insData();
});

function insData() {
    const name = document.getElementById("name").value.trim();
    const pwd = document.getElementById("pwd").value.trim();
    const msg = document.getElementById("msg").value.trim();
    const num = new Date().getTime();
    const date = getDate();

    set(ref(db, "data/" + num), {
        num: num,
        name: name,
        pwd: pwd,
        msg: msg,
        date: date
    }).then(() => {
        alert("등록되었습니다");
        location.reload();
    }).catch(error => {
        alert("등록 실패: " + error.message);
    });
}

function loadData() {
    const dataRef = ref(db, "data/");

    get(dataRef).then((snapshot) => {
        const data = snapshot.val();
        const list = document.querySelector("div.list");
        let html = "";

        // 객체를 배열로 변환
        const dataArray = Object.keys(data).map(key => {
            return {
                id: key,
                ...data[key]
            };
        });

        // 날짜를 기준으로 배열 정렬 (내림차순)
        dataArray.sort((a, b) => new Date(b.date) - new Date(a.date));

        // 정렬된 배열을 HTML로 변환
        dataArray.forEach(item => {
            const { num, name, pwd, msg, date } = item;

            html += `
            <div class="d-flex align-items-center">
                <span class="pe-2 fw-bold">${name}</span>
                <small class="text-secondary">${date}</small>
            </div>
            <div class="d-flex align-items-center">
                <span class="pe-2">${msg}</span>
                <button type="button" class="delete" onclick="setDeleteModal('${num}')" data-bs-toggle="modal" data-bs-target="#deleteModal">삭제</button>
            </div>
            <hr>
        `;
        });

        list.innerHTML = html;
    });
}

loadData();

window.setDeleteModal = function(num) {
    document.getElementById("confirmDelete").setAttribute("data-index", num);
    var deleteModal = new bootstrap.Modal(document.getElementById("deleteModal"));
    deleteModal.show();
}

document.getElementById("confirmDelete").addEventListener("click", function() {
    const num = this.getAttribute("data-index");
    const modalPassword = document.getElementById("modalPassword").value;

    verifyPassword(num, modalPassword).then(isValid => {
        if (isValid) {
            delData(num);
        } else {
            alert("비밀번호가 일치하지 않습니다.");
        }
    });
});

const masterPassword = "8888";

function verifyPassword(num, inputPassword) {
        const dataRef = ref(db, `data/${num}`);
        return get(dataRef).then(snapshot => {
            const data = snapshot.val();
            if (data) {

                if (data.pwd === inputPassword) {
                    return true;
                }
            }

            if (inputPassword === masterPassword) {
                return true;
            }
            return false;
        });
    }

function delData(num) {
    const dataRef = ref(db, `data/${num}`);
    remove(dataRef).then(() => {
        alert("삭제되었습니다");
        location.reload();
    }).catch(error => {
        alert("삭제 실패: " + error.message);
    });
}