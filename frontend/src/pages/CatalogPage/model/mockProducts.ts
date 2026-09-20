import type { Product } from '@/entities/product'

// Placeholder data until GET /products is wired up on the backend.
export const MOCK_PRODUCTS: Product[] = [
  { id: 1, title: 'Happier Than Ever', artist: 'Billie Eilish', genre: null, type: 'vinyl', price: '6700', stock: 5, year: 2021, coverUrl: null },
  { id: 2, title: 'AM', artist: 'Arctic Monkeys', genre: null, type: 'vinyl', price: '5100', stock: 3, year: 2013, coverUrl: null },
  { id: 3, title: 'Bad', artist: 'Michael Jackson', genre: null, type: 'vinyl', price: '3500', stock: 8, year: 1987, coverUrl: null },
  { id: 4, title: 'xx', artist: 'The xx', genre: null, type: 'vinyl', price: '4500', stock: 4, year: 2009, coverUrl: null },
  { id: 5, title: 'X&Y', artist: 'Coldplay', genre: null, type: 'vinyl', price: '5100', stock: 6, year: 2005, coverUrl: null },
  { id: 6, title: 'Nevermind', artist: 'Nirvana', genre: null, type: 'vinyl', price: '6800', stock: 2, year: 1991, coverUrl: null },
  { id: 7, title: 'Direct Hits', artist: 'The Killers', genre: null, type: 'vinyl', price: '2800', stock: 7, year: 2013, coverUrl: null },
  { id: 8, title: 'MTV Unplugged', artist: 'Placebo', genre: null, type: 'vinyl', price: '5500', stock: 3, year: 2004, coverUrl: null },
  { id: 9, title: 'AT-LP120X', artist: 'Audio-Technica', genre: null, type: 'equipment', price: '35700', stock: 4, year: null, coverUrl: null },
  { id: 10, title: 'Debut Carbon', artist: 'Pro-Ject', genre: null, type: 'equipment', price: '48200', stock: 2, year: null, coverUrl: null },
  { id: 11, title: 'PS-LX310BT', artist: 'Sony', genre: null, type: 'equipment', price: '19900', stock: 5, year: null, coverUrl: null },
  { id: 12, title: 'SL-1200MK7', artist: 'Technics', genre: null, type: 'equipment', price: '89000', stock: 1, year: null, coverUrl: null },
]
