const menuBtn=document.querySelector('.menu-btn'),nav=document.querySelector('.nav');
if(menuBtn&&nav)menuBtn.addEventListener('click',()=>{const open=menuBtn.classList.toggle('open');nav.classList.toggle('open',open);menuBtn.setAttribute('aria-expanded',open)});
document.querySelectorAll('.nav a').forEach(a=>a.addEventListener('click',()=>{menuBtn.classList.remove('open');nav.classList.remove('open');menuBtn.setAttribute('aria-expanded','false')}));

const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target)}}),{threshold:.13});
document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));

const countObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;const el=entry.target,target=parseFloat(el.dataset.count),decimal=!Number.isInteger(target),prefix=el.dataset.prefix||'',suffix=el.dataset.suffix||'',start=performance.now(),duration=1500;function tick(now){const p=Math.min((now-start)/duration,1),ease=1-Math.pow(1-p,3),value=target*ease;el.textContent=prefix+(decimal?value.toFixed(1):Math.round(value))+suffix;if(p<1)requestAnimationFrame(tick)}requestAnimationFrame(tick);countObserver.unobserve(el)}),{threshold:.5});
document.querySelectorAll('[data-count]').forEach(el=>countObserver.observe(el));

const leadForm=document.getElementById('leadForm');
if(leadForm)leadForm.addEventListener('submit',async e=>{
  e.preventDefault();
  const form=e.currentTarget;
  const submitButton=form.querySelector('button[type="submit"]');
  const status=form.querySelector('.form-status');
  const sheetEndpoint=form.dataset.sheetEndpoint.trim();
  const whatsappNumber=form.dataset.whatsapp;
  const data=new FormData(form);
  data.append('timestamp',new Date().toISOString());
  data.append('source','Digital India Grow Website');
  data.append('page_url',location.href);

  const message=[
    'New Free Consultation Request',
    `Name: ${data.get('name')}`,
    `Phone: ${data.get('phone')}`,
    `Email: ${data.get('email')}`,
    `Website: ${data.get('website')||'Not provided'}`,
    `Requirement: ${data.get('requirement')}`
  ].join('\n');
  const whatsappUrl=`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  // Open WhatsApp synchronously, while the click gesture is still active.
  // Doing this after `await` gets the popup blocked on mobile browsers.
  const whatsappWindow=openWhatsapp(whatsappUrl);

  submitButton.disabled=true;
  submitButton.dataset.label=submitButton.innerHTML;
  submitButton.textContent='Submitting...';
  status.className='form-status';

  try{
    const saved=sheetEndpoint?await saveLead(sheetEndpoint,data):null;
    showLeadStatus(status,saved,whatsappWindow,whatsappUrl);
    if(saved===null||saved.ok)form.reset();
  }catch(error){
    status.textContent='Request submit nahi hui. Please call +91 98710 31423.';
    status.classList.add('show','error');
  }finally{
    submitButton.disabled=false;
    submitButton.innerHTML=submitButton.dataset.label;
  }
});

function openWhatsapp(url){
  const win=window.open(url,'_blank','noopener,noreferrer');
  return win||null;
}

// Posts as urlencoded (not FormData) so Apps Script fills e.parameter, and reads
// the real JSON reply. `no-cors` used to hide every server-side failure.
async function saveLead(endpoint,data){
  const params=new URLSearchParams();
  data.forEach((value,key)=>params.append(key,value));
  const response=await fetch(endpoint,{method:'POST',body:params});
  if(!response.ok)return{ok:false,message:`Server returned ${response.status}`};
  const text=await response.text();
  try{
    const parsed=JSON.parse(text);
    // endpoints in this account reply with ok / status:'success' / success — accept all three
    return{ok:parsed.ok===true||parsed.status==='success'||parsed.success===true,message:parsed.message||text};
  }catch(error){
    return{ok:false,message:'Server ne unexpected reply bheji: '+text.slice(0,120)};
  }
}

function showLeadStatus(status,saved,whatsappWindow,whatsappUrl){
  if(saved&&!saved.ok){
    status.textContent='Request save nahi hui. Please call +91 98710 31423.';
    status.classList.add('show','error');
    console.error('Lead endpoint error:',saved.message);
    return;
  }
  status.classList.add('show');
  if(whatsappWindow){
    status.textContent=saved?'Request saved. WhatsApp confirmation is opening…':'Details ready. WhatsApp par request send karein.';
    return;
  }
  status.innerHTML=(saved?'Request saved. ':'')+`<a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer">WhatsApp par confirm karein →</a>`;
}

const header=document.querySelector('.header');if(header)addEventListener('scroll',()=>header.style.boxShadow=scrollY>30?'0 8px 30px rgba(38,25,87,.08)':'none',{passive:true});

document.querySelectorAll('[data-portfolio-slider]').forEach(slider=>{
  const viewport=slider.querySelector('.portfolio-viewport');
  const track=slider.querySelector('.portfolio-track');
  const cards=[...slider.querySelectorAll('.portfolio-card')];
  const prev=slider.parentElement.querySelector('.portfolio-prev');
  const next=slider.parentElement.querySelector('.portfolio-next');
  const dots=slider.querySelector('.portfolio-dots');
  let index=0;
  let visible=3;
  let startX=0;
  let autoplayTimer=null;
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');

  const visibleCards=()=>innerWidth<=650?Number(slider.dataset.mobile||1):innerWidth<=980?Number(slider.dataset.tablet||2):Number(slider.dataset.desktop||3);
  const render=()=>{
    visible=Math.min(visibleCards(),cards.length);
    const gap=parseFloat(getComputedStyle(track).gap)||18;
    const cardWidth=(viewport.clientWidth-gap*(visible-1))/visible;
    const maxIndex=Math.max(0,cards.length-visible);
    index=Math.min(index,maxIndex);
    cards.forEach(card=>card.style.flexBasis=`${cardWidth}px`);
    track.style.transform=`translate3d(${-index*(cardWidth+gap)}px,0,0)`;
    prev.disabled=index===0;
    next.disabled=index===maxIndex;
    dots.innerHTML='';
    for(let dotIndex=0;dotIndex<=maxIndex;dotIndex++){
      const dot=document.createElement('button');
      dot.type='button';
      dot.className=`portfolio-dot${dotIndex===index?' active':''}`;
      dot.setAttribute('aria-label',`Go to slide ${dotIndex+1}`);
      dot.addEventListener('click',()=>{index=dotIndex;render();restartAutoplay()});
      dots.appendChild(dot);
    }
  };

  const stopAutoplay=()=>{if(autoplayTimer){clearInterval(autoplayTimer);autoplayTimer=null}};
  const startAutoplay=()=>{
    stopAutoplay();
    if(reducedMotion.matches||cards.length<=visible||document.hidden)return;
    autoplayTimer=setInterval(()=>{
      const maxIndex=Math.max(0,cards.length-visible);
      index=index>=maxIndex?0:index+1;
      render();
    },2200);
  };
  const restartAutoplay=()=>{stopAutoplay();startAutoplay()};

  prev.addEventListener('click',()=>{index=index<=0?Math.max(0,cards.length-visible):index-1;render();restartAutoplay()});
  next.addEventListener('click',()=>{const maxIndex=Math.max(0,cards.length-visible);index=index>=maxIndex?0:index+1;render();restartAutoplay()});
  viewport.addEventListener('touchstart',event=>{startX=event.changedTouches[0].clientX},{passive:true});
  viewport.addEventListener('touchend',event=>{
    const distance=event.changedTouches[0].clientX-startX;
    if(Math.abs(distance)<45)return;
    index=distance<0?Math.min(cards.length-visible,index+1):Math.max(0,index-1);
    render();
    restartAutoplay();
  },{passive:true});
  slider.addEventListener('focusin',stopAutoplay);
  slider.addEventListener('focusout',event=>{if(!slider.contains(event.relatedTarget))startAutoplay()});
  document.addEventListener('visibilitychange',()=>document.hidden?stopAutoplay():startAutoplay());
  reducedMotion.addEventListener?.('change',startAutoplay);
  addEventListener('resize',()=>{render();startAutoplay()},{passive:true});
  render();
  startAutoplay();
});

const projectModal=document.getElementById('projectModal');
const projectForm=document.getElementById('projectConnectForm');
let projectModalTrigger=null;
const openProjectModal=trigger=>{
  projectModalTrigger=trigger;
  projectModal.hidden=false;
  document.body.classList.add('modal-open');
  requestAnimationFrame(()=>projectModal.querySelector('input').focus());
};
const closeProjectModal=()=>{
  projectModal.hidden=true;
  document.body.classList.remove('modal-open');
  projectModalTrigger?.focus();
};
document.querySelectorAll('[data-open-project-modal]').forEach(button=>button.addEventListener('click',()=>{
  if(button.dataset.projectType&&projectForm.elements.project){
    projectForm.elements.project.value=button.dataset.projectType;
    projectForm.dataset.cardTitle=button.dataset.projectReference||button.dataset.projectType;
  }
  openProjectModal(button);
}));
if(projectModal)projectModal.querySelectorAll('[data-close-project-modal]').forEach(button=>button.addEventListener('click',closeProjectModal));
document.addEventListener('keydown',event=>{if(projectModal&&event.key==='Escape'&&!projectModal.hidden)closeProjectModal()});
document.querySelectorAll('.service-card>a:not([data-page-link])').forEach(arrow=>{
  const card=arrow.closest('.service-card');
  const rawTitle=card.querySelector('h3').innerText.replace(/\s+/g,' ').trim();
  const serviceMap={
    'Website Development':'Website Development',
    'AI Integrated Website Chatbot':'AI Chatbot Integration',
    'Social Media Handling':'Graphic Design Services',
    'Performance Marketing':'Advertising Services',
    'SEO':'SEO Services'
  };
  arrow.setAttribute('aria-haspopup','dialog');
  arrow.setAttribute('aria-label',`Discuss ${rawTitle}`);
  arrow.addEventListener('click',event=>{
    event.preventDefault();
    projectForm.elements.project.value=serviceMap[rawTitle]||'Other';
    projectForm.dataset.cardTitle=rawTitle;
    openProjectModal(arrow);
  });
});
document.querySelectorAll('.portfolio-card .portfolio-body').forEach(body=>{
  if(!projectForm)return;
  const liveLink=body.querySelector('.portfolio-link');
  const card=body.closest('.portfolio-card');
  const section=body.closest('.portfolio-section');
  const actions=document.createElement('div');
  const connect=document.createElement('button');
  const projectType=section.id==='landing-showcase'?'Landing Page':section.id==='ecommerce-showcase'?'E-Commerce Website':'Business Website';
  actions.className='portfolio-actions';
  connect.type='button';
  connect.className='portfolio-connect';
  connect.innerHTML='Connect <span aria-hidden="true">&#8594;</span>';
  liveLink.before(actions);
  actions.append(liveLink,connect);
  connect.addEventListener('click',()=>{
    projectForm.elements.project.value=projectType;
    projectForm.dataset.cardTitle=card.querySelector('h3').textContent.trim();
    openProjectModal(connect);
  });
});
if(projectForm)projectForm.addEventListener('submit',async event=>{
  event.preventDefault();
  const data=new FormData(projectForm);
  const submitButton=projectForm.querySelector('button[type="submit"]');
  const status=projectForm.querySelector('.project-form-status');
  const sheetEndpoint=leadForm.dataset.sheetEndpoint.trim();
  const sheetData=new FormData();
  sheetData.append('name',data.get('name'));
  sheetData.append('phone',data.get('phone'));
  sheetData.append('email',data.get('email')||'');
  sheetData.append('website','');
  sheetData.append('requirement',data.get('project'));
  sheetData.append('source',`Project Popup — ${projectForm.dataset.cardTitle||'General enquiry'}`);
  sheetData.append('page_url',location.href);
  const message=[
    'Hi Digital India Grow, I would like a free project consultation.',
    `Name: ${data.get('name')}`,
    `Phone: ${data.get('phone')}`,
    `Email: ${data.get('email')||'Not provided'}`,
    `Project: ${data.get('project')}`,
    `Reference: ${projectForm.dataset.cardTitle||'General enquiry'}`
  ].join('\n');
  const whatsappUrl=`https://wa.me/${projectForm.dataset.whatsapp}?text=${encodeURIComponent(message)}`;
  const whatsappWindow=openWhatsapp(whatsappUrl);

  submitButton.disabled=true;
  const originalLabel=submitButton.innerHTML;
  submitButton.textContent='Submitting...';
  status.className='project-form-status';
  try{
    const saved=sheetEndpoint?await saveLead(sheetEndpoint,sheetData):null;
    if(saved&&!saved.ok){
      status.textContent='Request save nahi hui. Please call +91 98710 31423.';
      status.classList.add('show','error');
      console.error('Lead endpoint error:',saved.message);
      return;
    }
    status.classList.add('show');
    status.textContent=whatsappWindow
      ?'Lead Google Sheet mein save ho gayi. WhatsApp opening…'
      :'Lead save ho gayi. WhatsApp par confirm karein.';
    if(!whatsappWindow)status.innerHTML+=` <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer">WhatsApp →</a>`;
    projectForm.reset();
    setTimeout(closeProjectModal,650);
  }catch(error){
    status.textContent='Request save nahi hui. Please call +91 98710 31423.';
    status.classList.add('show','error');
  }finally{
    submitButton.disabled=false;
    submitButton.innerHTML=originalLabel;
  }
});

document.querySelectorAll('[data-flow-process]').forEach(flowProcess=>{
  const flowProcessObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>flowProcess.classList.toggle('is-active',entry.isIntersecting));
  },{threshold:.32});
  flowProcessObserver.observe(flowProcess);
});

