import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Api } from '../core/api.service';
import { Session } from '../core/session.service';

@Component({
  selector: 'k3-login',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressBarModule],
  template: `
  <div class="wrap">
    <div class="card-login">
      @if (busy()) { <mat-progress-bar mode="indeterminate" class="pb" /> }
      <img src="k3-logo.png" alt="K3 Solutions" width="56" height="56" class="logo">
      <h1>Sign in</h1>
      <p class="muted">to K3 Admissions CRM</p>
      @if (expired) { <div class="banner warn small"><mat-icon>schedule</mat-icon>Your session expired — please sign in again.</div> }
      <form (ngSubmit)="submit()" class="col">
        <mat-form-field appearance="outline"><mat-label>Email</mat-label><input matInput type="email" name="email" [(ngModel)]="email" autocomplete="username" required></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Password</mat-label>
          <input matInput [type]="show() ? 'text' : 'password'" name="password" [(ngModel)]="password" autocomplete="current-password" required>
          <button mat-icon-button matSuffix type="button" (click)="show.set(!show())" [attr.aria-label]="show() ? 'Hide password' : 'Show password'"><mat-icon>{{ show() ? 'visibility_off' : 'visibility' }}</mat-icon></button>
        </mat-form-field>
        @if (needOtp()) {
          <mat-form-field appearance="outline"><mat-label>6-digit code (or recovery code)</mat-label><input matInput name="otp" [(ngModel)]="otp" inputmode="text" autocomplete="one-time-code" autofocus></mat-form-field>
          <div class="small muted" style="margin:-4px 0 8px">Open your authenticator app and enter the current code.</div>
        }
        @if (error()) { <div class="err"><mat-icon>error</mat-icon>{{ error() }}</div> }
        <div class="row" style="justify-content:flex-end;margin-top:8px"><button mat-flat-button type="submit" [disabled]="busy() || !email || !password || (needOtp() && !otp)">{{ needOtp() ? 'Verify' : 'Sign in' }}</button></div>
      </form>
    </div>
    <div class="foot small muted">K3 Solutions · Kontent Konnect Kommunicate</div>
  </div>`,
  styles: [`.wrap{min-height:100dvh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;background:var(--mat-sys-surface-container)}
    .card-login{position:relative;width:min(448px,100%);background:var(--mat-sys-surface);border-radius:28px;padding:40px 40px 32px;overflow:hidden}
    .pb{position:absolute;top:0;left:0;right:0} .logo{border-radius:14px} h1{font:var(--mat-sys-headline-medium);margin:16px 0 4px} p{margin:0 0 24px}
    .err{display:flex;gap:8px;align-items:center;color:var(--mat-sys-error);font:var(--mat-sys-body-medium);margin:-4px 0 8px} .foot{margin-top:20px}
    @media (max-width:480px){.wrap{background:var(--mat-sys-surface);justify-content:flex-start;padding-top:48px}.card-login{padding:24px 8px}}`],
})
export class LoginPage {
  private api = inject(Api); private s = inject(Session); private router = inject(Router);
  email = ''; password = ''; otp = ''; busy = signal(false); error = signal(''); show = signal(false); needOtp = signal(false);
  expired = inject(ActivatedRoute).snapshot.queryParamMap.has('expired');
  async submit() {
    this.busy.set(true); this.error.set('');
    try {
      const r = await this.api.login(this.email, this.password, this.needOtp() ? this.otp.trim() : undefined);
      this.s.setImp(null); this.s.setToken(r.token); this.s.ready.set(false);
      await this.s.init();
      this.router.navigateByUrl(this.s.platformOnly() ? '/platform/institutions' : this.s.billingLocked() ? '/settings/billing' : '/home');
    } catch (e: any) {
      if (e.code === 'otp_required') { this.needOtp.set(true); this.error.set(''); }
      else this.error.set(e.message || 'Sign-in failed');
    }
    this.busy.set(false);
  }
}
