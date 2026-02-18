<?php

namespace App\Controller;

use App\Entity\Message;
use App\Entity\Project;
use App\Service\AuthService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\String\Slugger\SluggerInterface;

class ApiController extends AbstractController
{
    #[Route('/api/projects', name: 'api_projects', methods: ['GET'])]
    public function getProjects(EntityManagerInterface $em): JsonResponse
    {
        $projects = $em->getRepository(Project::class)->findAll();

        $data = array_map(function (Project $project) {
            return [
                'id' => $project->getId(),
                'title' => $project->getTitle(),
                'description' => $project->getDescription(),
                'technology_tags' => $project->getTechnologyTags(),
                'images' => $project->getImages(),
                'image_url' => $project->getImageUrl(), // Backward compatibility
                'github_link' => $project->getGithubLink(),
                'live_url' => $project->getLiveUrl(),
                'year' => $project->getYear(),
            ];
        }, $projects);

        return $this->json($data);
    }

    #[Route('/api/projects/{id}', name: 'api_project_detail', methods: ['GET'])]
    public function getProject(int $id, EntityManagerInterface $em): JsonResponse
    {
        $project = $em->getRepository(Project::class)->find($id);

        if (!$project) {
            return $this->json(['error' => 'Project not found'], 404);
        }

        $data = [
            'id' => $project->getId(),
            'title' => $project->getTitle(),
            'description' => $project->getDescription(),
            'technology_tags' => $project->getTechnologyTags(),
            'images' => $project->getImages(),
            'image_url' => $project->getImageUrl(), // Backward compatibility
            'github_link' => $project->getGithubLink(),
            'live_url' => $project->getLiveUrl(),
            'year' => $project->getYear(),
        ];

        return $this->json($data);
    }

    #[Route('/api/projects/seed', name: 'api_projects_seed', methods: ['GET'])]
    public function seedProjects(EntityManagerInterface $em): JsonResponse
    {
        // Vérifier si des projets existent déjà
        $existingProjects = $em->getRepository(Project::class)->findAll();
        if (count($existingProjects) > 0) {
            return $this->json(['message' => 'Projects already seeded'], 400);
        }

        // Données de test
        $projectsData = [
            [
                'title' => 'E-Commerce Platform',
                'description' => 'Plateforme e-commerce complète avec gestion de panier, paiement et administration. Interface moderne et responsive avec système de recommandations basé sur l\'IA.',
                'technology_tags' => ['React', 'Node.js', 'MongoDB', 'Stripe API', 'Tailwind CSS'],
                'images' => [
                    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200',
                    'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200',
                    'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200'
                ],
                'github_link' => 'https://github.com/example/ecommerce-platform',
                'live_url' => 'https://demo-ecommerce.example.com',
                'year' => 2024
            ],
            [
                'title' => 'Dashboard Analytics',
                'description' => 'Tableau de bord analytique en temps réel avec visualisations interactives. Suivi des métriques clés, rapports personnalisables et export de données.',
                'technology_tags' => ['Vue.js', 'Python', 'PostgreSQL', 'Chart.js', 'D3.js'],
                'images' => [
                    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200',
                    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200'
                ],
                'github_link' => 'https://github.com/example/analytics-dashboard',
                'live_url' => null,
                'year' => 2024
            ],
            [
                'title' => 'API REST Microservices',
                'description' => 'Architecture microservices scalable avec API REST, authentification JWT, gestion de cache Redis et déploiement Docker. Documentation Swagger complète.',
                'technology_tags' => ['Symfony', 'Docker', 'Redis', 'JWT', 'Swagger'],
                'images' => [
                    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200',
                    'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200',
                    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200'
                ],
                'github_link' => 'https://github.com/example/microservices-api',
                'live_url' => null,
                'year' => 2023
            ],
            [
                'title' => 'Application Mobile React Native',
                'description' => 'Application mobile cross-platform avec notifications push, géolocalisation et synchronisation offline. Design moderne avec animations fluides.',
                'technology_tags' => ['React Native', 'Firebase', 'Redux', 'Expo', 'TypeScript'],
                'images' => [
                    'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200',
                    'https://images.unsplash.com/photo-1522125670776-3c7abb882bc2?w=1200'
                ],
                'github_link' => 'https://github.com/example/react-native-app',
                'live_url' => 'https://apps.apple.com/example',
                'year' => 2023
            ],
            [
                'title' => 'Système de Gestion de Contenu',
                'description' => 'CMS headless avec interface d\'administration intuitive. Support multi-utilisateurs, gestion des médias et API GraphQL pour le frontend.',
                'technology_tags' => ['Next.js', 'Strapi', 'GraphQL', 'AWS S3', 'TypeScript'],
                'images' => [
                    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200',
                    'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=1200',
                    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200'
                ],
                'github_link' => 'https://github.com/example/cms-platform',
                'live_url' => null,
                'year' => 2022
            ],
        ];

        foreach ($projectsData as $projectData) {
            $project = new Project();
            $project->setTitle($projectData['title']);
            $project->setDescription($projectData['description']);
            $project->setTechnologyTags($projectData['technology_tags']);
            $project->setImages($projectData['images']);
            $project->setGithubLink($projectData['github_link']);
            $project->setLiveUrl($projectData['live_url'] ?? null);
            $project->setYear($projectData['year']);

            $em->persist($project);
        }

        $em->flush();

        return $this->json([
            'message' => 'Projects seeded successfully',
            'count' => count($projectsData)
        ]);
    }

