<?php

declare(strict_types=1);

namespace App\Controllers\Admin;

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
        Auth::requireRole($request, 'admin');

        $status = $request->query('status');
        $filter = is_string($status) && in_array($status, OrderModel::VALID_STATUSES, true) ? $status : null;

        Response::json(OrderModel::allForAdmin($filter));
    }

    public function updateStatus(Request $request, string $id): void
    {
        Auth::requireRole($request, 'admin');

        $data = $request->all();
        $errors = Validator::validate($data, [
            'status' => ['required', 'in:' . implode(',', OrderModel::VALID_STATUSES)],
        ]);
        if ($errors !== []) {
            Response::error('validation_error', 'Проверьте введённые данные', 400);
        }

        if (!ctype_digit($id)) {
            Response::error('order_not_found', 'Заказ не найден', 404);
        }

        try {
            $updated = OrderModel::updateStatus((int) $id, (string) $data['status']);
        } catch (CheckoutException $e) {
            Response::error($e->errorCode, $e->getMessage(), 409);
        }

        if (!$updated) {
            Response::error('order_not_found', 'Заказ не найден', 404);
        }

        Response::json(OrderModel::findForAdmin((int) $id));
    }
}
