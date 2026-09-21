const form=document.getElementById('quote-form');
form?.addEventListener('submit',(e)=>{e.preventDefault();alert('Preview mode: quote submission will be enabled when this build is promoted to production.');});
document.querySelector('.menu')?.addEventListener('click',()=>{document.querySelector('.site-header nav')?.classList.toggle('open');});