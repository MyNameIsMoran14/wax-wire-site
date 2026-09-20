<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\ProductModel;

class ProductController
{
    // Filters are all optional query params — an unknown/malformed value
    // (bad type enum, non-numeric price) is silently dropped rather than
    // a 400, same as any public search endpoint: garbage in just means
    // that filter doesn't apply, not a client error worth failing the request over.
    public function index(Request $request): void
    {
        $filters = [];

        $genre = $request->query('genre');
        if (is_numeric($genre)) {
            $filters['genre'] = (int) $genre;
        }

        $type = $request->query('type');
        if ($type !== null) {
            $filters['type'] = (string) $type;
        }

        $priceMin = $request->query('price_min');
        if ($priceMin !== null) {
            $filters['price_min'] = (string) $priceMin;
        }

        $priceMax = $request->query('price_max');
        if ($priceMax !== null) {
            $filters['price_max'] = (string) $priceMax;
        }

        $q = $request->query('q');
        if ($q !== null) {
            $filters['q'] = trim((string) $q);
        }

        $sort = $request->query('sort');
        if ($sort !== null) {
            $filters['sort'] = (string) $sort;
        }

        $page = $request->query('page');
        if (is_numeric($page)) {
            $filters['page'] = (int) $page;
        }

        Response::json(ProductModel::search($filters));
    }

    public function show(Request $request, string $id): void
    {
        if (!ctype_digit($id)) {
            Response::error('product_not_found', 'Товар не найден', 404);
        }

        $product = ProductModel::findById((int) $id);
        if ($product === null) {
            Response::error('product_not_found', 'Товар не найден', 404);
        }

        Response::json(ProductModel::toDetailedPublic($product));
    }
}
