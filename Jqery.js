Result Skip Results Iframe
const pics = Array.from(document.querySelectorAll(' .content div '));

const big = document.querySelector('.big');
const img = big.querySelector('img');
const bod = document.querySelector('body');
const flipping =  new Flipping(); 


pics.forEach( pic => { 
  console.log('xx');
  pic.addEventListener('click', () => {
    flipping.read();
    var innerImg = pic.querySelector('img');
    innerImg.dataset.flipKey = '';
    img.src = innerImg.src; 
    bod.classList.add('open');
    var num = pic.dataset.flipKey;
    big.dataset.flipKey = num;
    flipping.flip();
  });
});