import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface InventoryProduct {
  _id: string;
  title: string;
  imageUrl: string;
  price: number;
  description: string;
  sku?: string;
  category?: string;
  quantity?: number | null;
  reorderLevel?: number | null;
}

@Component({
  selector: 'app-inventory-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory-dashboard.html',
  styleUrl: './inventory-dashboard.css'
})
export class InventoryDashboard {
  @Input() products: InventoryProduct[] = [];
  @Output() add = new EventEmitter<void>();
  @Output() edit = new EventEmitter<string>();
  @Output() remove = new EventEmitter<string>();

  query = '';
  stockFilter: 'all' | 'low' = 'all';
  announcement = '';

  hasStock(product: InventoryProduct): boolean {
    return Number.isSafeInteger(product.quantity) && product.quantity! >= 0;
  }

  isLow(product: InventoryProduct): boolean {
    return this.hasStock(product) && product.quantity! <= (product.reorderLevel ?? 5);
  }

  get summary() {
    return {
      products: this.products.length,
      units: this.products.reduce((total, product) => total + (this.hasStock(product) ? product.quantity! : 0), 0),
      lowStock: this.products.filter(product => this.isLow(product)).length,
      value: this.products.reduce((total, product) => total + (this.hasStock(product) ? product.quantity! * product.price : 0), 0)
    };
  }

  get visible(): InventoryProduct[] {
    const term = this.query.trim().toLocaleLowerCase();
    return this.products.filter(product => {
      if (this.stockFilter === 'low' && !this.isLow(product)) return false;
      return !term || [product.title, product.sku || '', product.category || '']
        .some(value => value.toLocaleLowerCase().includes(term));
    }).sort((a, b) => a.title.localeCompare(b.title));
  }

  exportItems(): void {
    const rows = this.products.map(product => ({
      name: product.title,
      sku: product.sku || '',
      category: product.category || '',
      quantity: product.quantity ?? null,
      reorderLevel: product.reorderLevel ?? 5,
      unitPrice: product.price,
      description: product.description
    }));
    const url = URL.createObjectURL(new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `risa-inventory-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    this.announcement = 'Inventory exported.';
  }
}
