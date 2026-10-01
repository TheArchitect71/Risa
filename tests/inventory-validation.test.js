const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Product = require('../models/product');
const { validProduct } = require('../middleware/is-validated');

async function validate(body) {
  const request = { body };
  for (const rule of validProduct) await rule.run(request);
  return validationResult(request).array();
}

const base = { title: 'Keyboard', price: '19.99', description: 'Wireless keyboard', sku: 'KB-1', category: 'Office', quantity: '2', reorderLevel: '3' };

test('inventory fields accept tracked or untracked products', async () => {
  assert.deepEqual(await validate({ ...base }), []);
  assert.deepEqual(await validate({ ...base, quantity: '', reorderLevel: '' }), []);
});

test('inventory validation rejects negative and fractional stock', async () => {
  assert((await validate({ ...base, quantity: '-1' })).some(error => error.path === 'quantity'));
  assert((await validate({ ...base, reorderLevel: '1.5' })).some(error => error.path === 'reorderLevel'));
});

test('existing shop products remain untracked until stock is entered', async () => {
  const product = Product.hydrate({
    _id: new mongoose.Types.ObjectId(),
    userId: new mongoose.Types.ObjectId(),
    title: 'Legacy product', price: 10, description: 'Legacy item', imageUrl: 'images/example.png'
  });
  assert.equal(product.quantity, null);
  assert.equal(product.reorderLevel, 5);
  await product.validate();
});
