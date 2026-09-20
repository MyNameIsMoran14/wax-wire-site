<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\GenreModel;

class GenreController
{
    public function index(Request $request): void
    {
        Response::json(array_map([GenreModel::class, 'toPublic'], GenreModel::all()));
    }
}
