<?php

namespace App\Entity;

use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'setting')]
class Setting
{
    #[ORM\Id]
    #[ORM\Column(type: Types::STRING, length: 100)]
    private ?string $name = null;

    #[ORM\Column(type: Types::STRING, length: 500)]
    private string $value = '';

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;
        return $this;
    }

    public function getValue(): string
    {
        return $this->value;
    }

    public function setValue(string $value): self
    {
        $this->value = $value;
        return $this;
    }
}
