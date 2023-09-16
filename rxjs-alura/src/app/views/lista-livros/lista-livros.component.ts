import { Component, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription, map, switchMap, filter, debounceTime, distinctUntilChanged, catchError, throwError, of, EMPTY } from 'rxjs';
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
  mensagemErro = ''; 
  livrosResultado: LivrosResultado;
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
      map(resultado => this.livrosResultado = resultado),
      map(resultado => resultado.items ?? [] ),
      map( items => this.livrosResultadoParaLivros(items) ), // o retorno foi atribuído a variável listaLivros no HTML. Emite uma notificação de complete.
      catchError( (erro) => {

        // this.mensagemErro = 'Ops, ocorreu um erro. Recarregue a aplicação.'
        // return EMPTY // Podemos usar o EMPTY como callback de inscrição para o catchError se não quisermos fazer nada com o erro.
        console.log(erro);
        return throwError(() => new Error(this.mensagemErro = 'Ops, ocorreu um erro.'))
      })
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



