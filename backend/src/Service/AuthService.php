<?php

namespace App\Service;

class AuthService
{
    public static function verifyToken(?string $token): ?array
    {
        if (!$token) {
            return null;
        }

        // Token format: base64payload.hmac_sha256_signature
        $parts = explode('.', $token, 2);
        if (count($parts) !== 2) {
            return null;
        }

        [$payload, $signature] = $parts;

        // Vérifier la signature HMAC avant de décoder le payload
        $secret = $_ENV['APP_SECRET'] ?? getenv('APP_SECRET') ?? '';
        $expected = hash_hmac('sha256', $payload, $secret);

        if (!hash_equals($expected, $signature)) {
            return null;
        }

        try {
            $decoded = json_decode(base64_decode($payload), true);

            if (!$decoded || !isset($decoded['exp'])) {
                return null;
            }

            if ($decoded['exp'] < time()) {
                return null;
            }

            return $decoded;
        } catch (\Exception $e) {
            return null;
        }
    }
}