    #[Route('/api/admin/projects', name: 'api_admin_projects_create', methods: ['POST'])]
    public function createProject(Request $request, EntityManagerInterface $em): JsonResponse
    {
        // Vérifier l'authentification
        $token = $request->headers->get('Authorization');
        if ($token) {
            $token = str_replace('Bearer ', '', $token);
        }
        
        $user = AuthService::verifyToken($token);
        if (!$user) {
            return $this->json(['error' => 'Unauthorized'], 401);
        }

        $data = json_decode($request->getContent(), true);

        $project = new Project();
        $project->setTitle($data['title'] ?? '');
        $project->setDescription($data['description'] ?? '');
        $project->setTechnologyTags($data['technology_tags'] ?? []);
        // Support both 'images' array and legacy 'image_url' string
        if (isset($data['images']) && is_array($data['images'])) {
            $project->setImages($data['images']);
        } elseif (isset($data['image_url'])) {
            $project->setImageUrl($data['image_url']);
        }
        $project->setGithubLink($data['github_link'] ?? '');
        $project->setLiveUrl($data['live_url'] ?? null);
        $project->setYear($data['year'] ?? null);

        $em->persist($project);
        $em->flush();

        return $this->json([
            'id' => $project->getId(),
            'title' => $project->getTitle(),
            'description' => $project->getDescription(),
            'technology_tags' => $project->getTechnologyTags(),
            'images' => $project->getImages(),
            'image_url' => $project->getImageUrl(),
            'github_link' => $project->getGithubLink(),
            'live_url' => $project->getLiveUrl(),
            'year' => $project->getYear(),
        ], 201);
    }

