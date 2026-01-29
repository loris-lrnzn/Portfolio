<?php

namespace App\Service;

class AuthService
{
    public static function verifyToken(?string $token): ?array
    {
        if (!$token) {
            return null;
        }

        try {
            $decoded = json_decode(base64_decode($token), true);
            
            if (!$decoded || !isset($decoded['exp'])) {
                return null;
            }

            // Vérifier l'expiration
            if ($decoded['exp'] < time()) {
                return null;
            }

            return $decoded;
        } catch (\Exception $e) {
            return null;
        }
    }
}
