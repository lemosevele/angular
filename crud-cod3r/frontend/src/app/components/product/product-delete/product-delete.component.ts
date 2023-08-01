import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from './../product.model';
import { ProductService } from './../product.service';

@Component({
  selector: 'app-product-delete',
  templateUrl: './product-delete.component.html',
  styleUrls: ['./product-delete.component.css']
})
export class ProductDeleteComponent implements OnInit {

  product: Product;

  constructor(
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.getProductById();
  }

  getProductById(){
    let id = +this.route.snapshot.paramMap.get('id');
    this.productService.readById(id).subscribe(product => {
      this.product = product;
    });
  }

  deleteProduct(){
    this.productService.delete(this.product.id).subscribe(() => {
      this.productService.showMessage('Produto excluído com sucesso!')
      this.cancel();
    });
  }

  cancel(){
    this.router.navigate(['/products']);
  }

}
