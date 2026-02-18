<?php

namespace App\Entity;

use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'project')]
class Project
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: Types::INTEGER)]
    private ?int $id = null;

    #[ORM\Column(type: Types::STRING, length: 255)]
    private ?string $title = null;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $description = null;

    #[ORM\Column(type: Types::JSON)]
    private array $technologyTags = [];

    #[ORM\Column(type: Types::JSON)]
    private array $images = [];

    #[ORM\Column(type: Types::STRING, length: 500, nullable: true)]
    private ?string $githubLink = null;

    #[ORM\Column(type: Types::INTEGER, nullable: true)]
    private ?int $year = null;

    #[ORM\Column(type: Types::STRING, length: 500, nullable: true)]
    private ?string $liveUrl = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): self
    {
        $this->title = $title;
        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(string $description): self
    {
        $this->description = $description;
        return $this;
    }

    public function getTechnologyTags(): array
    {
        return $this->technologyTags;
    }

    public function setTechnologyTags(array $technologyTags): self
    {
        $this->technologyTags = $technologyTags;
        return $this;
    }

    public function getImages(): array
    {
        return $this->images;
    }

    public function setImages(array $images): self
    {
        $this->images = $images;
        return $this;
    }

    // Backward compatibility - returns first image
    public function getImageUrl(): ?string
    {
        return $this->images[0] ?? null;
    }

    // Backward compatibility - sets single image as array
    public function setImageUrl(?string $imageUrl): self
    {
        if ($imageUrl) {
            $this->images = [$imageUrl];
        }
        return $this;
    }

    public function getGithubLink(): ?string
    {
        return $this->githubLink;
    }

    public function setGithubLink(?string $githubLink): self
    {
        $this->githubLink = $githubLink;
        return $this;
    }

    public function getYear(): ?int
    {
        return $this->year;
    }

    public function setYear(?int $year): self
    {
        $this->year = $year;
        return $this;
    }

    public function getLiveUrl(): ?string
    {
        return $this->liveUrl;
    }

    public function setLiveUrl(?string $liveUrl): self
    {
        $this->liveUrl = $liveUrl;
        return $this;
    }
}
