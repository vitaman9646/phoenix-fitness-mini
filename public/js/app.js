(function(){
'use strict';

const tg=window.Telegram?.WebApp;
const isTG=!!tg;
if(isTG){tg.ready();tg.expand()}

// ========== HELPERS ==========
function $(s){return document.querySelector(s)}
function $$(s){return document.querySelectorAll(s)}
function haptic(t){try{if(isTG&&tg.HapticFeedback)tg.HapticFeedback.impactOccurred(t||'light')}catch(e){}}
function hapticN(t){try{if(isTG&&tg.HapticFeedback)tg.HapticFeedback.notificationOccurred(t||'success')}catch(e){}}

// ========== THEME ==========
function initTheme(){
  if(isTG){
    var t=tg.colorScheme==='dark'?'dark':'light';
    document.documentElement.setAttribute('data-theme',t);
  }else{
    var saved=localStorage.getItem('theme')||'dark';
    document.documentElement.setAttribute('data-theme',saved);
  }
}

// ========== SKELETON ==========
function hideSkeleton(){
  var s=document.getElementById('skeletonOverlay');
  if(s){
    s.style.opacity='0';
    s.style.pointerEvents='none';
    setTimeout(function(){if(s.parentNode)s.parentNode.removeChild(s)},500);
  }
}

// ========== NOTIFY ==========
var Notify={
  el:null,
  init:function(){this.el=document.getElementById('notificationContainer')},
  show:function(msg,type,dur){
    if(!this.el)return;
    type=type||'info';
    dur=dur||4000;
    var icons={success:'✅',error:'❌',warning:'⚠️',info:'ℹ️'};
    var n=document.createElement('div');
    n.className='notification notif-'+(type);
    n.innerHTML='<span>'+icons[type]+'</span><span>'+msg+'</span><button class="notif-close" onclick="this.parentElement.remove()">&times;</button>';
    this.el.appendChild(n);
    setTimeout(function(){n.classList.add('removing');setTimeout(function(){if(n.parentNode)n.parentNode.removeChild(n)},300)},dur);
  }
};

// ========== MODAL ==========
var Modal={
  init:function(){
    var close=document.getElementById('modalClose');
    var overlay=document.getElementById('modalOverlay');
    if(close)close.addEventListener('click',function(){Modal.close()});
    if(overlay)overlay.addEventListener('click',function(e){if(e.target.id==='modalOverlay')Modal.close()});
  },
  open:function(html){
    var c=document.getElementById('modalContent');
    var o=document.getElementById('modalOverlay');
    if(c)c.innerHTML=html;
    if(o)o.classList.add('active');
    document.body.style.overflow='hidden';
  },
  close:function(){
    var o=document.getElementById('modalOverlay');
    if(o)o.classList.remove('active');
    document.body.style.overflow='';
  }
};

// ========== BOTTOM SHEET ==========
var Sheet={
  init:function(){
    var overlay=document.getElementById('bottomSheetOverlay');
    if(overlay)overlay.addEventListener('click',function(e){if(e.target.id==='bottomSheetOverlay')Sheet.close()});
  },
  open:function(html){
    var c=document.getElementById('bottomSheetContent');
    var o=document.getElementById('bottomSheetOverlay');
    if(c)c.innerHTML=html;
    if(o)o.classList.add('active');
    document.body.style.overflow='hidden';
  },
  close:function(){
    var o=document.getElementById('bottomSheetOverlay');
    if(o)o.classList.remove('active');
    document.body.style.overflow='';
  }
};

// ========== REVEAL ANIMATIONS ==========
function initReveals(){
  var reveals=$$('.reveal');
  if(!reveals.length)return;

  // Сразу показать элементы в viewport
  function checkReveals(){
    reveals.forEach(function(el){
      var rect=el.getBoundingClientRect();
      var inView=rect.top<window.innerHeight+100;
      if(inView){
        el.classList.add('revealed');
      }
    });
  }

  // Проверить сразу
  checkReveals();

  // И при скролле
  window.addEventListener('scroll',checkReveals,{passive:true});

  // И через секунду на всякий случай
  setTimeout(checkReveals,500);
  setTimeout(checkReveals,1500);
}

// ========== SMOOTH SCROLL ==========
function initScroll(){
  $$('[data-scroll]').forEach(function(btn){
    btn.addEventListener('click',function(e){
      e.preventDefault();
      var target=document.querySelector(btn.getAttribute('data-scroll'));
      if(target){
        target.scrollIntoView({behavior:'smooth'});
        haptic();
      }
    });
  });
}

// ========== PAGE PROGRESS ==========
function initPageProgress(){
  var bar=document.getElementById('pageProgress');
  if(!bar)return;
  var style=document.createElement('style');
  style.textContent='.page-progress::after{content:"";display:block;height:100%;background:var(--accent);width:var(--pp,0%);transition:width .1s linear}';
  document.head.appendChild(style);
  window.addEventListener('scroll',function(){
    var h=document.documentElement.scrollHeight-window.innerHeight;
    var pct=h>0?(window.scrollY/h)*100:0;
    bar.style.setProperty('--pp',pct+'%');
  },{passive:true});
}

// ========== STICKY NAV ==========
function initStickyNav(){
  var links=$$('.sticky-link');
  var sections=[];
  links.forEach(function(l){
    var sec=document.getElementById(l.getAttribute('data-section'));
    if(sec)sections.push({link:l,section:sec});
  });
  window.addEventListener('scroll',function(){
    var cur='';
    sections.forEach(function(s){
      if(window.scrollY>=s.section.offsetTop-150)cur=s.section.id;
    });
    links.forEach(function(l){
      l.classList.toggle('active',l.getAttribute('data-section')===cur);
    });
  },{passive:true});
}

// ========== STAT COUNTERS ==========
function initCounters(){
  var counters=$$('.stat-number[data-target]');
  var animated={};

  function checkCounters(){
    counters.forEach(function(el,i){
      if(animated[i])return;
      var rect=el.getBoundingClientRect();
      if(rect.top<window.innerHeight&&rect.bottom>0){
        animated[i]=true;
        animateNum(el);
      }
    });
  }

  window.addEventListener('scroll',checkCounters,{passive:true});
  checkCounters();
}

function animateNum(el){
  var target=parseFloat(el.getAttribute('data-target'));
  var isFloat=target%1!==0;
  var startTime=performance.now();
  var duration=2000;

  function update(now){
    var elapsed=now-startTime;
    var p=Math.min(elapsed/duration,1);
    var eased=1-Math.pow(1-p,3);
    var val=target*eased;
    el.textContent=isFloat?val.toFixed(1):Math.floor(val);
    if(p<1)requestAnimationFrame(update);
    else el.textContent=isFloat?target.toFixed(1):String(target);
  }

  requestAnimationFrame(update);
}

// ========== CASES CAROUSEL ==========
var Cases={
  slides:[],filtered:[],cur:0,
  init:function(){
    this.slides=Array.from($$('.case-slide'));
    this.filtered=this.slides.slice();
    if(!this.slides.length)return;
    this.buildDots();
    this.bindControls();
    this.bindFilters();
    this.show();
  },
  buildDots:function(){
    var c=document.getElementById('casesDots');
    if(!c)return;
    var html='';
    for(var i=0;i<this.filtered.length;i++){
      html+='<button class="cases-dot'+(i===0?' active':'')+'"></button>';
    }
    c.innerHTML=html;
    var self=this;
    c.querySelectorAll('.cases-dot').forEach(function(d,i){
      d.addEventListener('click',function(){self.go(i);haptic()});
    });
  },
  bindControls:function(){
    var self=this;
    var prev=document.getElementById('casesPrev');
    var next=document.getElementById('casesNext');
    if(prev)prev.addEventListener('click',function(){self.go(self.cur-1);haptic()});
    if(next)next.addEventListener('click',function(){self.go(self.cur+1);haptic()});

    var track=document.getElementById('casesTrack');
    if(!track)return;
    var sx=0,dx=0;
    track.addEventListener('touchstart',function(e){sx=e.touches[0].clientX},{passive:true});
    track.addEventListener('touchmove',function(e){dx=e.touches[0].clientX-sx},{passive:true});
    track.addEventListener('touchend',function(){
      if(Math.abs(dx)>50){
        if(dx<0)self.go(self.cur+1);
        else self.go(self.cur-1);
        haptic();
      }
      dx=0;
    });
  },
  bindFilters:function(){
    var self=this;
    $$('.cases-filters .filter-btn').forEach(function(btn){
      btn.addEventListener('click',function(){
        $$('.cases-filters .filter-btn').forEach(function(b){b.classList.remove('active')});
        btn.classList.add('active');
        var f=btn.getAttribute('data-filter');
        if(f==='all'){
          self.filtered=self.slides.slice();
        }else{
          self.filtered=self.slides.filter(function(s){
            return(s.getAttribute('data-tags')||'').indexOf(f)!==-1;
          });
        }
        self.cur=0;self.buildDots();self.show();haptic();
      });
    });
  },
  go:function(i){
    if(!this.filtered.length)return;
    this.cur=((i%this.filtered.length)+this.filtered.length)%this.filtered.length;
    this.show();
  },
  show:function(){
    this.slides.forEach(function(s){s.style.display='none';s.classList.remove('active')});
    if(this.filtered[this.cur]){
      this.filtered[this.cur].style.display='block';
      this.filtered[this.cur].classList.add('active');
    }
    $$('.cases-dot').forEach(function(d,i){
      d.classList.toggle('active',i===this.cur);
    }.bind(this));
  }
};

// ========== REVIEWS ==========
function initReviews(){
  var grid=document.getElementById('reviewsGrid');
  if(!grid)return;
  var data=[
    {stars:5,text:'"За 3 месяца потерял 15 кг и чувствую себя заново"',name:'Сергей П.',date:'3 мес'},
    {stars:5,text:'"Лучший тренер! Наконец вижу результат"',name:'Мария К.',date:'2 мес'},
    {stars:5,text:'"Дома без зала похудела на 11 кг!"',name:'Анна В.',date:'1 мес'},
    {stars:4,text:'"Набрал 8 кг мышц. Программа чёткая"',name:'Игорь Д.',date:'5 нед'}
  ];
  var html='';
  data.forEach(function(r){
    var starsHtml='';
    for(var i=0;i<r.stars;i++)starsHtml+='⭐';
    html+='<div class="review-card">';
    html+='<div class="review-stars">'+starsHtml+'</div>';
    html+='<p class="review-text">'+r.text+'</p>';
    html+='<div class="review-author"><span class="review-name">'+r.name+'</span><span>'+r.date+'</span></div>';
    html+='</div>';
  });
  grid.innerHTML=html;
}

// ========== LEAVE REVIEW ==========
function initLeaveReview(){
  var btn=document.getElementById('leaveReviewBtn');
  if(!btn)return;
  btn.addEventListener('click',function(){
    var rating=0;
    Sheet.open(
      '<form class="review-form" id="reviewFormInner">'+
      '<h3>Оставить отзыв</h3>'+
      '<div class="review-stars" id="revStars">'+
      '<button type="button" class="review-star" data-r="1">⭐</button>'+
      '<button type="button" class="review-star" data-r="2">⭐</button>'+
      '<button type="button" class="review-star" data-r="3">⭐</button>'+
      '<button type="button" class="review-star" data-r="4">⭐</button>'+
      '<button type="button" class="review-star" data-r="5">⭐</button>'+
      '</div>'+
      '<div class="form-field"><label class="form-label">Имя</label><input type="text" class="input" id="revName" required value="'+(isTG&&tg.initDataUnsafe&&tg.initDataUnsafe.user?tg.initDataUnsafe.user.first_name:'')+'"></div>'+
      '<div class="form-field"><label class="form-label">Отзыв</label><textarea class="input" id="revText" rows="3" required></textarea></div>'+
      '<button type="submit" class="btn btn-primary" style="width:100%">Отправить</button>'+
      '</form>'
    );
    setTimeout(function(){
      var stars=document.querySelectorAll('#revStars .review-star');
      stars.forEach(function(s){
        s.addEventListener('click',function(){
          rating=parseInt(s.getAttribute('data-r'));
          stars.forEach(function(st,i){st.classList.toggle('active',i<rating)});
          haptic();
        });
      });
      var form=document.getElementById('reviewFormInner');
      if(form)form.addEventListener('submit',function(e){
        e.preventDefault();
        if(!rating){Notify.show('Поставь оценку','warning');return}
        Sheet.close();
        Notify.show('Спасибо за отзыв! ❤️','success');
        hapticN('success');
      });
    },200);
  });
}

// ========== QUIZ ==========
var Quiz={
  answers:{},
  history:[],
  init:function(){
    var self=this;
    // Options
    $$('.quiz-option').forEach(function(opt){
      opt.addEventListener('click',function(){
        var stepEl=opt.closest('.quiz-step');
        var step=stepEl.getAttribute('data-step');
        var nextStep=opt.getAttribute('data-next');
        var value=opt.getAttribute('data-value');

        stepEl.querySelectorAll('.quiz-option').forEach(function(o){o.classList.remove('selected')});
        opt.classList.add('selected');
        self.answers['step_'+step]=value;
        self.history.push(step);
        haptic('medium');
        setTimeout(function(){self.goTo(nextStep)},300);
      });
    });

    // Back
    var back=document.getElementById('quizBack');
    if(back)back.addEventListener('click',function(){
      if(self.history.length){self.goTo(self.history.pop());haptic()}
    });

    // Restart
    var restart=document.getElementById('quizRestart');
    if(restart)restart.addEventListener('click',function(){
      self.answers={};self.history=[];self.goTo('1');haptic();
    });

    // Share
    var share=document.getElementById('shareQuiz');
    if(share)share.addEventListener('click',function(){
      var text='Прошёл квиз у фитнес-тренера! 💪';
      if(isTG)tg.openTelegramLink('https://t.me/share/url?url='+encodeURIComponent('https://t.me/your_bot/app')+'&text='+encodeURIComponent(text));
      else if(navigator.share)navigator.share({title:'Квиз',text:text});
      else{navigator.clipboard.writeText(text);Notify.show('Скопировано!','success')}
      hapticN('success');
    });

    // Download
    var dl=document.getElementById('downloadBonus');
    if(dl)dl.addEventListener('click',function(){
      Notify.show('Бонус отправлен! 📩','success');
      hapticN('success');
    });
  },

  goTo:function(step){
    $$('.quiz-step').forEach(function(s){s.classList.remove('active')});
    var target=document.querySelector('.quiz-step[data-step="'+step+'"]');
    if(target)target.classList.add('active');

    var prog=document.getElementById('quizProgress');
    if(prog){
      var widths={'1':25,'2':50,'3':75,'4':100,'result':100};
      prog.style.width=(widths[step]||0)+'%';
    }

    var back=document.getElementById('quizBack');
    if(back)back.style.display=(step==='1')?'none':'block';

    if(step==='result')this.showResult();
  },

  showResult:function(){
    var gt={loss:'похудение',gain:'набор массы',tone:'тонус'};
    var pt={home:'дома',gym:'в зале',both:'везде'};
    var el=document.getElementById('quizResultText');
    if(el){
      el.innerHTML='<p><strong>Цель:</strong> '+(gt[this.answers.step_1]||'—')+
        ' | <strong>Место:</strong> '+(pt[this.answers.step_2]||'—')+
        ' | <strong>'+(this.answers.step_3||3)+'×/нед</strong></p>'+
        '<p>Рекомендация: тариф <strong>«Оптимальный»</strong></p>';
    }
    this.buildWeekPlan();
    this.prefillForm();
  },

  buildWeekPlan:function(){
    var el=document.getElementById('quizWeekPlan');
    if(!el)return;
    var days=['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
    var freq=parseInt(this.answers.step_3)||3;
    var html='<div class="week-plan-title">📅 Примерный план:</div>';
    for(var i=0;i<days.length;i++){
      if(i<freq){
        html+='<div class="week-plan-day"><span class="week-plan-name">'+days[i]+'</span><span class="week-plan-workout">Тренировка '+(i+1)+'</span></div>';
      }else{
        html+='<div class="week-plan-day"><span class="week-plan-name">'+days[i]+'</span><span class="week-plan-rest">Отдых</span></div>';
      }
    }
    el.innerHTML=html;
  },

  prefillForm:function(){
    var sel=document.getElementById('inputGoal');
    if(sel&&this.answers.step_1)sel.value=this.answers.step_1;
  }
};

// ========== PROGRESS CALCULATOR ==========
function initProgressCalc(){
  var btn=document.getElementById('calcProgressBtn');
  if(!btn)return;

  // Load saved
  try{
    var saved=JSON.parse(localStorage.getItem('fitProgress'));
    if(saved){
      if(saved.sw)document.getElementById('startWeight').value=saved.sw;
      if(saved.cw)document.getElementById('currentWeight').value=saved.cw;
      if(saved.gw)document.getElementById('goalWeight').value=saved.gw;
    }
  }catch(e){}

  btn.addEventListener('click',function(){
    var sw=parseFloat(document.getElementById('startWeight').value);
    var cw=parseFloat(document.getElementById('currentWeight').value);
    var gw=parseFloat(document.getElementById('goalWeight').value);
    if(!sw||!cw||!gw){Notify.show('Заполни все поля','warning');return}

    var lost=sw-cw;
    var total=sw-gw;
    var pct=total>0?Math.min(Math.round((lost/total)*100),100):0;
    var remain=Math.max(cw-gw,0);

    document.getElementById('lostWeight').textContent=lost.toFixed(1);
    document.getElementById('progressPercent').textContent=pct+'%';
    document.getElementById('remainWeight').textContent=remain.toFixed(1);

    document.getElementById('calcResults').style.display='grid';

    var wrap=document.getElementById('progressBarWrap');
    if(wrap){
      wrap.style.display='block';
      document.getElementById('progressFill').style.width=pct+'%';
      document.getElementById('pLabelStart').textContent=sw+' кг';
      document.getElementById('pLabelGoal').textContent=gw+' кг';
    }

    localStorage.setItem('fitProgress',JSON.stringify({sw:sw,cw:cw,gw:gw}));
    hapticN('success');
    Cabinet.checkBadges();
  });
}

// ========== KBJU CALCULATOR ==========
var KBJU={
  gender:'male',
  init:function(){
    var self=this;
    $$('[data-gender]').forEach(function(btn){
      btn.addEventListener('click',function(){
        $$('[data-gender]').forEach(function(b){b.classList.remove('active')});
        btn.classList.add('active');
        self.gender=btn.getAttribute('data-gender');
        haptic();
      });
    });
    var form=document.getElementById('kbjuForm');
    if(form)form.addEventListener('submit',function(e){
      e.preventDefault();
      self.calc();
      hapticN('success');
    });
  },
  calc:function(){
    var age=parseInt(document.getElementById('kbjuAge').value);
    var w=parseFloat(document.getElementById('kbjuWeight').value);
    var h=parseFloat(document.getElementById('kbjuHeight').value);
    var act=parseFloat(document.getElementById('kbjuActivity').value);
    var goal=document.getElementById('kbjuGoal').value;
    if(!age||!w||!h){Notify.show('Заполни все поля','warning');return}

    var bmr=this.gender==='male'?10*w+6.25*h-5*age+5:10*w+6.25*h-5*age-161;
    var mult={loss:0.8,maintain:1,gain:1.15};
    var cal=Math.round(bmr*act*(mult[goal]||1));
    var prot=Math.round(w*(goal==='gain'?2.2:2));
    var fat=Math.round((cal*0.25)/9);
    var carbs=Math.max(0,Math.round((cal-prot*4-fat*9)/4));

    this.animVal('kbjuCal',cal);
    this.animVal('kbjuP',prot);
    this.animVal('kbjuF',fat);
    this.animVal('kbjuC',carbs);

    var r=document.getElementById('kbjuResults');
    if(r){r.style.display='block';r.scrollIntoView({behavior:'smooth',block:'nearest'})}
  },
  animVal:function(id,target){
    var el=document.getElementById(id);
    if(!el)return;
    var start=performance.now();
    function up(now){
      var p=Math.min((now-start)/800,1);
      el.textContent=Math.round(target*(1-Math.pow(1-p,3)));
      if(p<1)requestAnimationFrame(up);
    }
    requestAnimationFrame(up);
  }
};

// ========== CHALLENGE ==========
var Challenge={
  data:null,
  init:function(){
    this.load();
    this.render();
    var self=this;
    var btn=document.getElementById('challengeBtn');
    if(btn)btn.addEventListener('click',function(){self.checkIn()});
  },
  load:function(){
    var week=Math.floor((Date.now()-new Date('2024-01-01').getTime())/(7*864e5));
    var challenges=['«50 приседаний в день»','«Планка 1 мин утром»','«10000 шагов»','«2л воды в день»','«30 отжиманий»','«Зарядка 10 мин»','«Без сахара 7 дней»'];
    try{
      this.data=JSON.parse(localStorage.getItem('fitChallenge'));
      if(!this.data||this.data.week!==week){
        this.data={week:week,desc:challenges[week%challenges.length],days:[],total:7};
      }
    }catch(e){
      this.data={week:week,desc:challenges[week%challenges.length],days:[],total:7};
    }
    this.save();
  },
  save:function(){localStorage.setItem('fitChallenge',JSON.stringify(this.data))},
  render:function(){
    var desc=document.getElementById('challengeDesc');
    if(desc)desc.textContent=this.data.desc;

    var grid=document.getElementById('challengeDays');
    if(grid){
      var dayNames=['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
      var today=new Date().getDay();
      var todayIdx=today===0?6:today-1;
      var html='';
      var self=this;
      for(var i=0;i<7;i++){
        var done=this.data.days.indexOf(i)!==-1;
        var isToday=i===todayIdx;
        html+='<div class="challenge-day'+(done?' done':'')+(isToday?' today':'')+'">'+(done?'✓':dayNames[i])+'</div>';
      }
      grid.innerHTML=html;
    }

    var comp=document.getElementById('challengeCompleted');
    if(comp)comp.textContent=this.data.days.length;

    var fill=document.getElementById('challengeBarFill');
    if(fill)fill.style.width=(this.data.days.length/this.data.total*100)+'%';

    var btn=document.getElementById('challengeBtn');
    var today2=new Date().getDay();
    var todayIdx2=today2===0?6:today2-1;
    if(btn&&this.data.days.indexOf(todayIdx2)!==-1){
      btn.textContent='✓ Отмечено';
      btn.disabled=true;
      btn.className='btn btn-ghost';
    }
  },
  checkIn:function(){
    var today=new Date().getDay();
    var todayIdx=today===0?6:today-1;
    if(this.data.days.indexOf(todayIdx)!==-1)return;
    this.data.days.push(todayIdx);
    this.save();
    this.render();
    hapticN('success');
    if(this.data.days.length>=this.data.total){
      Notify.show('🎉 Челлендж выполнен!','success',5000);
    }
    Cabinet.data.workouts++;
    Cabinet.save();
    Cabinet.checkBadges();
    Cabinet.render();
  }
};

// ========== PRICING TOGGLE ==========
function initPricing(){
  $$('.pricing-toggle-btn').forEach(function(btn){
    btn.addEventListener('click',function(){
      $$('.pricing-toggle-btn').forEach(function(b){b.classList.remove('active')});
      btn.classList.add('active');
      var p=btn.getAttribute('data-period');
      $$('.monthly').forEach(function(el){el.style.display=p==='monthly'?'':'none'});
      $$('.quarterly').forEach(function(el){el.style.display=p==='quarterly'?'':'none'});
      haptic();
    });
  });
  $$('[data-tariff]').forEach(function(btn){
    btn.addEventListener('click',function(){
      var sel=document.getElementById('inputTariff');
      if(sel)sel.value=btn.getAttribute('data-tariff');
    });
  });
}

// ========== FAQ ==========
function initFAQ(){
  var search=document.getElementById('faqSearch');
  var items=$$('.faq-item');
  var empty=document.getElementById('faqEmpty');

  if(search)search.addEventListener('input',function(){
    var q=search.value.toLowerCase().trim();
    var vis=0;
    $$('[data-faq]').forEach(function(b){b.classList.toggle('active',b.getAttribute('data-faq')==='all')});
    items.forEach(function(item){
      var match=!q||item.textContent.toLowerCase().indexOf(q)!==-1;
      item.hidden=!match;
      if(match)vis++;
    });
    if(empty)empty.style.display=vis===0?'block':'none';
  });

  $$('[data-faq]').forEach(function(btn){
    btn.addEventListener('click',function(){
      $$('[data-faq]').forEach(function(b){b.classList.remove('active')});
      btn.classList.add('active');
      var cat=btn.getAttribute('data-faq');
      items.forEach(function(item){
        item.hidden=cat!=='all'&&item.getAttribute('data-cat')!==cat;
      });
      if(search)search.value='';
      haptic();
    });
  });

  var askBtn=document.getElementById('askBtn');
  if(askBtn)askBtn.addEventListener('click',function(){
    if(isTG)tg.openTelegramLink('https://t.me/vitaman777');
    else window.open('https://t.me/vitaman777','_blank');
  });
}

// ========== CTA FORM ==========
function initForm(){
  if(isTG&&tg.initDataUnsafe&&tg.initDataUnsafe.user){
    var u=tg.initDataUnsafe.user;
    var n=document.getElementById('inputName');
    if(n)n.value=u.first_name+(u.last_name?' '+u.last_name:'');
  }

  var form=document.getElementById('ctaForm');
  if(!form)return;

  form.addEventListener('submit',function(e){
    e.preventDefault();
    var honeypot=form.querySelector('input[name="website"]');
    if(honeypot&&honeypot.value)return;

    var btn=form.querySelector('button[type="submit"]');
    var btnText=btn.querySelector('.btn-text');
    var btnLoader=btn.querySelector('.btn-loader');

    var name=form.name.value.trim();
    var goal=form.goal.value;

    if(name.length<2){Notify.show('Введи имя','warning');return}
    if(!goal){Notify.show('Выбери цель','warning');return}
    if(!navigator.onLine){Notify.show('Нет интернета','error');return}

    btnText.style.display='none';
    btnLoader.style.display='inline';
    btn.disabled=true;

    // Simulate send
    setTimeout(function(){
      if(isTG){
        try{
          tg.sendData(JSON.stringify({
            action:'lead',
            name:name,
            goal:goal,
            tariff:form.tariff?form.tariff.value:'',
            quiz:Quiz.answers
          }));
        }catch(err){}
      }

      hapticN('success');

      var ctaSection=document.getElementById('ctaFinal');
      if(ctaSection)ctaSection.style.display='none';

      var success=document.getElementById('successSection');
      if(success){
        success.style.display='flex';
        success.scrollIntoView({behavior:'smooth'});
      }

      Notify.show('Заявка отправлена! 🎉','success');

      Cabinet.data.user.name=name;
      Cabinet.save();
      Cabinet.render();

      btnText.style.display='inline';
      btnLoader.style.display='none';
      btn.disabled=false;
      form.reset();
    },1000);
  });
}

// ========== CABINET ==========
var Cabinet={
  data:null,
  badges:[
    {id:'first',icon:'🎯',name:'Первый шаг',check:function(d){return d.workouts>=1}},
    {id:'week',icon:'🔥',name:'Неделя огня',check:function(d){return d.workouts>=7}},
    {id:'month',icon:'💪',name:'Месяц силы',check:function(d){return d.workouts>=30}},
    {id:'streak7',icon:'🔥',name:'7 дней подряд',check:function(d){return d.streak>=7}},
    {id:'water',icon:'💧',name:'Водный баланс',check:function(d){return d.water>=8}},
    {id:'kg1',icon:'📉',name:'−1 кг',check:function(){try{var p=JSON.parse(localStorage.getItem('fitProgress'));return p&&p.sw-p.cw>=1}catch(e){return false}}},
    {id:'kg5',icon:'🎊',name:'−5 кг',check:function(){try{var p=JSON.parse(localStorage.getItem('fitProgress'));return p&&p.sw-p.cw>=5}catch(e){return false}}},
    {id:'quiz',icon:'📋',name:'Квиз пройден',check:function(){return Object.keys(Quiz.answers).length>=4}},
    {id:'referral',icon:'🎁',name:'Первый реферал',check:function(d){return d.referrals>=1}},
    {id:'challenge',icon:'🏆',name:'Челлендж',check:function(){try{var c=JSON.parse(localStorage.getItem('fitChallenge'));return c&&c.days.length>=7}catch(e){return false}}}
  ],

  init:function(){
    this.load();
    this.render();
    this.initHabits();
    this.initReferral();

    if(isTG&&tg.initDataUnsafe&&tg.initDataUnsafe.user){
      var u=tg.initDataUnsafe.user;
      this.data.user.name=u.first_name+(u.last_name?' '+u.last_name:'');
      this.save();
    }
  },

  load:function(){
    try{
      this.data=JSON.parse(localStorage.getItem('fitCabinet'));
    }catch(e){}
    if(!this.data)this.data=this.defaults();

    var today=new Date().toISOString().split('T')[0];
    if(this.data.lastDate!==today){
      this.data.habits.forEach(function(h){h.done=false});
      this.data.water=0;
      this.data.lastDate=today;
      this.save();
    }
  },

  defaults:function(){
    return{
      user:{name:'',tariff:'standard'},
      workouts:0,streak:0,water:0,referrals:0,
      earned:{},
      habits:[
        {id:1,text:'Тренировка',done:false},
        {id:2,text:'8 стаканов воды',done:false},
        {id:3,text:'Считать КБЖУ',done:false},
        {id:4,text:'Сон 7+ часов',done:false}
      ],
      referralCode:'FIT-'+Math.random().toString(36).substr(2,5).toUpperCase(),
      lastDate:new Date().toISOString().split('T')[0]
    };
  },

  save:function(){
    try{localStorage.setItem('fitCabinet',JSON.stringify(this.data))}catch(e){}
  },

  render:function(){
    var d=this.data;
    var name=document.getElementById('cabName');
    if(name)name.textContent=d.user.name||'Клиент';

    var avatar=document.getElementById('cabAvatar');
    if(avatar)avatar.textContent=(d.user.name||'?')[0].toUpperCase();

    var tariff=document.getElementById('cabTariff');
    if(tariff)tariff.textContent='Тариф: '+(d.user.tariff==='vip'?'VIP':d.user.tariff==='standard'?'Оптимальный':'Базовый');

    var result=document.getElementById('cabResult');
    if(result){
      try{
        var p=JSON.parse(localStorage.getItem('fitProgress'));
        if(p)result.textContent=(p.sw-p.cw).toFixed(1)+' кг';
      }catch(e){}
    }

    var workouts=document.getElementById('cabWorkouts');
    if(workouts)workouts.textContent=d.workouts;

    var streak=document.getElementById('cabStreak');
    if(streak)streak.textContent=d.streak;

    var streakCount=document.getElementById('streakCount');
    if(streakCount)streakCount.textContent=d.streak;

    this.renderBadges();

    var code=document.getElementById('referralCode');
    if(code)code.value=d.referralCode;
  },

  renderBadges:function(){
    var grid=document.getElementById('badgesGrid');
    if(!grid)return;
    var self=this;
    var html='';
    this.badges.forEach(function(b){
      var earned=!!self.data.earned[b.id];
      html+='<div class="badge '+(earned?'earned':'locked')+'" title="'+b.name+'"><div class="badge-icon">'+b.icon+'</div><div class="badge-name">'+b.name+'</div></div>';
    });
    grid.innerHTML=html;
  },

  checkBadges:function(){
    var d=this.data;
    var newBadge=null;
    var self=this;
    this.badges.forEach(function(b){
      if(!d.earned[b.id]&&b.check(d)){
        d.earned[b.id]=Date.now();
        newBadge=b;
      }
    });
    if(newBadge){
      this.save();
      this.renderBadges();
      var toast=document.getElementById('badgeToast');
      var icon=document.getElementById('badgeToastIcon');
      var bname=document.getElementById('badgeToastName');
      if(toast&&icon&&bname){
        icon.textContent=newBadge.icon;
        bname.textContent=newBadge.name;
        toast.classList.add('show');
        hapticN('success');
        setTimeout(function(){toast.classList.remove('show')},3000);
      }
    }
  },

  initHabits:function(){
    this.renderHabits();
    var self=this;
    var addBtn=document.getElementById('habitAddBtn');
    var input=document.getElementById('habitInput');

    function addHabit(){
      var text=input.value.trim();
      if(!text)return;
      var maxId=0;
      self.data.habits.forEach(function(h){if(h.id>maxId)maxId=h.id});
      self.data.habits.push({id:maxId+1,text:text,done:false});
      self.save();
      input.value='';
      self.renderHabits();
      haptic();
    }

    if(addBtn)addBtn.addEventListener('click',addHabit);
    if(input)input.addEventListener('keypress',function(e){if(e.key==='Enter')addHabit()});
  },

  renderHabits:function(){
    var list=document.getElementById('habitsList');
    if(!list)return;
    var self=this;
    var html='';
    this.data.habits.forEach(function(h){
      html+='<div class="habit-item'+(h.done?' done':'')+'" data-id="'+h.id+'">';
      html+='<button class="habit-check" data-id="'+h.id+'">'+(h.done?'✓':'')+'</button>';
      html+='<span class="habit-text">'+h.text+'</span>';
      html+='<button class="habit-del" data-id="'+h.id+'">✕</button>';
      html+='</div>';
    });
    list.innerHTML=html;

    // Toggle
    list.querySelectorAll('.habit-check').forEach(function(btn){
      btn.addEventListener('click',function(){
        var id=parseInt(btn.getAttribute('data-id'));
        var habit=null;
        self.data.habits.forEach(function(h){if(h.id===id)habit=h});
        if(habit){
          habit.done=!habit.done;
          if(habit.done)self.data.workouts++;
          self.save();
          self.renderHabits();
          self.render();
          var allDone=true;
          self.data.habits.forEach(function(h){if(!h.done)allDone=false});
          if(allDone){
            self.data.streak++;
            self.save();
            self.render();
            Notify.show('Все привычки выполнены! 🔥','success');
          }
          self.checkBadges();
          haptic();
        }
      });
    });

    // Delete
    list.querySelectorAll('.habit-del').forEach(function(btn){
      btn.addEventListener('click',function(){
        var id=parseInt(btn.getAttribute('data-id'));
        self.data.habits=self.data.habits.filter(function(h){return h.id!==id});
        self.save();
        self.renderHabits();
      });
    });
  },

  initReferral:function(){
    var self=this;
    var copyBtn=document.getElementById('copyReferral');
    if(copyBtn)copyBtn.addEventListener('click',function(){
      navigator.clipboard.writeText(self.data.referralCode);
      Notify.show('Код скопирован!','success');
      haptic();
    });

    var shareBtn=document.getElementById('shareReferral');
    if(shareBtn)shareBtn.addEventListener('click',function(){
      var text='Тренируюсь с фитнес-тренером Виталием! Код '+self.data.referralCode+' для скидки 💪';
      if(isTG)tg.openTelegramLink('https://t.me/share/url?url='+encodeURIComponent('https://t.me/your_bot/app')+'&text='+encodeURIComponent(text));
      else if(navigator.share)navigator.share({title:'Фитнес',text:text});
      else{navigator.clipboard.writeText(text);Notify.show('Скопировано!','success')}
      hapticN('success');
    });
  }
};

// ========== TELEGRAM ==========
function initTelegram(){
  if(!isTG)return;
  try{
    tg.MainButton.setText('Получить план');
    tg.MainButton.color=tg.themeParams.button_color||'#00e5ff';
    tg.MainButton.textColor=tg.themeParams.button_text_color||'#000';
    tg.MainButton.show();
    tg.MainButton.onClick(function(){
      var cta=document.getElementById('ctaFinal');
      if(cta)cta.scrollIntoView({behavior:'smooth'});
    });
  }catch(e){}

  if(tg.initDataUnsafe&&tg.initDataUnsafe.user&&tg.initDataUnsafe.user.first_name){
    var h=document.getElementById('heroTitle');
    if(h)h.textContent=tg.initDataUnsafe.user.first_name+', трансформация начинается здесь';
  }
}

function initChatFab(){
  var fab=document.getElementById('chatFab');
  if(!fab)return;
  fab.addEventListener('click',function(){
    if(isTG)tg.openTelegramLink('https://t.me/vitaman777');
    else window.open('https://t.me/vitaman777','_blank');
    haptic();
  });
}

// ========== INIT ALL ==========
document.addEventListener('DOMContentLoaded',function(){
  console.log('App init started');

  try{initTheme()}catch(e){console.error('Theme error:',e)}
  try{Notify.init()}catch(e){console.error('Notify error:',e)}
  try{Modal.init()}catch(e){console.error('Modal error:',e)}
  try{Sheet.init()}catch(e){console.error('Sheet error:',e)}
  try{initTelegram()}catch(e){console.error('TG error:',e)}
  try{initChatFab()}catch(e){console.error('ChatFab error:',e)}
  try{initPageProgress()}catch(e){console.error('PageProgress error:',e)}
  try{initStickyNav()}catch(e){console.error('StickyNav error:',e)}
  try{initReveals()}catch(e){console.error('Reveals error:',e)}
  try{initScroll()}catch(e){console.error('Scroll error:',e)}
  try{initCounters()}catch(e){console.error('Counters error:',e)}
  try{Cases.init()}catch(e){console.error('Cases error:',e)}
  try{initReviews()}catch(e){console.error('Reviews error:',e)}
  try{initLeaveReview()}catch(e){console.error('LeaveReview error:',e)}
  try{Quiz.init()}catch(e){console.error('Quiz error:',e)}
  try{initProgressCalc()}catch(e){console.error('ProgressCalc error:',e)}
  try{KBJU.init()}catch(e){console.error('KBJU error:',e)}
  try{Challenge.init()}catch(e){console.error('Challenge error:',e)}
  try{initPricing()}catch(e){console.error('Pricing error:',e)}
  try{Cabinet.init()}catch(e){console.error('Cabinet error:',e)}
  try{initFAQ()}catch(e){console.error('FAQ error:',e)}
  try{initForm()}catch(e){console.error('Form error:',e)}

  var yearEl=document.getElementById('currentYear');
  if(yearEl)yearEl.textContent=new Date().getFullYear();

  // Hide skeleton
  hideSkeleton();

  console.log('App init complete');
});

// Аварийное скрытие скелетона
setTimeout(hideSkeleton,2000);

})();
