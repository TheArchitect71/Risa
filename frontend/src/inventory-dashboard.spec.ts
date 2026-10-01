import { TestBed } from '@angular/core/testing';
import { InventoryDashboard } from './inventory-dashboard';

describe('Risa inventory dashboard', () => {
  const products = [
    { _id: 'a', title: 'Keyboard', imageUrl: 'images/a.png', price: 20, description: 'Keyboard', sku: 'KB-1', category: 'Office', quantity: 2, reorderLevel: 3 },
    { _id: 'b', title: 'Mug', imageUrl: 'images/b.png', price: 5, description: 'Mug', sku: 'MG-1', category: 'Home', quantity: null, reorderLevel: 5 }
  ];

  beforeEach(() => TestBed.configureTestingModule({ imports: [InventoryDashboard] }));

  it('shows Risa product totals and keeps legacy stock untracked', () => {
    const fixture = TestBed.createComponent(InventoryDashboard);
    fixture.componentInstance.products = products;
    fixture.detectChanges();
    expect(fixture.componentInstance.summary).toEqual({ products: 2, units: 2, lowStock: 1, value: 40 });
    expect(fixture.nativeElement.textContent).toContain('Not tracked');
    expect(fixture.nativeElement.textContent).toContain('Low stock');
  });

  it('searches and filters the shared product list', () => {
    const fixture = TestBed.createComponent(InventoryDashboard);
    fixture.componentInstance.products = products;
    fixture.componentInstance.stockFilter = 'low';
    expect(fixture.componentInstance.visible.map(product => product.title)).toEqual(['Keyboard']);
    fixture.componentInstance.query = 'home';
    expect(fixture.componentInstance.visible).toEqual([]);
  });
});
