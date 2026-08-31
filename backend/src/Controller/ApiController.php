<?php

namespace App\Controller;

use App\Entity\ChatLog;
use App\Entity\Message;
use App\Entity\Project;
use App\Entity\Setting;
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
    #[Route('/api/settings', name: 'api_settings', methods: ['GET'])]
    public function getSettings(EntityManagerInterface $em): JsonResponse
    {
        $setting = $em->getRepository(Setting::class)->find('chatbot_enabled');

        return $this->json([
            'chatbot_enabled' => $setting === null ? true : $setting->getValue() === '1',
        ]);
    }

    #[Route('/api/admin/settings', name: 'api_admin_settings_update', methods: ['PUT'])]
    public function updateSettings(Request $request, EntityManagerInterface $em): JsonResponse
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
        if (!array_key_exists('chatbot_enabled', $data ?? [])) {
            return $this->json(['error' => 'chatbot_enabled required'], 400);
        }

        $setting = $em->getRepository(Setting::class)->find('chatbot_enabled');
        if (!$setting) {
            $setting = (new Setting())->setName('chatbot_enabled');
            $em->persist($setting);
        }

        $setting->setValue($data['chatbot_enabled'] ? '1' : '0');
        $em->flush();

        return $this->json(['chatbot_enabled' => $setting->getValue() === '1']);
    }

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

    #[Route('/api/chat-logs', name: 'api_chat_logs_create', methods: ['POST'])]
    public function createChatLog(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $question = trim($data['question'] ?? '');
        $answer = trim($data['answer'] ?? '');

        if (!$question || !$answer) {
            return $this->json(['error' => 'Question and answer are required'], 400);
        }

        $chatLog = new ChatLog();
        $chatLog->setQuestion($question);
        $chatLog->setAnswer($answer);

        $em->persist($chatLog);
        $em->flush();

        return $this->json(['success' => true], 201);
    }

    #[Route('/api/admin/chat-logs', name: 'api_admin_chat_logs', methods: ['GET'])]
    public function getChatLogs(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $token = $request->headers->get('Authorization');
        if ($token) {
            $token = str_replace('Bearer ', '', $token);
        }

        $user = AuthService::verifyToken($token);
        if (!$user) {
            return $this->json(['error' => 'Unauthorized'], 401);
        }

        $chatLogs = $em->getRepository(ChatLog::class)->findBy([], ['createdAt' => 'DESC']);

        $data = array_map(function (ChatLog $log) {
            return [
                'id' => $log->getId(),
                'question' => $log->getQuestion(),
                'answer' => $log->getAnswer(),
                'createdAt' => $log->getCreatedAt()->format('Y-m-d H:i:s'),
            ];
        }, $chatLogs);

        return $this->json($data);
    }

    #[Route('/api/admin/chat-logs/{id}', name: 'api_admin_chat_logs_delete', methods: ['DELETE'])]
    public function deleteChatLog(int $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $token = $request->headers->get('Authorization');
        if ($token) {
            $token = str_replace('Bearer ', '', $token);
        }

        $user = AuthService::verifyToken($token);
        if (!$user) {
            return $this->json(['error' => 'Unauthorized'], 401);
        }

        $chatLog = $em->getRepository(ChatLog::class)->find($id);
        if (!$chatLog) {
            return $this->json(['error' => 'Chat log not found'], 404);
        }

        $em->remove($chatLog);
        $em->flush();

        return $this->json(['message' => 'Chat log deleted successfully']);
    }
}
