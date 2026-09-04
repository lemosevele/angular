import { Component } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { CadastroService } from './../../core/services/cadastro.service';
import { PessoaUsuaria } from 'src/app/core/types/type';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss']
})
export class CadastroComponent {
  perfilComponent: boolean = false;

  constructor(
    private formularioService: FormularioService,
    private cadastroService: CadastroService
  ) { }
  
  cadastrar() {
    const formCadastro = this.formularioService.getCadastro();
    if (formCadastro && formCadastro.valid) {
      const novoCadastro = formCadastro.getRawValue() as PessoaUsuaria;
      console.log("cadastrar() method called", novoCadastro);
      this.cadastroService.cadastrar(novoCadastro).subscribe({
        next: (pessoa) => {
          console.log("Cadastro realizado com sucesso:", pessoa);
        },
        error: (err) => {
          console.error("Erro ao realizar cadastro:", err);
        }
      });
    }
  }
}
