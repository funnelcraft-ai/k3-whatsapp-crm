import{$n as be,$r as ot$1,A as El,Ai as w0,An as Wv,At as OI,B as Gi,Bi as xi$1,Br as l4,Bt as Qc,C as Cr,Ci as ve,Cn as Vy,Ct as Ne,D as E0,Di as vt$1,Dt as Nr,Ei as vs,En as WI,Er as ie$1,F as Fx,Fi as wp,Fn as Yv,Fr as k,G as Ho,Gt as Ra,H as H4,Hn as _c,Hr as le,Ht as Qo,I as GI,In as ZG,Ir as kE,It as PI,Ji as yD,Jt as Rr,K as Hv,Ki as xy,Kn as _x,Kt as Re,L as GT,Li as x_,Ln as Ze$1,Lr as kp,M as FI,Mi as we,Mn as Xo,Mr as jr,Mt as Oo,N as Fn,Nt as Op,O as ES,On as Wc,Or as is,P as Ft,Pt as Or,Qn as bc,Qt as Se,Ri as xf,Rn as Zi$1,Rr as kr,Rt as Pt,S as Cp,Sn as Vr,Tt as No,U as HD,Vi as xl,Vt as Qn,W as HU,Wn as _s,Wr as lp,Wt as RI,Xi as yn$1,Xn as av,Xr as ne,Y as IM,Yn as as,Yr as nD,Z as Ih,Zi as yt$1,Zr as nt$1,Zt as S_,_ as C$1,_i as tt$1,_r as gI,_t as Mo,a as $y,ai as re$1,an as Tf,ar as cn$1,at as Jt,bi as up,c as Ar,ci as rs,cr as dn$1,d as B,di as ss,dr as en$1,dt as Lt,ei as pi$1,en as Sl,er as bn$1,et as J,fr as et$2,gr as g,gt as Mf,hi as te,hn as V4,hr as fp,ht as Me,i as $r,ii as rD,in as Te,j as Ep,ji as wa$1,jr as jo,jt as On,k as Ea,ki as w,kn as We$1,kr as it$1,kt as O,l as Ax,m as Bf,mn as V0,mr as fT,na as zy,ni as qe$1,nn as Sx,nt as J_,o as Ae,or as cs,p as Be$1,pi as tD,pn as V,pr as f$1,pt as M,q as Hy,qi as y,qn as _y,qr as me$1,qt as Rn,ri as qi$1,rn as Sy,rr as cD,rt as Jn,sn as To,sr as de$1,st as K$1,ta as zv,ti as pp,tr as bx,tt as JT,u as Ay,un as UU,ur as ee,ut as Le$1,v as CS,vi as uT,vr as ge,vt as My,wn as W,wr as iD,wt as Nl,xi as v,xn as Vp,xr as hc,xt as NS,yi as ub,yt as N,z as Ge$1,zi as xh,zr as kx,zt as Q}from"./chunk-DHTEIVqJ.js";import{a as oa$1,i as na,o as ve$1,s as xe}from"./chunk-DHP4zQzy.js";import{n as _t$1,t as Vt}from"./chunk-DjFNmfme.js";import{t as g$1}from"./chunk-CATaXv3y.js";import{c as ke$1,n as De,s as ie$2}from"./chunk-Cs_oQDTH.js";import{a as lt,c as rt$1,i as ee$1,l as ue$1,n as Z,o as me$2,r as _n$1,t as J$1,u as yn$2}from"./chunk-pI3q-t9E.js";import{c as gt,d as oe,i as Pt$1,l as ir,m as we$1,n as Ne$1,o as at$1,p as rr,s as bt,t as Fe}from"./chunk-Io1b3U6S.js";import{c as Qe,f as Yt,g as se$1,i as Mn$1,l as Ut,m as bn$2,o as N$1,s as Pe,t as Dn,u as Vn}from"./chunk-Bj5_6M93.js";import{D as kc,E as hc$1,F as xn$1,L as ys,O as lc,P as wc,S as ds,_ as bc$1,a as J$2,b as cs$1,d as Sc,h as Z$1,i as Ic,j as ps,l as Mi$1,m as Vt$1,o as L,p as Vn$1,r as Gt,s as Lc,t as Cc,u as Rc,v as bs,w as fe,x as dc,y as cc}from"./chunk-DA26F_-k.js";import{r as p}from"./chunk-DephcU8t.js";import"./chunk-hWzYPCs6.js";function C(r,e){let v$1=!e?.manualCleanup?e?.injector?.get(Se)??f$1(Se):null,a=f(e?.equal),n;e?.requireSync?n=Le$1({kind:0},{equal:a}):n=Le$1({kind:1,value:e?.initialValue},{equal:a});let s,d=r.subscribe({next:t=>n.set({kind:1,value:t}),error:t=>{n.set({kind:2,error:t}),s?.()},complete:()=>{s?.()}});if(e?.requireSync&&n().kind===0)throw new v(601,!1);return s=v$1?.onDestroy(d.unsubscribe.bind(d)),Fx(()=>{let t=n();switch(t.kind){case 1:return t.value;case 2:throw t.error;case 0:throw new v(601,!1)}},{equal:e?.equal})}function f(r=Object.is){return(e,o)=>e.kind===1&&o.kind===1&&r(e.value,o.value)}var $=new g(`MAT_MENU_PANEL`);var G=(()=>{class r{_isAnchor;_elementRef=f$1(B);_document=f$1(C$1);_focusMonitor=f$1(Oo);_parentMenu=f$1($,{optional:!0});_changeDetectorRef=f$1(Or);role=`menuitem`;disabled=!1;disabledInteractive=!1;disableRipple=!1;_hovered=new w;_focused=new w;_highlighted=!1;_triggersSubmenu=!1;constructor(){f$1(nt$1).load(S_),this._parentMenu?.addItem?.(this),this._isAnchor=this._elementRef.nativeElement.tagName===`A`}focus(e,t){this._focusMonitor&&e?this._focusMonitor.focusVia(this._getHostElement(),e,t):this._getHostElement().focus(t),this._focused.next(this)}ngAfterViewInit(){this._focusMonitor&&this._focusMonitor.monitor(this._elementRef,!1)}ngOnDestroy(){this._focusMonitor&&this._focusMonitor.stopMonitoring(this._elementRef),this._parentMenu&&this._parentMenu.removeItem&&this._parentMenu.removeItem(this),this._hovered.complete(),this._focused.complete()}_getTabIndex(){return this.disabled&&!this.disabledInteractive?`-1`:`0`}_getAriaDisabled(){return this._isAnchor?this.disabled||null:this.disabled&&this.disabledInteractive?!0:null}_getDisabled(){return this.disabledInteractive||!this.disabled?null:!0}_getHostElement(){return this._elementRef.nativeElement}_checkDisabled(e){this.disabled&&(e.preventDefault(),e.stopPropagation())}_handleMouseEnter(){this._hovered.next(this)}getLabel(){let e=this._elementRef.nativeElement.cloneNode(!0),t=e.querySelectorAll(`mat-icon, .material-icons, .material-symbols-outlined, .material-symbols-rounded, .material-symbols-sharp`);for(let n=0;n<t.length;n++)t[n].remove();return e.textContent?.trim()||``}_setHighlighted(e){this._highlighted=e,this._changeDetectorRef.markForCheck()}_setTriggersSubmenu(e){this._triggersSubmenu=e,this._changeDetectorRef.markForCheck()}_hasFocus(){return this._document&&this._document.activeElement===this._getHostElement()}static ɵfac=function(t){return new(t||r)};static ɵcmp=(function(){let e=[[[`mat-icon`],[``,`matMenuItemIcon`,``]],`*`],t=[`mat-icon, [matMenuItemIcon]`,`*`];function n(a,i){a&1&&(Ih(),Te(0,`svg`,2),hc(1,`polygon`,3),Me())}return te({type:r,selectors:[[``,`mat-menu-item`,``]],hostAttrs:[1,`mat-mdc-menu-item`,`mat-focus-indicator`],hostVars:12,hostBindings:function(i,s){i&1&&Nr(`click`,function(l){return s._checkDisabled(l)})(`mouseenter`,function(){return s._handleMouseEnter()}),i&2&&(Be$1(`role`,s.role)(`tabindex`,s._getTabIndex())(`aria-disabled`,s._getAriaDisabled())(`disabled`,s._getDisabled()),ve(`mat-mdc-menu-item-highlighted`,s._highlighted)(`mat-mdc-menu-item-submenu-trigger`,s._triggersSubmenu)(`mat-mdc-menu-item-disabled`,s.disabled)(`mat-mdc-menu-item-disabled-interactive`,s.disabledInteractive))},inputs:{role:`role`,disabled:[2,`disabled`,`disabled`,ie$1],disabledInteractive:[2,`disabledInteractive`,`disabledInteractive`,ie$1],disableRipple:[2,`disableRipple`,`disableRipple`,ie$1]},exportAs:[`matMenuItem`],ngContentSelectors:t,decls:5,vars:3,consts:[[1,`mat-mdc-menu-item-text`],[`matRipple`,``,1,`mat-mdc-menu-ripple`,3,`matRippleDisabled`,`matRippleTrigger`],[`viewBox`,`0 0 5 10`,`focusable`,`false`,`aria-hidden`,`true`,1,`mat-mdc-menu-submenu-icon`],[`points`,`0,0 5,5 0,10`]],template:function(i,s){i&1&&(Pt(e),be(0),Te(1,`span`,0),be(2,1),Me(),hc(3,`div`,1),yt$1(4,n,2,0,`svg`,2)),i&2&&(le(3),Gi(`matRippleDisabled`,s.disableRipple||s.disabled)(`matRippleTrigger`,s._getHostElement()),le(),vt$1(s._triggersSubmenu?4:-1))},dependencies:[l4],encapsulation:2})})()}return r})();var Ze=new g(`MatMenuContent`);var Je$2=new g(`mat-menu-default-options`,{providedIn:`root`,factory:()=>({overlapTrigger:!1,xPosition:`after`,yPosition:`below`,backdropClass:`cdk-overlay-transparent-backdrop`})});var K=`_mat-menu-enter`;var T=`_mat-menu-exit`;var P=(()=>{class r{_elementRef=f$1(B);_changeDetectorRef=f$1(Or);_injector=f$1(M);_keyManager;_xPosition;_yPosition;_firstItemFocusRef;_exitFallbackTimeout;_animationsDisabled=it$1();_allItems;_directDescendantItems=new Cr;_classList={};_panelAnimationState=`void`;_animationDone=new w;_isAnimating=Le$1(!1);parentMenu;direction;overlayPanelClass;backdropClass;ariaLabel;ariaLabelledby;ariaDescribedby;get xPosition(){return this._xPosition}set xPosition(e){this._xPosition=e,this.setPositionClasses()}get yPosition(){return this._yPosition}set yPosition(e){this._yPosition=e,this.setPositionClasses()}templateRef;items;lazyContent;overlapTrigger=!1;hasBackdrop;get panelClass(){return this._previousPanelClass}set panelClass(e){let t=this._previousPanelClass,n=y({},this._classList);t&&t.length&&t.split(` `).forEach(a=>{n[a]=!1}),this._previousPanelClass=e,e&&e.length&&(e.split(` `).forEach(a=>{n[a]=!0}),this._elementRef.nativeElement.className=``),this._classList=n}_previousPanelClass=``;get classList(){return this.panelClass}set classList(e){this.panelClass=e}closed=new J;close=this.closed;panelId=f$1(ot$1).getId(`mat-menu-panel-`);constructor(){let e=f$1(Je$2);this.overlayPanelClass=e.overlayPanelClass||``,this._xPosition=e.xPosition,this._yPosition=e.yPosition,this.backdropClass=e.backdropClass,this.overlapTrigger=e.overlapTrigger,this.hasBackdrop=e.hasBackdrop}ngOnInit(){this.setPositionClasses()}ngAfterContentInit(){this._updateDirectDescendants(),this._keyManager=new pp(this._directDescendantItems).withWrap().withTypeAhead().withHomeAndEnd().skipPredicate(e=>e.disabled&&!e.disabledInteractive),this._keyManager.tabOut.subscribe(()=>this.closed.emit(`tab`)),this._directDescendantItems.changes.pipe(bn$1(this._directDescendantItems),Nl(e=>Sl(...e.map(t=>t._focused)))).subscribe(e=>this._keyManager.updateActiveItem(e)),this._directDescendantItems.changes.subscribe(e=>{let t=this._keyManager;if(this._panelAnimationState===`enter`&&t.activeItem?._hasFocus()){let n=e.toArray(),a=Math.max(0,Math.min(n.length-1,t.activeItemIndex||0));n[a]&&!n[a].disabled?t.setActiveItem(a):t.setNextItemActive()}})}ngOnDestroy(){this._keyManager?.destroy(),this._directDescendantItems.destroy(),this.closed.complete(),this._firstItemFocusRef?.destroy(),clearTimeout(this._exitFallbackTimeout)}_hovered(){return this._directDescendantItems.changes.pipe(bn$1(this._directDescendantItems),Nl(t=>Sl(...t.map(n=>n._hovered))))}addItem(e){}removeItem(e){}_handleKeydown(e){let t=e.keyCode,n=this._keyManager;switch(t){case 27:Fn(e)||(e.preventDefault(),this.closed.emit(`keydown`));break;case 37:this.parentMenu&&this.direction===`ltr`&&this.closed.emit(`keydown`);break;case 39:this.parentMenu&&this.direction===`rtl`&&this.closed.emit(`keydown`);break;default:(t===38||t===40)&&n.setFocusOrigin(`keyboard`),n.onKeydown(e);return}}focusFirstItem(e=`program`){this._firstItemFocusRef?.destroy(),this._firstItemFocusRef=et$2(()=>{let t=this._resolvePanel();if(!t||!t.contains(document.activeElement)){let n=this._keyManager;n.setFocusOrigin(e).setFirstItemActive(),!n.activeItem&&t&&t.focus()}},{injector:this._injector})}resetActiveItem(){this._keyManager.setActiveItem(-1)}setElevation(e){}setPositionClasses(e=this.xPosition,t=this.yPosition){this._classList=ne(y({},this._classList),{"mat-menu-before":e===`before`,"mat-menu-after":e===`after`,"mat-menu-above":t===`above`,"mat-menu-below":t===`below`}),this._changeDetectorRef.markForCheck()}_onAnimationDone(e){let t=e===T;(t||e===K)&&(t&&(clearTimeout(this._exitFallbackTimeout),this._exitFallbackTimeout=void 0),this._animationDone.next(t?`void`:`enter`),this._isAnimating.set(!1))}_onAnimationStart(e){(e===K||e===T)&&this._isAnimating.set(!0)}_setIsOpen(e){if(this._panelAnimationState=e?`enter`:`void`,e){if(this._keyManager.activeItemIndex===0){let t=this._resolvePanel();t&&(t.scrollTop=0)}}else this._animationsDisabled||(this._exitFallbackTimeout=setTimeout(()=>this._onAnimationDone(T),200));this._animationsDisabled&&setTimeout(()=>{this._onAnimationDone(e?K:T)}),this._changeDetectorRef.markForCheck()}_updateDirectDescendants(){this._allItems.changes.pipe(bn$1(this._allItems)).subscribe(e=>{this._directDescendantItems.reset(e.filter(t=>t._parentMenu===this)),this._directDescendantItems.notifyOnChanges()})}_resolvePanel(){let e=null;return this._directDescendantItems.length&&(e=this._directDescendantItems.first._getHostElement().closest(`[role="menu"]`)),e}static ɵfac=function(t){return new(t||r)};static ɵcmp=(function(){let e=[`*`];function t(n,a){if(n&1){let i=xf();Ge$1(0,`div`,0),xy(`click`,function(){Ea(i);let m=To();return wa$1(m.closed.emit(`click`))})(`animationstart`,function(m){Ea(i);let l=To();return wa$1(l._onAnimationStart(m.animationName))})(`animationend`,function(m){Ea(i);let l=To();return wa$1(l._onAnimationDone(m.animationName))})(`animationcancel`,function(m){Ea(i);let l=To();return wa$1(l._onAnimationDone(m.animationName))}),Ge$1(1,`div`,1),be(2),qe$1()()}if(n&2){let i=To();Zi$1(i._classList),ve(`mat-menu-panel-animations-disabled`,i._animationsDisabled)(`mat-menu-panel-exit-animation`,i._panelAnimationState===`void`)(`mat-menu-panel-animating`,i._isAnimating()),qi$1(`id`,i.panelId),Be$1(`aria-label`,i.ariaLabel||null)(`aria-labelledby`,i.ariaLabelledby||null)(`aria-describedby`,i.ariaDescribedby||null)}}return te({type:r,selectors:[[`mat-menu`]],contentQueries:function(a,i,s){if(a&1&&My(s,Ze,5)(s,G,5)(s,G,4),a&2){let m;kr(m=Rr())&&(i.lazyContent=m.first),kr(m=Rr())&&(i._allItems=m),kr(m=Rr())&&(i.items=m)}},viewQuery:function(a,i){if(a&1&&Ar(Ae,5),a&2){let s;kr(s=Rr())&&(i.templateRef=s.first)}},hostVars:3,hostBindings:function(a,i){a&2&&Be$1(`aria-label`,null)(`aria-labelledby`,null)(`aria-describedby`,null)},inputs:{backdropClass:`backdropClass`,ariaLabel:[0,`aria-label`,`ariaLabel`],ariaLabelledby:[0,`aria-labelledby`,`ariaLabelledby`],ariaDescribedby:[0,`aria-describedby`,`ariaDescribedby`],xPosition:`xPosition`,yPosition:`yPosition`,overlapTrigger:[2,`overlapTrigger`,`overlapTrigger`,ie$1],hasBackdrop:[2,`hasBackdrop`,`hasBackdrop`,n=>n==null?null:ie$1(n)],panelClass:[0,`class`,`panelClass`],classList:`classList`},outputs:{closed:`closed`,close:`close`},exportAs:[`matMenu`],features:[Mf([{provide:$,useExisting:r}])],ngContentSelectors:e,decls:1,vars:0,consts:[[`tabindex`,`-1`,`role`,`menu`,1,`mat-mdc-menu-panel`,3,`click`,`animationstart`,`animationend`,`animationcancel`,`id`],[1,`mat-mdc-menu-content`]],template:function(a,i){a&1&&(Pt(),_y(0,t,3,12,`ng-template`))},styles:[`mat-menu {
  display: none;
}

.mat-mdc-menu-content {
  margin: 0;
  padding: 8px 0;
  outline: 0;
}
.mat-mdc-menu-content,
.mat-mdc-menu-content .mat-mdc-menu-item .mat-mdc-menu-item-text {
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  flex: 1;
  white-space: normal;
  font-family: var(--%NS%mat-menu-item-label-text-font, var(--%NS%mat-sys-label-large-font));
  line-height: var(--%NS%mat-menu-item-label-text-line-height, var(--%NS%mat-sys-label-large-line-height));
  font-size: var(--%NS%mat-menu-item-label-text-size, var(--%NS%mat-sys-label-large-size));
  letter-spacing: var(--%NS%mat-menu-item-label-text-tracking, var(--%NS%mat-sys-label-large-tracking));
  font-weight: var(--%NS%mat-menu-item-label-text-weight, var(--%NS%mat-sys-label-large-weight));
}

@keyframes _mat-menu-enter {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@keyframes _mat-menu-exit {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
.mat-mdc-menu-panel {
  min-width: 112px;
  max-width: 280px;
  overflow: auto;
  box-sizing: border-box;
  outline: 0;
  animation: _mat-menu-enter 120ms cubic-bezier(0, 0, 0.2, 1);
  border-radius: var(--%NS%mat-menu-container-shape, var(--%NS%mat-sys-corner-extra-small));
  background-color: var(--%NS%mat-menu-container-color, var(--%NS%mat-sys-surface-container));
  box-shadow: var(--%NS%mat-menu-container-elevation-shadow, 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12));
  will-change: transform, opacity;
}
.mat-mdc-menu-panel.mat-menu-panel-exit-animation {
  animation: _mat-menu-exit 100ms 25ms linear forwards;
}
.mat-mdc-menu-panel.mat-menu-panel-animations-disabled {
  animation: none;
}
.mat-mdc-menu-panel.mat-menu-panel-animating {
  pointer-events: none;
}
.mat-mdc-menu-panel.mat-menu-panel-animating:has(.mat-mdc-menu-content:empty) {
  display: none;
}
@media (forced-colors: active) {
  .mat-mdc-menu-panel {
    outline: solid 1px;
  }
}
.mat-mdc-menu-panel .mat-divider {
  border-top-color: var(--%NS%mat-menu-divider-color, var(--%NS%mat-sys-surface-variant));
  margin-bottom: var(--%NS%mat-menu-divider-bottom-spacing, 8px);
  margin-top: var(--%NS%mat-menu-divider-top-spacing, 8px);
}

.mat-mdc-menu-item {
  display: flex;
  position: relative;
  align-items: center;
  justify-content: flex-start;
  overflow: hidden;
  padding: 0;
  cursor: pointer;
  width: 100%;
  text-align: left;
  box-sizing: border-box;
  color: inherit;
  font-size: inherit;
  background: none;
  text-decoration: none;
  margin: 0;
  min-height: 48px;
  padding-left: var(--%NS%mat-menu-item-leading-spacing, 12px);
  padding-right: var(--%NS%mat-menu-item-trailing-spacing, 12px);
  -webkit-user-select: none;
  user-select: none;
  cursor: pointer;
  outline: none;
  border: none;
  -webkit-tap-highlight-color: transparent;
}
.mat-mdc-menu-item::-moz-focus-inner {
  border: 0;
}
[dir=rtl] .mat-mdc-menu-item {
  padding-left: var(--%NS%mat-menu-item-trailing-spacing, 12px);
  padding-right: var(--%NS%mat-menu-item-leading-spacing, 12px);
}
.mat-mdc-menu-item:has(.material-icons, .material-symbols-outlined, .material-symbols-rounded, .material-symbols-sharp, mat-icon, [matButtonIcon]) {
  padding-left: var(--%NS%mat-menu-item-with-icon-leading-spacing, 12px);
  padding-right: var(--%NS%mat-menu-item-with-icon-trailing-spacing, 12px);
}
[dir=rtl] .mat-mdc-menu-item:has(.material-icons, .material-symbols-outlined, .material-symbols-rounded, .material-symbols-sharp, mat-icon, [matButtonIcon]) {
  padding-left: var(--%NS%mat-menu-item-with-icon-trailing-spacing, 12px);
  padding-right: var(--%NS%mat-menu-item-with-icon-leading-spacing, 12px);
}
.mat-mdc-menu-item, .mat-mdc-menu-item:visited, .mat-mdc-menu-item:link {
  color: var(--%NS%mat-menu-item-label-text-color, var(--%NS%mat-sys-on-surface));
}
.mat-mdc-menu-item .mat-icon-no-color,
.mat-mdc-menu-item .mat-mdc-menu-submenu-icon {
  color: var(--%NS%mat-menu-item-icon-color, var(--%NS%mat-sys-on-surface-variant));
}
.mat-mdc-menu-item[disabled], .mat-mdc-menu-item.mat-mdc-menu-item-disabled {
  cursor: default;
  opacity: 0.38;
}
.mat-mdc-menu-item[disabled]::after, .mat-mdc-menu-item.mat-mdc-menu-item-disabled::after {
  display: block;
  position: absolute;
  content: "";
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}
.mat-mdc-menu-item:focus {
  outline: 0;
}
.mat-mdc-menu-item .mat-icon {
  flex-shrink: 0;
  margin-right: var(--%NS%mat-menu-item-spacing, 12px);
  height: var(--%NS%mat-menu-item-icon-size, 24px);
  width: var(--%NS%mat-menu-item-icon-size, 24px);
}
[dir=rtl] .mat-mdc-menu-item {
  text-align: right;
}
[dir=rtl] .mat-mdc-menu-item .mat-icon {
  margin-right: 0;
  margin-left: var(--%NS%mat-menu-item-spacing, 12px);
}
.mat-mdc-menu-item:not([disabled]):hover {
  background-color: var(--%NS%mat-menu-item-hover-state-layer-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) calc(var(--%NS%mat-sys-hover-state-layer-opacity) * 100%), transparent));
}
.mat-mdc-menu-item:not([disabled]).cdk-program-focused, .mat-mdc-menu-item:not([disabled]).cdk-keyboard-focused, .mat-mdc-menu-item:not([disabled]).mat-mdc-menu-item-highlighted {
  background-color: var(--%NS%mat-menu-item-focus-state-layer-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) calc(var(--%NS%mat-sys-focus-state-layer-opacity) * 100%), transparent));
}
@media (forced-colors: active) {
  .mat-mdc-menu-item {
    margin-top: 1px;
  }
}

.mat-mdc-menu-submenu-icon {
  width: var(--%NS%mat-menu-item-icon-size, 24px);
  height: 10px;
  fill: currentColor;
  padding-left: var(--%NS%mat-menu-item-spacing, 12px);
}
[dir=rtl] .mat-mdc-menu-submenu-icon {
  padding-right: var(--%NS%mat-menu-item-spacing, 12px);
  padding-left: 0;
}
[dir=rtl] .mat-mdc-menu-submenu-icon polygon {
  transform: scaleX(-1);
  transform-origin: center;
}
@media (forced-colors: active) {
  .mat-mdc-menu-submenu-icon {
    fill: CanvasText;
  }
}

.mat-mdc-menu-item .mat-mdc-menu-ripple {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  pointer-events: none;
}
`],encapsulation:2})})()}return r})();var et$1=new g(`mat-menu-scroll-strategy`,{providedIn:`root`,factory:()=>{let r=f$1(M);return()=>kp(r)}});var d=/* @__PURE__ */ new WeakMap;var tt=(()=>{class r{_canHaveBackdrop;_element=f$1(B);_viewContainerRef=f$1(tt$1);_menuItemInstance=f$1(G,{optional:!0,self:!0});_dir=f$1(cn$1,{optional:!0});_focusMonitor=f$1(Oo);_ngZone=f$1(N);_injector=f$1(M);_scrollStrategy=f$1(et$1);_changeDetectorRef=f$1(Or);_animationsDisabled=it$1();_portal;_overlayRef=null;_menuOpen=!1;_closingActionsSubscription=V.EMPTY;_menuCloseSubscription=V.EMPTY;_pendingRemoval;_parentMaterialMenu;_parentInnerPadding;_openedBy=void 0;get _menu(){return this._menuInternal}set _menu(e){e!==this._menuInternal&&(this._menuInternal=e,this._menuCloseSubscription.unsubscribe(),e?(this._parentMaterialMenu,this._menuCloseSubscription=e.close.subscribe(t=>{this._destroyMenu(t),(t===`click`||t===`tab`)&&this._parentMaterialMenu&&this._parentMaterialMenu.closed.emit(t)})):this._destroyMenu(),this._menuItemInstance?._setTriggersSubmenu(this._triggersSubmenu()))}_menuInternal=null;constructor(e){this._canHaveBackdrop=e;let t=f$1($,{optional:!0});this._parentMaterialMenu=t instanceof P?t:void 0}ngOnDestroy(){this._menu&&this._ownsMenu(this._menu)&&d.delete(this._menu),this._pendingRemoval?.unsubscribe(),this._menuCloseSubscription.unsubscribe(),this._closingActionsSubscription.unsubscribe(),this._overlayRef&&(this._overlayRef.dispose(),this._overlayRef=null)}get menuOpen(){return this._menuOpen}get dir(){return this._dir&&this._dir.value===`rtl`?`rtl`:`ltr`}_triggersSubmenu(){return!!(this._menuItemInstance&&this._parentMaterialMenu&&this._menu)}_closeMenu(){this._menu?.close.emit()}_openMenu(e){if(this._triggerIsAriaDisabled())return;let t=this._menu;if(this._menuOpen||!t)return;this._pendingRemoval?.unsubscribe();let n=d.get(t);d.set(t,this),n&&n!==this&&n._closeMenu();let a=this._createOverlay(t),i=a.getConfig(),s=i.positionStrategy;this._setPosition(t,s),this._canHaveBackdrop?i.hasBackdrop=t.hasBackdrop==null?!this._triggersSubmenu():t.hasBackdrop:i.hasBackdrop=t.hasBackdrop??!1,a.hasAttached()||(a.attach(this._getPortal(t)),t.lazyContent?.attach(this.menuData)),this._closingActionsSubscription=this._menuClosingActions().subscribe(()=>this._closeMenu()),t.parentMenu=this._triggersSubmenu()?this._parentMaterialMenu:void 0,t.direction=this.dir,e&&t.focusFirstItem(this._openedBy||`program`),this._setIsMenuOpen(!0),t instanceof P&&(t._setIsOpen(!0),t._directDescendantItems.changes.pipe(yn$1(t.close)).subscribe(()=>{s.withLockedPosition(!1).reapplyLastPosition(),s.withLockedPosition(!0)}))}focus(e,t){this._focusMonitor&&e?this._focusMonitor.focusVia(this._element,e,t):this._element.nativeElement.focus(t)}_destroyMenu(e){let t=this._overlayRef,n=this._menu;!t||!this.menuOpen||(this._closingActionsSubscription.unsubscribe(),this._pendingRemoval?.unsubscribe(),n instanceof P&&this._ownsMenu(n)?(this._pendingRemoval=n._animationDone.pipe(we(1)).subscribe(()=>{t.detach(),d.has(n)||n.lazyContent?.detach()}),n._setIsOpen(!1)):(t.detach(),n?.lazyContent?.detach()),n&&this._ownsMenu(n)&&d.delete(n),this.restoreFocus&&(e===`keydown`||!this._openedBy||!this._triggersSubmenu())&&this.focus(this._openedBy),this._openedBy=void 0,this._setIsMenuOpen(!1))}_setIsMenuOpen(e){e!==this._menuOpen&&(this._menuOpen=e,this._menuOpen?this.menuOpened.emit():this.menuClosed.emit(),this._triggersSubmenu()&&this._menuItemInstance._setHighlighted(e),this._changeDetectorRef.markForCheck())}_createOverlay(e){if(!this._overlayRef){let t=this._getOverlayConfig(e);this._subscribeToPositions(e,t.positionStrategy),this._overlayRef=$r(this._injector,t),this._overlayRef.keydownEvents().subscribe(n=>{this._menu instanceof P&&this._menu._handleKeydown(n)})}return this._overlayRef}_getOverlayConfig(e){return new dn$1({positionStrategy:Op(this._injector,this._getOverlayOrigin()).withLockedPosition().withGrowAfterOpen().withTransformOriginOn(`.mat-menu-panel, .mat-mdc-menu-panel`),backdropClass:e.backdropClass||`cdk-overlay-transparent-backdrop`,panelClass:e.overlayPanelClass,scrollStrategy:this._scrollStrategy(),direction:this._dir||`ltr`,disableAnimations:this._animationsDisabled})}_subscribeToPositions(e,t){e.setPositionClasses&&t.positionChanges.subscribe(n=>{this._ngZone.run(()=>{let a=n.connectionPair.overlayX===`start`?`after`:`before`,i=n.connectionPair.overlayY===`top`?`below`:`above`;e.setPositionClasses(a,i)})})}_setPosition(e,t){let[n,a]=e.xPosition===`before`?[`end`,`start`]:[`start`,`end`],[i,s]=e.yPosition===`above`?[`bottom`,`top`]:[`top`,`bottom`],[m,l]=[i,s],[R,A]=[n,a],p=0;if(this._triggersSubmenu()){if(A=n=e.xPosition===`before`?`start`:`end`,a=R=n===`end`?`start`:`end`,this._parentMaterialMenu){if(this._parentInnerPadding==null){let q=this._parentMaterialMenu.items.first;this._parentInnerPadding=q?q._getHostElement().offsetTop:0}p=i===`bottom`?this._parentInnerPadding:-this._parentInnerPadding}}else e.overlapTrigger||(m=i===`top`?`bottom`:`top`,l=s===`top`?`bottom`:`top`);t.withPositions([{originX:n,originY:m,overlayX:R,overlayY:i,offsetY:p},{originX:a,originY:m,overlayX:A,overlayY:i,offsetY:p},{originX:n,originY:l,overlayX:R,overlayY:s,offsetY:-p},{originX:a,originY:l,overlayX:A,overlayY:s,offsetY:-p}])}_menuClosingActions(){let e=this._getOutsideClickStream(this._overlayRef),t=this._overlayRef.detachments(),n=this._parentMaterialMenu?this._parentMaterialMenu.closed:Ne(),a=this._parentMaterialMenu?this._parentMaterialMenu._hovered().pipe(de$1(i=>this._menuOpen&&i!==this._menuItemInstance)):Ne();return Sl(e,n,a,t)}_getPortal(e){return(!this._portal||this._portal.templateRef!==e.templateRef)&&(this._portal=new Lt(e.templateRef,this._viewContainerRef)),this._portal}_ownsMenu(e){return d.get(e)===this}_triggerIsAriaDisabled(){return ie$1(this._element.nativeElement.getAttribute(`aria-disabled`))}static ɵfac=function(t){NS()};static ɵdir=W({type:r})}return r})();var At=(()=>{class r extends tt{_cleanupTouchstart;_hoverSubscription=V.EMPTY;get _deprecatedMatMenuTriggerFor(){return this.menu}set _deprecatedMatMenuTriggerFor(e){this.menu=e}get menu(){return this._menu}set menu(e){this._menu=e}menuData;restoreFocus=!0;menuOpened=new J;onMenuOpen=this.menuOpened;menuClosed=new J;onMenuClose=this.menuClosed;constructor(){super(!0);let e=f$1(We$1);this._cleanupTouchstart=e.listen(this._element.nativeElement,`touchstart`,t=>{as(t)||(this._openedBy=`touch`)},{passive:!0})}triggersSubmenu(){return super._triggersSubmenu()}toggleMenu(){return this.menuOpen?this.closeMenu():this.openMenu()}openMenu(){this._openMenu(!0)}closeMenu(){this._closeMenu()}updatePosition(){this._overlayRef?.updatePosition()}ngAfterContentInit(){this._handleHover()}ngOnDestroy(){super.ngOnDestroy(),this._cleanupTouchstart(),this._hoverSubscription.unsubscribe()}_getOverlayOrigin(){return this._element}_getOutsideClickStream(e){return e.backdropClick()}_handleMousedown(e){ss(e)||(this._openedBy=e.button===0?`mouse`:void 0,this.triggersSubmenu()&&e.preventDefault())}_handleKeydown(e){let t=e.keyCode;(t===13||t===32)&&(this._openedBy=`keyboard`),this.triggersSubmenu()&&(t===39&&this.dir===`ltr`||t===37&&this.dir===`rtl`)&&(this._openedBy=`keyboard`,this.openMenu())}_handleClick(e){this.triggersSubmenu()?(e.stopPropagation(),this.openMenu()):this.toggleMenu()}_handleHover(){this.triggersSubmenu()&&this._parentMaterialMenu&&(this._hoverSubscription=this._parentMaterialMenu._hovered().subscribe(e=>{e===this._menuItemInstance&&!e.disabled&&this._parentMaterialMenu?._panelAnimationState!==`void`&&(this._openedBy=`mouse`,this._openMenu(!1))}))}static ɵfac=function(t){return new(t||r)};static ɵdir=W({type:r,selectors:[[``,`mat-menu-trigger-for`,``],[``,`matMenuTriggerFor`,``]],hostAttrs:[1,`mat-mdc-menu-trigger`],hostVars:3,hostBindings:function(t,n){t&1&&Nr(`click`,function(i){return n._handleClick(i)})(`mousedown`,function(i){return n._handleMousedown(i)})(`keydown`,function(i){return n._handleKeydown(i)}),t&2&&Be$1(`aria-haspopup`,n.menu?`menu`:null)(`aria-expanded`,n.menuOpen)(`aria-controls`,n.menuOpen?n.menu?.panelId:null)},inputs:{_deprecatedMatMenuTriggerFor:[0,`mat-menu-trigger-for`,`_deprecatedMatMenuTriggerFor`],menu:[0,`matMenuTriggerFor`,`menu`],menuData:[0,`matMenuTriggerData`,`menuData`],restoreFocus:[0,`matMenuTriggerRestoreFocus`,`restoreFocus`]},outputs:{menuOpened:`menuOpened`,onMenuOpen:`onMenuOpen`,menuClosed:`menuClosed`,onMenuClose:`onMenuClose`},exportAs:[`matMenuTrigger`],features:[ge]})}return r})();var Ot=(()=>{class r{static ɵfac=function(t){return new(t||r)};static ɵmod=ee({type:r});static ɵinj=K$1({imports:[x_,Ho,Ze$1,wp]})}return r})();var Le=class{source;value;constructor(a,e){this.source=a,this.value=e}};var si$1={provide:se$1,useExisting:pi$1(()=>Je$1),multi:!0};var Qt=new g(`MatRadioGroup`);var mi$1=new g(`mat-radio-default-options`,{providedIn:`root`,factory:()=>({color:`accent`,disabledInteractive:!1})});var Je$1=(()=>{class t{_changeDetector=f$1(Or);_value=null;_name=f$1(ot$1).getId(`mat-radio-group-`);_selected=null;_isInitialized=!1;_labelPosition=`after`;_disabled=!1;_required=!1;_buttonChanges;_controlValueAccessorChangeFn=()=>{};onTouched=()=>{};change=new J;_radios;color;get name(){return this._name}set name(e){this._name=e,this._updateRadioButtonNames()}get labelPosition(){return this._labelPosition}set labelPosition(e){this._labelPosition=e===`before`?`before`:`after`,this._markRadiosForCheck()}get value(){return this._value}set value(e){this._value!==e&&(this._value=e,this._updateSelectedRadioFromValue(),this._checkSelectedRadioButton())}_checkSelectedRadioButton(){this._selected&&!this._selected.checked&&(this._selected.checked=!0)}get selected(){return this._selected}set selected(e){this._selected=e,this.value=e?e.value:null,this._checkSelectedRadioButton()}get disabled(){return this._disabled}set disabled(e){this._disabled=e,this._markRadiosForCheck()}get required(){return this._required}set required(e){this._required=e,this._markRadiosForCheck()}get disabledInteractive(){return this._disabledInteractive}set disabledInteractive(e){this._disabledInteractive=e,this._markRadiosForCheck()}_disabledInteractive=!1;ngAfterContentInit(){this._isInitialized=!0,this._buttonChanges=this._radios.changes.subscribe(()=>{this.selected&&!this._radios.find(e=>e===this.selected)&&(this._selected=null)})}ngOnDestroy(){this._buttonChanges?.unsubscribe()}_touch(){this.onTouched&&this.onTouched()}_updateRadioButtonNames(){this._radios&&this._radios.forEach(e=>{e.name=this.name,e._markForCheck()})}_updateSelectedRadioFromValue(){let e=this._selected!==null&&this._selected.value===this._value;this._radios&&!e&&(this._selected=null,this._radios.forEach(i=>{i.checked=this.value===i.value,i.checked&&(this._selected=i)}))}_emitChangeEvent(){this._isInitialized&&this.change.emit(new Le(this._selected,this._value))}_markRadiosForCheck(){this._radios&&this._radios.forEach(e=>e._markForCheck())}writeValue(e){this.value=e,this._changeDetector.markForCheck()}registerOnChange(e){this._controlValueAccessorChangeFn=e}registerOnTouched(e){this.onTouched=e}setDisabledState(e){this.disabled=e,this._changeDetector.markForCheck()}static ɵfac=function(i){return new(i||t)};static ɵdir=W({type:t,selectors:[[`mat-radio-group`]],contentQueries:function(i,c,l){if(i&1&&My(l,Be,5),i&2){let m;kr(m=Rr())&&(c._radios=m)}},hostAttrs:[`role`,`radiogroup`,1,`mat-mdc-radio-group`],inputs:{color:`color`,name:`name`,labelPosition:`labelPosition`,value:`value`,selected:`selected`,disabled:[2,`disabled`,`disabled`,ie$1],required:[2,`required`,`required`,ie$1],disabledInteractive:[2,`disabledInteractive`,`disabledInteractive`,ie$1]},outputs:{change:`change`},exportAs:[`matRadioGroup`],features:[Mf([si$1,{provide:Qt,useExisting:t}])]})}return t})();var Be=(()=>{class t{_elementRef=f$1(B);_changeDetector=f$1(Or);_focusMonitor=f$1(Oo);_radioDispatcher=f$1(p);_defaultOptions=f$1(mi$1,{optional:!0});_ngZone=f$1(N);_renderer=f$1(We$1);_uniqueId=f$1(ot$1).getId(`mat-radio-`);_cleanupClick;id=this._uniqueId;name;ariaLabel;ariaLabelledby;ariaDescribedby;disableRipple=!1;tabIndex=0;get checked(){return this._checked}set checked(e){this._checked!==e&&(this._checked=e,e&&this.radioGroup&&this.radioGroup.value!==this.value?this.radioGroup.selected=this:!e&&this.radioGroup&&this.radioGroup.value===this.value&&(this.radioGroup.selected=null),e&&this._radioDispatcher.notify(this.id,this.name),this._changeDetector.markForCheck())}get value(){return this._value}set value(e){this._value!==e&&(this._value=e,this.radioGroup!==null&&(this.checked||(this.checked=this.radioGroup.value===e),this.checked&&(this.radioGroup.selected=this)))}get labelPosition(){return this._labelPosition||this.radioGroup&&this.radioGroup.labelPosition||`after`}set labelPosition(e){this._labelPosition=e}_labelPosition;get disabled(){return this._disabled||this.radioGroup!==null&&this.radioGroup.disabled}set disabled(e){this._setDisabled(e)}get required(){return this._required||this.radioGroup&&this.radioGroup.required}set required(e){e!==this._required&&this._changeDetector.markForCheck(),this._required=e}get color(){return this._color||this.radioGroup&&this.radioGroup.color||this._defaultOptions&&this._defaultOptions.color||`accent`}set color(e){this._color=e}_color;get disabledInteractive(){return this._disabledInteractive||this.radioGroup!==null&&this.radioGroup.disabledInteractive}set disabledInteractive(e){this._disabledInteractive=e}_disabledInteractive;change=new J;radioGroup;get inputId(){return`${this.id||this._uniqueId}-input`}_checked=!1;_disabled=!1;_required=!1;_value=null;_removeUniqueSelectionListener=()=>{};_previousTabIndex;_inputElement;_rippleTrigger;_noopAnimations=it$1();_injector=f$1(M);constructor(){f$1(nt$1).load(S_);let e=f$1(Qt,{optional:!0}),i=f$1(new _c(`tabindex`),{optional:!0});this.radioGroup=e,this._disabledInteractive=this._defaultOptions?.disabledInteractive??!1,i&&(this.tabIndex=Bf(i,0))}focus(e,i){i?this._focusMonitor.focusVia(this._inputElement,i,e):this._inputElement.nativeElement.focus(e)}_markForCheck(){this._changeDetector.markForCheck()}ngOnInit(){this.radioGroup&&(this.checked=this.radioGroup.value===this._value,this.checked&&(this.radioGroup.selected=this),this.name=this.radioGroup.name),this._removeUniqueSelectionListener=this._radioDispatcher.listen((e,i)=>{e!==this.id&&i===this.name&&(this.checked=!1)})}ngDoCheck(){this._updateTabIndex()}ngAfterViewInit(){this._updateTabIndex(),this._focusMonitor.monitor(this._elementRef,!0).subscribe(e=>{!e&&this.radioGroup&&this.radioGroup._touch()}),this._ngZone.runOutsideAngular(()=>{this._cleanupClick=this._renderer.listen(this._inputElement.nativeElement,`click`,this._onInputClick)})}ngOnDestroy(){this._cleanupClick?.(),this._focusMonitor.stopMonitoring(this._elementRef),this._removeUniqueSelectionListener()}_emitChangeEvent(){this.change.emit(new Le(this,this._value))}_isRippleDisabled(){return this.disableRipple||this.disabled}_onInputInteraction(e){if(e.stopPropagation(),!this.checked&&!this.disabled){let i=this.radioGroup&&this.value!==this.radioGroup.value;this.checked=!0,this._emitChangeEvent(),this.radioGroup&&(this.radioGroup._controlValueAccessorChangeFn(this.value),i&&this.radioGroup._emitChangeEvent())}}_setDisabled(e){this._disabled!==e&&(this._disabled=e,this._changeDetector.markForCheck())}_onInputClick=e=>{this.disabled&&this.disabledInteractive&&e.preventDefault()};_updateTabIndex(){let e=this.radioGroup,i;if(!e||!e.selected||this.disabled?i=this.tabIndex:i=e.selected===this?this.tabIndex:-1,i!==this._previousTabIndex){let c=this._inputElement?.nativeElement;c&&(c.setAttribute(`tabindex`,i+``),this._previousTabIndex=i,et$2(()=>{queueMicrotask(()=>{e&&e.selected&&e.selected!==this&&document.activeElement===c&&(e.selected?._inputElement.nativeElement.focus(),document.activeElement===c&&this._inputElement.nativeElement.blur())})},{injector:this._injector}))}}static ɵfac=function(i){return new(i||t)};static ɵcmp=(function(){let e=[`input`],i=[`formField`];return te({type:t,selectors:[[`mat-radio-button`]],viewQuery:function(m,g){if(m&1&&Ar(e,5)(i,7,B),m&2){let re;kr(re=Rr())&&(g._inputElement=re.first),kr(re=Rr())&&(g._rippleTrigger=re.first)}},hostAttrs:[1,`mat-mdc-radio-button`],hostVars:19,hostBindings:function(m,g){m&1&&Nr(`focus`,function(){return g._inputElement.nativeElement.focus()}),m&2&&(Be$1(`id`,g.id)(`tabindex`,null)(`aria-label`,null)(`aria-labelledby`,null)(`aria-describedby`,null),ve(`mat-primary`,g.color===`primary`)(`mat-accent`,g.color===`accent`)(`mat-warn`,g.color===`warn`)(`mat-mdc-radio-checked`,g.checked)(`mat-mdc-radio-disabled`,g.disabled)(`mat-mdc-radio-disabled-interactive`,g.disabledInteractive)(`_mat-animation-noopable`,g._noopAnimations))},inputs:{id:`id`,name:`name`,ariaLabel:[0,`aria-label`,`ariaLabel`],ariaLabelledby:[0,`aria-labelledby`,`ariaLabelledby`],ariaDescribedby:[0,`aria-describedby`,`ariaDescribedby`],disableRipple:[2,`disableRipple`,`disableRipple`,ie$1],tabIndex:[2,`tabIndex`,`tabIndex`,l=>l==null?0:Bf(l)],checked:[2,`checked`,`checked`,ie$1],value:`value`,labelPosition:`labelPosition`,disabled:[2,`disabled`,`disabled`,ie$1],required:[2,`required`,`required`,ie$1],color:`color`,disabledInteractive:[2,`disabledInteractive`,`disabledInteractive`,ie$1]},outputs:{change:`change`},exportAs:[`matRadioButton`],ngContentSelectors:[`*`],decls:13,vars:17,consts:[[`formField`,``],[`input`,``],[`mat-internal-form-field`,``,3,`labelPosition`,`for`],[1,`mdc-radio`],[1,`mat-mdc-radio-touch-target`],[`type`,`radio`,`aria-invalid`,`false`,1,`mdc-radio__native-control`,3,`change`,`id`,`checked`,`disabled`,`required`],[`aria-hidden`,`true`,1,`mdc-radio__background`],[1,`mdc-radio__outer-circle`],[1,`mdc-radio__inner-circle`],[`mat-ripple`,``,`aria-hidden`,`true`,1,`mat-radio-ripple`,`mat-focus-indicator`,3,`matRippleTrigger`,`matRippleDisabled`,`matRippleCentered`],[1,`mat-ripple-element`,`mat-radio-persistent-ripple`],[1,`mat-internal-form-field-label`,`mdc-label`]],template:function(m,g){m&1&&(Pt(),Te(0,`label`,2,0)(2,`span`,3),hc(3,`span`,4),Te(4,`input`,5,1),Nr(`change`,function(ci){return g._onInputInteraction(ci)}),Me(),Te(6,`span`,6),hc(7,`span`,7)(8,`span`,8),Me(),Te(9,`span`,9),hc(10,`span`,10),Me()(),Te(11,`span`,11),be(12),Me()()),m&2&&(Gi(`labelPosition`,g.labelPosition)(`for`,g.inputId),le(2),ve(`mdc-radio--disabled`,g.disabled),le(2),Gi(`id`,g.inputId)(`checked`,g.checked)(`disabled`,g.disabled&&!g.disabledInteractive)(`required`,g.required),Be$1(`name`,g.name)(`value`,g.value)(`aria-label`,g.ariaLabel)(`aria-labelledby`,g.ariaLabelledby)(`aria-describedby`,g.ariaDescribedby)(`aria-disabled`,g.disabled&&g.disabledInteractive?`true`:null),le(5),Gi(`matRippleTrigger`,g._rippleTrigger.nativeElement)(`matRippleDisabled`,g._isRippleDisabled())(`matRippleCentered`,!0))},dependencies:[l4,g$1],styles:[`.mat-mdc-radio-button {
  -webkit-tap-highlight-color: transparent;
}
.mat-mdc-radio-button .mdc-radio {
  display: inline-block;
  position: relative;
  flex: 0 0 auto;
  box-sizing: content-box;
  width: 20px;
  height: 20px;
  will-change: opacity, transform, border-color, color;
  padding: calc((var(--%NS%mat-radio-state-layer-size, 40px) - 20px) / 2);
  cursor: pointer;
}
.mat-mdc-radio-button .mdc-radio:hover > .mdc-radio__native-control:not([disabled]):not(:focus) ~ .mdc-radio__background::before {
  opacity: 0.04;
  transform: scale(1);
}
.mat-mdc-radio-button .mdc-radio:hover > .mdc-radio__native-control:not([disabled]) ~ .mdc-radio__background > .mdc-radio__outer-circle {
  border-color: var(--%NS%mat-radio-unselected-hover-icon-color, var(--%NS%mat-sys-on-surface));
}
.mat-mdc-radio-button .mdc-radio:hover > .mdc-radio__native-control:enabled:checked + .mdc-radio__background > .mdc-radio__outer-circle {
  border-color: var(--%NS%mat-radio-selected-hover-icon-color, var(--%NS%mat-sys-primary));
}
.mat-mdc-radio-button .mdc-radio:hover > .mdc-radio__native-control:enabled:checked + .mdc-radio__background > .mdc-radio__inner-circle {
  background-color: var(--%NS%mat-radio-selected-hover-icon-color, var(--%NS%mat-sys-primary, currentColor));
}
.mat-mdc-radio-button .mdc-radio:active > .mdc-radio__native-control:enabled:not(:checked) + .mdc-radio__background > .mdc-radio__outer-circle {
  border-color: var(--%NS%mat-radio-unselected-pressed-icon-color, var(--%NS%mat-sys-on-surface));
}
.mat-mdc-radio-button .mdc-radio:active > .mdc-radio__native-control:enabled:checked + .mdc-radio__background > .mdc-radio__outer-circle {
  border-color: var(--%NS%mat-radio-selected-pressed-icon-color, var(--%NS%mat-sys-primary));
}
.mat-mdc-radio-button .mdc-radio:active > .mdc-radio__native-control:enabled:checked + .mdc-radio__background > .mdc-radio__inner-circle {
  background-color: var(--%NS%mat-radio-selected-pressed-icon-color, var(--%NS%mat-sys-primary, currentColor));
}
.mat-mdc-radio-button .mdc-radio__background {
  display: inline-block;
  position: relative;
  box-sizing: border-box;
  width: 20px;
  height: 20px;
}
.mat-mdc-radio-button .mdc-radio__background::before {
  position: absolute;
  transform: scale(0, 0);
  border-radius: 50%;
  opacity: 0;
  pointer-events: none;
  content: "";
  transition: opacity 90ms cubic-bezier(0.4, 0, 0.6, 1), transform 90ms cubic-bezier(0.4, 0, 0.6, 1);
  width: var(--%NS%mat-radio-state-layer-size, 40px);
  height: var(--%NS%mat-radio-state-layer-size, 40px);
  top: calc(-1 * (var(--%NS%mat-radio-state-layer-size, 40px) - 20px) / 2);
  left: calc(-1 * (var(--%NS%mat-radio-state-layer-size, 40px) - 20px) / 2);
}
.mat-mdc-radio-button .mdc-radio__outer-circle {
  position: absolute;
  top: 0;
  left: 0;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  border-width: 2px;
  border-style: solid;
  border-radius: 50%;
  transition: border-color 90ms cubic-bezier(0.4, 0, 0.6, 1);
}
.mat-mdc-radio-button .mdc-radio__inner-circle {
  position: absolute;
  top: 0;
  left: 0;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  transform: scale(0);
  border-radius: 50%;
  transition: transform 90ms cubic-bezier(0.4, 0, 0.6, 1), background-color 90ms cubic-bezier(0.4, 0, 0.6, 1);
}
@media (forced-colors: active) {
  .mat-mdc-radio-button .mdc-radio__inner-circle {
    background-color: CanvasText !important;
  }
}
.mat-mdc-radio-button .mdc-radio__native-control {
  position: absolute;
  margin: 0;
  padding: 0;
  opacity: 0;
  top: 0;
  right: 0;
  left: 0;
  cursor: inherit;
  z-index: 1;
  width: var(--%NS%mat-radio-state-layer-size, 40px);
  height: var(--%NS%mat-radio-state-layer-size, 40px);
}
.mat-mdc-radio-button .mdc-radio__native-control:checked + .mdc-radio__background, .mat-mdc-radio-button .mdc-radio__native-control:disabled + .mdc-radio__background {
  transition: opacity 90ms cubic-bezier(0, 0, 0.2, 1), transform 90ms cubic-bezier(0, 0, 0.2, 1);
}
.mat-mdc-radio-button .mdc-radio__native-control:checked + .mdc-radio__background > .mdc-radio__outer-circle, .mat-mdc-radio-button .mdc-radio__native-control:disabled + .mdc-radio__background > .mdc-radio__outer-circle {
  transition: border-color 90ms cubic-bezier(0, 0, 0.2, 1);
}
.mat-mdc-radio-button .mdc-radio__native-control:checked + .mdc-radio__background > .mdc-radio__inner-circle, .mat-mdc-radio-button .mdc-radio__native-control:disabled + .mdc-radio__background > .mdc-radio__inner-circle {
  transition: transform 90ms cubic-bezier(0, 0, 0.2, 1), background-color 90ms cubic-bezier(0, 0, 0.2, 1);
}
.mat-mdc-radio-button .mdc-radio__native-control:focus + .mdc-radio__background::before {
  transform: scale(1);
  opacity: 0.12;
  transition: opacity 90ms cubic-bezier(0, 0, 0.2, 1), transform 90ms cubic-bezier(0, 0, 0.2, 1);
}
.mat-mdc-radio-button .mdc-radio__native-control:disabled:not(:checked) + .mdc-radio__background > .mdc-radio__outer-circle {
  border-color: var(--%NS%mat-radio-disabled-unselected-icon-color, var(--%NS%mat-sys-on-surface));
  opacity: var(--%NS%mat-radio-disabled-unselected-icon-opacity, 0.38);
}
.mat-mdc-radio-button .mdc-radio__native-control:disabled + .mdc-radio__background {
  cursor: default;
}
.mat-mdc-radio-button .mdc-radio__native-control:disabled + .mdc-radio__background > .mdc-radio__outer-circle {
  border-color: var(--%NS%mat-radio-disabled-selected-icon-color, var(--%NS%mat-sys-on-surface));
  opacity: var(--%NS%mat-radio-disabled-selected-icon-opacity, 0.38);
}
.mat-mdc-radio-button .mdc-radio__native-control:disabled + .mdc-radio__background > .mdc-radio__inner-circle {
  background-color: var(--%NS%mat-radio-disabled-selected-icon-color, var(--%NS%mat-sys-on-surface, currentColor));
  opacity: var(--%NS%mat-radio-disabled-selected-icon-opacity, 0.38);
}
.mat-mdc-radio-button .mdc-radio__native-control:enabled:not(:checked) + .mdc-radio__background > .mdc-radio__outer-circle {
  border-color: var(--%NS%mat-radio-unselected-icon-color, var(--%NS%mat-sys-on-surface-variant));
}
.mat-mdc-radio-button .mdc-radio__native-control:enabled:checked + .mdc-radio__background > .mdc-radio__outer-circle {
  border-color: var(--%NS%mat-radio-selected-icon-color, var(--%NS%mat-sys-primary));
}
.mat-mdc-radio-button .mdc-radio__native-control:enabled:checked + .mdc-radio__background > .mdc-radio__inner-circle {
  background-color: var(--%NS%mat-radio-selected-icon-color, var(--%NS%mat-sys-primary, currentColor));
}
.mat-mdc-radio-button .mdc-radio__native-control:enabled:focus:checked + .mdc-radio__background > .mdc-radio__outer-circle {
  border-color: var(--%NS%mat-radio-selected-focus-icon-color, var(--%NS%mat-sys-primary));
}
.mat-mdc-radio-button .mdc-radio__native-control:enabled:focus:checked + .mdc-radio__background > .mdc-radio__inner-circle {
  background-color: var(--%NS%mat-radio-selected-focus-icon-color, var(--%NS%mat-sys-primary, currentColor));
}
.mat-mdc-radio-button .mdc-radio__native-control:checked + .mdc-radio__background > .mdc-radio__inner-circle {
  transform: scale(0.5);
  transition: transform 90ms cubic-bezier(0, 0, 0.2, 1), background-color 90ms cubic-bezier(0, 0, 0.2, 1);
}
.mat-mdc-radio-button.mat-mdc-radio-disabled-interactive .mdc-radio--disabled {
  pointer-events: auto;
}
.mat-mdc-radio-button.mat-mdc-radio-disabled-interactive .mdc-radio--disabled .mdc-radio__native-control:not(:checked) + .mdc-radio__background > .mdc-radio__outer-circle {
  border-color: var(--%NS%mat-radio-disabled-unselected-icon-color, var(--%NS%mat-sys-on-surface));
  opacity: var(--%NS%mat-radio-disabled-unselected-icon-opacity, 0.38);
}
.mat-mdc-radio-button.mat-mdc-radio-disabled-interactive .mdc-radio--%NS%disabled:hover .mdc-radio__native-control:checked + .mdc-radio__background > .mdc-radio__outer-circle,
.mat-mdc-radio-button.mat-mdc-radio-disabled-interactive .mdc-radio--disabled .mdc-radio__native-control:checked:focus + .mdc-radio__background > .mdc-radio__outer-circle,
.mat-mdc-radio-button.mat-mdc-radio-disabled-interactive .mdc-radio--disabled .mdc-radio__native-control + .mdc-radio__background > .mdc-radio__outer-circle {
  border-color: var(--%NS%mat-radio-disabled-selected-icon-color, var(--%NS%mat-sys-on-surface));
  opacity: var(--%NS%mat-radio-disabled-selected-icon-opacity, 0.38);
}
.mat-mdc-radio-button.mat-mdc-radio-disabled-interactive .mdc-radio--%NS%disabled:hover .mdc-radio__native-control:checked + .mdc-radio__background > .mdc-radio__inner-circle,
.mat-mdc-radio-button.mat-mdc-radio-disabled-interactive .mdc-radio--disabled .mdc-radio__native-control:checked:focus + .mdc-radio__background > .mdc-radio__inner-circle,
.mat-mdc-radio-button.mat-mdc-radio-disabled-interactive .mdc-radio--disabled .mdc-radio__native-control + .mdc-radio__background > .mdc-radio__inner-circle {
  background-color: var(--%NS%mat-radio-disabled-selected-icon-color, var(--%NS%mat-sys-on-surface, currentColor));
  opacity: var(--%NS%mat-radio-disabled-selected-icon-opacity, 0.38);
}
.mat-mdc-radio-button._mat-animation-noopable .mdc-radio__background::before,
.mat-mdc-radio-button._mat-animation-noopable .mdc-radio__outer-circle,
.mat-mdc-radio-button._mat-animation-noopable .mdc-radio__inner-circle {
  transition: none !important;
}
.mat-mdc-radio-button .mat-internal-form-field-label:empty {
  display: none;
}
.mat-mdc-radio-button .mdc-radio__background::before {
  background-color: var(--%NS%mat-radio-ripple-color, var(--%NS%mat-sys-on-surface));
}
.mat-mdc-radio-button.mat-mdc-radio-checked .mat-ripple-element,
.mat-mdc-radio-button.mat-mdc-radio-checked .mdc-radio__background::before {
  background-color: var(--%NS%mat-radio-checked-ripple-color, var(--%NS%mat-sys-primary));
}
.mat-mdc-radio-button.mat-mdc-radio-disabled-interactive .mdc-radio--disabled .mat-ripple-element,
.mat-mdc-radio-button.mat-mdc-radio-disabled-interactive .mdc-radio--disabled .mdc-radio__background::before {
  background-color: var(--%NS%mat-radio-ripple-color, var(--%NS%mat-sys-on-surface));
}
.mat-mdc-radio-button .mat-internal-form-field {
  color: var(--%NS%mat-radio-label-text-color, var(--%NS%mat-sys-on-surface));
  font-family: var(--%NS%mat-radio-label-text-font, var(--%NS%mat-sys-body-medium-font));
  line-height: var(--%NS%mat-radio-label-text-line-height, var(--%NS%mat-sys-body-medium-line-height));
  font-size: var(--%NS%mat-radio-label-text-size, var(--%NS%mat-sys-body-medium-size));
  letter-spacing: var(--%NS%mat-radio-label-text-tracking, var(--%NS%mat-sys-body-medium-tracking));
  font-weight: var(--%NS%mat-radio-label-text-weight, var(--%NS%mat-sys-body-medium-weight));
  cursor: pointer;
}
.mat-mdc-radio-button .mdc-radio--disabled + .mat-internal-form-field-label {
  color: var(--%NS%mat-radio-disabled-label-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 38%, transparent));
}
.mat-mdc-radio-button .mat-radio-ripple {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  pointer-events: none;
  border-radius: 50%;
}
.mat-mdc-radio-button .mat-radio-ripple > .mat-ripple-element {
  opacity: 0.14;
}
.mat-mdc-radio-button .mat-radio-ripple::before {
  border-radius: 50%;
}
.mat-mdc-radio-button .mdc-radio > .mdc-radio__native-control:focus:enabled:not(:checked) ~ .mdc-radio__background > .mdc-radio__outer-circle {
  border-color: var(--%NS%mat-radio-unselected-focus-icon-color, var(--%NS%mat-sys-on-surface));
}
.mat-mdc-radio-button.cdk-focused .mat-focus-indicator::before {
  content: "";
}

.mat-mdc-radio-disabled {
  cursor: default;
  pointer-events: none;
}
.mat-mdc-radio-disabled.mat-mdc-radio-disabled-interactive {
  pointer-events: auto;
}

.mat-mdc-radio-touch-target {
  position: absolute;
  top: 50%;
  left: 50%;
  height: var(--%NS%mat-radio-touch-target-size, 48px);
  width: var(--%NS%mat-radio-touch-target-size, 48px);
  transform: translate(-50%, -50%);
  display: var(--%NS%mat-radio-touch-target-display, block);
}
[dir=rtl] .mat-mdc-radio-touch-target {
  left: auto;
  right: 50%;
  transform: translate(50%, -50%);
}
`],encapsulation:2})})()}return t})();var Ht=(()=>{class t{static ɵfac=function(i){return new(i||t)};static ɵmod=ee({type:t});static ɵinj=K$1({imports:[x_,Be,Ze$1]})}return t})();var ei$1=(t,a)=>a.id;function _i$1(t,a){t&1&&(Te(0,`div`,2),Ft(1,`No approved templates yet. Create or sync them in Templates.`),Me())}function gi$1(t,a){if(t&1&&(Te(0,`span`,12),Ft(1),Me()),t&2){let e=To().$implicit;le(),Mo(``,e.header,` header`)}}function bi$1(t,a){if(t&1&&(Te(0,`label`,4),hc(1,`mat-radio-button`,8),Te(2,`div`,9)(3,`div`,10),Ft(4),Te(5,`span`,11),Ft(6),Me(),yt$1(7,gi$1,2,1,`span`,12),Me(),Te(8,`div`,13),Ft(9),Me()()()),t&2){let e=a.$implicit,i=To();le(),Gi(`value`,e),le(3),Mo(``,e.name,` `),le(2),On(e.category),le(),vt$1(e.header&&e.header!==`none`?7:-1),le(2),On(i.preview(e))}}var hi$1=[`msgs`];var fi$1=[`ta`];var yi=(t,a)=>a[1];function vi$1(t,a){if(t&1){let e=xf();Te(0,`div`,4)(1,`button`,17),Nr(`click`,function(){Ea(e);let c=To();return wa$1(c.back.emit())}),Te(2,`mat-icon`),Ft(3,`arrow_back`),Me()(),hc(4,`k3-avatar`,18),Te(5,`div`,19)(6,`div`,20),Ft(7),Me(),Te(8,`div`,21),Ft(9),Me()(),hc(10,`k3-temp`,22),Te(11,`button`,23),Nr(`click`,function(){Ea(e);let c=To();return wa$1(c.openLead.emit(c.lead().id))}),Te(12,`mat-icon`),Ft(13,`open_in_new`),Me()()()}if(t&2){let e=To();le(4),Gi(`name`,e.lead().parent),le(3),On(e.lead().parent),le(2),Vy(``,e.lead().phone,` · `,e.lead().program),le(),Gi(`temp`,e.lead().ai?.temp)(`score`,e.lead().ai?.score)}}function xi(t,a){t&1&&(Te(0,`div`,6),Ft(1,`Loading conversation…`),Me())}function Ci(t,a){if(t&1&&(Te(0,`div`,24),Ft(1),Me()),t&2){let e=To().$implicit,i=To();le(),On(i.dayLabel(e.at))}}function ki(t,a){if(t&1&&Ft(0),t&2){let e=To(2).$implicit;Mo(` · `,e.template)}}function Si(t,a){if(t&1&&(Te(0,`div`,26)(1,`mat-icon`),Ft(2,`smart_toy`),Me(),Ft(3,`Auto-reply`),yt$1(4,ki,1,1),Me()),t&2){let e=To().$implicit;le(4),vt$1(e.template?4:-1)}}function wi(t,a){if(t&1&&(Te(0,`div`,26)(1,`mat-icon`),Ft(2,`article`),Me(),Ft(3),Me()),t&2){let e=To().$implicit;le(3),Mo(`Template · `,e.template)}}function Mi(t,a){t&1&&(Te(0,`div`,26)(1,`mat-icon`),Ft(2,`campaign`),Me(),Ft(3,`Broadcast`),Me())}function Ei(t,a){if(t&1&&hc(0,`img`,29),t&2){let e=To(2).$implicit;Gi(`src`,e.media.url)}}function Ii(t,a){if(t&1&&(Te(0,`div`,30)(1,`mat-icon`),Ft(2),Me(),Te(3,`span`,31),Ft(4),Me()()),t&2){let e=To(2).$implicit;le(2),On(e.media.type===`video`?`movie`:`picture_as_pdf`),le(2),On(e.media.name||`Attachment`)}}function Ti(t,a){if(t&1&&yt$1(0,Ei,1,1,`img`,29)(1,Ii,5,2,`div`,30),t&2){let e=To().$implicit;vt$1(e.media.type===`image`?0:1)}}function Di(t,a){if(t&1&&(Te(0,`div`,27),Ft(1),Me()),t&2){let e=To().$implicit;le(),On(e.error)}}function Ni(t,a){if(t&1&&(Te(0,`mat-icon`,32),Ft(1,`error`),Me()),t&2){let e=To(2).$implicit;Gi(`matTooltip`,e.error||`Failed`)}}function Fi(t,a){t&1&&(Te(0,`mat-icon`,33),Ft(1,`done_all`),Me())}function Pi(t,a){t&1&&(Te(0,`mat-icon`),Ft(1,`done_all`),Me())}function Ai(t,a){t&1&&(Te(0,`mat-icon`),Ft(1,`done`),Me())}function Oi(t,a){t&1&&(Te(0,`mat-icon`),Ft(1,`schedule`),Me())}function Ri(t,a){if(t&1&&yt$1(0,Ni,2,1,`mat-icon`,32)(1,Fi,2,0,`mat-icon`,33)(2,Pi,2,0,`mat-icon`)(3,Ai,2,0,`mat-icon`)(4,Oi,2,0,`mat-icon`),t&2){let e,i=To().$implicit;vt$1((e=i.status)===`failed`?0:e===`read`?1:e===`delivered`?2:e===`sent`?3:4)}}function Li(t,a){if(t&1&&(yt$1(0,Ci,2,1,`div`,24),Te(1,`div`,25),yt$1(2,Si,5,1,`div`,26)(3,wi,4,1,`div`,26)(4,Mi,4,0,`div`,26),yt$1(5,Ti,2,1),Ft(6),yt$1(7,Di,2,1,`div`,27),Te(8,`span`,28),Ft(9),yt$1(10,Ri,5,1),Me()()),t&2){let e=a.$implicit,i=a.$index,c=To();vt$1(i===0||c.day(e.at)!==c.day(c.messages()[i-1].at)?0:-1),le(),ve(`out`,e.from!==`lead`)(`in`,e.from===`lead`),le(),vt$1(e.from===`bot`?2:e.type===`template`?3:e.type===`broadcast`?4:-1),le(3),vt$1(e.media?5:-1),le(),Mo(` `,e.text,` `),le(),vt$1(e.status===`failed`&&e.error?7:-1),le(2),Mo(``,c.time(e.at),` `),le(),vt$1(e.from!==`lead`?10:-1)}}function Bi(t,a){if(t&1){let e=xf();Te(0,`button`,34),Nr(`click`,function(){Ea(e);let c=To();return wa$1(c.use(c.ai().msg))}),Te(1,`mat-icon`),Ft(2,`auto_awesome`),Me(),Te(3,`b`),Ft(4),Me(),Ft(5),Me()}if(t&2){let e=To();Gi(`title`,e.ai().msg),le(4),Mo(`AI · `,e.ai().intent,`:`),le(),Mo(`\xA0`,e.short(e.ai().msg))}}function zi(t,a){if(t&1){let e=xf();Te(0,`button`,35),Nr(`click`,function(){let c=Ea(e).$implicit,l=To();return wa$1(l.use(c[2]))}),Te(1,`mat-icon`),Ft(2),Me(),Ft(3),Me()}if(t&2){let e=a.$implicit;le(2),On(e[0]),le(),On(e[1])}}function Vi(t,a){if(t&1&&hc(0,`img`,29),t&2){let e=To(2);Gi(`src`,e.attach().url)}}function Wi(t,a){if(t&1&&(Te(0,`mat-icon`),Ft(1),Me()),t&2){let e=To(2);le(),On(e.attach().type===`video`?`movie`:`description`)}}function qi(t,a){if(t&1){let e=xf();Te(0,`div`,9),yt$1(1,Vi,1,1,`img`,29)(2,Wi,2,1,`mat-icon`),Te(3,`span`,36),Ft(4),Me(),Te(5,`button`,37),Nr(`click`,function(){Ea(e);let c=To();return wa$1(c.attach.set(null))}),Te(6,`mat-icon`),Ft(7,`close`),Me()()()}if(t&2){let e=To();le(),vt$1(e.attach().type===`image`?1:2),le(3),On(e.attach().name)}}var Xe=class t{data=f$1(Vp);s=f$1(Mi$1);pick=this.data.templates[0];preview(a){let e=Ic(a,this.data.lead,this.s.meta());return e.length>160?e.slice(0,158)+`…`:e}static ɵfac=function(e){return new(e||t)};static ɵcmp=te({type:t,selectors:[[`k3-template-pick`]],decls:16,vars:4,consts:[[`mat-dialog-title`,``],[1,`muted`,`small`,2,`margin-top`,`0`],[1,`empty`],[1,`col`,2,`gap`,`6px`,3,`ngModelChange`,`ngModel`],[1,`list-item`,2,`align-items`,`flex-start`],[`align`,`end`],[`mat-button`,``,`mat-dialog-close`,``],[`mat-flat-button`,``,3,`disabled`,`mat-dialog-close`],[3,`value`],[1,`meta`],[1,`name`,`mono`,2,`font-size`,`13px`],[1,`pill`,`p-grey`],[1,`pill`,`p-blue`],[1,`small`,`muted`,2,`white-space`,`pre-wrap`]],template:function(e,i){e&1&&(Te(0,`h2`,0),Ft(1,`Send WhatsApp template`),Me(),Te(2,`mat-dialog-content`)(3,`p`,1),Ft(4,`Approved templates can be sent anytime — even outside the 24-hour customer-care window.`),Me(),yt$1(5,_i$1,2,0,`div`,2),Te(6,`mat-radio-group`,3),ES(),zy(`ngModelChange`,function(l){return bx(i.pick,l)||(i.pick=l),l}),PI(7,bi$1,10,5,`label`,4,ei$1),Me()(),Te(9,`mat-dialog-actions`,5)(10,`button`,6),Ft(11,`Cancel`),Me(),Te(12,`button`,7)(13,`mat-icon`),Ft(14,`send`),Me(),Ft(15,`Send`),Me()()),e&2&&(le(5),vt$1(i.data.templates.length?-1:5),le(),$y(`ngModel`,i.pick),CS(),le(),FI(i.data.templates),le(5),Gi(`disabled`,!i.pick)(`mat-dialog-close`,i.pick))},dependencies:[iD,J_,tD,rD,nD,Ep,Qc,Ht,Je$1,Be,Mn$1,Vn,Yt,Wv,zv],encapsulation:2})};var ze=class t{api=f$1(Gt);s=f$1(Mi$1);ui=f$1(cD);lead=av.required();header=av(!0);back=HU();openLead=HU();sent=HU();messages=Le$1([]);loading=Le$1(!0);attach=Le$1(null);ai=Le$1(null);windowOpen=Le$1(!0);text=``;box=UU(`msgs`);ta=UU(`ta`);time=Vn$1;day=a=>new Date(a).toDateString();dayLabel=a=>bc$1(a)?`Today`:new Date(a).toLocaleDateString(`en-IN`,{day:`numeric`,month:`long`,year:`numeric`});short=a=>a.length>60?a.slice(0,58)+`…`:a;blocked=()=>!!this.lead().optedOut||!this.windowOpen();quick=()=>[[`payments`,`Share fee structure`,`Sharing the fee structure for `+this.lead().program+` 📄 Early-bird waiver of 10% is valid till 30 Nov.`],[`apartment`,`Book campus visit`,`Would you like to visit our campus? Tours run Mon–Sat, 10 AM–1 PM. Shall I book Saturday 11 AM?`]];constructor(){xi$1(()=>{let e=this.lead();this.windowOpen.set(e.windowOpen!==!1),this.load(e.id)});let a=this.s.events.subscribe(({type:e,data:i})=>{if(e===`message`&&i.leadId===this.lead().id){if(this.messages().some(c=>c.id===i.message.id))return;this.messages.update(c=>[...c,i.message]),this.scroll(),i.message.from===`lead`&&(this.lead().optedOut||this.windowOpen.set(!0),this.suggest())}e===`status`&&this.messages.update(c=>c.map(l=>l.id===i.messageId||l.wamid===i.wamid?Object.assign({},l,{status:i.status,error:i.error}):l))});f$1(Se).onDestroy(()=>a.unsubscribe())}async load(a){this.loading.set(!0),this.ai.set(null);try{this.messages.set(await this.api.messages(a))}catch(e){this.ui.error(e)}this.loading.set(!1),this.scroll(),this.suggest(),this.s.refreshBadges()}async suggest(){let a=[...this.messages()].reverse().find(e=>e.from===`lead`);if(a)try{let e=await this.api.classify(a.text);this.ai.set({intent:e.intent,msg:String(e.suggestedReply||``).replace(`{{program}}`,this.lead().program)})}catch{}}scroll(){setTimeout(()=>{let a=this.box()?.nativeElement;a&&(a.scrollTop=a.scrollHeight)})}use(a){this.text=a,setTimeout(()=>{this.ta()?.nativeElement.focus(),this.grow()})}grow(){let a=this.ta()?.nativeElement;a&&(a.style.height=`auto`,a.style.height=Math.min(120,a.scrollHeight)+`px`)}enter(a){let e=a;e.shiftKey||(e.preventDefault(),this.send())}async onFile(a){let e=a.target,i=e.files?.[0];if(e.value=``,!!i)try{let c=await this.api.upload(i);this.attach.set(Object.assign({name:i.name},c))}catch(c){this.ui.error(c)}}async send(a){let e=a?a.text:this.text.trim(),i=this.attach();if(!e&&!i)return;let c=a||{type:i?`media`:`text`,text:e,media:i||void 0};a||(this.text=``),this.attach.set(null),setTimeout(()=>this.grow());try{let l=await this.api.send(this.lead().id,c);this.messages().some(m=>m.id===l.id)||this.messages.update(m=>[...m,l]),this.scroll(),this.sent.emit(l)}catch(l){this.ui.error(l),e&&!a&&(this.text=e)}}async sendTemplate(){let a=(await this.api.templates()).filter(e=>e.status===`Approved`);this.ui.open(Xe,{templates:a,lead:this.lead()},{width:`600px`}).afterClosed().subscribe(e=>{if(!e)return;let i=e.header&&e.header!==`none`;if(i&&!this.attach()){this.ui.toast(`\u201C${e.name}\u201D has a ${e.header} header \u2014 attach a creative first (\u{1F4CE}), then send the template.`);return}this.send({type:`template`,template:e.name,text:Ic(e,this.lead(),this.s.meta()),media:i?this.attach():void 0})})}static ɵfac=function(e){return new(e||t)};static ɵcmp=te({type:t,selectors:[[`k3-chat`]],viewQuery:function(e,i){e&1&&Ay(i.box,hi$1,5)(i.ta,fi$1,5),e&2&&WI(2)},inputs:{lead:[1,`lead`],header:[1,`header`]},outputs:{back:`back`,openLead:`openLead`,sent:`sent`},decls:26,vars:10,consts:[[`msgs`,``],[`file`,``],[`ta`,``],[1,`chat`],[1,`chat-h`],[1,`msgs`],[1,`empty`,`small`],[1,`suggest`],[3,`title`],[1,`attach-prev`],[1,`composer`],[`mat-icon-button`,``,`matTooltip`,`Send template`,3,`click`,`disabled`],[`mat-icon-button`,``,`matTooltip`,`Attach creative`,3,`click`,`disabled`],[`type`,`file`,`hidden`,``,`accept`,`image/*,video/*,application/pdf`,3,`change`],[`rows`,`1`,3,`ngModelChange`,`keydown.enter`,`input`,`ngModel`,`disabled`,`placeholder`],[`mat-mini-fab`,``,`aria-label`,`Send`,1,`send-btn`,3,`click`,`disabled`],[1,`fill`],[`mat-icon-button`,``,`aria-label`,`Back`,1,`back-btn`,3,`click`],[`size`,`md`,3,`name`],[1,`grow`,2,`min-width`,`0`],[1,`title-s`,`ellipsis`],[1,`small`,`muted`,`ellipsis`],[1,`hide-xs`,3,`temp`,`score`],[`mat-icon-button`,``,`matTooltip`,`Open lead`,3,`click`],[1,`daysep`],[1,`bub`],[1,`tag`],[1,`small`,2,`color`,`var(--k3-bad)`,`margin-top`,`4px`],[1,`tm`],[`alt`,``,3,`src`],[1,`doc`],[1,`small`],[2,`color`,`var(--k3-bad)`,3,`matTooltip`],[1,`read`],[3,`click`,`title`],[3,`click`],[1,`grow`,`ellipsis`],[`mat-icon-button`,``,`aria-label`,`Remove attachment`,3,`click`]],template:function(e,i){if(e&1){let c=xf();Te(0,`div`,3),yt$1(1,vi$1,14,6,`div`,4),Te(2,`div`,5,0),yt$1(4,xi,2,0,`div`,6),PI(5,Li,11,11,null,null,ei$1),Me(),Te(7,`div`,7),yt$1(8,Bi,6,3,`button`,8),PI(9,zi,4,2,`button`,null,yi),Me(),yt$1(11,qi,8,2,`div`,9),Te(12,`div`,10)(13,`button`,11),Nr(`click`,function(){return i.sendTemplate()}),Te(14,`mat-icon`),Ft(15,`article`),Me()(),Te(16,`button`,12),Nr(`click`,function(){Ea(c);let m=GI(20);return wa$1(m.click())}),Te(17,`mat-icon`),Ft(18,`attach_file`),Me()(),Te(19,`input`,13,1),Nr(`change`,function(m){return i.onFile(m)}),Me(),Te(21,`textarea`,14,2),ES(),zy(`ngModelChange`,function(m){return Ea(c),bx(i.text,m)||(i.text=m),wa$1(m)}),Nr(`keydown.enter`,function(m){return i.enter(m)})(`input`,function(){return i.grow()}),Me(),Te(23,`button`,15),Nr(`click`,function(){return i.send()}),Te(24,`mat-icon`,16),Ft(25,`send`),Me()()()()}e&2&&(le(),vt$1(i.header()?1:-1),le(3),vt$1(i.loading()?4:-1),le(),FI(i.messages()),le(3),vt$1(i.ai()?8:-1),le(),FI(i.quick()),le(2),vt$1(i.attach()?11:-1),le(2),Gi(`disabled`,i.lead().optedOut),le(3),Gi(`disabled`,i.blocked()),le(5),$y(`ngModel`,i.text),Gi(`disabled`,i.blocked())(`placeholder`,i.lead().optedOut?`Contact opted out of WhatsApp`:i.windowOpen()?`Type a message`:`Chat window closed · send a template`),CS(),le(2),Gi(`disabled`,i.blocked()||!i.text.trim()&&!i.attach()))},dependencies:[Mn$1,Pe,Vn,Yt,Wv,zv,Ep,H4,JT,Vt,_t$1,De,ie$2],styles:[`[_nghost-%COMP%]{display:flex;flex-direction:column;min-height:0;height:100%}.chat-h[_ngcontent-%COMP%]{display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--%NS%mat-sys-surface);border-bottom:1px solid var(--%NS%mat-sys-outline-variant)}.title-s[_ngcontent-%COMP%]{font:var(--%NS%mat-sys-title-small)}.attach-prev[_ngcontent-%COMP%]{display:flex;align-items:center;gap:10px;padding:6px 12px;background:#f0f2f5;font:var(--%NS%mat-sys-body-small)}.attach-prev[_ngcontent-%COMP%]   img[_ngcontent-%COMP%]{width:44px;height:44px;object-fit:cover;border-radius:6px}.send-btn[_ngcontent-%COMP%]{background:var(--%NS%k3-wa)!important;color:#fff!important;flex:none}.send-btn[disabled][_ngcontent-%COMP%]{opacity:.5}.back-btn[_ngcontent-%COMP%]{display:none}@media(max-width:860px){.back-btn[_ngcontent-%COMP%]{display:inline-flex}}@media(max-width:420px){.hide-xs[_ngcontent-%COMP%]{display:none}}`]})};var Ui=(t,a)=>a.value;function Qi(t,a){if(t&1&&(Te(0,`mat-option`,3),Ft(1),Me()),t&2){let e=a.$implicit;Gi(`value`,e.value),le(),On(e.label)}}function Hi(t,a){if(t&1&&(Te(0,`p`,4),Ft(1),Me()),t&2){let e=To();le(),On(e.d.note)}}var Ki=(t,a)=>a[0];var ti$1=(t,a)=>a.id;function Zi(t,a){if(t&1&&(Te(0,`mat-option`,5),Ft(1),Me()),t&2){let e=a.$implicit;Gi(`value`,e.id),le(),Hy(``,e.student,` — `,e.parent,` (`,e.program,`)`)}}function Yi(t,a){if(t&1){let e=xf();Te(0,`mat-form-field`,1)(1,`mat-label`),Ft(2,`Lead`),Me(),Te(3,`mat-select`,4),ES(),zy(`ngModelChange`,function(c){Ea(e);let l=To();return bx(l.leadId,c)||(l.leadId=c),wa$1(c)}),PI(4,Zi,2,4,`mat-option`,5,ti$1),Me()()}if(t&2){let e=To();le(3),$y(`ngModel`,e.leadId),CS(),le(),FI(e.leads())}}function Ji(t,a){if(t&1&&(Te(0,`mat-option`,5),Ft(1),Me()),t&2){let e=a.$implicit;Gi(`value`,e[0]),le(),On(e[1].label)}}function Xi(t,a){if(t&1&&(Te(0,`mat-option`,5),Ft(1),Me()),t&2){let e=a.$implicit;Gi(`value`,e.id),le(),On(e.name)}}function en(t,a){if(t&1){let e=xf();Te(0,`div`,2)(1,`mat-form-field`,7)(2,`mat-label`),Ft(3,`Field`),Me(),Te(4,`input`,8),ES(),zy(`ngModelChange`,function(c){let l=Ea(e).$implicit;return bx(l.k,c)||(l.k=c),wa$1(c)}),Me()(),Te(5,`mat-form-field`,9)(6,`mat-label`),Ft(7,`Value`),Me(),Te(8,`input`,10),ES(),zy(`ngModelChange`,function(c){let l=Ea(e).$implicit;return bx(l.v,c)||(l.v=c),wa$1(c)}),Me()(),Te(9,`button`,11),Nr(`click`,function(){let c=Ea(e).$index,l=To();return wa$1(l.rows.splice(c,1))}),Te(10,`mat-icon`),Ft(11,`delete`),Me()()()}if(t&2){let e=a.$implicit;le(4),$y(`ngModel`,e.k),CS(),le(4),$y(`ngModel`,e.v),CS()}}function tn(t,a){if(t&1&&(Te(0,`mat-option`,6),Ft(1),Me()),t&2){let e=a.$implicit;Gi(`value`,e),le(),On(e)}}var nn=t=>(/* @__PURE__ */ new Date(t.getTime()-t.getTimezoneOffset()*6e4)).toISOString().slice(0,16);var Ve=class t{d=f$1(Vp);value=this.d.value??this.d.options[0]?.value;static ɵfac=function(e){return new(e||t)};static ɵcmp=te({type:t,selectors:[[`k3-pick`]],decls:15,vars:7,consts:[[`mat-dialog-title`,``],[`appearance`,`outline`,1,`full`],[3,`ngModelChange`,`ngModel`],[3,`value`],[1,`muted`,`small`,2,`margin`,`0`],[`align`,`end`],[`mat-button`,``,`mat-dialog-close`,``],[`mat-flat-button`,``,3,`mat-dialog-close`,`disabled`]],template:function(e,i){e&1&&(Te(0,`h2`,0),Ft(1),Me(),Te(2,`mat-dialog-content`)(3,`mat-form-field`,1)(4,`mat-label`),Ft(5),Me(),Te(6,`mat-select`,2),ES(),zy(`ngModelChange`,function(l){return bx(i.value,l)||(i.value=l),l}),PI(7,Qi,2,2,`mat-option`,3,Ui),Me()(),yt$1(9,Hi,2,1,`p`,4),Me(),Te(10,`mat-dialog-actions`,5)(11,`button`,6),Ft(12,`Cancel`),Me(),Te(13,`button`,7),Ft(14),Me()()),e&2&&(le(),On(i.d.title),le(4),On(i.d.label),le(),$y(`ngModel`,i.value),CS(),le(),FI(i.d.options),le(2),vt$1(i.d.note?9:-1),le(4),Gi(`mat-dialog-close`,i.value)(`disabled`,!i.value),le(),On(i.d.ok||`OK`))},dependencies:[Mn$1,Vn,Yt,iD,J_,tD,rD,nD,Ep,Qc,Fe,bt,we$1,rr,_n$1,yn$2,ee$1,Wv],encapsulation:2})};var We=class t{s=f$1(Mi$1);api=f$1(Gt);ui=f$1(cD);ref=f$1(vs);lead=f$1(Vp)?.lead;leads=Le$1([]);busy=Le$1(!1);types=Object.entries(hc$1);type=`call`;note=``;leadId=``;owner=this.lead?.counsellorId||this.s.meta().counsellors?.[0]?.id;due=(()=>{let a=new Date(Date.now()+72e5);return a.setMinutes(0),nn(a)})();constructor(){this.lead||this.api.leads().then(a=>{let e=a.filter(i=>![`admitted`,`lost`].includes(i.stage));this.leads.set(e),this.leadId=e[0]?.id||``})}async save(){this.busy.set(!0);try{let a=await this.api.createFollowup({leadId:this.lead?this.lead.id:this.leadId,type:this.type,due:new Date(this.due).toISOString(),note:this.note||hc$1[this.type].label+` follow-up`,owner:this.owner});this.ui.toast(`Follow-up scheduled`),this.s.refreshBadges(),this.ref.close(a)}catch(a){this.ui.error(a)}this.busy.set(!1)}static ɵfac=function(e){return new(e||t)};static ɵcmp=te({type:t,selectors:[[`k3-followup`]],decls:30,vars:7,consts:[[`mat-dialog-title`,``],[`appearance`,`outline`,1,`full`],[1,`grid`,`g-2`,2,`gap`,`0 12px`],[`appearance`,`outline`],[3,`ngModelChange`,`ngModel`],[3,`value`],[`matInput`,``,`type`,`datetime-local`,3,`ngModelChange`,`ngModel`],[`matInput`,``,`placeholder`,`e.g. Discuss transport & fee instalments`,3,`ngModelChange`,`ngModel`],[`align`,`end`],[`mat-button`,``,`mat-dialog-close`,``],[`mat-flat-button`,``,3,`click`,`disabled`]],template:function(e,i){e&1&&(Te(0,`h2`,0),Ft(1),Me(),Te(2,`mat-dialog-content`),yt$1(3,Yi,6,1,`mat-form-field`,1),Te(4,`div`,2)(5,`mat-form-field`,3)(6,`mat-label`),Ft(7,`Type`),Me(),Te(8,`mat-select`,4),ES(),zy(`ngModelChange`,function(l){return bx(i.type,l)||(i.type=l),l}),PI(9,Ji,2,2,`mat-option`,5,Ki),Me()(),Te(11,`mat-form-field`,3)(12,`mat-label`),Ft(13,`Due`),Me(),Te(14,`input`,6),ES(),zy(`ngModelChange`,function(l){return bx(i.due,l)||(i.due=l),l}),Me()()(),Te(15,`mat-form-field`,1)(16,`mat-label`),Ft(17,`Note`),Me(),Te(18,`input`,7),ES(),zy(`ngModelChange`,function(l){return bx(i.note,l)||(i.note=l),l}),Me()(),Te(19,`mat-form-field`,1)(20,`mat-label`),Ft(21,`Owner`),Me(),Te(22,`mat-select`,4),ES(),zy(`ngModelChange`,function(l){return bx(i.owner,l)||(i.owner=l),l}),PI(23,Xi,2,2,`mat-option`,5,ti$1),Me()()(),Te(25,`mat-dialog-actions`,8)(26,`button`,9),Ft(27,`Cancel`),Me(),Te(28,`button`,10),Nr(`click`,function(){return i.save()}),Ft(29,`Schedule`),Me()()),e&2&&(le(),On(i.lead?`Follow-up · `+i.lead.parent:`Add follow-up`),le(2),vt$1(i.lead?-1:3),le(5),$y(`ngModel`,i.type),CS(),le(),FI(i.types),le(5),$y(`ngModel`,i.due),CS(),le(4),$y(`ngModel`,i.note),CS(),le(4),$y(`ngModel`,i.owner),CS(),le(),FI(i.s.meta().counsellors),le(5),Gi(`disabled`,i.busy()||!(i.lead||i.leadId)))},dependencies:[Mn$1,Pe,Vn,Yt,iD,J_,tD,rD,nD,Ep,Qc,Fe,bt,we$1,rr,ir,_n$1,yn$2,ee$1,Wv],encapsulation:2})};var qe=class t{ref=f$1(vs);rows=Object.entries(f$1(Vp).custom||{}).map(([a,e])=>({k:a,v:String(e)}));constructor(){this.rows.length||this.rows.push({k:``,v:``})}done(){let a={};for(let e of this.rows)e.k.trim()&&e.v.trim()&&(a[e.k.trim()]=e.v.trim());this.ref.close(a)}static ɵfac=function(e){return new(e||t)};static ɵcmp=te({type:t,selectors:[[`k3-custom-fields`]],decls:16,vars:1,consts:[[`mat-dialog-title`,``],[1,`small`,`muted`,2,`margin-top`,`0`],[1,`row`],[`mat-button`,``,2,`margin-top`,`8px`,3,`click`],[`align`,`end`],[`mat-button`,``,`mat-dialog-close`,``],[`mat-flat-button`,``,3,`click`],[`appearance`,`outline`,`subscriptSizing`,`dynamic`,2,`flex`,`1`],[`matInput`,``,`placeholder`,`roll_no`,3,`ngModelChange`,`ngModel`],[`appearance`,`outline`,`subscriptSizing`,`dynamic`,2,`flex`,`1.4`],[`matInput`,``,3,`ngModelChange`,`ngModel`],[`mat-icon-button`,``,`aria-label`,`Remove`,3,`click`]],template:function(e,i){e&1&&(Te(0,`h2`,0),Ft(1,`Custom fields`),Me(),Te(2,`mat-dialog-content`)(3,`p`,1),Ft(4),Me(),PI(5,en,12,2,`div`,2,RI),Te(7,`button`,3),Nr(`click`,function(){return i.rows.push({k:``,v:``})}),Te(8,`mat-icon`),Ft(9,`add`),Me(),Ft(10,`Add field`),Me()(),Te(11,`mat-dialog-actions`,4)(12,`button`,5),Ft(13,`Cancel`),Me(),Te(14,`button`,6),Nr(`click`,function(){return i.done()}),Ft(15,`Save`),Me()()),e&2&&(le(4),Mo(`Map these to template variables in Templates → Variables (e.g. `,2,` = roll_no). CSV imports and website forms fill them automatically from extra columns.`),le(),FI(i.rows))},dependencies:[Mn$1,Pe,Vn,Yt,iD,J_,tD,rD,nD,Ep,Qc,JT,Fe,bt,we$1,rr,ir,_n$1,Wv,zv],encapsulation:2})};var Ge=class t{l=f$1(Vp);outcomes=[`Connected — interested`,`Connected — needs time`,`Visit booked`,`No answer`,`Not interested`];o=this.outcomes[0];static ɵfac=function(e){return new(e||t)};static ɵcmp=te({type:t,selectors:[[`k3-call`]],decls:19,vars:5,consts:[[`mat-dialog-title`,``],[1,`tnum`,2,`font`,`var(--mat-sys-headline-small)`,`margin`,`4px 0 12px`],[3,`href`],[1,`muted`,`small`],[`appearance`,`outline`,1,`full`],[3,`ngModelChange`,`ngModel`],[3,`value`],[`align`,`end`],[`mat-button`,``,`mat-dialog-close`,``],[`mat-flat-button`,``,3,`mat-dialog-close`]],template:function(e,i){e&1&&(Te(0,`h2`,0),Ft(1),Me(),Te(2,`mat-dialog-content`)(3,`p`,1)(4,`a`,2),Ft(5),Me()(),Te(6,`p`,3),Ft(7,`Tap the number to call from your phone. After the call, log the outcome:`),Me(),Te(8,`mat-form-field`,4)(9,`mat-label`),Ft(10,`Outcome`),Me(),Te(11,`mat-select`,5),ES(),zy(`ngModelChange`,function(l){return bx(i.o,l)||(i.o=l),l}),PI(12,tn,2,2,`mat-option`,6,OI),Me()()(),Te(14,`mat-dialog-actions`,7)(15,`button`,8),Ft(16,`Cancel`),Me(),Te(17,`button`,9),Ft(18,`Log call`),Me()()),e&2&&(le(),Mo(`Call `,i.l.parent),le(3),Gi(`href`,`tel:`+i.l.phone.replace(/\s/g,``),ub),le(),On(i.l.phone),le(6),$y(`ngModel`,i.o),CS(),le(),FI(i.outcomes),le(5),Gi(`mat-dialog-close`,i.o))},dependencies:[Mn$1,Vn,Yt,iD,J_,tD,rD,nD,Ep,Qc,Fe,bt,we$1,rr,_n$1,yn$2,ee$1,Wv],encapsulation:2})};var an=new g(`mat-progress-spinner-default-options`,{providedIn:`root`,factory:()=>({diameter:ii$1})});var ii$1=100;var rn=10;var ni$1=(()=>{class t{_elementRef=f$1(B);_noopAnimations;get color(){return this._color||this._defaultColor}set color(e){this._color=e}_color;_defaultColor=`primary`;_determinateCircle;constructor(){let e=f$1(an),i=GT(),c=this._elementRef.nativeElement;this._noopAnimations=i===`di-disabled`&&!!e&&!e._forceAnimations,this.mode=c.nodeName.toLowerCase()===`mat-spinner`?`indeterminate`:`determinate`,!this._noopAnimations&&i===`reduced-motion`&&c.classList.add(`mat-progress-spinner-reduced-motion`),e&&(e.color&&(this.color=this._defaultColor=e.color),e.diameter&&(this.diameter=e.diameter),e.strokeWidth&&(this.strokeWidth=e.strokeWidth))}mode;get value(){return this.mode===`determinate`?this._value:0}set value(e){this._value=Math.max(0,Math.min(100,e||0))}_value=0;get diameter(){return this._diameter}set diameter(e){this._diameter=e||0}_diameter=ii$1;get strokeWidth(){return this._strokeWidth??this.diameter/10}set strokeWidth(e){this._strokeWidth=e||0}_strokeWidth;_circleRadius(){return(this.diameter-rn)/2}_viewBox(){let e=this._circleRadius()*2+this.strokeWidth;return`0 0 ${e} ${e}`}_strokeCircumference(){return 2*Math.PI*this._circleRadius()}_strokeDashOffset(){return this.mode===`determinate`?this._strokeCircumference()*(100-this._value)/100:null}_circleStrokeWidth(){return this.strokeWidth/this.diameter*100}static ɵfac=function(i){return new(i||t)};static ɵcmp=(function(){let e=[`determinateSpinner`];function i(c,l){if(c&1&&(Ih(),Te(0,`svg`,11),hc(1,`circle`,12),Me()),c&2){let m=To();Be$1(`viewBox`,m._viewBox()),le(),Tf(`stroke-dasharray`,m._strokeCircumference(),`px`)(`stroke-dashoffset`,m._strokeCircumference()/2,`px`)(`stroke-width`,m._circleStrokeWidth(),`%`),Be$1(`r`,m._circleRadius())}}return te({type:t,selectors:[[`mat-progress-spinner`],[`mat-spinner`]],viewQuery:function(l,m){if(l&1&&Ar(e,5),l&2){let g;kr(g=Rr())&&(m._determinateCircle=g.first)}},hostAttrs:[`role`,`progressbar`,`tabindex`,`-1`,1,`mat-mdc-progress-spinner`,`mdc-circular-progress`],hostVars:18,hostBindings:function(l,m){l&2&&(Be$1(`aria-valuemin`,0)(`aria-valuemax`,100)(`aria-valuenow`,m.mode===`determinate`?m.value:null)(`mode`,m.mode),Zi$1(`mat-`+m.color),Tf(`width`,m.diameter,`px`)(`height`,m.diameter,`px`)(`--%NS%mat-progress-spinner-size`,m.diameter+`px`)(`--%NS%mat-progress-spinner-active-indicator-width`,m.diameter+`px`),ve(`_mat-animation-noopable`,m._noopAnimations)(`mdc-circular-progress--indeterminate`,m.mode===`indeterminate`))},inputs:{color:`color`,mode:`mode`,value:[2,`value`,`value`,Bf],diameter:[2,`diameter`,`diameter`,Bf],strokeWidth:[2,`strokeWidth`,`strokeWidth`,Bf]},exportAs:[`matProgressSpinner`],decls:14,vars:11,consts:[[`circle`,``],[`determinateSpinner`,``],[`aria-hidden`,`true`,1,`mdc-circular-progress__determinate-container`],[`xmlns`,`http://www.w3.org/2000/svg`,`focusable`,`false`,1,`mdc-circular-progress__determinate-circle-graphic`],[`cx`,`50%`,`cy`,`50%`,1,`mdc-circular-progress__determinate-circle`],[`aria-hidden`,`true`,1,`mdc-circular-progress__indeterminate-container`],[1,`mdc-circular-progress__spinner-layer`],[1,`mdc-circular-progress__circle-clipper`,`mdc-circular-progress__circle-left`],[3,`ngTemplateOutlet`],[1,`mdc-circular-progress__gap-patch`],[1,`mdc-circular-progress__circle-clipper`,`mdc-circular-progress__circle-right`],[`xmlns`,`http://www.w3.org/2000/svg`,`focusable`,`false`,1,`mdc-circular-progress__indeterminate-circle-graphic`],[`cx`,`50%`,`cy`,`50%`]],template:function(l,m){if(l&1&&(Rn(0,i,2,8,`ng-template`,null,0,Ax),Te(2,`div`,2,1),Ih(),Te(4,`svg`,3),hc(5,`circle`,4),Me()(),xh(),Te(6,`div`,5)(7,`div`,6)(8,`div`,7),Sy(9,8),Me(),Te(10,`div`,9),Sy(11,8),Me(),Te(12,`div`,10),Sy(13,8),Me()()()),l&2){let g=GI(1);le(4),Be$1(`viewBox`,m._viewBox()),le(),Tf(`stroke-dasharray`,m._strokeCircumference(),`px`)(`stroke-dashoffset`,m._strokeDashOffset(),`px`)(`stroke-width`,m._circleStrokeWidth(),`%`),Be$1(`r`,m._circleRadius()),le(4),Gi(`ngTemplateOutlet`,g),le(2),Gi(`ngTemplateOutlet`,g),le(2),Gi(`ngTemplateOutlet`,g)}},dependencies:[w0],styles:[`.mat-mdc-progress-spinner {
  --%NS%mat-progress-spinner-animation-multiplier: 1;
  display: block;
  overflow: hidden;
  line-height: 0;
  position: relative;
  direction: ltr;
  transition: opacity 250ms cubic-bezier(0.4, 0, 0.6, 1);
}
.mat-mdc-progress-spinner circle {
  stroke-width: var(--%NS%mat-progress-spinner-active-indicator-width, 4px);
}
.mat-mdc-progress-spinner._mat-animation-noopable, .mat-mdc-progress-spinner._mat-animation-noopable .mdc-circular-progress__determinate-circle {
  transition: none !important;
}
.mat-mdc-progress-spinner._mat-animation-noopable .mdc-circular-progress__indeterminate-circle-graphic,
.mat-mdc-progress-spinner._mat-animation-noopable .mdc-circular-progress__spinner-layer,
.mat-mdc-progress-spinner._mat-animation-noopable .mdc-circular-progress__indeterminate-container {
  animation: none !important;
}
.mat-mdc-progress-spinner._mat-animation-noopable .mdc-circular-progress__indeterminate-container circle {
  stroke-dasharray: 0 !important;
}
@media (forced-colors: active) {
  .mat-mdc-progress-spinner .mdc-circular-progress__indeterminate-circle-graphic,
  .mat-mdc-progress-spinner .mdc-circular-progress__determinate-circle {
    stroke: currentColor;
    stroke: CanvasText;
  }
}

.mat-progress-spinner-reduced-motion {
  --%NS%mat-progress-spinner-animation-multiplier: 1.25;
}

.mdc-circular-progress__determinate-container,
.mdc-circular-progress__indeterminate-circle-graphic,
.mdc-circular-progress__indeterminate-container,
.mdc-circular-progress__spinner-layer {
  position: absolute;
  width: 100%;
  height: 100%;
}

.mdc-circular-progress__determinate-container {
  transform: rotate(-90deg);
}
.mdc-circular-progress--indeterminate .mdc-circular-progress__determinate-container {
  opacity: 0;
}

.mdc-circular-progress__indeterminate-container {
  font-size: 0;
  letter-spacing: 0;
  white-space: nowrap;
  opacity: 0;
}
.mdc-circular-progress--indeterminate .mdc-circular-progress__indeterminate-container {
  opacity: 1;
  animation: mdc-circular-progress-container-rotate calc(1568.2352941176ms * var(--%NS%mat-progress-spinner-animation-multiplier)) linear infinite;
}

.mdc-circular-progress__determinate-circle-graphic,
.mdc-circular-progress__indeterminate-circle-graphic {
  fill: transparent;
}

.mat-mdc-progress-spinner .mdc-circular-progress__determinate-circle,
.mat-mdc-progress-spinner .mdc-circular-progress__indeterminate-circle-graphic {
  stroke: var(--%NS%mat-progress-spinner-active-indicator-color, var(--%NS%mat-sys-primary));
}
@media (forced-colors: active) {
  .mat-mdc-progress-spinner .mdc-circular-progress__determinate-circle,
  .mat-mdc-progress-spinner .mdc-circular-progress__indeterminate-circle-graphic {
    stroke: CanvasText;
  }
}

.mdc-circular-progress__determinate-circle {
  transition: stroke-dashoffset 500ms cubic-bezier(0, 0, 0.2, 1);
}

.mdc-circular-progress__gap-patch {
  position: absolute;
  top: 0;
  left: 47.5%;
  box-sizing: border-box;
  width: 5%;
  height: 100%;
  overflow: hidden;
}

.mdc-circular-progress__gap-patch .mdc-circular-progress__indeterminate-circle-graphic {
  left: -900%;
  width: 2000%;
  transform: rotate(180deg);
}
.mdc-circular-progress__circle-clipper .mdc-circular-progress__indeterminate-circle-graphic {
  width: 200%;
}
.mdc-circular-progress__circle-right .mdc-circular-progress__indeterminate-circle-graphic {
  left: -100%;
}
.mdc-circular-progress--indeterminate .mdc-circular-progress__circle-left .mdc-circular-progress__indeterminate-circle-graphic {
  animation: mdc-circular-progress-left-spin calc(1333ms * var(--%NS%mat-progress-spinner-animation-multiplier)) cubic-bezier(0.4, 0, 0.2, 1) infinite both;
}
.mdc-circular-progress--indeterminate .mdc-circular-progress__circle-right .mdc-circular-progress__indeterminate-circle-graphic {
  animation: mdc-circular-progress-right-spin calc(1333ms * var(--%NS%mat-progress-spinner-animation-multiplier)) cubic-bezier(0.4, 0, 0.2, 1) infinite both;
}

.mdc-circular-progress__circle-clipper {
  display: inline-flex;
  position: relative;
  width: 50%;
  height: 100%;
  overflow: hidden;
}

.mdc-circular-progress--indeterminate .mdc-circular-progress__spinner-layer {
  animation: mdc-circular-progress-spinner-layer-rotate calc(5332ms * var(--%NS%mat-progress-spinner-animation-multiplier)) cubic-bezier(0.4, 0, 0.2, 1) infinite both;
}

@keyframes mdc-circular-progress-container-rotate {
  to {
    transform: rotate(360deg);
  }
}
@keyframes mdc-circular-progress-spinner-layer-rotate {
  12.5% {
    transform: rotate(135deg);
  }
  25% {
    transform: rotate(270deg);
  }
  37.5% {
    transform: rotate(405deg);
  }
  50% {
    transform: rotate(540deg);
  }
  62.5% {
    transform: rotate(675deg);
  }
  75% {
    transform: rotate(810deg);
  }
  87.5% {
    transform: rotate(945deg);
  }
  100% {
    transform: rotate(1080deg);
  }
}
@keyframes mdc-circular-progress-left-spin {
  from {
    transform: rotate(265deg);
  }
  50% {
    transform: rotate(130deg);
  }
  to {
    transform: rotate(265deg);
  }
}
@keyframes mdc-circular-progress-right-spin {
  from {
    transform: rotate(-265deg);
  }
  50% {
    transform: rotate(-130deg);
  }
  to {
    transform: rotate(-265deg);
  }
}
`],encapsulation:2})})()}return t})();var ai$1=(()=>{class t{static ɵfac=function(i){return new(i||t)};static ɵmod=ee({type:t});static ɵinj=K$1({imports:[Ze$1]})}return t})();var et=()=>[];var dn=()=>({});var ri$1=(t,a)=>a.id;function cn(t,a){t&1&&(Te(0,`div`,0),hc(1,`mat-spinner`,1),Me())}function ln(t,a){if(t&1&&(Te(0,`span`,10),Ft(1),Me()),t&2){let e=a.$implicit;le(),On(e)}}function sn(t,a){if(t&1&&Ft(0),t&2){let e=To(2);Mo(` · `,e.l().ai.model)}}function mn(t,a){if(t&1&&(Te(0,`div`,32)(1,`span`),Ft(2),Me(),Te(3,`div`,59),hc(4,`i`),Me(),Te(5,`span`,60),Ft(6),Me()()),t&2){let e=a.$implicit,i=To(2);le(2),On(i.FL[e]),le(2),Tf(`width`,i.l().ai.factors[e]/i.l().ai.max[e]*100,`%`),le(2),Vy(``,i.l().ai.factors[e],`/`,i.l().ai.max[e])}}function pn(t,a){if(t&1&&(Te(0,`li`)(1,`mat-icon`,61),Ft(2),Me(),Te(3,`span`),Ft(4),Me()()),t&2){let e=a.$implicit;le(),Tf(`color`,e.good?`var(--k3-ok)`:`var(--k3-warm)`),le(),On(e.good?`check_circle`:`error`),le(2),On(e.text)}}function un(t,a){if(t&1&&(Te(0,`div`,34)(1,`mat-icon`,61),Ft(2,`tips_and_updates`),Me(),Te(3,`div`)(4,`div`,30),Ft(5,`Next best action`),Me(),Te(6,`b`),Ft(7),Me()()()),t&2){let e=To(2);le(7),On(e.l().ai.nextAction)}}function _n(t,a){if(t&1&&(Te(0,`mat-option`,39),Ft(1),Me()),t&2){let e=a.$implicit,i=To(2);Gi(`value`,e),le(),On(i.SL[e])}}function gn(t,a){if(t&1&&(Te(0,`mat-option`,39),Ft(1),Me()),t&2){let e=a.$implicit;Gi(`value`,e.id),le(),On(e.name)}}function bn(t,a){if(t&1&&(Te(0,`span`,40),Ft(1),Me()),t&2){let e=To(2);le(),Mo(`· `,e.l().campaign)}}function hn(t,a){t&1&&(Te(0,`span`,42),Ft(1,`Opted out`),Me())}function fn(t,a){t&1&&(Te(0,`span`,9),Ft(1,`24h window closed · templates only`),Me())}function yn(t,a){t&1&&(Te(0,`span`,43),Ft(1,`Chat window open`),Me())}function vn(t,a){if(t&1&&(Te(0,`span`,10),Ft(1),Me()),t&2){let e=a.$implicit,i=To(2);le(),On((i.l().sequenceNames||Sx(1,dn))[e]||`Sequence`)}}function xn(t,a){t&1&&Ft(0,`—`)}function Cn(t,a){if(t&1&&(Te(0,`span`,36),Ft(1),Me(),Te(2,`span`),Ft(3),Me()),t&2){let e=a.$implicit,i=To(3);le(),On(e.replaceAll(`_`,` `)),le(2),On(i.l().custom[e])}}function kn(t,a){if(t&1&&(Te(0,`div`,48),PI(1,Cn,4,2,null,null,OI),Me()),t&2){let e=To(2);le(),FI(e.customKeys())}}function Sn(t,a){t&1&&(Te(0,`div`,30),Ft(1,`e.g. roll number, fee balance, exam date — usable as template variables`),Me())}function wn(t,a){if(t&1&&(Te(0,`div`,62),hc(1,`k3-chat`,63),Me()),t&2){let e=To(2);le(),Gi(`lead`,e.l())(`header`,!1)}}function Mn(t,a){if(t&1&&(Te(0,`li`)(1,`div`,64)(2,`mat-icon`),Ft(3),Me()(),Te(4,`div`)(5,`div`),Ft(6),Me(),Te(7,`div`,30),Ft(8),Me()()()),t&2){let e=a.$implicit,i=To(2);le(3),On(e.icon),le(3),On(e.text),le(2),On(i.fmt(e.at))}}function En(t,a){if(t&1&&(Te(0,`div`,57)(1,`div`,65),Ft(2),Me(),Te(3,`div`,66),Ft(4),Me()()),t&2){let e=a.$implicit,i=To(2);le(2),On(e.text),le(2),Vy(``,e.by,` · `,i.rel(e.at))}}function In(t,a){t&1&&(Te(0,`div`,58),Ft(1,`No notes yet`),Me())}function Tn(t,a){if(t&1){let e=xf();Te(0,`div`,2),hc(1,`k3-avatar`,3),Te(2,`div`,4)(3,`h2`),Ft(4),Me(),Te(5,`div`,5),Ft(6),Me(),Te(7,`div`,6),hc(8,`k3-temp`,7)(9,`k3-stage`,8),Te(10,`span`,9),Ft(11),Me(),PI(12,ln,2,1,`span`,10,OI),Me()(),Te(14,`button`,11)(15,`mat-icon`),Ft(16,`close`),Me()()(),Te(17,`div`,12)(18,`button`,13),Nr(`click`,function(){Ea(e);let c=To();return wa$1(c.tab.set(1))}),Te(19,`mat-icon`),Ft(20,`chat`),Me(),Ft(21,`WhatsApp`),Me(),Te(22,`button`,14),Nr(`click`,function(){Ea(e);let c=To();return wa$1(c.call())}),Te(23,`mat-icon`),Ft(24,`call`),Me(),Ft(25,`Call`),Me(),Te(26,`button`,14),Nr(`click`,function(){Ea(e);let c=To();return wa$1(c.followup())}),Te(27,`mat-icon`),Ft(28,`event`),Me(),Ft(29,`Follow-up`),Me(),Te(30,`button`,14),Nr(`click`,function(){Ea(e);let c=To();return wa$1(c.enroll())}),Te(31,`mat-icon`),Ft(32,`conversion_path`),Me(),Ft(33,`Enroll`),Me(),Te(34,`button`,15),Nr(`click`,function(){Ea(e);let c=To();return wa$1(c.requalify())}),Te(35,`mat-icon`),Ft(36,`auto_awesome`),Me()()(),Te(37,`mat-tab-group`,16),Nr(`selectedIndexChange`,function(c){Ea(e);let l=To();return wa$1(l.tab.set(c))}),Te(38,`mat-tab`,17)(39,`div`,18)(40,`div`,19)(41,`div`,20)(42,`div`,21),Ih(),Te(43,`svg`,22),hc(44,`circle`,23)(45,`circle`,24),Me(),xh(),Te(46,`div`,25),Ft(47),Me()(),Te(48,`div`,26)(49,`div`,27)(50,`mat-icon`,28),Ft(51,`auto_awesome`),Me(),Ft(52,`AI qualification`),Me(),Te(53,`div`,29),Ft(54),Me(),Te(55,`div`,30),Ft(56),yt$1(57,sn,1,1),Me()()(),Te(58,`div`,31),PI(59,mn,7,5,`div`,32,OI),Me(),Te(61,`ul`,33),PI(62,pn,5,4,`li`,null,RI),Me(),yt$1(64,un,8,1,`div`,34),Me(),Te(65,`div`,35)(66,`span`,36),Ft(67,`Stage`),Me(),Te(68,`mat-form-field`,37)(69,`mat-select`,38),ES(),Nr(`ngModelChange`,function(c){Ea(e);let l=To();return wa$1(l.patch({stage:c},`Stage updated → `+l.SL[c]))}),PI(70,_n,2,2,`mat-option`,39,OI),Me()(),Te(72,`span`,36),Ft(73,`Counsellor`),Me(),Te(74,`mat-form-field`,37)(75,`mat-select`,38),ES(),Nr(`ngModelChange`,function(c){Ea(e);let l=To();return wa$1(l.patch({counsellorId:c},`Counsellor reassigned`))}),PI(76,gn,2,2,`mat-option`,39,ri$1),Me()(),Te(78,`span`,36),Ft(79,`Program`),Me(),Te(80,`span`),Ft(81),Me(),Te(82,`span`,36),Ft(83,`Source`),Me(),Te(84,`span`),Ft(85),yt$1(86,bn,2,1,`span`,40),Me(),Te(87,`span`,36),Ft(88,`Area`),Me(),Te(89,`span`),Ft(90),Me(),Te(91,`span`,36),Ft(92,`Email`),Me(),Te(93,`span`,41),Ft(94),Me(),Te(95,`span`,36),Ft(96,`WhatsApp`),Me(),Te(97,`span`),yt$1(98,hn,2,0,`span`,42)(99,fn,2,0,`span`,9)(100,yn,2,0,`span`,43),Me(),Te(101,`span`,36),Ft(102,`Enquired`),Me(),Te(103,`span`),Ft(104),Me(),Te(105,`span`,36),Ft(106,`Next follow-up`),Me(),Te(107,`span`),Ft(108),Me(),Te(109,`span`,36),Ft(110,`Sequences`),Me(),Te(111,`span`,44),PI(112,vn,2,2,`span`,10,OI,!1,xn,1,0),Me()(),Te(115,`div`,45)(116,`div`,46)(117,`b`,26),Ft(118,`Custom fields`),Me(),Te(119,`button`,47),Nr(`click`,function(){Ea(e);let c=To();return wa$1(c.editCustom())}),Te(120,`mat-icon`),Ft(121,`edit`),Me(),Ft(122),Me()(),yt$1(123,kn,3,0,`div`,48)(124,Sn,2,0,`div`,30),Me()()(),Te(125,`mat-tab`,49),Rn(126,wn,2,2,`ng-template`,50),Me(),Te(127,`mat-tab`,51)(128,`div`,18)(129,`ul`,52),PI(130,Mn,9,3,`li`,null,RI),Me()()(),Te(132,`mat-tab`,49)(133,`div`,18)(134,`mat-form-field`,53)(135,`mat-label`),Ft(136,`Add a note for the admissions team`),Me(),Te(137,`textarea`,54),ES(),zy(`ngModelChange`,function(c){Ea(e);let l=To();return bx(l.note,c)||(l.note=c),wa$1(c)}),Me()(),Te(138,`div`,55)(139,`button`,56),Nr(`click`,function(){Ea(e);let c=To();return wa$1(c.addNote())}),Te(140,`mat-icon`),Ft(141,`add`),Me(),Ft(142,`Add note`),Me()(),PI(143,En,5,3,`div`,57,ri$1,!1,In,2,0,`div`,58),Me()()()}if(t&2){let e=To();le(),Gi(`name`,e.l().student||e.l().parent),le(3),On(e.l().student||e.l().parent),le(2),Vy(``,e.l().parent,` · `,e.l().phone),le(2),Gi(`temp`,e.l().ai.temp)(`score`,e.l().ai.score),le(),Gi(`stage`,e.l().stage),le(2),On(e.l().program),le(),FI(e.l().tags||Sx(37,et)),le(22),Gi(`disabled`,e.busy()),le(),ve(`spin`,e.busy()),le(2),Gi(`selectedIndex`,e.tab()),le(8),Be$1(`stroke`,e.T[e.l().ai.temp].color)(`stroke-dasharray`,e.dash()),le(2),On(e.l().ai.score),le(7),Mo(``,e.T[e.l().ai.temp].label,` lead`),le(2),Mo(`Updated `,e.rel(e.l().ai.updatedAt)),le(),vt$1(e.l().ai.model?57:-1),le(2),FI(e.factorKeys()),le(3),FI(e.l().ai.reasons||Sx(38,et)),le(2),vt$1(e.l().ai.nextAction?64:-1),le(5),Gi(`ngModel`,e.l().stage),CS(),le(),FI(e.stages),le(5),Gi(`ngModel`,e.l().counsellorId),CS(),le(),FI(e.s.meta().counsellors),le(5),On(e.l().program),le(4),On(e.l().source),le(),vt$1(e.l().campaign?86:-1),le(4),On(e.l().area||`—`),le(4),On(e.l().email||`—`),le(4),vt$1(e.l().optedOut?98:e.l().windowOpen===!1?99:100),le(6),On(e.fmt(e.l().createdAt)),le(4),On(e.due(e.l().nextFollowUp).text),le(4),FI(e.l().sequences||Sx(39,et)),le(10),On(e.customKeys().length?`Edit`:`Add`),le(),vt$1(e.customKeys().length?123:124),le(2),Gi(`label`,`WhatsApp`+(e.l().unread?` •`:``)),le(5),FI(e.timeline()),le(2),Gi(`label`,`Notes (`+(e.l().notes?.length||0)+`)`),le(5),$y(`ngModel`,e.note),CS(),le(2),Gi(`disabled`,!e.note.trim()),le(4),FI(e.l().notes)}}var oi$1={intent:`Intent signals`,engagement:`Engagement`,responsiveness:`Response speed`,source:`Source quality`,stage:`Stage progress`,recency:`Recency`};var $e=class t{s=f$1(Mi$1);api=f$1(Gt);ui=f$1(cD);ref=f$1(vs);data=f$1(Vp);l=Le$1(null);tab=Le$1(this.data.tab===`whatsapp`?1:0);busy=Le$1(!1);changed=!1;note=``;T=dc;SL=lc;FL=oi$1;stages=cc;rel=Rc;due=Cc;fmt=a=>Sc(a,{dateStyle:`medium`,timeStyle:`short`});dash=Fx(()=>{let a=2*Math.PI*32;return`${this.l().ai.score/100*a} ${a}`});factorKeys=Fx(()=>Object.keys(oi$1).filter(a=>this.l()?.ai?.max?.[a]));customKeys=Fx(()=>Object.keys(this.l()?.custom||{}));timeline=Fx(()=>(this.l()?.timeline||[]).slice().reverse());constructor(){this.load()}async load(){try{this.l.set(await this.api.lead(this.data.id))}catch(a){this.ui.error(a),this.ref.close()}}async patch(a,e){try{this.l.set(Object.assign({},this.l(),await this.api.updateLead(this.l().id,a))),this.changed=!0,this.ui.toast(e)}catch(i){this.ui.error(i)}}async addNote(){await this.api.addNote(this.l().id,this.note.trim()),this.note=``,this.changed=!0,await this.load()}editCustom(){this.ui.open(qe,{custom:this.l().custom}).afterClosed().subscribe(a=>a&&this.patch({custom:a},`Custom fields saved`))}followup(){this.ui.open(We,{lead:this.l()}).afterClosed().subscribe(a=>{a&&(this.changed=!0,this.load())})}call(){this.ui.open(Ge,this.l(),{width:`420px`}).afterClosed().subscribe(async a=>{if(!a)return;let e=this.l();await this.api.addNote(e.id,`Call logged: `+a),a===`Visit booked`?await this.api.updateLead(e.id,{stage:`visit`}):a.startsWith(`Connected`)&&[`new`,`contacted`].includes(e.stage)&&await this.api.updateLead(e.id,{stage:`counselling`}),this.changed=!0,await this.load(),this.ui.toast(`Call logged`)})}async enroll(){let a=await this.api.sequences();this.ui.open(Ve,{title:`Enroll in nurture sequence`,label:`Sequence`,ok:`Enroll`,options:a.map(e=>({value:e.id,label:`${e.name} \u2014 ${e.trigger}`}))},{width:`460px`}).afterClosed().subscribe(async e=>{e&&(await this.api.enroll(e,[this.l().id]),this.changed=!0,await this.load(),this.ui.toast(`Enrolled`))})}async requalify(){this.busy.set(!0);try{let a=await this.api.qualify(this.l().id);await this.load(),this.tab.set(0),this.changed=!0,this.ui.toast(`AI score ${a.score} \xB7 ${dc[a.temp].label}${a.previous?` (was ${dc[a.previous].label})`:` (unchanged)`}`)}catch(a){this.ui.error(a)}this.busy.set(!1)}static ɵfac=function(e){return new(e||t)};static ɵcmp=te({type:t,selectors:[[`k3-lead-sheet`]],decls:2,vars:1,consts:[[1,`center-load`],[`diameter`,`36`],[1,`sh-h`],[`size`,`lg`,3,`name`],[1,`grow`,2,`min-width`,`0`],[1,`muted`,`ellipsis`],[1,`row`,`wrap`,2,`margin-top`,`8px`],[3,`temp`,`score`],[3,`stage`],[1,`pill`,`p-grey`],[1,`pill`,`p-blue`],[`mat-icon-button`,``,`mat-dialog-close`,``,`aria-label`,`Close`],[1,`sh-actions`],[`mat-flat-button`,``,1,`wa`,3,`click`],[`mat-stroked-button`,``,3,`click`],[`mat-icon-button`,``,`matTooltip`,`Re-run AI qualification`,`aria-label`,`Re-qualify`,3,`click`,`disabled`],[`mat-stretch-tabs`,`false`,`animationDuration`,`150ms`,1,`sh-tabs`,3,`selectedIndexChange`,`selectedIndex`],[`label`,`Overview`],[1,`sh-body`],[1,`ai-card`],[1,`row`,2,`gap`,`14px`],[1,`ring`],[`width`,`76`,`height`,`76`,`viewBox`,`0 0 76 76`],[`cx`,`38`,`cy`,`38`,`r`,`32`,`stroke`,`#dfe3eb`,`stroke-width`,`7`,`fill`,`none`],[`cx`,`38`,`cy`,`38`,`r`,`32`,`stroke-width`,`7`,`fill`,`none`,`stroke-linecap`,`round`,`transform`,`rotate(-90 38 38)`],[1,`v`,`tnum`],[1,`grow`],[1,`small`,`muted`,`row`],[1,`sm`],[2,`font`,`var(--mat-sys-title-large)`,`margin`,`2px 0`],[1,`small`,`muted`],[2,`margin-top`,`12px`],[1,`factor`],[1,`reasons`],[1,`nba`],[1,`kv`],[1,`k`],[`appearance`,`outline`,`subscriptSizing`,`dynamic`,1,`dense`],[3,`ngModelChange`,`ngModel`],[3,`value`],[1,`muted`,`small`],[1,`ellipsis`],[1,`pill`,`p-bad`],[1,`pill`,`p-ok`],[1,`row`,`wrap`],[1,`card`,`flat`,2,`margin-top`,`16px`,`padding`,`14px 16px`],[1,`row`],[`mat-button`,``,3,`click`],[1,`kv`,2,`margin-top`,`6px`],[3,`label`],[`matTabContent`,``],[`label`,`Timeline`],[1,`timeline`],[`appearance`,`outline`,1,`full`],[`matInput`,``,`rows`,`3`,3,`ngModelChange`,`ngModel`],[1,`row`,2,`justify-content`,`flex-end`,`margin`,`-6px 0 16px`],[`mat-flat-button`,``,3,`click`,`disabled`],[1,`card`,`flat`,2,`margin-bottom`,`8px`,`padding`,`12px 14px`],[1,`empty`],[1,`bar`],[1,`tnum`,`muted`],[1,`fill`],[1,`sh-chat`],[3,`lead`,`header`],[1,`ic`],[2,`white-space`,`pre-wrap`],[1,`small`,`muted`,2,`margin-top`,`4px`]],template:function(e,i){e&1&&yt$1(0,cn,2,0,`div`,0)(1,Tn,146,40),e&2&&vt$1(i.l()?1:0)},dependencies:[Mn$1,Pe,Vn,Yt,iD,J_,Ep,Qc,JT,Wv,zv,oa$1,ve$1,xe,na,_n$1,bt,we$1,yn$2,ee$1,Fe,rr,ir,ai$1,ni$1,Vt,_t$1,De,ke$1,ie$2,ze],styles:[`[_nghost-%COMP%]{display:flex;flex-direction:column;height:100%;background:var(--%NS%mat-sys-surface-container-low)}.center-load[_ngcontent-%COMP%]{display:grid;place-items:center;flex:1}.sh-h[_ngcontent-%COMP%]{display:flex;gap:14px;align-items:flex-start;padding:20px 16px 8px 24px}.sh-h[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%]{margin:0;font:var(--%NS%mat-sys-headline-small)}.sh-actions[_ngcontent-%COMP%]{display:flex;gap:8px;padding:8px 24px 12px;overflow-x:auto;scrollbar-width:none}.sh-actions[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]{flex:none}.wa[_ngcontent-%COMP%]{background:var(--%NS%k3-wa)!important;color:#fff!important}.sh-tabs[_ngcontent-%COMP%]{flex:1;min-height:0}[_nghost-%COMP%]     .sh-tabs .mat-mdc-tab-body-wrapper{flex:1;min-height:0}.sh-body[_ngcontent-%COMP%]{padding:16px 24px 32px}.sh-chat[_ngcontent-%COMP%]{height:100%;min-height:420px;display:flex;flex-direction:column}[_nghost-%COMP%]     .sh-tabs .mat-mdc-tab-body-content{height:100%}.ring[_ngcontent-%COMP%]{position:relative;width:76px;height:76px;flex:none}.ring[_ngcontent-%COMP%]   .v[_ngcontent-%COMP%]{position:absolute;inset:0;display:grid;place-items:center;font:var(--%NS%mat-sys-title-large)}.reasons[_ngcontent-%COMP%]{list-style:none;padding:0;margin:10px 0 0}.reasons[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]{display:flex;gap:8px;align-items:flex-start;font:var(--%NS%mat-sys-body-medium);margin:4px 0}.reasons[_ngcontent-%COMP%]   mat-icon[_ngcontent-%COMP%]{font-size:18px;width:18px;height:18px;flex:none;margin-top:1px}.nba[_ngcontent-%COMP%]{display:flex;gap:10px;align-items:center;margin-top:12px;background:var(--%NS%mat-sys-surface);border-radius:12px;padding:10px 12px}.nba[_ngcontent-%COMP%]   mat-icon[_ngcontent-%COMP%]{color:var(--%NS%k3-warm)}.dense[_ngcontent-%COMP%]{width:100%;max-width:260px}@media(max-width:600px){.sh-h[_ngcontent-%COMP%]{padding:16px 8px 4px 16px}.sh-actions[_ngcontent-%COMP%]{padding:8px 16px 10px}.sh-body[_ngcontent-%COMP%]{padding:14px 16px 28px}}`]})};var di$1=class t{dialog=f$1(_s);async open(a,e){let i=window.innerWidth<=600,c=this.dialog.open($e,{data:{id:a,tab:e},autoFocus:!1,restoreFocus:!0,position:i?void 0:{right:`0`,top:`0`},width:i?`100vw`:`min(560px, 100vw)`,maxWidth:`100vw`,height:`100dvh`,maxHeight:`100dvh`,panelClass:i?`full-sheet`:`side-sheet`,enterAnimationDuration:`180ms`}),l=c.componentInstance;return await yD(c.afterClosed()),l?.changed??!1}static ɵfac=function(e){return new(e||t)};static ɵprov=O({token:t,factory:t.ɵfac,providedIn:`root`})};var ae=new g(`mat-slide-toggle-default-options`,{providedIn:`root`,factory:()=>({disableToggleValue:!1,hideIcon:!1,disabledInteractive:!1})});var u=class{source;checked;constructor(K,t){this.source=K,this.checked=t}};var ie=(()=>{class a{_elementRef=f$1(B);_focusMonitor=f$1(Oo);_changeDetectorRef=f$1(Or);defaults=f$1(ae);_injector=f$1(M);_signalFormField=null;_onChange=t=>{};_onTouched=()=>{};_validatorOnChange=()=>{};_uniqueId;_checked=!1;_createChangeEvent(t){return new u(this,t)}_labelId;get buttonId(){return`${this.id||this._uniqueId}-button`}_switchElement;focus(){this._switchElement.nativeElement.focus()}_noopAnimations=it$1();_focused=!1;name=null;id;labelPosition=`after`;ariaLabel=null;ariaLabelledby=null;ariaDescribedby;required=!1;color;disabled=!1;fullWidth=!1;disableRipple=!1;tabIndex=0;get checked(){return this._checked}set checked(t){this._checked=t,this._changeDetectorRef.markForCheck()}hideIcon;disabledInteractive;change=new J;toggleChange=new J;get inputId(){return`${this.id||this._uniqueId}-input`}constructor(){f$1(nt$1).load(S_);let t=f$1(new _c(`tabindex`),{optional:!0}),i=this.defaults;this.tabIndex=t==null?0:parseInt(t)||0,this.color=i.color||`accent`,this.id=this._uniqueId=f$1(ot$1).getId(`mat-mdc-slide-toggle-`),this.hideIcon=i.hideIcon??!1,this.disabledInteractive=i.disabledInteractive??!1,this._labelId=this._uniqueId+`-label`}ngOnInit(){this._signalFormField=this._injector.get(at$1,void 0,{optional:!0,self:!0})}ngAfterContentInit(){this._focusMonitor.monitor(this._elementRef,!0).subscribe(t=>{t===`keyboard`||t===`program`?(this._focused=!0,this._changeDetectorRef.markForCheck()):t||Promise.resolve().then(()=>{this._focused=!1,this._onTouched(),this._changeDetectorRef.markForCheck()})})}ngOnChanges(t){t.required&&this._validatorOnChange()}ngOnDestroy(){this._focusMonitor.stopMonitoring(this._elementRef)}writeValue(t){this.checked=!!t}registerOnChange(t){this._onChange=t}registerOnTouched(t){this._onTouched=t}validate(t){return this.required&&t.value!==!0&&!this._signalFormField?{required:!0}:null}registerOnValidatorChange(t){this._validatorOnChange=t}setDisabledState(t){this.disabled=t,this._changeDetectorRef.markForCheck()}toggle(){this.checked=!this.checked,this._onChange(this.checked)}_emitChangeEvent(){this._onChange(this.checked),this.change.emit(this._createChangeEvent(this.checked))}_handleClick(){this.disabled||(this.toggleChange.emit(),this.defaults.disableToggleValue||(this.checked=!this.checked,this._onChange(this.checked),this.change.emit(new u(this,this.checked))))}_getAriaLabelledBy(){return this.ariaLabelledby?this.ariaLabelledby:this.ariaLabel?null:this._labelId}static ɵfac=function(i){return new(i||a)};static ɵcmp=(function(){let t=[`switch`],i=[`*`];function ee(l,c){l&1&&(Te(0,`span`,11),Ih(),Te(1,`svg`,13),hc(2,`path`,14),Me(),Te(3,`svg`,15),hc(4,`path`,16),Me()())}return te({type:a,selectors:[[`mat-slide-toggle`]],viewQuery:function(c,e){if(c&1&&Ar(t,5),c&2){let o;kr(o=Rr())&&(e._switchElement=o.first)}},hostAttrs:[1,`mat-mdc-slide-toggle`],hostVars:15,hostBindings:function(c,e){c&2&&(qi$1(`id`,e.id),Be$1(`tabindex`,null)(`aria-label`,null)(`name`,null)(`aria-labelledby`,null),Zi$1(e.color?`mat-`+e.color:``),ve(`mat-mdc-slide-toggle-focused`,e._focused)(`mat-mdc-slide-toggle-checked`,e.checked)(`mat-slide-toggle-full-width`,e.fullWidth)(`_mat-animation-noopable`,e._noopAnimations))},inputs:{name:`name`,id:`id`,labelPosition:`labelPosition`,ariaLabel:[0,`aria-label`,`ariaLabel`],ariaLabelledby:[0,`aria-labelledby`,`ariaLabelledby`],ariaDescribedby:[0,`aria-describedby`,`ariaDescribedby`],required:[2,`required`,`required`,ie$1],color:`color`,disabled:[2,`disabled`,`disabled`,ie$1],fullWidth:[2,`fullWidth`,`fullWidth`,ie$1],disableRipple:[2,`disableRipple`,`disableRipple`,ie$1],tabIndex:[2,`tabIndex`,`tabIndex`,l=>l==null?0:Bf(l)],checked:[2,`checked`,`checked`,ie$1],hideIcon:[2,`hideIcon`,`hideIcon`,ie$1],disabledInteractive:[2,`disabledInteractive`,`disabledInteractive`,ie$1]},outputs:{change:`change`,toggleChange:`toggleChange`},exportAs:[`matSlideToggle`],features:[Mf([{provide:se$1,useExisting:pi$1(()=>a),multi:!0},{provide:N$1,useExisting:a,multi:!0}]),Jt],ngContentSelectors:i,decls:14,vars:27,consts:[[`switch`,``],[`mat-internal-form-field`,``,3,`labelPosition`],[`role`,`switch`,`type`,`button`,1,`mdc-switch`,3,`click`,`tabIndex`,`disabled`],[1,`mat-mdc-slide-toggle-touch-target`],[1,`mdc-switch__track`],[1,`mdc-switch__handle-track`],[1,`mdc-switch__handle`],[1,`mdc-switch__shadow`],[1,`mdc-elevation-overlay`],[1,`mdc-switch__ripple`],[`mat-ripple`,``,1,`mat-mdc-slide-toggle-ripple`,`mat-focus-indicator`,3,`matRippleTrigger`,`matRippleDisabled`,`matRippleCentered`],[1,`mdc-switch__icons`],[1,`mdc-label`,3,`click`,`for`],[`viewBox`,`0 0 24 24`,`aria-hidden`,`true`,1,`mdc-switch__icon`,`mdc-switch__icon--on`],[`d`,`M19.69,5.23L8.96,15.96l-4.23-4.23L2.96,13.5l6,6L21.46,7L19.69,5.23z`],[`viewBox`,`0 0 24 24`,`aria-hidden`,`true`,1,`mdc-switch__icon`,`mdc-switch__icon--off`],[`d`,`M20 13H4v-2h16v2z`]],template:function(c,e){if(c&1&&(Pt(),Te(0,`div`,1)(1,`button`,2,0),Nr(`click`,function(){return e._handleClick()}),hc(3,`div`,3)(4,`span`,4),Te(5,`span`,5)(6,`span`,6)(7,`span`,7),hc(8,`span`,8),Me(),Te(9,`span`,9),hc(10,`span`,10),Me(),yt$1(11,ee,5,0,`span`,11),Me()()(),Te(12,`label`,12),Nr(`click`,function(te){return te.stopPropagation()}),be(13),Me()()),c&2){let o=GI(2);Gi(`labelPosition`,e.labelPosition),le(),ve(`mdc-switch--selected`,e.checked)(`mdc-switch--unselected`,!e.checked)(`mdc-switch--checked`,e.checked)(`mdc-switch--disabled`,e.disabled)(`mat-mdc-slide-toggle-disabled-interactive`,e.disabledInteractive),Gi(`tabIndex`,e.disabled&&!e.disabledInteractive?-1:e.tabIndex)(`disabled`,e.disabled&&!e.disabledInteractive),Be$1(`id`,e.buttonId)(`name`,e.name)(`aria-label`,e.ariaLabel)(`aria-labelledby`,e._getAriaLabelledBy())(`aria-describedby`,e.ariaDescribedby)(`aria-required`,e.required||null)(`aria-checked`,e.checked)(`aria-disabled`,e.disabled&&e.disabledInteractive?`true`:null),le(9),Gi(`matRippleTrigger`,o)(`matRippleDisabled`,e.disableRipple||e.disabled)(`matRippleCentered`,!0),le(),vt$1(e.hideIcon?-1:11),le(),Gi(`for`,e.buttonId),Be$1(`id`,e._labelId)}},dependencies:[l4,g$1],styles:[`.mdc-switch {
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  display: inline-flex;
  flex-shrink: 0;
  margin: 0;
  outline: none;
  overflow: visible;
  padding: 0;
  position: relative;
  width: var(--%NS%mat-slide-toggle-track-width, 52px);
}
.mdc-switch.mdc-switch--disabled {
  cursor: default;
  pointer-events: none;
}
.mdc-switch.mat-mdc-slide-toggle-disabled-interactive {
  pointer-events: auto;
}

.mdc-switch__track {
  overflow: hidden;
  position: relative;
  width: 100%;
  height: var(--%NS%mat-slide-toggle-track-height, 32px);
  border-radius: var(--%NS%mat-slide-toggle-track-shape, var(--%NS%mat-sys-corner-full));
}
.mdc-switch--disabled.mdc-switch .mdc-switch__track {
  opacity: var(--%NS%mat-slide-toggle-disabled-track-opacity, 0.12);
}
.mdc-switch__track::before, .mdc-switch__track::after {
  border: 1px solid transparent;
  border-radius: inherit;
  box-sizing: border-box;
  content: "";
  height: 100%;
  left: 0;
  position: absolute;
  width: 100%;
  border-width: var(--%NS%mat-slide-toggle-track-outline-width, 2px);
  border-color: var(--%NS%mat-slide-toggle-track-outline-color, var(--%NS%mat-sys-outline));
}
.mdc-switch--selected .mdc-switch__track::before, .mdc-switch--selected .mdc-switch__track::after {
  border-width: var(--%NS%mat-slide-toggle-selected-track-outline-width, 2px);
  border-color: var(--%NS%mat-slide-toggle-selected-track-outline-color, transparent);
}
.mdc-switch--disabled .mdc-switch__track::before, .mdc-switch--disabled .mdc-switch__track::after {
  border-width: var(--%NS%mat-slide-toggle-disabled-unselected-track-outline-width, 2px);
  border-color: var(--%NS%mat-slide-toggle-disabled-unselected-track-outline-color, var(--%NS%mat-sys-on-surface));
}
@media (forced-colors: active) {
  .mdc-switch__track {
    border-color: currentColor;
  }
}
.mdc-switch__track::before {
  transition: transform 75ms 0ms cubic-bezier(0, 0, 0.2, 1);
  transform: translateX(0);
  background: var(--%NS%mat-slide-toggle-unselected-track-color, var(--%NS%mat-sys-surface-variant));
}
.mdc-switch--selected .mdc-switch__track::before {
  transition: transform 75ms 0ms cubic-bezier(0.4, 0, 0.6, 1);
  transform: translateX(100%);
}
[dir=rtl] .mdc-switch--selected .mdc-switch--selected .mdc-switch__track::before {
  transform: translateX(-100%);
}
.mdc-switch--selected .mdc-switch__track::before {
  opacity: var(--%NS%mat-slide-toggle-hidden-track-opacity, 0);
  transition: var(--%NS%mat-slide-toggle-hidden-track-transition, opacity 75ms);
}
.mdc-switch--unselected .mdc-switch__track::before {
  opacity: var(--%NS%mat-slide-toggle-visible-track-opacity, 1);
  transition: var(--%NS%mat-slide-toggle-visible-track-transition, opacity 75ms);
}
.mdc-switch:enabled:hover:not(:focus):not(:active) .mdc-switch__track::before {
  background: var(--%NS%mat-slide-toggle-unselected-hover-track-color, var(--%NS%mat-sys-surface-variant));
}
.mdc-switch:enabled:focus:not(:active) .mdc-switch__track::before {
  background: var(--%NS%mat-slide-toggle-unselected-focus-track-color, var(--%NS%mat-sys-surface-variant));
}
.mdc-switch:enabled:active .mdc-switch__track::before {
  background: var(--%NS%mat-slide-toggle-unselected-pressed-track-color, var(--%NS%mat-sys-surface-variant));
}
.mat-mdc-slide-toggle-disabled-interactive.mdc-switch--%NS%disabled:hover:not(:focus):not(:active) .mdc-switch__track::before, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--%NS%disabled:focus:not(:active) .mdc-switch__track::before, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--%NS%disabled:active .mdc-switch__track::before, .mdc-switch.mdc-switch--disabled .mdc-switch__track::before {
  background: var(--%NS%mat-slide-toggle-disabled-unselected-track-color, var(--%NS%mat-sys-surface-variant));
}
.mdc-switch__track::after {
  transform: translateX(-100%);
  background: var(--%NS%mat-slide-toggle-selected-track-color, var(--%NS%mat-sys-primary));
}
[dir=rtl] .mdc-switch__track::after {
  transform: translateX(100%);
}
.mdc-switch--selected .mdc-switch__track::after {
  transform: translateX(0);
}
.mdc-switch--selected .mdc-switch__track::after {
  opacity: var(--%NS%mat-slide-toggle-visible-track-opacity, 1);
  transition: var(--%NS%mat-slide-toggle-visible-track-transition, opacity 75ms);
}
.mdc-switch--unselected .mdc-switch__track::after {
  opacity: var(--%NS%mat-slide-toggle-hidden-track-opacity, 0);
  transition: var(--%NS%mat-slide-toggle-hidden-track-transition, opacity 75ms);
}
.mdc-switch:enabled:hover:not(:focus):not(:active) .mdc-switch__track::after {
  background: var(--%NS%mat-slide-toggle-selected-hover-track-color, var(--%NS%mat-sys-primary));
}
.mdc-switch:enabled:focus:not(:active) .mdc-switch__track::after {
  background: var(--%NS%mat-slide-toggle-selected-focus-track-color, var(--%NS%mat-sys-primary));
}
.mdc-switch:enabled:active .mdc-switch__track::after {
  background: var(--%NS%mat-slide-toggle-selected-pressed-track-color, var(--%NS%mat-sys-primary));
}
.mat-mdc-slide-toggle-disabled-interactive.mdc-switch--%NS%disabled:hover:not(:focus):not(:active) .mdc-switch__track::after, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--%NS%disabled:focus:not(:active) .mdc-switch__track::after, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--%NS%disabled:active .mdc-switch__track::after, .mdc-switch.mdc-switch--disabled .mdc-switch__track::after {
  background: var(--%NS%mat-slide-toggle-disabled-selected-track-color, var(--%NS%mat-sys-on-surface));
}

.mdc-switch__handle-track {
  height: 100%;
  pointer-events: none;
  position: absolute;
  top: 0;
  transition: transform 75ms 0ms cubic-bezier(0.4, 0, 0.2, 1);
  left: 0;
  right: auto;
  transform: translateX(0);
  width: calc(100% - var(--%NS%mat-slide-toggle-handle-width));
}
[dir=rtl] .mdc-switch__handle-track {
  left: auto;
  right: 0;
}
.mdc-switch--selected .mdc-switch__handle-track {
  transform: translateX(100%);
}
[dir=rtl] .mdc-switch--selected .mdc-switch__handle-track {
  transform: translateX(-100%);
}

.mdc-switch__handle {
  display: flex;
  pointer-events: auto;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 0;
  right: auto;
  transition: width 75ms cubic-bezier(0.4, 0, 0.2, 1), height 75ms cubic-bezier(0.4, 0, 0.2, 1), margin 75ms cubic-bezier(0.4, 0, 0.2, 1);
  width: var(--%NS%mat-slide-toggle-handle-width);
  height: var(--%NS%mat-slide-toggle-handle-height);
  border-radius: var(--%NS%mat-slide-toggle-handle-shape, var(--%NS%mat-sys-corner-full));
}
[dir=rtl] .mdc-switch__handle {
  left: auto;
  right: 0;
}
.mat-mdc-slide-toggle .mdc-switch--unselected .mdc-switch__handle {
  width: var(--%NS%mat-slide-toggle-unselected-handle-size, 16px);
  height: var(--%NS%mat-slide-toggle-unselected-handle-size, 16px);
  margin: var(--%NS%mat-slide-toggle-unselected-handle-horizontal-margin, 0 8px);
}
.mat-mdc-slide-toggle .mdc-switch--unselected .mdc-switch__handle:has(.mdc-switch__icons) {
  margin: var(--%NS%mat-slide-toggle-unselected-with-icon-handle-horizontal-margin, 0 4px);
}
.mat-mdc-slide-toggle .mdc-switch--selected .mdc-switch__handle {
  width: var(--%NS%mat-slide-toggle-selected-handle-size, 24px);
  height: var(--%NS%mat-slide-toggle-selected-handle-size, 24px);
  margin: var(--%NS%mat-slide-toggle-selected-handle-horizontal-margin, 0 24px);
}
.mat-mdc-slide-toggle .mdc-switch--selected .mdc-switch__handle:has(.mdc-switch__icons) {
  margin: var(--%NS%mat-slide-toggle-selected-with-icon-handle-horizontal-margin, 0 24px);
}
.mat-mdc-slide-toggle .mdc-switch__handle:has(.mdc-switch__icons) {
  width: var(--%NS%mat-slide-toggle-with-icon-handle-size, 24px);
  height: var(--%NS%mat-slide-toggle-with-icon-handle-size, 24px);
}
.mat-mdc-slide-toggle .mdc-switch:active:not(.mdc-switch--disabled) .mdc-switch__handle {
  width: var(--%NS%mat-slide-toggle-pressed-handle-size, 28px);
  height: var(--%NS%mat-slide-toggle-pressed-handle-size, 28px);
}
.mat-mdc-slide-toggle .mdc-switch--%NS%selected:active:not(.mdc-switch--disabled) .mdc-switch__handle {
  margin: var(--%NS%mat-slide-toggle-selected-pressed-handle-horizontal-margin, 0 22px);
}
.mat-mdc-slide-toggle .mdc-switch--%NS%unselected:active:not(.mdc-switch--disabled) .mdc-switch__handle {
  margin: var(--%NS%mat-slide-toggle-unselected-pressed-handle-horizontal-margin, 0 2px);
}
.mdc-switch--disabled.mdc-switch--selected .mdc-switch__handle::after {
  opacity: var(--%NS%mat-slide-toggle-disabled-selected-handle-opacity, 1);
}
.mdc-switch--disabled.mdc-switch--unselected .mdc-switch__handle::after {
  opacity: var(--%NS%mat-slide-toggle-disabled-unselected-handle-opacity, 0.38);
}
.mdc-switch__handle::before, .mdc-switch__handle::after {
  border: 1px solid transparent;
  border-radius: inherit;
  box-sizing: border-box;
  content: "";
  width: 100%;
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  transition: background-color 75ms 0ms cubic-bezier(0.4, 0, 0.2, 1), border-color 75ms 0ms cubic-bezier(0.4, 0, 0.2, 1);
  z-index: -1;
}
@media (forced-colors: active) {
  .mdc-switch__handle::before, .mdc-switch__handle::after {
    border-color: currentColor;
  }
}
.mdc-switch--%NS%selected:enabled .mdc-switch__handle::after {
  background: var(--%NS%mat-slide-toggle-selected-handle-color, var(--%NS%mat-sys-on-primary));
}
.mdc-switch--%NS%selected:enabled:hover:not(:focus):not(:active) .mdc-switch__handle::after {
  background: var(--%NS%mat-slide-toggle-selected-hover-handle-color, var(--%NS%mat-sys-primary-container));
}
.mdc-switch--%NS%selected:enabled:focus:not(:active) .mdc-switch__handle::after {
  background: var(--%NS%mat-slide-toggle-selected-focus-handle-color, var(--%NS%mat-sys-primary-container));
}
.mdc-switch--%NS%selected:enabled:active .mdc-switch__handle::after {
  background: var(--%NS%mat-slide-toggle-selected-pressed-handle-color, var(--%NS%mat-sys-primary-container));
}
.mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled.mdc-switch--%NS%selected:hover:not(:focus):not(:active) .mdc-switch__handle::after, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled.mdc-switch--%NS%selected:focus:not(:active) .mdc-switch__handle::after, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--disabled.mdc-switch--%NS%selected:active .mdc-switch__handle::after, .mdc-switch--selected.mdc-switch--disabled .mdc-switch__handle::after {
  background: var(--%NS%mat-slide-toggle-disabled-selected-handle-color, var(--%NS%mat-sys-surface));
}
.mdc-switch--%NS%unselected:enabled .mdc-switch__handle::after {
  background: var(--%NS%mat-slide-toggle-unselected-handle-color, var(--%NS%mat-sys-outline));
}
.mdc-switch--%NS%unselected:enabled:hover:not(:focus):not(:active) .mdc-switch__handle::after {
  background: var(--%NS%mat-slide-toggle-unselected-hover-handle-color, var(--%NS%mat-sys-on-surface-variant));
}
.mdc-switch--%NS%unselected:enabled:focus:not(:active) .mdc-switch__handle::after {
  background: var(--%NS%mat-slide-toggle-unselected-focus-handle-color, var(--%NS%mat-sys-on-surface-variant));
}
.mdc-switch--%NS%unselected:enabled:active .mdc-switch__handle::after {
  background: var(--%NS%mat-slide-toggle-unselected-pressed-handle-color, var(--%NS%mat-sys-on-surface-variant));
}
.mdc-switch--unselected.mdc-switch--disabled .mdc-switch__handle::after {
  background: var(--%NS%mat-slide-toggle-disabled-unselected-handle-color, var(--%NS%mat-sys-on-surface));
}
.mdc-switch__handle::before {
  background: var(--%NS%mat-slide-toggle-handle-surface-color);
}

.mdc-switch__shadow {
  border-radius: inherit;
  bottom: 0;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
}
.mdc-switch:enabled .mdc-switch__shadow {
  box-shadow: var(--%NS%mat-slide-toggle-handle-elevation-shadow);
}
.mat-mdc-slide-toggle-disabled-interactive.mdc-switch--%NS%disabled:hover:not(:focus):not(:active) .mdc-switch__shadow, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--%NS%disabled:focus:not(:active) .mdc-switch__shadow, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--%NS%disabled:active .mdc-switch__shadow, .mdc-switch.mdc-switch--disabled .mdc-switch__shadow {
  box-shadow: var(--%NS%mat-slide-toggle-disabled-handle-elevation-shadow);
}

.mdc-switch__ripple {
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: -1;
  width: var(--%NS%mat-slide-toggle-state-layer-size, 40px);
  height: var(--%NS%mat-slide-toggle-state-layer-size, 40px);
}
.mdc-switch__ripple::after {
  content: "";
  opacity: 0;
}
.mdc-switch--disabled .mdc-switch__ripple::after {
  display: none;
}
.mat-mdc-slide-toggle-disabled-interactive .mdc-switch__ripple::after {
  display: block;
}
.mdc-switch:hover .mdc-switch__ripple::after {
  transition: 75ms opacity cubic-bezier(0, 0, 0.2, 1);
}
.mat-mdc-slide-toggle-disabled-interactive.mdc-switch--%NS%disabled:enabled:focus .mdc-switch__ripple::after, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--%NS%disabled:enabled:active .mdc-switch__ripple::after, .mat-mdc-slide-toggle-disabled-interactive.mdc-switch--%NS%disabled:enabled:hover:not(:focus) .mdc-switch__ripple::after, .mdc-switch--%NS%unselected:enabled:hover:not(:focus) .mdc-switch__ripple::after {
  background: var(--%NS%mat-slide-toggle-unselected-hover-state-layer-color, var(--%NS%mat-sys-on-surface));
  opacity: var(--%NS%mat-slide-toggle-unselected-hover-state-layer-opacity, var(--%NS%mat-sys-hover-state-layer-opacity));
}
.mdc-switch--%NS%unselected:enabled:focus .mdc-switch__ripple::after {
  background: var(--%NS%mat-slide-toggle-unselected-focus-state-layer-color, var(--%NS%mat-sys-on-surface));
  opacity: var(--%NS%mat-slide-toggle-unselected-focus-state-layer-opacity, var(--%NS%mat-sys-focus-state-layer-opacity));
}
.mdc-switch--%NS%unselected:enabled:active .mdc-switch__ripple::after {
  background: var(--%NS%mat-slide-toggle-unselected-pressed-state-layer-color, var(--%NS%mat-sys-on-surface));
  opacity: var(--%NS%mat-slide-toggle-unselected-pressed-state-layer-opacity, var(--%NS%mat-sys-pressed-state-layer-opacity));
  transition: opacity 75ms linear;
}
.mdc-switch--%NS%selected:enabled:hover:not(:focus) .mdc-switch__ripple::after {
  background: var(--%NS%mat-slide-toggle-selected-hover-state-layer-color, var(--%NS%mat-sys-primary));
  opacity: var(--%NS%mat-slide-toggle-selected-hover-state-layer-opacity, var(--%NS%mat-sys-hover-state-layer-opacity));
}
.mdc-switch--%NS%selected:enabled:focus .mdc-switch__ripple::after {
  background: var(--%NS%mat-slide-toggle-selected-focus-state-layer-color, var(--%NS%mat-sys-primary));
  opacity: var(--%NS%mat-slide-toggle-selected-focus-state-layer-opacity, var(--%NS%mat-sys-focus-state-layer-opacity));
}
.mdc-switch--%NS%selected:enabled:active .mdc-switch__ripple::after {
  background: var(--%NS%mat-slide-toggle-selected-pressed-state-layer-color, var(--%NS%mat-sys-primary));
  opacity: var(--%NS%mat-slide-toggle-selected-pressed-state-layer-opacity, var(--%NS%mat-sys-pressed-state-layer-opacity));
  transition: opacity 75ms linear;
}

.mdc-switch__icons {
  position: relative;
  height: 100%;
  width: 100%;
  z-index: 1;
  transform: translateZ(0);
}
.mdc-switch--disabled.mdc-switch--unselected .mdc-switch__icons {
  opacity: var(--%NS%mat-slide-toggle-disabled-unselected-icon-opacity, 0.38);
}
.mdc-switch--disabled.mdc-switch--selected .mdc-switch__icons {
  opacity: var(--%NS%mat-slide-toggle-disabled-selected-icon-opacity, 0.38);
}

.mdc-switch__icon {
  bottom: 0;
  left: 0;
  margin: auto;
  position: absolute;
  right: 0;
  top: 0;
  opacity: 0;
  transition: opacity 30ms 0ms cubic-bezier(0.4, 0, 1, 1);
}
.mdc-switch--unselected .mdc-switch__icon {
  width: var(--%NS%mat-slide-toggle-unselected-icon-size, 16px);
  height: var(--%NS%mat-slide-toggle-unselected-icon-size, 16px);
  fill: var(--%NS%mat-slide-toggle-unselected-icon-color, var(--%NS%mat-sys-surface-variant));
}
.mdc-switch--unselected.mdc-switch--disabled .mdc-switch__icon {
  fill: var(--%NS%mat-slide-toggle-disabled-unselected-icon-color, var(--%NS%mat-sys-surface-variant));
}
.mdc-switch--selected .mdc-switch__icon {
  width: var(--%NS%mat-slide-toggle-selected-icon-size, 16px);
  height: var(--%NS%mat-slide-toggle-selected-icon-size, 16px);
  fill: var(--%NS%mat-slide-toggle-selected-icon-color, var(--%NS%mat-sys-on-primary-container));
}
.mdc-switch--selected.mdc-switch--disabled .mdc-switch__icon {
  fill: var(--%NS%mat-slide-toggle-disabled-selected-icon-color, var(--%NS%mat-sys-on-surface));
}

.mdc-switch--selected .mdc-switch__icon--on,
.mdc-switch--unselected .mdc-switch__icon--off {
  opacity: 1;
  transition: opacity 45ms 30ms cubic-bezier(0, 0, 0.2, 1);
}

.mat-mdc-slide-toggle {
  -webkit-user-select: none;
  user-select: none;
  display: inline-block;
  -webkit-tap-highlight-color: transparent;
  outline: 0;
}
.mat-mdc-slide-toggle .mat-icon {
  min-height: fit-content;
  flex-shrink: 0;
}
.mat-mdc-slide-toggle .mat-mdc-slide-toggle-ripple,
.mat-mdc-slide-toggle .mdc-switch__ripple::after {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}
.mat-mdc-slide-toggle .mat-mdc-slide-toggle-ripple:not(:empty),
.mat-mdc-slide-toggle .mdc-switch__ripple::after:not(:empty) {
  transform: translateZ(0);
}
.mat-mdc-slide-toggle.mat-mdc-slide-toggle-focused .mat-focus-indicator::before {
  content: "";
}
.mat-mdc-slide-toggle .mat-internal-form-field {
  color: var(--%NS%mat-slide-toggle-label-text-color, var(--%NS%mat-sys-on-surface));
  font-family: var(--%NS%mat-slide-toggle-label-text-font, var(--%NS%mat-sys-body-medium-font));
  line-height: var(--%NS%mat-slide-toggle-label-text-line-height, var(--%NS%mat-sys-body-medium-line-height));
  font-size: var(--%NS%mat-slide-toggle-label-text-size, var(--%NS%mat-sys-body-medium-size));
  letter-spacing: var(--%NS%mat-slide-toggle-label-text-tracking, var(--%NS%mat-sys-body-medium-tracking));
  font-weight: var(--%NS%mat-slide-toggle-label-text-weight, var(--%NS%mat-sys-body-medium-weight));
}
.mat-mdc-slide-toggle .mat-ripple-element {
  opacity: 0.12;
}
.mat-mdc-slide-toggle .mat-focus-indicator::before {
  border-radius: 50%;
}
.mat-mdc-slide-toggle._mat-animation-noopable .mdc-switch__handle-track,
.mat-mdc-slide-toggle._mat-animation-noopable .mdc-switch__icon,
.mat-mdc-slide-toggle._mat-animation-noopable .mdc-switch__handle::before,
.mat-mdc-slide-toggle._mat-animation-noopable .mdc-switch__handle::after,
.mat-mdc-slide-toggle._mat-animation-noopable .mdc-switch__track::before,
.mat-mdc-slide-toggle._mat-animation-noopable .mdc-switch__track::after {
  transition: none;
}
.mat-mdc-slide-toggle .mdc-switch:enabled + .mdc-label {
  cursor: pointer;
}
.mat-mdc-slide-toggle .mdc-switch--disabled + label {
  color: var(--%NS%mat-slide-toggle-disabled-label-text-color, var(--%NS%mat-sys-on-surface));
}
.mat-mdc-slide-toggle label:empty {
  display: none;
}

.mat-slide-toggle-full-width {
  width: 100%;
}
.mat-slide-toggle-full-width .mat-internal-form-field {
  width: 100%;
  justify-content: space-between;
}
.mat-slide-toggle-full-width .mat-internal-form-field label {
  margin: 0;
  flex-grow: 1;
  text-align: end;
}
.mat-slide-toggle-full-width .mdc-form-field--align-end label {
  text-align: start;
}

.mat-mdc-slide-toggle-touch-target {
  position: absolute;
  top: 50%;
  left: 50%;
  height: var(--%NS%mat-slide-toggle-touch-target-size, 48px);
  width: 100%;
  transform: translate(-50%, -50%);
  display: var(--%NS%mat-slide-toggle-touch-target-display, block);
}
[dir=rtl] .mat-mdc-slide-toggle-touch-target {
  left: auto;
  right: 50%;
  transform: translate(50%, -50%);
}
`],encapsulation:2})})()}return a})();var ke=(()=>{class a{static ɵfac=function(i){return new(i||a)};static ɵmod=ee({type:a});static ɵinj=K$1({imports:[ie,Ze$1]})}return a})();var me=(d,l)=>l.id;function de(d,l){if(d&1&&(Te(0,`mat-option`,7),Ft(1),Me()),d&2){let n=l.$implicit;Gi(`value`,n),le(),On(n)}}function pe(d,l){if(d&1&&(Te(0,`mat-option`,7),Ft(1),Me()),d&2){let n=l.$implicit;Gi(`value`,n),le(),On(n)}}function ue(d,l){if(d&1&&(Te(0,`mat-option`,7),Ft(1),Me()),d&2){let n=l.$implicit;Gi(`value`,n.id),le(),On(n.name)}}var re=class d{s=f$1(Mi$1);api=f$1(Gt);ui=f$1(cD);ref=f$1(vs);nav=f$1(di$1);busy=Le$1(!1);f={student:``,parent:``,phone:``,email:``,area:``,program:this.s.meta().programs?.[0],source:this.s.meta().sources?.[0],counsellorId:this.s.meta().counsellors?.[0]?.id};async save(){this.busy.set(!0);try{let l=await this.api.createLead(Object.assign({},this.f,{area:this.f.area||void 0,email:this.f.email||void 0}));this.ref.close(l),this.s.refreshBadges(),this.ui.toast(`${l.student||l.parent} added \xB7 welcome message sent on WhatsApp`,`Open`,()=>this.nav.open(l.id,`whatsapp`))}catch(l){this.ui.error(l)}this.busy.set(!1)}static ɵfac=function(n){return new(n||d)};static ɵcmp=te({type:d,selectors:[[`k3-new-lead`]],decls:57,vars:9,consts:[[`mat-dialog-title`,``],[1,`grid`,`g-2`,2,`gap`,`0 12px`],[`appearance`,`outline`],[`matInput`,``,`required`,``,`placeholder`,`e.g. Aarav Banerjee`,3,`ngModelChange`,`ngModel`],[`matInput`,``,`required`,``,`placeholder`,`e.g. Sourav Banerjee`,3,`ngModelChange`,`ngModel`],[`matInput`,``,`type`,`tel`,`required`,``,`placeholder`,`+91 98300 12345`,3,`ngModelChange`,`ngModel`],[3,`ngModelChange`,`ngModel`],[3,`value`],[`matInput`,``,`type`,`email`,3,`ngModelChange`,`ngModel`],[`matInput`,``,`placeholder`,`e.g. Salt Lake`,3,`ngModelChange`,`ngModel`],[1,`banner`,`info`],[1,`small`],[`align`,`end`],[`mat-button`,``,`mat-dialog-close`,``],[`mat-flat-button`,``,3,`click`,`disabled`]],template:function(n,t){n&1&&(Te(0,`h2`,0),Ft(1,`New admission enquiry`),Me(),Te(2,`mat-dialog-content`)(3,`div`,1)(4,`mat-form-field`,2)(5,`mat-label`),Ft(6,`Student name`),Me(),Te(7,`input`,3),ES(),zy(`ngModelChange`,function(e){return bx(t.f.student,e)||(t.f.student=e),e}),Me()(),Te(8,`mat-form-field`,2)(9,`mat-label`),Ft(10,`Parent / guardian`),Me(),Te(11,`input`,4),ES(),zy(`ngModelChange`,function(e){return bx(t.f.parent,e)||(t.f.parent=e),e}),Me()(),Te(12,`mat-form-field`,2)(13,`mat-label`),Ft(14,`WhatsApp number`),Me(),Te(15,`input`,5),ES(),zy(`ngModelChange`,function(e){return bx(t.f.phone,e)||(t.f.phone=e),e}),Me()(),Te(16,`mat-form-field`,2)(17,`mat-label`),Ft(18,`Program / class`),Me(),Te(19,`mat-select`,6),ES(),zy(`ngModelChange`,function(e){return bx(t.f.program,e)||(t.f.program=e),e}),PI(20,de,2,2,`mat-option`,7,OI),Me()(),Te(22,`mat-form-field`,2)(23,`mat-label`),Ft(24,`Lead source`),Me(),Te(25,`mat-select`,6),ES(),zy(`ngModelChange`,function(e){return bx(t.f.source,e)||(t.f.source=e),e}),PI(26,pe,2,2,`mat-option`,7,OI),Me()(),Te(28,`mat-form-field`,2)(29,`mat-label`),Ft(30,`Counsellor`),Me(),Te(31,`mat-select`,6),ES(),zy(`ngModelChange`,function(e){return bx(t.f.counsellorId,e)||(t.f.counsellorId=e),e}),PI(32,ue,2,2,`mat-option`,7,me),Me()(),Te(34,`mat-form-field`,2)(35,`mat-label`),Ft(36,`Email (optional)`),Me(),Te(37,`input`,8),ES(),zy(`ngModelChange`,function(e){return bx(t.f.email,e)||(t.f.email=e),e}),Me()(),Te(38,`mat-form-field`,2)(39,`mat-label`),Ft(40,`Area`),Me(),Te(41,`input`,9),ES(),zy(`ngModelChange`,function(e){return bx(t.f.area,e)||(t.f.area=e),e}),Me()()(),Te(42,`div`,10)(43,`mat-icon`),Ft(44,`bolt`),Me(),Te(45,`div`,11),Ft(46,`On save: the WhatsApp welcome template is sent instantly, the lead enters the `),Te(47,`b`),Ft(48,`New enquiry`),Me(),Ft(49,` sequence and a first-call task is created.`),Me()()(),Te(50,`mat-dialog-actions`,12)(51,`button`,13),Ft(52,`Cancel`),Me(),Te(53,`button`,14),Nr(`click`,function(){return t.save()}),Te(54,`mat-icon`),Ft(55,`send`),Me(),Ft(56,`Save & send WhatsApp`),Me()()),n&2&&(le(7),$y(`ngModel`,t.f.student),CS(),le(4),$y(`ngModel`,t.f.parent),CS(),le(4),$y(`ngModel`,t.f.phone),CS(),le(4),$y(`ngModel`,t.f.program),CS(),le(),FI(t.s.meta().programs),le(5),$y(`ngModel`,t.f.source),CS(),le(),FI(t.s.meta().sources),le(5),$y(`ngModel`,t.f.counsellorId),CS(),le(),FI(t.s.meta().counsellors),le(5),$y(`ngModel`,t.f.email),CS(),le(4),$y(`ngModel`,t.f.area),CS(),le(12),Gi(`disabled`,t.busy()||!t.f.student.trim()||!t.f.parent.trim()||!t.f.phone.trim()))},dependencies:[Mn$1,Pe,Vn,Qe,Yt,iD,J_,tD,rD,nD,Ep,Qc,Fe,bt,we$1,rr,ir,_n$1,yn$2,ee$1,Wv,zv],encapsulation:2})};var se=class d{s=f$1(Mi$1);api=f$1(Gt);ui=f$1(cD);ref=f$1(vs);busy=Le$1(!1);fileName=Le$1(``);welcome=!0;csv=`student,parent,phone,program,source
Ritika Paul,Sumana Paul,+91 98311 22334,Class 6,Event / Seminar
Aryan Mehta,Vikram Mehta,+91 90070 55667,Class 11 \u2013 Science,Google Ads`;pick(l){let n=l.target.files?.[0];n&&(this.fileName.set(n.name),n.text().then(t=>this.csv=t))}parse(){let l=e=>{let m=[],h=``,w=!1;for(let M of e)M===`"`?w=!w:M===`,`&&!w?(m.push(h),h=``):h+=M;return m.push(h),m.map(M=>M.trim())},n=this.csv.trim().split(/\r?\n/).filter(Boolean);if(n.length<2)return[];let t=l(n.shift()).map(e=>e.toLowerCase().replace(/\s+/g,`_`)),s=this.s.meta();return n.map(e=>{let m=l(e),h={};return t.forEach((w,M)=>h[w]=m[M]||``),h}).filter(e=>(e.student||e.parent)&&e.phone).map(e=>Object.assign(e,{source:s.sources.includes(e.source)?e.source:s.sources.includes(`Website Form`)?`Website Form`:s.sources[0],parent:e.parent||`Parent`,program:e.program||s.programs[0]}))}async go(){let l=this.parse();if(!l.length){this.ui.toast(`No valid rows found — student/parent and phone are required`);return}this.busy.set(!0);try{let n=await this.api.importLeads(l,this.welcome);this.ui.toast(`Imported ${n.imported} leads${n.duplicates?` \xB7 ${n.duplicates} duplicates skipped`:``}${n.errors?.length?` \xB7 ${n.errors.length} rows had errors`:``}${this.welcome?` · welcome messages queued`:``}`),this.s.refreshBadges(),this.ref.close(!0)}catch(n){this.ui.error(n)}this.busy.set(!1)}static ɵfac=function(n){return new(n||d)};static ɵcmp=te({type:d,selectors:[[`k3-import`]],decls:30,vars:4,consts:[[`file`,``],[`mat-dialog-title`,``],[1,`muted`,2,`margin-top`,`0`],[1,`row`,2,`margin-bottom`,`12px`],[`mat-stroked-button`,``,3,`click`],[1,`small`,`muted`],[`type`,`file`,`accept`,`.csv,text/csv`,`hidden`,``,3,`change`],[`appearance`,`outline`,1,`full`],[`matInput`,``,`rows`,`8`,1,`mono`,3,`ngModelChange`,`ngModel`],[3,`ngModelChange`,`ngModel`],[`align`,`end`],[`mat-button`,``,`mat-dialog-close`,``],[`mat-flat-button`,``,3,`click`,`disabled`]],template:function(n,t){if(n&1){let s=xf();Te(0,`h2`,1),Ft(1,`Import leads`),Me(),Te(2,`mat-dialog-content`)(3,`p`,2),Ft(4,`Paste CSV or choose a file. Columns: `),Te(5,`code`),Ft(6,`student, parent, phone, program, source`),Me(),Ft(7,`. Any extra columns are saved as custom fields (usable in templates).`),Me(),Te(8,`div`,3)(9,`button`,4),Nr(`click`,function(){Ea(s);let m=GI(16);return wa$1(m.click())}),Te(10,`mat-icon`),Ft(11,`attach_file`),Me(),Ft(12,`Choose .csv`),Me(),Te(13,`span`,5),Ft(14),Me(),Te(15,`input`,6,0),Nr(`change`,function(m){return t.pick(m)}),Me()(),Te(17,`mat-form-field`,7)(18,`mat-label`),Ft(19,`CSV`),Me(),Te(20,`textarea`,8),ES(),zy(`ngModelChange`,function(m){return Ea(s),bx(t.csv,m)||(t.csv=m),wa$1(m)}),Me()(),Te(21,`mat-slide-toggle`,9),ES(),zy(`ngModelChange`,function(m){return Ea(s),bx(t.welcome,m)||(t.welcome=m),wa$1(m)}),Ft(22,`Send the WhatsApp welcome template to every imported lead`),Me()(),Te(23,`mat-dialog-actions`,10)(24,`button`,11),Ft(25,`Cancel`),Me(),Te(26,`button`,12),Nr(`click`,function(){return t.go()}),Te(27,`mat-icon`),Ft(28,`upload`),Me(),Ft(29,`Import`),Me()()}n&2&&(le(14),On(t.fileName()),le(6),$y(`ngModel`,t.csv),CS(),le(),$y(`ngModel`,t.welcome),CS(),le(5),Gi(`disabled`,t.busy()))},dependencies:[Mn$1,Pe,Vn,Yt,iD,J_,tD,rD,nD,Ep,Qc,Fe,bt,we$1,rr,ir,_n$1,Wv,zv,ke,ie],encapsulation:2})};var Ma=new g(`MAT_DRAWER_DEFAULT_AUTOSIZE`,{providedIn:`root`,factory:()=>!1});var yt=new g(`MAT_DRAWER_CONTAINER`);var Ee=(()=>{class n extends Cp{_platform=f$1(re$1);_changeDetectorRef=f$1(Or);_element=f$1(B);_ngZone=f$1(N);_isInert=!1;_container=f$1(_t);ngAfterContentInit(){this._container._contentMarginChanges.subscribe(()=>this._changeDetectorRef.markForCheck())}_drawerToggled(e){e.opened?this._ngZone.runOutsideAngular(()=>{e._animationEnd.pipe(HD(50),we(1)).subscribe(()=>this._updateInert())}):this._updateInert()}_drawerModeChanged(){this._updateInert()}_updateInert(){let e=this._container._isShowingBackdrop();if(e!==this._isInert){let t=this._element.nativeElement;this._isInert=e,e?t.setAttribute(`inert`,`true`):t.removeAttribute(`inert`)}}_shouldBeHidden(){if(this._platform.isBrowser)return!1;let{start:e,end:t}=this._container;return e!=null&&e.mode!==`over`&&e.opened||t!=null&&t.mode!==`over`&&t.opened}static ɵfac=(()=>{let e;return function(a){return(e||(e=en$1(n)))(a||n)}})();static ɵcmp=(function(){return te({type:n,selectors:[[`mat-drawer-content`]],hostAttrs:[1,`mat-drawer-content`],hostVars:6,hostBindings:function(a,o){a&2&&(Tf(`margin-left`,o._container._contentMargins.left,`px`)(`margin-right`,o._container._contentMargins.right,`px`),ve(`mat-drawer-content-hidden`,o._shouldBeHidden()))},features:[Mf([{provide:Cp,useExisting:n}]),ge],ngContentSelectors:[`*`],decls:1,vars:0,template:function(a,o){a&1&&(Pt(),be(0))},encapsulation:2})})()}return n})();var vt=(()=>{class n{_elementRef=f$1(B);_focusTrapFactory=f$1(lp);_focusMonitor=f$1(Oo);_platform=f$1(re$1);_ngZone=f$1(N);_renderer=f$1(We$1);_interactivityChecker=f$1(Wc);_doc=f$1(C$1);_isAnimating=!1;_container=f$1(yt,{optional:!0});_focusTrap=null;_elementFocusedBeforeDrawerWasOpened=null;_eventCleanups;_isAttached=!1;_anchor=null;get position(){return this._position}set position(e){e=e===`end`?`end`:`start`,e!==this._position&&(this._isAttached&&this._updatePositionInParent(e),this._position=e,this.onPositionChanged.emit())}_position=`start`;get mode(){return this._mode}set mode(e){this._mode=e,this._updateFocusTrapState(),this._modeChanged.next(),this._getContent()?._drawerModeChanged()}_mode=`over`;get disableClose(){return this._disableClose}set disableClose(e){this._disableClose=ZG(e)}_disableClose=!1;get autoFocus(){return this._autoFocus??(this.mode===`side`?`dialog`:`first-tabbable`)}set autoFocus(e){(e===`true`||e===`false`||e==null)&&(e=ZG(e)),this._autoFocus=e}_autoFocus;get opened(){return this._opened()}set opened(e){this.toggle(ZG(e))}_opened=Le$1(!1);_openedVia=null;_animationStarted=new w;_animationEnd=new w;openedChange=new J(!0);_openedStream=this.openedChange.pipe(de$1(e=>e),Q(()=>{}));openedStart=this._animationStarted.pipe(de$1(()=>this.opened),xl(void 0));_closedStream=this.openedChange.pipe(de$1(e=>!e),Q(()=>{}));closedStart=this._animationStarted.pipe(de$1(()=>!this.opened),xl(void 0));_destroyed=new w;onPositionChanged=new J;_content;_modeChanged=new w;_injector=f$1(M);_changeDetectorRef=f$1(Or);constructor(){this.openedChange.pipe(yn$1(this._destroyed)).subscribe(e=>{e?(this._elementFocusedBeforeDrawerWasOpened=this._doc.activeElement,this._takeFocus()):this._isFocusWithinDrawer()&&this._restoreFocus(this._openedVia||`program`)}),this._eventCleanups=this._ngZone.runOutsideAngular(()=>{let e=this._renderer,t=this._elementRef.nativeElement;return[e.listen(t,`keydown`,a=>{a.keyCode===27&&!this.disableClose&&!Fn(a)&&this._ngZone.run(()=>{this.close(),a.stopPropagation(),a.preventDefault()})}),e.listen(t,`transitionend`,this._handleTransitionEvent),e.listen(t,`transitioncancel`,this._handleTransitionEvent)]}),this._animationEnd.subscribe(()=>{this.openedChange.emit(this.opened)})}_focusByCssSelector(e,t){let a=this._elementRef.nativeElement.querySelector(e);a&&(this._interactivityChecker.isFocusable(a)||(a.tabIndex=-1,this._ngZone.runOutsideAngular(()=>{let o=()=>{r(),u(),a.removeAttribute(`tabindex`)},r=this._renderer.listen(a,`blur`,o),u=this._renderer.listen(a,`mousedown`,o)})),a.focus(t))}_takeFocus(){if(!this._focusTrap)return;let e=this._elementRef.nativeElement;switch(this.autoFocus){case!1:case`dialog`:return;case!0:case`first-tabbable`:et$2(()=>{let t=this._isAnimating?{preventScroll:!0}:void 0;!this._focusTrap.focusInitialElement(t)&&typeof e.focus==`function`&&e.focus(t)},{injector:this._injector});break;case`first-heading`:this._focusByCssSelector(`h1, h2, h3, h4, h5, h6, [role="heading"]`);break;default:this._focusByCssSelector(this.autoFocus)}}_restoreFocus(e){this.autoFocus!==`dialog`&&(this._elementFocusedBeforeDrawerWasOpened?this._focusMonitor.focusVia(this._elementFocusedBeforeDrawerWasOpened,e):this._elementRef.nativeElement.blur(),this._elementFocusedBeforeDrawerWasOpened=null)}_isFocusWithinDrawer(){let e=this._doc.activeElement;return!!e&&this._elementRef.nativeElement.contains(e)}ngAfterViewInit(){this._isAttached=!0,this._position===`end`&&this._updatePositionInParent(`end`),this._platform.isBrowser&&(this._focusTrap=this._focusTrapFactory.create(this._elementRef.nativeElement),this._updateFocusTrapState())}ngOnDestroy(){this._eventCleanups.forEach(e=>e()),this._focusTrap?.destroy(),this._anchor?.remove(),this._anchor=null,this._animationStarted.complete(),this._animationEnd.complete(),this._modeChanged.complete(),this._destroyed.next(),this._destroyed.complete()}open(e){return this.toggle(!0,e)}close(){return this.toggle(!1)}_closeViaBackdropClick(){return this._setOpen(!1,!0,`mouse`)}toggle(e=!this.opened,t){e&&t&&(this._openedVia=t);let a=this._setOpen(e,!e&&this._isFocusWithinDrawer(),this._openedVia||`program`);return e||(this._openedVia=null),a}_setOpen(e,t,a){return e===this.opened?Promise.resolve(e?`open`:`close`):(this._opened.set(e),this._getContent()?._drawerToggled(this),this._container?._transitionsEnabled?this._isAnimating?(this._setIsAnimating(!1),this._simulateAnimation()):(this._setIsAnimating(!0),setTimeout(()=>this._animationStarted.next())):this._simulateAnimation(),this._elementRef.nativeElement.classList.toggle(`mat-drawer-opened`,e),!e&&t&&this._restoreFocus(a),this._changeDetectorRef.markForCheck(),this._updateFocusTrapState(),new Promise(o=>{this.openedChange.pipe(we(1)).subscribe(r=>o(r?`open`:`close`))}))}_getContent(){return this._container?._content||this._container?._userContent}_setIsAnimating(e){e!==this._isAnimating&&(this._isAnimating=e,this._elementRef.nativeElement.classList.toggle(`mat-drawer-animating`,e))}_simulateAnimation(){setTimeout(()=>{this._animationStarted.next(),this._animationEnd.next()})}_getWidth(){return this._elementRef.nativeElement.offsetWidth||0}_updateFocusTrapState(){this._focusTrap&&(this._focusTrap.enabled=this.opened&&!!this._container?._isShowingBackdrop())}_updatePositionInParent(e){if(!this._platform.isBrowser)return;let t=this._elementRef.nativeElement,a=t.parentNode;e===`end`?(this._anchor||(this._anchor=this._doc.createComment(`mat-drawer-anchor`),a.insertBefore(this._anchor,t)),a.appendChild(t)):this._anchor&&this._anchor.parentNode.insertBefore(t,this._anchor)}_handleTransitionEvent=e=>{let t=this._elementRef.nativeElement;e.target===t&&this._ngZone.run(()=>{e.type===`transitionend`&&this._setIsAnimating(!1),this._animationEnd.next(e)})};static ɵfac=function(t){return new(t||n)};static ɵcmp=(function(){let e=[`content`];return te({type:n,selectors:[[`mat-drawer`]],viewQuery:function(o,r){if(o&1&&Ar(e,5),o&2){let u;kr(u=Rr())&&(r._content=u.first)}},hostAttrs:[1,`mat-drawer`],hostVars:12,hostBindings:function(o,r){o&2&&(Be$1(`align`,null)(`tabIndex`,r.mode!==`side`?`-1`:null),Tf(`visibility`,!r._container&&!r.opened?`hidden`:null),ve(`mat-drawer-end`,r.position===`end`)(`mat-drawer-over`,r.mode===`over`)(`mat-drawer-push`,r.mode===`push`)(`mat-drawer-side`,r.mode===`side`))},inputs:{position:`position`,mode:`mode`,disableClose:`disableClose`,autoFocus:`autoFocus`,opened:`opened`},outputs:{openedChange:`openedChange`,_openedStream:`opened`,openedStart:`openedStart`,_closedStream:`closed`,closedStart:`closedStart`,onPositionChanged:`positionChanged`},exportAs:[`matDrawer`],ngContentSelectors:[`*`],decls:3,vars:0,consts:[[`content`,``],[`cdkScrollable`,``,1,`mat-drawer-inner-container`]],template:function(o,r){o&1&&(Pt(),Te(0,`div`,1,0),be(2),Me())},dependencies:[Cp],encapsulation:2})})()}return n})();var _t=(()=>{class n{_dir=f$1(cn$1,{optional:!0});_element=f$1(B);_ngZone=f$1(N);_changeDetectorRef=f$1(Or);_animationDisabled=it$1();_transitionsEnabled=!1;_allDrawers;_drawers=new Cr;_content;_userContent;get start(){return this._start}get end(){return this._end}get autosize(){return this._autosize}set autosize(e){this._autosize=ZG(e)}_autosize=f$1(Ma);get hasBackdrop(){return this._drawerHasBackdrop(this._start)||this._drawerHasBackdrop(this._end)}set hasBackdrop(e){this._backdropOverride=e==null?null:ZG(e)}_backdropOverride=null;backdropClick=new J;_start=null;_end=null;_left=null;_right=null;_destroyed=new w;_doCheckSubject=new w;_contentMargins={left:null,right:null};_contentMarginChanges=new w;get scrollable(){return this._userContent||this._content}_injector=f$1(M);constructor(){let e=f$1(re$1),t=f$1(jo);this._dir?.change.pipe(yn$1(this._destroyed)).subscribe(()=>{this._validateDrawers(),this.updateContentMargins()}),t.change().pipe(yn$1(this._destroyed)).subscribe(()=>this.updateContentMargins()),!this._animationDisabled&&e.isBrowser&&this._ngZone.runOutsideAngular(()=>{setTimeout(()=>{this._element.nativeElement.classList.add(`mat-drawer-transition`),this._transitionsEnabled=!0},200)})}ngAfterContentInit(){this._allDrawers.changes.pipe(bn$1(this._allDrawers),yn$1(this._destroyed)).subscribe(e=>{this._drawers.reset(e.filter(t=>!t._container||t._container===this)),this._drawers.notifyOnChanges()}),this._drawers.changes.pipe(bn$1(null)).subscribe(()=>{this._validateDrawers(),this._drawers.forEach(e=>{this._watchDrawerToggle(e),this._watchDrawerPosition(e),this._watchDrawerMode(e)}),(!this._drawers.length||this._isDrawerOpen(this._start)||this._isDrawerOpen(this._end))&&this.updateContentMargins(),this._changeDetectorRef.markForCheck()}),this._ngZone.runOutsideAngular(()=>{this._doCheckSubject.pipe(Qn(10),yn$1(this._destroyed)).subscribe(()=>this.updateContentMargins())})}ngOnDestroy(){this._contentMarginChanges.complete(),this._doCheckSubject.complete(),this._drawers.destroy(),this._destroyed.next(),this._destroyed.complete()}open(){this._drawers.forEach(e=>e.open())}close(){this._drawers.forEach(e=>e.close())}updateContentMargins(){let e=0,t=0;if(this._left&&this._left.opened){if(this._left.mode==`side`)e+=this._left._getWidth();else if(this._left.mode==`push`){let a=this._left._getWidth();e+=a,t-=a}}if(this._right&&this._right.opened){if(this._right.mode==`side`)t+=this._right._getWidth();else if(this._right.mode==`push`){let a=this._right._getWidth();t+=a,e-=a}}e=e||null,t=t||null,(e!==this._contentMargins.left||t!==this._contentMargins.right)&&(this._contentMargins={left:e,right:t},this._ngZone.run(()=>this._contentMarginChanges.next(this._contentMargins)))}ngDoCheck(){this._autosize&&this._isPushed()&&this._ngZone.runOutsideAngular(()=>this._doCheckSubject.next())}_watchDrawerToggle(e){e._animationStarted.pipe(yn$1(this._drawers.changes)).subscribe(()=>{this.updateContentMargins(),this._changeDetectorRef.markForCheck()}),e.mode!==`side`&&e.openedChange.pipe(yn$1(this._drawers.changes)).subscribe(()=>this._setContainerClass(e.opened))}_watchDrawerPosition(e){e.onPositionChanged.pipe(yn$1(this._drawers.changes)).subscribe(()=>{et$2({read:()=>this._validateDrawers()},{injector:this._injector})})}_watchDrawerMode(e){e._modeChanged.pipe(yn$1(Sl(this._drawers.changes,this._destroyed))).subscribe(()=>{this.updateContentMargins(),this._changeDetectorRef.markForCheck()})}_setContainerClass(e){let t=this._element.nativeElement.classList,a=`mat-drawer-container-has-open`;e?t.add(a):t.remove(a)}_validateDrawers(){this._start=this._end=null,this._drawers.forEach(e=>{e.position==`end`?(this._end,this._end=e):(this._start,this._start=e)}),this._right=this._left=null,this._dir&&this._dir.value===`rtl`?(this._left=this._end,this._right=this._start):(this._left=this._start,this._right=this._end)}_isPushed(){return this._isDrawerOpen(this._start)&&this._start.mode!=`over`||this._isDrawerOpen(this._end)&&this._end.mode!=`over`}_onBackdropClicked(){this.backdropClick.emit(),this._closeModalDrawersViaBackdrop()}_closeModalDrawersViaBackdrop(){[this._start,this._end].filter(e=>e&&!e.disableClose&&this._drawerHasBackdrop(e)).forEach(e=>e._closeViaBackdropClick())}_isShowingBackdrop(){return this._isDrawerOpen(this._start)&&this._drawerHasBackdrop(this._start)||this._isDrawerOpen(this._end)&&this._drawerHasBackdrop(this._end)}_isDrawerOpen(e){return e!=null&&e.opened}_drawerHasBackdrop(e){return this._backdropOverride==null?!!e&&e.mode!==`side`:this._backdropOverride}static ɵfac=function(t){return new(t||n)};static ɵcmp=(function(){let e=[[[`mat-drawer`],[`mat-sidenav`]],[[`mat-drawer-content`],[`mat-sidenav-content`]],`*`],t=[`mat-drawer, mat-sidenav`,`mat-drawer-content, mat-sidenav-content`,`*`];function a(r,u){if(r&1){let p=xf();Te(0,`div`,1),Nr(`click`,function(){Ea(p);let _=To();return wa$1(_._onBackdropClicked())}),Me()}if(r&2){let p=To();ve(`mat-drawer-shown`,p._isShowingBackdrop())}}function o(r,u){r&1&&(Te(0,`mat-drawer-content`),be(1,2),Me())}return te({type:n,selectors:[[`mat-drawer-container`]],contentQueries:function(u,p,w){if(u&1&&My(w,Ee,5)(w,vt,5),u&2){let _;kr(_=Rr())&&(p._content=_.first),kr(_=Rr())&&(p._allDrawers=_)}},viewQuery:function(u,p){if(u&1&&Ar(Ee,5),u&2){let w;kr(w=Rr())&&(p._userContent=w.first)}},hostAttrs:[1,`mat-drawer-container`],hostVars:2,hostBindings:function(u,p){u&2&&ve(`mat-drawer-container-explicit-backdrop`,p._backdropOverride)},inputs:{autosize:`autosize`,hasBackdrop:`hasBackdrop`},outputs:{backdropClick:`backdropClick`},exportAs:[`matDrawerContainer`],features:[Mf([{provide:yt,useExisting:n}])],ngContentSelectors:t,decls:4,vars:2,consts:[[1,`mat-drawer-backdrop`,3,`mat-drawer-shown`],[1,`mat-drawer-backdrop`,3,`click`]],template:function(u,p){u&1&&(Pt(e),yt$1(0,a,1,2,`div`,0),be(1),be(2,1),yt$1(3,o,2,0,`mat-drawer-content`)),u&2&&(vt$1(p.hasBackdrop?0:-1),le(3),vt$1(p._content?-1:3))},dependencies:[Ee],styles:[`.mat-drawer-container {
  position: relative;
  z-index: 1;
  color: var(--%NS%mat-sidenav-content-text-color, var(--%NS%mat-sys-on-background));
  background-color: var(--%NS%mat-sidenav-content-background-color, var(--%NS%mat-sys-background));
  box-sizing: border-box;
  display: block;
  overflow: hidden;
}
.mat-drawer-container[fullscreen] {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
}
.mat-drawer-container[fullscreen].mat-drawer-container-has-open {
  overflow: hidden;
}
.mat-drawer-container.mat-drawer-container-explicit-backdrop .mat-drawer-side {
  z-index: 3;
}
.mat-drawer-container.ng-animate-disabled .mat-drawer-backdrop,
.mat-drawer-container.ng-animate-disabled .mat-drawer-content, .ng-animate-disabled .mat-drawer-container .mat-drawer-backdrop,
.ng-animate-disabled .mat-drawer-container .mat-drawer-content {
  transition: none;
}

.mat-drawer-backdrop {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  display: block;
  z-index: 3;
  visibility: hidden;
}
.mat-drawer-backdrop.mat-drawer-shown {
  visibility: visible;
  background-color: var(--%NS%mat-sidenav-scrim-color, color-mix(in srgb, var(--%NS%mat-sys-neutral-variant20) 40%, transparent));
}
.mat-drawer-transition .mat-drawer-backdrop {
  transition-duration: 400ms;
  transition-timing-function: cubic-bezier(0.25, 0.8, 0.25, 1);
  transition-property: background-color, visibility;
}
@media (forced-colors: active) {
  .mat-drawer-backdrop {
    opacity: 0.5;
  }
}

.mat-drawer-content {
  position: relative;
  z-index: 1;
  display: block;
  height: 100%;
  overflow: auto;
}
.mat-drawer-content.mat-drawer-content-hidden {
  opacity: 0;
}
.mat-drawer-transition .mat-drawer-content {
  transition-duration: 400ms;
  transition-timing-function: cubic-bezier(0.25, 0.8, 0.25, 1);
  transition-property: transform, margin-left, margin-right;
}

.mat-drawer {
  position: relative;
  z-index: 4;
  color: var(--%NS%mat-sidenav-container-text-color, var(--%NS%mat-sys-on-surface-variant));
  box-shadow: var(--%NS%mat-sidenav-container-elevation-shadow, none);
  background-color: var(--%NS%mat-sidenav-container-background-color, var(--%NS%mat-sys-surface));
  border-top-right-radius: var(--%NS%mat-sidenav-container-shape, var(--%NS%mat-sys-corner-large));
  border-bottom-right-radius: var(--%NS%mat-sidenav-container-shape, var(--%NS%mat-sys-corner-large));
  width: var(--%NS%mat-sidenav-container-width, 360px);
  display: block;
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 3;
  outline: 0;
  box-sizing: border-box;
  overflow-y: auto;
  transform: translate3d(-100%, 0, 0);
}
@media (forced-colors: active) {
  .mat-drawer, [dir=rtl] .mat-drawer.mat-drawer-end {
    border-right: solid 1px currentColor;
  }
}
@media (forced-colors: active) {
  [dir=rtl] .mat-drawer, .mat-drawer.mat-drawer-end {
    border-left: solid 1px currentColor;
    border-right: none;
  }
}
.mat-drawer.mat-drawer-side {
  z-index: 2;
}
.mat-drawer.mat-drawer-end {
  right: 0;
  transform: translate3d(100%, 0, 0);
  border-top-left-radius: var(--%NS%mat-sidenav-container-shape, var(--%NS%mat-sys-corner-large));
  border-bottom-left-radius: var(--%NS%mat-sidenav-container-shape, var(--%NS%mat-sys-corner-large));
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
[dir=rtl] .mat-drawer {
  border-top-left-radius: var(--%NS%mat-sidenav-container-shape, var(--%NS%mat-sys-corner-large));
  border-bottom-left-radius: var(--%NS%mat-sidenav-container-shape, var(--%NS%mat-sys-corner-large));
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  transform: translate3d(100%, 0, 0);
}
[dir=rtl] .mat-drawer.mat-drawer-end {
  border-top-right-radius: var(--%NS%mat-sidenav-container-shape, var(--%NS%mat-sys-corner-large));
  border-bottom-right-radius: var(--%NS%mat-sidenav-container-shape, var(--%NS%mat-sys-corner-large));
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  left: 0;
  right: auto;
  transform: translate3d(-100%, 0, 0);
}
.mat-drawer-transition .mat-drawer {
  transition: transform 400ms cubic-bezier(0.25, 0.8, 0.25, 1);
}
.mat-drawer:not(.mat-drawer-opened):not(.mat-drawer-animating) {
  visibility: hidden;
  box-shadow: none;
}
.mat-drawer:not(.mat-drawer-opened):not(.mat-drawer-animating) .mat-drawer-inner-container {
  display: none;
}
.mat-drawer.mat-drawer-opened.mat-drawer-opened {
  transform: none;
}

.mat-drawer-side {
  box-shadow: none;
  border-right-color: var(--%NS%mat-sidenav-container-divider-color, transparent);
  border-right-width: 1px;
  border-right-style: solid;
}
.mat-drawer-side.mat-drawer-end {
  border-left-color: var(--%NS%mat-sidenav-container-divider-color, transparent);
  border-left-width: 1px;
  border-left-style: solid;
  border-right: none;
}
[dir=rtl] .mat-drawer-side {
  border-left-color: var(--%NS%mat-sidenav-container-divider-color, transparent);
  border-left-width: 1px;
  border-left-style: solid;
  border-right: none;
}
[dir=rtl] .mat-drawer-side.mat-drawer-end {
  border-right-color: var(--%NS%mat-sidenav-container-divider-color, transparent);
  border-right-width: 1px;
  border-right-style: solid;
  border-left: none;
}

.mat-drawer-inner-container {
  width: 100%;
  height: 100%;
  overflow: auto;
}

.mat-sidenav-fixed {
  position: fixed;
}
`],encapsulation:2})})()}return n})();var Je=(()=>{class n extends Ee{static ɵfac=(()=>{let e;return function(a){return(e||(e=en$1(n)))(a||n)}})();static ɵcmp=(function(){return te({type:n,selectors:[[`mat-sidenav-content`]],hostAttrs:[1,`mat-drawer-content`,`mat-sidenav-content`],features:[Mf([{provide:Cp,useExisting:n},{provide:Ee,useExisting:n}]),ge],ngContentSelectors:[`*`],decls:1,vars:0,template:function(a,o){a&1&&(Pt(),be(0))},encapsulation:2})})()}return n})();var wt=(()=>{class n extends vt{get fixedInViewport(){return this._fixedInViewport}set fixedInViewport(e){this._fixedInViewport=ZG(e)}_fixedInViewport=!1;get fixedTopGap(){return this._fixedTopGap}set fixedTopGap(e){this._fixedTopGap=Vr(e)}_fixedTopGap=0;get fixedBottomGap(){return this._fixedBottomGap}set fixedBottomGap(e){this._fixedBottomGap=Vr(e)}_fixedBottomGap=0;static ɵfac=(()=>{let e;return function(a){return(e||(e=en$1(n)))(a||n)}})();static ɵcmp=(function(){return te({type:n,selectors:[[`mat-sidenav`]],hostAttrs:[1,`mat-drawer`,`mat-sidenav`],hostVars:16,hostBindings:function(a,o){a&2&&(Be$1(`tabIndex`,o.mode!==`side`?`-1`:null)(`align`,null),Tf(`top`,o.fixedInViewport?o.fixedTopGap:null,`px`)(`bottom`,o.fixedInViewport?o.fixedBottomGap:null,`px`),ve(`mat-drawer-end`,o.position===`end`)(`mat-drawer-over`,o.mode===`over`)(`mat-drawer-push`,o.mode===`push`)(`mat-drawer-side`,o.mode===`side`)(`mat-sidenav-fixed`,o.fixedInViewport))},inputs:{fixedInViewport:`fixedInViewport`,fixedTopGap:`fixedTopGap`,fixedBottomGap:`fixedBottomGap`},exportAs:[`matSidenav`],features:[Mf([{provide:vt,useExisting:n}]),ge],ngContentSelectors:[`*`],decls:3,vars:0,consts:[[`content`,``],[`cdkScrollable`,``,1,`mat-drawer-inner-container`]],template:function(a,o){a&1&&(Pt(),Te(0,`div`,1,0),be(2),Me())},dependencies:[Cp],encapsulation:2})})()}return n})();var ia=(()=>{class n extends _t{_allDrawers=void 0;_content=void 0;static ɵfac=(()=>{let e;return function(a){return(e||(e=en$1(n)))(a||n)}})();static ɵcmp=(function(){let e=[[[`mat-drawer`],[`mat-sidenav`]],[[`mat-drawer-content`],[`mat-sidenav-content`]],`*`],t=[`mat-drawer, mat-sidenav`,`mat-drawer-content, mat-sidenav-content`,`*`];function a(r,u){if(r&1){let p=xf();Te(0,`div`,1),Nr(`click`,function(){Ea(p);let _=To();return wa$1(_._onBackdropClicked())}),Me()}if(r&2){let p=To();ve(`mat-drawer-shown`,p._isShowingBackdrop())}}function o(r,u){r&1&&(Te(0,`mat-sidenav-content`),be(1,2),Me())}return te({type:n,selectors:[[`mat-sidenav-container`]],contentQueries:function(u,p,w){if(u&1&&My(w,Je,5)(w,wt,5),u&2){let _;kr(_=Rr())&&(p._content=_.first),kr(_=Rr())&&(p._allDrawers=_)}},hostAttrs:[1,`mat-drawer-container`,`mat-sidenav-container`],hostVars:2,hostBindings:function(u,p){u&2&&ve(`mat-drawer-container-explicit-backdrop`,p._backdropOverride)},exportAs:[`matSidenavContainer`],features:[Mf([{provide:yt,useExisting:n},{provide:_t,useExisting:n}]),ge],ngContentSelectors:t,decls:4,vars:2,consts:[[1,`mat-drawer-backdrop`,3,`mat-drawer-shown`],[1,`mat-drawer-backdrop`,3,`click`]],template:function(u,p){u&1&&(Pt(e),yt$1(0,a,1,2,`div`,0),be(1),be(2,1),yt$1(3,o,2,0,`mat-sidenav-content`)),u&2&&(vt$1(p.hasBackdrop?0:-1),le(3),vt$1(p._content?-1:3))},dependencies:[Je],styles:[`.mat-drawer-container {
  position: relative;
  z-index: 1;
  color: var(--%NS%mat-sidenav-content-text-color, var(--%NS%mat-sys-on-background));
  background-color: var(--%NS%mat-sidenav-content-background-color, var(--%NS%mat-sys-background));
  box-sizing: border-box;
  display: block;
  overflow: hidden;
}
.mat-drawer-container[fullscreen] {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
}
.mat-drawer-container[fullscreen].mat-drawer-container-has-open {
  overflow: hidden;
}
.mat-drawer-container.mat-drawer-container-explicit-backdrop .mat-drawer-side {
  z-index: 3;
}
.mat-drawer-container.ng-animate-disabled .mat-drawer-backdrop,
.mat-drawer-container.ng-animate-disabled .mat-drawer-content, .ng-animate-disabled .mat-drawer-container .mat-drawer-backdrop,
.ng-animate-disabled .mat-drawer-container .mat-drawer-content {
  transition: none;
}

.mat-drawer-backdrop {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  display: block;
  z-index: 3;
  visibility: hidden;
}
.mat-drawer-backdrop.mat-drawer-shown {
  visibility: visible;
  background-color: var(--%NS%mat-sidenav-scrim-color, color-mix(in srgb, var(--%NS%mat-sys-neutral-variant20) 40%, transparent));
}
.mat-drawer-transition .mat-drawer-backdrop {
  transition-duration: 400ms;
  transition-timing-function: cubic-bezier(0.25, 0.8, 0.25, 1);
  transition-property: background-color, visibility;
}
@media (forced-colors: active) {
  .mat-drawer-backdrop {
    opacity: 0.5;
  }
}

.mat-drawer-content {
  position: relative;
  z-index: 1;
  display: block;
  height: 100%;
  overflow: auto;
}
.mat-drawer-content.mat-drawer-content-hidden {
  opacity: 0;
}
.mat-drawer-transition .mat-drawer-content {
  transition-duration: 400ms;
  transition-timing-function: cubic-bezier(0.25, 0.8, 0.25, 1);
  transition-property: transform, margin-left, margin-right;
}

.mat-drawer {
  position: relative;
  z-index: 4;
  color: var(--%NS%mat-sidenav-container-text-color, var(--%NS%mat-sys-on-surface-variant));
  box-shadow: var(--%NS%mat-sidenav-container-elevation-shadow, none);
  background-color: var(--%NS%mat-sidenav-container-background-color, var(--%NS%mat-sys-surface));
  border-top-right-radius: var(--%NS%mat-sidenav-container-shape, var(--%NS%mat-sys-corner-large));
  border-bottom-right-radius: var(--%NS%mat-sidenav-container-shape, var(--%NS%mat-sys-corner-large));
  width: var(--%NS%mat-sidenav-container-width, 360px);
  display: block;
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 3;
  outline: 0;
  box-sizing: border-box;
  overflow-y: auto;
  transform: translate3d(-100%, 0, 0);
}
@media (forced-colors: active) {
  .mat-drawer, [dir=rtl] .mat-drawer.mat-drawer-end {
    border-right: solid 1px currentColor;
  }
}
@media (forced-colors: active) {
  [dir=rtl] .mat-drawer, .mat-drawer.mat-drawer-end {
    border-left: solid 1px currentColor;
    border-right: none;
  }
}
.mat-drawer.mat-drawer-side {
  z-index: 2;
}
.mat-drawer.mat-drawer-end {
  right: 0;
  transform: translate3d(100%, 0, 0);
  border-top-left-radius: var(--%NS%mat-sidenav-container-shape, var(--%NS%mat-sys-corner-large));
  border-bottom-left-radius: var(--%NS%mat-sidenav-container-shape, var(--%NS%mat-sys-corner-large));
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
[dir=rtl] .mat-drawer {
  border-top-left-radius: var(--%NS%mat-sidenav-container-shape, var(--%NS%mat-sys-corner-large));
  border-bottom-left-radius: var(--%NS%mat-sidenav-container-shape, var(--%NS%mat-sys-corner-large));
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  transform: translate3d(100%, 0, 0);
}
[dir=rtl] .mat-drawer.mat-drawer-end {
  border-top-right-radius: var(--%NS%mat-sidenav-container-shape, var(--%NS%mat-sys-corner-large));
  border-bottom-right-radius: var(--%NS%mat-sidenav-container-shape, var(--%NS%mat-sys-corner-large));
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  left: 0;
  right: auto;
  transform: translate3d(-100%, 0, 0);
}
.mat-drawer-transition .mat-drawer {
  transition: transform 400ms cubic-bezier(0.25, 0.8, 0.25, 1);
}
.mat-drawer:not(.mat-drawer-opened):not(.mat-drawer-animating) {
  visibility: hidden;
  box-shadow: none;
}
.mat-drawer:not(.mat-drawer-opened):not(.mat-drawer-animating) .mat-drawer-inner-container {
  display: none;
}
.mat-drawer.mat-drawer-opened.mat-drawer-opened {
  transform: none;
}

.mat-drawer-side {
  box-shadow: none;
  border-right-color: var(--%NS%mat-sidenav-container-divider-color, transparent);
  border-right-width: 1px;
  border-right-style: solid;
}
.mat-drawer-side.mat-drawer-end {
  border-left-color: var(--%NS%mat-sidenav-container-divider-color, transparent);
  border-left-width: 1px;
  border-left-style: solid;
  border-right: none;
}
[dir=rtl] .mat-drawer-side {
  border-left-color: var(--%NS%mat-sidenav-container-divider-color, transparent);
  border-left-width: 1px;
  border-left-style: solid;
  border-right: none;
}
[dir=rtl] .mat-drawer-side.mat-drawer-end {
  border-right-color: var(--%NS%mat-sidenav-container-divider-color, transparent);
  border-right-width: 1px;
  border-right-style: solid;
  border-left: none;
}

.mat-drawer-inner-container {
  width: 100%;
  height: 100%;
  overflow: auto;
}

.mat-sidenav-fixed {
  position: fixed;
}
`],encapsulation:2})})()}return n})();var oa=(()=>{class n{static ɵfac=function(t){return new(t||n)};static ɵmod=ee({type:n});static ɵinj=K$1({imports:[wp,Ze$1,wp]})}return n})();var Oa=(()=>{class n{static ɵfac=function(t){return new(t||n)};static ɵdir=W({type:n,selectors:[[`mat-toolbar-row`]],hostAttrs:[1,`mat-toolbar-row`],exportAs:[`matToolbarRow`]})}return n})();var ra=(()=>{class n{_elementRef=f$1(B);_platform=f$1(re$1);_document=f$1(C$1);color;_toolbarRows;ngAfterViewInit(){this._platform.isBrowser&&(this._checkToolbarMixedModes(),this._toolbarRows.changes.subscribe(()=>this._checkToolbarMixedModes()))}_checkToolbarMixedModes(){this._toolbarRows.length}static ɵfac=function(t){return new(t||n)};static ɵcmp=(function(){let e=[`*`,[[`mat-toolbar-row`]]];return te({type:n,selectors:[[`mat-toolbar`]],contentQueries:function(o,r,u){if(o&1&&My(u,Oa,5),o&2){let p;kr(p=Rr())&&(r._toolbarRows=p)}},hostAttrs:[1,`mat-toolbar`],hostVars:6,hostBindings:function(o,r){o&2&&(Zi$1(r.color?`mat-`+r.color:``),ve(`mat-toolbar-multiple-rows`,r._toolbarRows.length>0)(`mat-toolbar-single-row`,r._toolbarRows.length===0))},inputs:{color:`color`},exportAs:[`matToolbar`],ngContentSelectors:[`*`,`mat-toolbar-row`],decls:2,vars:0,template:function(o,r){o&1&&(Pt(e),be(0),be(1,1))},styles:[`.mat-toolbar {
  background: var(--%NS%mat-toolbar-container-background-color, var(--%NS%mat-sys-surface));
  color: var(--%NS%mat-toolbar-container-text-color, var(--%NS%mat-sys-on-surface));
}
.mat-toolbar, .mat-toolbar h1, .mat-toolbar h2, .mat-toolbar h3, .mat-toolbar h4, .mat-toolbar h5, .mat-toolbar h6 {
  font-family: var(--%NS%mat-toolbar-title-text-font, var(--%NS%mat-sys-title-large-font));
  font-size: var(--%NS%mat-toolbar-title-text-size, var(--%NS%mat-sys-title-large-size));
  line-height: var(--%NS%mat-toolbar-title-text-line-height, var(--%NS%mat-sys-title-large-line-height));
  font-weight: var(--%NS%mat-toolbar-title-text-weight, var(--%NS%mat-sys-title-large-weight));
  letter-spacing: var(--%NS%mat-toolbar-title-text-tracking, var(--%NS%mat-sys-title-large-tracking));
  margin: 0;
}
@media (forced-colors: active) {
  .mat-toolbar {
    outline: solid 1px;
  }
}
.mat-toolbar .mat-form-field-underline,
.mat-toolbar .mat-form-field-ripple,
.mat-toolbar .mat-focused .mat-form-field-ripple {
  background-color: currentColor;
}
.mat-toolbar .mat-form-field-label,
.mat-toolbar .mat-focused .mat-form-field-label,
.mat-toolbar .mat-select-value,
.mat-toolbar .mat-select-arrow,
.mat-toolbar .mat-form-field.mat-focused .mat-select-arrow {
  color: inherit;
}
.mat-toolbar .mat-input-element {
  caret-color: currentColor;
}
.mat-toolbar .mat-mdc-button-base.mat-mdc-button-base.mat-unthemed {
  --%NS%mat-button-text-label-text-color: var(--%NS%mat-toolbar-container-text-color, var(--%NS%mat-sys-on-surface));
  --%NS%mat-button-outlined-label-text-color: var(--%NS%mat-toolbar-container-text-color, var(--%NS%mat-sys-on-surface));
}

.mat-toolbar-row, .mat-toolbar-single-row {
  display: flex;
  box-sizing: border-box;
  padding: 0 16px;
  width: 100%;
  flex-direction: row;
  align-items: center;
  white-space: nowrap;
  height: var(--%NS%mat-toolbar-standard-height, 64px);
}
@media (max-width: 599px) {
  .mat-toolbar-row, .mat-toolbar-single-row {
    height: var(--%NS%mat-toolbar-mobile-height, 56px);
  }
}

.mat-toolbar-multiple-rows {
  display: flex;
  box-sizing: border-box;
  flex-direction: column;
  width: 100%;
  min-height: var(--%NS%mat-toolbar-standard-height, 64px);
}
@media (max-width: 599px) {
  .mat-toolbar-multiple-rows {
    min-height: var(--%NS%mat-toolbar-mobile-height, 56px);
  }
}
`],encapsulation:2})})()}return n})();var sa=(()=>{class n{static ɵfac=function(t){return new(t||n)};static ɵmod=ee({type:n});static ɵinj=K$1({imports:[Ze$1]})}return n})();var la=(()=>{class n{static ɵfac=function(t){return new(t||n)};static ɵmod=ee({type:n});static ɵinj=K$1({imports:[up,Ze$1]})}return n})();var xt=class{source;option;constructor(i,e){this.source=i,this.option=e}};var ca=new g(`mat-autocomplete-default-options`,{providedIn:`root`,factory:()=>({autoActiveFirstOption:!1,autoSelectActiveOption:!1,hideSingleSelectionIndicator:!1,requireSelection:!1,hasBackdrop:!1})});var ma=(()=>{class n{_changeDetectorRef=f$1(Or);_elementRef=f$1(B);_defaults=f$1(ca);_animationsDisabled=it$1();_activeOptionChanges=V.EMPTY;_keyManager;showPanel=!1;get isOpen(){return this._isOpen&&this.showPanel}_isOpen=!1;_latestOpeningTrigger;_setColor(e){this._color=e,this._changeDetectorRef.markForCheck()}_color;template;panel;options;optionGroups;ariaLabel;ariaLabelledby;displayWith=null;autoActiveFirstOption;autoSelectActiveOption;requireSelection;panelWidth;disableRipple=!1;optionSelected=new J;opened=new J;closed=new J;optionActivated=new J;set classList(e){this._classList=e,this._elementRef.nativeElement.className=``}_classList;get hideSingleSelectionIndicator(){return this._hideSingleSelectionIndicator}set hideSingleSelectionIndicator(e){this._hideSingleSelectionIndicator=e,this._syncParentProperties()}_hideSingleSelectionIndicator;_syncParentProperties(){if(this.options)for(let e of this.options)e._changeDetectorRef.markForCheck()}id=f$1(ot$1).getId(`mat-autocomplete-`);inertGroups;constructor(){let e=f$1(re$1);this.inertGroups=e?.SAFARI||!1,this.autoActiveFirstOption=!!this._defaults.autoActiveFirstOption,this.autoSelectActiveOption=!!this._defaults.autoSelectActiveOption,this.requireSelection=!!this._defaults.requireSelection,this._hideSingleSelectionIndicator=this._defaults.hideSingleSelectionIndicator??!1}ngAfterContentInit(){this._keyManager=new fp(this.options).withWrap().skipPredicate(this._skipPredicate),this._activeOptionChanges=this._keyManager.change.subscribe(e=>{this.isOpen&&this.optionActivated.emit({source:this,option:this.options.toArray()[e]||null})}),this._setVisibility()}ngOnDestroy(){this._keyManager?.destroy(),this._activeOptionChanges.unsubscribe()}_setScrollTop(e){this.panel&&(this.panel.nativeElement.scrollTop=e)}_getScrollTop(){return this.panel?this.panel.nativeElement.scrollTop:0}_setVisibility(){this.showPanel=!!this.options?.length,this._changeDetectorRef.markForCheck()}_emitSelectEvent(e){let t=new xt(this,e);this.optionSelected.emit(t)}_getPanelAriaLabelledby(e){if(this.ariaLabel)return null;let t=e?e+` `:``;return this.ariaLabelledby?t+this.ariaLabelledby:e}_skipPredicate(){return!1}static ɵfac=function(t){return new(t||n)};static ɵcmp=(function(){let e=[`panel`],t=[`*`];function a(o,r){if(o&1&&(Ge$1(0,`div`,1,0),be(2),qe$1()),o&2){let u=r.id,p=To();Zi$1(p._classList),ve(`mat-mdc-autocomplete-visible`,p.showPanel)(`mat-mdc-autocomplete-hidden`,!p.showPanel)(`mat-autocomplete-panel-animations-enabled`,!p._animationsDisabled)(`mat-primary`,p._color===`primary`)(`mat-accent`,p._color===`accent`)(`mat-warn`,p._color===`warn`),qi$1(`id`,p.id),Be$1(`aria-label`,p.ariaLabel||null)(`aria-labelledby`,p._getPanelAriaLabelledby(u))}}return te({type:n,selectors:[[`mat-autocomplete`]],contentQueries:function(r,u,p){if(r&1&&My(p,ee$1,5)(p,Z,5),r&2){let w;kr(w=Rr())&&(u.options=w),kr(w=Rr())&&(u.optionGroups=w)}},viewQuery:function(r,u){if(r&1&&Ar(Ae,7)(e,5),r&2){let p;kr(p=Rr())&&(u.template=p.first),kr(p=Rr())&&(u.panel=p.first)}},hostAttrs:[1,`mat-mdc-autocomplete`],inputs:{ariaLabel:[0,`aria-label`,`ariaLabel`],ariaLabelledby:[0,`aria-labelledby`,`ariaLabelledby`],displayWith:`displayWith`,autoActiveFirstOption:[2,`autoActiveFirstOption`,`autoActiveFirstOption`,ie$1],autoSelectActiveOption:[2,`autoSelectActiveOption`,`autoSelectActiveOption`,ie$1],requireSelection:[2,`requireSelection`,`requireSelection`,ie$1],panelWidth:`panelWidth`,disableRipple:[2,`disableRipple`,`disableRipple`,ie$1],classList:[0,`class`,`classList`],hideSingleSelectionIndicator:[2,`hideSingleSelectionIndicator`,`hideSingleSelectionIndicator`,ie$1]},outputs:{optionSelected:`optionSelected`,opened:`opened`,closed:`closed`,optionActivated:`optionActivated`},exportAs:[`matAutocomplete`],features:[Mf([{provide:J$1,useExisting:n}])],ngContentSelectors:t,decls:1,vars:0,consts:[[`panel`,``],[`role`,`listbox`,1,`mat-mdc-autocomplete-panel`,`mdc-menu-surface`,`mdc-menu-surface--open`,3,`id`]],template:function(r,u){r&1&&(Pt(),_y(0,a,3,17,`ng-template`))},styles:[`div.mat-mdc-autocomplete-panel {
  width: 100%;
  max-height: 256px;
  visibility: hidden;
  transform-origin: center top;
  overflow: auto;
  padding: 8px 0;
  box-sizing: border-box;
  position: relative;
  border-radius: var(--%NS%mat-autocomplete-container-shape, var(--%NS%mat-sys-corner-extra-small));
  box-shadow: var(--%NS%mat-autocomplete-container-elevation-shadow, 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12));
  background-color: var(--%NS%mat-autocomplete-background-color, var(--%NS%mat-sys-surface-container));
}
@media (forced-colors: active) {
  div.mat-mdc-autocomplete-panel {
    outline: solid 1px;
  }
}
.cdk-overlay-pane:not(.mat-mdc-autocomplete-panel-above) div.mat-mdc-autocomplete-panel {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
.mat-mdc-autocomplete-panel-above div.mat-mdc-autocomplete-panel {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  transform-origin: center bottom;
}
div.mat-mdc-autocomplete-panel.mat-mdc-autocomplete-visible {
  visibility: visible;
}

div.mat-mdc-autocomplete-panel.mat-mdc-autocomplete-hidden,
.cdk-overlay-pane:has(> .mat-mdc-autocomplete-hidden) {
  visibility: hidden;
  pointer-events: none;
}

@keyframes _mat-autocomplete-enter {
  from {
    opacity: 0;
    transform: scaleY(0.8);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
.mat-autocomplete-panel-animations-enabled {
  animation: _mat-autocomplete-enter 120ms cubic-bezier(0, 0, 0.2, 1);
}

mat-autocomplete {
  display: none;
}
`],encapsulation:2})})()}return n})();var Pa={provide:se$1,useExisting:pi$1(()=>Ct),multi:!0};var Ta=new g(`mat-autocomplete-scroll-strategy`,{providedIn:`root`,factory:()=>{let n=f$1(M);return()=>kp(n)}});var Ct=(()=>{class n{_environmentInjector=f$1(me$1);_element=f$1(B);_injector=f$1(M);_viewContainerRef=f$1(tt$1);_zone=f$1(N);_changeDetectorRef=f$1(Or);_dir=f$1(cn$1,{optional:!0});_formField=f$1(oe,{optional:!0,host:!0});_viewportRuler=f$1(jo);_scrollStrategy=f$1(Ta);_renderer=f$1(We$1);_animationsDisabled=it$1();_defaults=f$1(ca,{optional:!0});_overlayRef=null;_portal;_componentDestroyed=!1;_initialized=new w;_keydownSubscription;_outsideClickSubscription;_cleanupWindowBlur;_previousValue=null;_valueOnAttach=null;_valueOnLastKeydown=null;_positionStrategy;_manuallyFloatingLabel=!1;_closingActionsSubscription;_viewportSubscription=V.EMPTY;_breakpointObserver=f$1(is);_handsetLandscapeSubscription=V.EMPTY;_canOpenOnNextFocus=!0;_valueBeforeAutoSelection;_pendingAutoselectedOption=null;_closeKeyEventStream=new w;_overlayPanelClass=jr(this._defaults?.overlayPanelClass||[]);_windowBlurHandler=()=>{this._canOpenOnNextFocus=this.panelOpen||!this._hasFocus()};_onChange=()=>{};_onTouched=()=>{};autocomplete;position=`auto`;connectedTo;autocompleteAttribute=`off`;autocompleteDisabled=!1;_aboveClass=`mat-mdc-autocomplete-panel-above`;ngAfterViewInit(){this._initialized.next(),this._initialized.complete(),this._cleanupWindowBlur=this._renderer.listen(`window`,`blur`,this._windowBlurHandler)}ngOnChanges(e){e.position&&this._positionStrategy&&(this._setStrategyPositions(this._positionStrategy),this.panelOpen&&this._overlayRef.updatePosition())}ngOnDestroy(){this._cleanupWindowBlur?.(),this._handsetLandscapeSubscription.unsubscribe(),this._viewportSubscription.unsubscribe(),this._componentDestroyed=!0,this._destroyPanel(),this._closeKeyEventStream.complete()}get panelOpen(){return this._overlayAttached&&this.autocomplete.showPanel}_overlayAttached=!1;openPanel(){this._openPanelInternal()}closePanel(){this._resetLabel(),this._overlayAttached&&(this.panelOpen&&this._zone.run(()=>{this.autocomplete.closed.emit()}),this.autocomplete._latestOpeningTrigger===this&&(this.autocomplete._isOpen=!1,this.autocomplete._latestOpeningTrigger=null),this._overlayAttached=!1,this._pendingAutoselectedOption=null,this._overlayRef&&this._overlayRef.hasAttached()&&(this._overlayRef.detach(),this._closingActionsSubscription.unsubscribe()),this._updatePanelState(),this._componentDestroyed||this._changeDetectorRef.detectChanges())}updatePosition(){this._overlayAttached&&this._overlayRef.updatePosition()}get panelClosingActions(){return Sl(this.optionSelections,this.autocomplete._keyManager.tabOut.pipe(de$1(()=>this._overlayAttached)),this._closeKeyEventStream,this._getOutsideClickStream(),this._overlayRef?this._overlayRef.detachments().pipe(de$1(()=>this._overlayAttached)):Ne()).pipe(Q(e=>e instanceof me$2?e:null))}optionSelections=Xo(()=>{let e=this.autocomplete?this.autocomplete.options:null;return e?e.changes.pipe(bn$1(e),Nl(()=>Sl(...e.map(t=>t.onSelectionChange)))):this._initialized.pipe(Nl(()=>this.optionSelections))});get activeOption(){return this.autocomplete&&this.autocomplete._keyManager?this.autocomplete._keyManager.activeItem:null}_getOutsideClickStream(){return new k(e=>{let t=o=>{let r=Re(o),u=this._formField?this._formField.getConnectedOverlayOrigin().nativeElement:null,p=this.connectedTo?this.connectedTo.elementRef.nativeElement:null;this._overlayAttached&&r!==this._element.nativeElement&&!this._hasFocus()&&(!u||!u.contains(r))&&(!p||!p.contains(r))&&this._overlayRef&&!this._overlayRef.overlayElement.contains(r)&&e.next(o)},a=[this._renderer.listen(`document`,`click`,t),this._renderer.listen(`document`,`auxclick`,t),this._renderer.listen(`document`,`touchend`,t)];return()=>{a.forEach(o=>o())}})}writeValue(e){Promise.resolve(null).then(()=>this._assignOptionValue(e))}registerOnChange(e){this._onChange=e}registerOnTouched(e){this._onTouched=e}setDisabledState(e){this._element.nativeElement.disabled=e}_handleKeydown(e){let t=e,a=t.keyCode,o=Fn(t);if(a===27&&!o&&t.preventDefault(),this._valueOnLastKeydown=this._element.nativeElement.value,this.activeOption&&a===13&&this.panelOpen&&!o)this.activeOption._selectViaInteraction(),this._resetActiveItem(),t.preventDefault();else if(this.autocomplete){let r=this.autocomplete._keyManager.activeItem,u=a===38||a===40;a===9||u&&!o&&this.panelOpen?this.autocomplete._keyManager.onKeydown(t):u&&this._canOpen()&&this._openPanelInternal(this._valueOnLastKeydown),(u||this.autocomplete._keyManager.activeItem!==r)&&(this._scrollToOption(this.autocomplete._keyManager.activeItemIndex||0),this.autocomplete.autoSelectActiveOption&&this.activeOption&&(this._pendingAutoselectedOption||(this._valueBeforeAutoSelection=this._valueOnLastKeydown),this._pendingAutoselectedOption=this.activeOption,this._assignOptionValue(this.activeOption.value)))}}_handleInput(e){let t=e.target,a=t.value;if(t.type===`number`&&(a=a==``?null:parseFloat(a)),this._previousValue!==a){if(this._previousValue=a,this._pendingAutoselectedOption=null,(!this.autocomplete||!this.autocomplete.requireSelection)&&this._onChange(a),!a)this._clearPreviousSelectedOption(null,!1);else if(this.panelOpen&&!this.autocomplete.requireSelection){let o=this.autocomplete.options?.find(r=>r.selected);if(o){let r=this._getDisplayValue(o.value);a!==r&&o.deselect(!1)}}if(this._canOpen()&&this._hasFocus()){let o=this._valueOnLastKeydown??this._element.nativeElement.value;this._valueOnLastKeydown=null,this._openPanelInternal(o)}}}_handleFocus(){this._canOpenOnNextFocus?this._canOpen()&&(this._previousValue=this._element.nativeElement.value,this._attachOverlay(this._previousValue),this._floatLabel(!0)):this._canOpenOnNextFocus=!0}_handleClick(){this._canOpen()&&!this.panelOpen&&this._openPanelInternal()}_hasFocus(){return cs()===this._element.nativeElement}_floatLabel(e=!1){this._formField&&this._formField.floatLabel===`auto`&&(e?this._formField._animateAndLockLabel():this._formField.floatLabel=`always`,this._manuallyFloatingLabel=!0)}_resetLabel(){this._manuallyFloatingLabel&&(this._formField&&(this._formField.floatLabel=`auto`),this._manuallyFloatingLabel=!1)}_subscribeToClosingActions(){let e=new k(a=>{et$2(()=>{a.next()},{injector:this._environmentInjector})}),t=this.autocomplete.options?.changes.pipe(Jn(()=>this._positionStrategy.reapplyLastPosition()),HD(0))??Ne();return Sl(e,t).pipe(Nl(()=>this._zone.run(()=>{let a=this.panelOpen;return this._resetActiveItem(),this._updatePanelState(),this._changeDetectorRef.detectChanges(),this.panelOpen&&this._overlayRef.updatePosition(),a!==this.panelOpen&&(this.panelOpen?this._emitOpened():this.autocomplete.closed.emit()),this.panelClosingActions})),we(1)).subscribe(a=>this._setValueAndClose(a))}_emitOpened(){this.autocomplete.opened.emit()}_destroyPanel(){this._overlayRef&&(this.closePanel(),this._overlayRef.dispose(),this._overlayRef=null)}_getDisplayValue(e){let t=this.autocomplete;return t&&t.displayWith?t.displayWith(e):e}_assignOptionValue(e){let t=this._getDisplayValue(e);e??this._clearPreviousSelectedOption(null,!1),this._updateNativeInputValue(t??``)}_updateNativeInputValue(e){let t=this._formField?._control;t?Ra(t.value)?t.value.set(e):t.value=e:this._element.nativeElement.value=e,this._previousValue=e}_setValueAndClose(e){let t=this.autocomplete,a=e?e.source:this._pendingAutoselectedOption;a?(this._clearPreviousSelectedOption(a),this._assignOptionValue(a.value),this._onChange(a.value),t._emitSelectEvent(a),this._element.nativeElement.focus()):t.requireSelection&&this._element.nativeElement.value!==this._valueOnAttach&&(this._clearPreviousSelectedOption(null),this._assignOptionValue(null),this._onChange(null)),this.closePanel()}_clearPreviousSelectedOption(e,t){this.autocomplete?.options?.forEach(a=>{a!==e&&a.selected&&a.deselect(t)})}_openPanelInternal(e=this._element.nativeElement.value){this._attachOverlay(e),this._floatLabel()}_attachOverlay(e){if(!this.autocomplete)return;let t=this._overlayRef;t?(this._positionStrategy.setOrigin(this._getConnectedElement()),t.updateSize({width:this._getPanelWidth()})):(this._portal=new Lt(this.autocomplete.template,this._viewContainerRef,{id:this._formField?.getLabelId()}),t=$r(this._injector,this._getOverlayConfig()),this._overlayRef=t,this._viewportSubscription=this._viewportRuler.change().subscribe(()=>{this.panelOpen&&t&&t.updateSize({width:this._getPanelWidth()})}),this._handsetLandscapeSubscription=this._breakpointObserver.observe(Yv.HandsetLandscape).subscribe(o=>{o.matches?this._positionStrategy.withFlexibleDimensions(!0).withGrowAfterOpen(!0).withViewportMargin(8):this._positionStrategy.withFlexibleDimensions(!1).withGrowAfterOpen(!1).withViewportMargin(0)})),t&&!t.hasAttached()&&(t.attach(this._portal),this._valueOnAttach=e,this._valueOnLastKeydown=null,this._closingActionsSubscription=this._subscribeToClosingActions());let a=this.panelOpen;this.autocomplete._isOpen=this._overlayAttached=!0,this.autocomplete._latestOpeningTrigger=this,this.autocomplete._setColor(this._formField?.color),this._updatePanelState(),this.panelOpen&&a!==this.panelOpen&&this._emitOpened()}_handlePanelKeydown=e=>{(e.keyCode===27&&!Fn(e)||e.keyCode===38&&Fn(e,`altKey`))&&(this._pendingAutoselectedOption&&(this._updateNativeInputValue(this._valueBeforeAutoSelection??``),this._pendingAutoselectedOption=null),this._closeKeyEventStream.next(),this._resetActiveItem(),e.stopPropagation(),e.preventDefault())};_updatePanelState(){if(this.autocomplete._setVisibility(),this.panelOpen){let e=this._overlayRef;this._keydownSubscription||(this._keydownSubscription=e.keydownEvents().subscribe(this._handlePanelKeydown)),this._outsideClickSubscription||(this._outsideClickSubscription=e.outsidePointerEvents().subscribe())}else this._keydownSubscription?.unsubscribe(),this._outsideClickSubscription?.unsubscribe(),this._keydownSubscription=this._outsideClickSubscription=void 0}_getOverlayConfig(){return new dn$1({positionStrategy:this._getOverlayPosition(),scrollStrategy:this._scrollStrategy(),width:this._getPanelWidth(),direction:this._dir??void 0,hasBackdrop:this._defaults?.hasBackdrop,backdropClass:this._defaults?.backdropClass||`cdk-overlay-transparent-backdrop`,panelClass:this._overlayPanelClass,disableAnimations:this._animationsDisabled})}_getOverlayPosition(){let e=Op(this._injector,this._getConnectedElement()).withFlexibleDimensions(!1).withPush(!1).withPopoverLocation(`inline`);return this._setStrategyPositions(e),this._positionStrategy=e,e}_setStrategyPositions(e){let t=[{originX:`start`,originY:`bottom`,overlayX:`start`,overlayY:`top`},{originX:`end`,originY:`bottom`,overlayX:`end`,overlayY:`top`}],a=this._aboveClass,o=[{originX:`start`,originY:`top`,overlayX:`start`,overlayY:`bottom`,panelClass:a},{originX:`end`,originY:`top`,overlayX:`end`,overlayY:`bottom`,panelClass:a}],r;this.position===`above`?r=o:this.position===`below`?r=t:r=[...t,...o],e.withPositions(r)}_getConnectedElement(){return this.connectedTo?this.connectedTo.elementRef:this._formField?this._formField.getConnectedOverlayOrigin():this._element}_getPanelWidth(){return this.autocomplete.panelWidth||this._getHostWidth()}_getHostWidth(){return this._getConnectedElement().nativeElement.getBoundingClientRect().width}_resetActiveItem(){let e=this.autocomplete;if(e.autoActiveFirstOption){let t=-1;for(let a=0;a<e.options.length;a++)if(!e.options.get(a).disabled){t=a;break}e._keyManager.setActiveItem(t)}else e._keyManager.setActiveItem(-1)}_canOpen(){let e=this._element.nativeElement;return!e.readOnly&&!e.disabled&&!this.autocompleteDisabled}_scrollToOption(e){let t=this.autocomplete,a=rt$1(e,t.options,t.optionGroups);if(e===0&&a===1)t._setScrollTop(0);else if(t.panel){let o=t.options.toArray()[e];if(o){let r=o._getHostElement(),u=lt(r.offsetTop,r.offsetHeight,t._getScrollTop(),t.panel.nativeElement.offsetHeight);t._setScrollTop(u)}}}static ɵfac=function(t){return new(t||n)};static ɵdir=W({type:n,selectors:[[`input`,`matAutocomplete`,``],[`textarea`,`matAutocomplete`,``]],hostAttrs:[1,`mat-mdc-autocomplete-trigger`],hostVars:7,hostBindings:function(t,a){t&1&&Nr(`focusin`,function(){return a._handleFocus()})(`blur`,function(){return a._onTouched()})(`input`,function(r){return a._handleInput(r)})(`keydown`,function(r){return a._handleKeydown(r)})(`click`,function(){return a._handleClick()}),t&2&&Be$1(`autocomplete`,a.autocompleteAttribute)(`role`,a.autocompleteDisabled?null:`combobox`)(`aria-autocomplete`,a.autocompleteDisabled?null:`list`)(`aria-activedescendant`,a.panelOpen&&a.activeOption?a.activeOption.id:null)(`aria-expanded`,a.autocompleteDisabled?null:a.panelOpen.toString())(`aria-controls`,a.autocompleteDisabled||!a.panelOpen?null:a.autocomplete?.id)(`aria-haspopup`,a.autocompleteDisabled?null:`listbox`)},inputs:{autocomplete:[0,`matAutocomplete`,`autocomplete`],position:[0,`matAutocompletePosition`,`position`],connectedTo:[0,`matAutocompleteConnectedTo`,`connectedTo`],autocompleteAttribute:[0,`autocomplete`,`autocompleteAttribute`],autocompleteDisabled:[2,`matAutocompleteDisabled`,`autocompleteDisabled`,ie$1]},exportAs:[`matAutocompleteTrigger`],features:[Mf([Pa]),Jt]})}return n})();var pa=(()=>{class n{static ɵfac=function(t){return new(t||n)};static ɵmod=ee({type:n});static ɵinj=K$1({imports:[Ho,ue$1,wp,ue$1,Ze$1]})}return n})();var ua=(()=>{class n{get vertical(){return this._vertical}set vertical(e){this._vertical=ZG(e)}_vertical=!1;get inset(){return this._inset}set inset(e){this._inset=ZG(e)}_inset=!1;static ɵfac=function(t){return new(t||n)};static ɵcmp=te({type:n,selectors:[[`mat-divider`]],hostAttrs:[`role`,`separator`,1,`mat-divider`],hostVars:7,hostBindings:function(t,a){t&2&&(Be$1(`aria-orientation`,a.vertical?`vertical`:`horizontal`),ve(`mat-divider-vertical`,a.vertical)(`mat-divider-horizontal`,!a.vertical)(`mat-divider-inset`,a.inset))},inputs:{vertical:`vertical`,inset:`inset`},decls:0,vars:0,template:function(t,a){},styles:[`.mat-divider {
  display: block;
  margin: 0;
  border-top-style: solid;
  border-top-color: var(--%NS%mat-divider-color, var(--%NS%mat-sys-outline-variant));
  border-top-width: var(--%NS%mat-divider-width, 1px);
}
.mat-divider.mat-divider-vertical {
  border-top: 0;
  border-right-style: solid;
  border-right-color: var(--%NS%mat-divider-color, var(--%NS%mat-sys-outline-variant));
  border-right-width: var(--%NS%mat-divider-width, 1px);
}
.mat-divider.mat-divider-inset {
  margin-left: 80px;
}
[dir=rtl] .mat-divider.mat-divider-inset {
  margin-left: auto;
  margin-right: 80px;
}
`],encapsulation:2})}return n})();var ha=(()=>{class n{static ɵfac=function(t){return new(t||n)};static ɵmod=ee({type:n});static ɵinj=K$1({imports:[Ze$1]})}return n})();var nt=class n{api=f$1(Gt);ui=f$1(cD);ref=f$1(vs);s=f$1(Mi$1);cur=``;next=``;busy=Le$1(!1);async save(){this.busy.set(!0);try{let i=await this.api.changePassword(this.cur,this.next);i?.token&&this.s.setToken(i.token),this.ui.toast(`Password updated — other devices were signed out`),this.ref.close()}catch(i){this.ui.error(i)}this.busy.set(!1)}static ɵfac=function(e){return new(e||n)};static ɵcmp=te({type:n,selectors:[[`k3-password`]],decls:18,vars:3,consts:[[`mat-dialog-title`,``],[`appearance`,`outline`,1,`full`],[`matInput`,``,`type`,`password`,`autocomplete`,`current-password`,3,`ngModelChange`,`ngModel`],[`matInput`,``,`type`,`password`,`autocomplete`,`new-password`,3,`ngModelChange`,`ngModel`],[`align`,`end`],[`mat-button`,``,`mat-dialog-close`,``],[`mat-flat-button`,``,3,`click`,`disabled`]],template:function(e,t){e&1&&(Te(0,`h2`,0),Ft(1,`Change password`),Me(),Te(2,`mat-dialog-content`)(3,`mat-form-field`,1)(4,`mat-label`),Ft(5,`Current password`),Me(),Te(6,`input`,2),ES(),zy(`ngModelChange`,function(o){return bx(t.cur,o)||(t.cur=o),o}),Me()(),Te(7,`mat-form-field`,1)(8,`mat-label`),Ft(9,`New password`),Me(),Te(10,`input`,3),ES(),zy(`ngModelChange`,function(o){return bx(t.next,o)||(t.next=o),o}),Me(),Te(11,`mat-hint`),Ft(12,`At least 10 characters, with letters and numbers`),Me()()(),Te(13,`mat-dialog-actions`,4)(14,`button`,5),Ft(15,`Cancel`),Me(),Te(16,`button`,6),Nr(`click`,function(){return t.save()}),Ft(17,`Update`),Me()()),e&2&&(le(6),$y(`ngModel`,t.cur),CS(),le(4),$y(`ngModel`,t.next),CS(),le(6),Gi(`disabled`,t.busy()||t.next.length<10||!t.cur))},dependencies:[Mn$1,Pe,Vn,Yt,iD,J_,tD,rD,nD,Ep,Qc,Fe,bt,we$1,Ne$1,rr,ir,_n$1,Wv],encapsulation:2})};var La=(n,i)=>i.path;var Va=(n,i)=>i.id;function ja(n,i){if(n&1){let e=xf();Te(0,`div`,3)(1,`mat-icon`),Ft(2,`support_agent`),Me(),Te(3,`span`,29),Ft(4),Te(5,`b`),Ft(6),Me(),Ft(7,` admin · logged for the school`),Me(),Te(8,`button`,30),Nr(`click`,function(){Ea(e);let a=To();return wa$1(a.endSupport())}),Ft(9,`End session`),Me()()}if(n&2){let e=To();le(4),Mo(`Support session`,e.s.me()?.readOnly?` (read-only)`:``,` · signed in as `),le(2),On(e.s.me()?.tenant?.name)}}function Wa(n,i){if(n&1){let e=xf();Te(0,`button`,37),Nr(`click`,function(){Ea(e);let a=To(2);return a.searching.set(!1),a.q=``,wa$1(a.results.set([]))}),Te(1,`mat-icon`),Ft(2,`close`),Me()()}}function Ha(n,i){if(n&1&&(Te(0,`mat-option`,35)(1,`div`,38),hc(2,`k3-avatar`,39),Te(3,`span`,29),Ft(4),Te(5,`span`,40),Ft(6),Me()(),hc(7,`k3-temp`,41),Me()()),n&2){let e=i.$implicit;Gi(`value`,e),le(2),Gi(`name`,e.student||e.parent),le(2),Mo(``,e.student||e.parent,` `),le(2),Vy(`· `,e.parent,` · `,e.program),le(),Gi(`temp`,e.ai?.temp)}}function Ka(n,i){if(n&1){let e=xf();Te(0,`div`,31)(1,`mat-icon`),Ft(2,`search`),Me(),Te(3,`input`,32),ES(),zy(`ngModelChange`,function(a){Ea(e);let o=To();return bx(o.q,a)||(o.q=a),wa$1(a)}),Nr(`ngModelChange`,function(a){Ea(e);let o=To();return wa$1(o.search(a))}),Me(),yt$1(4,Wa,3,0,`button`,33),Te(5,`mat-autocomplete`,34,1),Nr(`optionSelected`,function(a){Ea(e);let o=To();return wa$1(o.pickResult(a.option.value))}),PI(7,Ha,8,6,`mat-option`,35,Va),Me()(),Te(9,`button`,36),Nr(`click`,function(){Ea(e);let a=To();return wa$1(a.searching.set(!0))}),Te(10,`mat-icon`),Ft(11,`search`),Me()()}if(n&2){let e=GI(6),t=To();le(3),$y(`ngModel`,t.q),Gi(`matAutocomplete`,e),CS(),le(),vt$1(t.searching()?4:-1),le(3),FI(t.results())}}function Ga(n,i){n&1&&hc(0,`span`,9)}function Ua(n,i){n&1&&(Te(0,`span`,10)(1,`mat-icon`),Ft(2,`science`),Me(),Ft(3,`Demo data`),Me())}function Qa(n,i){if(n&1){let e=xf();Te(0,`button`,42),Nr(`click`,function(){Ea(e);let a=To();return wa$1(a.password())}),Te(1,`mat-icon`),Ft(2,`password`),Me(),Ft(3,`Change password`),Me()}}function qa(n,i){n&1&&(Te(0,`a`,19)(1,`mat-icon`),Ft(2,`credit_card`),Me(),Ft(3,`Plan & billing`),Me())}function Za(n,i){if(n&1){let e=xf();Te(0,`button`,42),Nr(`click`,function(){Ea(e);let a=To();return wa$1(a.logout())}),Te(1,`mat-icon`),Ft(2,`logout`),Me(),Ft(3,`Sign out`),Me()}}function Ya(n,i){n&1&&(Te(0,`a`,20)(1,`mat-icon`),Ft(2,`open_in_new`),Me(),Ft(3,`About K3 Solutions`),Me())}function Xa(n,i){n&1&&(Te(0,`div`,24),hc(1,`img`,43),Te(2,`b`),Ft(3,`K3 Solutions`),Me()())}function $a(n,i){n&1&&(Te(0,`span`),Ft(1,`New enquiry`),Me())}function Ja(n,i){if(n&1){let e=xf();Te(0,`button`,44),Nr(`click`,function(){Ea(e);let a=To();return wa$1(a.newLead())}),Te(1,`mat-icon`),Ft(2,`person_add`),Me(),yt$1(3,$a,2,0,`span`),Me()}if(n&2){let e=To();Gi(`extended`,!e.isRail()||e.drawerOpen())(`matTooltipDisabled`,!e.isRail()||e.drawerOpen()),le(3),vt$1(!e.isRail()||e.drawerOpen()?3:-1)}}function ei(n,i){if(n&1&&(Te(0,`div`,45),Ft(1),Me()),n&2){let e=To().$implicit;le(),On(e.section)}}function ti(n,i){n&1&&hc(0,`div`,46)}function ni(n,i){if(n&1&&(Te(0,`span`,49),Ft(1),Me()),n&2){let e=To().$implicit,t=To();le(),On(t.badge(e))}}function ai(n,i){if(n&1&&(Te(0,`span`,51),Ft(1),Me()),n&2){let e=To().$implicit,t=To();le(),On(t.badge(e))}}function ii(n,i){if(n&1&&(yt$1(0,ei,2,1,`div`,45)(1,ti,1,0,`div`,46),Te(2,`a`,47,2)(4,`span`,48)(5,`mat-icon`),Ft(6),Me(),yt$1(7,ni,2,1,`span`,49),Me(),Te(8,`span`,50),Ft(9),Me(),yt$1(10,ai,2,1,`span`,51),Me()),n&2){let e=i.$implicit,t=GI(3),a=To();vt$1(e.section&&(!a.isRail()||a.drawerOpen())?0:e.section?1:-1),le(2),Gi(`routerLink`,e.path)(`matTooltip`,e.label)(`matTooltipDisabled`,!a.isRail()||a.drawerOpen()),le(3),ve(`fill`,t.isActive),le(),On(e.icon),le(),vt$1(a.badge(e)&&a.isRail()&&!a.drawerOpen()?7:-1),le(2),On(e.label),le(),vt$1(a.badge(e)?10:-1)}}function oi(n,i){n&1&&(Te(0,`div`,26),Ft(1,`K3 Solutions · Kontent Konnect Kommunicate`),Me())}function ri(n,i){if(n&1&&(Te(0,`div`)(1,`mat-icon`),Ft(2),Me(),Te(3,`span`,9),Ft(4),Me(),Te(5,`a`,52),Ft(6),Me()()),n&2){let e=i;Zi$1(_x(`banner `,e.cls)),le(2),On(e.icon),le(2),On(e.text),le(2),On(e.cta)}}var si=[{path:`/home`,icon:`home`,label:`Home`},{path:`/leads`,icon:`groups`,label:`Leads`},{path:`/inbox`,icon:`forum`,label:`Inbox`,badge:`inbox`},{path:`/followups`,icon:`event_upcoming`,label:`Follow-ups`,badge:`followups`},{path:`/nurture`,icon:`conversion_path`,label:`Nurture`,section:`Automation`},{path:`/broadcasts`,icon:`campaign`,label:`Broadcasts`},{path:`/templates`,icon:`article`,label:`Templates`},{path:`/ai-qualifier`,icon:`auto_awesome`,label:`AI Qualifier`},{path:`/reports`,icon:`monitoring`,label:`Reports`,section:`Insights`}];var li=[{path:`/platform/institutions`,icon:`domain`,label:`Institutions`},{path:`/platform/plans`,icon:`sell`,label:`Plans`},{path:`/platform/payments`,icon:`receipt_long`,label:`Payments`},{path:`/platform/backups`,icon:`backup`,label:`Backups`},{path:`/platform/company`,icon:`business`,label:`Company & keys`,section:`Settings`},{path:`/platform/admins`,icon:`admin_panel_settings`,label:`Platform admins`},{path:`/platform/security`,icon:`shield`,label:`My security`}];var at=class n{s=f$1(Mi$1);api=f$1(Gt);ui=f$1(cD);router=f$1(J$2);nav=f$1(di$1);bp=f$1(is);demo=fe.demo;mode=C(this.bp.observe([`(min-width: 1280px)`,`(min-width: 861px)`]).pipe(Q(i=>i.breakpoints[`(min-width: 1280px)`]?`full`:i.breakpoints[`(min-width: 861px)`]?`rail`:`modal`)),{initialValue:`full`});drawerOpen=Le$1(!1);searching=Le$1(!1);results=Le$1([]);q=``;url=C(this.router.events.pipe(de$1(i=>i instanceof L),Q(i=>i.urlAfterRedirects)),{initialValue:this.router.url});items=Fx(()=>{if(this.s.platformOnly())return li;let i=[];return this.s.role()===`admin`&&!this.demo&&i.push({path:`/settings`,icon:`settings`,label:`Settings`,section:`Admin`}),this.demo&&i.push({path:`/settings`,icon:`settings`,label:`Settings`,section:`Admin`},{path:`/api`,icon:`api`,label:`API & Integrations`}),[...si,...i]});isRail=Fx(()=>this.mode()===`rail`);userName=Fx(()=>this.s.me()?.user?.name||`User`);billing=Fx(()=>{let i=this.s.me()?.tenant;if(!i||this.s.platformOnly()||this.demo)return null;if(i.billingLocked)return{cls:`err`,icon:`lock`,text:`Your subscription has ended. Renew to restore access to the CRM — your data is safe.`,cta:`Renew now`};if(!i.accessUntil)return null;let e=Math.ceil((new Date(i.accessUntil).getTime()-Date.now())/864e5);return i.billingStatus===`trial`?{cls:e<=7?`warn`:`info`,icon:`hourglass_bottom`,text:`Free trial \xB7 ${e} day${e===1?``:`s`} left. Choose a plan any time to keep WhatsApp automations running without interruption.`,cta:`Choose plan`}:[`past_due`,`halted`,`pending`].includes(i.billingStatus)?{cls:`warn`,icon:`credit_card_off`,text:`Payment issue \u2014 access continues until ${new Date(i.accessUntil).toLocaleDateString(`en-IN`)}. Update your payment method.`,cta:`Fix billing`}:null});constructor(){this.router.events.pipe(de$1(i=>i instanceof L)).subscribe(()=>{this.drawerOpen.set(!1),this.s.refreshBadges()})}badge(i){return i.badge&&this.s.badges()[i.badge]||0}toggleNav(){this.drawerOpen.update(i=>!i)}newLead(){this.ui.open(re,null,{width:`640px`}).afterClosed().subscribe(i=>{i&&this.url().startsWith(`/leads`)&&this.router.navigate([`/leads`],{queryParams:{r:Date.now()}})})}search=wc(async i=>{if(!i||i.length<2){this.results.set([]);return}try{this.results.set((await this.api.leads({q:i})).slice(0,8))}catch{this.results.set([])}},200);pickResult(i){this.q=``,this.results.set([]),this.searching.set(!1),this.nav.open(i.id)}password(){this.ui.open(nt,null,{width:`420px`})}logout(){this.s.logout()}async endSupport(){this.s.setImp(null),this.s.ready.set(!1),await this.s.init(),this.router.navigateByUrl(`/platform/institutions`)}static ɵfac=function(e){return new(e||n)};static ɵcmp=te({type:n,selectors:[[`k3-shell`]],decls:47,vars:35,consts:[[`acct`,``],[`ac`,`matAutocomplete`],[`rla`,`routerLinkActive`],[1,`imp-banner`],[1,`topbar`],[`mat-icon-button`,``,`aria-label`,`Menu`,1,`menu-btn`,3,`click`],[1,`brand`,3,`routerLink`],[`src`,`k3-logo.png`,`alt`,`K3 Solutions`,`width`,`36`,`height`,`36`],[1,`brand-text`],[1,`grow`],[1,`pill`,`p-pend`,`demo-chip`],[`mat-icon-button`,``,`aria-label`,`Account`,1,`acct-btn`,3,`matMenuTriggerFor`],[`size`,`md`,`color`,`#1a5fb4`,3,`name`],[`xPosition`,`before`,1,`acct-menu`],[1,`acct-card`,3,`click`],[`size`,`lg`,`color`,`#1a5fb4`,3,`name`],[1,`title`],[1,`small`,`muted`],[`mat-menu-item`,``],[`mat-menu-item`,``,`routerLink`,`/settings/billing`],[`mat-menu-item`,``,`href`,`https://k3solutions.in`,`target`,`_blank`,`rel`,`noopener`],[1,`frame`],[1,`nav`,3,`closedStart`,`mode`,`opened`,`fixedInViewport`,`fixedTopGap`],[1,`nav-inner`],[1,`nav-head`],[`mat-fab`,``,`aria-label`,`New enquiry`,`matTooltip`,`New enquiry`,`matTooltipPosition`,`right`,1,`nav-fab`,3,`extended`,`matTooltipDisabled`],[1,`nav-foot`,`small`,`muted`],[1,`content`],[3,`class`],[1,`grow`,`ellipsis`],[`mat-button`,``,3,`click`],[1,`gsearch`],[`placeholder`,`Search leads, parents, phone numbers`,`aria-label`,`Search leads`,3,`ngModelChange`,`ngModel`,`matAutocomplete`],[`mat-icon-button`,``,`aria-label`,`Close search`],[1,`gsr-panel`,3,`optionSelected`],[3,`value`],[`mat-icon-button`,``,`aria-label`,`Search`,1,`search-toggle`,3,`click`],[`mat-icon-button`,``,`aria-label`,`Close search`,3,`click`],[1,`row`],[`size`,`sm`,3,`name`],[1,`muted`,`small`],[3,`temp`],[`mat-menu-item`,``,3,`click`],[`src`,`k3-logo.png`,`alt`,``,`width`,`32`,`height`,`32`],[`mat-fab`,``,`aria-label`,`New enquiry`,`matTooltip`,`New enquiry`,`matTooltipPosition`,`right`,1,`nav-fab`,3,`click`,`extended`,`matTooltipDisabled`],[1,`nav-section`],[1,`nav-sep`],[`routerLinkActive`,`active`,`matTooltipPosition`,`right`,1,`nav-item`,3,`routerLink`,`matTooltip`,`matTooltipDisabled`],[1,`ind`],[1,`dot`],[1,`lbl`],[1,`count`],[`mat-flat-button`,``,`routerLink`,`/settings/billing`]],template:function(e,t){if(e&1&&(yt$1(0,ja,10,2,`div`,3),Te(1,`mat-toolbar`,4)(2,`button`,5),Nr(`click`,function(){return t.toggleNav()}),Te(3,`mat-icon`),Ft(4,`menu`),Me()(),Te(5,`a`,6),hc(6,`img`,7),Te(7,`span`,8)(8,`span`)(9,`b`),Ft(10,`K3`),Me(),Ft(11),Me(),Te(12,`small`),Ft(13,`Kontent · Konnect · Kommunicate`),Me()()(),yt$1(14,Ka,12,3)(15,Ga,1,0,`span`,9),yt$1(16,Ua,4,0,`span`,10),Te(17,`button`,11),hc(18,`k3-avatar`,12),Me(),Te(19,`mat-menu`,13,0)(21,`div`,14),Nr(`click`,function(o){return o.stopPropagation()}),hc(22,`k3-avatar`,15),Te(23,`div`)(24,`div`,16),Ft(25),Me(),Te(26,`div`,17),Ft(27),Me(),Te(28,`div`,17),Ft(29),Me()()(),hc(30,`mat-divider`),yt$1(31,Qa,4,0,`button`,18),yt$1(32,qa,4,0,`a`,19),yt$1(33,Za,4,0,`button`,18)(34,Ya,4,0,`a`,20),Me()(),Te(35,`mat-sidenav-container`,21)(36,`mat-sidenav`,22),Nr(`closedStart`,function(){return t.drawerOpen.set(!1)}),Te(37,`div`,23),yt$1(38,Xa,4,0,`div`,24),yt$1(39,Ja,4,3,`button`,25),PI(40,ii,11,10,null,null,La),hc(42,`div`,9),yt$1(43,oi,2,0,`div`,26),Me()(),Te(44,`mat-sidenav-content`,27),yt$1(45,ri,7,6,`div`,28),hc(46,`router-outlet`),Me()()),e&2){let a,o=GI(20);vt$1(t.s.impersonating()?0:-1),le(),ve(`searching`,t.searching())(`with-imp`,t.s.impersonating()),le(4),Gi(`routerLink`,t.s.platformOnly()?`/platform/institutions`:`/home`),le(6),Mo(` `,t.s.platformOnly()?`Platform`:`Admissions`),le(3),vt$1(!t.s.platformOnly()&&!t.s.billingLocked()?14:15),le(2),vt$1(t.demo?16:-1),le(),Gi(`matMenuTriggerFor`,o),le(),Gi(`name`,t.userName()),le(4),Gi(`name`,t.userName()),le(3),On(t.userName()),le(2),On(t.s.me()?.user?.email),le(2),Vy(``,t.s.me()?.tenant?.name||`K3 Solutions platform`,` · `,t.s.role()===`super_admin`?`Platform owner`:t.s.role()===`admin`?`Administrator`:`Counsellor`),le(2),vt$1(t.demo?-1:31),le(),vt$1(t.s.role()===`admin`&&!t.s.platformOnly()&&!t.demo?32:-1),le(),vt$1(t.demo?34:33),le(2),ve(`rail`,t.isRail())(`with-imp`,t.s.impersonating()),le(),ve(`nav-rail`,t.isRail()&&!t.drawerOpen())(`nav-float`,t.isRail()&&t.drawerOpen()),Gi(`mode`,t.mode()===`modal`?`over`:`side`)(`opened`,t.mode()!==`modal`||t.drawerOpen())(`fixedInViewport`,t.mode()===`modal`)(`fixedTopGap`,0),le(2),vt$1(t.mode()===`modal`?38:-1),le(),vt$1(!t.s.platformOnly()&&!t.s.billingLocked()?39:-1),le(),FI(t.items()),le(3),vt$1(!t.isRail()||t.drawerOpen()?43:-1),le(2),vt$1((a=t.billing())?45:-1,a)}},dependencies:[xn$1,Vt$1,cs$1,Mn$1,Pe,Vn,Yt,oa,wt,ia,Je,sa,ra,Wv,zv,Ep,Qc,JT,V4,Ot,P,G,At,la,Vt,_t$1,pa,ma,ee$1,Ct,ha,ua,De,ie$2],styles:[`[_nghost-%COMP%]{display:block;height:100dvh;overflow:hidden}.imp-banner[_ngcontent-%COMP%]{position:fixed;top:0;left:0;right:0;height:36px;z-index:30;display:flex;align-items:center;gap:8px;padding:0 8px 0 16px;background:var(--%NS%mat-sys-tertiary);color:var(--%NS%mat-sys-on-tertiary);font:var(--%NS%mat-sys-label-large)}.imp-banner[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]{color:inherit}.topbar[_ngcontent-%COMP%]{position:fixed;top:0;left:0;right:0;z-index:20;height:64px;padding:0 8px 0 4px;gap:4px;background:var(--%NS%mat-sys-surface-container-low)}.topbar.with-imp[_ngcontent-%COMP%]{top:36px}.brand[_ngcontent-%COMP%]{display:flex;align-items:center;gap:10px;text-decoration:none;color:inherit;margin-right:16px;min-width:0}.brand[_ngcontent-%COMP%]   img[_ngcontent-%COMP%]{border-radius:10px}.brand-text[_ngcontent-%COMP%]{font:var(--%NS%mat-sys-title-large);line-height:1.1;display:flex;flex-direction:column;white-space:nowrap}.brand-text[_ngcontent-%COMP%]   b[_ngcontent-%COMP%]{font-weight:600;color:var(--%NS%mat-sys-primary)}.brand-text[_ngcontent-%COMP%]   small[_ngcontent-%COMP%]{font:var(--%NS%mat-sys-label-small);color:var(--%NS%mat-sys-on-surface-variant);letter-spacing:.02em}.gsearch[_ngcontent-%COMP%]{flex:1;max-width:720px;height:48px;border-radius:24px;background:var(--%NS%mat-sys-surface-container-high);display:flex;align-items:center;gap:8px;padding:0 6px 0 16px;color:var(--%NS%mat-sys-on-surface-variant)}.gsearch[_ngcontent-%COMP%]:focus-within{background:var(--%NS%mat-sys-surface);box-shadow:var(--%NS%mat-sys-level2)}.gsearch[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]{flex:1;border:0;outline:0;background:transparent;font:var(--%NS%mat-sys-body-large);color:var(--%NS%mat-sys-on-surface);min-width:0;height:100%}.search-toggle[_ngcontent-%COMP%]{display:none}.demo-chip[_ngcontent-%COMP%]{margin:0 4px 0 auto}.gsearch[_ngcontent-%COMP%] + .search-toggle[_ngcontent-%COMP%] + .demo-chip[_ngcontent-%COMP%]{margin-left:8px}.acct-btn[_ngcontent-%COMP%]{margin-left:4px}.acct-card[_ngcontent-%COMP%]{display:flex;gap:12px;align-items:center;padding:12px 16px;min-width:260px}.acct-card[_ngcontent-%COMP%]   .title[_ngcontent-%COMP%]{font:var(--%NS%mat-sys-title-medium)}.frame[_ngcontent-%COMP%]{position:fixed;inset:64px 0 0;background:var(--%NS%mat-sys-surface-container-low)}.frame.with-imp[_ngcontent-%COMP%]{top:100px}.nav[_ngcontent-%COMP%]{width:280px;border:0;background:var(--%NS%mat-sys-surface-container-low);border-radius:0}.nav.nav-rail[_ngcontent-%COMP%]{width:88px}.nav.mat-drawer-over[_ngcontent-%COMP%]{border-radius:0 16px 16px 0;background:var(--%NS%mat-sys-surface-container-low)}.nav-inner[_ngcontent-%COMP%]{display:flex;flex-direction:column;min-height:100%;padding:4px 12px 12px}.nav-head[_ngcontent-%COMP%]{display:flex;align-items:center;gap:10px;padding:16px 12px 12px;font:var(--%NS%mat-sys-title-medium)}.nav-head[_ngcontent-%COMP%]   img[_ngcontent-%COMP%]{border-radius:8px}.nav-fab[_ngcontent-%COMP%]{margin:4px 0 12px 4px;align-self:flex-start;box-shadow:var(--%NS%mat-sys-level1)}.nav-rail[_ngcontent-%COMP%]   .nav-fab[_ngcontent-%COMP%]{margin-left:4px}.nav-section[_ngcontent-%COMP%]{font:var(--%NS%mat-sys-title-small);color:var(--%NS%mat-sys-on-surface-variant);padding:16px 16px 8px}.nav-sep[_ngcontent-%COMP%]{height:1px;background:var(--%NS%mat-sys-outline-variant);margin:8px 12px}.nav-item[_ngcontent-%COMP%]{display:flex;align-items:center;gap:12px;height:56px;padding:0 16px 0 4px;border-radius:28px;color:var(--%NS%mat-sys-on-surface-variant);text-decoration:none;font:var(--%NS%mat-sys-label-large);position:relative}.nav-item[_ngcontent-%COMP%]   .ind[_ngcontent-%COMP%]{width:48px;height:32px;display:grid;place-items:center;border-radius:16px;position:relative;flex:none}.nav-item[_ngcontent-%COMP%]   .lbl[_ngcontent-%COMP%]{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.nav-item[_ngcontent-%COMP%]   .count[_ngcontent-%COMP%]{font:var(--%NS%mat-sys-label-large)}.nav-item[_ngcontent-%COMP%]:hover{background:color-mix(in srgb,var(--%NS%mat-sys-on-surface) 8%,transparent)}.nav-item.active[_ngcontent-%COMP%]{background:var(--%NS%mat-sys-secondary-container);color:var(--%NS%mat-sys-on-secondary-container);font-weight:600}.nav-item[_ngcontent-%COMP%]   .dot[_ngcontent-%COMP%]{position:absolute;top:-2px;right:2px;min-width:16px;height:16px;border-radius:8px;background:var(--%NS%mat-sys-error);color:var(--%NS%mat-sys-on-error);font:var(--%NS%mat-sys-label-small);display:grid;place-items:center;padding:0 4px}.nav-rail[_ngcontent-%COMP%]   .nav-inner[_ngcontent-%COMP%]{padding:4px 0 12px;align-items:center}.nav-rail[_ngcontent-%COMP%]   .nav-item[_ngcontent-%COMP%]{flex-direction:column;gap:4px;height:auto;padding:4px 0 10px;width:80px;border-radius:0;background:none!important;font:var(--%NS%mat-sys-label-medium)}.nav-rail[_ngcontent-%COMP%]   .nav-item[_ngcontent-%COMP%]   .lbl[_ngcontent-%COMP%]{text-align:center;width:100%}.nav-rail[_ngcontent-%COMP%]   .nav-item[_ngcontent-%COMP%]   .count[_ngcontent-%COMP%]{display:none}.nav-rail[_ngcontent-%COMP%]   .nav-item.active[_ngcontent-%COMP%]   .ind[_ngcontent-%COMP%]{background:var(--%NS%mat-sys-secondary-container)}.nav-rail[_ngcontent-%COMP%]   .nav-item[_ngcontent-%COMP%]:hover   .ind[_ngcontent-%COMP%]{background:color-mix(in srgb,var(--%NS%mat-sys-on-surface) 8%,transparent)}.nav-rail[_ngcontent-%COMP%]   .nav-item.active[_ngcontent-%COMP%]{color:var(--%NS%mat-sys-on-surface)}.nav-rail[_ngcontent-%COMP%]   .nav-sep[_ngcontent-%COMP%]{width:40px}.nav-float[_ngcontent-%COMP%]{box-shadow:var(--%NS%mat-sys-level3);border-radius:0 16px 16px 0}.nav-foot[_ngcontent-%COMP%]{padding:16px}.content[_ngcontent-%COMP%]{padding:8px 24px 0 8px;overscroll-behavior:contain}.frame.rail[_ngcontent-%COMP%]   .content[_ngcontent-%COMP%]{padding-left:0}.content[_ngcontent-%COMP%] > .banner[_ngcontent-%COMP%]{margin-bottom:12px}@media(max-width:860px){.content[_ngcontent-%COMP%]{padding:4px 12px 0}.gsearch[_ngcontent-%COMP%]{display:none}.search-toggle[_ngcontent-%COMP%]{display:inline-flex;margin-left:auto}.topbar.searching[_ngcontent-%COMP%]   .gsearch[_ngcontent-%COMP%]{display:flex;position:absolute;inset:8px;max-width:none;z-index:2;background:var(--%NS%mat-sys-surface);box-shadow:var(--%NS%mat-sys-level2)}}@media(max-width:479px){.brand-text[_ngcontent-%COMP%], .demo-chip[_ngcontent-%COMP%]{display:none}}`]})};function di(n,i){n&1&&hc(0,`mat-progress-bar`,2)}function ci(n,i){n&1&&(Te(0,`div`,5)(1,`mat-icon`),Ft(2,`schedule`),Me(),Ft(3,`Your session expired — please sign in again.`),Me())}function mi(n,i){if(n&1){let e=xf();Te(0,`mat-form-field`,7)(1,`mat-label`),Ft(2,`6-digit code (or recovery code)`),Me(),Te(3,`input`,15),ES(),zy(`ngModelChange`,function(a){Ea(e);let o=To();return bx(o.otp,a)||(o.otp=a),wa$1(a)}),Me()(),Te(4,`div`,16),Ft(5,`Open your authenticator app and enter the current code.`),Me()}if(n&2){let e=To();le(3),$y(`ngModel`,e.otp),CS()}}function pi(n,i){if(n&1&&(Te(0,`div`,11)(1,`mat-icon`),Ft(2,`error`),Me(),Ft(3),Me()),n&2){let e=To();le(3),On(e.error())}}var it=class n{api=f$1(Gt);s=f$1(Mi$1);router=f$1(J$2);email=``;password=``;otp=``;busy=Le$1(!1);error=Le$1(``);show=Le$1(!1);needOtp=Le$1(!1);expired=f$1(Z$1).snapshot.queryParamMap.has(`expired`);async submit(){this.busy.set(!0),this.error.set(``);try{let i=await this.api.login(this.email,this.password,this.needOtp()?this.otp.trim():void 0);this.s.setImp(null),this.s.setToken(i.token),this.s.ready.set(!1),await this.s.init(),this.router.navigateByUrl(this.s.platformOnly()?`/platform/institutions`:this.s.billingLocked()?`/settings/billing`:`/home`)}catch(i){i.code===`otp_required`?(this.needOtp.set(!0),this.error.set(``)):this.error.set(i.message||`Sign-in failed`)}this.busy.set(!1)}static ɵfac=function(e){return new(e||n)};static ɵcmp=te({type:n,selectors:[[`k3-login`]],decls:28,vars:11,consts:[[1,`wrap`],[1,`card-login`],[`mode`,`indeterminate`,1,`pb`],[`src`,`k3-logo.png`,`alt`,`K3 Solutions`,`width`,`56`,`height`,`56`,1,`logo`],[1,`muted`],[1,`banner`,`warn`,`small`],[1,`col`,3,`ngSubmit`],[`appearance`,`outline`],[`matInput`,``,`type`,`email`,`name`,`email`,`autocomplete`,`username`,`required`,``,3,`ngModelChange`,`ngModel`],[`matInput`,``,`name`,`password`,`autocomplete`,`current-password`,`required`,``,3,`ngModelChange`,`type`,`ngModel`],[`mat-icon-button`,``,`matSuffix`,``,`type`,`button`,3,`click`],[1,`err`],[1,`row`,2,`justify-content`,`flex-end`,`margin-top`,`8px`],[`mat-flat-button`,``,`type`,`submit`,3,`disabled`],[1,`foot`,`small`,`muted`],[`matInput`,``,`name`,`otp`,`inputmode`,`text`,`autocomplete`,`one-time-code`,`autofocus`,``,3,`ngModelChange`,`ngModel`],[1,`small`,`muted`,2,`margin`,`-4px 0 8px`]],template:function(e,t){e&1&&(Te(0,`div`,0)(1,`div`,1),yt$1(2,di,1,0,`mat-progress-bar`,2),hc(3,`img`,3),Te(4,`h1`),Ft(5,`Sign in`),Me(),Te(6,`p`,4),Ft(7,`to K3 Admissions CRM`),Me(),yt$1(8,ci,4,0,`div`,5),Te(9,`form`,6),Nr(`ngSubmit`,function(){return t.submit()}),Te(10,`mat-form-field`,7)(11,`mat-label`),Ft(12,`Email`),Me(),Te(13,`input`,8),ES(),zy(`ngModelChange`,function(o){return bx(t.email,o)||(t.email=o),o}),Me()(),Te(14,`mat-form-field`,7)(15,`mat-label`),Ft(16,`Password`),Me(),Te(17,`input`,9),ES(),zy(`ngModelChange`,function(o){return bx(t.password,o)||(t.password=o),o}),Me(),Te(18,`button`,10),Nr(`click`,function(){return t.show.set(!t.show())}),Te(19,`mat-icon`),Ft(20),Me()()(),yt$1(21,mi,6,1),yt$1(22,pi,4,1,`div`,11),Te(23,`div`,12)(24,`button`,13),Ft(25),Me()()()(),Te(26,`div`,14),Ft(27,`K3 Solutions · Kontent Konnect Kommunicate`),Me()()),e&2&&(le(2),vt$1(t.busy()?2:-1),le(6),vt$1(t.expired?8:-1),le(5),$y(`ngModel`,t.email),CS(),le(4),Gi(`type`,t.show()?`text`:`password`),$y(`ngModel`,t.password),CS(),le(),Be$1(`aria-label`,t.show()?`Hide password`:`Show password`),le(2),On(t.show()?`visibility_off`:`visibility`),le(),vt$1(t.needOtp()?21:-1),le(),vt$1(t.error()?22:-1),le(2),Gi(`disabled`,t.busy()||!t.email||!t.password||t.needOtp()&&!t.otp),le(),On(t.needOtp()?`Verify`:`Sign in`))},dependencies:[Mn$1,bn$2,Pe,Vn,Dn,Qe,Yt,Ut,Fe,bt,we$1,Pt$1,rr,ir,Ep,Qc,JT,Wv,zv,Lc,kc],styles:[`.wrap[_ngcontent-%COMP%]{min-height:100dvh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;background:var(--%NS%mat-sys-surface-container)}.card-login[_ngcontent-%COMP%]{position:relative;width:min(448px,100%);background:var(--%NS%mat-sys-surface);border-radius:28px;padding:40px 40px 32px;overflow:hidden}.pb[_ngcontent-%COMP%]{position:absolute;top:0;left:0;right:0}.logo[_ngcontent-%COMP%]{border-radius:14px}h1[_ngcontent-%COMP%]{font:var(--%NS%mat-sys-headline-medium);margin:16px 0 4px}p[_ngcontent-%COMP%]{margin:0 0 24px}.err[_ngcontent-%COMP%]{display:flex;gap:8px;align-items:center;color:var(--%NS%mat-sys-error);font:var(--%NS%mat-sys-body-medium);margin:-4px 0 8px}.foot[_ngcontent-%COMP%]{margin-top:20px}@media(max-width:480px){.wrap[_ngcontent-%COMP%]{background:var(--%NS%mat-sys-surface);justify-content:flex-start;padding-top:48px}.card-login[_ngcontent-%COMP%]{padding:24px 8px}}`]})};var ui=async()=>{let n=f$1(Mi$1),i=f$1(J$2);return!n.ready()&&!await n.init()?i.parseUrl(`/login`):!0};var F=()=>{let n=f$1(Mi$1),i=f$1(J$2);return n.platformOnly()?i.parseUrl(`/platform/institutions`):n.billingLocked()?i.parseUrl(`/settings/billing`):!0};var va=()=>{let n=f$1(Mi$1),i=f$1(J$2);return n.platformOnly()?i.parseUrl(`/platform/institutions`):fe.demo||n.role()===`admin`?!0:i.parseUrl(`/home`)};var hi=()=>f$1(Mi$1).platformOnly()?!0:f$1(J$2).parseUrl(`/home`);var gi=async()=>{let n=f$1(Mi$1),i=f$1(J$2);return fe.demo?i.parseUrl(`/home`):n.token()&&(n.ready()||await n.init())?i.parseUrl(n.platformOnly()?`/platform/institutions`:`/home`):!0};var _a=[{path:`login`,component:it,canActivate:[gi],title:`Sign in · K3 Admissions`},{path:``,component:at,canActivate:[ui],children:[{path:``,pathMatch:`full`,redirectTo:`home`},{path:`home`,canActivate:[F],loadComponent:()=>import(`./chunk-v_yhtaTZ.js`).then(n=>n.HomePage),title:`Home · K3`},{path:`leads`,canActivate:[F],loadComponent:()=>import(`./chunk-D4sjYgjl.js`).then(n=>n.LeadsPage),title:`Leads · K3`},{path:`inbox`,canActivate:[F],loadComponent:()=>import(`./chunk-BstIBztX.js`).then(n=>n.InboxPage),title:`Inbox · K3`},{path:`followups`,canActivate:[F],loadComponent:()=>import(`./chunk-B3vtxeW0.js`).then(n=>n.FollowupsPage),title:`Follow-ups · K3`},{path:`nurture`,canActivate:[F],loadComponent:()=>import(`./chunk-D2wxADZF.js`).then(n=>n.NurturePage),title:`Nurture · K3`},{path:`broadcasts`,canActivate:[F],loadComponent:()=>import(`./chunk-acgJdGCZ.js`).then(n=>n.BroadcastsPage),title:`Broadcasts · K3`},{path:`broadcasts/new`,canActivate:[F],loadComponent:()=>import(`./chunk-DdR8Sn7Z.js`).then(n=>n.BroadcastNewPage),title:`New broadcast · K3`},{path:`templates`,canActivate:[F],loadComponent:()=>import(`./chunk-uSWbFaFK.js`).then(n=>n.TemplatesPage),title:`Templates · K3`},{path:`ai-qualifier`,canActivate:[F],loadComponent:()=>import(`./chunk-CF6gf5Vl.js`).then(n=>n.AiPage),title:`AI Qualifier · K3`},{path:`reports`,canActivate:[F],loadComponent:()=>import(`./chunk-fQhHr9P0.js`).then(n=>n.ReportsPage),title:`Reports · K3`},{path:`api`,canActivate:[F],loadComponent:()=>import(`./chunk-BLDiv3aC.js`).then(n=>n.ApiDocsPage),title:`API · K3`},{path:`settings`,canActivate:[va],loadComponent:()=>import(`./chunk-BJeBmOAy.js`).then(n=>n.SettingsPage),title:`Settings · K3`},{path:`settings/:tab`,canActivate:[va],loadComponent:()=>import(`./chunk-BJeBmOAy.js`).then(n=>n.SettingsPage),title:`Settings · K3`},{path:`platform`,pathMatch:`full`,redirectTo:`platform/institutions`},{path:`platform/:tab`,canActivate:[hi],loadComponent:()=>import(`./chunk-BwmpFngB.js`).then(n=>n.PlatformPage),title:`Platform · K3`}]},{path:`**`,redirectTo:``}];var fi={settings:`settings-whatsapp`,platform:`platform-institutions`};var ya=n=>{let i=n.split(`?`)[0].replace(/^\/+|\/+$/g,``),e=i?i.replace(/\//g,`-`):`home`;return fi[e]||e};var bi=n=>n?n===`broadcasts-new`?`/broadcasts/new`:/^(settings|platform)-/.test(n)?`/`+n.replace(`-`,`/`):`/`+n:`/home`;var ot=class n extends E0{memo=``;path(){let i=decodeURIComponent((window.location.hash||``).replace(/^#\/?/,``));return this.memo&&ya(this.memo)===i?this.memo:i.includes(`/`)?`/`+i.replace(/^\/+/,``):bi(i)}prepareExternalUrl(i){return`#`+ya(i)}pushState(i,e,t,a){this.memo=t+(a?(a.startsWith(`?`)?``:`?`)+a:``),super.pushState(i,e,t,``)}replaceState(i,e,t,a){this.memo=t+(a?(a.startsWith(`?`)?``:`?`)+a:``),super.replaceState(i,e,t,``)}static ɵfac=(()=>{let i;return function(t){return(i||(i=en$1(n)))(t||n)}})();static ɵprov=O({token:n,factory:n.ɵfac})};var wa=(n,i)=>{let e=f$1(Mi$1),t=f$1(J$2),a=e.token();return i(a?n.clone({setHeaders:{Authorization:`Bearer `+a}}):n).pipe(Qo(r=>{let u=r.error&&(r.error.error||r.error.message)||(r.status===0?`Network error — check your connection`:`Request failed (${r.status})`);return r.status===401&&!n.url.endsWith(`/auth/login`)&&(e.clear(),t.navigateByUrl(`/login?expired=1`)),r.status===402&&!n.url.includes(`/billing`)&&(e.refreshMe().catch(()=>{}),t.navigateByUrl(`/settings/billing`)),El(()=>Object.assign(new Error(u),{status:r.status,code:r.error&&r.error.code}))}))};var xa=n=>{let i=f$1(Mi$1),e=window,t=n.urlWithParams.replace(/^.*\/api\/v1/,``);return new k(a=>{let[o,r]=e.API_CONFIG.latency,u=setTimeout(async()=>{try{let p=n.body;if(p instanceof FormData){let _=p.get(`file`);p={name:_.name,size:_.size,type:_.type,url:URL.createObjectURL(_)}}let w=e.DemoExtra?.handle(n.method,t,p);w===void 0&&(w=await e.MockServer.handle(n.method,t,p,(_,Sa)=>i.emit(_,Sa))),a.next(new rs({status:200,body:w})),a.complete()}catch(p){a.error(Object.assign(new Error(p.message||`Demo error`),{status:p.status||400}))}},o+Math.random()*(r-o));return()=>clearTimeout(u)})};var vi=ys(n=>{let i=String(n.error?.message||n.error||``);if(/dynamically imported module|Importing a module script failed|Loading chunk/i.test(i))try{let e=+(sessionStorage.getItem(`k3-reloaded`)||0);Date.now()-e>3e4&&(sessionStorage.setItem(`k3-reloaded`,String(Date.now())),location.assign(n.url))}catch{}});var _i=[bs(),ps({scrollPositionRestoration:`top`}),vi];var Ca={providers:[kE(),kx(),ds(_a,..._i),...fe.demo?[{provide:No,useClass:ot}]:[],uT(fT(fe.demo?[xa]:[wa])),{provide:gt,useValue:{appearance:`outline`}},{provide:IM,useValue:{duration:5e3,horizontalPosition:`start`}},{provide:bc,useValue:`en-IN`},gI(()=>{f$1(Hv).setDefaultFontSetClass(`material-symbols-rounded`)})]};var rt=class n{static ɵfac=function(e){return new(e||n)};static ɵcmp=te({type:n,selectors:[[`app-root`]],decls:1,vars:0,template:function(e,t){e&1&&hc(0,`router-outlet`)},dependencies:[xn$1],encapsulation:2})};V0(rt,Ca).catch(n=>console.error(n));export{Ve as a,ze as c,Ot as d,P as f,ke as i,At as l,se as n,We as o,C as p,ie as r,di$1 as s,re as t,G as u};