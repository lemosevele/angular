import { Component, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription, map, switchMap, filter, debounceTime, distinctUntilChanged } from 'rxjs';
import { Item, Livro, LivrosResultado } from 'src/app/models/interfaces';
import { LivroVolumeInfo } from 'src/app/models/livroVolumeInfo';
import { LivroService } from 'src/app/service/livro.service';

const PAUSA = 300;

@Component({
  selector: 'app-lista-livros',
  templateUrl: './lista-livros.component.html',
  styleUrls: ['./lista-livros.component.css']
})
export class ListaLivrosComponent implements OnDestroy {

  // listaLivros: Livro[];
  livro: Livro;
  campoBusca = new FormControl();
  // subscription: Subscription;

  constructor(
    private livroService: LivroService,
  ) { }

  ngOnDestroy() {
    // this.subscription.unsubscribe();
    // utilizando o '| async' não precisa fazer subscriber/unsubscriber manualmente
  }

  livrosEncontrados$ = this.campoBusca.valueChanges
    .pipe(
      debounceTime(PAUSA),
      filter( valorDigitado => valorDigitado.length >= 3),
      distinctUntilChanged(),
      switchMap( valorDigitado => this.livroService.buscar(valorDigitado) ),
      map( items => this.livrosResultadoParaLivros(items) )
      // o retorno foi atribuído a variável listaLivros no HTML
    )

  // buscarLivros() {
  //   this.subscription = this.livroService.buscar(this.campoBusca).subscribe({
  //     next: items => {
  //       this.listaLivros = this.livrosResultadoParaLivros(items);
  //     },
  //     error: erro => console.error(erro)
  //   });
  // }

  livrosResultadoParaLivros(items: Item[]): LivroVolumeInfo[] {
    return items.map(item => { 
      return new LivroVolumeInfo(item);
    }) 
  }

}



