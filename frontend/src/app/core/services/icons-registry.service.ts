import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable()
export class IconsRegistryService {
  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    this.matIconRegistry.addSvgIconSet(this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/mdi.svg'));
  }
}

export const loadIconsRegistry =
  (iconsRegistry: IconsRegistryService): (() => IconsRegistryService) =>
  () =>
    iconsRegistry;
