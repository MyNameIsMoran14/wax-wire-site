<?php

declare(strict_types=1);

// Самодельный HS256 JWT: header.payload.signature, всё через base64url + hash_hmac.


function jwt_base64url_encode(string $data): string
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function jwt_base64url_decode(string $data): string
{
    $remainder = strlen($data) % 4;
    if ($remainder > 0) {
        $data .= str_repeat('=', 4 - $remainder);
    }
    return base64_decode(strtr($data, '-_', '+/'));
}

function jwt_encode(array $payload, string $secret): string
{
    $header = ['typ' => 'JWT', 'alg' => 'HS256'];

    $segments = [
        jwt_base64url_encode(json_encode($header)),
        jwt_base64url_encode(json_encode($payload)),
    ];

    $signature = hash_hmac('sha256', implode('.', $segments), $secret, true);
    $segments[] = jwt_base64url_encode($signature);

    return implode('.', $segments);
}

function jwt_decode(string $token, string $secret): ?array
{
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return null;
    }
    [$headerB64, $payloadB64, $signatureB64] = $parts;

    $expectedSignature = jwt_base64url_encode(
        hash_hmac('sha256', "$headerB64.$payloadB64", $secret, true),
    );

    if (!hash_equals($expectedSignature, $signatureB64)) {
        return null;
    }

    $payload = json_decode(jwt_base64url_decode($payloadB64), true);
    if (!is_array($payload)) {
        return null;
    }

    if (isset($payload['exp']) && $payload['exp'] < time()) {
        return null;
    }

    return $payload;
}
