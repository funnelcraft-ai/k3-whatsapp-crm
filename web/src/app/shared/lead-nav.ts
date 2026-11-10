/* Opens the lead side sheet (full screen on phones) and reports whether anything changed */
import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { LeadSheet } from './lead-sheet';

@Injectable({ providedIn: 'root' })
export class LeadNav {
  private dialog = inject(MatDialog);
  async open(id: string, tab?: string): Promise<boolean> {
    const phone = window.innerWidth <= 600;
    const ref = this.dialog.open(LeadSheet, {
      data: { id, tab }, autoFocus: false, restoreFocus: true,
      position: phone ? undefined : { right: '0', top: '0' },
      width: phone ? '100vw' : 'min(560px, 100vw)', maxWidth: '100vw', height: '100dvh', maxHeight: '100dvh',
      panelClass: phone ? 'full-sheet' : 'side-sheet', enterAnimationDuration: '180ms',
    });
    const inst = ref.componentInstance;
    await firstValueFrom(ref.afterClosed());
    return inst?.changed ?? false;
  }
}
