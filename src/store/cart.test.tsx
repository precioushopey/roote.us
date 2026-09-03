import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { CartProvider, useCart } from './cart';

function Probe() {
  const cart = useCart();
  return (
    <div>
      <span data-testid="count">{cart.count}</span>
      <span data-testid="lines">{JSON.stringify(cart.lines)}</span>
      <button onClick={() => cart.add('minoxidil-5')}>add-minox</button>
      <button onClick={() => cart.add('growth-capsules')}>add-caps</button>
      <button onClick={() => cart.setQty('minoxidil-5', 5)}>set-5</button>
      <button onClick={() => cart.setQty('minoxidil-5', 999)}>set-999</button>
      <button onClick={() => cart.setQty('minoxidil-5', 0)}>set-0</button>
      <button onClick={() => cart.remove('growth-capsules')}>remove-caps</button>
      <button onClick={() => cart.clear()}>clear</button>
    </div>
  );
}

const click = (label: string) => act(() => screen.getByText(label).click());

beforeEach(() => localStorage.clear());

describe('cart store', () => {
  it('adds a line at qty 1 and increments on repeat add', () => {
    render(<CartProvider><Probe /></CartProvider>);
    click('add-minox');
    expect(screen.getByTestId('lines')).toHaveTextContent('[{"sku":"minoxidil-5","qty":1}]');
    click('add-minox');
    expect(screen.getByTestId('lines')).toHaveTextContent('[{"sku":"minoxidil-5","qty":2}]');
    expect(screen.getByTestId('count')).toHaveTextContent('2');
  });

  it('tracks count across multiple skus', () => {
    render(<CartProvider><Probe /></CartProvider>);
    click('add-minox');
    click('add-caps');
    click('add-caps');
    expect(screen.getByTestId('count')).toHaveTextContent('3');
  });

  it('setQty clamps to the max of 20', () => {
    render(<CartProvider><Probe /></CartProvider>);
    click('add-minox');
    click('set-999');
    expect(screen.getByTestId('lines')).toHaveTextContent('"qty":20');
  });

  it('setQty at or below zero removes the line', () => {
    render(<CartProvider><Probe /></CartProvider>);
    click('add-minox');
    click('set-0');
    expect(screen.getByTestId('lines')).toHaveTextContent('[]');
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('remove deletes only the named sku, clear empties everything', () => {
    render(<CartProvider><Probe /></CartProvider>);
    click('add-minox');
    click('add-caps');
    click('remove-caps');
    expect(screen.getByTestId('lines')).toHaveTextContent('[{"sku":"minoxidil-5","qty":1}]');
    click('clear');
    expect(screen.getByTestId('lines')).toHaveTextContent('[]');
  });

  it('persists to localStorage and rehydrates on remount', () => {
    const { unmount } = render(<CartProvider><Probe /></CartProvider>);
    click('add-minox');
    click('set-5');
    expect(localStorage.getItem('roote.cart')).toContain('"qty":5');
    unmount();
    render(<CartProvider><Probe /></CartProvider>);
    expect(screen.getByTestId('lines')).toHaveTextContent('[{"sku":"minoxidil-5","qty":5}]');
    expect(screen.getByTestId('count')).toHaveTextContent('5');
  });
});
