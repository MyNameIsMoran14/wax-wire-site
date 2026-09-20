<?php

declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Core\Auth;
use App\Core\Request;
use App\Core\Response;
use App\Core\Validator;
use App\Models\GenreModel;
use App\Models\ProductModel;

class ProductController
{
    private const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

    /** Client-supplied MIME/extension is never trusted — only what mime_content_type() detects from the bytes. */
    private const ALLOWED_IMAGE_MIME = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
    ];

    public function index(Request $request): void
    {
        Auth::requireRole($request, 'admin');
        Response::json(ProductModel::allAdmin());
    }

    public function store(Request $request): void
    {
        Auth::requireRole($request, 'admin');

        $data = $request->all();

        $errors = Validator::validate($data, [
            'title' => ['required'],
            'artist' => ['required'],
            'type' => ['required', 'in:vinyl,cd,equipment'],
            'price' => ['required', 'numeric'],
            'stock' => ['required', 'numeric'],
            'genre_id' => ['numeric'],
            'year' => ['numeric'],
        ]);
        if ($errors !== []) {
            Response::error('validation_error', 'Проверьте введённые данные', 400);
        }

        $genreId = self::parseNullableInt($data['genre_id'] ?? null);
        if ($genreId !== null && GenreModel::findById($genreId) === null) {
            Response::error('validation_error', 'Жанр не найден', 400);
        }

        $id = ProductModel::create([
            'title' => (string) $data['title'],
            'artist' => (string) $data['artist'],
            'genre_id' => $genreId,
            'type' => (string) $data['type'],
            'price' => number_format((float) $data['price'], 2, '.', ''),
            'stock' => (int) $data['stock'],
            'year' => self::parseNullableInt($data['year'] ?? null),
            'description' => $data['description'] ?? null,
        ]);

        Response::json(ProductModel::toDetailedPublic(ProductModel::findById($id)), 201);
    }

    // Partial update: only fields present in the request body are touched —
    // omitting a field leaves it as-is, sending it as null clears it (where nullable).
    public function update(Request $request, string $id): void
    {
        Auth::requireRole($request, 'admin');

        if (!ctype_digit($id) || ProductModel::findById((int) $id) === null) {
            Response::error('product_not_found', 'Товар не найден', 404);
        }
        $productId = (int) $id;

        $data = $request->all();

        $errors = Validator::validate($data, [
            'type' => ['in:vinyl,cd,equipment'],
            'price' => ['numeric'],
            'stock' => ['numeric'],
            'genre_id' => ['numeric'],
            'year' => ['numeric'],
        ]);
        if ($errors !== []) {
            Response::error('validation_error', 'Проверьте введённые данные', 400);
        }

        $update = [];
        foreach (['title', 'artist', 'type', 'description'] as $field) {
            if (array_key_exists($field, $data)) {
                $update[$field] = $data[$field];
            }
        }
        if (array_key_exists('price', $data)) {
            $update['price'] = number_format((float) $data['price'], 2, '.', '');
        }
        if (array_key_exists('stock', $data)) {
            $update['stock'] = (int) $data['stock'];
        }
        if (array_key_exists('year', $data)) {
            $update['year'] = self::parseNullableInt($data['year']);
        }
        if (array_key_exists('genre_id', $data)) {
            $genreId = self::parseNullableInt($data['genre_id']);
            if ($genreId !== null && GenreModel::findById($genreId) === null) {
                Response::error('validation_error', 'Жанр не найден', 400);
            }
            $update['genre_id'] = $genreId;
        }

        ProductModel::update($productId, $update);

        Response::json(ProductModel::toDetailedPublic(ProductModel::findById($productId)));
    }

    public function destroy(Request $request, string $id): void
    {
        Auth::requireRole($request, 'admin');

        if (!ctype_digit($id) || !ProductModel::delete((int) $id)) {
            Response::error('product_not_found', 'Товар не найден', 404);
        }

        Response::noContent();
    }

    public function uploadImage(Request $request, string $id): void
    {
        Auth::requireRole($request, 'admin');

        if (!ctype_digit($id) || ProductModel::findById((int) $id) === null) {
            Response::error('product_not_found', 'Товар не найден', 404);
        }
        $productId = (int) $id;

        $file = $request->file('image');
        if ($file === null || ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            Response::error('validation_error', 'Файл не передан или повреждён', 400);
        }

        if ((int) $file['size'] > self::MAX_IMAGE_BYTES) {
            Response::error('validation_error', 'Файл больше 5 МБ', 400);
        }

        $detectedMime = mime_content_type($file['tmp_name']) ?: '';
        if (!isset(self::ALLOWED_IMAGE_MIME[$detectedMime])) {
            Response::error('validation_error', 'Разрешены только JPEG, PNG, WebP', 400);
        }

        $extension = self::ALLOWED_IMAGE_MIME[$detectedMime];
        // Filename is derived (product id + random suffix), never taken from
        // the client — the original name is attacker-controlled and could
        // contain path-traversal segments.
        $filename = $productId . '-' . bin2hex(random_bytes(8)) . '.' . $extension;
        $targetDir = __DIR__ . '/../../../public/uploads/covers';
        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0777, true);
        }

        if (!move_uploaded_file($file['tmp_name'], $targetDir . '/' . $filename)) {
            Response::error('internal_error', 'Не удалось сохранить файл', 500);
        }

        ProductModel::setCoverUrl($productId, '/uploads/covers/' . $filename);

        Response::json(ProductModel::toDetailedPublic(ProductModel::findById($productId)));
    }

    private static function parseNullableInt(mixed $value): ?int
    {
        return $value === null || $value === '' ? null : (int) $value;
    }
}