/* ---------- contact page form (contact.html) ----------
   Shares saveLead() and openWhatsapp() with the forms above: post urlencoded so
   Apps Script fills e.parameter, and open WhatsApp inside the click gesture. */
const contactForm=document.getElementById('contactForm');
if(contactForm){
  const contactStatus=contactForm.querySelector('.ct-status');
  const contactButton=contactForm.querySelector('button[type="submit"]');

  const markInvalid=(field,invalid)=>field.setAttribute('aria-invalid',invalid?'true':'false');

  contactForm.querySelectorAll('input,select,textarea').forEach(field=>{
    ['input','change'].forEach(evt=>field.addEventListener(evt,()=>markInvalid(field,false)));
  });

  const showContactStatus=(html,isError)=>{
    contactStatus.className='ct-status show'+(isError?' error':'');
    contactStatus.innerHTML=html;
  };

  contactForm.addEventListener('submit',async event=>{
    event.preventDefault();

    let firstBad=null;
    contactForm.querySelectorAll('input[required],select[required],textarea[required]').forEach(field=>{
      const bad=!field.checkValidity();
      markInvalid(field,bad);
      if(bad&&!firstBad)firstBad=field;
    });
    if(firstBad){
      showContactStatus('Please fill the highlighted fields.',true);
      firstBad.focus();
      return;
    }

    const data=new FormData(contactForm);
    const params=new URLSearchParams();
    data.forEach((value,key)=>params.append(key,value));
    params.append('website','');
    params.append('source','Contact Page — Digital India Grow');
    params.append('page_url',location.href);
    params.append('timestamp',new Date().toISOString());

    const whatsappUrl=`https://wa.me/${contactForm.dataset.whatsapp}?text=${encodeURIComponent([
      'New Contact Page Enquiry',
      `Name: ${data.get('name')}`,
      `Phone: ${data.get('phone')}`,
      `Email: ${data.get('email')}`,
      `Service: ${data.get('requirement')}`,
      `Message: ${data.get('message')}`
    ].join('\n'))}`;
    const whatsappWindow=openWhatsapp(whatsappUrl);

    contactButton.disabled=true;
    const originalLabel=contactButton.innerHTML;
    contactButton.textContent='Sending...';

    try{
      const saved=await saveLead(contactForm.dataset.sheetEndpoint.trim(),params);
      if(!saved.ok){
        showContactStatus('Message send nahi hui. Please call <a href="tel:+919871031423">+91 9871031423</a>.',true);
        console.error('Lead endpoint error:',saved.message);
        return;
      }
      showContactStatus(whatsappWindow
        ?'Thank you! Your message is saved. WhatsApp confirmation is opening…'
        :`Thank you! Your message is saved. <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer">Confirm on WhatsApp →</a>`,false);
      contactForm.reset();
    }catch(error){
      showContactStatus('Message send nahi hui. Please call <a href="tel:+919871031423">+91 9871031423</a>.',true);
      console.error('Contact form error:',error);
    }finally{
      contactButton.disabled=false;
      contactButton.innerHTML=originalLabel;
    }
  });
}

document.querySelectorAll('.home-faq-item').forEach(item=>{
  const trigger=item.querySelector('button');
  trigger.addEventListener('click',()=>{
    const willOpen=!item.classList.contains('open');
    document.querySelectorAll('.home-faq-item').forEach(other=>{
      other.classList.remove('open');
      other.querySelector('button')?.setAttribute('aria-expanded','false');
    });
    if(willOpen){
      item.classList.add('open');
      trigger.setAttribute('aria-expanded','true');
    }
  });
});
