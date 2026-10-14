<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Request;
use App\Core\Response;
use App\Core\Validator;
use App\Models\CheckoutException;
use App\Models\OrderModel;

class OrderController
{
    public function index(Request $request): void
    {
        $user = Auth::requireAuth($request);
        Response::json(OrderModel::forUser((int) $user['id']));
    }

    public function store(Request $request): void
    {
        $user = Auth::requireAuth($request);

        $data = $request->all();
        $errors = Validator::validate($data, [
            'address' => ['required'],
            'phone' => ['required'],
        ]);
        if ($errors !== []) {
            Response::error('validation_error', 'Проверьте введённые данные', 400);
        }

        $comment = isset($data['comment']) && $data['comment'] !== '' ? (string) $data['comment'] : null;

        try {
            $order = OrderModel::createFromCart((int) $user['id'], (string) $data['address'], (string) $data['phone'], $comment);
        } catch (CheckoutException $e) {
            Response::error($e->errorCode, $e->getMessage(), 409);
        }

        Response::json($order, 201);
    }

    public function show(Request $request, string $id): void
    {
        $user = Auth::requireAuth($request);

        if (!ctype_digit($id)) {
            Response::error('order_not_found', 'Заказ не найден', 404);
        }

        $order = OrderModel::findForUser((int) $id, (int) $user['id']);
        if ($order === null) {
            Response::error('order_not_found', 'Заказ не найден', 404);
        }

        Response::json($order);
    }
}
