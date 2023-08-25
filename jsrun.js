(function(){(function(){
const modal = document.createElement('dialog');
const btn = document.createElement('button');
btn.onclick=(function(){this.parentNode.remove()});
btn.innerText = 'Kill Modal'
modal.appendChild(btn);
const span = document.createElement('span');
span.innerHTML=`<textarea id="jsinputbookmark">alert(1)</textarea><button onclick="eval(document.querySelector('dialog textarea#jsinputbookmark').value)">Run JS</button>`;
modal.appendChild(span);
document.body.appendChild(modal);
modal.showModal();
})();})();
