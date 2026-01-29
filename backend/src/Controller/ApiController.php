<?php

namespace App\Controller;

use App\Entity\Project;
use App\Service\AuthService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

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
                'image_url' => $project->getImageUrl(),
                'github_link' => $project->getGithubLink(),
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
            'image_url' => $project->getImageUrl(),
            'github_link' => $project->getGithubLink(),
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
                'image_url' => 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
                'github_link' => 'https://github.com/example/ecommerce-platform'
            ],
            [
                'title' => 'Dashboard Analytics',
                'description' => 'Tableau de bord analytique en temps réel avec visualisations interactives. Suivi des métriques clés, rapports personnalisables et export de données.',
                'technology_tags' => ['Vue.js', 'Python', 'PostgreSQL', 'Chart.js', 'D3.js'],
                'image_url' => 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
                'github_link' => 'https://github.com/example/analytics-dashboard'
            ],
            [
                'title' => 'API REST Microservices',
                'description' => 'Architecture microservices scalable avec API REST, authentification JWT, gestion de cache Redis et déploiement Docker. Documentation Swagger complète.',
                'technology_tags' => ['Symfony', 'Docker', 'Redis', 'JWT', 'Swagger'],
                'image_url' => 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
                'github_link' => 'https://github.com/example/microservices-api'
            ],
            [
                'title' => 'Application Mobile React Native',
                'description' => 'Application mobile cross-platform avec notifications push, géolocalisation et synchronisation offline. Design moderne avec animations fluides.',
                'technology_tags' => ['React Native', 'Firebase', 'Redux', 'Expo', 'TypeScript'],
                'image_url' => 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
                'github_link' => 'https://github.com/example/react-native-app'
            ],
            [
                'title' => 'Système de Gestion de Contenu',
                'description' => 'CMS headless avec interface d\'administration intuitive. Support multi-utilisateurs, gestion des médias et API GraphQL pour le frontend.',
                'technology_tags' => ['Next.js', 'Strapi', 'GraphQL', 'AWS S3', 'TypeScript'],
                'image_url' => 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
                'github_link' => 'https://github.com/example/cms-platform'
            ],
        ];

        foreach ($projectsData as $projectData) {
            $project = new Project();
            $project->setTitle($projectData['title']);
            $project->setDescription($projectData['description']);
            $project->setTechnologyTags($projectData['technology_tags']);
            $project->setImageUrl($projectData['image_url']);
            $project->setGithubLink($projectData['github_link']);
            
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
        $project->setImageUrl($data['image_url'] ?? '');
        $project->setGithubLink($data['github_link'] ?? '');

        $em->persist($project);
        $em->flush();

        return $this->json([
            'id' => $project->getId(),
            'title' => $project->getTitle(),
            'description' => $project->getDescription(),
            'technology_tags' => $project->getTechnologyTags(),
            'image_url' => $project->getImageUrl(),
            'github_link' => $project->getGithubLink(),
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
        if (isset($data['image_url'])) {
            $project->setImageUrl($data['image_url']);
        }
        if (isset($data['github_link'])) {
            $project->setGithubLink($data['github_link']);
        }

        $em->flush();

        return $this->json([
            'id' => $project->getId(),
            'title' => $project->getTitle(),
            'description' => $project->getDescription(),
            'technology_tags' => $project->getTechnologyTags(),
            'image_url' => $project->getImageUrl(),
            'github_link' => $project->getGithubLink(),
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
}
