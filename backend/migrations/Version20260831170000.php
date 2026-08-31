<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Ordre d'affichage manuel des projets.
 */
final class Version20260831170000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Ajout de la colonne position sur project';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE project ADD position INT DEFAULT 0 NOT NULL');
        // Ordre initial : on conserve l'ordre existant (par identifiant)
        $this->addSql('UPDATE project SET position = id');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE project DROP position');
    }
}