    #[Route('/api/admin/projects/{id}', name: 'api_admin_projects_update', methods: ['PUT'])]
    public function updateProject(int $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        // Vérifier l'authentification
        $token = $request->headers->get('Authorization');
        if ($token) {
            $token = str_replace('Bearer ', '', $token);
        }
        
        $user = AuthService::verifyToken($token);
        if (!$user) {
            return $this->json(['error' => 'Unauthorized'], 401);
        }

        $project = $em->getRepository(Project::class)->find($id);
        if (!$project) {
            return $this->json(['error' => 'Project not found'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['title'])) {
            $project->setTitle($data['title']);
        }
        if (isset($data['description'])) {
            $project->setDescription($data['description']);
        }
        if (isset($data['technology_tags'])) {
            $project->setTechnologyTags($data['technology_tags']);
        }
        // Support both 'images' array and legacy 'image_url' string
        if (isset($data['images']) && is_array($data['images'])) {
            $project->setImages($data['images']);
        } elseif (isset($data['image_url'])) {
            $project->setImageUrl($data['image_url']);
        }
        if (isset($data['github_link'])) {
            $project->setGithubLink($data['github_link']);
        }
        if (array_key_exists('live_url', $data)) {
            $project->setLiveUrl($data['live_url']);
        }
        if (isset($data['year'])) {
            $project->setYear($data['year']);
        }

        $em->flush();

        return $this->json([
            'id' => $project->getId(),
            'title' => $project->getTitle(),
            'description' => $project->getDescription(),
            'technology_tags' => $project->getTechnologyTags(),
            'images' => $project->getImages(),
            'image_url' => $project->getImageUrl(),
            'github_link' => $project->getGithubLink(),
            'live_url' => $project->getLiveUrl(),
            'year' => $project->getYear(),
        ]);
    }

    #[Route('/api/admin/projects/{id}', name: 'api_admin_projects_delete', methods: ['DELETE'])]
    public function deleteProject(int $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        // Vérifier l'authentification
        $token = $request->headers->get('Authorization');
        if ($token) {
            $token = str_replace('Bearer ', '', $token);
        }
        
        $user = AuthService::verifyToken($token);
        if (!$user) {
            return $this->json(['error' => 'Unauthorized'], 401);
        }

        $project = $em->getRepository(Project::class)->find($id);
        if (!$project) {
            return $this->json(['error' => 'Project not found'], 404);
        }

        $em->remove($project);
        $em->flush();

        return $this->json(['message' => 'Project deleted successfully']);
    }

    #[Route('/api/messages', name: 'api_messages_create', methods: ['POST'])]
    public function createMessage(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        // Validation
        if (!isset($data['message']) || empty(trim($data['message']))) {
            return $this->json(['error' => 'Message is required'], 400);
        }

        $message = new Message();
        $message->setFromEmail($data['fromEmail'] ?? null);
        $message->setMessage(trim($data['message']));

        $em->persist($message);
        $em->flush();

        return $this->json([
            'success' => true,
            'message' => 'Message sent successfully'
        ], 201);
    }

    #[Route('/api/admin/messages', name: 'api_admin_messages', methods: ['GET'])]
    public function getMessages(Request $request, EntityManagerInterface $em): JsonResponse
    {
        // Vérifier l'authentification
        $token = $request->headers->get('Authorization');
        if ($token) {
            $token = str_replace('Bearer ', '', $token);
        }

        $user = AuthService::verifyToken($token);
        if (!$user) {
            return $this->json(['error' => 'Unauthorized'], 401);
        }

        $messages = $em->getRepository(Message::class)->findBy([], ['createdAt' => 'DESC']);

        $data = array_map(function (Message $message) {
            return [
                'id' => $message->getId(),
                'fromEmail' => $message->getFromEmail(),
                'message' => $message->getMessage(),
                'createdAt' => $message->getCreatedAt()->format('Y-m-d H:i:s'),
                'isRead' => $message->isRead(),
            ];
        }, $messages);

        return $this->json($data);
    }

    #[Route('/api/admin/messages/{id}/read', name: 'api_admin_messages_mark_read', methods: ['PATCH'])]
    public function markMessageAsRead(int $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        // Vérifier l'authentification
        $token = $request->headers->get('Authorization');
        if ($token) {
            $token = str_replace('Bearer ', '', $token);
        }

        $user = AuthService::verifyToken($token);
        if (!$user) {
            return $this->json(['error' => 'Unauthorized'], 401);
        }

        $message = $em->getRepository(Message::class)->find($id);
        if (!$message) {
            return $this->json(['error' => 'Message not found'], 404);
        }

        $message->setIsRead(true);
        $em->flush();

        return $this->json(['success' => true]);
    }

    #[Route('/api/admin/messages/{id}', name: 'api_admin_messages_delete', methods: ['DELETE'])]
    public function deleteMessage(int $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        // Vérifier l'authentification
        $token = $request->headers->get('Authorization');
        if ($token) {
            $token = str_replace('Bearer ', '', $token);
        }

        $user = AuthService::verifyToken($token);
        if (!$user) {
            return $this->json(['error' => 'Unauthorized'], 401);
        }

        $message = $em->getRepository(Message::class)->find($id);
        if (!$message) {
            return $this->json(['error' => 'Message not found'], 404);
        }

        $em->remove($message);
        $em->flush();

        return $this->json(['message' => 'Message deleted successfully']);
    }

    #[Route('/api/admin/upload', name: 'api_admin_upload', methods: ['POST'])]
    public function uploadImage(Request $request, SluggerInterface $slugger): JsonResponse
    {
        // Vérifier l'authentification
        $token = $request->headers->get('Authorization');
        if ($token) {
            $token = str_replace('Bearer ', '', $token);
        }

        $user = AuthService::verifyToken($token);
        if (!$user) {
            return $this->json(['error' => 'Unauthorized'], 401);
        }

        $file = $request->files->get('image');
        if (!$file) {
            return $this->json(['error' => 'No file uploaded'], 400);
        }

        // Vérifier le type de fichier
        $allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!in_array($file->getMimeType(), $allowedMimeTypes)) {
            return $this->json(['error' => 'Invalid file type. Allowed: JPG, PNG, GIF, WebP'], 400);
        }

        // Vérifier la taille (max 5MB)
        if ($file->getSize() > 5 * 1024 * 1024) {
            return $this->json(['error' => 'File too large. Max 5MB'], 400);
        }

        // Générer un nom de fichier unique
        $originalFilename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $safeFilename = $slugger->slug($originalFilename);
        $newFilename = $safeFilename . '-' . uniqid() . '.' . $file->guessExtension();

        // Créer le dossier uploads s'il n'existe pas
        $uploadDir = $this->getParameter('kernel.project_dir') . '/public/uploads';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        try {
            $file->move($uploadDir, $newFilename);
        } catch (FileException $e) {
            return $this->json(['error' => 'Failed to upload file'], 500);
        }

        // Retourner l'URL de l'image
        $imageUrl = '/uploads/' . $newFilename;

        return $this->json([
            'success' => true,
            'url' => $imageUrl,
            'filename' => $newFilename
        ]);
    }
}
