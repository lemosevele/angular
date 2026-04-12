import { Component, OnInit } from '@angular/core';
import { Pensamento } from '../pensamento';
import { PensamentoService } from '../pensamento.service';
import { Router } from '@angular/router';
import { OtelDynatraceLoggerService } from 'src/app/otel-dynatrace-logger.service';

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
    private router: Router,
    private logger: OtelDynatraceLoggerService
  ) { }

  ngOnInit(): void {
    this.service.listar(this.paginaAtual, this.filtro, this.mostrarFavoritos).subscribe({
      next: (pensamentos) => {
        this.listaPensamentos = pensamentos;
        this.logger.info('Lista de pensamentos carregada com sucesso', 'ListarPensamentoComponent - método: ngOnInit');
      },
      error: (erro) => {
        this.logger.error('Erro ao carregar lista de pensamentos', 'ListarPensamentoComponent - método: ngOnInit');
        console.error(erro);
      }
    });
  }

  carregarMaisPensamentos() {
    this.service.listar(++this.paginaAtual, this.filtro, this.mostrarFavoritos).subscribe({
      next: (pensamentos) => {
        this.listaPensamentos.push(...pensamentos);
        this.logger.info('Mais pensamentos carregados com sucesso', 'ListarPensamentoComponent - método: carregarMaisPensamentos');
        if (!pensamentos.length) {
          this.haMaisPensamentos = false;
        }
      },
      error: (erro) => {
        this.logger.error('Erro ao carregar mais pensamentos', 'ListarPensamentoComponent - método: carregarMaisPensamentos');
        console.error(erro);
      }
    });
  }

  pesquisarPensamentos() {
    this.paginaAtual = 1;
    this.haMaisPensamentos = true;
    this.service.listar(this.paginaAtual, this.filtro, this.mostrarFavoritos).subscribe({
      next: (pensamentos) => {
        this.listaPensamentos = pensamentos;
        this.logger.info('Pensamentos pesquisados com sucesso', 'ListarPensamentoComponent - método: pesquisarPensamentos');
      },
      error: (erro) => {
        this.logger.error('Erro ao pesquisar pensamentos', 'ListarPensamentoComponent - método: pesquisarPensamentos');
        console.error(erro);
      }
    });
  }

  listarFavoritos(): void {
    this.titulo = 'Meus Favoritos';
    this.mostrarFavoritos = true;
    this.paginaAtual = 1;
    this.haMaisPensamentos = true;
    this.service.listar(this.paginaAtual, this.filtro, this.mostrarFavoritos).subscribe({
      next: (pensamentos) => {
        this.listaPensamentos = pensamentos;
        this.listaFavoritos = pensamentos; // listaPensamentos e listaFavoritos apontam para o mesmo array
                                          // quando listaFavoritos for atualizado em PensamentoComponent,
                                          // listaPensamentos também será atualizado e a tela refletirá a mudança
        //console.log(this.listaFavoritos == this.listaPensamentos); //true
        this.logger.info('Favoritos listados com sucesso', 'ListarPensamentoComponent - método: listarFavoritos');
      },
      error: (erro) => {
        this.logger.error('Erro ao listar favoritos', 'ListarPensamentoComponent - método: listarFavoritos');
        console.error(erro);
      }
    });
  }

  recarregarComponente(): void {
    //configurações necessárias para recarregar o componente atual
    this.router.routeReuseStrategy.shouldReuseRoute = () => false; // desabilita a reutilização de rotas, o angular destrói o componente e cria um novo
    this.router.onSameUrlNavigation = 'reload'; // habilita o recarregamento na mesma URL
    this.router.navigate([this.router.url]); //só essa linha não funcionaria para recarregar o componente
  }

}
