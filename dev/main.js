import './style.scss';

(() => {
    document.querySelector('button').addEventListener('click', () => {
        document.querySelector('.box').classList.toggle('move');
    });
})();
