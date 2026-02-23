<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class AuthController extends AbstractController
{
    #[Route('/api/login', name: 'api_login', methods: ['POST'])]
    public function login(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $username = $data['username'] ?? null;
        $password = $data['password'] ?? null;

        if (!$username || !$password) {
            return $this->json(['error' => 'Username and password required'], 400);
        }

        $user = $em->getRepository(User::class)->findOneBy(['username' => $username]);

        if (!$user || !$user->verifyPassword($password)) {
            return $this->json(['error' => 'Invalid credentials'], 401);
        }

        return $this->json([
            'token' => $this->generateToken($user),
            'user' => [
                'id' => $user->getId(),
                'username' => $user->getUsername()
            ]
        ]);
    }

    /**
     * Route de setup uniquement : ne fonctionne que si aucun utilisateur n'existe.
     * À utiliser une seule fois après le déploiement pour créer le compte admin.
     */
    #[Route('/api/admin/setup', name: 'api_admin_setup', methods: ['POST'])]
    public function setup(Request $request, EntityManagerInterface $em): JsonResponse
    {
        // Bloqué dès qu'un utilisateur existe
        if (count($em->getRepository(User::class)->findAll()) > 0) {
            return $this->json(['error' => 'Setup already completed'], 403);
        }

        $data = json_decode($request->getContent(), true);
        $username = $data['username'] ?? null;
        $password = $data['password'] ?? null;

        if (!$username || !$password) {
            return $this->json(['error' => 'Username and password required'], 400);
        }

        if (strlen($password) < 12) {
            return $this->json(['error' => 'Password must be at least 12 characters'], 400);
        }

        $user = new User();
        $user->setUsername($username);
        $user->setPassword($password);

        $em->persist($user);
        $em->flush();

        return $this->json(['message' => 'Admin user created successfully'], 201);
    }

    private function generateToken(User $user): string
    {
        $payload = base64_encode(json_encode([
            'id' => $user->getId(),
            'username' => $user->getUsername(),
            'exp' => time() + (7 * 24 * 60 * 60)
        ]));

        $secret = $_ENV['APP_SECRET'] ?? getenv('APP_SECRET') ?? '';
        $signature = hash_hmac('sha256', $payload, $secret);

        return $payload . '.' . $signature;
    }
}
