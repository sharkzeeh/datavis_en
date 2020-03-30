const g = document.querySelector('g');
const path = document.querySelector('path');
const checkBox = document.getElementById('smileCheck');
const label = document.getElementById('smileLabel');

function change_string_param(pos) {
    path.setAttribute('d', `M 150 200 Q 225 ${pos} 300 200`)
}

function fun() {
    if (checkBox.checked) {
        change_string_param(300);
        label.innerHTML="Happy";
    } else {
        change_string_param(150);
        label.innerHTML="Sad";
    }
}