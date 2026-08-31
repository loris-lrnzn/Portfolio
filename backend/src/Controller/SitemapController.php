<?php

namespace App\Controller;

use App\Entity\Project;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class SitemapController extends AbstractController
{
    private const BASE_URL = 'https://lorislorenzini.fr';

    #[Route('/sitemap.xml', name: 'sitemap', methods: ['GET'])]
    public function sitemap(EntityManagerInterface $em): Response
    {
        $urls = [
            ['loc' => self::BASE_URL . '/', 'priority' => '1.0', 'changefreq' => 'monthly'],
        ];

        $projects = $em->getRepository(Project::class)->findBy([], ['position' => 'ASC']);
        foreach ($projects as $project) {
            $urls[] = [
                'loc' => self::BASE_URL . '/project/' . $project->getId(),
                'priority' => '0.8',
                'changefreq' => 'monthly',
            ];
        }

        $xml = new \SimpleXMLElement('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>');
        foreach ($urls as $url) {
            $node = $xml->addChild('url');
            $node->addChild('loc', $url['loc']);
            $node->addChild('changefreq', $url['changefreq']);
            $node->addChild('priority', $url['priority']);
        }

        return new Response($xml->asXML(), 200, ['Content-Type' => 'application/xml; charset=UTF-8']);
    }
}
