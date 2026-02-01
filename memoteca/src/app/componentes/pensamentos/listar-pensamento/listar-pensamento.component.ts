import { Component, OnInit } from '@angular/core';
import { Pensamento } from '../pensamento';
import { PensamentoService } from '../pensamento.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-listar-pensamento',
  templateUrl: './listar-pensamento.component.html',
  styleUrls: ['./listar-pensamento.component.css']
})
export class ListarPensamentoComponent implements OnInit {

  listaPensamentos: Pensamento[] = [];
  paginaAtual: number = 1;
  haMaisPensamentos: boolean = true;
  mostrarFavoritos: boolean = false;
  listaFavoritos: Pensamento[] = [];
  filtro: string = '';
  titulo: string = 'Meu Mural';

  constructor(
    private service: PensamentoService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.service.listar(this.paginaAtual, this.filtro, this.mostrarFavoritos).subscribe((pensamentos) => {
      this.listaPensamentos = pensamentos;
    });
  }

  carregarMaisPensamentos() {
    this.service.listar(++this.paginaAtual, this.filtro, this.mostrarFavoritos).subscribe((pensamentos) => {
      this.listaPensamentos.push(...pensamentos);
      if (!pensamentos.length) {
        this.haMaisPensamentos = false;
      }
    });
  }

  pesquisarPensamentos() {
    this.paginaAtual = 1;
    this.haMaisPensamentos = true;
    this.service.listar(this.paginaAtual, this.filtro, this.mostrarFavoritos).subscribe((pensamentos) => {
      this.listaPensamentos = pensamentos;
    });
  }

  listarFavoritos(): void {
    this.titulo = 'Meus Favoritos';
    this.mostrarFavoritos = true;
    this.paginaAtual = 1;
    this.haMaisPensamentos = true;
    this.service.listar(this.paginaAtual, this.filtro, this.mostrarFavoritos).subscribe((pensamentos) => {
      this.listaPensamentos = pensamentos;
      this.listaFavoritos = pensamentos; // listaPensamentos e listaFavoritos apontam para o mesmo array
                                        // quando listaFavoritos for atualizado em PensamentoComponent,
                                        // listaPensamentos também será atualizado e a tela refletirá a mudança
      //console.log(this.listaFavoritos == this.listaPensamentos); //true
    });
  }

  recarregarComponente(): void {
    //configurações necessárias para recarregar o componente atual
    this.router.routeReuseStrategy.shouldReuseRoute = () => false; // desabilita a reutilização de rotas, o angular destrói o componente e cria um novo
    this.router.onSameUrlNavigation = 'reload'; // habilita o recarregamento na mesma URL
    this.router.navigate([this.router.url]); //só essa linha não funcionaria para recarregar o componente
  }

}
