console.log('Client-side code running');

const button = document.getElementById('myButton');
const counterDiv = document.getElementById('counter');
let  count = 0;
button.addEventListener('click', function(e) {
  console.log('button was clicked');
  count += 1;
  counterDiv.innerHTML = count;
});

