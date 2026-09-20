<?php

declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Core\Auth;
use App\Core\Request;
use App\Core\Response;
use App\Core\Validator;
use App\Models\GenreModel;

class GenreController
{
    public function index(Request $request): void
    {
        Auth::requireRole($request, 'admin');
        Response::json(array_map([GenreModel::class, 'toPublic'], GenreModel::all()));
    }

    public function store(Request $request): void
    {
        Auth::requireRole($request, 'admin');

        $data = $request->all();
        $errors = Validator::validate($data, ['name' => ['required']]);
        if ($errors !== []) {
            Response::error('validation_error', 'Проверьте введённые данные', 400);
        }

        $name = trim((string) $data['name']);
        if (GenreModel::nameExists($name)) {
            Response::error('validation_error', 'Жанр с таким названием уже существует', 400);
        }

        $id = GenreModel::create($name);
        Response::json(GenreModel::toPublic(GenreModel::findById($id)), 201);
    }

    public function update(Request $request, string $id): void
    {
        Auth::requireRole($request, 'admin');

        if (!ctype_digit($id) || GenreModel::findById((int) $id) === null) {
            Response::error('not_found', 'Жанр не найден', 404);
        }
        $genreId = (int) $id;

        $data = $request->all();
        $errors = Validator::validate($data, ['name' => ['required']]);
        if ($errors !== []) {
            Response::error('validation_error', 'Проверьте введённые данные', 400);
        }

        $name = trim((string) $data['name']);
        if (GenreModel::nameExists($name, $genreId)) {
            Response::error('validation_error', 'Жанр с таким названием уже существует', 400);
        }

        GenreModel::update($genreId, $name);
        Response::json(GenreModel::toPublic(GenreModel::findById($genreId)));
    }

    public function destroy(Request $request, string $id): void
    {
        Auth::requireRole($request, 'admin');

        if (!ctype_digit($id) || !GenreModel::delete((int) $id)) {
            Response::error('not_found', 'Жанр не найден', 404);
        }

        Response::noContent();
    }
}
