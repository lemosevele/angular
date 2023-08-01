import { Directive, ElementRef } from '@angular/core';

//diretiva de atributo criada para deixar um elemento vermelho
@Directive({
  selector: '[appRed]'
})
export class RedDirective {

  constructor(private el: ElementRef) {
    el.nativeElement.style.color = '#e35e6b';
  }

}
