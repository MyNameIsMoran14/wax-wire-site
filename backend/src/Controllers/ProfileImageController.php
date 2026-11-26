<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Request;
use App\Core\Response;
use App\Models\UserModel;

class ProfileImageController
{
    private const MAX_BYTES = 5 * 1024 * 1024;
    private const IMAGE_TYPES = [IMAGETYPE_JPEG => 'jpg', IMAGETYPE_PNG => 'png', IMAGETYPE_WEBP => 'webp'];
    private const DIRECTORY = __DIR__ . '/../../public/uploads/profiles';

    public function upload(Request $request, string $kind): void
    {
        $user = Auth::requireAuth($request);
        $this->validateKind($kind);
        $file = $request->file('image');
        if ($file === null) {
            Response::error('validation_error', 'Выберите изображение JPEG, PNG или WebP до 5 МБ', 400);
        }
        if (!isset($file['error']) || !is_int($file['error'])) {
            Response::error('validation_error', 'Некорректный файл', 400);
        }
        if (in_array($file['error'], [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true)) {
            Response::error('validation_error', 'Файл больше допустимого размера. Выберите изображение до 5 МБ', 400);
        }
        if ($file['error'] !== UPLOAD_ERR_OK || !is_uploaded_file($file['tmp_name'])) {
            Response::error('validation_error', 'Не удалось загрузить файл. Попробуйте ещё раз', 400);
        }
        $size = filesize($file['tmp_name']);
        if ($size === false || $size === 0 || $size > self::MAX_BYTES) {
            Response::error('validation_error', 'Изображение должно быть от 1 байта до 5 МБ', 400);
        }
        $image = @getimagesize($file['tmp_name']);
        if ($image === false || !isset(self::IMAGE_TYPES[$image[2]])) {
            Response::error('validation_error', 'Разрешены только изображения JPEG, PNG и WebP', 400);
        }
        if ($image[0] * $image[1] > 40000000) {
            Response::error('validation_error', 'Слишком большое разрешение изображения', 400);
        }

        if (!is_dir(self::DIRECTORY) && !@mkdir(self::DIRECTORY, 0755, true) && !is_dir(self::DIRECTORY)) {
            Response::error('internal_error', 'Не удалось создать папку для изображений', 500);
        }
        $url = '/uploads/profiles/' . $user['id'] . '-' . $kind . '-'
            . bin2hex(random_bytes(16)) . '.' . self::IMAGE_TYPES[$image[2]];
        $path = self::DIRECTORY . '/' . basename($url);
        if (!move_uploaded_file($file['tmp_name'], $path)) {
            Response::error('internal_error', 'Не удалось сохранить изображение', 500);
        }
        try {
            $oldUrl = UserModel::replaceProfileImage((int) $user['id'], $kind, $url);
        } catch (\Throwable $error) {
            @unlink($path);
            error_log((string) $error);
            Response::error('internal_error', 'Не удалось сохранить изображение. Попробуйте ещё раз', 500);
        }
        $this->deleteFile($oldUrl);
        Response::json(['user' => UserModel::toPublic(UserModel::findById((int) $user['id']))]);
    }

    public function remove(Request $request, string $kind): void
    {
        $user = Auth::requireAuth($request);
        $this->validateKind($kind);
        $oldUrl = UserModel::replaceProfileImage((int) $user['id'], $kind, null);
        $this->deleteFile($oldUrl);
        Response::json(['user' => UserModel::toPublic(UserModel::findById((int) $user['id']))]);
    }

    private function validateKind(string $kind): void
    {
        if (!in_array($kind, ['avatar', 'banner'], true)) {
            Response::error('not_found', 'Тип изображения не найден', 404);
        }
    }

    private function deleteFile(?string $url): void
    {
        if ($url !== null && preg_match('#^/uploads/profiles/[0-9]+-(avatar|banner)-[a-f0-9]{32}\.(jpg|png|webp)$#', $url)) {
            $path = self::DIRECTORY . '/' . basename($url);
            if (is_file($path) && !@unlink($path)) {
                error_log('Unable to remove replaced profile image: ' . basename($url));
            }
        }
    }
}
