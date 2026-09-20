<?php

declare(strict_types=1);

namespace App\Core;

class Validator
{
    /**
     * @param array<string, list<string>> $rules Поле => список правил ('required', 'email', 'min:8')
     * @return array<string, string> Ошибки по полям (пусто, если всё ок)
     */
    public static function validate(array $data, array $rules): array
    {
        $errors = [];

        foreach ($rules as $field => $fieldRules) {
            $value = $data[$field] ?? null;

            foreach ($fieldRules as $rule) {
                if ($rule === 'required' && ($value === null || $value === '')) {
                    $errors[$field] = 'Поле обязательно';
                    break;
                }

                if ($rule === 'email' && $value !== null && $value !== '' && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    $errors[$field] = 'Некорректный email';
                    break;
                }

                if (str_starts_with($rule, 'min:')) {
                    $min = (int) substr($rule, 4);
                    if ($value !== null && mb_strlen((string) $value) < $min) {
                        $errors[$field] = "Минимум $min символов";
                        break;
                    }
                }
            }
        }

        return $errors;
    }
}
