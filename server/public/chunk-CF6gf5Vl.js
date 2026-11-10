import{i as ke,r as ie$1}from"./main-DEP6WD7J.js";import"./chunk-CATaXv3y.js";import{o as Te,s as ie$2}from"./chunk-Cs_oQDTH.js";import{a as Xi,n as G,r as Ot}from"./chunk-CYRqKTbU.js";import{l as ir,m as we,p as rr,s as bt,t as Fe}from"./chunk-Io1b3U6S.js";import{f as Yt,g as se,i as Mn,s as Pe,u as Vn}from"./chunk-Bj5_6M93.js";import{D as kc,T as gc,l as Mi,r as Gt,s as Lc,w as fe$1}from"./chunk-DA26F_-k.js";import{$n as be$1,An as Wv,At as OI,B as Gi,Br as l4,Bt as Qc,Ci as ve$1,Di as vt,Dn as WU,Dt as Nr,Er as ie$3,F as Fx,Hr as le$1,It as PI,Jt as Rr,Li as x_,Ln as Ze,M as FI,O as ES,P as Ft,Pt as Or,Ri as xf,Rn as Zi,Rr as kr,Rt as Pt,Wt as RI,Zi as yt,Zr as nt,Zt as S_,_t as Mo,a as $y,ai as re$1,an as Tf,ar as cn,c as Ar,d as B,ei as pi,et as J,fi as st$1,gr as g,gt as Mf,hi as te$1,ht as Me,in as Te$1,j as Ep,ji as wa,jt as On,k as Ea,ki as w,kn as We,kr as it,m as Bf,na as zy,p as Be,pr as f,rr as cD,sn as To,st as K,ta as zv,tr as bx,ur as ee$1,ut as Le,v as CS,vt as My,wi as vp,wn as W,xr as hc,yt as N}from"./chunk-DHTEIVqJ.js";var d=(function(a){return a[a.START=1]=`START`,a[a.END=2]=`END`,a})(d||{});var L=(function(a){return a[a.ACTIVE=0]=`ACTIVE`,a[a.INACTIVE=1]=`INACTIVE`,a})(L||{});var at=new g(`_MatSlider`);var te=new g(`_MatSliderThumb`);var re=new g(`_MatSliderRangeThumb`);var ee=new g(`_MatSliderVisualThumb`);var le=(()=>{class a{_cdr=f(Or);_ngZone=f(N);_slider=f(at);_renderer=f(We);_listenerCleanups;discrete=!1;thumbPosition;valueIndicatorText;_ripple;_knob;_valueIndicatorContainer;_sliderInput;_sliderInputEl;_hoverRippleRef;_focusRippleRef;_activeRippleRef;_isHovered=!1;_isActive=!1;_isValueIndicatorVisible=!1;_hostElement=f(B).nativeElement;_platform=f(re$1);ngAfterViewInit(){let t=this._slider._getInput(this.thumbPosition);t&&(this._ripple.radius=24,this._sliderInput=t,this._sliderInputEl=this._sliderInput._hostElement,this._ngZone.runOutsideAngular(()=>{let e=this._sliderInputEl,i=this._renderer;this._listenerCleanups=[i.listen(e,`pointermove`,this._onPointerMove),i.listen(e,`pointerdown`,this._onDragStart),i.listen(e,`pointerup`,this._onDragEnd),i.listen(e,`pointerleave`,this._onMouseLeave),i.listen(e,`focus`,this._onFocus),i.listen(e,`blur`,this._onBlur)]}))}ngOnDestroy(){this._listenerCleanups?.forEach(t=>t())}_onPointerMove=t=>{if(this._sliderInput._isFocused)return;let e=this._hostElement.getBoundingClientRect(),i=this._slider._isCursorOnSliderThumb(t,e);this._isHovered=i,i?this._showHoverRipple():this._hideRipple(this._hoverRippleRef)};_onMouseLeave=()=>{this._isHovered=!1,this._hideRipple(this._hoverRippleRef)};_onFocus=()=>{this._hideRipple(this._hoverRippleRef),this._showFocusRipple(),this._hostElement.classList.add(`mdc-slider__thumb--focused`)};_onBlur=()=>{this._isActive||this._hideRipple(this._focusRippleRef),this._isHovered&&this._showHoverRipple(),this._hostElement.classList.remove(`mdc-slider__thumb--focused`)};_onDragStart=t=>{t.button===0&&(this._isActive=!0,this._showActiveRipple())};_onDragEnd=()=>{this._isActive=!1,this._hideRipple(this._activeRippleRef),this._sliderInput._isFocused||this._hideRipple(this._focusRippleRef),this._platform.SAFARI&&this._showHoverRipple()};_showHoverRipple(){this._isShowingRipple(this._hoverRippleRef)||(this._hoverRippleRef=this._showRipple({enterDuration:0,exitDuration:0}),this._hoverRippleRef?.element.classList.add(`mat-mdc-slider-hover-ripple`))}_showFocusRipple(){this._isShowingRipple(this._focusRippleRef)||(this._focusRippleRef=this._showRipple({enterDuration:0,exitDuration:0},!0),this._focusRippleRef?.element.classList.add(`mat-mdc-slider-focus-ripple`))}_showActiveRipple(){this._isShowingRipple(this._activeRippleRef)||(this._activeRippleRef=this._showRipple({enterDuration:225,exitDuration:400}),this._activeRippleRef?.element.classList.add(`mat-mdc-slider-active-ripple`))}_isShowingRipple(t){return t?.state===st$1.FADING_IN||t?.state===st$1.VISIBLE}_showRipple(t,e){if(!this._slider.disabled&&(this._showValueIndicator(),this._slider._isRange&&this._slider._getThumb(this.thumbPosition===d.START?d.END:d.START)._showValueIndicator(),!(this._slider._globalRippleOptions?.disabled&&!e)))return this._ripple.launch({animation:this._slider._noopAnimations?{enterDuration:0,exitDuration:0}:t,centered:!0,persistent:!0})}_hideRipple(t){if(t?.fadeOut(),this._isShowingAnyRipple())return;this._slider._isRange||this._hideValueIndicator();let e=this._getSibling();e._isShowingAnyRipple()||(this._hideValueIndicator(),e._hideValueIndicator())}_showValueIndicator(){this._hostElement.classList.add(`mdc-slider__thumb--with-indicator`)}_hideValueIndicator(){this._hostElement.classList.remove(`mdc-slider__thumb--with-indicator`)}_getSibling(){return this._slider._getThumb(this.thumbPosition===d.START?d.END:d.START)}_getValueIndicatorContainer(){return this._valueIndicatorContainer?.nativeElement}_getKnob(){return this._knob.nativeElement}_isShowingAnyRipple(){return this._isShowingRipple(this._hoverRippleRef)||this._isShowingRipple(this._focusRippleRef)||this._isShowingRipple(this._activeRippleRef)}static ɵfac=function(e){return new(e||a)};static ɵcmp=(function(){let t=[`knob`],e=[`valueIndicatorContainer`];function i(r,u){if(r&1&&(Te$1(0,`div`,2,1)(2,`div`,5)(3,`span`,6),Ft(4),Me()()()),r&2){let v=To();le$1(4),On(v.valueIndicatorText)}}return te$1({type:a,selectors:[[`mat-slider-visual-thumb`]],viewQuery:function(u,v){if(u&1&&Ar(l4,5)(t,5)(e,5),u&2){let h;kr(h=Rr())&&(v._ripple=h.first),kr(h=Rr())&&(v._knob=h.first),kr(h=Rr())&&(v._valueIndicatorContainer=h.first)}},hostAttrs:[1,`mdc-slider__thumb`,`mat-mdc-slider-visual-thumb`],inputs:{discrete:`discrete`,thumbPosition:`thumbPosition`,valueIndicatorText:`valueIndicatorText`},features:[Mf([{provide:ee,useExisting:a}])],decls:4,vars:2,consts:[[`knob`,``],[`valueIndicatorContainer`,``],[1,`mdc-slider__value-indicator-container`],[1,`mdc-slider__thumb-knob`],[`matRipple`,``,1,`mat-focus-indicator`,3,`matRippleDisabled`],[1,`mdc-slider__value-indicator`],[1,`mdc-slider__value-indicator-text`]],template:function(u,v){u&1&&(yt(0,i,5,1,`div`,2),hc(1,`div`,3,0)(3,`div`,4)),u&2&&(vt(v.discrete?0:-1),le$1(3),Gi(`matRippleDisabled`,!0))},dependencies:[l4],styles:[`.mat-mdc-slider-visual-thumb .mat-ripple {
  height: 100%;
  width: 100%;
}

.mat-mdc-slider .mdc-slider__tick-marks {
  justify-content: start;
}
.mat-mdc-slider .mdc-slider__tick-marks .mdc-slider__tick-mark--active,
.mat-mdc-slider .mdc-slider__tick-marks .mdc-slider__tick-mark--inactive {
  position: absolute;
  left: 2px;
}
`],encapsulation:2})})()}return a})();var ie=(()=>{class a{_ngZone=f(N);_cdr=f(Or);_elementRef=f(B);_dir=f(cn,{optional:!0});_globalRippleOptions=f(vp,{optional:!0});_trackActive;_thumbs;_input;_inputs;get disabled(){return this._disabled}set disabled(t){this._disabled=t;let e=this._getInput(d.END),i=this._getInput(d.START);e&&(e.disabled=this._disabled),i&&(i.disabled=this._disabled)}_disabled=!1;get discrete(){return this._discrete}set discrete(t){this._discrete=t,this._updateValueIndicatorUIs()}_discrete=!1;get showTickMarks(){return this._showTickMarks}set showTickMarks(t){this._showTickMarks=t,this._hasViewInitialized&&(this._updateTickMarkUI(),this._updateTickMarkTrackUI())}_showTickMarks=!1;get min(){return this._min}set min(t){let e=t==null||isNaN(t)?this._min:t;this._min!==e&&this._updateMin(e)}_min=0;color;disableRipple=!1;_updateMin(t){let e=this._min;this._min=t,this._isRange?this._updateMinRange({old:e,new:t}):this._updateMinNonRange(t),this._onMinMaxOrStepChange()}_updateMinRange(t){let e=this._getInput(d.END),i=this._getInput(d.START),r=e.value,u=i.value;i.min=t.new,e.min=Math.max(t.new,i.value),i.max=Math.min(e.max,e.value),i._updateWidthInactive(),e._updateWidthInactive(),t.new<t.old?this._onTranslateXChangeBySideEffect(e,i):this._onTranslateXChangeBySideEffect(i,e),r!==e.value&&this._onValueChange(e),u!==i.value&&this._onValueChange(i)}_updateMinNonRange(t){let e=this._getInput(d.END);if(e){let i=e.value;e.min=t,e._updateThumbUIByValue(),this._updateTrackUI(e),i!==e.value&&this._onValueChange(e)}}get max(){return this._max}set max(t){let e=t==null||isNaN(t)?this._max:t;this._max!==e&&this._updateMax(e)}_max=100;_updateMax(t){let e=this._max;this._max=t,this._isRange?this._updateMaxRange({old:e,new:t}):this._updateMaxNonRange(t),this._onMinMaxOrStepChange()}_updateMaxRange(t){let e=this._getInput(d.END),i=this._getInput(d.START),r=e.value,u=i.value;e.max=t.new,i.max=Math.min(t.new,e.value),e.min=i.value,e._updateWidthInactive(),i._updateWidthInactive(),t.new>t.old?this._onTranslateXChangeBySideEffect(i,e):this._onTranslateXChangeBySideEffect(e,i),r!==e.value&&this._onValueChange(e),u!==i.value&&this._onValueChange(i)}_updateMaxNonRange(t){let e=this._getInput(d.END);if(e){let i=e.value;e.max=t,e._updateThumbUIByValue(),this._updateTrackUI(e),i!==e.value&&this._onValueChange(e)}}get step(){return this._step}set step(t){let e=isNaN(t)?this._step:t;this._step!==e&&this._updateStep(e)}_step=1;_updateStep(t){this._step=t,this._isRange?this._updateStepRange():this._updateStepNonRange(),this._onMinMaxOrStepChange()}_updateStepRange(){let t=this._getInput(d.END),e=this._getInput(d.START),i=t.value,r=e.value,u=e.value;t.min=this._min,e.max=this._max,t.step=this._step,e.step=this._step,this._platform.SAFARI&&(t.value=t.value,e.value=e.value),t.min=Math.max(this._min,e.value),e.max=Math.min(this._max,t.value),e._updateWidthInactive(),t._updateWidthInactive(),t.value<u?this._onTranslateXChangeBySideEffect(e,t):this._onTranslateXChangeBySideEffect(t,e),i!==t.value&&this._onValueChange(t),r!==e.value&&this._onValueChange(e)}_updateStepNonRange(){let t=this._getInput(d.END);if(t){let e=t.value;t.step=this._step,this._platform.SAFARI&&(t.value=t.value),t._updateThumbUIByValue(),e!==t.value&&this._onValueChange(t)}}displayWith=t=>`${t}`;_tickMarks=[];_noopAnimations=it();_resizeObserver=null;_cachedWidth;_cachedLeft;_rippleRadius=24;startValueIndicatorText=``;endValueIndicatorText=``;_endThumbTransform;_startThumbTransform;_isRange=!1;_isRtl=Fx(()=>this._dir?.valueSignal()===`rtl`);_hasViewInitialized=!1;_tickMarkTrackWidth=0;_hasAnimation=!1;_resizeTimer=null;_platform=f(re$1);constructor(){f(nt).load(S_);let t=this._isRtl();WU(()=>{let e=this._isRtl();e!==t&&(t=e,this._isRange?this._onDirChangeRange():this._onDirChangeNonRange(),this._updateTickMarkUI())})}_knobRadius=8;_inputPadding;ngAfterViewInit(){this._platform.isBrowser&&this._updateDimensions();let t=this._getInput(d.END),e=this._getInput(d.START);this._isRange=!!t&&!!e,this._cdr.detectChanges();let i=this._getThumb(d.END);this._rippleRadius=i._ripple.radius,this._inputPadding=this._rippleRadius-this._knobRadius,this._isRange?this._initUIRange(t,e):this._initUINonRange(t),this._updateTrackUI(t),this._updateTickMarkUI(),this._updateTickMarkTrackUI(),this._observeHostResize(),this._cdr.detectChanges()}_initUINonRange(t){t.initProps(),t.initUI(),this._updateValueIndicatorUI(t),this._hasViewInitialized=!0,t._updateThumbUIByValue()}_initUIRange(t,e){t.initProps(),t.initUI(),e.initProps(),e.initUI(),t._updateMinMax(),e._updateMinMax(),t._updateStaticStyles(),e._updateStaticStyles(),this._updateValueIndicatorUIs(),this._hasViewInitialized=!0,t._updateThumbUIByValue(),e._updateThumbUIByValue()}ngOnDestroy(){this._resizeObserver?.disconnect(),this._resizeObserver=null}_onDirChangeRange(){let t=this._getInput(d.END),e=this._getInput(d.START);t._setIsLeftThumb(),e._setIsLeftThumb(),t.translateX=t._calcTranslateXByValue(),e.translateX=e._calcTranslateXByValue(),t._updateStaticStyles(),e._updateStaticStyles(),t._updateWidthInactive(),e._updateWidthInactive(),t._updateThumbUIByValue(),e._updateThumbUIByValue()}_onDirChangeNonRange(){this._getInput(d.END)._updateThumbUIByValue()}_observeHostResize(){typeof ResizeObserver>`u`||!ResizeObserver||this._ngZone.runOutsideAngular(()=>{this._resizeObserver=new ResizeObserver(()=>{this._isActive()||(this._resizeTimer&&clearTimeout(this._resizeTimer),this._onResize())}),this._resizeObserver.observe(this._elementRef.nativeElement)})}_isActive(){return this._getThumb(d.START)._isActive||this._getThumb(d.END)._isActive}_getValue(t=d.END){let e=this._getInput(t);return e?e.value:this.min}_skipUpdate(){return!!(this._getInput(d.START)?._skipUIUpdate||this._getInput(d.END)?._skipUIUpdate)}_updateDimensions(){this._cachedWidth=this._elementRef.nativeElement.offsetWidth,this._cachedLeft=this._elementRef.nativeElement.getBoundingClientRect().left}_setTrackActiveStyles(t){let e=this._trackActive.nativeElement.style;e.left=t.left,e.right=t.right,e.transformOrigin=t.transformOrigin,e.transform=t.transform}_calcTickMarkTransform(t){let e=t*(this._tickMarkTrackWidth/(this._tickMarks.length-1));return`translateX(${this._isRtl()?this._cachedWidth-6-e:e}px)`}_onTranslateXChange(t){this._hasViewInitialized&&(this._updateThumbUI(t),this._updateTrackUI(t),this._updateOverlappingThumbUI(t))}_onTranslateXChangeBySideEffect(t,e){this._hasViewInitialized&&(t._updateThumbUIByValue(),e._updateThumbUIByValue())}_onValueChange(t){this._hasViewInitialized&&(this._updateValueIndicatorUI(t),this._updateTickMarkUI(),this._cdr.detectChanges())}_onMinMaxOrStepChange(){this._hasViewInitialized&&(this._updateTickMarkUI(),this._updateTickMarkTrackUI(),this._cdr.markForCheck())}_onResize(){if(this._hasViewInitialized){if(this._updateDimensions(),this._isRange){let t=this._getInput(d.END),e=this._getInput(d.START);t._updateThumbUIByValue(),e._updateThumbUIByValue(),t._updateStaticStyles(),e._updateStaticStyles(),t._updateMinMax(),e._updateMinMax(),t._updateWidthInactive(),e._updateWidthInactive()}else{let t=this._getInput(d.END);t&&t._updateThumbUIByValue()}this._updateTickMarkUI(),this._updateTickMarkTrackUI(),this._cdr.detectChanges()}}_thumbsOverlap=!1;_areThumbsOverlapping(){let t=this._getInput(d.START),e=this._getInput(d.END);return!t||!e?!1:e.translateX-t.translateX<20}_updateOverlappingThumbClassNames(t){let e=t.getSibling(),i=this._getThumb(t.thumbPosition);this._getThumb(e.thumbPosition)._hostElement.classList.remove(`mdc-slider__thumb--top`),i._hostElement.classList.toggle(`mdc-slider__thumb--top`,this._thumbsOverlap)}_updateOverlappingThumbUI(t){!this._isRange||this._skipUpdate()||this._thumbsOverlap!==this._areThumbsOverlapping()&&(this._thumbsOverlap=!this._thumbsOverlap,this._updateOverlappingThumbClassNames(t))}_updateThumbUI(t){if(this._skipUpdate())return;let e=this._getThumb(t.thumbPosition===d.END?d.END:d.START);e._hostElement.style.transform=`translateX(${t.translateX}px)`}_updateValueIndicatorUI(t){if(this._skipUpdate())return;let e=this.displayWith(t.value);if(this._hasViewInitialized?t._valuetext.set(e):t._hostElement.setAttribute(`aria-valuetext`,e),this.discrete){t.thumbPosition===d.START?this.startValueIndicatorText=e:this.endValueIndicatorText=e;let i=this._getThumb(t.thumbPosition);e.length<3?i._hostElement.classList.add(`mdc-slider__thumb--short-value`):i._hostElement.classList.remove(`mdc-slider__thumb--short-value`)}}_updateValueIndicatorUIs(){let t=this._getInput(d.END),e=this._getInput(d.START);t&&this._updateValueIndicatorUI(t),e&&this._updateValueIndicatorUI(e)}_updateTickMarkTrackUI(){if(!this.showTickMarks||this._skipUpdate())return;let t=this._step&&this._step>0?this._step:1,i=(Math.floor(this.max/t)*t-this.min)/(this.max-this.min);this._tickMarkTrackWidth=(this._cachedWidth-6)*i}_updateTrackUI(t){this._skipUpdate()||(this._isRange?this._updateTrackUIRange(t):this._updateTrackUINonRange(t))}_updateTrackUIRange(t){let e=t.getSibling();if(!e||!this._cachedWidth)return;let i=Math.abs(e.translateX-t.translateX)/this._cachedWidth;t._isLeftThumb&&this._cachedWidth?this._setTrackActiveStyles({left:`auto`,right:`${this._cachedWidth-e.translateX}px`,transformOrigin:`right`,transform:`scaleX(${i})`}):this._setTrackActiveStyles({left:`${e.translateX}px`,right:`auto`,transformOrigin:`left`,transform:`scaleX(${i})`})}_updateTrackUINonRange(t){this._isRtl()?this._setTrackActiveStyles({left:`auto`,right:`0px`,transformOrigin:`right`,transform:`scaleX(${1-t.fillPercentage})`}):this._setTrackActiveStyles({left:`0px`,right:`auto`,transformOrigin:`left`,transform:`scaleX(${t.fillPercentage})`})}_updateTickMarkUI(){if(!this.showTickMarks||!this._cachedWidth||this.step===void 0||this.min===void 0||this.max===void 0)return;let t=this.step>0?this.step:1;this._isRange?this._updateTickMarkUIRange(t):this._updateTickMarkUINonRange(t)}_updateTickMarkUINonRange(t){let e=this._getValue(),i=Math.max(Math.round((e-this.min)/t),0)+1,r=Math.max(Math.round((this.max-e)/t),0)-1;this._isRtl()?i++:r++,this._tickMarks=Array(i).fill(L.ACTIVE).concat(Array(r).fill(L.INACTIVE))}_updateTickMarkUIRange(t){let e=this._getValue(),i=this._getValue(d.START),r=Math.max(Math.round((i-this.min)/t),0),u=Math.max(Math.round((e-i)/t)+1,0),v=Math.max(Math.round((this.max-e)/t),0);this._tickMarks=Array(r).fill(L.INACTIVE).concat(Array(u).fill(L.ACTIVE),Array(v).fill(L.INACTIVE))}_getInput(t){if(t===d.END&&this._input)return this._input;if(this._inputs?.length)return t===d.START?this._inputs.first:this._inputs.last}_getThumb(t){return t===d.END?this._thumbs?.last:this._thumbs?.first}_setTransition(t){this._hasAnimation=!this._platform.IOS&&t&&!this._noopAnimations,this._elementRef.nativeElement.classList.toggle(`mat-mdc-slider-with-animation`,this._hasAnimation)}_isCursorOnSliderThumb(t,e){let i=e.width/2,r=e.x+i,u=e.y+i,v=t.clientX-r,h=t.clientY-u;return Math.pow(v,2)+Math.pow(h,2)<Math.pow(i,2)}static ɵfac=function(e){return new(e||a)};static ɵcmp=(function(){let t=[`trackActive`],e=[`*`];function i(h,g){if(h&1&&hc(0,`div`),h&2){let m=g.$implicit,k=g.$index,O=To(3);Zi(m===0?`mdc-slider__tick-mark--active`:`mdc-slider__tick-mark--inactive`),Tf(`transform`,O._calcTickMarkTransform(k))}}function r(h,g){if(h&1&&PI(0,i,1,4,`div`,8,RI),h&2){let m=To(2);FI(m._tickMarks)}}function u(h,g){if(h&1&&(Te$1(0,`div`,6,1),yt(2,r,2,0),Me()),h&2){let m=To();le$1(2),vt(m._cachedWidth?2:-1)}}function v(h,g){if(h&1&&hc(0,`mat-slider-visual-thumb`,7),h&2){let m=To();Gi(`discrete`,m.discrete)(`thumbPosition`,1)(`valueIndicatorText`,m.startValueIndicatorText)}}return te$1({type:a,selectors:[[`mat-slider`]],contentQueries:function(g,m,k){if(g&1&&My(k,te,5)(k,re,4),g&2){let O;kr(O=Rr())&&(m._input=O.first),kr(O=Rr())&&(m._inputs=O)}},viewQuery:function(g,m){if(g&1&&Ar(t,5)(ee,5),g&2){let k;kr(k=Rr())&&(m._trackActive=k.first),kr(k=Rr())&&(m._thumbs=k)}},hostAttrs:[1,`mat-mdc-slider`,`mdc-slider`],hostVars:12,hostBindings:function(g,m){g&2&&(Zi(`mat-`+(m.color||`primary`)),ve$1(`mdc-slider--range`,m._isRange)(`mdc-slider--disabled`,m.disabled)(`mdc-slider--discrete`,m.discrete)(`mdc-slider--tick-marks`,m.showTickMarks)(`_mat-animation-noopable`,m._noopAnimations))},inputs:{disabled:[2,`disabled`,`disabled`,ie$3],discrete:[2,`discrete`,`discrete`,ie$3],showTickMarks:[2,`showTickMarks`,`showTickMarks`,ie$3],min:[2,`min`,`min`,Bf],color:`color`,disableRipple:[2,`disableRipple`,`disableRipple`,ie$3],max:[2,`max`,`max`,Bf],step:[2,`step`,`step`,Bf],displayWith:`displayWith`},exportAs:[`matSlider`],features:[Mf([{provide:at,useExisting:a}])],ngContentSelectors:e,decls:9,vars:5,consts:[[`trackActive`,``],[`tickMarkContainer`,``],[1,`mdc-slider__track`],[1,`mdc-slider__track--inactive`],[1,`mdc-slider__track--active`],[1,`mdc-slider__track--active_fill`],[1,`mdc-slider__tick-marks`],[3,`discrete`,`thumbPosition`,`valueIndicatorText`],[3,`class`,`transform`]],template:function(g,m){g&1&&(Pt(),be$1(0),Te$1(1,`div`,2),hc(2,`div`,3),Te$1(3,`div`,4),hc(4,`div`,5,0),Me(),yt(6,u,3,1,`div`,6),Me(),yt(7,v,1,3,`mat-slider-visual-thumb`,7),hc(8,`mat-slider-visual-thumb`,7)),g&2&&(le$1(6),vt(m.showTickMarks?6:-1),le$1(),vt(m._isRange?7:-1),le$1(),Gi(`discrete`,m.discrete)(`thumbPosition`,2)(`valueIndicatorText`,m.endValueIndicatorText))},dependencies:[le],styles:[`.mdc-slider__track {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  pointer-events: none;
  height: var(--%NS%mat-slider-inactive-track-height, 4px);
}

.mdc-slider__track--active,
.mdc-slider__track--inactive {
  display: flex;
  height: 100%;
  position: absolute;
  width: 100%;
}

.mdc-slider__track--active {
  overflow: hidden;
  border-radius: var(--%NS%mat-slider-active-track-shape, var(--%NS%mat-sys-corner-full));
  height: var(--%NS%mat-slider-active-track-height, 4px);
  top: calc((var(--%NS%mat-slider-inactive-track-height, 4px) - var(--%NS%mat-slider-active-track-height, 4px)) / 2);
}

.mdc-slider__track--active_fill {
  border-top-style: solid;
  box-sizing: border-box;
  height: 100%;
  width: 100%;
  position: relative;
  transform-origin: left;
  transition: transform 80ms ease;
  border-color: var(--%NS%mat-slider-active-track-color, var(--%NS%mat-sys-primary));
  border-top-width: var(--%NS%mat-slider-active-track-height, 4px);
}
.mdc-slider--disabled .mdc-slider__track--active_fill {
  border-color: var(--%NS%mat-slider-disabled-active-track-color, var(--%NS%mat-sys-on-surface));
}
[dir=rtl] .mdc-slider__track--active_fill {
  -webkit-transform-origin: right;
  transform-origin: right;
}

.mdc-slider__track--inactive {
  left: 0;
  top: 0;
  opacity: 0.24;
  background-color: var(--%NS%mat-slider-inactive-track-color, var(--%NS%mat-sys-surface-variant));
  height: var(--%NS%mat-slider-inactive-track-height, 4px);
  border-radius: var(--%NS%mat-slider-inactive-track-shape, var(--%NS%mat-sys-corner-full));
}
.mdc-slider--disabled .mdc-slider__track--inactive {
  background-color: var(--%NS%mat-slider-disabled-inactive-track-color, var(--%NS%mat-sys-on-surface));
  opacity: 0.24;
}
.mdc-slider__track--%NS%inactive::before {
  position: absolute;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  border: 1px solid transparent;
  border-radius: inherit;
  content: "";
  pointer-events: none;
}
@media (forced-colors: active) {
  .mdc-slider__track--%NS%inactive::before {
    border-color: CanvasText;
  }
}

.mdc-slider__value-indicator-container {
  bottom: 44px;
  left: 50%;
  pointer-events: none;
  position: absolute;
  transform: var(--%NS%mat-slider-value-indicator-container-transform, translateX(-50%) rotate(-45deg));
}
.mdc-slider__thumb--with-indicator .mdc-slider__value-indicator-container {
  pointer-events: auto;
}

.mdc-slider__value-indicator {
  display: flex;
  align-items: center;
  transform: scale(0);
  transform-origin: var(--%NS%mat-slider-value-indicator-transform-origin, 0 28px);
  transition: transform 100ms cubic-bezier(0.4, 0, 1, 1);
  word-break: normal;
  background-color: var(--%NS%mat-slider-label-container-color, var(--%NS%mat-sys-primary));
  color: var(--%NS%mat-slider-label-label-text-color, var(--%NS%mat-sys-on-primary));
  width: var(--%NS%mat-slider-value-indicator-width, 28px);
  height: var(--%NS%mat-slider-value-indicator-height, 28px);
  padding: var(--%NS%mat-slider-value-indicator-padding, 0);
  opacity: var(--%NS%mat-slider-value-indicator-opacity, 1);
  border-radius: var(--%NS%mat-slider-value-indicator-border-radius, 50% 50% 50% 0);
}
.mdc-slider__thumb--with-indicator .mdc-slider__value-indicator {
  transition: transform 100ms cubic-bezier(0, 0, 0.2, 1);
  transform: scale(1);
}
.mdc-slider__value-indicator::before {
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid;
  bottom: -5px;
  content: "";
  height: 0;
  left: 50%;
  position: absolute;
  transform: translateX(-50%);
  width: 0;
  display: var(--%NS%mat-slider-value-indicator-caret-display, none);
  border-top-color: var(--%NS%mat-slider-label-container-color, var(--%NS%mat-sys-primary));
}
.mdc-slider__value-indicator::after {
  position: absolute;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  border: 1px solid transparent;
  border-radius: inherit;
  content: "";
  pointer-events: none;
}
@media (forced-colors: active) {
  .mdc-slider__value-indicator::after {
    border-color: CanvasText;
  }
}

.mdc-slider__value-indicator-text {
  text-align: center;
  width: var(--%NS%mat-slider-value-indicator-width, 28px);
  transform: var(--%NS%mat-slider-value-indicator-text-transform, rotate(45deg));
  font-family: var(--%NS%mat-slider-label-label-text-font, var(--%NS%mat-sys-label-medium-font));
  font-size: var(--%NS%mat-slider-label-label-text-size, var(--%NS%mat-sys-label-medium-size));
  font-weight: var(--%NS%mat-slider-label-label-text-weight, var(--%NS%mat-sys-label-medium-weight));
  line-height: var(--%NS%mat-slider-label-label-text-line-height, var(--%NS%mat-sys-label-medium-line-height));
  letter-spacing: var(--%NS%mat-slider-label-label-text-tracking, var(--%NS%mat-sys-label-medium-tracking));
}

.mdc-slider__thumb {
  -webkit-user-select: none;
  user-select: none;
  display: flex;
  left: -24px;
  outline: none;
  position: absolute;
  height: 48px;
  width: 48px;
  pointer-events: none;
}
.mdc-slider--discrete .mdc-slider__thumb {
  transition: transform 80ms ease;
}
.mdc-slider--disabled .mdc-slider__thumb {
  pointer-events: none;
}

.mdc-slider__thumb--top {
  z-index: 1;
}

.mdc-slider__thumb-knob {
  position: absolute;
  box-sizing: border-box;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-style: solid;
  width: var(--%NS%mat-slider-handle-width, 20px);
  height: var(--%NS%mat-slider-handle-height, 20px);
  border-width: calc(var(--%NS%mat-slider-handle-height, 20px) / 2) calc(var(--%NS%mat-slider-handle-width, 20px) / 2);
  box-shadow: var(--%NS%mat-slider-handle-elevation, var(--%NS%mat-sys-level1));
  background-color: var(--%NS%mat-slider-handle-color, var(--%NS%mat-sys-primary));
  border-color: var(--%NS%mat-slider-handle-color, var(--%NS%mat-sys-primary));
  border-radius: var(--%NS%mat-slider-handle-shape, var(--%NS%mat-sys-corner-full));
}
.mdc-slider__thumb:hover .mdc-slider__thumb-knob {
  background-color: var(--%NS%mat-slider-hover-handle-color, var(--%NS%mat-sys-primary));
  border-color: var(--%NS%mat-slider-hover-handle-color, var(--%NS%mat-sys-primary));
}
.mdc-slider__thumb--focused .mdc-slider__thumb-knob {
  background-color: var(--%NS%mat-slider-focus-handle-color, var(--%NS%mat-sys-primary));
  border-color: var(--%NS%mat-slider-focus-handle-color, var(--%NS%mat-sys-primary));
}
.mdc-slider--disabled .mdc-slider__thumb-knob {
  background-color: var(--%NS%mat-slider-disabled-handle-color, var(--%NS%mat-sys-on-surface));
  border-color: var(--%NS%mat-slider-disabled-handle-color, var(--%NS%mat-sys-on-surface));
}
.mdc-slider__thumb--top .mdc-slider__thumb-knob, .mdc-slider__thumb--top.mdc-slider__thumb:hover .mdc-slider__thumb-knob, .mdc-slider__thumb--top.mdc-slider__thumb--focused .mdc-slider__thumb-knob {
  border: solid 1px #fff;
  box-sizing: content-box;
  border-color: var(--%NS%mat-slider-with-overlap-handle-outline-color, var(--%NS%mat-sys-on-primary));
  border-width: var(--%NS%mat-slider-with-overlap-handle-outline-width, 1px);
}

.mdc-slider__tick-marks {
  align-items: center;
  box-sizing: border-box;
  display: flex;
  height: 100%;
  justify-content: space-between;
  padding: 0 1px;
  position: absolute;
  width: 100%;
}

.mdc-slider__tick-mark--active,
.mdc-slider__tick-mark--inactive {
  width: var(--%NS%mat-slider-with-tick-marks-container-size, 2px);
  height: var(--%NS%mat-slider-with-tick-marks-container-size, 2px);
  border-radius: var(--%NS%mat-slider-with-tick-marks-container-shape, var(--%NS%mat-sys-corner-full));
}

.mdc-slider__tick-mark--inactive {
  opacity: var(--%NS%mat-slider-with-tick-marks-inactive-container-opacity, 0.38);
  background-color: var(--%NS%mat-slider-with-tick-marks-inactive-container-color, var(--%NS%mat-sys-on-surface-variant));
}
.mdc-slider--disabled .mdc-slider__tick-mark--inactive {
  opacity: var(--%NS%mat-slider-with-tick-marks-inactive-container-opacity, 0.38);
  background-color: var(--%NS%mat-slider-with-tick-marks-disabled-container-color, var(--%NS%mat-sys-on-surface));
}

.mdc-slider__tick-mark--active {
  opacity: var(--%NS%mat-slider-with-tick-marks-active-container-opacity, 0.38);
  background-color: var(--%NS%mat-slider-with-tick-marks-active-container-color, var(--%NS%mat-sys-on-primary));
}

.mdc-slider__input {
  cursor: pointer;
  left: 2px;
  margin: 0;
  height: 44px;
  opacity: 0;
  position: absolute;
  top: 2px;
  width: 44px;
  box-sizing: content-box;
}
.mdc-slider__input.mat-mdc-slider-input-no-pointer-events {
  pointer-events: none;
}
.mdc-slider__input.mat-slider__right-input {
  left: auto;
  right: 0;
}

.mat-mdc-slider {
  display: inline-block;
  box-sizing: border-box;
  outline: none;
  vertical-align: middle;
  cursor: pointer;
  height: 48px;
  margin: 0 8px;
  position: relative;
  touch-action: pan-y;
  width: auto;
  min-width: 112px;
  -webkit-tap-highlight-color: transparent;
}
.mat-mdc-slider.mdc-slider--disabled {
  cursor: auto;
  opacity: 0.38;
}
.mat-mdc-slider.mdc-slider--disabled .mdc-slider__input {
  cursor: auto;
}
.mat-mdc-slider .mdc-slider__thumb,
.mat-mdc-slider .mdc-slider__track--active_fill {
  transition-duration: 0ms;
}
.mat-mdc-slider.mat-mdc-slider-with-animation .mdc-slider__thumb,
.mat-mdc-slider.mat-mdc-slider-with-animation .mdc-slider__track--active_fill {
  transition-duration: 80ms;
}
.mat-mdc-slider.mdc-slider--discrete .mdc-slider__thumb,
.mat-mdc-slider.mdc-slider--discrete .mdc-slider__track--active_fill {
  transition-duration: 0ms;
}
.mat-mdc-slider.mat-mdc-slider-with-animation .mdc-slider__thumb,
.mat-mdc-slider.mat-mdc-slider-with-animation .mdc-slider__track--active_fill {
  transition-duration: 80ms;
}
.mat-mdc-slider .mat-ripple .mat-ripple-element {
  background-color: var(--%NS%mat-slider-ripple-color, var(--%NS%mat-sys-primary));
}
.mat-mdc-slider .mat-ripple .mat-mdc-slider-hover-ripple {
  background-color: var(--%NS%mat-slider-hover-state-layer-color, color-mix(in srgb, var(--%NS%mat-sys-primary) 5%, transparent));
}
.mat-mdc-slider .mat-ripple .mat-mdc-slider-focus-ripple,
.mat-mdc-slider .mat-ripple .mat-mdc-slider-active-ripple {
  background-color: var(--%NS%mat-slider-focus-state-layer-color, color-mix(in srgb, var(--%NS%mat-sys-primary) 20%, transparent));
}
.mat-mdc-slider._mat-animation-noopable.mdc-slider--discrete .mdc-slider__thumb, .mat-mdc-slider._mat-animation-noopable.mdc-slider--discrete .mdc-slider__track--active_fill,
.mat-mdc-slider._mat-animation-noopable .mdc-slider__value-indicator {
  transition: none;
}
.mat-mdc-slider .mat-focus-indicator::before {
  border-radius: 50%;
}

.mdc-slider__thumb--focused .mat-focus-indicator::before {
  content: "";
}
`],encapsulation:2})})()}return a})();var de={provide:se,useExisting:pi(()=>st),multi:!0};var st=(()=>{class a{_ngZone=f(N);_elementRef=f(B);_cdr=f(Or);_slider=f(at);_platform=f(re$1);_listenerCleanups;get value(){return Bf(this._hostElement.value,0)}set value(t){t===null&&(t=this._getDefaultValue()),t=isNaN(t)?0:t;let e=t+``;if(!this._hasSetInitialValue){this._initialValue=e;return}this._isActive||this._setValue(e)}_setValue(t){this._hostElement.value=t,this._updateThumbUIByValue(),this._slider._onValueChange(this),this._cdr.detectChanges(),this._slider._cdr.markForCheck()}valueChange=new J;dragStart=new J;dragEnd=new J;get translateX(){return this._slider.min>=this._slider.max?(this._translateX=this._tickMarkOffset,this._translateX):(this._translateX===void 0&&(this._translateX=this._calcTranslateXByValue()),this._translateX)}set translateX(t){this._translateX=t}_translateX;thumbPosition=d.END;get min(){return Bf(this._hostElement.min,0)}set min(t){this._hostElement.min=t+``,this._cdr.detectChanges()}get max(){return Bf(this._hostElement.max,0)}set max(t){this._hostElement.max=t+``,this._cdr.detectChanges()}get step(){return Bf(this._hostElement.step,0)}set step(t){this._hostElement.step=t+``,this._cdr.detectChanges()}get disabled(){return ie$3(this._hostElement.disabled)}set disabled(t){this._hostElement.disabled=t,this._cdr.detectChanges(),this._slider.disabled!==this.disabled&&(this._slider.disabled=this.disabled)}get percentage(){return this._slider.min>=this._slider.max?this._slider._isRtl()?1:0:(this.value-this._slider.min)/(this._slider.max-this._slider.min)}get fillPercentage(){return this._slider._cachedWidth?this._translateX===0?0:this.translateX/this._slider._cachedWidth:this._slider._isRtl()?1:0}_hostElement=this._elementRef.nativeElement;_valuetext=Le(``);_knobRadius=8;_tickMarkOffset=3;_isActive=!1;_isFocused=!1;_setIsFocused(t){this._isFocused=t}_hasSetInitialValue=!1;_initialValue;_formControl;_destroyed=new w;_skipUIUpdate=!1;_onChangeFn;_onTouchedFn=()=>{};_isControlInitialized=!1;constructor(){let t=f(We);this._ngZone.runOutsideAngular(()=>{this._listenerCleanups=[t.listen(this._hostElement,`pointerdown`,this._onPointerDown.bind(this)),t.listen(this._hostElement,`pointermove`,this._onPointerMove.bind(this)),t.listen(this._hostElement,`pointerup`,this._onPointerUp.bind(this))]})}ngOnDestroy(){this._listenerCleanups.forEach(t=>t()),this._destroyed.next(),this._destroyed.complete(),this.dragStart.complete(),this.dragEnd.complete()}initProps(){this._updateWidthInactive(),this.disabled!==this._slider.disabled&&(this._slider.disabled=!0),this.step=this._slider.step,this.min=this._slider.min,this.max=this._slider.max,this._initValue()}initUI(){this._updateThumbUIByValue()}_initValue(){this._hasSetInitialValue=!0,this._initialValue===void 0?this.value=this._getDefaultValue():(this._hostElement.value=this._initialValue,this._updateThumbUIByValue(),this._slider._onValueChange(this),this._cdr.detectChanges())}_getDefaultValue(){return this.min}_onBlur(){this._setIsFocused(!1),this._onTouchedFn()}_onFocus(){this._slider._setTransition(!1),this._slider._updateTrackUI(this),this._setIsFocused(!0)}_onChange(){this.valueChange.emit(this.value),this._isActive&&this._updateThumbUIByValue({withAnimation:!0})}_onInput(){this._onChangeFn?.(this.value),(this._slider.step||!this._isActive)&&this._updateThumbUIByValue({withAnimation:!this._isActive}),this._slider._onValueChange(this)}_onNgControlValueChange(){(!this._isActive||!this._isFocused)&&(this._slider._onValueChange(this),this._updateThumbUIByValue()),this._slider.disabled=this._formControl.disabled}_onPointerDown(t){if(!(this.disabled||t.button!==0)){if(this._platform.IOS){let e=this._slider._isCursorOnSliderThumb(t,this._slider._getThumb(this.thumbPosition)._hostElement.getBoundingClientRect());this._isActive=e,this._updateWidthActive(),this._slider._updateDimensions();return}this._isActive=!0,this._setIsFocused(!0),this._updateWidthActive(),this._slider._updateDimensions(),this._slider.step||this._updateThumbUIByPointerEvent(t,{withAnimation:!0}),this.disabled||(this._handleValueCorrection(t),this.dragStart.emit({source:this,parent:this._slider,value:this.value}))}}_handleValueCorrection(t){this._skipUIUpdate=!0,setTimeout(()=>{this._skipUIUpdate=!1,this._fixValue(t)},0)}_fixValue(t){let e=t.clientX-this._slider._cachedLeft,i=this._slider._cachedWidth,r=this._slider.step===0?1:this._slider.step,u=Math.floor((this._slider.max-this._slider.min)/r),v=this._slider._isRtl()?1-e/i:e/i,g=Math.round(v*u)/u*(this._slider.max-this._slider.min)+this._slider.min,m=Math.round(g/r)*r;if(m===this.value){this._slider._onValueChange(this),this._slider.step>0?this._updateThumbUIByValue():this._updateThumbUIByPointerEvent(t,{withAnimation:this._slider._hasAnimation});return}this.value=m,this.valueChange.emit(this.value),this._onChangeFn?.(this.value),this._slider._onValueChange(this),this._slider.step>0?this._updateThumbUIByValue():this._updateThumbUIByPointerEvent(t,{withAnimation:this._slider._hasAnimation})}_onPointerMove(t){!this._slider.step&&this._isActive&&this._updateThumbUIByPointerEvent(t)}_onPointerUp(){this._isActive&&(this._isActive=!1,this._platform.SAFARI&&this._setIsFocused(!1),this.dragEnd.emit({source:this,parent:this._slider,value:this.value}),setTimeout(()=>this._updateWidthInactive(),this._platform.IOS?10:0))}_clamp(t){let e=this._tickMarkOffset,i=this._slider._cachedWidth-this._tickMarkOffset;return Math.max(Math.min(t,i),e)}_calcTranslateXByValue(){return this._slider._isRtl()?(1-this.percentage)*(this._slider._cachedWidth-this._tickMarkOffset*2)+this._tickMarkOffset:this.percentage*(this._slider._cachedWidth-this._tickMarkOffset*2)+this._tickMarkOffset}_calcTranslateXByPointerEvent(t){return t.clientX-this._slider._cachedLeft}_updateWidthActive(){}_updateWidthInactive(){this._hostElement.style.padding=`0 ${this._slider._inputPadding}px`,this._hostElement.style.width=`calc(100% + ${this._slider._inputPadding-this._tickMarkOffset*2}px)`,this._hostElement.style.left=`-${this._slider._rippleRadius-this._tickMarkOffset}px`}_updateThumbUIByValue(t){this.translateX=this._clamp(this._calcTranslateXByValue()),this._updateThumbUI(t)}_updateThumbUIByPointerEvent(t,e){this.translateX=this._clamp(this._calcTranslateXByPointerEvent(t)),this._updateThumbUI(e)}_updateThumbUI(t){this._slider._setTransition(!!t?.withAnimation),this._slider._onTranslateXChange(this)}writeValue(t){(this._isControlInitialized||t!==null)&&(this.value=t)}registerOnChange(t){this._onChangeFn=t,this._isControlInitialized=!0}registerOnTouched(t){this._onTouchedFn=t}setDisabledState(t){this.disabled=t}focus(){this._hostElement.focus()}blur(){this._hostElement.blur()}static ɵfac=function(e){return new(e||a)};static ɵdir=W({type:a,selectors:[[`input`,`matSliderThumb`,``]],hostAttrs:[`type`,`range`,1,`mdc-slider__input`],hostVars:1,hostBindings:function(e,i){e&1&&Nr(`change`,function(){return i._onChange()})(`input`,function(){return i._onInput()})(`blur`,function(){return i._onBlur()})(`focus`,function(){return i._onFocus()}),e&2&&Be(`aria-valuetext`,i._valuetext())},inputs:{value:[2,`value`,`value`,Bf]},outputs:{valueChange:`valueChange`,dragStart:`dragStart`,dragEnd:`dragEnd`},exportAs:[`matSliderThumb`],features:[Mf([de,{provide:te,useExisting:a}])]})}return a})();var ne=(()=>{class a{static ɵfac=function(e){return new(e||a)};static ɵmod=ee$1({type:a});static ɵinj=K({imports:[x_,Ze]})}return a})();var ce=(a,c)=>c[0];function me(a,c){if(a&1){let t=xf();Te$1(0,`button`,7),Nr(`click`,function(){Ea(t);let i=To();return wa(i.save())}),Te$1(1,`mat-icon`),Ft(2,`auto_awesome`),Me(),Ft(3,`Save & re-qualify all`),Me()}if(a&2){let t=To();Gi(`disabled`,t.busy()||!t.cfg())}}function he(a,c){a&1&&hc(0,`mat-progress-bar`,5)}function ue(a,c){if(a&1){let t=xf();Te$1(0,`div`,12)(1,`div`,32)(2,`div`,22),Ft(3),Te$1(4,`span`,20),Ft(5),Me()(),Te$1(6,`div`,20),Ft(7),Me()(),Te$1(8,`mat-slider`,33)(9,`input`,34),ES(),zy(`ngModelChange`,function(i){let r=Ea(t).$implicit,u=To(2);return bx(u.cfg().weights[r[0]],i)||(u.cfg().weights[r[0]]=i),wa(i)}),Me()(),Te$1(10,`b`,16),Ft(11),Me()()}if(a&2){let t=c.$implicit,e=To(2);le$1(3),Mo(``,t[1],` `),le$1(2),Mo(`· up to `,t[3],` pts`),le$1(2),On(t[2]),le$1(),Gi(`disabled`,!e.admin()),le$1(),$y(`ngModel`,e.cfg().weights[t[0]]),Be(`aria-label`,t[1]),CS(),le$1(2),Mo(``,(+e.cfg().weights[t[0]]).toFixed(1),`×`)}}function _e(a,c){if(a&1){let t=xf();Te$1(0,`mat-chip`,35),Nr(`click`,function(){let i=Ea(t).$implicit,r=To(2);return r.text=i,wa(r.test())}),Ft(1),Me()}if(a&2){let t=c.$implicit;le$1(),On(t)}}function pe(a,c){a&1&&hc(0,`mat-progress-bar`,30)}function ge(a,c){if(a&1&&(Te$1(0,`div`,36)(1,`span`,37),Ft(2,`Intent`),Me(),Te$1(3,`b`),Ft(4),Me(),Te$1(5,`span`,37),Ft(6,`Signal`),Me(),hc(7,`k3-temp`,38),Te$1(8,`span`,37),Ft(9,`Sentiment`),Me(),Te$1(10,`span`),Ft(11),Me(),Te$1(12,`span`,37),Ft(13,`Confidence`),Me(),Te$1(14,`span`,39),Ft(15),Me()(),Te$1(16,`div`,40)(17,`mat-icon`),Ft(18,`reply`),Me(),Te$1(19,`div`)(20,`div`,20),Ft(21,`Suggested WhatsApp reply`),Me(),Ft(22),Me()()),a&2){let t=c,e=To(2);le$1(4),On(t.intent),le$1(3),Gi(`temp`,t.signal),le$1(4),On(t.sentiment),le$1(4),On(e.pct(t.confidence)),le$1(7),On((t.suggestedReply||``).replace(`{{program}}`,`Class 11 – Science`))}}function ve(a,c){a&1&&(Te$1(0,`div`,31)(1,`mat-icon`),Ft(2,`info`),Me(),Te$1(3,`div`),Ft(4,`Scoring is a transparent rules engine — counsellors can always see `),Te$1(5,`i`),Ft(6,`why`),Me(),Ft(7,` a lead is hot. Set `),Te$1(8,`code`),Ft(9,`ANTHROPIC_API_KEY`),Me(),Ft(10,` on the server to add Claude-powered intent detection and reply drafting for free-text messages.`),Me()())}function fe(a,c){if(a&1){let t=xf();Te$1(0,`div`,6)(1,`div`,8)(2,`div`,9)(3,`div`,10)(4,`div`)(5,`h3`),Ft(6,`Scoring weights`),Me(),Te$1(7,`div`,11),Ft(8,`How much each signal counts toward the 0–100 lead score`),Me()()(),PI(9,ue,12,7,`div`,12,ce),Me(),Te$1(11,`div`,9)(12,`div`,10)(13,`div`)(14,`h3`),Ft(15,`Temperature thresholds`),Me(),Te$1(16,`div`,11),Ft(17,`Score cut-offs for each bucket`),Me()()(),Te$1(18,`div`,12),hc(19,`k3-temp`,13),Te$1(20,`mat-slider`,14)(21,`input`,15),ES(),zy(`ngModelChange`,function(i){Ea(t);let r=To();return bx(r.cfg().thresholds.hot,i)||(r.cfg().thresholds.hot=i),wa(i)}),Nr(`ngModelChange`,function(){Ea(t);let i=To();return wa(i.fixTh())}),Me()(),Te$1(22,`b`,16),Ft(23),Me()(),Te$1(24,`div`,12),hc(25,`k3-temp`,17),Te$1(26,`mat-slider`,18)(27,`input`,19),ES(),zy(`ngModelChange`,function(i){Ea(t);let r=To();return bx(r.cfg().thresholds.warm,i)||(r.cfg().thresholds.warm=i),wa(i)}),Nr(`ngModelChange`,function(){Ea(t);let i=To();return wa(i.fixTh())}),Me()(),Te$1(28,`b`,16),Ft(29),Me()(),Te$1(30,`div`,20),Ft(31,`Anything below the warm threshold is `),Te$1(32,`b`),Ft(33,`Cold`),Me(),Ft(34,`.`),Me()(),Te$1(35,`div`,9)(36,`div`,10)(37,`div`)(38,`h3`),Ft(39,`Automation`),Me()()(),Te$1(40,`div`,21)(41,`div`,3)(42,`div`,22),Ft(43,`Re-qualify on every WhatsApp reply`),Me(),Te$1(44,`div`,20),Ft(45,`Parent replies are analysed instantly and the lead moves between sequences`),Me()(),Te$1(46,`mat-slide-toggle`,23),ES(),zy(`ngModelChange`,function(i){Ea(t);let r=To();return bx(r.cfg().autoQualifyOnReply,i)||(r.cfg().autoQualifyOnReply=i),wa(i)}),Me()(),Te$1(47,`div`,21)(48,`div`,3)(49,`div`,22),Ft(50,`Hot lead fast-track`),Me(),Te$1(51,`div`,20),Ft(52,`Alert the counsellor & create a call task within 1 hour`),Me()(),Te$1(53,`mat-slide-toggle`,24),ES(),zy(`ngModelChange`,function(i){Ea(t);let r=To();return bx(r.cfg().autoAssignHot,i)||(r.cfg().autoAssignHot=i),wa(i)}),Me()()()(),Te$1(54,`div`,8)(55,`div`,9)(56,`div`,10)(57,`div`)(58,`h3`),Ft(59,`Current distribution`),Me(),Te$1(60,`div`,11),Ft(61),Me()()(),hc(62,`k3-temp-mix`,25),Me(),Te$1(63,`div`,9)(64,`div`,10)(65,`div`)(66,`h3`),Ft(67,`Test the AI`),Me(),Te$1(68,`div`,11),Ft(69,`Paste a parent’s WhatsApp message`),Me()()(),Te$1(70,`mat-form-field`,26)(71,`mat-label`),Ft(72,`Message`),Me(),Te$1(73,`textarea`,27),ES(),zy(`ngModelChange`,function(i){Ea(t);let r=To();return bx(r.text,i)||(r.text=i),wa(i)}),Me()(),Te$1(74,`mat-chip-set`,28),PI(75,_e,2,1,`mat-chip`,null,OI),Me(),Te$1(77,`button`,29),Nr(`click`,function(){Ea(t);let i=To();return wa(i.test())}),Te$1(78,`mat-icon`),Ft(79,`auto_awesome`),Me(),Ft(80,`Analyse`),Me(),yt(81,pe,1,0,`mat-progress-bar`,30),yt(82,ge,23,5),Me(),yt(83,ve,11,0,`div`,31),Me()()}if(a&2){let t,e=To();le$1(9),FI(e.weights),le$1(11),Gi(`disabled`,!e.admin()),le$1(),$y(`ngModel`,e.cfg().thresholds.hot),CS(),le$1(2),Mo(`≥`,e.cfg().thresholds.hot),le$1(3),Gi(`disabled`,!e.admin()),le$1(),$y(`ngModel`,e.cfg().thresholds.warm),CS(),le$1(2),Mo(`≥`,e.cfg().thresholds.warm),le$1(17),$y(`ngModel`,e.cfg().autoQualifyOnReply),Gi(`disabled`,!e.admin()),CS(),le$1(7),$y(`ngModel`,e.cfg().autoAssignHot),Gi(`disabled`,!e.admin()),CS(),le$1(8),Mo(``,e.total(),` leads`),le$1(),Gi(`mix`,e.mix()),le$1(11),$y(`ngModel`,e.text),CS(),le$1(2),FI(e.examples),le$1(2),Gi(`disabled`,e.testing()),le$1(4),vt(e.testing()?81:-1),le$1(),vt((t=e.out())?82:-1,t),le$1(),vt(e.demo?-1:83)}}var be=[[`intent`,`Intent signals`,`Keywords like fees, visit, seats, documents, apply — minus hesitation words`,25],[`engagement`,`Engagement`,`Number of WhatsApp replies from the parent`,20],[`responsiveness`,`Response speed`,`How fast the parent replies on average`,15],[`source`,`Source quality`,`Walk-ins & referrals rank above paid social`,15],[`stage`,`Stage progress`,`Counselling → visit → application`,15],[`recency`,`Recency`,`Days since last activity`,10]];var ae=class a{s=f(Mi);api=f(Gt);ui=f(cD);demo=fe$1.demo;weights=be;pct=gc;cfg=Le(null);leads=Le([]);busy=Le(!1);testing=Le(!1);out=Le(null);admin=Fx(()=>this.demo||this.s.role()===`admin`);mix=Fx(()=>{let c={hot:0,warm:0,cold:0};return this.leads().forEach(t=>c[t.ai?.temp]=(c[t.ai?.temp]||0)+1),c});total=Fx(()=>this.leads().length);text=`Hi, what is the fee for Class 11 Science? Can we visit the campus this Saturday?`;examples=[`Are seats still available for Nursery?`,`Fees seem too high, maybe next year`,`Do you have a bus from Behala?`];constructor(){Promise.all([this.api.aiConfig(),this.api.leads()]).then(([c,t])=>{this.cfg.set(c),this.leads.set(t)}).catch(c=>this.ui.error(c))}fixTh(){let c=this.cfg().thresholds;c.warm>=c.hot&&(c.warm=c.hot-5)}async test(){this.testing.set(!0),this.out.set(null);try{this.out.set(await this.api.classify(this.text))}catch(c){this.ui.error(c)}this.testing.set(!1)}async save(){this.busy.set(!0);try{await this.api.setAiConfig(this.cfg());let c=await this.api.qualifyAll();this.leads.set(await this.api.leads()),this.ui.toast(`Saved \xB7 ${c.changed} leads changed temperature \u2192 ${c.hot} hot, ${c.warm} warm, ${c.cold} cold`)}catch(c){this.ui.error(c)}this.busy.set(!1)}static ɵfac=function(t){return new(t||a)};static ɵcmp=te$1({type:a,selectors:[[`k3-ai`]],decls:11,vars:2,consts:[[1,`page`],[1,`page-head`],[1,`sub`],[1,`grow`],[`mat-flat-button`,``,3,`disabled`],[`mode`,`indeterminate`],[1,`grid`,`g-21`],[`mat-flat-button`,``,3,`click`,`disabled`],[1,`col`,2,`gap`,`16px`,`min-width`,`0`],[1,`card`],[1,`card-head`],[1,`card-sub`],[1,`wrow`],[`temp`,`hot`],[`min`,`50`,`max`,`95`,`step`,`1`,1,`grow`,3,`disabled`],[`matSliderThumb`,``,`aria-label`,`Hot threshold`,3,`ngModelChange`,`ngModel`],[1,`tnum`,`val`],[`temp`,`warm`],[`min`,`15`,`max`,`65`,`step`,`1`,1,`grow`,3,`disabled`],[`matSliderThumb`,``,`aria-label`,`Warm threshold`,3,`ngModelChange`,`ngModel`],[1,`small`,`muted`],[1,`trow`],[1,`t`],[`aria-label`,`Re-qualify on reply`,3,`ngModelChange`,`ngModel`,`disabled`],[`aria-label`,`Hot lead fast-track`,3,`ngModelChange`,`ngModel`,`disabled`],[3,`mix`],[`subscriptSizing`,`dynamic`,1,`full`],[`matInput`,``,`rows`,`3`,3,`ngModelChange`,`ngModel`],[2,`margin`,`8px 0`],[`mat-stroked-button`,``,3,`click`,`disabled`],[`mode`,`indeterminate`,2,`margin-top`,`12px`],[1,`banner`,`info`,`small`],[1,`grow`,2,`min-width`,`0`],[`min`,`0`,`max`,`2`,`step`,`0.1`,3,`disabled`],[`matSliderThumb`,``,3,`ngModelChange`,`ngModel`],[3,`click`],[1,`kv`,2,`grid-template-columns`,`110px 1fr`,`margin-top`,`14px`],[1,`k`],[3,`temp`],[1,`tnum`],[1,`banner`,`info`,2,`margin-top`,`12px`]],template:function(t,e){t&1&&(Te$1(0,`div`,0)(1,`div`,1)(2,`div`)(3,`h1`),Ft(4,`AI Qualifier`),Me(),Te$1(5,`div`,2),Ft(6,`Automatically classifies every enquiry as Hot, Warm or Cold — and explains why`),Me()(),hc(7,`div`,3),yt(8,me,4,1,`button`,4),Me(),yt(9,he,1,0,`mat-progress-bar`,5)(10,fe,84,17,`div`,6),Me()),t&2&&(le$1(8),vt(e.admin()?8:-1),le$1(),vt(e.cfg()?10:9))},dependencies:[Mn,Pe,Vn,Yt,Ep,Qc,Wv,zv,ne,ie,st,ke,ie$1,Fe,bt,we,rr,ir,Ot,G,Xi,Lc,kc,Te,ie$2],styles:[`.wrow[_ngcontent-%COMP%]{display:flex;align-items:center;gap:12px;padding:6px 0}.wrow[_ngcontent-%COMP%]   mat-slider[_ngcontent-%COMP%]{width:180px;flex:none}.wrow[_ngcontent-%COMP%]   .grow[_ngcontent-%COMP%]   mat-slider[_ngcontent-%COMP%], .wrow[_ngcontent-%COMP%]   mat-slider.grow[_ngcontent-%COMP%]{flex:1;width:auto}.val[_ngcontent-%COMP%]{width:44px;text-align:right}.t[_ngcontent-%COMP%]{font:var(--%NS%mat-sys-title-small)}.trow[_ngcontent-%COMP%]{display:flex;gap:12px;align-items:center;padding:10px 0;border-top:1px solid var(--%NS%mat-sys-outline-variant)}.trow[_ngcontent-%COMP%]:first-of-type{border-top:0}@media(max-width:600px){.wrow[_ngcontent-%COMP%]{flex-wrap:wrap}.wrow[_ngcontent-%COMP%]   mat-slider[_ngcontent-%COMP%]{flex:1;width:auto}}`]})};export{ae as AiPage};